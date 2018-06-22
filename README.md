# Planning Poker

A distributed planning poker game.

Live demo available [here](http://s3-eu-west-1.amazonaws.com/demo-kdelemme/planning-poker/index.html)

## Installing

Install the dependencies: `npm install`

## Running the tests

You can run the test with: `npm test`

## Running in development mode

Simply run: `npm start`

## Continuous Integration

This project is configured with ![circleci](https://circleci.com). 

Tests run when a branch is updated and the docker image is built and pushed to Amazon ECR when merging to master.

Make sure you have set some AWS credentials for circleci to access ECR, and add the following environment variables:
`ECR_ENDPOINT=your.ecr.amazon.com`

## License

This project is licensed under the MIT License


