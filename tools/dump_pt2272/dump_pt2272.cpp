/*
    Dump-OOK - Tool which dumps the decoded data-bits of an OOK encoded (but already demodulated) datastream, which it reads from a GPIO-PIN
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

#include <cl3/gpio/io_phy_bcm2835.hpp>
#include <cl3/gpio/io_phy_radio.hpp>

using namespace cl3::system::types;
using namespace cl3::system::time;
using namespace cl3::io::stream;
using namespace cl3::io::phy;
using namespace cl3::io::phy::radio;
using namespace cl3::io::phy::bcm2835;

static void pt2272_OnData(TSoftPT2272::TOnDataEvent&, TSoftPT2272& sender, TSoftPT2272::TOnDataData data, void*)
{
	printf("received data from pt2262:\n\ttarget address: 0x%03hx\n\tdata: [", data.address);
	for(usys_t i = 0; i < sender.DataBits(); i++)
		printf("%s%s", i == 0 ? "" : ", ", data.arr_data[i] ? "true" : "false");
	printf(" ]\n\n");
}

int main(int argc, char* argv[])
{
	try
	{
		/*
			argv[1] = gpio pin#
		*/

		if(argc < 2)
		{
			fprintf(stderr, "ERROR: missing argument\nusage: %s <GPIO-PIN#>\n", argv[0]);
			return 1;
		}

		errno = 0;
		const long idx_pin = strtol(argv[1], NULL, 0);
		if(errno != 0 || idx_pin < 0 || idx_pin > 53)
		{
			fprintf(stderr, "ERROR: invalid GPIO-PIN#\nusage: %s <GPIO-PIN#>\n", argv[0]);
			return 2;
		}

		TGPIO gpio;

		fprintf(stderr, "PT2272 event data follows (press <CTRL-C> to quit):\n\n");

		TSoftPT2272 pt2272(10,2);	//	10 address bits, 2 data bits, promiscuous mode (receive all traffic)
		pt2272.OnData().Register<void>(&pt2272_OnData, (void*)NULL);
		TOOKDecoder ook_decoder;
		ook_decoder.Sink(&pt2272);
		TGPIOPulseReader pulse_reader(gpio.Pins()[idx_pin], false, 0.005);	//	pass selected GPIO-PIN, normal line level, flush buffer after 5ms of silence
		pulse_reader.Sink(&ook_decoder);

		{
			sigset_t ss;
			sigfillset(&ss);
			pthread_sigmask(SIG_BLOCK, &ss, NULL);

			int sig;
			sigwait(&ss, &sig);
		}

		fprintf(stderr, "\nbye!\n");
		return 0;
	}
	catch(const cl3::error::TException& ex)
	{
		fprintf(stderr, "ERROR:\n\tmessage: %s\n\tfile: %s:%u\n\texpression: %s\n", ex.message, ex.codefile, ex.codeline, ex.expression);
		return 1;
	}

	return 2;
}
