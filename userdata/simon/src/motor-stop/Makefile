.PHONY: all clean

all: motor-stop

clean:
	rm -vf motor-stop

motor-stop: motor-stop.cpp
	g++ motor-stop.cpp -o motor-stop -std=gnu++11 -l cl3-core -flto -march=native -O1 -fvisibility=hidden -g
