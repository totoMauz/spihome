.PHONY: clean all

all: dump_rfm

clean:
	rm -vf dump_rfm

dump_rfm: dump_rfm.cpp
	g++ -O2 -std=c++11 -pthread -lcl3-core -lcl3-gpio dump_rfm.cpp -o dump_rfm
