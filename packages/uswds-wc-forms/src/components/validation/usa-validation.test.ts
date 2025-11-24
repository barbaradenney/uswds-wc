import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-validation.ts';
import type { USAValidation, ValidationRule } from './usa-validation.js';
import {
  waitForUpdate,
  testPropertyChanges,
  assertDOMStructure,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAValidation', () => {
  let element: USAValidation;

  beforeEach(() => {
    element = document.createElement('usa-validation') as USAValidation;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-VALIDATION');
    });

    it('should have default properties', () => {
      expect(element.value).toBe('');
      expect(element.label).toBe('Input with validation');
      expect(element.hint).toBe('');
      expect(element.name).toBe('validation-input');
      expect(element.inputType).toBe('input');
      expect(element.type).toBe('text');
      expect(element.options).toEqual([]);
      expect(element.rows).toBe(3);
      expect(element.placeholder).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.readonly).toBe(false);
      expect(element.rules).toEqual([]);
      expect(element.validateOnInput).toBe(true);
      expect(element.validateOnBlur).toBe(true);
      expect(element.showSuccessState).toBe(true);
    });

    it('should render form group with input', async () => {
      await waitForUpdate(element);

      assertDOMStructure(element, '.usa-form-group', 1, 'Should have form group');
      assertDOMStructure(element, 'label.usa-label', 1, 'Should have label');
      assertDOMStructure(element, 'input.usa-input', 1, 'Should have input');
    });
  });

  describe('Input Types', () => {
    it('should render text input by default', async () => {
      await waitForUpdate(element);

      const input = element.querySelector('input');
      expect(input).toBeTruthy();
      expect(input?.type).toBe('text');
      expect(input?.classList.contains('usa-input')).toBe(true);
    });

    it('should render textarea when inputType is textarea', async () => {
      element.inputType = 'textarea';
      element.rows = 5;
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea');
      expect(textarea).toBeTruthy();
      expect(textarea?.classList.contains('usa-textarea')).toBe(true);
      expect(textarea?.rows).toBe(5);
    });

    it('should render select when inputType is select', async () => {
      element.inputType = 'select';
      element.options = [
        { value: 'option1', text: 'Option 1' },
        { value: 'option2', text: 'Option 2' },
      ];
      await waitForPropertyPropagation(element);

      const select = element.querySelector('select');
      expect(select).toBeTruthy();
      expect(select?.classList.contains('usa-select')).toBe(true);

      const options = select?.querySelectorAll('option');
      expect(options?.length).toBe(3); // Including default "Choose an option"
      expect(options?.[1]?.value).toBe('option1');
      expect(options?.[1]?.textContent?.trim()).toBe('Option 1');
    });

    it('should handle different input types', async () => {
      await testPropertyChanges(
        element,
        'type',
        ['email', 'password', 'number', 'url'],
        async (el, value) => {
          const input = el.querySelector('input');
          expect(input?.type).toBe(value);
        }
      );
    });
  });

  describe('Validation Rules', () => {
    it('should validate required fields', async () => {
      const requiredRule: ValidationRule = {
        type: 'required',
        message: 'This field is required',
      };
      element.rules = [requiredRule];
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate email format', async () => {
      const emailRule: ValidationRule = {
        type: 'email',
        message: 'Please enter a valid email',
      };
      element.rules = [emailRule];
      element.value = 'invalid-email';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid email');

      element.value = 'test@example.com';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate URL format', async () => {
      const urlRule: ValidationRule = {
        type: 'url',
        message: 'Please enter a valid URL',
      };
      element.rules = [urlRule];
      element.value = 'invalid-url';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid URL');

      element.value = 'https://example.com';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate pattern matching', async () => {
      const patternRule: ValidationRule = {
        type: 'pattern',
        value: '^[A-Z]{2}\\d{4}$',
        message: 'Format: AB1234',
      };
      element.rules = [patternRule];
      element.value = 'invalid';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format: AB1234');

      element.value = 'AB1234';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate minimum length', async () => {
      const minLengthRule: ValidationRule = {
        type: 'minlength',
        value: 8,
        message: 'Must be at least 8 characters',
      };
      element.rules = [minLengthRule];
      element.value = 'short';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be at least 8 characters');

      element.value = 'longenough';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate maximum length', async () => {
      const maxLengthRule: ValidationRule = {
        type: 'maxlength',
        value: 5,
        message: 'Must be no more than 5 characters',
      };
      element.rules = [maxLengthRule];
      element.value = 'toolong';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be no more than 5 characters');

      element.value = 'short';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate minimum value', async () => {
      const minRule: ValidationRule = {
        type: 'min',
        value: 18,
        message: 'Must be at least 18',
      };
      element.rules = [minRule];
      element.value = '15';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be at least 18');

      element.value = '21';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate maximum value', async () => {
      const maxRule: ValidationRule = {
        type: 'max',
        value: 100,
        message: 'Must be no more than 100',
      };
      element.rules = [maxRule];
      element.value = '150';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be no more than 100');

      element.value = '75';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate custom rules', async () => {
      const customRule: ValidationRule = {
        type: 'custom',
        message: 'Must contain "test"',
        validator: (value: string) => value.includes('test'),
      };
      element.rules = [customRule];
      element.value = 'invalid';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must contain "test"');

      element.value = 'testing';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should emit validation-change event', async () => {
      let eventDetail: unknown = null;
      element.addEventListener('validation-change', (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      });

      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = 'test';
      await waitForUpdate(element);

      element.validate();

      expect(eventDetail).toBeTruthy();
      expect((eventDetail as any).value).toBe('test');
      expect((eventDetail as any).isValid).toBe(true);
      expect((eventDetail as any).hasBeenValidated).toBe(true);
    });

    it('should validate on input when enabled', async () => {
      element.validateOnInput = true;
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      await waitForUpdate(element);

      expect(element.value).toBe('test');
    });

    it('should validate on blur when enabled', async () => {
      element.validateOnBlur = true;
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      await waitForUpdate(element);

      expect(element.value).toBe('test');
    });
  });

  describe('Visual States', () => {
    it('should show error state for invalid input', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = '';
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const formGroup = element.querySelector('.usa-form-group');
      const input = element.querySelector('input');

      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);
      expect(input?.classList.contains('usa-input--error')).toBe(true);
    });

    it('should show success state for valid input when enabled', async () => {
      element.showSuccessState = true;
      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = 'valid';
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const input = element.querySelector('input');
      expect(input?.classList.contains('usa-input--success')).toBe(true);
    });

    it('should show required indicator for required fields', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForPropertyPropagation(element);

      const formGroup = element.querySelector('.usa-form-group');
      const requiredIndicator = element.querySelector('abbr[title="required"]');

      expect(formGroup?.classList.contains('usa-form-group--required')).toBe(true);
      expect(requiredIndicator).toBeTruthy();
      expect(requiredIndicator?.textContent).toBe('*');
    });

    it('should display error messages', async () => {
      element.rules = [{ type: 'required', message: 'This is required' }];
      element.value = '';
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const errorMessage = element.querySelector('.usa-error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent?.includes('This is required')).toBe(true);
      expect(errorMessage?.getAttribute('role')).toBe('alert');
    });

    it('should display success message when showSuccessState is true', async () => {
      element.showSuccessState = true;
      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = 'valid';
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const successMessage = element.querySelector('.usa-alert--success');
      expect(successMessage).toBeTruthy();
      expect(successMessage?.getAttribute('role')).toBe('status');
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', async () => {
      element.name = 'test-input';
      element.label = 'Test Label';
      await waitForPropertyPropagation(element);

      const label = element.querySelector('label');
      const input = element.querySelector('input');

      expect(label?.getAttribute('for')).toBe('test-input');
      expect(input?.getAttribute('id')).toBe('test-input');
    });

    it('should associate hint with input using aria-describedby', async () => {
      element.hint = 'This is a hint';
      element.name = 'test-input';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      const hint = element.querySelector('.usa-hint');

      expect(hint?.getAttribute('id')).toBe('test-input-hint');
      expect(input?.getAttribute('aria-describedby')?.includes('test-input-hint')).toBe(true);
    });

    it('should associate error messages with input', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = '';
      element.name = 'test-input';
      await waitForUpdate(element);

      element.validate();
      await waitForUpdate(element);

      const input = element.querySelector('input');
      const errorMessage = element.querySelector('.usa-error-message');

      expect(errorMessage?.getAttribute('id')).toBe('test-input-error');
      expect(input?.getAttribute('aria-describedby')?.includes('test-input-error')).toBe(true);
    });
  });

  describe('Public API Methods', () => {
    it('should validate using validate() method', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = '';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Required');
    });

    it('should clear validation using clearValidation() method', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      element.value = '';
      await waitForUpdate(element);

      element.validate();
      expect(element.isValid()).toBe(false);

      element.clearValidation();
      expect(element.isValid()).toBe(true);
    });

    it('should add rules using addRule() method', async () => {
      await waitForUpdate(element);

      const newRule: ValidationRule = {
        type: 'required',
        message: 'This is required',
      };

      element.addRule(newRule);
      expect(element.rules).toHaveLength(1);
      expect(element.rules[0]).toEqual(newRule);
    });

    it('should remove rules using removeRule() method', async () => {
      element.rules = [
        { type: 'required', message: 'Required' },
        { type: 'email', message: 'Invalid email' },
      ];
      await waitForUpdate(element);

      element.removeRule('email');
      expect(element.rules).toHaveLength(1);
      expect(element.rules[0].type).toBe('required');
    });

    it('should return validation status using isValid() method', async () => {
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForUpdate(element);

      element.value = '';
      element.validate();
      expect(element.isValid()).toBe(false);

      element.value = 'valid';
      element.validate();
      expect(element.isValid()).toBe(true);
    });

    it('should return errors using getErrors() method', async () => {
      element.rules = [
        { type: 'required', message: 'Required' },
        { type: 'minlength', value: 10, message: 'Too short' },
      ];
      element.value = 'short';
      await waitForUpdate(element);

      element.validate();
      const errors = element.getErrors();
      expect(errors).toContain('Too short');
    });

    it('should focus input using focus() method', async () => {
      await waitForUpdate(element);

      const input = element.querySelector('input') as HTMLInputElement;
      const focusSpy = vi.spyOn(input, 'focus');

      element.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should reset using reset() method', async () => {
      element.value = 'test';
      element.rules = [{ type: 'required', message: 'Required' }];
      await waitForUpdate(element);

      element.validate();
      expect(element.value).toBe('test');
      expect(element.isValid()).toBe(true);

      element.reset();
      expect(element.value).toBe('');
      expect(element.isValid()).toBe(true); // Should be cleared
    });
  });

  describe('Government Form Scenarios', () => {
    it('should validate SSN format', async () => {
      const ssnRule: ValidationRule = {
        type: 'pattern',
        value: '^\\d{3}-\\d{2}-\\d{4}$',
        message: 'SSN must be in format: XXX-XX-XXXX',
      };
      element.rules = [ssnRule];
      element.value = '123456789';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);

      element.value = '123-45-6789';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate federal employee ID format', async () => {
      const fedIdRule: ValidationRule = {
        type: 'pattern',
        value: '^[A-Z]{2}\\d{8}$',
        message: 'Federal ID must be 2 letters followed by 8 numbers',
      };
      element.rules = [fedIdRule];
      element.value = 'ABC123456';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);

      element.value = 'AB12345678';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate government email domains', async () => {
      const govEmailRule: ValidationRule = {
        type: 'custom',
        message: 'Must use a .gov or .mil email address',
        validator: (value: string) => /^[^\s@]+@[^\s@]+\.(gov|mil)$/.test(value),
      };
      element.rules = [govEmailRule];
      element.value = 'user@example.com';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);

      element.value = 'user@agency.gov';
      const validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });

    it('should validate ZIP+4 format', async () => {
      const zipRule: ValidationRule = {
        type: 'pattern',
        value: '^\\d{5}(-\\d{4})?$',
        message: 'ZIP code must be 5 digits or ZIP+4 format',
      };
      element.rules = [zipRule];
      element.value = '1234';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);

      element.value = '12345';
      let validResult = element.validate();
      expect(validResult.isValid).toBe(true);

      element.value = '12345-6789';
      validResult = element.validate();
      expect(validResult.isValid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rules array', async () => {
      element.rules = [];
      element.value = 'anything';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle multiple validation errors', async () => {
      element.rules = [
        { type: 'required', message: 'Required' },
        { type: 'minlength', value: 5, message: 'Too short' },
        { type: 'email', message: 'Invalid email' },
      ];
      element.value = 'a';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // minlength and email errors
    });

    it('should validate only when value exists for non-required rules', async () => {
      element.rules = [
        { type: 'email', message: 'Invalid email' },
        { type: 'minlength', value: 5, message: 'Too short' },
      ];
      element.value = '';
      await waitForUpdate(element);

      const result = element.validate();
      expect(result.isValid).toBe(true); // Empty value should pass non-required validations
    });

    it('should handle disabled state', async () => {
      element.disabled = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      expect(input?.disabled).toBe(true);
    });

    it('should handle readonly state', async () => {
      element.readonly = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      expect(input?.readOnly).toBe(true);
    });
  });

  // CRITICAL TESTS - Component Lifecycle Stability (Auto-dismiss Prevention)
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.value = 'test@example.gov';
      element.label = 'Federal Email Address';
      element.hint = 'Use your official .gov email address';
      element.name = 'federal-email';
      element.inputType = 'input';
      element.type = 'email';
      element.placeholder = 'name@agency.gov';
      element.disabled = false;
      element.readonly = false;
      element.rules = [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Must be a valid email address' },
        { type: 'pattern', pattern: '.*\\.gov$', message: 'Must be a .gov email address' },
      ];
      element.validateOnInput = true;
      element.validateOnBlur = true;
      element.showSuccessState = true;
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain component state during rapid property changes', async () => {
      const initialParent = element.parentNode;

      // Rapid property changes that could trigger lifecycle issues
      for (let i = 0; i < 10; i++) {
        element.value = `test${i}@agency.gov`;
        element.label = `Validation Field ${i}`;
        element.hint = `Hint ${i}`;
        element.name = `field-${i}`;
        element.inputType = i % 2 === 0 ? 'input' : 'textarea';
        element.type = i % 3 === 0 ? 'email' : 'text';
        element.placeholder = `Enter value ${i}`;
        element.disabled = i % 4 === 0;
        element.readonly = i % 5 === 0;
        element.validateOnInput = i % 2 === 0;
        element.validateOnBlur = i % 3 === 0;
        element.showSuccessState = i % 4 === 0;
        element.rules = [
          { type: 'required', message: `Field ${i} is required` },
          { type: 'minlength', minlength: 3, message: `Minimum 3 characters for field ${i}` },
        ];
        await element.updateComplete;
      }

      expect(element.parentNode).toBe(initialParent);
      expect(element.isConnected).toBe(true);
    });

    it('should handle complex validation operations without disconnection', async () => {
      // Complex validation scenarios
      const validationScenarios = [
        {
          value: '',
          rules: [{ type: 'required', message: 'Required field' }],
          inputType: 'input',
        },
        {
          value: 'test@agency.gov',
          rules: [
            { type: 'email', message: 'Invalid email' },
            { type: 'pattern', pattern: '.*\\.gov$', message: 'Must be .gov' },
          ],
          inputType: 'input',
        },
        {
          value: 'Short description for federal form',
          rules: [
            { type: 'minlength', minlength: 10, message: 'Too short' },
            { type: 'maxlength', maxlength: 500, message: 'Too long' },
          ],
          inputType: 'textarea',
        },
        {
          value: 'option-2',
          rules: [{ type: 'required', message: 'Selection required' }],
          inputType: 'select',
          options: [
            { value: '', label: 'Select an option' },
            { value: 'option-1', label: 'Option 1' },
            { value: 'option-2', label: 'Option 2' },
          ],
        },
      ];

      for (const scenario of validationScenarios) {
        element.value = scenario.value;
        element.rules = scenario.rules;
        element.inputType = scenario.inputType;
        if (scenario.options) {
          element.options = scenario.options;
        }
        await element.updateComplete;

        // Trigger validation
        element.validate();
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Event System Stability (CRITICAL)', () => {
    it('should not interfere with other components after event handling', async () => {
      const eventsSpy = vi.fn();
      element.addEventListener('validation-change', eventsSpy);
      element.addEventListener('input-change', eventsSpy);

      element.value = 'initial@agency.gov';
      element.rules = [
        { type: 'required', message: 'Email required' },
        { type: 'email', message: 'Invalid email' },
      ];
      element.validateOnInput = true;
      await element.updateComplete;

      // Trigger multiple validation events
      const input = element.querySelector('input') as HTMLInputElement;

      input.value = 'test@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await element.updateComplete;

      input.value = 'valid@agency.gov';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle rapid validation operations without component removal', async () => {
      element.rules = [
        { type: 'required', message: 'Required' },
        { type: 'minlength', minlength: 5, message: 'Too short' },
        { type: 'email', message: 'Invalid email' },
      ];
      element.validateOnInput = true;
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const testValues = [
        '',
        'a',
        'ab',
        'abc',
        'test',
        'test@',
        'test@example',
        'test@example.com',
        'valid@agency.gov',
      ];

      // Rapid validation simulation
      for (let i = 0; i < 15; i++) {
        const value = testValues[i % testValues.length];
        element.value = value;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        element.validate();
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle event pollution without component removal', async () => {
      // Create potential event pollution
      for (let i = 0; i < 20; i++) {
        const customEvent = new CustomEvent(`test-event-${i}`, { bubbles: true });
        element.dispatchEvent(customEvent);
      }

      element.label = 'Event Test Validation Field';
      element.value = 'test@agency.gov';
      element.rules = [
        { type: 'required', message: 'Required' },
        { type: 'email', message: 'Invalid email' },
      ];
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Validation State Management Stability (CRITICAL)', () => {
    it('should handle complex validation rule changes without disconnection', async () => {
      // Test different rule combinations that could trigger lifecycle issues
      const ruleSets = [
        [{ type: 'required', message: 'Required' }],
        [
          { type: 'required', message: 'Required' },
          { type: 'minlength', minlength: 5, message: 'Too short' },
        ],
        [
          { type: 'email', message: 'Invalid email' },
          { type: 'pattern', pattern: '.*\\.gov$', message: 'Must be .gov' },
        ],
        [
          { type: 'required', message: 'Required' },
          { type: 'minlength', minlength: 3, message: 'Too short' },
          { type: 'maxlength', maxlength: 50, message: 'Too long' },
          { type: 'pattern', pattern: '^[A-Za-z0-9@._-]+$', message: 'Invalid characters' },
        ],
      ];

      for (const ruleSet of ruleSets) {
        element.rules = ruleSet;
        element.value = 'test@agency.gov';
        await element.updateComplete;

        // Trigger validation with different states
        element.validate();
        await element.updateComplete;

        // Test with invalid value
        element.value = 'invalid';
        element.validate();
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle input type switching without disconnection', async () => {
      const inputConfigurations = [
        { inputType: 'input', type: 'text', value: 'Text input' },
        { inputType: 'input', type: 'email', value: 'test@agency.gov' },
        { inputType: 'input', type: 'password', value: 'SecurePass123!' },
        { inputType: 'textarea', rows: 5, value: 'Multi-line text content for textarea input' },
        {
          inputType: 'select',
          options: [
            { value: '', label: 'Select option' },
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
          value: 'option1',
        },
      ];

      for (const config of inputConfigurations) {
        element.inputType = config.inputType;
        if (config.type) element.type = config.type;
        if (config.rows) element.rows = config.rows;
        if (config.options) element.options = config.options;
        element.value = config.value;
        await element.updateComplete;

        // Verify appropriate input is rendered
        const renderedInput = element.querySelector(
          `${config.inputType === 'select' ? 'select' : config.inputType}`
        );
        expect(renderedInput).toBeTruthy();
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Storybook Integration (CRITICAL)', () => {
    it('should render in Storybook without auto-dismissing', async () => {
      element.label = 'Storybook Test Federal Email Validation';
      element.hint = 'Enter your official government email address for account verification';
      element.name = 'storybook-federal-email';
      element.inputType = 'input';
      element.type = 'email';
      element.placeholder = 'firstname.lastname@agency.gov';
      element.value = 'john.smith@treasury.gov';
      element.disabled = false;
      element.readonly = false;
      element.rules = [
        { type: 'required', message: 'Federal email address is required for account access' },
        { type: 'email', message: 'Please enter a valid email address format' },
        {
          type: 'pattern',
          pattern: '.*\\.gov$',
          message: 'Email must be from a .gov domain for security purposes',
        },
        {
          type: 'minlength',
          minlength: 10,
          message: 'Email address appears too short to be valid',
        },
      ];
      element.validateOnInput = true;
      element.validateOnBlur = true;
      element.showSuccessState = true;
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(element.querySelector('.usa-form-group')).toBeTruthy();
      expect(element.querySelector('.usa-label')).toBeTruthy();
      expect(element.querySelector('.usa-hint')).toBeTruthy();

      // Verify input field
      const input = element.querySelector('input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.type).toBe('email');
      expect(input.value).toBe('john.smith@treasury.gov');
      expect(input.placeholder).toBe('firstname.lastname@agency.gov');
      expect(input.name).toBe('storybook-federal-email');

      // Verify label content
      const label = element.querySelector('.usa-label');
      expect(label?.textContent?.trim()).toContain('Storybook Test Federal Email Validation');

      // Verify hint content
      const hint = element.querySelector('.usa-hint');
      expect(hint?.textContent?.trim()).toContain('Enter your official government email address');

      // Test validation functionality
      element.validate();
      await element.updateComplete;

      // Should show success state for valid .gov email
      const successIcon = element.querySelector('.usa-input--success');
      expect(successIcon).toBeTruthy();

      // Test with invalid email
      element.value = 'invalid@example.com';
      input.value = 'invalid@example.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      // Should show validation errors
      const errorMessages = element.querySelectorAll('.usa-error-message');
      expect(errorMessages.length).toBeGreaterThan(0);

      // Test with empty value
      element.value = '';
      input.value = '';
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(document.body.contains(element)).toBe(true);
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

  describe('Accessibility', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Set up a basic validation configuration with proper form elements
      const label = document.createElement('label');
      label.textContent = 'Email Address';
      label.setAttribute('for', 'validation-input');

      const input = document.createElement('input');
      input.type = 'email';
      input.id = 'validation-input';
      input.setAttribute('aria-describedby', 'validation-message');

      element.appendChild(label);
      element.appendChild(input);

      element.value = 'test@example.gov';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  /**
   * USWDS Integration Requirements Tests
   *
   * Validation state handling validation.
   */
  describe('USWDS Integration Requirements', () => {
    it('should render error message when provided', async () => {
      element.message = 'This field is required';
      element.valid = false;
      await element.updateComplete;

      const errorMessage = element.querySelector('.usa-error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage?.textContent).toContain('This field is required');
    });

    it('should handle validation state changes', async () => {
      element.valid = false;
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(true);

      element.valid = true;
      await element.updateComplete;

      expect(formGroup?.classList.contains('usa-form-group--error')).toBe(false);
    });

    it('should maintain ARIA attributes for validation', async () => {
      element.message = 'Invalid input';
      element.valid = false;
      await element.updateComplete;

      const errorMessage = element.querySelector('.usa-error-message');
      expect(errorMessage?.getAttribute('role')).toBe('alert');
    });
  });
});
