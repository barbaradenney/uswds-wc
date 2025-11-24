import { test, expect } from '@playwright/test';

/**
 * Modal Browser Tests
 *
 * These tests require a real browser environment because:
 * - Event dispatching needs real browser event system
 * - ARIA associations created by USWDS dynamically
 * - Modal DOM transformations happen in browser
 *
 * Tests migrated from: src/components/modal/usa-modal.regression.test.ts
 */

test.describe('Modal Interactive Tests (Browser Required)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=feedback-modal--default&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('should dispatch modal-primary-action event when primary button is clicked', async ({ page }) => {
    const modal = page.locator('usa-modal');

    // Listen for custom event
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        document.querySelector('usa-modal')?.addEventListener('modal-primary-action', () => {
          resolve(true);
        });
      });
    });

    // Open modal
    await modal.evaluate((el: any) => el.openModal());
    await page.waitForTimeout(200);

    // Click primary button
    const primaryButton = page.locator('.usa-modal__footer .usa-button:not(.usa-button--unstyled)').first();
    await primaryButton.click();

    // Event should fire
    const eventFired = await Promise.race([
      eventPromise,
      page.waitForTimeout(1000).then(() => false)
    ]);

    expect(eventFired).toBe(true);
  });

  test('should dispatch modal-secondary-action event when secondary button is clicked', async ({ page }) => {
    const modal = page.locator('usa-modal');

    // Listen for custom event
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        document.querySelector('usa-modal')?.addEventListener('modal-secondary-action', () => {
          resolve(true);
        });
      });
    });

    // Open modal
    await modal.evaluate((el: any) => el.openModal());
    await page.waitForTimeout(200);

    // Click secondary button if it exists
    const secondaryButton = page.locator('.usa-modal__footer .usa-button').nth(1);
    if (await secondaryButton.count() > 0) {
      await secondaryButton.click();

      const eventFired = await Promise.race([
        eventPromise,
        page.waitForTimeout(1000).then(() => false)
      ]);

      expect(eventFired).toBe(true);
    }
  });

  test('should have proper heading and description association', async ({ page }) => {
    const modal = page.locator('usa-modal');

    // Open modal
    await modal.evaluate((el: any) => {
      el.heading = 'Test Heading';
      el.description = 'Test Description';
      el.openModal();
    });
    await page.waitForTimeout(200);

    // Check ARIA associations
    const modalDialog = page.locator('.usa-modal');
    await expect(modalDialog).toHaveAttribute('aria-labelledby');
    await expect(modalDialog).toHaveAttribute('aria-describedby');

    // Verify IDs match
    const labelledBy = await modalDialog.getAttribute('aria-labelledby');
    const describedBy = await modalDialog.getAttribute('aria-describedby');

    const heading = page.locator(`#${labelledBy}`);
    const description = page.locator(`#${describedBy}`);

    await expect(heading).toBeVisible();
    await expect(description).toBeVisible();
  });
});
