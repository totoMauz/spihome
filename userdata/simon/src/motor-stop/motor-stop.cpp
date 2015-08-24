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
		SYSERR(fd_sens = open("/sys/class/gpio/gpio4/value", O_RDONLY|O_CLOEXEC|O_NOCTTY|O_NONBLOCK));
		SYSERR(fd_ctrl = open("/sys/class/gpio/gpio17/value", O_WRONLY|O_CLOEXEC|O_NOCTTY));
		SYSERR(pread(fd_sens, buffer, 8, 0));

		TTime ts_last_pulse = -1;

		for(;;)
		{
			pollfd pfd = { fd_sens, POLLPRI, 0 };
			SYSERR(poll(&pfd, 1, 1000));
			if(pfd.revents)
			{
				//	pulse detected (motor is still on)
				SYSERR(pread(fd_sens, buffer, 8, 0));

				const TTime ts_now = TTime::Now(TIME_CLOCK_MONOTONIC);
				if(ts_last_pulse != -1)
				{
					fprintf(stderr, "detected motor start!\n");
					const TTime dt = ts_now - ts_last_pulse;
					if(dt > 15)
					{
						//	forcefully shutdown motor to prevent damage
						fprintf(stderr, "\nsending stop command ... ");
						pwrite(fd_ctrl, "1", 1, 0);
						usleep(100000);
						pwrite(fd_ctrl, "0", 1, 0);
						ts_last_pulse = -1;
						fprintf(stderr, "OK\n");
					}
				}
				ts_last_pulse = ts_now;
				fputc('.', stderr);
			}
			else if(ts_last_pulse != -1)
			{
				//	timeout (motor off)
				ts_last_pulse = -1;
				fprintf(stderr, "detected motor stop!\n");
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
