#!/bin/bash

GIT_COMMIT_HASH=`(head=($(<.git/HEAD)); cat .git/${head[1]})`

docker build -t kdelemme/planning-poker-service:${GIT_COMMIT_HASH} .
