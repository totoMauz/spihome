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
#include <sched.h>
#include <string.h>
#include <sys/mman.h>

#include <cl3/gpio/io_phy_bcm2835.hpp>
#include <cl3/gpio/io_phy_radio.hpp>
#include <cl3/core/io_file.hpp>
#include <cl3/core/system_time.hpp>

using namespace cl3::system::types;
using namespace cl3::system::time;
using namespace cl3::io::stream;
using namespace cl3::io::phy;
using namespace cl3::io::phy::gpio;
using namespace cl3::io::file;
using namespace cl3::system::time;
using namespace cl3::io::phy::radio;
using namespace cl3::io::phy::bcm2835;

static volatile bool b_do_run = true;

static void HandleSignal(int)
{
	b_do_run = false;
}

static void ShowUsage(const char* err, const char* exe)
{
	fprintf(stderr, "ERROR: %s\nusage: %s <GPIO-PIN#> <filename>\n", err, exe);
}

int main(int argc, char* argv[])
{
	try
	{
		/*
			argv[1] = gpio pin#
		*/

		if(argc < 3)
		{
			ShowUsage("missing argument", argv[0]);
			return 1;
		}

		errno = 0;
		const long idx_pin = strtol(argv[1], NULL, 0);
		if(errno != 0 || idx_pin < 0 || idx_pin > 53)
		{
			ShowUsage("invalid GPIO-PIN#", argv[0]);
			return 2;
		}
		
		signal(SIGTERM, &HandleSignal);
		signal(SIGINT, &HandleSignal);
		signal(SIGHUP, &HandleSignal);

		TGPIO gpio;

		auto pin = gpio.Pins()[idx_pin];
		TFile file(argv[2], FILE_ACCESS_READ|FILE_ACCESS_WRITE, FILE_CREATE_ALWAYS);
		file.Count(1024ULL*1024ULL*512ULL);
		TMapping mapping(&file);
		
		pin->Mode(MODE_INPUT);
		pin->Pull(PULL_DISABLED);
		
		fprintf(stderr, "recording... (press <CTRL-C> to quit):\n\n");
		
		// set realtime prio
		{
			sched_param p;
			memset(&p, 0, sizeof(p));
			p.sched_priority = 1;
			CL3_NONCLASS_SYSERR(sched_setscheduler(0, SCHED_FIFO, &p));
			CL3_NONCLASS_SYSERR(mlockall(MCL_CURRENT|MCL_FUTURE));
		}

		const bool b_invert = pin->Level();
		bool b_level_cur;
		bool b_level_old;
		
		TTime ts_last;
		TTime* ts = (TTime*)mapping.ItemPtr(0);
		
		while(b_do_run)
		{
			b_level_cur = pin->Level() != b_invert;
			if(b_level_cur)
			{
				ts_last = TTime::Now(TIME_CLOCK_MONOTONIC);
				b_level_old = b_level_cur;
				break;
			}
		}
		
		while(b_do_run)
		{
			b_level_cur = pin->Level() != b_invert;
			if(b_level_cur != b_level_old)
			{
				const TTime ts_now = TTime::Now(TIME_CLOCK_MONOTONIC);
				*(ts++) = ts_now - ts_last;
				ts_last = ts_now;
				b_level_old = b_level_cur;
			}
		}
		
		file.Count( (byte_t*)ts - mapping.ItemPtr(0) );

		fprintf(stderr, "\nbye! (inverted = %s, samples = %zu)\n", b_invert ? "yes" : "no", file.Count()/sizeof(TTime));
		return 0;
	}
	catch(const cl3::error::TException& ex)
	{
		fprintf(stderr, "ERROR:\n\tmessage: %s\n\tfile: %s:%u\n\texpression: %s\n", ex.message, ex.codefile, ex.codeline, ex.expression);
		return 1;
	}

	return 2;
}
