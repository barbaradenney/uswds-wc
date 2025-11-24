import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';

/**
 * Comprehensive Playwright Configuration for USWDS Web Components
 *
 * This configuration integrates all testing scenarios:
 * - Cross-browser compatibility
 * - Accessibility testing
 * - Performance testing
 * - Security testing
 * - Progressive enhancement testing
 * - Error recovery testing
 * - API contract testing
 */

export default defineConfig({
  // Test directory configuration
  testDir: './tests',
  testMatch: [
    '**/accessibility/**/*.spec.ts',
    '**/performance/**/*.spec.ts',
    '**/security/**/*.spec.ts',
    '**/progressive-enhancement/**/*.spec.ts',
    '**/error-recovery/**/*.spec.ts',
    '**/api-contracts/**/*.spec.ts',
    '**/cross-browser/**/*.spec.ts',
    '**/integration/**/*.spec.ts',
  ],

  // Global test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  // Reporter configuration
  reporter: [
    [
      'html',
      {
        outputFolder: './test-reports/playwright-html',
        open: process.env.CI ? 'never' : 'on-failure',
      },
    ],
    [
      'json',
      {
        outputFile: './test-reports/playwright-results.json',
      },
    ],
    [
      'junit',
      {
        outputFile: './test-reports/playwright-junit.xml',
      },
    ],
    ['list'],
    // Custom reporter for comprehensive reporting
    ['./scripts/test/playwright-comprehensive-reporter.cjs'],
  ],

  // Global test setup and teardown
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',

  // Use projects to define different test environments and scenarios
  projects: [
    // Setup project to ensure Storybook is running
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testMatch: /global\.teardown\.ts/,
    },

    // Core desktop browsers - Cross-browser compatibility testing
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
      },
      dependencies: ['setup'],
      testMatch: [
        '**/accessibility/**/*.spec.ts',
        '**/api-contracts/**/*.spec.ts',
        '**/progressive-enhancement/**/*.spec.ts',
      ],
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
      },
      dependencies: ['setup'],
      testMatch: ['**/cross-browser/**/*.spec.ts', '**/progressive-enhancement/**/*.spec.ts'],
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
      },
      dependencies: ['setup'],
      testMatch: ['**/cross-browser/**/*.spec.ts', '**/progressive-enhancement/**/*.spec.ts'],
    },

    // Mobile devices - Responsive and touch testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        isMobile: true,
        hasTouch: true,
      },
      dependencies: ['setup'],
      testMatch: ['**/accessibility/**/*.spec.ts', '**/cross-browser/**/*.spec.ts'],
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        isMobile: true,
        hasTouch: true,
      },
      dependencies: ['setup'],
      testMatch: ['**/cross-browser/**/*.spec.ts'],
    },

    // Accessibility-focused testing environments
    {
      name: 'accessibility-high-contrast',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
        reducedMotion: 'reduce',
        forcedColors: 'active', // High contrast mode
      },
      dependencies: ['setup'],
      testMatch: ['**/accessibility/**/*.spec.ts'],
    },
    {
      name: 'accessibility-reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
        reducedMotion: 'reduce',
      },
      dependencies: ['setup'],
      testMatch: ['**/accessibility/**/*.spec.ts', '**/progressive-enhancement/**/*.spec.ts'],
    },
    {
      name: 'accessibility-dark-mode',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'dark',
      },
      dependencies: ['setup'],
      testMatch: ['**/accessibility/**/*.spec.ts'],
    },

    // Performance testing environment
    {
      name: 'performance-testing',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Simulate slower CPU for performance testing
        launchOptions: {
          args: ['--enable-precise-memory-info', '--disable-features=TranslateUI'],
        },
      },
      dependencies: ['setup'],
      testMatch: ['**/performance/**/*.spec.ts'],
    },

    // Security testing environment
    {
      name: 'security-testing',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Enhanced security context
        extraHTTPHeaders: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      },
      dependencies: ['setup'],
      testMatch: ['**/security/**/*.spec.ts'],
    },

    // Error recovery testing environment
    {
      name: 'error-recovery-testing',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Simulate network instability
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
        },
      },
      dependencies: ['setup'],
      testMatch: ['**/error-recovery/**/*.spec.ts'],
    },

    // Progressive enhancement testing - Older browser simulation
    {
      name: 'progressive-enhancement-legacy',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
        // Simulate older browser capabilities
        javaScriptEnabled: false, // Test without JavaScript
      },
      dependencies: ['setup'],
      testMatch: ['**/progressive-enhancement/**/*.spec.ts'],
    },

    // Integration testing environment
    {
      name: 'integration-testing',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Full browser context for complex interactions
        permissions: ['clipboard-read', 'clipboard-write'],
      },
      dependencies: ['setup'],
      testMatch: ['**/integration/**/*.spec.ts'],
    },

    // Visual regression testing environment (if using Playwright screenshots)
    {
      name: 'visual-regression',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Consistent environment for visual testing
        deviceScaleFactor: 1,
        locale: 'en-US',
        timezoneId: 'UTC',
      },
      dependencies: ['setup'],
      testMatch: ['**/visual/**/*.spec.ts'],
    },

    // Edge cases and boundary testing
    {
      name: 'edge-cases',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 568 }, // Very small viewport
        // Simulate constrained environment
        launchOptions: {
          args: ['--memory-pressure-off', '--max_old_space_size=512'],
        },
      },
      dependencies: ['setup'],
      testMatch: ['**/error-recovery/**/*.spec.ts', '**/progressive-enhancement/**/*.spec.ts'],
    },
  ],

  // Global test configuration
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:6006',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Trace collection for debugging
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: process.env.CI ? 'retain-on-failure' : 'off',

    // Ignore HTTPS errors (for local testing)
    ignoreHTTPSErrors: true,

    // User agent for identification
    userAgent: 'USWDS-WebComponents-Test-Runner/1.0',
  },

  // Web server configuration
  // Note: comprehensive-testing.yml starts http-server manually in each job
  // after downloading the storybook-static artifact. This avoids timing issues
  // where webServer runs before the artifact is available.
  // For local development, start Storybook manually: npm run storybook
  webServer: process.env.CI
    ? undefined
    : {
        // Local development only - start Storybook dev server
        command: 'npm run storybook',
        url: 'http://localhost:6006',
        reuseExistingServer: true,
        timeout: 120000,
      },

  // Output directories
  outputDir: './test-reports/playwright-artifacts',
});
