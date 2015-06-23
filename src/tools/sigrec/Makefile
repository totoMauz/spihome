.PHONY: clean all

all: sigrec sigreplay

clean:
	rm -vf sigrec sigreplay

sigrec: sigrec.cpp
	g++ -O2 -std=c++11 -pthread -lcl3-core -lcl3-gpio sigrec.cpp -o sigrec

sigreplay: sigreplay.cpp
	g++ -O2 -std=c++11 -pthread -lcl3-core -lcl3-gpio sigreplay.cpp -o sigreplay
