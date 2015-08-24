#include <unistd.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <poll.h>
#include <stdio.h>
#include <assert.h>
#include <cl3/core/system_time.hpp>

#define SYSERR(expr) do { if( (long)(expr) == -1L ) { throw #expr; } } while(false)

using namespace cl3::system::time;

int main()
{
	try
	{
		assert(system("echo 4 > /sys/class/gpio/export; echo 17 > /sys/class/gpio/export; echo in > /sys/class/gpio/gpio4/direction && echo out > /sys/class/gpio/gpio17/direction && echo 0 > /sys/class/gpio/gpio17/value && echo falling > /sys/class/gpio/gpio4/edge") == 0);
		int fd_sens;
		int fd_ctrl;
		char buffer[8];
		unsigned char p = 0;
		SYSERR(fd_sens = open("/sys/class/gpio/gpio4/value", O_RDONLY|O_CLOEXEC|O_NOCTTY|O_NONBLOCK));
		SYSERR(fd_ctrl = open("/sys/class/gpio/gpio17/value", O_WRONLY|O_CLOEXEC|O_NOCTTY));
		SYSERR(pread(fd_sens, buffer, 8, 0));

		TTime ts_start = -1;

		for(;;)
		{
			pollfd pfd = { fd_sens, POLLPRI, 0 };
			SYSERR(poll(&pfd, 1, 1000));
			if(pfd.revents)
			{
				//	pulse detected
				SYSERR(pread(fd_sens, buffer, 8, 0));

				const TTime ts_now = TTime::Now(TIME_CLOCK_MONOTONIC);
				if(ts_start == -1)
				{
					//	first pulse => motor just started
					fprintf(stderr, "%f: detected motor start!\n", ts_start.ConvertToF(TIME_UNIT_SECONDS));
					ts_start = ts_now;
					p = 0;
				}
				else
				{
					//	motor still running

					if( (++p % 50) == 0 )
						fputc('.', stderr);

					const TTime dt = ts_now - ts_start;
					if(dt > 15)
					{
						//	forcefully shutdown motor to prevent damage
						fprintf(stderr, "\n%f: sending stop command ... ", ts_now.ConvertToF(TIME_UNIT_SECONDS));
						pwrite(fd_ctrl, "1", 1, 0);
						usleep(100000L);
						pwrite(fd_ctrl, "0", 1, 0);
						usleep(100000L);
						ts_start = -1;
						fprintf(stderr, "OK\n");
					}
				}
			}
			else if(ts_start != -1)
			{
				//	timeout; no more activity on GPIO => motor stopped
				const TTime ts_now = TTime::Now(TIME_CLOCK_MONOTONIC);
				ts_start = -1;
				fprintf(stderr, "%f: detected motor stop!\n", ts_now.ConvertToF(TIME_UNIT_SECONDS));
			}
		}

		SYSERR(close(fd_ctrl));
		SYSERR(close(fd_sens));
	}
	catch(const char* expr)
	{
		perror(expr);
		return 1;
	}

	return 0;
}
