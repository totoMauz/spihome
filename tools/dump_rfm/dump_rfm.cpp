/*
    Dump-RFM - Dumps the OOK-encoded on-air data
    Copyright (C) 2015	Simon Brennecke

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <pthread.h>

#include <cl3/core/io_collection_list.hpp>
#include <cl3/core/io_file.hpp>
#include <cl3/core/io_text_string.hpp>
#include <cl3/core/io_text_encoding.hpp>
#include <cl3/core/system_time.hpp>

#include <cl3/gpio/io_phy.hpp>
#include <cl3/gpio/io_phy_bcm2835.hpp>
#include <cl3/gpio/io_phy_radio.hpp>
#include <cl3/gpio/io_phy_radio_rfm.hpp>

using namespace cl3::system::types;
using namespace cl3::system::time;
using namespace cl3::io::stream;
using namespace cl3::io::file;
using namespace cl3::io::phy;
using namespace cl3::io::phy::gpio;
using namespace cl3::io::phy::bcm2835;
using namespace cl3::io::phy::radio;
using namespace cl3::io::phy::radio::rfm;
using namespace cl3::io::collection::list;
using namespace cl3::io::text::string;
using namespace cl3::io::text::encoding;

struct TConsoleDumper : IOut<bool>
{
	bool buffer[80];
	unsigned index;
	bool b_invert_data;
	bool b_was_idle;

	void	Flush	()
	{
		ssys_t s = -1;

		for(usys_t i = 0; i < index; i++)
			if(buffer[i])
			{
				s = i;
				break;
			}

		if(s != -1)
		{
			if(b_was_idle)
				putchar('\n');
			else
				s = 0;

			b_was_idle = false;
			printf("DATA[%2u]: ", index-s);
			for(usys_t i = s; i < index; i++)
			{
				if((i-s) > 0 && ((i-s) % 8) == 0)
					putchar(' ');
				putchar(buffer[i] ? '1' : '0');
			}
			putchar('\n');
		}
		else
		{
			b_was_idle = true;
			putchar('.');
		}

		index = 0;
	}

	usys_t	Write	(const bool* arr_items_write, usys_t n_items_write_max, usys_t) final override CL3_WARN_UNUSED_RESULT
	{
		buffer[index++] = arr_items_write[0] != b_invert_data;
		if(index == sizeof(buffer))
			Flush();
		return n_items_write_max;
	}

	TConsoleDumper(bool b_invert_data) : index(0),b_invert_data(b_invert_data),b_was_idle(false) {}
};

int main(int argc, char* argv[])
{
	try
	{
		/*
			args:
				shutdown-pin
				irq-pin
				rx-data-pin
				rx-clock-pin
		*/
		if(argc < 5)
		{
			fprintf(stderr, "ERROR: missing argument\nusage: %s <gpio#:shutdown> <gpio#:IRQ> <gpio#:rx-data> <gpio#:rx-clock>\n", argv[0]);
			return 1;
		}

		const long pin_shutdown = strtol(argv[1], NULL, 0);
		const long pin_irq      = strtol(argv[2], NULL, 0);
		const long pin_rxdata   = strtol(argv[3], NULL, 0);
		const long pin_rxclock  = strtol(argv[4], NULL, 0);
		if(pin_shutdown == 0 || pin_irq == 0 || pin_rxdata == 0 || pin_rxclock == 0)
		{
			fprintf(stderr, "ERROR: unable to parse arguments\nusage: %s <gpio#:shutdown> <gpio#:IRQ> <gpio#:rx-data> <gpio#:rx-clock>\n", argv[0]);
			return 2;
		}

		TGPIO gpio;
		TList<IPin*> pins;
		pins.Append(gpio.Pins()[8]);	//	chip-select 0
		pins.Append(gpio.Pins()[7]);	//	chip-select 1
		TSPIBus spibus(0, pins);

		gpio.Pins()[pin_shutdown]->Mode(MODE_OUTPUT);
		gpio.Pins()[pin_shutdown]->Pull(PULL_DISABLED);
		gpio.Pins()[pin_irq     ]->Mode(MODE_INPUT );
		gpio.Pins()[pin_irq     ]->Pull(PULL_DISABLED);
		gpio.Pins()[pin_rxdata  ]->Mode(MODE_INPUT );
		gpio.Pins()[pin_rxdata  ]->Pull(PULL_DISABLED);
		gpio.Pins()[pin_rxclock ]->Mode(MODE_INPUT );
		gpio.Pins()[pin_rxclock ]->Pull(PULL_DISABLED);

		TRFM rfm(spibus.Devices()[0], gpio.Pins()[pin_shutdown], gpio.Pins()[pin_irq]);

		rfm.Reset();

		TPartInfo part_info = rfm.Identify();

		fprintf(stderr, "INFO: radio chip info:\n\tCHIPREV: %hhx\n\tPART: Si%hx\n\tPBUILD: %hhu\n\tID: %hu\n\tCUSTOMER: %hhu\n\tROMID: %hhu\n", part_info.chiprev, part_info.part, part_info.pbuild, part_info.id, part_info.customer, part_info.romid);

		{
			fprintf(stderr, "INFO: patching radio ROM ... ");
			TFile file_patch("radio_patch.bin");
			TMapping map_patch(&file_patch);
			rfm.Patch(map_patch.ItemPtr(0), map_patch.Count());
			fprintf(stderr, "OK\n");
		}

		{
			fprintf(stderr, "INFO: uploading radio config ... ");
			TFile file_config("radio_config.bin");
			TMapping map_config(&file_config);
			rfm.Configure(map_config.ItemPtr(0), map_config.Count());
			fprintf(stderr, "OK\n");
		}

		TConsoleDumper dumper(true);
// 		TOOKDecoder ook_decoder(256);
// 		ook_decoder.Sink(&dumper);
// 		TGPIOPulseReader pulse_reader(gpio.Pins()[pin_rxdata], true, 0.002);	//	pass selected GPIO-PIN, inverted line idle, flush buffer after 2ms of silence
// 		pulse_reader.Sink(&ook_decoder);
		TGPIOBusReader bus_reader(gpio.Pins()[pin_rxdata], gpio.Pins()[pin_rxclock], gpio.Pins()[pin_irq], 0.002);
		bus_reader.Sink(&dumper);

		fprintf(stderr, "INFO: entering RX mode, decoded data follow:\n");
		rfm.StartRX();

		{
			sigset_t ss;
			sigfillset(&ss);
			pthread_sigmask(SIG_BLOCK, &ss, NULL);

			int sig = 0;

			while(sig != SIGINT && sig != SIGTERM)
				sigwait(&ss, &sig);
		}

		fprintf(stderr, "\nbye!\n");
		return 0;
	}
	catch(const cl3::error::TException& ex)
	{
		fprintf(stderr, "ERROR:\n\tmessage: %s\n\tfile: %s:%u\n\texpression: %s\n", ex.message, ex.codefile, ex.codeline, ex.expression);
		return 5;
	}

	return -1;
}
