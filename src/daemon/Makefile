.PHONY: all clean

all: daemon

clean:
	rm -vf daemon

daemon: daemon.cpp daemon.hpp
	clang daemon.cpp -std=gnu++11 -I . -DINSIDE_SPIHOME -o daemon -g -lstdc++ -O0 -L ../../../cl3/gen/dbg/lib -lcl3-core
