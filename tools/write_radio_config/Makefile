.PHONY: clean all

all: write_radio_config

clean:
	rm -vf write_radio_config

write_radio_config: write_radio_config.c
	gcc -O0 -fwhole-program write_radio_config.c -o write_radio_config
	./write_radio_config > radio_config.bin
	rm write_radio_config
