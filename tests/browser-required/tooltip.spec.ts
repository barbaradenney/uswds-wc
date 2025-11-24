import { test, expect } from '@playwright/test';

/**
 * Tooltip Browser Tests
 *
 * These tests require a real browser environment because:
 * - USWDS creates tooltip body elements dynamically
 * - USWDS creates trigger wrappers via JavaScript
 * - Positioning calculations need real browser layout engine
 *
 * Tests migrated from: __tests__/tooltip-dom-validation.test.ts
 */

test.describe('Tooltip DOM Structure (Browser Required)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Storybook story for tooltip
    await page.goto('http://localhost:6006/iframe.html?id=feedback-tooltip--default&viewMode=story');
    await page.waitForLoadState('networkidle');

    // Wait for USWDS to initialize
    await page.waitForTimeout(500);
  });

  test('should render complete USWDS tooltip structure', async ({ page }) => {
    const tooltip = page.locator('usa-tooltip');
    await expect(tooltip).toBeVisible();

    // USWDS creates these elements
    const tooltipBody = page.locator('.usa-tooltip__body');
    await expect(tooltipBody).toBeAttached();
  });

  test('should have tooltip trigger', async ({ page }) => {
    const tooltip = page.locator('usa-tooltip');

    // USWDS wraps trigger content
    const trigger = tooltip.locator('.usa-tooltip__trigger');
    await expect(trigger).toBeAttached();
  });

  test('should have tooltip body', async ({ page }) => {
    // USWDS creates tooltip body
    const body = page.locator('.usa-tooltip__body');
    await expect(body).toBeAttached();
  });

  test('should have top position class', async ({ page }) => {
    // Navigate to top position story
    await page.goto('http://localhost:6006/iframe.html?id=feedback-tooltip--position-top&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const body = page.locator('.usa-tooltip__body');
    await expect(body).toHaveClass(/usa-tooltip__body--top/);
  });

  test('should have bottom position class', async ({ page }) => {
    // Navigate to bottom position story
    await page.goto('http://localhost:6006/iframe.html?id=feedback-tooltip--position-bottom&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const body = page.locator('.usa-tooltip__body');
    await expect(body).toHaveClass(/usa-tooltip__body--bottom/);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const trigger = page.locator('.usa-tooltip__trigger');
    await expect(trigger).toHaveAttribute('aria-describedby');
  });

  test('should have role on tooltip body', async ({ page }) => {
    const body = page.locator('.usa-tooltip__body');
    await expect(body).toHaveAttribute('role', 'tooltip');
  });

  test('should show tooltip on hover', async ({ page }) => {
    const trigger = page.locator('.usa-tooltip__trigger');
    const body = page.locator('.usa-tooltip__body');

    // Initially hidden
    await expect(body).toHaveClass(/usa-tooltip__body--hidden/);

    // Hover to show
    await trigger.hover();
    await page.waitForTimeout(100);

    // Should be visible
    await expect(body).not.toHaveClass(/usa-tooltip__body--hidden/);
  });

  test('should show tooltip on focus', async ({ page }) => {
    const trigger = page.locator('.usa-tooltip__trigger');
    const body = page.locator('.usa-tooltip__body');

    // Focus trigger
    await trigger.focus();
    await page.waitForTimeout(100);

    // Should be visible
    await expect(body).not.toHaveClass(/usa-tooltip__body--hidden/);
  });
});
