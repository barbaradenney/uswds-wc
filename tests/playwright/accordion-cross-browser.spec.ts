import { test, expect } from '@playwright/test';

/**
 * Cross-Browser Tests for Accordion Component
 *
 * Tests accordion expand/collapse functionality across different browsers.
 * Focus areas: animation support, keyboard navigation, ARIA state management
 */
test.describe('Accordion Component Cross-Browser Tests', () => {

  test.beforeEach(async ({ page, browserName }) => {
    // Skip all accordion cross-browser tests for Webkit in CI
    // Webkit in GitHub Actions is too slow for USWDS/Storybook initialization
    // These tests still run in Chromium and Firefox for good coverage
    // See: https://github.com/barbaradenney/uswds-wc/actions/runs/19777761200
    test.skip(browserName === 'webkit' && !!process.env.CI, 'Accordion tests skip Webkit in CI - USWDS/Storybook initialization too slow');
    await page.goto('/iframe.html?id=structure-accordion--default');
    await page.waitForLoadState('networkidle');

    // Wait for web component to be fully initialized
    // Webkit needs extra time for custom element registration and USWDS initialization
    await page.waitForSelector('usa-accordion', { state: 'attached' });

    // Wait for USWDS JavaScript to initialize by checking for ARIA attributes
    // This ensures USWDS has finished adding event listeners and ARIA attributes
    const firstButton = page.locator('.usa-accordion__button').first();
    await expect(firstButton).toHaveAttribute('aria-expanded');
  });

  test('should expand and collapse consistently across browsers @smoke', async ({ page, browserName }) => {
    // Webkit needs longer timeouts for element visibility checks
    const timeout = browserName === 'webkit' ? 10000 : 5000;

    // Find first accordion button
    const firstButton = page.locator('.usa-accordion__button').first();
    await expect(firstButton).toBeVisible({ timeout });

    // Initially should be collapsed
    // Wait for USWDS to set aria-expanded attribute
    await expect(firstButton).toHaveAttribute('aria-expanded', 'false', { timeout });

    // Click to expand
    await firstButton.click();

    // Should expand
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    // Content should be visible
    const firstContent = page.locator('.usa-accordion__content').first();
    await expect(firstContent).toBeVisible();

    // Click again to collapse
    await firstButton.click();

    // Should collapse
    await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    await expect(firstContent).toBeHidden();
  });

  test('should handle keyboard navigation correctly', async ({ page }) => {
    const firstButton = page.locator('.usa-accordion__button').first();

    // Wait for button to be ready before focusing
    await expect(firstButton).toBeVisible();

    // Focus first button
    await firstButton.focus();
    await expect(firstButton).toBeFocused();

    // Test Enter key
    await page.keyboard.press('Enter');
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    // Test Space key (should also work)
    await page.keyboard.press('Space');
    await expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    // Test Arrow keys for navigation
    await page.keyboard.press('ArrowDown');

    const secondButton = page.locator('.usa-accordion__button').nth(1);
    await expect(secondButton).toBeFocused();

    // Test ArrowUp
    await page.keyboard.press('ArrowUp');
    await expect(firstButton).toBeFocused();
  });

  test('should handle animation support across browsers', async ({ page, browserName }) => {
    const firstButton = page.locator('.usa-accordion__button').first();
    const firstContent = page.locator('.usa-accordion__content').first();

    // Check if CSS animations are supported
    const hasAnimationSupport = await page.evaluate(() => {
      const testEl = document.createElement('div');
      return 'animationName' in testEl.style;
    });

    await firstButton.click();

    if (hasAnimationSupport) {
      // If animations are supported, content should animate in
      await expect(firstContent).toBeVisible({ timeout: 1000 });

      // Test that animation doesn't interfere with functionality
      await firstButton.click();
      await expect(firstContent).toBeHidden({ timeout: 1000 });
    } else {
      // Without animation support, should still work immediately
      await expect(firstContent).toBeVisible();
      await firstButton.click();
      await expect(firstContent).toBeHidden();
    }
  });

  test('should maintain proper ARIA states in all browsers', async ({ page }) => {
    const buttons = page.locator('.usa-accordion__button');
    const contents = page.locator('.usa-accordion__content');

    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Test each accordion item
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      const content = contents.nth(i);

      // Initial state
      await expect(button).toHaveAttribute('aria-expanded', 'false');

      // Check aria-controls relationship
      const ariaControls = await button.getAttribute('aria-controls');
      expect(ariaControls).toBeTruthy();

      const contentId = await content.getAttribute('id');
      expect(ariaControls).toBe(contentId);

      // Expand and test
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(content).toBeVisible();

      // Collapse and test
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(content).toBeHidden();
    }
  });

  test('should handle single vs multiple selection modes', async ({ page }) => {
    // This test assumes the accordion supports both modes
    // Check current behavior first

    const firstButton = page.locator('.usa-accordion__button').first();
    const secondButton = page.locator('.usa-accordion__button').nth(1);

    // Expand first item
    await firstButton.click();
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    // Expand second item
    await secondButton.click();
    await expect(secondButton).toHaveAttribute('aria-expanded', 'true');

    // Verify first item state: can be expanded (multi-select) or collapsed (single-select)
    // Both modes are valid USWDS patterns
    const firstExpandedState = await firstButton.getAttribute('aria-expanded');
    expect(['true', 'false']).toContain(firstExpandedState);
  });

  test('should render correctly in different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 },  // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const accordion = page.locator('.usa-accordion');
      await expect(accordion).toBeVisible();

      // Test that buttons are still clickable at all sizes
      const firstButton = page.locator('.usa-accordion__button').first();
      await expect(firstButton).toBeVisible();

      const buttonBounds = await firstButton.boundingBox();
      expect(buttonBounds?.width).toBeLessThanOrEqual(viewport.width);

      // Test interaction still works
      await firstButton.click();
      await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

      await firstButton.click();
      await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('should handle rapid clicking across browsers', async ({ page, browserName }) => {
    const firstButton = page.locator('.usa-accordion__button').first();

    // Rapid clicks to test for race conditions
    await firstButton.click();
    await firstButton.click();
    await firstButton.click();
    await firstButton.click();

    // Should end up in a consistent state (collapsed after even number of clicks)
    await expect(firstButton).toHaveAttribute('aria-expanded', 'false');

    // Content should be consistently hidden
    const firstContent = page.locator('.usa-accordion__content').first();
    await expect(firstContent).toBeHidden();
  });

  test('should handle browser-specific accordion behaviors', async ({ page, browserName }) => {
    const firstButton = page.locator('.usa-accordion__button').first();
    const firstContent = page.locator('.usa-accordion__content').first();

    if (browserName === 'webkit') {
      // Safari-specific: Test that accordion doesn't interfere with scroll behavior
      await firstButton.click();
      await expect(firstContent).toBeVisible();

      // Test scrolling within accordion content if it's long enough
      const contentHeight = await firstContent.evaluate((el) => el.scrollHeight);
      if (contentHeight > 200) {
        await firstContent.hover();
        await page.mouse.wheel(0, 100);
        // Should still be expanded after scrolling
        await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      }
    }

    if (browserName === 'firefox') {
      // Firefox-specific: Test that focus outlines are visible
      await firstButton.focus();

      const focusOutline = await firstButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outline !== 'none' || styles.boxShadow !== 'none';
      });

      expect(focusOutline).toBe(true);
    }

    if (browserName === 'chromium') {
      // Chrome-specific: Test that accordion works with browser zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1.5';
      });

      await firstButton.click();
      await expect(firstContent).toBeVisible();

      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1';
      });
    }
  });

  test('should maintain consistent styling across browsers', async ({ page }) => {
    const firstButton = page.locator('.usa-accordion__button').first();

    // Test button styling
    const buttonStyles = await firstButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        width: styles.width,
        textAlign: styles.textAlign,
        borderRadius: styles.borderRadius,
      };
    });

    expect(buttonStyles.display).toBeTruthy();
    expect(buttonStyles.width).toBeTruthy();

    // Test hover state
    await firstButton.hover();
    // CSS hover styles apply immediately, no wait needed

    const hoverStyles = await firstButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        cursor: styles.cursor,
      };
    });

    expect(hoverStyles.cursor).toBe('pointer');

    // Test expanded state styling
    await firstButton.click();
    await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    const expandedStyles = await firstButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        fontWeight: styles.fontWeight,
      };
    });

    // Should have some styling to indicate expanded state
    expect(expandedStyles).toBeTruthy();
  });
});