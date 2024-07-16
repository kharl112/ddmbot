#!/bin/bash

if [ -n "$(which docker)" ]; then  
	docker stop ddmbot
	docker rm ddmbot
	docker image rm ddmbot
	docker build -t ddmbot:latest .
	docker run -d --name ddmbot --env-file .env -t ddmbot:latest
else
	echo no docker found
fi


