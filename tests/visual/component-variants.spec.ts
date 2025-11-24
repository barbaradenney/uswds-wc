import { test, expect } from '@playwright/test';

/**
 * Visual Tests for Component Variants
 *
 * Tests all component variants and states to catch visual regressions.
 * Focus areas: component variants, states, responsive breakpoints
 */
test.describe('Component Visual Regression Tests', () => {
  // Button Component Visual Tests
  test.describe('Button Component', () => {
    test('should render all button variants correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      // Test primary button
      const button = page.locator('usa-button').first();
      await expect(button).toBeVisible();
      await expect(page).toHaveScreenshot('button-primary.png');

      // Test hover state
      await button.hover();
      await expect(page).toHaveScreenshot('button-default-hover.png');

      // Test focus state
      await button.focus();
      await expect(page).toHaveScreenshot('button-default-focus.png');
    });

    test('should render button variants correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--secondary');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('button-secondary.png');

      await page.goto('/iframe.html?id=actions-button--accent-cool');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('button-accent-cool.png');

      await page.goto('/iframe.html?id=actions-button--base');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('button-base.png');
    });

    test('should render disabled button correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');
      await page.waitForLoadState('networkidle');

      // Set button to disabled state via controls
      await page.locator('input[name="disabled"]').check();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('button-disabled.png');
    });
  });

  // Modal Component Visual Tests
  test.describe('Modal Component', () => {
    test('should render modal correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-modal--default');
      await page.waitForLoadState('networkidle');

      // Open modal
      const openButton = page.locator('button:has-text("Open Modal")').first();
      await openButton.click();
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Screenshot modal
      await expect(page).toHaveScreenshot('modal-open.png');

      // Test modal content area
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toHaveScreenshot('modal-content.png');
    });

    test('should render modal in different viewport sizes', async ({ page }) => {
      // Desktop view
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('/iframe.html?id=feedback-modal--default');
      await page.waitForLoadState('networkidle');

      const openButton = page.locator('button:has-text("Open Modal")').first();
      await openButton.click();
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      await expect(page).toHaveScreenshot('modal-desktop.png');

      // Tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page).toHaveScreenshot('modal-tablet.png');

      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page).toHaveScreenshot('modal-mobile.png');
    });
  });

  // Accordion Component Visual Tests
  test.describe('Accordion Component', () => {
    test('should render accordion states correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');
      await page.waitForLoadState('networkidle');

      // Closed state
      await expect(page).toHaveScreenshot('accordion-closed.png');

      // Open first item
      const firstButton = page.locator('.usa-accordion__button').first();
      await firstButton.click();
      await page.waitForTimeout(500); // Wait for animation
      await expect(page).toHaveScreenshot('accordion-first-open.png');

      // Open second item
      const secondButton = page.locator('.usa-accordion__button').nth(1);
      await secondButton.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('accordion-multiple-open.png');

      // Test hover state
      await firstButton.hover();
      await expect(page).toHaveScreenshot('accordion-button-hover.png');

      // Test focus state
      await firstButton.focus();
      await expect(page).toHaveScreenshot('accordion-button-focus.png');
    });
  });

  // Combo Box Component Visual Tests
  test.describe('Combo Box Component', () => {
    test('should render combo box states correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-combo-box--default');
      await page.waitForLoadState('networkidle');

      // Closed state
      await expect(page).toHaveScreenshot('combo-box-closed.png');

      // Open dropdown
      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.click();
      await page.waitForSelector('.usa-combo-box__list:not([hidden])');
      await expect(page).toHaveScreenshot('combo-box-open.png');

      // Test with filter input
      const input = page.locator('.usa-combo-box__input');
      await input.fill('ap');
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot('combo-box-filtered.png');

      // Test focus states
      await input.focus();
      await expect(page).toHaveScreenshot('combo-box-input-focus.png');
    });

    test('should render combo box in different viewport sizes', async ({ page }) => {
      // Desktop
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('/iframe.html?id=forms-combo-box--default');
      await page.waitForLoadState('networkidle');

      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.click();
      await page.waitForSelector('.usa-combo-box__list:not([hidden])');
      await expect(page).toHaveScreenshot('combo-box-desktop.png');

      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page).toHaveScreenshot('combo-box-mobile.png');
    });
  });

  // Alert Component Visual Tests
  test.describe('Alert Component', () => {
    test('should render all alert variants correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-alert--default');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('alert-default.png');

      await page.goto('/iframe.html?id=feedback-alert--info');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('alert-info.png');

      await page.goto('/iframe.html?id=feedback-alert--warning');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('alert-warning.png');

      await page.goto('/iframe.html?id=feedback-alert--error');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('alert-error.png');

      await page.goto('/iframe.html?id=feedback-alert--success');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('alert-success.png');
    });

    test('should render alert with close button correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-alert--with-close-button');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('alert-with-close.png');

      // Test hover state on close button
      const closeButton = page.locator('.usa-alert__close-button');
      await closeButton.hover();
      await expect(page).toHaveScreenshot('alert-close-hover.png');
    });
  });

  // Card Component Visual Tests
  test.describe('Card Component', () => {
    test('should render card variants correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=data-display-card--default');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('card-default.png');

      await page.goto('/iframe.html?id=data-display-card--with-media');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('card-with-media.png');

      await page.goto('/iframe.html?id=data-display-card--header-first');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('card-header-first.png');
    });

    test('should render card responsively', async ({ page }) => {
      await page.goto('/iframe.html?id=data-display-card--default');
      await page.waitForLoadState('networkidle');

      // Desktop
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page).toHaveScreenshot('card-desktop.png');

      // Tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page).toHaveScreenshot('card-tablet.png');

      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page).toHaveScreenshot('card-mobile.png');
    });
  });

  // Banner Component Visual Tests
  test.describe('Banner Component', () => {
    test('should render banner correctly', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-banner--default');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('banner-default.png');

      // Test expanded state
      const button = page.locator('.usa-banner__button');
      await button.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('banner-expanded.png');
    });

    test('should render banner responsively', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-banner--default');
      await page.waitForLoadState('networkidle');

      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page).toHaveScreenshot('banner-mobile.png');

      // Desktop view
      await page.setViewportSize({ width: 1200, height: 800 });
      await expect(page).toHaveScreenshot('banner-desktop.png');
    });
  });
});