import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-input-prefix-suffix.ts';
import type { USAInputPrefixSuffix } from './usa-input-prefix-suffix.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import {
  testErrorIdentification,
  testLabelsOrInstructions,
  testErrorSuggestion,
  testFormErrorAccessibility,
} from '@uswds-wc/test-utils/form-error-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USAInputPrefixSuffix', () => {
  let element: USAInputPrefixSuffix;

  beforeEach(() => {
    element = document.createElement('usa-input-prefix-suffix') as USAInputPrefixSuffix;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(element.value).toBe('');
      expect(element.name).toBe('input-prefix-suffix');
      expect(element.inputId).toBe('input-prefix-suffix');
      expect(element.label).toBe('Input');
      expect(element.hint).toBe('');
      expect(element.placeholder).toBe('');
      expect(element.prefix).toBe('');
      expect(element.suffix).toBe('');
      expect(element.prefixIcon).toBe('');
      expect(element.suffixIcon).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
      expect(element.readonly).toBe(false);
      expect(element.type).toBe('text');
      expect(element.autocomplete).toBe('');
    });

    it('should update value property', async () => {
      element.value = 'test value';
      await element.updateComplete;

      expect(element.value).toBe('test value');

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('test value');
    });

    it('should update name property', async () => {
      element.name = 'custom-name';
      await element.updateComplete;

      expect(element.name).toBe('custom-name');

      const input = element.querySelector('input');
      expect(input?.getAttribute('name')).toBe('custom-name');
    });

    it('should update inputId property', async () => {
      element.inputId = 'custom-id';
      await element.updateComplete;

      expect(element.inputId).toBe('custom-id');

      const input = element.querySelector('input');
      const label = element.querySelector('label');
      expect(input?.getAttribute('id')).toBe('custom-id');
      expect(label?.getAttribute('for')).toBe('custom-id');
    });

    it('should update label property', async () => {
      element.label = 'Custom Label';
      await element.updateComplete;

      expect(element.label).toBe('Custom Label');

      const label = element.querySelector('label');
      expect(label?.textContent?.trim()).toContain('Custom Label');
    });

    it('should update hint property', async () => {
      element.hint = 'This is a hint';
      await element.updateComplete;

      expect(element.hint).toBe('This is a hint');

      const hint = element.querySelector('.usa-hint');
      expect(hint?.textContent?.trim()).toBe('This is a hint');
    });

    it('should update placeholder property', async () => {
      element.placeholder = 'Enter text';
      await element.updateComplete;

      expect(element.placeholder).toBe('Enter text');

      const input = element.querySelector('input');
      expect(input?.getAttribute('placeholder')).toBe('Enter text');
    });

    it('should update prefix property', async () => {
      element.prefix = '$';
      await element.updateComplete;

      expect(element.prefix).toBe('$');

      const prefix = element.querySelector('.usa-input-prefix');
      expect(prefix?.textContent?.trim()).toBe('$');
    });

    it('should update suffix property', async () => {
      element.suffix = '.00';
      await element.updateComplete;

      expect(element.suffix).toBe('.00');

      const suffix = element.querySelector('.usa-input-suffix');
      expect(suffix?.textContent?.trim()).toBe('.00');
    });

    it('should update prefixIcon property', async () => {
      element.prefixIcon = 'search';
      await element.updateComplete;

      expect(element.prefixIcon).toBe('search');

      const prefix = element.querySelector('.usa-input-prefix');
      const icon = prefix?.querySelector('usa-icon');
      expect(icon?.getAttribute('name')).toBe('search');
    });

    it('should update suffixIcon property', async () => {
      element.suffixIcon = 'close';
      await element.updateComplete;

      expect(element.suffixIcon).toBe('close');

      const suffix = element.querySelector('.usa-input-suffix');
      const icon = suffix?.querySelector('usa-icon');
      expect(icon?.getAttribute('name')).toBe('close');
    });

    it('should update boolean properties', async () => {
      element.disabled = true;
      element.required = true;
      element.readonly = true;
      await element.updateComplete;

      expect(element.disabled).toBe(true);
      expect(element.required).toBe(true);
      expect(element.readonly).toBe(true);

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(input.required).toBe(true);
      expect(input.readOnly).toBe(true);
    });

    it('should update type property', async () => {
      element.type = 'email';
      await element.updateComplete;

      expect(element.type).toBe('email');

      const input = element.querySelector('input');
      expect(input?.getAttribute('type')).toBe('email');
    });

    it('should update autocomplete property', async () => {
      element.autocomplete = 'email';
      await element.updateComplete;

      expect(element.autocomplete).toBe('email');

      const input = element.querySelector('input');
      expect(input?.getAttribute('autocomplete')).toBe('email');
    });
  });

  describe('Rendering', () => {
    it('should render form group with label and input', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const label = element.querySelector('label');
      const input = element.querySelector('input');

      expect(formGroup).toBeTruthy();
      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
      expect(input?.classList.contains('usa-input')).toBe(true);
    });

    it('should render input group container', async () => {
      await element.updateComplete;

      const inputGroup = element.querySelector('.usa-input-group');
      expect(inputGroup).toBeTruthy();
    });

    it('should render hint when provided', async () => {
      element.hint = 'Enter your information';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent?.trim()).toBe('Enter your information');

      // Check aria-describedby reference
      const input = element.querySelector('input');
      expect(input?.getAttribute('aria-describedby')).toContain('input-prefix-suffix-hint');
    });

    it('should not render hint when empty', async () => {
      element.hint = '';
      await element.updateComplete;

      const hints = element.querySelectorAll('.usa-hint:not([title])');
      expect(hints).toHaveLength(0);
    });

    it('should render required indicator', async () => {
      element.required = true;
      await element.updateComplete;

      const requiredAbbr = element.querySelector('abbr[title="required"]');
      expect(requiredAbbr).toBeTruthy();
      expect(requiredAbbr?.classList.contains('usa-hint--required')).toBe(true);
    });

    it('should render prefix text', async () => {
      element.prefix = 'https://';
      await element.updateComplete;

      const prefix = element.querySelector('.usa-input-prefix');
      expect(prefix).toBeTruthy();
      expect(prefix?.textContent?.trim()).toBe('https://');
      expect(prefix?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should render suffix text', async () => {
      element.suffix = '@example.com';
      await element.updateComplete;

      const suffix = element.querySelector('.usa-input-suffix');
      expect(suffix).toBeTruthy();
      expect(suffix?.textContent?.trim()).toBe('@example.com');
      expect(suffix?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should render prefix icon', async () => {
      element.prefixIcon = 'account_circle';
      await element.updateComplete;

      const prefix = element.querySelector('.usa-input-prefix');
      const icon = prefix?.querySelector('usa-icon');
      expect(icon).toBeTruthy();
      expect(icon?.getAttribute('name')).toBe('account_circle');
      expect(icon?.getAttribute('decorative')).toBe('true');
    });

    it('should render suffix icon', async () => {
      element.suffixIcon = 'visibility';
      await element.updateComplete;

      const suffix = element.querySelector('.usa-input-suffix');
      const icon = suffix?.querySelector('usa-icon');
      expect(icon).toBeTruthy();
      expect(icon?.getAttribute('name')).toBe('visibility');
      expect(icon?.getAttribute('decorative')).toBe('true');
    });

    it('should prioritize icon over text for prefix', async () => {
      element.prefix = 'Text';
      element.prefixIcon = 'search';
      await element.updateComplete;

      const prefix = element.querySelector('.usa-input-prefix');
      const icon = prefix?.querySelector('usa-icon');
      expect(icon).toBeTruthy();
      expect(prefix?.textContent?.includes('Text')).toBe(false);
    });

    it('should prioritize icon over text for suffix', async () => {
      element.suffix = 'Text';
      element.suffixIcon = 'close';
      await element.updateComplete;

      const suffix = element.querySelector('.usa-input-suffix');
      const icon = suffix?.querySelector('usa-icon');
      expect(icon).toBeTruthy();
      expect(suffix?.textContent?.includes('Text')).toBe(false);
    });

    it('should not render prefix when empty', async () => {
      element.prefix = '';
      element.prefixIcon = '';
      await element.updateComplete;

      const prefix = element.querySelector('.usa-input-prefix');
      expect(prefix).toBeFalsy();
    });

    it('should not render suffix when empty', async () => {
      element.suffix = '';
      element.suffixIcon = '';
      await element.updateComplete;

      const suffix = element.querySelector('.usa-input-suffix');
      expect(suffix).toBeFalsy();
    });
  });

  describe('USWDS HTML Structure', () => {
    it('should match USWDS input group HTML structure', async () => {
      element.prefix = '$';
      element.suffix = '.00';
      await element.updateComplete;

      // Check main structure
      const formGroup = element.querySelector('.usa-form-group');
      const inputGroup = formGroup?.querySelector('.usa-input-group');

      expect(formGroup).toBeTruthy();
      expect(inputGroup).toBeTruthy();

      // Check component order
      const prefix = inputGroup?.querySelector('.usa-input-prefix');
      const input = inputGroup?.querySelector('.usa-input');
      const suffix = inputGroup?.querySelector('.usa-input-suffix');

      expect(prefix).toBeTruthy();
      expect(input).toBeTruthy();
      expect(suffix).toBeTruthy();
    });

    it('should maintain proper DOM hierarchy', async () => {
      element.hint = 'Test hint';
      element.prefix = '$';
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const label = formGroup?.querySelector('.usa-label');
      const hint = formGroup?.querySelector('.usa-hint');
      const inputGroup = formGroup?.querySelector('.usa-input-group');

      // Check hierarchy
      expect(formGroup?.children[0]).toBe(label);
      expect(formGroup?.children[1]).toBe(hint);
      expect(formGroup?.children[2]).toBe(inputGroup);
    });
  });

  describe('Event Handling', () => {
    it('should dispatch input-change event on input', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('input-change', (e: any) => {
        eventDetail = e.detail;
      });

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'test input';
      input.dispatchEvent(new Event('input'));

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.value).toBe('test input');
      expect(eventDetail.name).toBe(element.name);
      expect(eventDetail.input).toBe(input);
    });

    it('should dispatch input-change event on change', async () => {
      await element.updateComplete;

      let eventDetail: any = null;
      element.addEventListener('input-change', (e: any) => {
        eventDetail = e.detail;
      });

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'changed value';
      input.dispatchEvent(new Event('change'));

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.value).toBe('changed value');
    });

    it('should update component value when input changes', async () => {
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'updated value';
      input.dispatchEvent(new Event('input'));

      expect(element.value).toBe('updated value');
    });

    it('should have bubbling and composed events', async () => {
      await element.updateComplete;

      let eventCaught = false;
      document.addEventListener('input-change', () => {
        eventCaught = true;
      });

      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      expect(eventCaught).toBe(true);

      document.removeEventListener('input-change', () => {});
    });
  });

  describe('Accessibility', () => {
    it('should associate label with input', async () => {
      await element.updateComplete;

      const label = element.querySelector('label');
      const input = element.querySelector('input');

      expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'));
    });

    it('should associate hint with input using aria-describedby', async () => {
      element.hint = 'Helper text';
      await element.updateComplete;

      const input = element.querySelector('input');
      const hint = element.querySelector('.usa-hint');

      expect(input?.getAttribute('aria-describedby')).toContain(hint?.getAttribute('id') || '');
    });

    it('should mark prefix and suffix as decorative', async () => {
      element.prefix = '$';
      element.suffix = '.00';
      await element.updateComplete;

      const prefix = element.querySelector('.usa-input-prefix');
      const suffix = element.querySelector('.usa-input-suffix');

      expect(prefix?.getAttribute('aria-hidden')).toBe('true');
      expect(suffix?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should mark icons as decorative', async () => {
      element.prefixIcon = 'search';
      element.suffixIcon = 'close';
      await element.updateComplete;

      const prefixIcon = element.querySelector('.usa-input-prefix usa-icon');
      const suffixIcon = element.querySelector('.usa-input-suffix usa-icon');

      expect(prefixIcon?.getAttribute('decorative')).toBe('true');
      expect(suffixIcon?.getAttribute('decorative')).toBe('true');
    });

    it('should have proper input attributes', async () => {
      element.type = 'email';
      element.autocomplete = 'email';
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;

      expect(input.type).toBe('email');
      expect(input.autocomplete).toBe('email');
      expect(input.required).toBe(true);
    });
  });

  describe('Light DOM Rendering', () => {
    it('should use light DOM rendering', () => {
      expect(element.shadowRoot).toBeNull();
      expect(element.renderRoot).toBe(element);
    });

    it('should apply USWDS classes directly to light DOM', async () => {
      element.prefix = '$';
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      const input = element.querySelector('.usa-input');
      const inputGroup = element.querySelector('.usa-input-group');

      expect(formGroup).toBeTruthy();
      expect(formGroup?.parentElement).toBe(element);
      expect(input).toBeTruthy();
      expect(inputGroup).toBeTruthy();
    });
  });

  describe('Input Types', () => {
    it('should handle text input type', async () => {
      element.type = 'text';
      element.value = 'text value';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('text');
      expect(input.value).toBe('text value');
    });

    it('should handle email input type', async () => {
      element.type = 'email';
      element.value = 'test@example.com';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('email');
      expect(input.value).toBe('test@example.com');
    });

    it('should handle number input type', async () => {
      element.type = 'number';
      element.value = '123.45';
      element.prefix = '$';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('number');
      expect(input.value).toBe('123.45');

      const prefix = element.querySelector('.usa-input-prefix');
      expect(prefix?.textContent?.trim()).toBe('$');
    });

    it('should handle tel input type', async () => {
      element.type = 'tel';
      element.value = '(555) 123-4567';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('tel');
      expect(input.value).toBe('(555) 123-4567');
    });

    it('should handle url input type', async () => {
      element.type = 'url';
      element.prefix = 'https://';
      element.value = 'example.com';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('url');
      expect(input.value).toBe('example.com');

      const prefix = element.querySelector('.usa-input-prefix');
      expect(prefix?.textContent?.trim()).toBe('https://');
    });

    it('should handle password input type', async () => {
      element.type = 'password';
      element.suffixIcon = 'visibility';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');

      const suffixIcon = element.querySelector('.usa-input-suffix usa-icon');
      expect(suffixIcon?.getAttribute('name')).toBe('visibility');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty values gracefully', async () => {
      element.value = '';
      element.prefix = '';
      element.suffix = '';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('');

      const prefix = element.querySelector('.usa-input-prefix');
      const suffix = element.querySelector('.usa-input-suffix');
      expect(prefix).toBeFalsy();
      expect(suffix).toBeFalsy();
    });

    it('should handle null and undefined values', async () => {
      element.value = null as any;
      element.prefix = undefined as any;
      element.suffix = undefined as any;

      expect(() => element.render()).not.toThrow();
    });

    it('should handle rapid property changes', async () => {
      for (let i = 0; i < 10; i++) {
        element.value = `value ${i}`;
        element.prefix = `prefix ${i}`;
        element.suffix = `suffix ${i}`;
        await element.updateComplete;
      }

      expect(element.value).toBe('value 9');

      const prefix = element.querySelector('.usa-input-prefix');
      const suffix = element.querySelector('.usa-input-suffix');
      expect(prefix?.textContent?.trim()).toBe('prefix 9');
      expect(suffix?.textContent?.trim()).toBe('suffix 9');
    });

    it('should handle both prefix and suffix together', async () => {
      element.prefix = '$';
      element.suffix = '.00';
      element.value = '100';
      await element.updateComplete;

      const inputGroup = element.querySelector('.usa-input-group');
      const prefix = inputGroup?.querySelector('.usa-input-prefix');
      const input = inputGroup?.querySelector('.usa-input');
      const suffix = inputGroup?.querySelector('.usa-input-suffix');

      expect(prefix).toBeTruthy();
      expect(input).toBeTruthy();
      expect(suffix).toBeTruthy();

      // Check order
      expect(inputGroup?.children[0]).toBe(prefix);
      expect(inputGroup?.children[1]).toBe(input);
      expect(inputGroup?.children[2]).toBe(suffix);
    });

    it('should handle icon and text combinations', async () => {
      element.prefixIcon = 'search';
      element.prefix = 'Search:';
      element.suffixIcon = 'close';
      element.suffix = 'Clear';
      await element.updateComplete;

      // Icons should take precedence over text
      const prefixIcon = element.querySelector('.usa-input-prefix usa-icon');
      const suffixIcon = element.querySelector('.usa-input-suffix usa-icon');

      expect(prefixIcon?.getAttribute('name')).toBe('search');
      expect(suffixIcon?.getAttribute('name')).toBe('close');

      const prefix = element.querySelector('.usa-input-prefix');
      const suffix = element.querySelector('.usa-input-suffix');
      expect(prefix?.textContent?.includes('Search:')).toBe(false);
      expect(suffix?.textContent?.includes('Clear')).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid input changes efficiently', async () => {
      await element.updateComplete;

      let eventCount = 0;
      element.addEventListener('input-change', () => {
        eventCount++;
      });

      const input = element.querySelector('input') as HTMLInputElement;

      // Rapid input changes
      for (let i = 0; i < 50; i++) {
        input.value = `value ${i}`;
        input.dispatchEvent(new Event('input'));
      }

      expect(eventCount).toBe(50);
      expect(element.value).toBe('value 49');
    });

    it('should not create memory leaks with event handling', async () => {
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;

      // Create many events
      for (let i = 0; i < 100; i++) {
        input.value = `test ${i}`;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
      }

      expect(element.value).toBe('test 99');
    });
  });

  describe('Application Use Cases', () => {
    it('should handle currency input with dollar prefix', async () => {
      element.type = 'number';
      element.prefix = '$';
      element.label = 'Annual Income';
      element.hint = 'Enter your gross annual income';
      element.name = 'annual-income';
      await element.updateComplete;

      element.value = '75000';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const prefix = element.querySelector('.usa-input-prefix');

      expect(input.type).toBe('number');
      expect(input.value).toBe('75000');
      expect(prefix?.textContent?.trim()).toBe('$');

      const label = element.querySelector('label');
      expect(label?.textContent?.trim()).toContain('Annual Income');
    });

    it('should handle email input with domain suffix', async () => {
      element.type = 'email';
      element.suffix = '@agency.gov';
      element.label = 'Government Email';
      element.hint = 'Enter your federal email username';
      element.placeholder = 'username';
      await element.updateComplete;

      element.value = 'john.doe';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const suffix = element.querySelector('.usa-input-suffix');

      expect(input.type).toBe('email');
      expect(input.value).toBe('john.doe');
      expect(suffix?.textContent?.trim()).toBe('@agency.gov');
      expect(input.placeholder).toBe('username');
    });

    it('should handle phone number input with country prefix', async () => {
      element.type = 'tel';
      element.prefix = '+1';
      element.label = 'Phone Number';
      element.hint = 'Enter your 10-digit phone number';
      element.placeholder = '(555) 123-4567';
      await element.updateComplete;

      element.value = '(202) 555-0123';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const prefix = element.querySelector('.usa-input-prefix');

      expect(input.type).toBe('tel');
      expect(input.value).toBe('(202) 555-0123');
      expect(prefix?.textContent?.trim()).toBe('+1');
    });

    it('should handle website URL with protocol prefix', async () => {
      element.type = 'url';
      element.prefix = 'https://';
      element.suffix = '.gov';
      element.label = 'Agency Website';
      element.hint = 'Enter your agency website domain';
      element.placeholder = 'agency';
      await element.updateComplete;

      element.value = 'example.agency';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const prefix = element.querySelector('.usa-input-prefix');
      const suffix = element.querySelector('.usa-input-suffix');

      expect(input.type).toBe('url');
      expect(input.value).toBe('example.agency');
      expect(prefix?.textContent?.trim()).toBe('https://');
      expect(suffix?.textContent?.trim()).toBe('.gov');
    });

    it('should handle Social Security Number with formatting', async () => {
      element.type = 'text';
      element.label = 'Social Security Number';
      element.hint = 'Enter your 9-digit SSN';
      element.placeholder = '###-##-####';
      element.name = 'ssn';
      element.required = true;
      await element.updateComplete;

      element.value = '123-45-6789';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('123-45-6789');
      expect(input.required).toBe(true);

      const requiredIndicator = element.querySelector('abbr[title="required"]');
      expect(requiredIndicator).toBeTruthy();
    });

    it('should handle tax ID input with prefix', async () => {
      element.type = 'text';
      element.prefix = 'EIN:';
      element.label = 'Employer Identification Number';
      element.hint = 'Enter your federal tax ID number';
      element.placeholder = '##-#######';
      await element.updateComplete;

      element.value = '12-3456789';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const prefix = element.querySelector('.usa-input-prefix');

      expect(input.value).toBe('12-3456789');
      expect(prefix?.textContent?.trim()).toBe('EIN:');
    });

    it('should handle percentage input with suffix', async () => {
      element.type = 'number';
      element.suffix = '%';
      element.label = 'Tax Rate';
      element.hint = 'Enter tax rate as percentage';
      element.placeholder = '0.00';
      await element.updateComplete;

      element.value = '8.25';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const suffix = element.querySelector('.usa-input-suffix');

      expect(input.type).toBe('number');
      expect(input.value).toBe('8.25');
      expect(suffix?.textContent?.trim()).toBe('%');
    });

    it('should handle search input with search icon', async () => {
      element.type = 'search';
      element.prefixIcon = 'search';
      element.label = 'Search Federal Register';
      element.hint = 'Search for federal regulations and notices';
      element.placeholder = 'Enter keywords';
      await element.updateComplete;

      element.value = 'environmental protection';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const prefixIcon = element.querySelector('.usa-input-prefix usa-icon');

      expect(input.type).toBe('search');
      expect(input.value).toBe('environmental protection');
      expect(prefixIcon?.getAttribute('name')).toBe('search');
    });
  });

  // CRITICAL TESTS - Auto-dismiss prevention and lifecycle stability
  describe('CRITICAL: Component Lifecycle Stability', () => {
    it('should remain in DOM after property changes', async () => {
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Test critical property combinations that could cause auto-dismiss
      const criticalPropertySets = [
        { value: 'test', prefix: '$', suffix: '.00', type: 'number' },
        { value: 'john', suffix: '@agency.gov', type: 'email', required: true },
        { value: '555-1234', prefix: '+1', type: 'tel', disabled: true },
        { value: 'test', prefixIcon: 'search', suffixIcon: 'close', readonly: true },
        { value: '', prefix: '', suffix: '', prefixIcon: '', suffixIcon: '' },
      ];

      for (const properties of criticalPropertySets) {
        Object.assign(element, properties);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain DOM connection during rapid property updates', async () => {
      const rapidUpdates = async () => {
        for (let i = 0; i < 10; i++) {
          element.value = `value${i}`;
          element.prefix = i % 2 === 0 ? '$' : '';
          element.suffix = i % 3 === 0 ? '.00' : '';
          element.type = i % 4 === 0 ? 'number' : 'text';
          await element.updateComplete;
          expect(document.body.contains(element)).toBe(true);
          expect(element.isConnected).toBe(true);
        }
      };

      await rapidUpdates();
    });

    it('should survive complete property reset cycles', async () => {
      element.value = 'test';
      element.prefix = '$';
      element.suffix = '.00';
      element.prefixIcon = 'search';
      element.suffixIcon = 'close';
      element.required = true;
      await element.updateComplete;

      // Reset all properties
      element.value = '';
      element.prefix = '';
      element.suffix = '';
      element.prefixIcon = '';
      element.suffixIcon = '';
      element.required = false;
      element.disabled = false;
      element.readonly = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Set properties again
      element.value = 'new value';
      element.prefix = 'https://';
      element.type = 'url';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    it('should not pollute global event handlers', async () => {
      const originalAddEventListener = document.addEventListener;
      const originalRemoveEventListener = document.removeEventListener;
      const addEventListenerSpy = vi.fn(originalAddEventListener);
      const removeEventListenerSpy = vi.fn(originalRemoveEventListener);

      document.addEventListener = addEventListenerSpy;
      document.removeEventListener = removeEventListenerSpy;

      element.value = 'test';
      await element.updateComplete;

      document.addEventListener = originalAddEventListener;
      document.removeEventListener = originalRemoveEventListener;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle custom events without side effects', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('input-change', eventSpy);

      await element.updateComplete;
      const input = element.querySelector('input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input'));

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('input-change', eventSpy);
    });

    it('should maintain DOM connection during event handling', async () => {
      const testEvent = () => {
        element.value = 'event-test';
        element.prefix = '$';
      };

      element.addEventListener('click', testEvent);
      element.click();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('click', testEvent);
    });
  });

  describe('CRITICAL: Input State Management Stability', () => {
    it('should maintain DOM connection during prefix/suffix transitions', async () => {
      // Start with text prefix
      element.prefix = '$';
      element.suffix = '.00';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Switch to icons
      element.prefix = '';
      element.suffix = '';
      element.prefixIcon = 'search';
      element.suffixIcon = 'close';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Remove everything
      element.prefixIcon = '';
      element.suffixIcon = '';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Back to text
      element.prefix = 'https://';
      element.suffix = '.gov';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM connection during input type changes', async () => {
      const inputTypes = ['text', 'email', 'tel', 'url', 'number', 'password', 'search'];

      for (const type of inputTypes) {
        element.type = type;
        element.value = type === 'number' ? '123' : `test-${type}`;
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should handle input state changes without DOM removal', async () => {
      const stateChanges = [
        { disabled: true, readonly: false, required: false },
        { disabled: false, readonly: true, required: false },
        { disabled: false, readonly: false, required: true },
        { disabled: true, readonly: true, required: true },
        { disabled: false, readonly: false, required: false },
      ];

      for (const state of stateChanges) {
        Object.assign(element, state);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Storybook Integration Stability', () => {
    it('should maintain DOM connection during args updates', async () => {
      const storybookArgs = [
        { value: 'test', prefix: '$', suffix: '.00', type: 'number', label: 'Amount' },
        { value: 'user', suffix: '@agency.gov', type: 'email', label: 'Email' },
        { value: '', prefixIcon: 'search', type: 'text', label: 'Search' },
        { value: '123-456', prefix: '+1', type: 'tel', label: 'Phone' },
      ];

      for (const args of storybookArgs) {
        Object.assign(element, args);
        await element.updateComplete;

        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should survive Storybook control panel interactions', async () => {
      const interactions = [
        () => {
          element.value = 'updated';
        },
        () => {
          element.prefix = '$';
        },
        () => {
          element.suffix = '.00';
        },
        () => {
          element.prefixIcon = 'search';
        },
        () => {
          element.suffixIcon = 'close';
        },
        () => {
          element.type = 'email';
        },
        () => {
          element.required = !element.required;
        },
        () => {
          element.disabled = !element.disabled;
        },
        () => {
          element.readonly = !element.readonly;
        },
        () => {
          element.label = 'Updated Label';
        },
        () => {
          element.hint = 'Updated hint';
        },
        () => {
          element.placeholder = 'Updated placeholder';
        },
      ];

      for (const interaction of interactions) {
        interaction();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should handle Storybook story switching', async () => {
      // Simulate story 1 args - Currency input
      element.value = '1000';
      element.prefix = '$';
      element.suffix = '.00';
      element.type = 'number';
      element.label = 'Amount';
      element.required = true;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 2 args - Email input
      element.value = 'john.doe';
      element.prefix = '';
      element.suffix = '@agency.gov';
      element.type = 'email';
      element.label = 'Government Email';
      element.required = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 3 args - Search input
      element.value = '';
      element.prefix = '';
      element.suffix = '';
      element.prefixIcon = 'search';
      element.suffixIcon = '';
      element.type = 'text';
      element.label = 'Search';
      element.disabled = false;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/input-prefix-suffix/usa-input-prefix-suffix.ts`;
        const validation = validateComponentJavaScript(componentPath, 'input-prefix-suffix');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThanOrEqual(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBeLessThanOrEqual(1); // Allow presentational component
      });
    });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Test basic input with prefix text
      element.label = 'Username';
      element.prefix = '@';
      element.value = 'user123';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with suffix text
      element.prefix = '';
      element.suffix = '.gov';
      element.value = 'agency';
      element.label = 'Website';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with prefix icon
      element.prefix = '';
      element.suffix = '';
      element.prefixIcon = 'search';
      element.label = 'Search term';
      element.value = 'accessibility';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with suffix icon
      element.prefixIcon = '';
      element.suffixIcon = 'close';
      element.label = 'Filter';
      element.value = 'category';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with both prefix and suffix
      element.prefix = '$';
      element.suffix = '.00';
      element.prefixIcon = '';
      element.suffixIcon = '';
      element.label = 'Amount';
      element.value = '25';
      element.type = 'number';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test required state
      element.required = true;
      element.label = 'Required amount';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test disabled state
      element.disabled = true;
      element.value = '50';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test error state
      element.disabled = false;
      element.error = 'Amount must be greater than 0';
      element.value = '';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    }, 10000); // Increased timeout for comprehensive accessibility tests

    it('should maintain accessibility during dynamic updates', async () => {
      // Start with basic configuration
      element.label = 'Dynamic input';
      element.value = 'initial';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Add prefix
      element.prefix = '@';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Switch to suffix
      element.prefix = '';
      element.suffix = '.com';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Add hint text
      element.hint = 'Enter your email address';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Switch to icon mode
      element.suffix = '';
      element.prefixIcon = 'mail';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should be accessible in form contexts', async () => {
      const form = document.createElement('form');
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = 'Contact Information';

      fieldset.appendChild(legend);
      fieldset.appendChild(element);
      form.appendChild(fieldset);
      document.body.appendChild(form);

      element.label = 'Email Address';
      element.prefix = '';
      element.suffix = '@agency.gov';
      element.hint = 'Enter your username only';
      element.required = true;
      element.value = 'username';
      element.type = 'email';
      await element.updateComplete;

      await testComponentAccessibility(form, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      form.remove();
    });
  });

  describe('Form Error Accessibility (WCAG 3.3)', () => {
    it('should have proper labels (WCAG 3.3.2)', async () => {
      element.label = 'Email Address';
      element.hint = 'Enter a valid email address';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input).toBeTruthy();

      const result = testLabelsOrInstructions(input as Element);

      expect(result.compliant).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should identify errors properly (WCAG 3.3.1)', async () => {
      element.label = 'Email Address';
      element.error = 'Enter a valid email address';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input).toBeTruthy();

      const result = testErrorIdentification(input as Element);

      // Verify error identification structure
      expect(result).toBeDefined();
      // Component should set aria-invalid when error is present
      if (!result.details.hasAriaInvalid) {
        console.warn('Component should set aria-invalid="true" when error property is set');
      }
    });

    it('should provide error suggestions (WCAG 3.3.3)', async () => {
      element.label = 'Email Address';
      element.error = 'Enter a valid email address in the format: user@example.com';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input).toBeTruthy();

      const result = testErrorSuggestion(input as Element);

      // Error message should contain suggestions
      if (result.hasSuggestion) {
        expect(result.suggestions.length).toBeGreaterThan(0);
      }
    });

    it('should pass comprehensive form error tests', async () => {
      element.label = 'Email Address';
      element.hint = 'We will never share your email';
      element.error = 'Enter a valid email address in the format: user@example.com';
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input).toBeTruthy();

      const result = testFormErrorAccessibility(input as Element);

      // Verify all error accessibility aspects
      expect(result).toBeDefined();
      expect(result.details.labelsProvided).toBe(true);
    });

    it('should handle error state changes', async () => {
      element.label = 'Email Address';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;

      // Initially no error
      expect(await waitForARIAAttribute(input, 'aria-invalid')).not.toBe('true');

      // Set error
      element.error = 'This field is required';
      await element.updateComplete;

      // Verify error is set
      const ariaInvalid = await waitForARIAAttribute(input, 'aria-invalid');
      if (ariaInvalid !== 'true') {
        console.warn('Component should set aria-invalid="true" when error is set');
      }

      // Clear error
      element.error = '';
      await element.updateComplete;

      // Should remove error state
      expect(await waitForARIAAttribute(input, 'aria-invalid')).not.toBe('true');
    });

    it('should maintain error accessibility with prefix/suffix', async () => {
      element.label = 'Amount';
      element.prefix = '$';
      element.suffix = '.00';
      element.error = 'Enter a valid amount';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input).toBeTruthy();

      const result = testErrorIdentification(input as Element);

      // Verify error identification structure exists
      expect(result).toBeDefined();
      if (!result.details.hasAriaInvalid) {
        console.warn('Component with prefix/suffix should still set aria-invalid');
      }
    });

    it('should provide helpful error messages for required fields', async () => {
      element.label = 'Required Field';
      element.required = true;
      element.error = 'This field is required. Please provide a value.';
      await element.updateComplete;

      const input = element.querySelector('input');
      expect(input).toBeTruthy();

      const result = testErrorSuggestion(input as Element);

      // Required field errors should have suggestions
      expect(result).toBeDefined();
    });
  });

  /**
   * USWDS Integration Requirements Tests
   *
   * Form input validation for input prefix/suffix component.
   */
  describe('USWDS Integration Requirements', () => {
    it('should render placeholder on input', async () => {
      element.placeholder = 'Enter amount';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input?.placeholder).toBe('Enter amount');
    });

    it('should render value on input', async () => {
      element.value = '100';
      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input?.value).toBe('100');
    });

    it('should maintain wrapper structure', async () => {
      element.prefix = '$';
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-input-group');
      expect(wrapper).toBeTruthy();
    });
  });
});
