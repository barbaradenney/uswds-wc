import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Cross-Browser Accessibility Tests
 *
 * Tests accessibility compliance across different browsers and assistive technologies.
 * Focus areas: ARIA compliance, keyboard navigation, screen reader compatibility
 */
test.describe('Cross-Browser Accessibility Tests', () => {

  test.describe('Modal Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-modal--default');
      await page.waitForLoadState('networkidle');
      // Wait for USWDS to initialize modal (especially slow in Webkit)
      await page.waitForSelector('button:has-text("Open Modal")', { state: 'visible', timeout: 10000 });
      // Additional wait for USWDS JS to fully initialize
      await page.waitForTimeout(1000);
    });

    test('should pass axe accessibility tests in all browsers @a11y @critical', async ({ page }) => {
      // Test closed modal first
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);

      // Wait for button to be interactive before clicking
      const openButton = page.locator('button:has-text("Open Modal")').first();
      await openButton.waitFor({ state: 'visible', timeout: 10000 });
      await openButton.click();
      // Increase timeout for modal to appear (USWDS initialization + animation)
      await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

      const modalAccessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(modalAccessibilityResults.violations).toEqual([]);
    });

    test('should have correct ARIA modal structure', async ({ page }) => {
      // Wait for button to be interactive before clicking
      const openButton = page.locator('button:has-text("Open Modal")').first();
      await openButton.waitFor({ state: 'visible', timeout: 10000 });
      await openButton.click();
      // Increase timeout for modal to appear (USWDS initialization + animation)
      await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

      // Use .first() to handle potential multiple modals from previous tests
      const modal = page.locator('[role="dialog"]').first();

      // Test required ARIA attributes
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal).toHaveAttribute('aria-labelledby');
      await expect(modal).toHaveAttribute('aria-describedby');

      // Test that labelledby and describedby point to existing elements
      const labelledBy = await modal.getAttribute('aria-labelledby');
      const describedBy = await modal.getAttribute('aria-describedby');

      if (labelledBy) {
        await expect(page.locator(`#${labelledBy}`)).toBeVisible();
      }
      if (describedBy) {
        await expect(page.locator(`#${describedBy}`)).toBeVisible();
      }
    });
  });

  test.describe('Combo Box Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/iframe.html?id=forms-combo-box--default');
      await page.waitForLoadState('networkidle');
      // Wait for USWDS to transform select into combo box (especially slow in Webkit)
      await page.waitForSelector('.usa-combo-box__input', { state: 'visible', timeout: 10000 });
      // Additional wait for USWDS JS to fully initialize combo box
      await page.waitForTimeout(1000);
    });

    test('should pass axe accessibility tests @a11y', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);

      // Test with dropdown open - wait for toggle button to be interactive
      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.waitFor({ state: 'visible', timeout: 10000 });
      await toggleButton.click();
      await page.waitForSelector('.usa-combo-box__list:not([hidden])');

      const openAccessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(openAccessibilityResults.violations).toEqual([]);
    });

    test('should have correct ARIA combobox pattern', async ({ page }) => {
      // Wait for USWDS transformation to complete before checking attributes
      const input = page.locator('.usa-combo-box__input');
      await input.waitFor({ state: 'visible', timeout: 10000 });

      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.waitFor({ state: 'visible', timeout: 10000 });

      const listbox = page.locator('.usa-combo-box__list');

      // Test ARIA attributes
      await expect(input).toHaveAttribute('role', 'combobox');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
      await expect(input).toHaveAttribute('aria-autocomplete');

      // Test relationship attributes
      const ariaControls = await input.getAttribute('aria-controls');
      if (ariaControls) {
        await expect(page.locator(`#${ariaControls}`)).toBeVisible();
      }

      // Open dropdown and test expanded state
      await toggleButton.click();

      // Wait for listbox to become visible (USWDS JS removes hidden attribute)
      await expect(listbox).not.toHaveAttribute('hidden', '');
      await expect(listbox).toBeVisible();

      await expect(input).toHaveAttribute('aria-expanded', 'true');
      await expect(listbox).toHaveAttribute('role', 'listbox');

      // Test option roles
      const options = page.locator('.usa-combo-box__list-option');
      const optionCount = await options.count();
      if (optionCount > 0) {
        await expect(options.first()).toHaveAttribute('role', 'option');
      }
    });
  });

  test.describe('Accordion Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');
      await page.waitForLoadState('networkidle');
    });

    test('should pass axe accessibility tests @a11y', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);

      // Test with first item expanded
      const firstButton = page.locator('.usa-accordion__button').first();
      await firstButton.click();

      const expandedAccessibilityResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(expandedAccessibilityResults.violations).toEqual([]);
    });

    test('should have correct ARIA accordion pattern', async ({ page }) => {
      const buttons = page.locator('.usa-accordion__button');
      const contents = page.locator('.usa-accordion__content');

      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);

      // Test first accordion item
      const firstButton = buttons.first();
      const firstContent = contents.first();

      // Test ARIA attributes
      await expect(firstButton).toHaveAttribute('aria-expanded', 'false');

      const ariaControls = await firstButton.getAttribute('aria-controls');
      expect(ariaControls).toBeTruthy();

      const contentId = await firstContent.getAttribute('id');
      expect(ariaControls).toBe(contentId);

      // Test expanded state
      await firstButton.click();
      await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('Keyboard Navigation Accessibility', () => {
    test('should support Tab navigation across components @a11y', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');
      await page.waitForLoadState('networkidle');

      // Wait for first focusable element to exist before Tab navigation
      await page.waitForSelector('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])', { timeout: 5000 });

      // Start from first focusable element
      await page.keyboard.press('Tab');

      let focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Continue tabbing through elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        focusedElement = page.locator(':focus');

        // Each focused element should be visible and interactive
        await expect(focusedElement).toBeVisible();

        const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
        const isInteractive = ['button', 'input', 'select', 'textarea', 'a'].includes(tagName) ||
                            await focusedElement.getAttribute('tabindex') !== null;

        expect(isInteractive).toBe(true);
      }
    });

    test('should support Shift+Tab reverse navigation @a11y', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-modal--default');
      await page.waitForLoadState('networkidle');

      // Wait for USWDS to initialize modal
      await page.waitForSelector('button:has-text("Open Modal")', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1000);

      // Open modal to test focus trapping - wait for button to be interactive
      const openButton = page.locator('button:has-text("Open Modal")').first();
      await openButton.waitFor({ state: 'visible', timeout: 10000 });
      await openButton.click();
      // Increase timeout for modal to appear (USWDS initialization + animation)
      await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

      // Tab forward through modal elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Then tab backward
      await page.keyboard.press('Shift+Tab');

      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Focus should still be within modal
      const isWithinModal = await focusedElement.evaluate((el) => {
        const modal = document.querySelector('[role="dialog"]');
        return modal?.contains(el) || false;
      });
      expect(isWithinModal).toBe(true);
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should provide appropriate labels and descriptions @a11y', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-combo-box--default');
      await page.waitForLoadState('networkidle');

      // Test that form elements have labels
      const input = page.locator('.usa-combo-box__input');

      // Check for label association
      const inputId = await input.getAttribute('id');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const ariaLabel = await input.getAttribute('aria-label');

      // Should have some form of labeling
      const hasLabel = inputId ?
        await page.locator(`label[for="${inputId}"]`).count() > 0 :
        false;
      const hasAriaLabel = ariaLabelledBy || ariaLabel;

      expect(hasLabel || hasAriaLabel).toBe(true);
    });

    test('should announce state changes appropriately @a11y', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');
      await page.waitForLoadState('networkidle');

      const firstButton = page.locator('.usa-accordion__button').first();

      // Test that aria-expanded changes are announced
      await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
      await firstButton.click();
      await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

      // Test for live regions if they exist
      const liveRegions = page.locator('[aria-live]');
      const liveRegionCount = await liveRegions.count();

      if (liveRegionCount > 0) {
        // If live regions exist, they should have appropriate politeness levels
        for (let i = 0; i < liveRegionCount; i++) {
          const liveRegion = liveRegions.nth(i);
          const ariaLive = await liveRegion.getAttribute('aria-live');
          expect(['polite', 'assertive', 'off']).toContain(ariaLive);
        }
      }
    });
  });

  test.describe('High Contrast and Visual Accessibility', () => {
    test('should maintain accessibility in high contrast mode @a11y', async ({ page, browserName }) => {
      // Skip for browsers that don't support forced-colors
      if (browserName === 'webkit') {
        test.skip('Safari does not support forced-colors media query');
      }

      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      // Emulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

      // Test that interactive elements are still visible and accessible
      const button = page.locator('.usa-button').first();
      await expect(button).toBeVisible();

      // Test focus indicators are still visible
      await button.focus();

      const focusStyles = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          border: styles.border,
        };
      });

      // Should have some form of focus indication
      const hasFocusIndicator = focusStyles.outline !== 'none' ||
                              focusStyles.boxShadow !== 'none' ||
                              focusStyles.border !== 'none';
      expect(hasFocusIndicator).toBe(true);
    });

    test('should support reduced motion preferences @a11y', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');

      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForLoadState('networkidle');

      const firstButton = page.locator('.usa-accordion__button').first();
      const firstContent = page.locator('.usa-accordion__content').first();

      // Expand accordion
      await firstButton.click();
      await expect(firstContent).toBeVisible();

      // In reduced motion mode, animations should be minimal or disabled
      const animationDuration = await firstContent.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.animationDuration) || 0;
      });

      // Animation should be very short or zero in reduced motion mode
      expect(animationDuration).toBeLessThan(0.5);
    });
  });

  test.describe('Color Contrast Accessibility', () => {
    test('should maintain sufficient color contrast @a11y', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      // Run axe-core with specific focus on color contrast
      const accessibilityResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      expect(accessibilityResults.violations).toEqual([]);

      // Test hover states
      const button = page.locator('.usa-button').first();
      await button.hover();

      const hoverResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      expect(hoverResults.violations).toEqual([]);

      // Test focus states
      await button.focus();

      const focusResults = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze();

      expect(focusResults.violations).toEqual([]);
    });
  });
});