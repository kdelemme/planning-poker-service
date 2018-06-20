#!/bin/bash

ECR_ENDPOINT=168458823459.dkr.ecr.eu-west-1.amazonaws.com

eval $(aws ecr get-login --no-include-email --password-stdin)

docker tag kdelemme/planning-poker-service ${ECR_ENDPOINT}/kdelemme/planning-poker-service:latest
docker push ${ECR_ENDPOINT}/kdelemme/planning-poker-service