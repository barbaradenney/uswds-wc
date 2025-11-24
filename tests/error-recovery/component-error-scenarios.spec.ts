/**
 * Component Error Recovery & Boundary Testing
 *
 * This test suite verifies component behavior under error conditions using real browser environments.
 * Tests complement the error recovery utilities by providing realistic error scenarios.
 */

import { test, expect } from '@playwright/test';

test.describe('Component Error Recovery Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up error tracking
    await page.addInitScript(() => {
      window.errorLog = [];
      window.addEventListener('error', (e) => {
        window.errorLog.push({
          type: 'error',
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          stack: e.error?.stack
        });
      });

      window.addEventListener('unhandledrejection', (e) => {
        window.errorLog.push({
          type: 'unhandledRejection',
          reason: e.reason?.toString(),
          stack: e.reason?.stack
        });
      });

      // Mock console.error to track error logging
      const originalError = console.error;
      console.error = (...args) => {
        window.errorLog.push({
          type: 'console.error',
          message: args.join(' ')
        });
        originalError(...args);
      };
    });
  });

  test.describe('Malformed Props Handling', () => {
    test('Button should handle invalid variant gracefully', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');

      // Test with malformed variant prop
      await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (button) {
          // Set invalid variant
          (button as any).variant = { toString: () => { throw new Error('Invalid variant'); } };
        }
      });

      // Component should still be functional
      const button = page.locator('usa-button').first();
      await expect(button).toBeVisible();

      // Should still be clickable
      await button.click();

      // Check that no critical errors occurred
      const errors = await page.evaluate(() => window.errorLog);
      const criticalErrors = errors.filter(e =>
        e.type === 'error' || (e.type === 'console.error' && e.message.includes('Error'))
      );
      expect(criticalErrors.length).toBe(0);
    });

    test('Combo Box should handle malformed options', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-combo-box--default');

      // Set malformed options data
      await page.evaluate(() => {
        const comboBox = document.querySelector('usa-combo-box');
        if (comboBox) {
          // Circular reference should not crash component
          const circular = { self: null };
          circular.self = circular;

          try {
            (comboBox as any).options = [
              { value: 'valid', text: 'Valid Option' },
              circular,
              null,
              undefined,
              { value: 'missing-text' }
            ];
          } catch (e) {
            // Expected to potentially throw
          }
        }
      });

      // Component should still render
      const comboBox = page.locator('usa-combo-box').first();
      await expect(comboBox).toBeVisible();

      // Should still accept user input
      const input = page.locator('usa-combo-box input').first();
      await input.fill('test input');
      await expect(input).toHaveValue('test input');
    });

    test('Date Picker should handle invalid date formats', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-date-picker--default');

      // Test various invalid date formats
      const invalidDates = [
        'not-a-date',
        '32/13/2023',
        '2023-02-30',
        '{}',
        'null',
        '[]'
      ];

      for (const invalidDate of invalidDates) {
        await page.evaluate((date) => {
          const datePicker = document.querySelector('usa-date-picker');
          if (datePicker) {
            try {
              (datePicker as any).value = date;
            } catch (e) {
              // Expected to potentially throw
            }
          }
        }, invalidDate);

        // Component should remain functional
        const datePicker = page.locator('usa-date-picker').first();
        await expect(datePicker).toBeVisible();
      }
    });
  });

  test.describe('Network Failure Handling', () => {
    test('Components should handle network failures gracefully', async ({ page }) => {
      // Mock network failures
      await page.route('**/*', route => {
        if (route.request().url().includes('fetch-data')) {
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      await page.goto('/iframe.html?id=actions-button--default');

      // Simulate component making network request
      await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (button) {
          button.addEventListener('click', async () => {
            try {
              await fetch('/api/fetch-data');
            } catch (error) {
              // Component should handle gracefully
              console.log('Network request failed, using fallback');
            }
          });
        }
      });

      // Click button to trigger network request
      await page.locator('usa-button').first().click();

      // Component should still be functional after network failure
      const button = page.locator('usa-button').first();
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    });
  });

  test.describe('External DOM Manipulation Resistance', () => {
    test('Components should survive external innerHTML modification', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');

      // Externally modify component's innerHTML
      await page.evaluate(() => {
        const accordion = document.querySelector('usa-accordion');
        if (accordion) {
          // This can break Lit components
          accordion.innerHTML = '<div>External modification</div>';
        }
      });

      // Wait for component to potentially recover
      await page.waitForTimeout(500);

      // Component should not completely crash
      const accordion = page.locator('usa-accordion').first();
      await expect(accordion).toBeAttached();

      // Check for JavaScript errors
      const errors = await page.evaluate(() => window.errorLog);
      const jsErrors = errors.filter(e => e.type === 'error');

      // Some errors might be expected, but no critical crashes
      expect(jsErrors.every(e => !e.message.includes('Cannot read property'))).toBe(true);
    });

    test('Components should handle direct child removal', async ({ page }) => {
      await page.goto('/iframe.html?id=data-display-card--default');

      // Remove child elements directly
      await page.evaluate(() => {
        const card = document.querySelector('usa-card');
        if (card && card.firstElementChild) {
          card.firstElementChild.remove();
        }
      });

      // Component should remain stable
      const card = page.locator('usa-card').first();
      await expect(card).toBeVisible();

      // Should not throw critical errors
      const errors = await page.evaluate(() => window.errorLog);
      const criticalErrors = errors.filter(e =>
        e.type === 'error' && e.message.includes('Cannot')
      );
      expect(criticalErrors.length).toBe(0);
    });

    test('Components should handle attribute manipulation', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-alert--default');

      // Externally manipulate critical attributes
      await page.evaluate(() => {
        const alert = document.querySelector('usa-alert');
        if (alert) {
          alert.className = 'external-class-override';
          alert.setAttribute('role', 'invalid-role');
          alert.removeAttribute('aria-label');
        }
      });

      // Component should still be accessible
      const alert = page.locator('usa-alert').first();
      await expect(alert).toBeVisible();

      // Should maintain some level of functionality
      await expect(alert).toBeAttached();
    });
  });

  test.describe('Browser API Failures', () => {
    test('Components should handle localStorage failures', async ({ page }) => {
      // Mock localStorage failure
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => { throw new Error('localStorage not available'); },
            setItem: () => { throw new Error('localStorage not available'); },
            removeItem: () => { throw new Error('localStorage not available'); },
          },
          writable: false
        });
      });

      await page.goto('/iframe.html?id=forms-date-picker--default');

      // Component should still function without localStorage
      const datePicker = page.locator('usa-date-picker').first();
      await expect(datePicker).toBeVisible();

      // Should accept user input
      const input = page.locator('usa-date-picker input').first();
      await input.fill('01/15/2024');

      // No critical errors should occur
      const errors = await page.evaluate(() => window.errorLog);
      const storageErrors = errors.filter(e =>
        e.message && e.message.includes('localStorage not available')
      );

      // Storage errors might occur but shouldn't crash the component
      const criticalErrors = errors.filter(e =>
        e.type === 'error' && !e.message.includes('localStorage')
      );
      expect(criticalErrors.length).toBe(0);
    });

    test('Components should handle ResizeObserver failures', async ({ page }) => {
      // Mock ResizeObserver failure
      await page.addInitScript(() => {
        window.ResizeObserver = class {
          constructor() {
            throw new Error('ResizeObserver not supported');
          }
          observe() {}
          unobserve() {}
          disconnect() {}
        };
      });

      await page.goto('/iframe.html?id=feedback-modal--default');

      // Component should still render without ResizeObserver
      const modal = page.locator('usa-modal').first();
      await expect(modal).toBeAttached();

      // Should still be interactable
      const openButton = page.locator('button[data-open-modal]').first();
      if (await openButton.isVisible()) {
        await openButton.click();

        // Modal should open despite ResizeObserver failure
        await expect(modal).toBeVisible();
      }
    });

    test('Components should handle IntersectionObserver failures', async ({ page }) => {
      // Mock IntersectionObserver failure
      await page.addInitScript(() => {
        window.IntersectionObserver = class {
          constructor() {
            throw new Error('IntersectionObserver not supported');
          }
          observe() {}
          unobserve() {}
          disconnect() {}
        };
      });

      await page.goto('/iframe.html?id=navigation-in-page-navigation--default');

      // Component should still render
      const nav = page.locator('usa-in-page-navigation').first();
      await expect(nav).toBeVisible();

      // Navigation should still work manually
      const links = page.locator('usa-in-page-navigation a');
      if (await links.count() > 0) {
        await links.first().click();
        // Should not crash
        await expect(nav).toBeAttached();
      }
    });
  });

  test.describe('Memory Pressure and Performance Degradation', () => {
    test('Components should handle memory pressure', async ({ page }) => {
      await page.goto('/iframe.html?id=data-display-table--default');

      // Simulate memory pressure by creating many objects
      await page.evaluate(() => {
        const memoryPressure = [];
        for (let i = 0; i < 10000; i++) {
          memoryPressure.push(new Array(1000).fill(Math.random()));
        }

        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
      });

      // Component should still be responsive
      const table = page.locator('usa-table').first();
      await expect(table).toBeVisible();

      // Should handle user interactions
      const rows = page.locator('usa-table tbody tr');
      if (await rows.count() > 0) {
        await rows.first().click();
        await expect(table).toBeAttached();
      }
    });

    test('Components should handle excessive update cycles', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');

      // Trigger excessive updates
      await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (button) {
          // Rapidly change properties
          for (let i = 0; i < 1000; i++) {
            (button as any).variant = i % 2 === 0 ? 'primary' : 'secondary';
            (button as any).disabled = i % 3 === 0;
          }
        }
      });

      // Component should stabilize
      const button = page.locator('usa-button').first();
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();

      // Should not have crashed
      const errors = await page.evaluate(() => window.errorLog);
      const updateErrors = errors.filter(e =>
        e.message && e.message.includes('update') || e.message.includes('render')
      );
      expect(updateErrors.length).toBe(0);
    });
  });

  test.describe('Form Integration Error Recovery', () => {
    test('Form components should handle invalid form contexts', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-text-input--default');

      // Remove form context
      await page.evaluate(() => {
        const input = document.querySelector('usa-text-input');
        const form = input?.closest('form');
        if (form) {
          form.remove();
        }
      });

      // Component should still function
      const input = page.locator('usa-text-input input').first();
      await input.fill('test input');
      await expect(input).toHaveValue('test input');

      // Should handle form events gracefully
      await input.press('Enter');

      // No form submission errors should crash the component
      const textInput = page.locator('usa-text-input').first();
      await expect(textInput).toBeVisible();
    });

    test('Validation should handle corrupted validation state', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-text-input--default');

      // Corrupt validation state
      await page.evaluate(() => {
        const input = document.querySelector('usa-text-input');
        if (input) {
          // Set invalid validation properties
          (input as any).validity = null;
          (input as any).validationMessage = { toString: () => { throw new Error('Invalid validation'); } };
        }
      });

      // Component should still accept input
      const input = page.locator('usa-text-input input').first();
      await input.fill('validation test');

      // Trigger validation
      await input.blur();

      // Should not crash
      const textInput = page.locator('usa-text-input').first();
      await expect(textInput).toBeVisible();
    });
  });

  test.describe('Accessibility Feature Resilience', () => {
    test('Components should handle ARIA attribute corruption', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');

      // Corrupt ARIA attributes
      await page.evaluate(() => {
        const accordion = document.querySelector('usa-accordion');
        if (accordion) {
          accordion.setAttribute('aria-expanded', 'invalid-boolean');
          accordion.setAttribute('aria-controls', '');
          accordion.removeAttribute('role');
        }
      });

      // Component should still be somewhat accessible
      const accordion = page.locator('usa-accordion').first();
      await expect(accordion).toBeVisible();

      // Should still respond to keyboard navigation
      await accordion.press('Enter');
      await expect(accordion).toBeAttached();
    });

    test('Components should handle focus management errors', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-modal--default');

      // Mock focus method to throw errors
      await page.evaluate(() => {
        HTMLElement.prototype.focus = function() {
          throw new Error('Focus failed');
        };
      });

      // Try to open modal
      const openButton = page.locator('button[data-open-modal]').first();
      if (await openButton.isVisible()) {
        await openButton.click();

        // Modal should still open despite focus errors
        const modal = page.locator('usa-modal').first();
        await expect(modal).toBeVisible();
      }
    });
  });

  test.describe('Progressive Enhancement Failure', () => {
    test('Components should work when JavaScript features are disabled', async ({ page }) => {
      // Disable various JavaScript features
      await page.addInitScript(() => {
        // Disable custom elements
        delete window.customElements;

        // Disable modern DOM methods
        delete Element.prototype.closest;
        delete Element.prototype.matches;
      });

      await page.goto('/iframe.html?id=actions-button--default');

      // Basic HTML should still be present
      const button = page.locator('button, [role="button"]').first();
      await expect(button).toBeVisible();

      // Should be clickable at HTML level
      await button.click();
    });

    test('Components should degrade gracefully with limited CSS support', async ({ page }) => {
      // Disable CSS custom properties
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
          * {
            --usa-color-primary: initial !important;
            --usa-color-secondary: initial !important;
            color: black !important;
            background: white !important;
          }
        `;
        document.head.appendChild(style);
      });

      await page.goto('/iframe.html?id=feedback-alert--default');

      // Component should still be visible and readable
      const alert = page.locator('usa-alert').first();
      await expect(alert).toBeVisible();

      // Text should still be readable
      const text = await alert.textContent();
      expect(text?.length).toBeGreaterThan(0);
    });
  });

  test.afterEach(async ({ page }) => {
    // Log any errors that occurred during the test
    const errors = await page.evaluate(() => window.errorLog || []);
    if (errors.length > 0) {
      console.log('Errors logged during test:', errors);
    }
  });
});