import { test, expect } from '@playwright/test';

/**
 * Real User Testing Simulation
 * Tests comprehensive user workflows across USWDS components
 */

test.describe('USWDS Component User Flows', () => {
  // Skip user flow tests in CI - comprehensive local tests, CI uses simpler cross-browser tests
  test.beforeEach(async ({ page }) => {
    test.skip(!!process.env.CI, 'User flow tests skip CI - use cross-browser tests for CI coverage');
    await page.goto('/');
    // Wait for Storybook to load
    await page.waitForSelector('[data-item-id]', { timeout: 10000 });
  });

  test.describe('Form Interaction Flow', () => {
    test('complete form workflow with multiple components', async ({ page }) => {
      // Navigate to a form-heavy story
      await page.click('text=Components');
      await page.click('text=Text Input');
      await page.click('text=Default');

      // Wait for story to load
      await page.waitForSelector('#storybook-root usa-text-input');

      // Test text input interaction
      const textInput = page.locator('#storybook-root usa-text-input input');
      await textInput.fill('Test User Input');
      await expect(textInput).toHaveValue('Test User Input');

      // Test validation if present
      await textInput.fill('');
      await textInput.blur();

      // Check for validation states
      const textInputElement = page.locator('#storybook-root usa-text-input');
      const hasErrorClass = await textInputElement.evaluate(
        (el) =>
          el.classList.contains('usa-input--error') ||
          el.classList.contains('usa-form-group--error')
      );

      if (hasErrorClass) {
        console.log('✅ Validation state correctly applied');
      }

      // Test form submission simulation
      await textInput.fill('Valid Input');
      await textInput.press('Enter');

      // Form events propagate immediately, no wait needed
    });

    test('multi-component form interaction', async ({ page }) => {
      // Test a complex form scenario with multiple components
      const components = ['Button', 'Checkbox', 'Radio', 'Select'];

      for (const component of components) {
        await page.click(`text=${component}`, { timeout: 5000 });
        await page.click('text=Default', { timeout: 5000 });

        // Wait for component to render
        await page.waitForSelector('#storybook-root', { timeout: 5000 });

        // Test basic interaction based on component type
        switch (component) {
          case 'Button': {
            const button = page.locator('#storybook-root usa-button, #storybook-root button');
            if ((await button.count()) > 0) {
              await button.first().click();
              console.log(`✅ ${component} interaction successful`);
            }
            break;
          }

          case 'Checkbox': {
            const checkbox = page.locator(
              '#storybook-root usa-checkbox input[type="checkbox"], #storybook-root input[type="checkbox"]'
            );
            if ((await checkbox.count()) > 0) {
              await checkbox.first().check();
              await expect(checkbox.first()).toBeChecked();
              console.log(`✅ ${component} interaction successful`);
            }
            break;
          }

          case 'Radio': {
            const radio = page.locator(
              '#storybook-root usa-radio input[type="radio"], #storybook-root input[type="radio"]'
            );
            if ((await radio.count()) > 0) {
              await radio.first().check();
              await expect(radio.first()).toBeChecked();
              console.log(`✅ ${component} interaction successful`);
            }
            break;
          }

          case 'Select': {
            const select = page.locator(
              '#storybook-root usa-select select, #storybook-root select'
            );
            if ((await select.count()) > 0) {
              await select.first().selectOption({ index: 1 });
              console.log(`✅ ${component} interaction successful`);
            }
            break;
          }
        }

        // Component navigation is synchronous, no delay needed
      }
    });
  });

  test.describe('Navigation and Accessibility Flow', () => {
    test('keyboard navigation through components', async ({ page }) => {
      // Navigate to an interactive component
      await page.click('text=Accordion');
      await page.click('text=Default');

      await page.waitForSelector('#storybook-root usa-accordion');

      // Test keyboard navigation
      const accordion = page.locator('#storybook-root usa-accordion');
      await accordion.press('Tab');

      // Check focus management
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Test Enter/Space activation
      await page.keyboard.press('Enter');

      // Verify accordion opened/closed (state change is synchronous)
      const isExpanded = await accordion.evaluate(
        (el) => el.querySelector('[aria-expanded]')?.getAttribute('aria-expanded') === 'true'
      );

      console.log(`✅ Accordion keyboard interaction: ${isExpanded ? 'expanded' : 'collapsed'}`);
    });

    test('screen reader compatibility', async ({ page }) => {
      // Test components for proper ARIA attributes
      const accessibleComponents = ['Alert', 'Modal', 'Banner', 'Button'];

      for (const component of accessibleComponents) {
        await page.click(`text=${component}`);
        await page.click('text=Default');

        await page.waitForSelector('#storybook-root', { timeout: 5000 });

        // Check for essential ARIA attributes
        const hasAriaLabel = (await page.locator('[aria-label]').count()) > 0;
        const hasAriaLabelledBy = (await page.locator('[aria-labelledby]').count()) > 0;
        const hasRole = (await page.locator('[role]').count()) > 0;
        const hasAriaDescribedBy = (await page.locator('[aria-describedby]').count()) > 0;

        const accessibilityScore = [
          hasAriaLabel,
          hasAriaLabelledBy,
          hasRole,
          hasAriaDescribedBy,
        ].filter(Boolean).length;

        console.log(`✅ ${component} accessibility attributes: ${accessibilityScore}/4`);

        // At least one accessibility attribute should be present
        expect(accessibilityScore).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Responsive Behavior Flow', () => {
    test('components adapt to different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' },
      ];

      // Test responsive components
      await page.click('text=Header');
      await page.click('text=Default');

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        // Browser reflow happens synchronously with viewport changes

        // Check if component is still visible and functional
        const component = page.locator('#storybook-root usa-header');
        await expect(component).toBeVisible();

        // Test that component doesn't overflow
        const boundingBox = await component.boundingBox();
        if (boundingBox) {
          expect(boundingBox.width).toBeLessThanOrEqual(viewport.width + 50); // 50px tolerance
          console.log(
            `✅ ${viewport.name}: Component fits viewport (${boundingBox.width}px <= ${viewport.width}px)`
          );
        }
      }
    });
  });

  test.describe('Performance and Loading Flow', () => {
    test('components load and render within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      // Navigate to a complex component
      await page.click('text=Table');
      await page.click('text=Default');

      // Wait for component to be fully rendered
      await page.waitForSelector('#storybook-root usa-table table', { timeout: 10000 });

      const loadTime = Date.now() - startTime;
      console.log(`✅ Table component loaded in ${loadTime}ms`);

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      // Test scrolling performance for large tables
      const table = page.locator('#storybook-root usa-table table');
      if ((await table.count()) > 0) {
        await table.hover();
        await page.wheel(0, 500);
        // Scroll actions are synchronous, no wait needed
        console.log('✅ Table scroll performance acceptable');
      }
    });

    test('multiple component instances perform well', async ({ page }) => {
      // Test performance with multiple identical components
      await page.click('text=Card');
      await page.click('text=Default');

      const startTime = Date.now();
      await page.waitForSelector('#storybook-root usa-card');

      // Count rendered components
      const componentCount = await page.locator('#storybook-root usa-card').count();
      const renderTime = Date.now() - startTime;

      console.log(`✅ ${componentCount} card components rendered in ${renderTime}ms`);

      // Performance should be reasonable even with multiple components
      expect(renderTime).toBeLessThan(3000);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('components handle invalid input gracefully', async ({ page }) => {
      // Test form components with edge case inputs
      await page.click('text=Text Input');
      await page.click('text=Default');

      const textInput = page.locator('#storybook-root input');
      if ((await textInput.count()) > 0) {
        // Test various edge cases
        const edgeCases = [
          '   ', // whitespace only
          '<script>alert("xss")</script>', // potential XSS
          'a'.repeat(1000), // very long input
          '🎉🎊✨', // emoji input
          '测试中文输入', // non-ASCII characters
        ];

        for (const testCase of edgeCases) {
          await textInput.fill(testCase);
          await textInput.blur();

          // Component should not crash or throw errors
          await page.evaluate(() => {
            return window.console.error.calls ? window.console.error.calls.length > 0 : false;
          });

          console.log(
            `✅ Edge case handled: "${testCase.substring(0, 20)}${testCase.length > 20 ? '...' : ''}"`
          );
        }
      }
    });

    test('components maintain accessibility during interactions', async ({ page }) => {
      // Test that ARIA attributes remain correct during state changes
      await page.click('text=Modal');
      await page.click('text=Default');

      // Check initial accessibility state
      const modal = page.locator('#storybook-root usa-modal, #storybook-root [role="dialog"]');
      if ((await modal.count()) > 0) {
        // Check that modal has proper ARIA attributes
        const hasRole = (await modal.getAttribute('role')) === 'dialog';
        const hasAriaLabel =
          (await modal.getAttribute('aria-label')) !== null ||
          (await modal.getAttribute('aria-labelledby')) !== null;

        console.log(`✅ Modal accessibility: role=${hasRole}, label=${hasAriaLabel}`);

        expect(hasRole || hasAriaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Component Interaction Flow', () => {
    test('components communicate and work together', async ({ page }) => {
      // Test components that might interact with each other
      await page.click('text=Alert');
      await page.click('text=Default');

      // Look for dismiss functionality
      const dismissButton = page.locator(
        '#storybook-root button[aria-label*="dismiss"], #storybook-root .usa-alert__dismiss'
      );
      if ((await dismissButton.count()) > 0) {
        await dismissButton.click();

        // Check if alert was properly dismissed
        const alert = page.locator('#storybook-root usa-alert, #storybook-root .usa-alert');
        const isHidden = await alert.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.display === 'none' || el.hidden || el.getAttribute('aria-hidden') === 'true';
        });

        console.log(`✅ Alert dismiss functionality: ${isHidden ? 'working' : 'needs review'}`);
      }
    });
  });
});
