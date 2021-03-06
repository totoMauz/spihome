#!/bin/bash

function cleanup()
{
	while read pin; do
		echo $pin > /sys/class/gpio/unexport
	done < r1.txt

	while read pin; do
		echo $pin > /sys/class/gpio/unexport
	done < r2.txt
}

function at_exit()
{
	cleanup
	exit 0
}

trap at_exit SIGINT SIGTERM SIGHUP

cleanup >/dev/null 2>&1

while read pin; do
	echo $pin > /sys/class/gpio/export
	echo out > /sys/class/gpio/gpio$pin/direction
done < r1.txt

while read pin; do
	echo $pin > /sys/class/gpio/export
	echo out > /sys/class/gpio/gpio$pin/direction
done < r2.txt

while true; do
	while read pin; do
		echo 0 > /sys/class/gpio/gpio$pin/value
		sleep 0.5
		echo 1 > /sys/class/gpio/gpio$pin/value
	done < r1.txt

	while read pin; do
		echo 0 > /sys/class/gpio/gpio$pin/value
		sleep 0.5
		echo 1 > /sys/class/gpio/gpio$pin/value
	done < r2.txt

	sleep 2
done
