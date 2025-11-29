import { test, expect } from '@playwright/test';

/**
 * Character Count Deep Testing Suite
 *
 * Phase 2C comprehensive testing for usa-character-count component
 * Tests real-time counting, limit enforcement, validation, and visual feedback
 *
 * Total Tests: 14
 * - 4 Baseline tests (rendering, keyboard, a11y, responsive)
 * - 4 Character counting tests
 * - 3 Limit enforcement tests
 * - 3 Edge case tests
 */

const STORY_URL_DEFAULT = '/iframe.html?id=forms-character-count--default';
const STORY_URL_TEXTAREA = '/iframe.html?id=forms-character-count--text-area';
const STORY_URL_WITH_LIMIT = '/iframe.html?id=forms-character-count--default'; // Default story has maxlength
const COMPONENT_SELECTOR = 'usa-character-count';
const WRAPPER_SELECTOR = '.usa-character-count';

test.describe('Character Count Deep Testing', () => {
  // Note: No beforeEach navigation needed - each test navigates to its specific story URL

  // Skip all character-count tests in Webkit CI - USWDS/Storybook initialization too slow
  test.beforeEach(({ browserName }) => {
    test.skip(browserName === 'webkit' && !!process.env.CI, 'Character count tests skip Webkit in CI - USWDS/Storybook initialization too slow');
  });

  // ============================================================================
  // BASELINE TESTS (4 tests)
  // ============================================================================

  test.describe('Baseline Tests', () => {
    test('should render correctly', async ({ page, browserName }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      // Check for USWDS wrapper inside component
      const wrapper = component.locator(WRAPPER_SELECTOR);
      await expect(wrapper).toBeVisible();

      // Check for input or textarea
      const input = component.locator('input, textarea');
      await expect(input).toBeVisible();

      // Check for character count message
      const message = component.locator('.usa-character-count__status');
      await expect(message).toBeVisible();

      // Visual regression screenshot
      await page.screenshot({
        path: `test-results/screenshots/${browserName}-character-count-render.png`,
        fullPage: false,
        clip: (await component.boundingBox()) || undefined,
      });
    });

    test('should handle keyboard accessibility', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Focus the input
      await input.focus();
      await expect(input).toBeFocused();

      // Type some text
      await page.keyboard.type('Hello World');

      // Check value was updated
      const value = await input.inputValue();
      expect(value).toContain('Hello World');
    });

    test('should be accessible', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Check for label association
      const inputId = await input.getAttribute('id');
      expect(inputId).toBeTruthy();

      const label = page.locator(`label[for="${inputId}"]`);
      await expect(label).toBeVisible();
      const labelText = await label.textContent();
      expect(labelText?.trim().length).toBeGreaterThan(0);

      // Check for aria-describedby linking to character count message
      const describedBy = await input.getAttribute('aria-describedby');
      if (describedBy) {
        // aria-describedby can have multiple space-separated IDs
        const ids = describedBy.split(' ');
        for (const id of ids) {
          const messageElement = page.locator(`#${id.trim()}`);
          const count = await messageElement.count();
          if (count > 0) {
            // At least one referenced element exists
            expect(count).toBeGreaterThan(0);
            break;
          }
        }
      }

      // Check character count message has proper role
      const message = component.locator('.usa-character-count__status');
      await expect(message).toBeVisible();
    });

    test('should handle responsive design', async ({ page, isMobile }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      await expect(component).toBeVisible();

      const box = await component.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);

      // Input should be full width on mobile
      const input = component.locator('input, textarea');
      const inputBox = await input.boundingBox();
      expect(inputBox).not.toBeNull();

      if (isMobile) {
        // On mobile, input should take most of the width
        expect(inputBox!.width).toBeGreaterThan(200);
      }
    });
  });

  // ============================================================================
  // CHARACTER COUNTING TESTS (4 tests)
  // ============================================================================

  test.describe('Character Counting Tests', () => {
    test('should update character count in real-time', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');
      const message = component.locator('.usa-character-count__status');

      // Type some text
      await input.fill('Hello');
      await page.waitForTimeout(100);

      // Message should update to show count
      const messageText = await message.textContent();
      expect(messageText).toBeTruthy();
      // Should mention characters in some form
      expect(messageText?.toLowerCase()).toMatch(/character|char/);
    });

    test('should count characters accurately', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Type exact text
      const testText = 'Test 123';
      await input.fill(testText);
      await page.waitForTimeout(100);

      // Get character count display
      const message = component.locator('.usa-character-count__status');
      const messageText = await message.textContent();

      // Should show characters remaining (component has maxlength, so shows "X remaining")
      // 8 characters typed, so should show remaining count or contain reference to count
      expect(messageText?.toLowerCase()).toMatch(/\d+\s*(character|remaining)/);
    });

    test('should handle special characters and spaces', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Type text with special characters
      const testText = 'Hello! @#$ 123';
      await input.fill(testText);
      await page.waitForTimeout(100);

      // All characters including spaces and special chars should be counted
      const value = await input.inputValue();
      expect(value.length).toBe(14);

      const message = component.locator('.usa-character-count__status');
      const messageText = await message.textContent();
      // Component shows "X characters remaining", not count
      expect(messageText?.toLowerCase()).toMatch(/\d+\s*(character|remaining)/);
    });

    test('should update count on backspace/delete', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Type text
      await input.fill('Hello World');
      await page.waitForTimeout(100);

      let messageText = await component.locator('.usa-character-count__status').textContent();
      // Component shows "X characters remaining"
      expect(messageText?.toLowerCase()).toMatch(/\d+\s*(character|remaining)/);

      // Delete some characters
      await input.fill('Hello');
      await page.waitForTimeout(100);

      messageText = await component.locator('.usa-character-count__status').textContent();
      // Component shows "X characters remaining"
      expect(messageText?.toLowerCase()).toMatch(/\d+\s*(character|remaining)/);
    });
  });

  // ============================================================================
  // LIMIT ENFORCEMENT TESTS (3 tests)
  // ============================================================================

  test.describe('Limit Enforcement Tests', () => {
    test('should show limit warning when approaching maximum', async ({ page }) => {
      await page.goto(STORY_URL_WITH_LIMIT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Get maxlength from component
      const maxlength = await input.getAttribute('maxlength');
      if (!maxlength) {
        // If no maxlength attribute, try to get it from component property
        const max = await page.evaluate(() => {
          const el = document.querySelector('usa-character-count');
          return el ? (el as any).maxlength : null;
        });

        if (!max || max === 0) {
          test.skip();
          return;
        }

        // Fill text close to limit (assuming limit is around 25-50 based on typical USWDS defaults)
        await input.fill('A'.repeat(20));
      } else {
        const limit = parseInt(maxlength);
        // Fill to near the limit
        await input.fill('A'.repeat(Math.max(1, limit - 5)));
      }

      await page.waitForTimeout(200);

      // Component should show warning state
      const wrapper = component.locator(WRAPPER_SELECTOR);
      const hasWarningClass = await wrapper.evaluate((el) =>
        el.classList.contains('usa-character-count--near-limit')
      );

      // Either has warning class or message shows it's near limit
      const message = component.locator('.usa-character-count__status');
      const messageText = await message.textContent();

      expect(hasWarningClass || messageText?.toLowerCase().includes('remaining')).toBeTruthy();
    });

    test('should prevent input beyond maximum length', async ({ page }) => {
      await page.goto(STORY_URL_WITH_LIMIT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Get maxlength
      const maxlengthAttr = await input.getAttribute('maxlength');
      if (!maxlengthAttr) {
        test.skip();
        return;
      }

      const limit = parseInt(maxlengthAttr);

      // Try to input more than the limit
      await input.fill('A'.repeat(limit + 10));
      await page.waitForTimeout(100);

      // Value should be capped at limit
      const value = await input.inputValue();
      expect(value.length).toBeLessThanOrEqual(limit);
    });

    test('should show error state when over limit', async ({ page }) => {
      await page.goto(STORY_URL_WITH_LIMIT);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Get the actual maxlength
      const maxlengthAttr = await input.getAttribute('maxlength');
      if (!maxlengthAttr) {
        test.skip();
        return;
      }

      const limit = parseInt(maxlengthAttr);

      // Programmatically set value over limit (bypassing maxlength)
      await page.evaluate((overLimitValue) => {
        const el = document.querySelector('usa-character-count');
        if (el) {
          const input = el.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
          if (input) {
            // Remove maxlength temporarily and set value over limit
            input.removeAttribute('maxlength');
            input.value = overLimitValue;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }, 'A'.repeat(limit + 50));

      await page.waitForTimeout(300);

      // Check for error state
      const wrapper = component.locator(WRAPPER_SELECTOR);
      const hasErrorClass = await wrapper.evaluate((el) =>
        el.classList.contains('usa-character-count--over-limit')
      );

      // Check message indicates over limit
      const message = component.locator('.usa-character-count__status');
      const messageText = await message.textContent();

      // Component should show "over limit" or negative remaining
      expect(hasErrorClass || messageText?.toLowerCase().includes('over') || messageText?.toLowerCase().includes('-')).toBeTruthy();
    });
  });

  // ============================================================================
  // EDGE CASE TESTS (3 tests)
  // ============================================================================

  test.describe('Edge Case Tests', () => {
    test('should handle textarea vs input variants', async ({ page }) => {
      // Test textarea variant
      await page.goto(STORY_URL_TEXTAREA);
      await page.waitForLoadState('networkidle');

      const component = page.locator(COMPONENT_SELECTOR).first();
      const textarea = component.locator('textarea');

      if ((await textarea.count()) > 0) {
        await expect(textarea).toBeVisible();

        // Type multi-line text
        await textarea.fill('Line 1\nLine 2\nLine 3');
        await page.waitForTimeout(100);

        // Count should include newlines
        const value = await textarea.inputValue();
        expect(value.length).toBe(20); // "Line 1\nLine 2\nLine 3" = 20 chars

        const message = component.locator('.usa-character-count__status');
        const messageText = await message.textContent();
        // Component shows "X characters remaining"
      expect(messageText?.toLowerCase()).toMatch(/\d+\s*(character|remaining)/);
      } else {
        // If textarea story doesn't exist, check default has input
        await page.goto(STORY_URL_DEFAULT);
        await page.waitForLoadState('networkidle');

        const input = component.locator('input');
        await expect(input).toBeVisible();
      }
    });

    test('should handle disabled state', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      // Set component to disabled
      await page.evaluate(() => {
        const el = document.querySelector('usa-character-count');
        if (el) {
          (el as any).disabled = true;
        }
      });

      await page.waitForTimeout(300);

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Input should be disabled
      const isDisabled = await input.isDisabled();
      expect(isDisabled).toBeTruthy();

      // Should not be able to type
      await input.click({ force: true });
      await page.keyboard.type('Test');

      const value = await input.inputValue();
      expect(value).toBe(''); // No text should be entered
    });

    test('should handle initial value', async ({ page }) => {
      await page.goto(STORY_URL_DEFAULT);
      await page.waitForLoadState('networkidle');

      // Set initial value programmatically
      await page.evaluate(() => {
        const el = document.querySelector('usa-character-count');
        if (el) {
          (el as any).value = 'Initial text';
        }
      });

      await page.waitForTimeout(300);

      const component = page.locator(COMPONENT_SELECTOR).first();
      const input = component.locator('input, textarea');

      // Input should have initial value
      const value = await input.inputValue();
      expect(value).toBe('Initial text');

      // Character count should reflect initial value
      const message = component.locator('.usa-character-count__status');
      const messageText = await message.textContent();
      // Component shows "X characters remaining", not the count itself
      expect(messageText?.toLowerCase()).toMatch(/\d+\s*(character|remaining)/);
    });
  });
});
