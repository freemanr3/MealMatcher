# Unit Tests

This directory contains unit tests for the application.

## Structure

- `client/`: Frontend component and utility tests
- `server/`: Backend service and utility tests
- `shared/`: Shared code tests

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run client tests only
npm run test:unit:client

# Run server tests only
npm run test:unit:server

# Run tests with coverage
npm run test:unit:coverage
```

## Test Guidelines

1. Use Jest for unit testing
2. Follow the AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Aim for high test coverage
5. Write descriptive test names 