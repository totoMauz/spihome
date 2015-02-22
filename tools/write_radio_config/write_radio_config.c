#include "radio_config_Si4463.h"
#include <unistd.h>

static unsigned char data[] = RADIO_CONFIGURATION_DATA_ARRAY;

int main()
{
	write(STDOUT_FILENO, data, sizeof(data));
	return 0;
}
