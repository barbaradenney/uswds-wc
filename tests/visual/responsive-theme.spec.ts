import { test, expect } from '@playwright/test';

/**
 * Visual Tests for Responsive Design and Theme Variations
 *
 * Tests component rendering across different breakpoints and theme variations.
 * Focus areas: responsive breakpoints, theme variations, high contrast mode
 */
test.describe('Responsive Design and Theme Visual Tests', () => {
  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1200, height: 800 },
    { name: 'large-desktop', width: 1440, height: 900 },
  ];

  // Test critical components across all breakpoints
  const criticalComponents = [
    { name: 'Header', story: 'components-header--default' },
    { name: 'Footer', story: 'components-footer--default' },
    { name: 'Navigation', story: 'components-side-navigation--default' },
    { name: 'Form Elements', story: 'components-text-input--default' },
    { name: 'Button Group', story: 'components-button-group--default' },
    { name: 'Table', story: 'components-table--default' },
  ];

  // Responsive Breakpoint Tests
  test.describe('Responsive Breakpoint Tests', () => {
    for (const component of criticalComponents) {
      for (const breakpoint of breakpoints) {
        test(`should render ${component.name} correctly at ${breakpoint.name} breakpoint`, async ({ page }) => {
          await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
          await page.goto(`/iframe.html?id=${component.story}`);
          await page.waitForLoadState('networkidle');

          await expect(page).toHaveScreenshot(`${component.name.toLowerCase().replace(' ', '-')}-${breakpoint.name}.png`);
        });
      }
    }
  });

  // Theme Variation Tests
  test.describe('Theme Variation Tests', () => {
    test('should render components in dark mode (if supported)', async ({ page }) => {
      // Test dark mode color scheme
      await page.emulateMedia({ colorScheme: 'dark' });

      const componentsToTest = [
        'components-button--default',
        'components-alert--default',
        'components-card--default',
        'components-modal--default',
      ];

      for (const story of componentsToTest) {
        await page.goto(`/iframe.html?id=${story}`);
        await page.waitForLoadState('networkidle');

        const componentName = story.split('--')[0].split('-').slice(-1)[0];
        await expect(page).toHaveScreenshot(`${componentName}-dark-mode.png`);
      }
    });

    test('should render components in high contrast mode', async ({ page, browserName }) => {
      // Skip for browsers that don't support high contrast
      if (browserName === 'webkit') {
        test.skip('Safari does not support forced-colors media query');
      }

      // Emulate high contrast mode
      await page.emulateMedia({
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        forcedColors: 'active'
      });

      const componentsToTest = [
        'components-button--default',
        'components-text-input--default',
        'components-select--default',
        'components-checkbox--default',
        'components-radio--default',
      ];

      for (const story of componentsToTest) {
        await page.goto(`/iframe.html?id=${story}`);
        await page.waitForLoadState('networkidle');

        const componentName = story.split('--')[0].split('-').slice(-1)[0];
        await expect(page).toHaveScreenshot(`${componentName}-high-contrast.png`);
      }
    });

    test('should render components with reduced motion', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      // Test animated components
      const animatedComponents = [
        'components-accordion--default',
        'components-modal--default',
        'components-banner--default',
      ];

      for (const story of animatedComponents) {
        await page.goto(`/iframe.html?id=${story}`);
        await page.waitForLoadState('networkidle');

        // Trigger animation
        if (story.includes('accordion')) {
          const button = page.locator('.usa-accordion__button').first();
          await button.click();
          await page.waitForTimeout(100); // Reduced motion should make this faster
        } else if (story.includes('modal')) {
          const openButton = page.locator('button:has-text("Open Modal")').first();
          await openButton.click();
          await page.waitForSelector('[role="dialog"]', { state: 'visible' });
        } else if (story.includes('banner')) {
          const button = page.locator('.usa-banner__button');
          await button.click();
          await page.waitForTimeout(100);
        }

        const componentName = story.split('--')[0].split('-').slice(-1)[0];
        await expect(page).toHaveScreenshot(`${componentName}-reduced-motion.png`);
      }
    });
  });

  // Print Styles Test
  test.describe('Print Media Tests', () => {
    test('should render components correctly for print', async ({ page }) => {
      await page.emulateMedia({ media: 'print' });

      const printableComponents = [
        'components-alert--default',
        'components-card--default',
        'components-table--default',
        'components-summary-box--default',
      ];

      for (const story of printableComponents) {
        await page.goto(`/iframe.html?id=${story}`);
        await page.waitForLoadState('networkidle');

        const componentName = story.split('--')[0].split('-').slice(-1)[0];
        await expect(page).toHaveScreenshot(`${componentName}-print.png`);
      }
    });
  });

  // Layout and Container Tests
  test.describe('Layout and Container Tests', () => {
    test('should render components in different container widths', async ({ page }) => {
      const containerWidths = [320, 480, 720, 1024];

      for (const width of containerWidths) {
        await page.setViewportSize({ width: width + 40, height: 800 }); // Add padding

        // Test form components that are width-sensitive
        await page.goto('/iframe.html?id=forms-text-input--default');
        await page.waitForLoadState('networkidle');

        // Create a container with specific width
        await page.evaluate((containerWidth) => {
          const container = document.querySelector('.sb-show-main');
          if (container) {
            (container as HTMLElement).style.width = `${containerWidth}px`;
            (container as HTMLElement).style.margin = '0 auto';
          }
        }, width);

        await expect(page).toHaveScreenshot(`text-input-container-${width}px.png`);
      }
    });

    test('should render grid components correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=data-display-collection--default');
      await page.waitForLoadState('networkidle');

      const breakpoints = [
        { name: 'mobile', width: 375 },
        { name: 'tablet', width: 768 },
        { name: 'desktop', width: 1200 },
      ];

      for (const bp of breakpoints) {
        await page.setViewportSize({ width: bp.width, height: 800 });
        await page.waitForTimeout(100);
        await expect(page).toHaveScreenshot(`collection-grid-${bp.name}.png`);
      }
    });
  });

  // Focus and Interactive State Tests
  test.describe('Interactive State Visual Tests', () => {
    test('should render focus states consistently', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      const button = page.locator('.usa-button').first();

      // Focus state
      await button.focus();
      await expect(page).toHaveScreenshot('button-focus-state.png');

      // Focus + hover state
      await button.hover();
      await expect(page).toHaveScreenshot('button-focus-hover-state.png');
    });

    test('should render form element states consistently', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-text-input--default');
      await page.waitForLoadState('networkidle');

      const input = page.locator('.usa-input').first();

      // Default state
      await expect(page).toHaveScreenshot('input-default-state.png');

      // Focus state
      await input.focus();
      await expect(page).toHaveScreenshot('input-focus-state.png');

      // Filled state
      await input.fill('Test value');
      await expect(page).toHaveScreenshot('input-filled-state.png');

      // Error state (if supported)
      await page.evaluate(() => {
        const input = document.querySelector('.usa-input') as HTMLInputElement;
        if (input) {
          input.setAttribute('aria-invalid', 'true');
          input.classList.add('usa-input--error');
        }
      });
      await expect(page).toHaveScreenshot('input-error-state.png');
    });
  });

  // Component Density Tests
  test.describe('Component Density Tests', () => {
    test('should render compact component variations', async ({ page }) => {
      // Test table with compact spacing
      await page.goto('/iframe.html?id=data-display-table--default');
      await page.waitForLoadState('networkidle');

      // Apply compact modifier if available
      await page.evaluate(() => {
        const table = document.querySelector('.usa-table');
        if (table) {
          table.classList.add('usa-table--compact');
        }
      });

      await expect(page).toHaveScreenshot('table-compact.png');
    });

    test('should render components with different spacing scales', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button-group--default');
      await page.waitForLoadState('networkidle');

      // Default spacing
      await expect(page).toHaveScreenshot('button-group-default-spacing.png');

      // Apply different spacing if supported
      await page.evaluate(() => {
        const buttonGroup = document.querySelector('.usa-button-group');
        if (buttonGroup) {
          buttonGroup.classList.add('usa-button-group--compact');
        }
      });

      await expect(page).toHaveScreenshot('button-group-compact-spacing.png');
    });
  });
});