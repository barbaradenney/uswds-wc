import { defineConfig, devices } from '@playwright/test';

/**
 * Visual Testing Configuration with Playwright
 *
 * This configuration provides backup visual testing using Playwright screenshots
 * when Chromatic is not available or for local development.
 */
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'visual-test-results' }],
    ['json', { outputFile: 'visual-test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'visual-chrome',
      use: {
        ...devices['Desktop Chrome'],
        // Visual testing specific settings
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'visual-firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'visual-webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'visual-mobile',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'visual-tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],
  webServer: {
    command: 'pnpm run storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
