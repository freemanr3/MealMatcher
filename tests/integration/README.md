# Integration Tests

This directory contains integration tests for the application.

## Structure

- `api/`: API endpoint tests
- `auth/`: Authentication flow tests
- `database/`: Database operation tests
- `services/`: External service integration tests

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test suite
npm run test:integration:api
npm run test:integration:auth
npm run test:integration:database
```

## Test Guidelines

1. Use Supertest for API testing
2. Use a test database
3. Clean up test data after each test
4. Test complete user flows
5. Mock external services when appropriate 