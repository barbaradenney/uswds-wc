import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-character-count.ts';
import type { USACharacterCount } from './usa-character-count.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

/**
 * Character Count Visual Regression Tests
 *
 * These tests prevent regressions where:
 * 1. Message element has aria-live when it shouldn't (monorepo migration bug)
 * 2. Status elements are missing usa-hint class
 * 3. USWDS structure doesn't match official specification
 *
 * CRITICAL: These validate visual appearance and screen reader announcements
 */
describe('Character Count Visual Regression Prevention', () => {
  let element: USACharacterCount;

  beforeEach(async () => {
    element = document.createElement('usa-character-count') as USACharacterCount;
    element.name = 'test-field';
    element.label = 'Test Label';
    element.maxlength = 100;
    document.body.appendChild(element);
    await element.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe('USWDS Message Element Structure (Prevents monorepo regression)', () => {
    it('REGRESSION: message element should NOT have aria-live', async () => {
      const message = element.querySelector('.usa-character-count__message');

      // FAIL CONDITIONS (regression caught):
      // Before fix: message had aria-live="polite" (WRONG per USWDS spec line 189)
      expect(message?.hasAttribute('aria-live'), 'Message should NOT have aria-live').toBe(false);

      // PASS CONDITIONS (correct USWDS structure):
      expect(message?.classList.contains('usa-sr-only')).toBe(true);
    });

    it('REGRESSION: SR status element SHOULD have aria-live', async () => {
      const srStatus = element.querySelector('.usa-character-count__sr-status');

      // USWDS spec line 85-87: SR status should have aria-live="polite"
      expect(srStatus?.getAttribute('aria-live'), 'SR status should have aria-live').toBe('polite');
      expect(srStatus?.classList.contains('usa-sr-only')).toBe(true);
    });

    it('REGRESSION: status element should have usa-hint class', async () => {
      const status = element.querySelector('.usa-character-count__status');

      // USWDS spec line 84: Status should have usa-hint class
      expect(status?.classList.contains('usa-hint'), 'Status should have usa-hint class').toBe(
        true
      );
      expect(status?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Visual State Validation (Prevents broken appearance)', () => {
    it('should show correct visual status message', async () => {
      element.value = '';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');
      expect(status?.textContent?.trim()).toBe('100 characters remaining');
    });

    it('should update visual status when typing', async () => {
      element.value = 'Hello';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');
      expect(status?.textContent?.trim()).toBe('95 characters remaining');
    });

    it('should show error state visually when over limit', async () => {
      element.value = 'a'.repeat(105);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const formGroup = element.querySelector('.usa-form-group');
      const field = element.querySelector('.usa-character-count__field');
      const status = element.querySelector('.usa-character-count__status');

      // Visual error indicators
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);
      expect(field?.classList.contains('usa-input--error')).toBe(true);
      expect(status?.classList.contains('usa-character-count__status--invalid')).toBe(true);

      // Error message
      expect(status?.textContent?.trim()).toBe('5 characters over limit');
    });

    it('should remove error state visually when back within limit', async () => {
      // Start over limit
      element.value = 'a'.repeat(110);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Go back within limit
      element.value = 'a'.repeat(50);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const formGroup = element.querySelector('.usa-form-group');
      const field = element.querySelector('.usa-character-count__field');
      const status = element.querySelector('.usa-character-count__status');

      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(false);
      expect(field?.classList.contains('usa-input--error')).toBe(false);
      expect(status?.classList.contains('usa-character-count__status--invalid')).toBe(false);
    });
  });

  describe('Screen Reader Announcements (Prevents accessibility regression)', () => {
    it('should have visible status for sighted users', async () => {
      const status = element.querySelector('.usa-character-count__status') as HTMLElement;

      expect(status).toBeTruthy();
      expect(await waitForARIAAttribute(status, 'aria-hidden')).toBe('true'); // Not for screen readers
      expect(status.classList.contains('usa-hint')).toBe(true);

      const style = window.getComputedStyle(status);
      expect(style.display).not.toBe('none');
    });

    it('should have separate SR-only status for screen readers', async () => {
      const srStatus = element.querySelector('.usa-character-count__sr-status') as HTMLElement;

      expect(srStatus).toBeTruthy();
      expect(await waitForARIAAttribute(srStatus, 'aria-live')).toBe('polite');
      expect(srStatus.classList.contains('usa-sr-only')).toBe(true);
    });

    it('should announce count changes to screen readers', async () => {
      const srStatus = element.querySelector('.usa-character-count__sr-status');

      element.value = '';
      await element.updateComplete;
      expect(srStatus?.textContent?.trim()).toBe('100 characters remaining');

      element.value = 'Test';
      await element.updateComplete;
      expect(srStatus?.textContent?.trim()).toBe('96 characters remaining');

      element.value = 'a'.repeat(105);
      await element.updateComplete;
      expect(srStatus?.textContent?.trim()).toBe('5 characters over limit');
    });
  });

  describe('Element Visibility Validation', () => {
    it('should have visible label', async () => {
      const label = element.querySelector('.usa-label') as HTMLElement;
      expect(label).toBeTruthy();
      expect(label.textContent?.trim()).toBe('Test Label');

      const style = window.getComputedStyle(label);
      expect(style.display).not.toBe('none');
      expect(style.visibility).not.toBe('hidden');
    });

    it('should have visible textarea', async () => {
      const textarea = element.querySelector('.usa-character-count__field') as HTMLElement;
      expect(textarea).toBeTruthy();

      const style = window.getComputedStyle(textarea);
      expect(style.display).not.toBe('none');
      expect(style.visibility).not.toBe('hidden');
    });

    it('should have visible status hint', async () => {
      const status = element.querySelector('.usa-character-count__status') as HTMLElement;
      expect(status).toBeTruthy();

      const style = window.getComputedStyle(status);
      expect(style.display).not.toBe('none');
    });

    it('should have hidden message element per USWDS spec', async () => {
      const message = element.querySelector('.usa-character-count__message') as HTMLElement;
      expect(message).toBeTruthy();
      expect(message.classList.contains('usa-sr-only')).toBe(true);
    });

    it('should have hidden SR status element', async () => {
      const srStatus = element.querySelector('.usa-character-count__sr-status') as HTMLElement;
      expect(srStatus).toBeTruthy();
      expect(srStatus.classList.contains('usa-sr-only')).toBe(true);
    });
  });

  describe('Error State Visual Validation', () => {
    it('should apply error classes when exceeding limit', async () => {
      element.value = 'a'.repeat(110);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const formGroup = element.querySelector('.usa-form-group');
      const field = element.querySelector('.usa-character-count__field');
      const status = element.querySelector('.usa-character-count__status');

      // Check visual error state
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);
      expect(field?.classList.contains('usa-input--error')).toBe(true);
      expect(status?.classList.contains('usa-character-count__status--invalid')).toBe(true);

      // Verify error styling would be applied
      const fieldElement = field as HTMLElement;
      if (fieldElement) {
        // Component has error class to receive USWDS error styling
        expect(fieldElement.classList.contains('usa-input--error')).toBe(true);
      }
    });

    it('should show error message with correct format', async () => {
      element.value = 'a'.repeat(105);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');
      expect(status?.textContent?.trim()).toBe('5 characters over limit');
    });

    it('should use singular "character" when 1 over limit', async () => {
      element.value = 'a'.repeat(101);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');
      expect(status?.textContent?.trim()).toBe('1 character over limit');
    });
  });

  describe('Singular/Plural Message Formatting', () => {
    it('should use singular "character" for 1 remaining', async () => {
      element.value = 'a'.repeat(99);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');
      expect(status?.textContent?.trim()).toBe('1 character remaining');
    });

    it('should use plural "characters" for multiple remaining', async () => {
      element.value = 'a'.repeat(95);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');
      expect(status?.textContent?.trim()).toBe('5 characters remaining');
    });

    it('should show "Character limit reached" when at exactly limit', async () => {
      element.value = 'a'.repeat(100);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const status = element.querySelector('.usa-character-count__status');
      expect(status?.textContent?.trim()).toBe('Character limit reached');
    });
  });

  describe('Regression Prevention - Monorepo Migration Issues', () => {
    it('REGRESSION: prevents message element from having aria-live', () => {
      // This regression was caught: monorepo migration had message with aria-live
      // USWDS spec line 189 explicitly removes aria-live from message element

      const message = element.querySelector('.usa-character-count__message');

      // FAIL CONDITIONS (regression to catch):
      expect(message?.hasAttribute('aria-live')).toBe(false);

      // PASS CONDITIONS (correct USWDS structure):
      expect(message?.classList.contains('usa-sr-only')).toBe(true);

      // Verify SR status has aria-live instead
      const srStatus = element.querySelector('.usa-character-count__sr-status');
      expect(srStatus?.getAttribute('aria-live')).toBe('polite');
    });

    it('REGRESSION: prevents status from missing usa-hint class', () => {
      const status = element.querySelector('.usa-character-count__status');

      // USWDS spec line 84: status should have usa-hint class
      expect(status?.classList.contains('usa-hint')).toBe(true);
    });

    it('REGRESSION: validates complete USWDS structure', () => {
      // Ensure all required USWDS elements exist with correct classes
      const container = element.querySelector('.usa-character-count');
      const formGroup = element.querySelector('.usa-form-group');
      const label = element.querySelector('.usa-label');
      const field = element.querySelector('.usa-character-count__field');
      const message = element.querySelector('.usa-character-count__message');
      const status = element.querySelector('.usa-character-count__status');
      const srStatus = element.querySelector('.usa-character-count__sr-status');

      // All elements should exist
      expect(container).toBeTruthy();
      expect(formGroup).toBeTruthy();
      expect(label).toBeTruthy();
      expect(field).toBeTruthy();
      expect(message).toBeTruthy();
      expect(status).toBeTruthy();
      expect(srStatus).toBeTruthy();

      // Validate USWDS classes
      expect(message?.classList.contains('usa-sr-only')).toBe(true);
      expect(status?.classList.contains('usa-hint')).toBe(true);
      expect(srStatus?.classList.contains('usa-sr-only')).toBe(true);
    });
  });

  describe('Dynamic Updates Validation', () => {
    it('should update visually when value changes', async () => {
      element.value = 'Hello';
      await element.updateComplete;

      const status = element.querySelector('.usa-character-count__status');
      const initialText = status?.textContent;

      element.value = 'Hello World';
      await element.updateComplete;

      const updatedText = status?.textContent;
      expect(updatedText).not.toBe(initialText);
    });

    it('should update visually when maxlength changes', async () => {
      element.value = 'Test';
      element.maxlength = 50;
      await element.updateComplete;

      const status = element.querySelector('.usa-character-count__status');
      expect(status?.textContent?.trim()).toBe('46 characters remaining');

      element.maxlength = 10;
      await element.updateComplete;

      expect(status?.textContent?.trim()).toBe('6 characters remaining');
    });
  });

  describe('Performance Characteristics', () => {
    it('should update efficiently without re-rendering entire component', async () => {
      const container = element.querySelector('.usa-character-count');

      element.value = 'Test 1';
      await element.updateComplete;

      const container2 = element.querySelector('.usa-character-count');
      expect(container).toBe(container2); // Same container element

      element.value = 'Test 2';
      await element.updateComplete;

      const container3 = element.querySelector('.usa-character-count');
      expect(container).toBe(container3); // Still same container
    });
  });
});
