.PHONY: clean all

all: dump_ook

clean:
	rm -vf dump_ook

dump_ook: dump_ook.cpp
	g++ -O2 -std=c++11 -lcl3-core -lcl3-gpio dump_ook.cpp -o dump_ook
