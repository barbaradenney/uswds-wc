import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:6006', // Storybook URL
    supportFile: 'cypress/support/e2e.ts',
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'src/**/*.e2e.cy.{js,jsx,ts,tsx}', // Co-located E2E tests
    ],
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          // Log task for test debugging - messages appear in terminal during test runs
          return null;
        },
      });
    },
  },
  component: {
    devServer: {
      framework: 'vite',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: [
      'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
      'src/**/*.component.cy.{js,jsx,ts,tsx}', // Co-located component tests
    ],
  },
});
