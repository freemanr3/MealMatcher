# End-to-End Tests

This directory contains end-to-end tests for the application.

## Structure

- `flows/`: Complete user journey tests
- `pages/`: Page-specific tests
- `components/`: Component interaction tests

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e:flows
npm run test:e2e:pages
```

## Test Guidelines

1. Use Cypress for E2E testing
2. Test critical user paths
3. Include error scenarios
4. Test responsive design
5. Test accessibility 