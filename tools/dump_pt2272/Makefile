.PHONY: clean all

all: dump_pt2272

clean:
	rm -vf dump_pt2272

dump_pt2272: dump_pt2272.cpp
	g++ -O2 -std=c++11 -pthread -lcl3-core -lcl3-gpio dump_pt2272.cpp -o dump_pt2272
