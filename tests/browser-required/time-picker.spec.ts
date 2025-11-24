import { test, expect } from '@playwright/test';

/**
 * Time Picker Browser Tests
 *
 * These tests require a real browser environment because:
 * - USWDS combo-box enhancement creates toggle buttons dynamically
 * - USWDS creates dropdown lists and time options via JavaScript
 * - Full DOM APIs needed for USWDS transformation
 *
 * Tests migrated from: __tests__/time-picker-dom-validation.test.ts
 */

test.describe('Time Picker DOM Structure (Browser Required)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Storybook story for time picker
    await page.goto('http://localhost:6006/iframe.html?id=forms-time-picker--default&viewMode=story');
    await page.waitForLoadState('networkidle');

    // Wait for USWDS to initialize
    await page.waitForTimeout(500);
  });

  test('should render complete USWDS time picker structure', async ({ page }) => {
    const timePicker = page.locator('usa-time-picker');
    await expect(timePicker).toBeVisible();

    // Check for USWDS-created elements
    const comboBox = timePicker.locator('.usa-time-picker');
    await expect(comboBox).toBeVisible();

    const input = timePicker.locator('.usa-combo-box__input');
    await expect(input).toBeVisible();
  });

  test('should have dropdown toggle button', async ({ page }) => {
    const timePicker = page.locator('usa-time-picker');

    // USWDS creates this button via JavaScript
    const toggleButton = timePicker.locator('.usa-combo-box__toggle-list');
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toHaveAttribute('type', 'button');
  });

  test('should have time list container', async ({ page }) => {
    const timePicker = page.locator('usa-time-picker');

    // USWDS creates the dropdown list
    const timeList = timePicker.locator('.usa-combo-box__list');
    await expect(timeList).toBeAttached();
  });

  test('should have proper ARIA attributes on input', async ({ page }) => {
    const timePicker = page.locator('usa-time-picker');
    const input = timePicker.locator('.usa-combo-box__input');

    await expect(input).toHaveAttribute('aria-controls');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await expect(input).toHaveAttribute('role', 'combobox');
  });

  test('should have proper ARIA attributes on toggle button', async ({ page }) => {
    const timePicker = page.locator('usa-time-picker');
    const button = timePicker.locator('.usa-combo-box__toggle-list');

    await expect(button).toHaveAttribute('aria-label');
    await expect(button).toHaveAttribute('type', 'button');
  });

  test('should have role on time list', async ({ page }) => {
    const timePicker = page.locator('usa-time-picker');
    const timeList = timePicker.locator('.usa-combo-box__list');

    await expect(timeList).toHaveAttribute('role', 'listbox');
  });

  test('should have disabled attribute on button when disabled', async ({ page }) => {
    // Navigate to disabled story
    await page.goto('http://localhost:6006/iframe.html?id=forms-time-picker--disabled&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const timePicker = page.locator('usa-time-picker');
    const button = timePicker.locator('.usa-combo-box__toggle-list');

    await expect(button).toBeDisabled();
  });

  test('should open dropdown when toggle button clicked', async ({ page }) => {
    const timePicker = page.locator('usa-time-picker');
    const toggleButton = timePicker.locator('.usa-combo-box__toggle-list');
    const timeList = timePicker.locator('.usa-combo-box__list');

    // Initially hidden
    await expect(timeList).toBeHidden();

    // Click to open
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Should be visible
    await expect(timeList).toBeVisible();
  });
});
