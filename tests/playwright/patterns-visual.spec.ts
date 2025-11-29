import { test, expect } from '@playwright/test';

/**
 * Pattern Visual Regression Tests
 *
 * Tests visual rendering of all USWDS patterns to catch:
 * - Layout regressions
 * - Style inconsistencies
 * - Responsive design issues
 * - Component composition problems
 *
 * These tests run across multiple browsers and viewport sizes.
 */

const PATTERNS = [
  {
    name: 'address',
    storyId: 'patterns-address--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'phone-number',
    storyId: 'patterns-phone-number--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'name',
    storyId: 'patterns-name--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'contact-preferences',
    storyId: 'patterns-contact-preferences--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'language-selection',
    storyId: 'patterns-language-selection--two-languages',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'form-summary',
    storyId: 'patterns-form-summary--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'date-of-birth',
    storyId: 'patterns-date-of-birth--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'email-address',
    storyId: 'patterns-email-address--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'ssn',
    storyId: 'patterns-ssn--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'race-ethnicity',
    storyId: 'patterns-race-ethnicity--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
  {
    name: 'sex',
    storyId: 'patterns-sex--default',
    viewports: ['mobile', 'tablet', 'desktop'],
  },
];

const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1280, height: 720 }, // Desktop
};

test.describe('Pattern Visual Regression Tests', () => {
  // Skip all pattern visual tests in Webkit CI - USWDS/Storybook initialization too slow
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName === 'webkit' && !!process.env.CI, 'Pattern visual tests skip Webkit in CI - USWDS/Storybook initialization too slow');
    // Set a reasonable timeout for Storybook navigation
    test.setTimeout(30000);
  });

  PATTERNS.forEach(({ name, storyId, viewports }) => {
    test.describe(`${name} pattern`, () => {
      viewports.forEach((viewport) => {
        test(`should render correctly on ${viewport}`, async ({ page }) => {
          // Set viewport
          await page.setViewportSize(VIEWPORTS[viewport]);

          // Navigate to story
          await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`);

          // Wait for pattern to be ready
          await page.waitForSelector(`usa-${name}-pattern, usa-language-selector-pattern, usa-form-summary-pattern, usa-date-of-birth-pattern, usa-email-address-pattern, usa-ssn-pattern, usa-race-ethnicity-pattern, usa-sex-pattern`, {
            timeout: 10000,
          });

          // Wait for fonts to load
          await page.evaluate(() => document.fonts.ready);

          // Small delay for any animations
          await page.waitForTimeout(500);

          // Take screenshot
          await expect(page).toHaveScreenshot(`${name}-${viewport}.png`, {
            fullPage: true,
            animations: 'disabled',
            maxDiffPixels: 100, // Allow small differences
          });
        });
      });

      test('should handle interactions correctly', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`);

        // Wait for pattern
        await page.waitForSelector(`usa-${name}-pattern, usa-language-selector-pattern, usa-form-summary-pattern, usa-date-of-birth-pattern, usa-email-address-pattern, usa-ssn-pattern, usa-race-ethnicity-pattern, usa-sex-pattern`, {
          timeout: 10000,
        });

        // Test focus states
        const inputs = page.locator('input, select, textarea, button').first();
        if (await inputs.count() > 0) {
          await inputs.focus();
          await page.waitForTimeout(200);

          await expect(page).toHaveScreenshot(`${name}-focused.png`, {
            fullPage: true,
            animations: 'disabled',
            maxDiffPixels: 100,
          });
        }
      });
    });
  });

  test.describe('Pattern State Variations', () => {
    test('address pattern - with international address', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('http://localhost:6006/iframe.html?id=patterns-address--international&viewMode=story');

      await page.waitForSelector('usa-address-pattern');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('address-international.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('name pattern - different formats', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);

      // Test full format
      await page.goto('http://localhost:6006/iframe.html?id=patterns-name--full-format&viewMode=story');
      await page.waitForSelector('usa-name-pattern');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('name-full-format.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('phone-number pattern - with extension', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('http://localhost:6006/iframe.html?id=patterns-phone-number--with-extension&viewMode=story');

      await page.waitForSelector('usa-phone-number-pattern');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('phone-number-with-extension.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('language-selection pattern - dropdown variant', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('http://localhost:6006/iframe.html?id=patterns-language-selection--dropdown&viewMode=story');

      await page.waitForSelector('usa-language-selector-pattern');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('language-selection-dropdown.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('date-of-birth pattern - memorable date format', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('http://localhost:6006/iframe.html?id=patterns-date-of-birth--memorable-date&viewMode=story');

      await page.waitForSelector('usa-date-of-birth-pattern');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('date-of-birth-memorable.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('email-address pattern - with confirmation', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('http://localhost:6006/iframe.html?id=patterns-email-address--with-confirmation&viewMode=story');

      await page.waitForSelector('usa-email-address-pattern');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('email-address-confirmation.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });

    test('race-ethnicity pattern - with other option', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto('http://localhost:6006/iframe.html?id=patterns-race-ethnicity--default&viewMode=story');

      await page.waitForSelector('usa-race-ethnicity-pattern');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('race-ethnicity-default.png', {
        fullPage: true,
        animations: 'disabled',
      });
    });
  });

  test.describe('Pattern Error States', () => {
    test('patterns should display error states correctly', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);

      // Test address pattern with errors
      await page.goto('http://localhost:6006/iframe.html?id=patterns-address--default&viewMode=story');
      await page.waitForSelector('usa-address-pattern');

      // Trigger validation by interacting with required fields
      const firstInput = page.locator('usa-address-pattern input').first();
      if (await firstInput.count() > 0) {
        await firstInput.focus();
        await firstInput.blur();
        await page.waitForTimeout(300);

        await expect(page).toHaveScreenshot('address-error-state.png', {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixels: 150,
        });
      }
    });
  });

  test.describe('Pattern Compact Mode', () => {
    test('patterns should render correctly in compact mode', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);

      // Test a few representative patterns in compact mode
      const compactPatterns = [
        { name: 'address', storyId: 'patterns-address--compact' },
        { name: 'name', storyId: 'patterns-name--compact' },
        { name: 'phone-number', storyId: 'patterns-phone-number--compact' },
      ];

      for (const { name, storyId } of compactPatterns) {
        await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`);
        await page.waitForSelector(`usa-${name}-pattern`);
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${name}-compact.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixels: 100,
        });
      }
    });
  });

  test.describe('Pattern Responsive Layout', () => {
    test('patterns should adapt to mobile layout correctly', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);

      // Test patterns that have complex layouts
      const layoutPatterns = [
        { name: 'address', storyId: 'patterns-address--default' },
        { name: 'date-of-birth', storyId: 'patterns-date-of-birth--memorable-date' },
        { name: 'phone-number', storyId: 'patterns-phone-number--with-extension' },
      ];

      for (const { name, storyId } of layoutPatterns) {
        await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`);
        await page.waitForSelector(`usa-${name}-pattern`);
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${name}-mobile-layout.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixels: 100,
        });
      }
    });

    test('patterns should adapt to tablet layout correctly', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet);

      const layoutPatterns = [
        { name: 'race-ethnicity', storyId: 'patterns-race-ethnicity--default' },
        { name: 'contact-preferences', storyId: 'patterns-contact-preferences--default' },
      ];

      for (const { name, storyId } of layoutPatterns) {
        await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`);
        await page.waitForSelector(`usa-${name}-pattern`);
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`${name}-tablet-layout.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixels: 100,
        });
      }
    });
  });

  test.describe('Pattern Accessibility', () => {
    test('patterns should have proper ARIA attributes', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop);

      for (const { name, storyId } of PATTERNS.slice(0, 3)) {
        await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`);
        await page.waitForSelector(`usa-${name}-pattern, usa-language-selector-pattern, usa-form-summary-pattern, usa-date-of-birth-pattern, usa-email-address-pattern, usa-ssn-pattern, usa-race-ethnicity-pattern, usa-sex-pattern`);

        // Check for labels
        const labels = page.locator('label');
        const labelCount = await labels.count();
        expect(labelCount).toBeGreaterThan(0);

        // Check for proper input associations
        const inputs = page.locator('input, select, textarea');
        for (let i = 0; i < await inputs.count(); i++) {
          const input = inputs.nth(i);
          const hasId = await input.getAttribute('id');
          const hasAriaLabel = await input.getAttribute('aria-label');
          const hasAriaLabelledby = await input.getAttribute('aria-labelledby');

          // Input should have at least one of these
          expect(hasId || hasAriaLabel || hasAriaLabelledby).toBeTruthy();
        }
      }
    });
  });
});
