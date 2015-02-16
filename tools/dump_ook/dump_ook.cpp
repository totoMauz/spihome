/*
    Dump-OOK - Tool which dumps the raw bits data of an OOK encoded datastream, which it reads from a GPIO-PIN
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

struct TConsoleDumper : IOut<bool>
{
	void	Flush	() final override
	{
		putchar('\n');
	}

	usys_t	Write	(const bool* arr_items_write, usys_t n_items_write_max, usys_t) final override CL3_WARN_UNUSED_RESULT
	{
		printf("DATA: ");
		for(usys_t i = 0; i < n_items_write_max; i++)
			putchar(arr_items_write[i] ? '1' : '0');
		putchar('\n');
		return n_items_write_max;
	}
};

int main(int argc, char* argv[])
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

	fprintf(stderr, "demodulated data follows (press <CTRL-C> to quit):\n\n");

	TConsoleDumper dumper;
	TOOKDemodulator ook_demod;
	ook_demod.Sink(&dumper);
	TGPIOPulseReader pulse_reader(gpio.Pins()[idx_pin], false, 0.005);	//	pass selected GPIO-PIN, normal line level, flush buffer after 5ms of silence
	pulse_reader.Sink(&ook_demod);

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
