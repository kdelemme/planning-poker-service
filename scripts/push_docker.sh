#!/bin/bash

eval $(aws ecr get-login --no-include-email)
docker push 168458823459.dkr.ecr.eu-west-1.amazonaws.com/kdelemme/planning-poker-service