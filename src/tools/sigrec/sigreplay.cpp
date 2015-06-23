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
#include <cl3/core/system_task.hpp>

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
			argv[1] = gpio pin_data#
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

		TPin* const pin_data = dynamic_cast<TPin*>(gpio.Pins()[idx_pin]);
		TPin* const pin_trigger = dynamic_cast<TPin*>(gpio.Pins()[17]);

		TFile file(argv[2]);
		TMapping mapping(&file);

		pin_data->Mode(MODE_OUTPUT);
		pin_data->Pull(PULL_DISABLED);
		pin_data->Level(false);

// 		pin_trigger->Mode(MODE_OUTPUT);
// 		pin_trigger->Pull(PULL_DISABLED);
// 		pin_trigger->Level(false);

		cl3::system::task::IThread::Sleep(0.1);	//	wait 100ms
		
		const TTime* const ep = (const TTime*)(mapping.ItemPtr(0) + mapping.Count());
		
		fprintf(stderr, "replaying... ");
		
		// set realtime prio
		{
			sched_param p;
			memset(&p, 0, sizeof(p));
			p.sched_priority = 1;
			CL3_NONCLASS_SYSERR(sched_setscheduler(0, SCHED_FIFO, &p));
			CL3_NONCLASS_SYSERR(mlockall(MCL_CURRENT|MCL_FUTURE));
		}

		const TTime* ts = ((const TTime*)mapping.ItemPtr(0));

// 		pin_trigger->Level(true);
		bool b_level = true;
		TTime ts_wake = TTime::Now(TIME_CLOCK_MONOTONIC);
		while(b_do_run && ts < ep)
		{
			pin_data->Level(b_level);
			ts_wake += *(ts++);
			while(TTime::Now(TIME_CLOCK_MONOTONIC) < ts_wake);
			b_level = !b_level;
		}
		pin_data->Level(false);
// 		pin_trigger->Level(false);

		fprintf(stderr, "done\nbye!\n");
		return 0;
	}
	catch(const cl3::error::TException& ex)
	{
		fprintf(stderr, "ERROR:\n\tmessage: %s\n\tfile: %s:%u\n\texpression: %s\n", ex.message, ex.codefile, ex.codeline, ex.expression);
		return 1;
	}

	return 2;
}
