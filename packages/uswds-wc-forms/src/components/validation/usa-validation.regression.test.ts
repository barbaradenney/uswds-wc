import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-validation.ts';
import type { USAValidation } from './usa-validation.js';
import { waitForUpdate, validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForPropertyPropagation, waitForARIAAttribute } from '@uswds-wc/test-utils';

/**
 * Regression Tests for Validation Component Interactive Functionality
 *
 * These tests ensure that validation logic, real-time feedback, rule management,
 * and form integration continue to work correctly after component transformations.
 * They prevent regressions in critical validation behavior.
 */
describe('USAValidation Interactive Regression Tests', () => {
  let element: USAValidation;

  beforeEach(async () => {
    element = document.createElement('usa-validation') as USAValidation;
    element.name = 'test-input';
    element.label = 'Test Input';
    document.body.appendChild(element);
    await waitForUpdate(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Validation State Management', () => {
    it('should have clean initial validation state', async () => {
      expect(element.isValid()).toBe(true);
      expect(element.getErrors()).toEqual([]);
      expect((element as any)._hasBeenValidated).toBe(false);
    });

    it('should validate value against required rule', async () => {
      element.rules = [{ type: 'required', message: 'This field is required' }];
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
      expect((element as any)._hasBeenValidated).toBe(true);
    });

    it('should validate email format correctly', async () => {
      element.rules = [{ type: 'email', message: 'Invalid email format' }];
      element.value = 'invalid-email';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');

      // Valid email should pass
      element.value = 'test@example.com';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual([]);
    });

    it('should validate URL format correctly', async () => {
      element.rules = [{ type: 'url', message: 'Invalid URL format' }];
      element.value = 'not-a-url';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid URL format');

      // Valid URL should pass
      element.value = 'https://example.com';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate against custom pattern rule', async () => {
      element.rules = [
        { type: 'pattern', pattern: '^\\d{3}-\\d{2}-\\d{4}$', message: 'Use format XXX-XX-XXXX' },
      ];
      element.value = '123456789';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Use format XXX-XX-XXXX');

      // Valid pattern should pass
      element.value = '123-45-6789';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate minlength and maxlength rules', async () => {
      element.rules = [
        { type: 'minlength', minlength: 3, message: 'Too short' },
        { type: 'maxlength', maxlength: 10, message: 'Too long' },
      ];

      // Test too short
      element.value = 'hi';
      let result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too short');

      // Test too long
      element.value = 'this is way too long';
      result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too long');

      // Test valid length
      element.value = 'perfect';
      result = element.validate();
      expect(result.isValid).toBe(true);
    });

    it('should validate min and max numeric rules', async () => {
      element.rules = [
        { type: 'min', min: 10, message: 'Too small' },
        { type: 'max', max: 100, message: 'Too large' },
      ];

      // Test too small
      element.value = '5';
      let result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too small');

      // Test too large
      element.value = '200';
      result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too large');

      // Test valid range
      element.value = '50';
      result = element.validate();
      expect(result.isValid).toBe(true);
    });

    it('should validate custom validator rule', async () => {
      element.rules = [
        {
          type: 'custom',
          message: 'Must contain "test"',
          validator: (value: string) => value.includes('test'),
        },
      ];

      element.value = 'hello world';
      let result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must contain "test"');

      element.value = 'hello test world';
      result = element.validate();
      expect(result.isValid).toBe(true);
    });
  });

  describe('Real-time Validation', () => {
    it('should validate on input when validateOnInput is true', async () => {
      element.rules = [{ type: 'required', message: 'Required field' }];
      element.validateOnInput = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('#test-input') as HTMLInputElement;
      input.value = 'test value';
      input.dispatchEvent(new Event('input'));
      await waitForUpdate(element);

      expect(element.value).toBe('test value');
      expect(element.isValid()).toBe(true);
      expect((element as any)._hasBeenValidated).toBe(true);
    });

    it('should not validate on input when validateOnInput is false', async () => {
      element.rules = [{ type: 'required', message: 'Required field' }];
      element.validateOnInput = false;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('#test-input') as HTMLInputElement;
      input.value = 'test value';
      input.dispatchEvent(new Event('input'));
      await waitForUpdate(element);

      expect(element.value).toBe('test value');
      expect((element as any)._hasBeenValidated).toBe(false);
    });

    it('should validate on blur when validateOnBlur is true', async () => {
      element.rules = [{ type: 'required', message: 'Required field' }];
      element.validateOnBlur = true;
      element.validateOnInput = false;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('#test-input') as HTMLInputElement;
      input.value = 'test value';
      // Need to update the component's value property first
      element.value = 'test value';
      input.dispatchEvent(new Event('blur'));
      await waitForUpdate(element);

      expect((element as any)._hasBeenValidated).toBe(true);
      expect(element.isValid()).toBe(true);
    });

    it('should not validate on blur when validateOnBlur is false', async () => {
      element.rules = [{ type: 'required', message: 'Required field' }];
      element.validateOnBlur = false;
      element.validateOnInput = false;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('#test-input') as HTMLInputElement;
      input.value = 'test value';
      input.dispatchEvent(new Event('blur'));
      await waitForUpdate(element);

      expect((element as any)._hasBeenValidated).toBe(false);
    });
  });

  describe('Input Type Variants', () => {
    it('should render textarea input type correctly', async () => {
      element.inputType = 'textarea';
      element.rows = 5;
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();
      expect(textarea.rows).toBe(5);
      expect(textarea.classList.contains('usa-textarea')).toBe(true);
    });

    it('should render select input type correctly', async () => {
      element.inputType = 'select';
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();
      expect(select.classList.contains('usa-select')).toBe(true);
      expect(select.querySelectorAll('option').length).toBe(3); // Including default "Choose an option"
    });

    it('should handle select value changes', async () => {
      element.inputType = 'select';
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select') as HTMLSelectElement;
      select.value = 'option1';
      select.dispatchEvent(new Event('input'));
      await waitForUpdate(element);

      expect(element.value).toBe('option1');
    });

    it('should render different input types correctly', async () => {
      element.type = 'email';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('email');
      expect(input.classList.contains('usa-input')).toBe(true);
    });
  });

  describe('CSS Classes and States', () => {
    it('should apply error classes when validation fails', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);

      const input = element.querySelector('#test-input');
      expect(input?.classList.contains('usa-input--error')).toBe(true);
    });

    it('should apply success classes when validation passes', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = 'valid value';
      element.showSuccessState = true;
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const input = element.querySelector('#test-input');
      expect(input?.classList.contains('usa-input--success')).toBe(true);
    });

    it('should apply required class when rule is required', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForPropertyPropagation(element);

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--required')).toBe(true);
    });

    it('should show required indicator in label', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForPropertyPropagation(element);

      const requiredAbbr = element.querySelector('abbr.usa-hint--required');
      expect(requiredAbbr).toBeTruthy();
      expect(requiredAbbr?.textContent).toBe('*');
    });
  });

  describe('Public API Methods', () => {
    it('should add rules dynamically with addRule method', async () => {
      expect(element.rules.length).toBe(0);

      element.addRule({ type: 'required', message: 'Now required' });
      expect(element.rules.length).toBe(1);

      // Should validate if already validated - make it validated first
      element.validate(); // Make it validated first
      expect((element as any)._hasBeenValidated).toBe(true);

      element.addRule({ type: 'minlength', minlength: 5, message: 'Too short' });
      expect(element.rules.length).toBe(2);

      // With empty value, only required rule should fail
      const result = element.validate();
      expect(result.errors.length).toBe(1); // Only required fails for empty value
      expect(result.errors).toContain('Now required');
    });

    it('should remove rules with removeRule method', async () => {
      element.rules = [
        { type: 'required', message: 'Required' },
        { type: 'minlength', minlength: 3, message: 'Too short' },
      ];

      element.removeRule('required');
      expect(element.rules.length).toBe(1);
      expect(element.rules[0].type).toBe('minlength');
    });

    it('should clear validation state with clearValidation method', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      element.validate();
      expect((element as any)._hasBeenValidated).toBe(true);

      element.clearValidation();
      expect((element as any)._hasBeenValidated).toBe(false);
      expect(element.isValid()).toBe(true);
      expect(element.getErrors()).toEqual([]);
    });

    it('should reset component with reset method', async () => {
      element.value = 'test value';
      element.rules = [{ type: 'required', message: 'Required' }];
      element.validate();

      element.reset();
      expect(element.value).toBe('');
      expect((element as any)._hasBeenValidated).toBe(false);
      expect(element.isValid()).toBe(true);
    });

    it('should focus input with focus method', async () => {
      const focusSpy = vi.fn();
      const input = element.querySelector('#test-input') as HTMLInputElement;
      input.focus = focusSpy;

      element.focus();
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('Event Dispatching', () => {
    it('should dispatch validation-change event when validation occurs', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('validation-change', (_e: Event) => {
        eventFired = true;
        eventDetail = (_e as CustomEvent).detail;
      });

      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = 'test value';
      element.validate();

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeTruthy();
      expect(eventDetail.value).toBe('test value');
      expect(eventDetail.isValid).toBe(true);
      expect(eventDetail.hasBeenValidated).toBe(true);
    });

    it('should dispatch validation-change event with error details', async () => {
      let eventDetail: any = null;

      element.addEventListener('validation-change', (_e: Event) => {
        eventDetail = (_e as CustomEvent).detail;
      });

      element.rules = [{ type: 'required', message: 'This is required' }];
      element.validate();

      expect(eventDetail.isValid).toBe(false);
      expect(eventDetail.errors).toContain('This is required');
    });

    it('should bubble validation-change events', async () => {
      let parentEventFired = false;

      document.body.addEventListener('validation-change', () => {
        parentEventFired = true;
      });

      element.validate();
      expect(parentEventFired).toBe(true);

      document.body.removeEventListener('validation-change', () => {});
    });
  });

  describe('ARIA and Accessibility', () => {
    it('should have correct aria-describedby when hint is present', async () => {
      element.hint = 'This is a helpful hint';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('#test-input') as HTMLInputElement;
      expect(await waitForARIAAttribute(input, 'aria-describedby')).toBe('test-input-hint');

      const hint = element.querySelector('#test-input-hint');
      expect(hint?.textContent).toBe('This is a helpful hint');
    });

    it('should update aria-describedby when validation fails', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const input = element.querySelector('#test-input') as HTMLInputElement;
      expect(await waitForARIAAttribute(input, 'aria-describedby')).toBe('test-input-error');
    });

    it('should combine hint and error in aria-describedby', async () => {
      element.hint = 'Helpful hint';
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const input = element.querySelector('#test-input') as HTMLInputElement;
      expect(await waitForARIAAttribute(input, 'aria-describedby')).toBe(
        'test-input-hint test-input-error'
      );
    });

    it('should have correct role attributes for messages', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = 'valid';
      element.showSuccessState = true;
      await waitForUpdate(element);

      // Test error message role
      element.value = '';
      element.validate();
      await waitForUpdate(element);

      const errorMessage = element.querySelector('.usa-error-message');
      expect(errorMessage?.getAttribute('role')).toBe('alert');

      // Test success message role
      element.value = 'valid';
      element.validate();
      await waitForUpdate(element);

      const successMessage = element.querySelector('.usa-alert--success');
      expect(successMessage?.getAttribute('role')).toBe('status');
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/validation/usa-validation.ts`;
        const validation = validateComponentJavaScript(componentPath, 'validation');

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
    it('should handle multiple validation rules correctly', async () => {
      element.rules = [
        { type: 'required', message: 'Required' },
        { type: 'minlength', minlength: 5, message: 'Too short' },
        { type: 'email', message: 'Invalid email' },
      ];

      // Should fail all three rules
      element.value = '';
      const result1 = element.validate();
      expect(result1.errors.length).toBe(1); // Only required fails for empty value

      // Should fail minlength and email
      element.value = 'abc';
      const result2 = element.validate();
      expect(result2.errors.length).toBe(2); // minlength and email fail

      // Should pass all rules
      element.value = 'test@example.com';
      const result3 = element.validate();
      expect(result3.isValid).toBe(true);
    });

    it('should handle empty rules array', async () => {
      element.rules = [];
      element.value = 'any value';

      const result = element.validate();
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle disabled and readonly states', async () => {
      element.disabled = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('#test-input') as HTMLInputElement;
      expect(input.disabled).toBe(true);

      element.disabled = false;
      element.readonly = true;
      await waitForUpdate(element);

      expect(input.disabled).toBe(false);
      expect(input.readOnly).toBe(true);
    });

    it('should validate only non-empty values for optional rules', async () => {
      element.rules = [{ type: 'email', message: 'Invalid email' }];

      // Empty value should pass (not required)
      element.value = '';
      const result1 = element.validate();
      expect(result1.isValid).toBe(true);

      // Non-empty invalid value should fail
      element.value = 'invalid';
      const result2 = element.validate();
      expect(result2.isValid).toBe(false);
    });

    it('should handle rule property updates', async () => {
      const initialRules = [{ type: 'required', message: 'Required' }];
      element.rules = initialRules;

      const newRules = [...initialRules, { type: 'minlength', minlength: 3, message: 'Too short' }];
      element.rules = newRules;

      element.value = 'x';
      const result = element.validate();
      expect(result.errors.length).toBe(1); // Only minlength fails, required passes
    });

    it('should maintain validation state through property changes', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      element.validate(); // Make invalid
      expect((element as any)._hasBeenValidated).toBe(true);

      // Update unrelated properties
      element.label = 'New label';
      element.hint = 'New hint';
      await waitForUpdate(element);

      // Should still be validated and invalid
      expect((element as any)._hasBeenValidated).toBe(true);
      expect(element.isValid()).toBe(false);
    });

    it('should handle rapid validation calls', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];

      // Rapidly call validate multiple times
      const results = [element.validate(), element.validate(), element.validate()];

      results.forEach((result) => {
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Required');
      });
    });

    it('should handle default messages when none provided', async () => {
      element.rules = [
        { type: 'required', message: '' },
        { type: 'email', message: '' },
        { type: 'url', message: '' },
        { type: 'pattern', pattern: '\\d+', message: '' },
        { type: 'minlength', minlength: 5, message: '' },
      ];

      element.value = 'x'; // Will fail multiple rules
      const result = element.validate();

      expect(result.errors.some((error) => error.includes('required'))).toBe(false); // Required passes
      expect(result.errors.some((error) => error.includes('email'))).toBe(true);
      expect(result.errors.some((error) => error.includes('characters'))).toBe(true);
    });
  });
});
