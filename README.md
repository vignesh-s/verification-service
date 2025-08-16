# Verification Service

[![Test Status](https://github.com/vignesh-s/verification-service/actions/workflows/nestjs-test.yml/badge.svg)](https://github.com/vignesh-s/verification-service/actions/workflows/nestjs-test.yml)

## APIs

https://verification-service-bq20.onrender.com/api

## Description
This is a verification service that provides a queue-based system to verify data.

Currently it supports bank account verification via Razorpay, later it can be extended to support other providers.

Basic validation to the account details is done before accepting the request itself using [class-validator](https://www.npmjs.com/package/class-validator).

It uses Redis for queue and PostgreSQL for database.

## Project Setup

To install the necessary dependencies, run:

```bash
$ pnpm install
```

## Running Redis for Queue

To run Redis locally for your application:

1. **Install Redis**: Follow the [Redis installation guide](https://redis.io/docs/install/) for your operating system.

2. **Start Redis**: Once installed, you can start Redis with the following command:
   ```bash
   redis-server
   ```
   This will start Redis on the default port 6379.

3. **Verify Redis is Running**: You can verify Redis is working by running:
   ```bash
   redis-cli ping
   ```
   You should receive the response `PONG`.

## Compile and Run the Project

### Development
To start the application in development mode:

```bash
$ pnpm run start
```

### Watch Mode
To run the application in watch mode:

```bash
$ pnpm run start:dev
```

### Production Mode
To start the application in production mode:

```bash
$ pnpm run start:prod
```

## Run Tests

### Unit Tests
To run the unit tests:

```bash
$ pnpm run test
```

### Test Coverage
To generate a test coverage report:

```bash
$ pnpm run test:cov
```
