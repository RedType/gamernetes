#!/usr/bin/env bash

players=$(mcrcon -p uwu list | egrep -o '[0-9]*' | head -1)

if [ -f /var/g.coldstart ]; then
  rm /var/g.coldstart
  echo 'coldstart'
elif [ $players -eq 0 ]; then
  echo 'idle'
else
  echo "active $p"
fi

