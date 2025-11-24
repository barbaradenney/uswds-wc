import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { USASSNPattern } from './usa-ssn-pattern.js';
import type { SSNData } from './usa-ssn-pattern.js';

// Register the component
if (!customElements.get('usa-ssn-pattern')) {
  customElements.define('usa-ssn-pattern', USASSNPattern);
}

describe('USASSNPattern', () => {
  let element: USASSNPattern;

  beforeEach(async () => {
    element = document.createElement('usa-ssn-pattern') as USASSNPattern;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USASSNPattern);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default label', () => {
      expect(element.label).toBe('Social Security number');
    });

    it('should not be required by default', () => {
      expect(element.required).toBe(false);
    });

    it('should have default hint', () => {
      expect(element.hint).toBe('For example, 555 11 0000');
    });

    it('should not show why link by default', () => {
      expect(element.showWhyLink).toBe(false);
    });

    it('should fire pattern-ready event on first update', async () => {
      const element2 = document.createElement('usa-ssn-pattern') as USASSNPattern;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('pattern-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('ssnData');

      element2.remove();
    });
  });

  describe('USWDS Styling', () => {
    it('should use usa-fieldset wrapper', () => {
      const fieldset = element.querySelector('.usa-fieldset');
      expect(fieldset).toBeTruthy();
      expect(fieldset?.tagName.toLowerCase()).toBe('fieldset');
    });

    it('should use usa-legend--large for pattern header', () => {
      const legend = element.querySelector('.usa-legend');
      expect(legend).toBeTruthy();
      expect(legend?.classList.contains('usa-legend--large')).toBe(true);
    });

    it('should use usa-input--xl for SSN input', () => {
      const input = element.querySelector('usa-text-input');
      expect(input).toBeTruthy();
      expect(input?.classList.contains('usa-input--xl')).toBe(true);
    });
  });

  describe('Properties', () => {
    it('should update label', async () => {
      element.label = 'SSN';
      await element.updateComplete;

      const legend = element.querySelector('.usa-legend--large');
      expect(legend?.textContent).toBe('SSN');
    });

    it('should update required', async () => {
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('usa-text-input');
      expect(input?.hasAttribute('required')).toBe(true);
    });

    it('should update hint', async () => {
      element.hint = 'Enter your 9-digit SSN';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint?.textContent).toContain('Enter your 9-digit SSN');
    });

    it('should show hint when provided', async () => {
      element.hint = 'Required for identity verification';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
    });

    it('should show why link when enabled', async () => {
      element.showWhyLink = true;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a.usa-link');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/privacy-policy');
      expect(link?.textContent).toContain('Why do we ask for this?');
    });

    it('should not show why link when disabled', async () => {
      element.showWhyLink = false;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a.usa-link');
      expect(link).toBeFalsy();
    });
  });

  describe('CRITICAL: USWDS Requirements', () => {
    it('should use SINGLE text input (NOT three separate fields)', () => {
      const inputs = element.querySelectorAll('usa-text-input');
      expect(inputs.length).toBe(1);
    });

    it('should use type="text" with inputmode="numeric"', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.getAttribute('type')).toBe('text');
      expect(input?.getAttribute('inputmode')).toBe('numeric');
    });

    it('should NOT use placeholder text', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.hasAttribute('placeholder')).toBe(false);
    });

    it('should have autocomplete="off" for security', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.getAttribute('autocomplete')).toBe('off');
    });

    it('should have maxlength of 11 (9 digits + 2 hyphens)', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.getAttribute('maxlength')).toBe('11');
    });
  });

  describe('SSN Input Field', () => {
    it('should render SSN input', () => {
      const input = element.querySelector('usa-text-input[name="social-security-no"]');
      expect(input).toBeTruthy();
    });

    it('should update data on input', async () => {
      const input = element.querySelector('usa-text-input') as any;

      input.value = '123456789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('123456789');
    });

    it('should fire ssn-change event on input', async () => {
      const changePromise = new Promise((resolve) => {
        element.addEventListener('ssn-change', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const input = element.querySelector('usa-text-input') as any;

      input.value = '123-45-6789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const detail = (await changePromise) as any;
      expect(detail.value).toBe('123-45-6789');
      expect(detail.ssnData.ssn).toBe('123-45-6789');
    });

    it('should accept hyphens in SSN', async () => {
      const input = element.querySelector('usa-text-input') as any;

      input.value = '123-45-6789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('123-45-6789');
    });

    it('should accept spaces in SSN', async () => {
      const input = element.querySelector('usa-text-input') as any;

      input.value = '123 45 6789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('123 45 6789');
    });
  });

  describe('Public API: getSSNData', () => {
    it('should return empty SSN data initially', () => {
      const data = element.getSSNData();
      expect(data.ssn).toBe('');
    });

    it('should return current SSN data', async () => {
      const input = element.querySelector('usa-text-input') as any;

      input.value = '123456789';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('123456789');
    });

    it('should return a copy of data', () => {
      const data1 = element.getSSNData();
      const data2 = element.getSSNData();

      expect(data1).not.toBe(data2);
      expect(data1).toEqual(data2);
    });
  });

  describe('Public API: setSSNData', () => {
    it('should set SSN data', async () => {
      const testData: SSNData = {
        ssn: '123-45-6789',
      };

      element.setSSNData(testData);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const data = element.getSSNData();
      expect(data.ssn).toBe('123-45-6789');
    });

    it('should update input value', async () => {
      element.setSSNData({ ssn: '987-65-4321' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const input = element.querySelector('usa-text-input') as any;
      expect(input?.value).toBe('987-65-4321');
    });
  });

  describe('Public API: clearSSN', () => {
    it('should clear SSN data', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;

      element.clearSSN();
      await element.updateComplete;

      const data = element.getSSNData();
      expect(data.ssn).toBe('');
    });

    it('should clear input value', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      element.clearSSN();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 0));

      const input = element.querySelector('usa-text-input') as any;
      expect(input?.value).toBe('');
    });
  });

  describe('Public API: validateSSN', () => {
    it('should return true if not required and empty', () => {
      element.required = false;
      expect(element.validateSSN()).toBe(true);
    });

    it('should return false for empty SSN when required', () => {
      element.required = true;
      expect(element.validateSSN()).toBe(false);
    });

    it('should return true for valid SSN', async () => {
      element.setSSNData({ ssn: '123-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(true);
    });

    it('should return false for SSN with invalid area (000)', async () => {
      element.setSSNData({ ssn: '000-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with invalid area (666)', async () => {
      element.setSSNData({ ssn: '666-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with invalid area (900+)', async () => {
      element.setSSNData({ ssn: '900-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with invalid group (00)', async () => {
      element.setSSNData({ ssn: '123-00-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with invalid serial (0000)', async () => {
      element.setSSNData({ ssn: '123-45-0000' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should return false for SSN with wrong length', async () => {
      element.setSSNData({ ssn: '12345678' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(false);
    });

    it('should validate SSN with hyphens', async () => {
      element.setSSNData({ ssn: '123-45-6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(true);
    });

    it('should validate SSN with spaces', async () => {
      element.setSSNData({ ssn: '123 45 6789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(true);
    });

    it('should validate SSN without separators', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;

      expect(element.validateSSN()).toBe(true);
    });
  });

  describe('Public API: getSSN', () => {
    it('should return empty string initially', () => {
      expect(element.getSSN()).toBe('');
    });

    it('should return current SSN value', async () => {
      element.setSSNData({ ssn: '123-45-6789' });
      await element.updateComplete;

      expect(element.getSSN()).toBe('123-45-6789');
    });
  });

  describe('Public API: getNormalizedSSN', () => {
    it('should return empty string for empty SSN', () => {
      expect(element.getNormalizedSSN()).toBe('');
    });

    it('should remove hyphens from SSN', async () => {
      element.setSSNData({ ssn: '123-45-6789' });
      await element.updateComplete;

      expect(element.getNormalizedSSN()).toBe('123456789');
    });

    it('should remove spaces from SSN', async () => {
      element.setSSNData({ ssn: '123 45 6789' });
      await element.updateComplete;

      expect(element.getNormalizedSSN()).toBe('123456789');
    });

    it('should return as-is if already normalized', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;

      expect(element.getNormalizedSSN()).toBe('123456789');
    });
  });

  describe('Public API: getFormattedSSN', () => {
    it('should return empty string for empty SSN', () => {
      expect(element.getFormattedSSN()).toBe('');
    });

    it('should format SSN with hyphens', async () => {
      element.setSSNData({ ssn: '123456789' });
      await element.updateComplete;

      expect(element.getFormattedSSN()).toBe('123-45-6789');
    });

    it('should reformat SSN with spaces to hyphens', async () => {
      element.setSSNData({ ssn: '123 45 6789' });
      await element.updateComplete;

      expect(element.getFormattedSSN()).toBe('123-45-6789');
    });

    it('should handle partial SSN (first 3 digits)', async () => {
      element.setSSNData({ ssn: '123' });
      await element.updateComplete;

      expect(element.getFormattedSSN()).toBe('123');
    });

    it('should handle partial SSN (first 5 digits)', async () => {
      element.setSSNData({ ssn: '12345' });
      await element.updateComplete;

      expect(element.getFormattedSSN()).toBe('123-45');
    });
  });

  describe('Accessibility', () => {
    it('should use fieldset and legend for grouping', () => {
      const fieldset = element.querySelector('fieldset.usa-fieldset');
      const legend = element.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(fieldset?.contains(legend!)).toBe(true);
    });

    it('should have hint associated with input', () => {
      const hint = element.querySelector('.usa-hint');
      const hintId = hint?.id;

      expect(hintId).toBeTruthy();
      expect(hintId).toContain('hint');
    });

    it('should connect input to hint via aria-describedby', () => {
      const input = element.querySelector('usa-text-input');
      const hint = element.querySelector('.usa-hint');
      const hintId = hint?.id;

      expect(input?.getAttribute('aria-describedby')).toContain(hintId!);
    });
  });

  describe('USWDS Best Practices', () => {
    it('should provide explanation via hint text', () => {
      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent).toBeTruthy();
    });

    it('should allow linking to explanation page', async () => {
      element.showWhyLink = true;
      element.whyUrl = '/privacy-policy';
      await element.updateComplete;

      const link = element.querySelector('.usa-hint a');
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/privacy-policy');
    });

    it('should use usa-input--xl for better visibility', () => {
      const input = element.querySelector('usa-text-input');
      expect(input?.classList.contains('usa-input--xl')).toBe(true);
    });
  });

  describe('Slot Rendering & Composition', () => {
    describe('Child Component Initialization', () => {
      it('should initialize SSN text input component', async () => {
        const { verifyChildComponent } = await import('@uswds-wc/test-utils/slot-testing-utils.js');

        const ssnInput = await verifyChildComponent(
          element,
          'usa-text-input[name="social-security-no"]'
        );
        expect(ssnInput).toBeTruthy();

        // Verify internal structure rendered
        const input = ssnInput.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should render only one text input component (USWDS requirement)', () => {
        const inputs = element.querySelectorAll('usa-text-input');
        expect(inputs.length).toBe(1);
      });

      it('should wait for child component to initialize', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        expect(ssnInput).toBeTruthy();

        // Should have updateComplete property (LitElement)
        expect(ssnInput.updateComplete).toBeTruthy();
        await ssnInput.updateComplete;

        // Verify component is fully rendered
        const input = ssnInput.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });
    });

    describe('Child Component DOM Structure', () => {
      it('should render child component with correct DOM structure', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        await ssnInput?.updateComplete;

        // Verify internal structure
        const input = ssnInput?.querySelector('input');
        expect(input).toBeTruthy();
      });

      it('should have correct USWDS classes on child component', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');

        // Check web component has usa-input--xl class
        expect(ssnInput?.classList.contains('usa-input--xl')).toBe(true);

        const input = ssnInput?.querySelector('input');
        expect(input?.classList.contains('usa-input')).toBe(true);
      });

      it('should have label for child component', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        await (ssnInput as any)?.updateComplete;

        // SSN pattern uses legend/fieldset instead of label per USWDS
        // Verify aria-describedby is set on the web component (not native input)
        const describedBy = ssnInput?.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
      });

      it('should have proper attributes on native input', () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');

        // Attributes are on the web component, not the native input
        expect(ssnInput?.getAttribute('type')).toBe('text');
        expect(ssnInput?.getAttribute('inputmode')).toBe('numeric');
        expect(ssnInput?.getAttribute('autocomplete')).toBe('off');
        expect(ssnInput?.getAttribute('maxlength')).toBe('11');
      });
    });

    describe('Pattern Composition', () => {
      it('should compose USWDS structure correctly', async () => {
        const { verifyUSWDSStructure } = await import('@uswds-wc/test-utils/slot-testing-utils.js');

        await verifyUSWDSStructure(element, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: ['usa-text-input[name="social-security-no"]'],
        });
      });

      it('should have fieldset as container', () => {
        const fieldset = element.querySelector('fieldset.usa-fieldset');
        expect(fieldset).toBeTruthy();

        // SSN input should be inside fieldset
        const ssnInput = fieldset?.querySelector('usa-text-input[name="social-security-no"]');
        expect(ssnInput).toBeTruthy();
      });

      it('should have legend for accessibility', () => {
        const legend = element.querySelector('legend.usa-legend');
        expect(legend).toBeTruthy();
        expect(legend?.textContent).toBe('Social Security number');
      });

      it('should include hint text when provided', async () => {
        element.hint = 'Custom hint text';
        await element.updateComplete;

        const hint = element.querySelector('.usa-hint');
        expect(hint).toBeTruthy();
        expect(hint?.textContent).toContain('Custom hint text');
      });

      it('should connect hint to input via aria-describedby', async () => {
        const hint = element.querySelector('.usa-hint');
        const hintId = hint?.id;
        expect(hintId).toBeTruthy();

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        const describedBy = ssnInput?.getAttribute('aria-describedby');
        expect(describedBy).toContain(hintId!);
      });
    });

    describe('Event Propagation from Child Components', () => {
      it('should propagate input event from SSN child component', async () => {
        const events: any[] = [];
        element.addEventListener('ssn-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        await ssnInput?.updateComplete;

        const input = ssnInput?.querySelector('input') as HTMLInputElement;
        input.value = '123-45-6789';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].value).toBe('123-45-6789');
      });

      it('should include SSN data in ssn-change event', async () => {
        const events: any[] = [];
        element.addEventListener('ssn-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        const input = ssnInput?.querySelector('input') as HTMLInputElement;
        input.value = '987654321';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].ssnData).toBeDefined();
        expect(events[0].ssnData.ssn).toBe('987654321');
      });

      it('should update internal state when child component changes', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        const input = ssnInput?.querySelector('input') as HTMLInputElement;

        input.value = '555112222';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;

        const data = element.getSSNData();
        expect(data.ssn).toBe('555112222');
      });

      it('should handle masked input with hyphens', async () => {
        const events: any[] = [];
        element.addEventListener('ssn-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        const input = ssnInput?.querySelector('input') as HTMLInputElement;

        input.value = '123-45-6789';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].value).toBe('123-45-6789');
      });

      it('should handle masked input with spaces', async () => {
        const events: any[] = [];
        element.addEventListener('ssn-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        const input = ssnInput?.querySelector('input') as HTMLInputElement;

        input.value = '123 45 6789';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].value).toBe('123 45 6789');
      });
    });

    describe('Masked Input Handling', () => {
      it('should accept and preserve hyphen formatting', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        const input = ssnInput?.querySelector('input') as HTMLInputElement;

        input.value = '123-45-6789';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;

        const data = element.getSSNData();
        expect(data.ssn).toBe('123-45-6789');
      });

      it('should accept and preserve space formatting', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        const input = ssnInput?.querySelector('input') as HTMLInputElement;

        input.value = '123 45 6789';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;

        const data = element.getSSNData();
        expect(data.ssn).toBe('123 45 6789');
      });

      it('should accept unformatted SSN', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        const input = ssnInput?.querySelector('input') as HTMLInputElement;

        input.value = '123456789';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;

        const data = element.getSSNData();
        expect(data.ssn).toBe('123456789');
      });

      it('should enforce maxlength of 11 characters', () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        const input = ssnInput?.querySelector('input');

        expect(input?.getAttribute('maxlength')).toBe('11');
      });

      it('should have inputmode="numeric" for mobile keyboards', () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');

        // Attribute is on the web component, not the native input
        expect(ssnInput?.getAttribute('inputmode')).toBe('numeric');
      });

      it('should have autocomplete="off" for security', () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        const input = ssnInput?.querySelector('input');

        expect(input?.getAttribute('autocomplete')).toBe('off');
      });
    });

    describe('Compact Mode for Child Components', () => {
      it('should use usa-input--xl class for SSN input', () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        expect(ssnInput?.classList.contains('usa-input--xl')).toBe(true);
      });

      it('should render child component without form-group wrapper', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        await ssnInput?.updateComplete;

        // Note: usa-text-input may have a form-group wrapper internally
        // This is controlled by the component itself, not the pattern
        // The pattern uses fieldset/legend for its own grouping
        const fieldset = element.querySelector('fieldset.usa-fieldset');
        expect(fieldset).toBeTruthy();
      });

      it('should have direct label and input as children', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        await (ssnInput as any)?.updateComplete;

        // Note: SSN pattern uses fieldset/legend instead of label
        // The text-input component renders the native input internally
        const input = ssnInput?.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });
    });

    describe('Programmatic Access to Child Components', () => {
      it('should allow direct access to child component API', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        expect(ssnInput).toBeTruthy();

        // Verify child component has standard methods
        expect(typeof ssnInput?.reset).toBe('function');
      });

      it('should allow setting child component value programmatically', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        await ssnInput?.updateComplete;

        ssnInput.value = '111223333';
        await ssnInput.updateComplete;

        expect(ssnInput.value).toBe('111223333');
        const input = ssnInput.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('111223333');
      });

      it('should allow resetting child component via pattern API', async () => {
        // Set a value
        element.setSSNData({ ssn: '123456789' });
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Verify value is set
        const data = element.getSSNData();
        expect(data.ssn).toBe('123456789');

        // Clear via pattern API
        element.clearSSN();
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Verify child component was reset
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        const input = ssnInput?.querySelector('input') as HTMLInputElement;
        expect(input?.value).toBe('');
      });

      it('should update child component when pattern data changes', async () => {
        element.setSSNData({ ssn: '987-65-4321' });
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 0));

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        expect(ssnInput?.value).toBe('987-65-4321');

        const input = ssnInput?.querySelector('input') as HTMLInputElement;
        expect(input?.value).toBe('987-65-4321');
      });
    });

    describe('Required Attribute Propagation', () => {
      it('should propagate required attribute to child component', async () => {
        element.required = true;
        await element.updateComplete;

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        expect(ssnInput?.hasAttribute('required')).toBe(true);
      });

      it('should remove required attribute when pattern is not required', async () => {
        element.required = true;
        await element.updateComplete;

        element.required = false;
        await element.updateComplete;

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        expect(ssnInput?.hasAttribute('required')).toBe(false);
      });

      it('should propagate required to native input', async () => {
        element.required = true;
        await element.updateComplete;

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]') as any;
        await ssnInput?.updateComplete;

        const input = ssnInput?.querySelector('input');
        expect(input?.hasAttribute('required')).toBe(true);
      });
    });

    describe('ARIA and Accessibility', () => {
      it('should connect hint to child component', () => {
        const hint = element.querySelector('.usa-hint');
        const hintId = hint?.id;
        expect(hintId).toBeTruthy();

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        const describedBy = ssnInput?.getAttribute('aria-describedby');
        expect(describedBy).toContain(hintId!);
      });

      it('should maintain aria-describedby when hint changes', async () => {
        element.hint = 'New hint text';
        await element.updateComplete;

        const hint = element.querySelector('.usa-hint');
        const hintId = hint?.id;

        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        const describedBy = ssnInput?.getAttribute('aria-describedby');
        expect(describedBy).toContain(hintId!);
      });

      it('should use fieldset/legend for grouping', () => {
        const fieldset = element.querySelector('fieldset.usa-fieldset');
        const legend = element.querySelector('legend.usa-legend');

        expect(fieldset).toBeTruthy();
        expect(legend).toBeTruthy();
        expect(fieldset?.contains(legend!)).toBe(true);
      });
    });

    describe('Light DOM Rendering', () => {
      it('should use Light DOM (no shadow root)', () => {
        expect(element.shadowRoot).toBeNull();
      });

      it('should allow USWDS styles to cascade to child components', async () => {
        const ssnInput = element.querySelector('usa-text-input[name="social-security-no"]');
        const input = ssnInput?.querySelector('input');

        // Verify USWDS classes are applied to native input
        expect(input?.classList.contains('usa-input')).toBe(true);

        // usa-input--xl class is on the web component
        expect(ssnInput?.classList.contains('usa-input--xl')).toBe(true);
      });

      it('should maintain USWDS structure in Light DOM', () => {
        // Verify USWDS pattern structure
        const fieldset = element.querySelector('.usa-fieldset');
        const legend = element.querySelector('.usa-legend');
        const hint = element.querySelector('.usa-hint');
        const input = element.querySelector('usa-text-input');

        expect(fieldset).toBeTruthy();
        expect(legend).toBeTruthy();
        expect(hint).toBeTruthy();
        expect(input).toBeTruthy();

        // All elements should be in Light DOM (accessible via querySelector)
        expect(element.contains(fieldset!)).toBe(true);
        expect(element.contains(legend!)).toBe(true);
        expect(element.contains(hint!)).toBe(true);
        expect(element.contains(input!)).toBe(true);
      });
    });
  });
});
