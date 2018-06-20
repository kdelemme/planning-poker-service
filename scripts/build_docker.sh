#!/bin/bash

docker build --rm -t kdelemme/planning-poker-service .

docker tag kdelemme/planning-poker-service \
  168458823459.dkr.ecr.eu-west-1.amazonaws.com/kdelemme/planning-poker-service:latest
