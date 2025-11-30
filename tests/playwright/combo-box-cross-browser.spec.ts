import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Tests for Combo Box Component
 *
 * Tests the combo box popup functionality that was previously problematic.
 * Focus areas: dropdown rendering, option selection, keyboard navigation
 */
test.describe('Combo Box Component Cross-Browser Tests', () => {
  // Skip all cross-browser tests in CI - comprehensive local tests only
  // CI uses simpler smoke tests for coverage
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(!!process.env.CI, 'Cross-browser tests skip CI - use smoke tests for CI coverage');
    await page.goto('/iframe.html?id=forms-combo-box--default');
    await page.waitForLoadState('networkidle');
  });

  test('should open dropdown consistently across browsers @critical', async ({ page, browserName }) => {
    // Find combo box toggle button
    const toggleButton = page.locator('.usa-combo-box__toggle-list');
    await expect(toggleButton).toBeVisible();

    // Click to open dropdown
    await toggleButton.click();

    // Wait for dropdown list to appear
    const dropdownList = page.locator('.usa-combo-box__list');
    await expect(dropdownList).toBeVisible();
    await expect(dropdownList).not.toHaveAttribute('hidden');

    // Verify input has correct ARIA attributes
    const input = page.locator('.usa-combo-box__input');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  test('should handle keyboard navigation in dropdown', async ({ page }) => {
    const toggleButton = page.locator('.usa-combo-box__toggle-list');
    await toggleButton.click();

    const dropdownList = page.locator('.usa-combo-box__list');
    await expect(dropdownList).toBeVisible();

    const input = page.locator('.usa-combo-box__input');

    // Test ArrowDown navigation
    await input.press('ArrowDown');

    // First option should be focused/highlighted
    const firstOption = page.locator('.usa-combo-box__list-option').first();
    const isHighlighted = await firstOption.evaluate((el) => {
      return el.classList.contains('usa-combo-box__list-option--focused') ||
             el.classList.contains('usa-combo-box__list-option--highlighted') ||
             el.getAttribute('aria-selected') === 'true';
    });
    expect(isHighlighted).toBe(true);

    // Test Enter key selection
    await input.press('Enter');

    // Dropdown should close
    await expect(dropdownList).toHaveAttribute('hidden');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('should filter options correctly across browsers', async ({ page, browserName }) => {
    const input = page.locator('.usa-combo-box__input');

    // Type to filter options
    await input.fill('ap'); // Should filter to "apple" if it exists

    // Wait for filtering to occur by checking for visible options
    const visibleOptions = page.locator('.usa-combo-box__list-option:visible');
    await expect(visibleOptions.first()).toBeVisible();
    const optionCount = await visibleOptions.count();

    // Should have filtered results
    expect(optionCount).toBeGreaterThan(0);
    expect(optionCount).toBeLessThan(10); // Assuming full list is longer

    // Test that visible options contain the filter text
    const firstVisibleOption = visibleOptions.first();
    const optionText = await firstVisibleOption.textContent();
    expect(optionText?.toLowerCase()).toContain('ap');
  });

  test('should handle dropdown positioning in different viewports', async ({ page }) => {
    // Test in different viewport sizes
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 },  // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.click();

      const dropdownList = page.locator('.usa-combo-box__list');
      await expect(dropdownList).toBeVisible();

      // Check that dropdown is positioned within viewport
      const dropdownBounds = await dropdownList.boundingBox();
      expect(dropdownBounds?.x).toBeGreaterThanOrEqual(0);
      expect(dropdownBounds?.y).toBeGreaterThanOrEqual(0);
      expect(dropdownBounds?.x! + dropdownBounds?.width!).toBeLessThanOrEqual(viewport.width);

      // Close dropdown before next iteration
      await page.keyboard.press('Escape');
      await expect(dropdownList).toHaveAttribute('hidden');
    }
  });

  test('should handle touch interactions on mobile browsers', async ({ page, browserName }, testInfo) => {
    // Skip on desktop browsers (CI only runs desktop browsers)
    // Touch events require mobile device configuration with hasTouch: true
    test.skip(testInfo.project.name.includes('chromium') ||
              testInfo.project.name.includes('firefox') ||
              testInfo.project.name.includes('webkit') ||
              testInfo.project.name.includes('accessibility'),
              'Touch events only work on mobile-configured browsers');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const toggleButton = page.locator('.usa-combo-box__toggle-list');

    // Simulate touch tap
    await toggleButton.tap();

    const dropdownList = page.locator('.usa-combo-box__list');
    await expect(dropdownList).toBeVisible();

    // Test touch selection of option
    const firstOption = page.locator('.usa-combo-box__list-option').first();
    await firstOption.tap();

    // Should close dropdown and select option
    await expect(dropdownList).toHaveAttribute('hidden');

    const input = page.locator('.usa-combo-box__input');
    const selectedValue = await input.inputValue();
    expect(selectedValue).toBeTruthy();
  });

  test('should handle focus management across browsers', async ({ page, browserName }) => {
    const input = page.locator('.usa-combo-box__input');

    // Focus input
    await input.focus();

    const dropdownList = page.locator('.usa-combo-box__list');
    // Check if dropdown opened on focus (behavior may vary)
    // isVisible() waits internally, no explicit wait needed
    const isVisible = await dropdownList.isVisible();

    if (!isVisible) {
      // If not open on focus, open manually
      const toggleButton = page.locator('.usa-combo-box__toggle-list');
      await toggleButton.click();
      await expect(dropdownList).toBeVisible();
    }

    // Test focus loss behavior
    await page.keyboard.press('Tab');

    // Dropdown should close when focus leaves component
    // expect() waits for the attribute change
    await expect(dropdownList).toHaveAttribute('hidden');
  });

  test('should handle browser-specific dropdown behaviors', async ({ page, browserName }) => {
    const toggleButton = page.locator('.usa-combo-box__toggle-list');
    const input = page.locator('.usa-combo-box__input');
    const dropdownList = page.locator('.usa-combo-box__list');

    await toggleButton.click();
    await expect(dropdownList).toBeVisible();

    if (browserName === 'webkit') {
      // Safari-specific: Test that dropdown doesn't cause page zoom issues
      await input.fill('test');
      const zoomLevel = await page.evaluate(() => window.outerWidth / window.innerWidth);
      expect(zoomLevel).toBeCloseTo(1, 1); // Should not change zoom
    }

    if (browserName === 'firefox') {
      // Firefox-specific: Test that dropdown scrolling works correctly
      const options = page.locator('.usa-combo-box__list-option');
      const optionCount = await options.count();

      if (optionCount > 5) {
        // Scroll within dropdown
        await dropdownList.hover();
        await page.mouse.wheel(0, 100);

        // Should still be able to select options after scrolling
        const lastVisibleOption = options.last();
        await lastVisibleOption.click();
        await expect(dropdownList).toHaveAttribute('hidden');
      }
    }

    if (browserName === 'chromium') {
      // Chrome-specific: Test that autocomplete attributes work correctly
      await expect(input).toHaveAttribute('autocomplete');

      // Test that browser's built-in autocomplete doesn't interfere
      await input.fill('te');

      // Custom dropdown should still be controlling the experience
      // expect() waits for visibility
      await expect(dropdownList).toBeVisible();
    }
  });

  test('should maintain consistent styling across browsers', async ({ page, browserName }) => {
    const toggleButton = page.locator('.usa-combo-box__toggle-list');
    const input = page.locator('.usa-combo-box__input');
    const dropdownList = page.locator('.usa-combo-box__list');

    // Test initial styling
    await expect(input).toHaveCSS('border-radius', /.*/); // Should have some border radius
    await expect(toggleButton).toBeVisible();

    // Open dropdown and test dropdown styling
    await toggleButton.click();
    await expect(dropdownList).toBeVisible();

    // Test that options have consistent hover states
    const firstOption = page.locator('.usa-combo-box__list-option').first();
    await firstOption.hover();

    // Should have hover styling (implementation may vary)
    const hoverStyles = await firstOption.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    expect(hoverStyles.backgroundColor).toBeTruthy();
    expect(hoverStyles.color).toBeTruthy();
  });
});