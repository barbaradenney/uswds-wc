import { test, expect } from '@playwright/test';

/**
 * Icon Visual Regression Tests
 *
 * These Playwright tests catch visual regressions in icon rendering:
 * 1. Sprite vs inline SVG rendering (caught monorepo migration bug)
 * 2. Icon size variations
 * 3. Icon accessibility
 *
 * CRITICAL: These prevent regressions like the sprite-first architecture being reverted
 */

test.describe('Icon Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Icon component in Storybook
    await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');
    await page.waitForLoadState('networkidle');
  });

  test('should render icons from sprite file (not inline SVG)', async ({ page }) => {
    // REGRESSION TEST: Monorepo migration (Oct 22) reverted sprite-first architecture
    // This test ensures icons use <use> element with sprite reference

    // Get the icon component
    const icon = page.locator('usa-icon').first();
    await expect(icon).toBeVisible();

    // Check SVG structure
    const svg = icon.locator('svg');
    await expect(svg).toHaveClass(/usa-icon/);

    // CRITICAL: Must use <use> element, not inline <path>
    const useElement = svg.locator('use');
    await expect(useElement).toBeVisible();

    // Verify sprite reference
    const href = await useElement.getAttribute('href');
    expect(href).toMatch(/\/img\/sprite\.svg#/);

    // FAIL CONDITION: Should NOT have inline <path> elements
    const pathElements = await svg.locator('path').count();
    expect(pathElements).toBe(0);
  });

  test('should render all USWDS icon sizes correctly', async ({ page }) => {
    const sizes = ['3', '4', '5', '6', '7', '8', '9'];

    for (const size of sizes) {
      // Navigate to size variant
      await page.goto(`http://localhost:6006/?path=/story/data-display-icon--size-${size}`);
      await page.waitForLoadState('networkidle');

      const icon = page.locator('usa-icon').first();
      const svg = icon.locator('svg');

      // Verify size class
      await expect(svg).toHaveClass(new RegExp(`usa-icon--size-${size}`));

      // Take visual snapshot
      await expect(icon).toHaveScreenshot(`icon-size-${size}.png`);
    }
  });

  test('should render common icons correctly', async ({ page }) => {
    const commonIcons = [
      'search',
      'close',
      'menu',
      'arrow_forward',
      'arrow_back',
      'check_circle',
      'error',
      'warning',
      'info',
    ];

    for (const iconName of commonIcons) {
      // Navigate to icon story
      await page.goto(`http://localhost:6006/?path=/story/data-display-icon--default&args=name:${iconName}`);
      await page.waitForLoadState('networkidle');

      const icon = page.locator('usa-icon').first();

      // Verify icon renders
      await expect(icon).toBeVisible();

      // Verify sprite reference
      const useElement = icon.locator('use');
      const href = await useElement.getAttribute('href');
      expect(href).toBe(`/img/sprite.svg#${iconName}`);

      // Take visual snapshot
      await expect(icon).toHaveScreenshot(`icon-${iconName}.png`);
    }
  });

  test('should render decorative icons with correct accessibility', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/data-display-icon--decorative');
    await page.waitForLoadState('networkidle');

    const icon = page.locator('usa-icon').first();
    const svg = icon.locator('svg');

    // Decorative icons should have aria-hidden="true"
    await expect(svg).toHaveAttribute('aria-hidden', 'true');

    // Should NOT have aria-label
    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toBeNull();

    // Visual snapshot
    await expect(icon).toHaveScreenshot('icon-decorative.png');
  });

  test('should render accessible icons with labels', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');
    await page.waitForLoadState('networkidle');

    const icon = page.locator('usa-icon').first();
    const svg = icon.locator('svg');

    // Accessible icons should have role="img"
    await expect(svg).toHaveAttribute('role', 'img');

    // Should have aria-label
    const ariaLabel = await svg.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Should have aria-hidden="false"
    await expect(svg).toHaveAttribute('aria-hidden', 'false');

    // Visual snapshot
    await expect(icon).toHaveScreenshot('icon-accessible.png');
  });

  test('REGRESSION: prevents sprite defaults from reverting to inline mode', async ({ page }) => {
    // This regression was caught: monorepo migration (Oct 22) reverted sprite-first defaults
    // Test validates that new icons default to sprite mode

    await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');
    await page.waitForLoadState('networkidle');

    const icon = page.locator('usa-icon').first();

    // Check that icon uses sprite by default
    const useElement = icon.locator('use');
    await expect(useElement).toBeVisible();

    const href = await useElement.getAttribute('href');

    // FAIL CONDITIONS (regressions to catch):
    expect(href).not.toBe(''); // Should not be empty
    expect(href).toMatch(/^\/img\/sprite\.svg#/); // Should reference sprite

    // PASS CONDITIONS (correct sprite-first architecture):
    expect(href).toContain('/img/sprite.svg');
  });

  test('REGRESSION: prevents Storybook from showing limited icon set', async ({ page }) => {
    // Before fix: Only 21 hardcoded icons in stories
    // After fix: All 241 USWDS icons accessible

    await page.goto('http://localhost:6006/?path=/story/data-display-icon--icon-gallery');
    await page.waitForLoadState('networkidle');

    // Count icons in gallery
    const icons = page.locator('usa-icon');
    const iconCount = await icons.count();

    // Should show significantly more than 21 icons
    expect(iconCount).toBeGreaterThan(100);

    // Take snapshot of full gallery
    const gallery = page.locator('.icon-gallery, .docs-story');
    await expect(gallery).toHaveScreenshot('icon-gallery-full.png', {
      fullPage: true,
    });
  });

  test('should maintain visual consistency across icon changes', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');
    await page.waitForLoadState('networkidle');

    const icon = page.locator('usa-icon').first();

    // Take baseline snapshot
    await expect(icon).toHaveScreenshot('icon-baseline.png');

    // Change icon name via Storybook controls (simulate user interaction)
    await page.locator('[aria-label="Change icon name"]').fill('close');
    await page.waitForLoadState('networkidle');

    // Icon should still render correctly with new icon
    const useElement = icon.locator('use');
    const href = await useElement.getAttribute('href');
    expect(href).toBe('/img/sprite.svg#close');

    // Visual should update
    await expect(icon).toHaveScreenshot('icon-changed.png');
  });
});

test.describe('Icon Cross-Browser Visual Tests', () => {
  test('should render consistently across browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');
    await page.waitForLoadState('networkidle');

    const icon = page.locator('usa-icon').first();

    // Take browser-specific snapshot
    await expect(icon).toHaveScreenshot(`icon-${browserName}.png`);
  });
});
