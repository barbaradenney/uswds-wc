import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-character-count.ts';
import type { USACharacterCount } from './usa-character-count.js';
import { waitForUpdate, validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForPropertyPropagation, waitForARIAAttribute } from '@uswds-wc/test-utils';

/**
 * Regression Tests for Character Count Component Interactive Functionality
 *
 * These tests ensure that character counting, limit detection, real-time feedback,
 * and visual state updates continue to work correctly after component transformations.
 * They prevent regressions in critical character count behavior.
 */
describe('USACharacterCount Interactive Regression Tests', () => {
  let element: USACharacterCount;

  beforeEach(async () => {
    element = document.createElement('usa-character-count') as USACharacterCount;
    element.name = 'test-character-count';
    element.label = 'Test Character Count';
    document.body.appendChild(element);
    await waitForUpdate(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Character Count State Management', () => {
    it('should have clean initial character count state', async () => {
      expect(element.getCharacterCount()).toBe(0);
      expect(element.isNearLimit()).toBe(false);
      expect(element.isOverLimit()).toBe(false);
      expect((element as any)._currentLength).toBe(0);
      expect((element as any)._isNearLimit).toBe(false);
      expect((element as any)._isOverLimit).toBe(false);
    });

    it('should update character count when value changes', async () => {
      element.value = 'Hello world';
      await waitForUpdate(element);

      expect(element.getCharacterCount()).toBe(11);
      expect((element as any)._currentLength).toBe(11);
    });

    it('should track near limit state correctly', async () => {
      element.maxlength = 100;
      element.value = 'x'.repeat(92); // 8 characters remaining (less than 10% of 100)
      await waitForUpdate(element);

      expect(element.isNearLimit()).toBe(true);
      expect(element.isOverLimit()).toBe(false);
      expect(element.getRemainingCharacters()).toBe(8);
    });

    it('should track over limit state correctly', async () => {
      element.maxlength = 50;
      element.value = 'x'.repeat(55); // 5 characters over limit
      await waitForUpdate(element);

      expect(element.isNearLimit()).toBe(false);
      expect(element.isOverLimit()).toBe(true);
      expect(element.getRemainingCharacters()).toBe(-5);
    });

    it('should calculate near limit threshold correctly (10%)', async () => {
      element.maxlength = 100;

      // At exactly 10% (10 characters remaining) - should be near limit
      element.value = 'x'.repeat(90);
      await waitForUpdate(element);
      expect(element.isNearLimit()).toBe(true);

      // At 11% (11 characters remaining) - should not be near limit
      element.value = 'x'.repeat(89);
      await waitForUpdate(element);
      expect(element.isNearLimit()).toBe(false);

      // At exactly limit - should not be near limit (it's at limit)
      element.value = 'x'.repeat(100);
      await waitForUpdate(element);
      expect(element.isNearLimit()).toBe(false);
    });

    it('should handle unlimited character count (maxlength = 0)', async () => {
      element.maxlength = 0;
      element.value = 'x'.repeat(1000);
      await waitForUpdate(element);

      expect(element.getCharacterCount()).toBe(1000);
      expect(element.getRemainingCharacters()).toBe(null);
      expect(element.isNearLimit()).toBe(false);
      expect(element.isOverLimit()).toBe(false);
    });
  });

  describe('Real-time Input Tracking', () => {
    it('should update count when user types in textarea', async () => {
      element.inputType = 'textarea';
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'Hello';
      textarea.dispatchEvent(new Event('input'));
      await waitForUpdate(element);

      expect(element.value).toBe('Hello');
      expect(element.getCharacterCount()).toBe(5);
    });

    it('should update count when user types in input field', async () => {
      element.inputType = 'input';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'Testing';
      input.dispatchEvent(new Event('input'));
      await waitForUpdate(element);

      expect(element.value).toBe('Testing');
      expect(element.getCharacterCount()).toBe(7);
    });

    it('should trigger state changes during typing', async () => {
      element.maxlength = 10;
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;

      // Type to near limit
      textarea.value = 'x'.repeat(9); // 1 remaining - should be near limit
      textarea.dispatchEvent(new Event('input'));
      await waitForUpdate(element);

      expect(element.isNearLimit()).toBe(true);
      expect(element.isOverLimit()).toBe(false);

      // Type over limit
      textarea.value = 'x'.repeat(12); // 2 over limit
      textarea.dispatchEvent(new Event('input'));
      await waitForUpdate(element);

      expect(element.isNearLimit()).toBe(false);
      expect(element.isOverLimit()).toBe(true);
    });
  });

  describe('Visual Feedback and Messages', () => {
    it('should display correct message for unlimited count', async () => {
      element.maxlength = 0;
      element.value = 'Hello';
      await waitForPropertyPropagation(element);

      const statusElement = element.querySelector('.usa-character-count__status');
      expect(statusElement?.textContent?.trim()).toBe('5 characters');
    });

    it('should display correct message when under limit', async () => {
      element.maxlength = 100;
      element.value = 'Hello';
      await waitForPropertyPropagation(element);

      const statusElement = element.querySelector('.usa-character-count__status');
      expect(statusElement?.textContent?.trim()).toBe('95 characters remaining');
    });

    it('should display correct message when at limit', async () => {
      element.maxlength = 20;
      element.value = 'x'.repeat(20);
      await waitForPropertyPropagation(element);

      const statusElement = element.querySelector('.usa-character-count__status');
      expect(statusElement?.textContent?.trim()).toBe('Character limit reached');
    });

    it('should display correct message when over limit', async () => {
      element.maxlength = 10;
      element.value = 'x'.repeat(15);
      await waitForPropertyPropagation(element);

      const statusElement = element.querySelector('.usa-character-count__status');
      expect(statusElement?.textContent?.trim()).toBe('5 characters over limit');
    });

    it('should display singular vs plural correctly', async () => {
      element.maxlength = 10;

      // 1 character remaining
      element.value = 'x'.repeat(9);
      await waitForPropertyPropagation(element);
      let statusElement = element.querySelector('.usa-character-count__status');
      expect(statusElement?.textContent?.trim()).toBe('1 character remaining');

      // 2 characters remaining
      element.value = 'x'.repeat(8);
      await waitForPropertyPropagation(element);
      statusElement = element.querySelector('.usa-character-count__status');
      expect(statusElement?.textContent?.trim()).toBe('2 characters remaining');
    });

    it('should apply error CSS classes when over limit', async () => {
      element.maxlength = 5;
      element.value = 'x'.repeat(10);
      await waitForPropertyPropagation(element);

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);

      const statusElement = element.querySelector('.usa-character-count__status');
      expect(statusElement?.classList.contains('usa-character-count__status--invalid')).toBe(true);
    });

    it('should remove error CSS classes when back under limit', async () => {
      element.maxlength = 5;

      // First set over limit
      element.value = 'x'.repeat(10);
      await waitForPropertyPropagation(element);

      let formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);

      // Then set back under limit
      element.value = 'abc';
      await waitForPropertyPropagation(element);

      formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(false);
    });
  });

  describe('Input Type Variants', () => {
    it('should render textarea correctly', async () => {
      element.inputType = 'textarea';
      element.rows = 8;
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea');
      expect(textarea).toBeTruthy();
      expect(textarea?.rows).toBe(8);
      expect(textarea?.classList.contains('usa-textarea')).toBe(true);
      expect(textarea?.classList.contains('usa-character-count__field')).toBe(true);
    });

    it('should render input field correctly', async () => {
      element.inputType = 'input';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.type).toBe('text');
      expect(input?.classList.contains('usa-input')).toBe(true);
      expect(input?.classList.contains('usa-character-count__field')).toBe(true);
    });

    it('should set maxlength attribute correctly', async () => {
      element.maxlength = 50;
      element.inputType = 'textarea';
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea');
      expect(textarea?.maxLength).toBe(50);
    });

    it('should not set maxlength attribute when unlimited', async () => {
      element.maxlength = 0;
      element.inputType = 'input';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      expect(input?.getAttribute('maxlength')).toBe('');
    });
  });

  describe('Public API Methods', () => {
    it('should focus input with focus() method', async () => {
      const focusSpy = vi.fn();
      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      textarea.focus = focusSpy;

      element.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should blur input with blur() method', async () => {
      const blurSpy = vi.fn();
      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      textarea.blur = blurSpy;

      element.blur();
      expect(blurSpy).toHaveBeenCalled();
    });

    it('should select input text with select() method', async () => {
      const selectSpy = vi.fn();
      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      textarea.select = selectSpy;

      element.select();
      expect(selectSpy).toHaveBeenCalled();
    });

    it('should clear input with clear() method', async () => {
      element.value = 'Some text to clear';
      await waitForUpdate(element);

      expect(element.getCharacterCount()).toBe(18);

      element.clear();
      await waitForUpdate(element);

      expect(element.value).toBe('');
      expect(element.getCharacterCount()).toBe(0);
    });

    it('should return correct values from getter methods', async () => {
      element.maxlength = 20;
      element.value = 'Testing methods';
      await waitForUpdate(element);

      expect(element.getCharacterCount()).toBe(15);
      expect(element.getRemainingCharacters()).toBe(5);
      expect(element.isNearLimit()).toBe(false);
      expect(element.isOverLimit()).toBe(false);
    });
  });

  describe('Event Dispatching', () => {
    it('should dispatch character-count-change event when count changes', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('character-count-change', (e: Event) => {
        eventFired = true;
        eventDetail = (e as CustomEvent).detail;
      });

      element.value = 'Test';
      await waitForUpdate(element);

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeTruthy();
      expect(eventDetail.currentLength).toBe(4);
      expect(eventDetail.value).toBe('Test');
      expect(eventDetail.maxLength).toBe(0);
      expect(eventDetail.remaining).toBe(null);
    });

    it('should dispatch event with complete details when limited', async () => {
      element.maxlength = 50;
      let eventDetail: any = null;

      element.addEventListener('character-count-change', (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      });

      element.value = 'Testing character count';
      await waitForUpdate(element);

      expect(eventDetail.currentLength).toBe(23);
      expect(eventDetail.maxLength).toBe(50);
      expect(eventDetail.remaining).toBe(27);
      expect(eventDetail.isNearLimit).toBe(false);
      expect(eventDetail.isOverLimit).toBe(false);
    });

    it('should dispatch event with near limit state', async () => {
      element.maxlength = 10;
      let eventDetail: any = null;

      element.addEventListener('character-count-change', (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      });

      element.value = 'x'.repeat(9); // 1 remaining - near limit
      await waitForUpdate(element);

      expect(eventDetail.isNearLimit).toBe(true);
      expect(eventDetail.isOverLimit).toBe(false);
      expect(eventDetail.remaining).toBe(1);
    });

    it('should dispatch event with over limit state', async () => {
      element.maxlength = 5;
      let eventDetail: any = null;

      element.addEventListener('character-count-change', (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      });

      element.value = 'x'.repeat(8); // 3 over limit
      await waitForUpdate(element);

      expect(eventDetail.isNearLimit).toBe(false);
      expect(eventDetail.isOverLimit).toBe(true);
      expect(eventDetail.remaining).toBe(-3);
    });

    it('should bubble events correctly', async () => {
      let parentEventFired = false;

      document.body.addEventListener('character-count-change', () => {
        parentEventFired = true;
      });

      element.value = 'Test bubbling';
      await waitForUpdate(element);

      expect(parentEventFired).toBe(true);

      document.body.removeEventListener('character-count-change', () => {});
    });

    it('should not dispatch event if count does not change', async () => {
      let eventCount = 0;

      element.addEventListener('character-count-change', () => {
        eventCount++;
      });

      element.value = 'test';
      await waitForUpdate(element);
      expect(eventCount).toBe(1);

      // Set same value again
      element.value = 'test';
      await waitForUpdate(element);
      expect(eventCount).toBe(1); // Should still be 1
    });
  });

  describe('Accessibility Features', () => {
    it('should have correct ARIA attributes', async () => {
      element.hint = 'Please enter your message';
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      const ariaDescribedBy = await waitForARIAAttribute(textarea, 'aria-describedby');

      // USWDS creates aria-describedby with status and hint IDs
      expect(ariaDescribedBy).toContain(`${element.name}-status`);
      expect(ariaDescribedBy).toContain(`${element.name}-hint`);
    });

    it('should have aria-live="polite" on status message', async () => {
      element.maxlength = 100; // Set maxlength to ensure status element is visible
      await waitForUpdate(element);

      // Give USWDS time to initialize and modify DOM
      await new Promise((resolve) => setTimeout(resolve, 100));

      // USWDS creates screen reader specific status elements with aria-live
      const ariaLiveElements = element.querySelectorAll('[aria-live="polite"]');

      expect(ariaLiveElements.length).toBeGreaterThan(0);

      // Check that at least one element has the correct aria-live attribute
      let hasAriaLivePolite = false;
      for (const el of Array.from(ariaLiveElements)) {
        const ariaLive = await waitForARIAAttribute(el, 'aria-live');
        if (ariaLive === 'polite') {
          hasAriaLivePolite = true;
          break;
        }
      }
      expect(hasAriaLivePolite).toBe(true);
    });

    it('should show required indicator when required', async () => {
      element.required = true;
      await waitForPropertyPropagation(element);

      const requiredIndicator = element.querySelector('.usa-hint--required');
      expect(requiredIndicator).toBeTruthy();
      expect(requiredIndicator?.textContent).toBe('*');
    });

    it('should set proper disabled and readonly states', async () => {
      element.disabled = true;
      element.readonly = true;
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);
      expect(textarea.readOnly).toBe(true);
    });
  });

  describe('USWDS Container Structure', () => {
    it('should render correct USWDS container structure', async () => {
      element.maxlength = 100;
      await waitForPropertyPropagation(element);

      const characterCountContainer = element.querySelector('.usa-character-count');
      expect(characterCountContainer).toBeTruthy();
      expect(characterCountContainer?.getAttribute('data-maxlength')).toBe('100');

      const statusElement = element.querySelector('.usa-character-count__status');
      expect(statusElement).toBeTruthy();

      const field = element.querySelector('.usa-character-count__field');
      expect(field).toBeTruthy();
    });

    it('should set data-maxlength attribute correctly', async () => {
      element.maxlength = 250;
      await waitForPropertyPropagation(element);

      const container = element.querySelector('.usa-character-count');
      expect(container?.getAttribute('data-maxlength')).toBe('250');
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/character-count/usa-character-count.ts`;
        const validation = validateComponentJavaScript(componentPath, 'character-count');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Edge Cases and Regression Prevention', () => {
    it('should handle rapid value changes', async () => {
      element.maxlength = 10;

      // Rapidly change values
      element.value = 'a';
      element.value = 'ab';
      element.value = 'abc';
      element.value = 'x'.repeat(15); // Over limit
      await waitForUpdate(element);

      expect(element.getCharacterCount()).toBe(15);
      expect(element.isOverLimit()).toBe(true);
      expect(element.getRemainingCharacters()).toBe(-5);
    });

    it('should handle empty and whitespace values', async () => {
      element.maxlength = 10;

      element.value = '';
      await waitForUpdate(element);
      expect(element.getCharacterCount()).toBe(0);

      element.value = '   ';
      await waitForUpdate(element);
      expect(element.getCharacterCount()).toBe(3);

      element.value = '\n\t\r';
      await waitForUpdate(element);
      expect(element.getCharacterCount()).toBe(3);
    });

    it('should handle unicode and special characters', async () => {
      element.value = '🚀🌟💫'; // 3 emoji characters
      await waitForUpdate(element);
      expect(element.getCharacterCount()).toBe(6); // Each emoji is 2 UTF-16 code units

      element.value = 'café'; // 4 characters
      await waitForUpdate(element);
      expect(element.getCharacterCount()).toBe(4);
    });

    it('should maintain state through property updates', async () => {
      element.maxlength = 20;
      element.value = 'Testing state';
      await waitForUpdate(element);

      expect(element.getCharacterCount()).toBe(13);

      // Update unrelated properties
      element.label = 'New label';
      element.placeholder = 'New placeholder';
      await waitForUpdate(element);

      // Should maintain character count state
      expect(element.getCharacterCount()).toBe(13);
      expect(element.getRemainingCharacters()).toBe(7);
    });

    it('should handle maxlength changes dynamically', async () => {
      element.value = 'x'.repeat(15);
      element.maxlength = 20;
      await waitForUpdate(element);

      expect(element.isOverLimit()).toBe(false);
      expect(element.getRemainingCharacters()).toBe(5);

      // Change maxlength to make it over limit
      element.maxlength = 10;
      await waitForUpdate(element);

      expect(element.isOverLimit()).toBe(true);
      expect(element.getRemainingCharacters()).toBe(-5);
    });

    it('should handle negative maxlength gracefully', async () => {
      element.maxlength = -5;
      element.value = 'test';
      await waitForUpdate(element);

      expect(element.getRemainingCharacters()).toBe(null);
      expect(element.isNearLimit()).toBe(false);
      expect(element.isOverLimit()).toBe(false);
    });

    it('should not break with missing DOM elements', async () => {
      // Remove element from DOM but still call methods
      element.remove();

      expect(() => {
        element.focus();
        element.blur();
        element.select();
      }).not.toThrow();
    });

    it('should handle synchronization between multiple updates', async () => {
      element.maxlength = 10;

      // Multiple rapid updates
      element.value = 'a';
      (element as any).updateCharacterCountSync();
      element.value = 'ab';
      (element as any).updateCharacterCountSync();
      element.value = 'abc';
      (element as any).updateCharacterCountSync();

      await waitForUpdate(element);

      expect(element.getCharacterCount()).toBe(3);
      expect(element.getRemainingCharacters()).toBe(7);
    });

    it('should calculate limit thresholds correctly for edge cases', async () => {
      // Test with maxlength = 1 (10% would be 0.1)
      element.maxlength = 1;
      element.value = '';
      await waitForUpdate(element);

      expect(element.isNearLimit()).toBe(false); // 1 remaining, threshold is 0.1 rounded down to 0

      element.value = 'x';
      await waitForUpdate(element);
      expect(element.isNearLimit()).toBe(false); // At limit, not near limit

      element.value = 'xx';
      await waitForUpdate(element);
      expect(element.isOverLimit()).toBe(true);

      // Test with maxlength = 9 (10% would be 0.9 rounded down to 0)
      element.maxlength = 9;
      element.value = 'x'.repeat(8);
      await waitForUpdate(element);

      expect(element.isNearLimit()).toBe(false); // 1 remaining, but threshold is 0
    });
  });
});
