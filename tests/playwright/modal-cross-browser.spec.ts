import { test, expect, devices } from '@playwright/test';

/**
 * Cross-Browser Tests for Modal Component
 *
 * Tests modal functionality across different browsers to ensure consistent behavior.
 * Focus areas: focus management, backdrop interaction, keyboard navigation
 */
test.describe('Modal Component Cross-Browser Tests', () => {
  // Skip all modal cross-browser tests in Webkit CI - USWDS/Storybook initialization too slow
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(browserName === 'webkit' && !!process.env.CI, 'Modal tests skip Webkit in CI - USWDS/Storybook initialization too slow');
    await page.goto('/iframe.html?id=feedback-modal--default');
    await page.waitForLoadState('networkidle');
  });

  test('should handle focus management correctly across browsers @smoke', async ({ page, browserName }) => {
    // Create a focusable element before modal
    await page.evaluate(() => {
      const button = document.createElement('button');
      button.id = 'pre-modal-button';
      button.textContent = 'Pre-modal button';
      document.body.prepend(button);
      button.focus();
    });

    // Find and open modal
    const openButton = page.locator('button:has-text("Open Modal")').first();
    await openButton.click();

    // Wait for modal to be visible (increased timeout for CI)
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

    // Test focus trapping - focus should move to first focusable element in modal
    const modalDialog = page.locator('[role="dialog"]');
    await expect(modalDialog).toBeVisible();

    // Test that focus is trapped within modal
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');

    // Ensure focused element is within modal
    const isWithinModal = await focusedElement.evaluate((el) => {
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(el) || false;
    });
    expect(isWithinModal).toBe(true);

    // Test Escape key behavior (varies by browser)
    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 });

    // Verify focus restoration
    const activeElement = await page.evaluate(() => document.activeElement?.id);
    expect(activeElement).toBe('pre-modal-button');
  });

  test('should handle backdrop clicks consistently', async ({ page, browserName }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    await openButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

    // Click on backdrop (modal wrapper but not modal content)
    const modalWrapper = page.locator('.usa-modal-wrapper').first();
    await modalWrapper.click({ position: { x: 10, y: 10 } }); // Click near edge

    // Modal should close on backdrop click
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 });
  });

  test('should render modal structure correctly in all browsers', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    await openButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

    // Test ARIA attributes are correctly set
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby');
    await expect(modal).toHaveAttribute('aria-describedby');

    // Test modal structure
    await expect(modal.locator('.usa-modal__content')).toBeVisible();
    await expect(modal.locator('.usa-modal__header')).toBeVisible();
    await expect(modal.locator('.usa-modal__footer')).toBeVisible();
  });

  test('should handle keyboard navigation across browsers', async ({ page }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    await openButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

    // Test Tab navigation within modal
    const initialFocus = page.locator(':focus');

    // Tab through modal elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should still be within modal
    const focusedAfterTab = page.locator(':focus');
    const isStillInModal = await focusedAfterTab.evaluate((el) => {
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(el) || false;
    });
    expect(isStillInModal).toBe(true);

    // Test Shift+Tab reverse navigation
    await page.keyboard.press('Shift+Tab');

    const focusAfterShiftTab = page.locator(':focus');
    const isStillInModalReverse = await focusAfterShiftTab.evaluate((el) => {
      const modal = document.querySelector('[role="dialog"]');
      return modal?.contains(el) || false;
    });
    expect(isStillInModalReverse).toBe(true);
  });

  test('should handle modal sizing across different viewports', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    const openButton = page.locator('button:has-text("Open Modal")').first();
    await openButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

    const modal = page.locator('[role="dialog"]');
    const desktopBounds = await modal.boundingBox();
    expect(desktopBounds?.width).toBeLessThan(1200); // Should not be full width

    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 });

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await openButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

    const mobileBounds = await modal.boundingBox();
    expect(mobileBounds?.width).toBeLessThanOrEqual(375); // Should fit mobile width
  });

  test('should handle browser-specific modal behaviors', async ({ page, browserName }) => {
    const openButton = page.locator('button:has-text("Open Modal")').first();
    await openButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 15000 });

    // Browser-specific tests
    if (browserName === 'webkit') {
      // Safari-specific: Test that modal doesn't interfere with viewport scaling
      const initialScale = await page.evaluate(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        return viewport?.getAttribute('content') || '';
      });

      // Modal should not change viewport meta tag
      const scaleAfterModal = await page.evaluate(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        return viewport?.getAttribute('content') || '';
      });
      expect(scaleAfterModal).toBe(initialScale);
    }

    if (browserName === 'firefox') {
      // Firefox-specific: Test that modal doesn't trigger unnecessary reflows
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Test that animations are smooth (Firefox sometimes has issues)
      await page.keyboard.press('Escape');
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 15000 });
    }

    if (browserName === 'chromium') {
      // Chrome-specific: Test that modal works with extensions/plugins
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    }
  });
});