import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'tests/e2e/support/e2e.ts',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      port: 3000,
    },
    specPattern: 'tests/e2e/components/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/component.ts',
  },
}); 