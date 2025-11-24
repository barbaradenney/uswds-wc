import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-phone-number-pattern.js';
import type { USAPhoneNumberPattern, PhoneNumberData } from './usa-phone-number-pattern.js';
import {
  verifyChildComponent,
  verifyPropertyBinding,
  verifyUSWDSStructure,
  verifyCompactMode,
} from '@uswds-wc/test-utils/slot-testing-utils.js';

describe('USAPhoneNumberPattern', () => {
  let pattern: USAPhoneNumberPattern;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Pattern Initialization', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-PHONE-NUMBER-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.label).toBe('Phone number');
      expect(pattern.required).toBe(false);
      expect(pattern.showExtension).toBe(false);
      expect(pattern.showType).toBe(false);
      expect(pattern.smsRequired).toBe(false);
    });

    it('should use Light DOM for USWDS style compatibility', () => {
      expect(pattern.shadowRoot).toBeNull();
    });

    it('should render fieldset with legend', async () => {
      await pattern.updateComplete;
      const fieldset = pattern.querySelector('fieldset.usa-fieldset');
      const legend = pattern.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toBe('Phone number');
    });

    it('should render required phone number field', async () => {
      await pattern.updateComplete;

      const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneNumber).toBeTruthy();
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement(
        'usa-phone-number-pattern'
      ) as USAPhoneNumberPattern;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.phoneData).toBeDefined();
      expect(event.detail.phoneData.type).toBe('');

      newPattern.remove();
    });
  });

  describe('Field Visibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should not show extension field by default', () => {
      const extension = pattern.querySelector('usa-text-input[name="extension"]');
      expect(extension).toBeTruthy(); // Element exists
      expect(extension?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });

    it('should show extension field when showExtension is true', async () => {
      pattern.showExtension = true;
      await pattern.updateComplete;

      const extension = pattern.querySelector('usa-text-input[name="extension"]');
      expect(extension).toBeTruthy();
    });

    it('should not show phone type field by default', () => {
      const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
      expect(phoneType).toBeTruthy(); // Element exists
      expect(phoneType?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });

    it('should show phone type field when showType is true', async () => {
      pattern.showType = true;
      await pattern.updateComplete;

      const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
      expect(phoneType).toBeTruthy();
    });

    it('should not show SMS alert by default', () => {
      const alert = pattern.querySelector('.usa-alert');
      expect(alert).toBeTruthy(); // Element exists
      expect(alert?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });

    it('should show SMS alert when smsRequired is true', async () => {
      pattern.smsRequired = true;
      await pattern.updateComplete;

      const alert = pattern.querySelector('.usa-alert');
      expect(alert).toBeTruthy();
      expect(alert?.textContent).toContain('verification code');
    });
  });

  describe('Input Type - Accessibility Fix', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should use type="text" instead of type="tel" for accessibility', () => {
      const phoneInput = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneInput?.getAttribute('type')).toBe('text');
    });

    it('should use inputmode="numeric" for mobile keyboard', () => {
      const phoneInput = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneInput?.getAttribute('inputmode')).toBe('numeric');
    });
  });

  describe('Required Fields', () => {
    it('should not mark phone number as required by default', async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneNumber?.hasAttribute('required')).toBe(false);
    });

    it('should mark phone number as required when required prop is true', async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      pattern.required = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneNumber?.hasAttribute('required')).toBe(true);
    });
  });

  describe('Phone Number Formatting', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should format phone number as user types', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('phone-change', (e) => resolve(e as CustomEvent), { once: true });
      });

      const phoneInput = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;

      // Simulate typing digits
      phoneInput.value = '5551234567';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const event = await changePromise;
      expect(event.detail.phoneData.phoneNumber).toBe('555-123-4567');
    });

    it('should handle partial phone numbers', async () => {
      const phoneInput = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;

      // Type 3 digits
      phoneInput.value = '555';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      let data = pattern.getPhoneData();
      expect(data.phoneNumber).toBe('555');

      // Type 6 digits
      phoneInput.value = '555123';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      data = pattern.getPhoneData();
      expect(data.phoneNumber).toBe('555-123');
    });

    it('should have pattern validation for phone format', () => {
      const phoneInput = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneInput?.getAttribute('pattern')).toBe('[0-9]{3}-[0-9]{3}-[0-9]{4}');
    });

    it('should have maxlength for phone number', () => {
      const phoneInput = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneInput?.getAttribute('maxlength')).toBe('12');
    });
  });

  describe('Data Changes', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      pattern.showType = true;
      pattern.showExtension = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit phone-change event when phone number changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('phone-change', (e) => resolve(e as CustomEvent), { once: true });
      });

      const phoneInput = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;
      phoneInput.value = '555-123-4567';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.phoneData).toBeDefined();
      expect(event.detail.field).toBe('phoneNumber');
    });

    it('should track phone type selection', async () => {
      const phoneType = pattern.querySelector('usa-select[name="phoneType"]') as any;

      phoneType.value = 'mobile';
      phoneType.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPhoneData();
      expect(data.type).toBe('mobile');
    });

    it('should track extension value', async () => {
      const extension = pattern.querySelector('usa-text-input[name="extension"]') as any;

      extension.value = '1234';
      extension.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPhoneData();
      expect(data.extension).toBe('1234');
    });

    it('should track all field values', async () => {
      const phoneType = pattern.querySelector('usa-select[name="phoneType"]') as any;
      const phoneInput = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;
      const extension = pattern.querySelector('usa-text-input[name="extension"]') as any;

      phoneType.value = 'work';
      phoneType.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      phoneInput.value = '5551234567';
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      extension.value = '5678';
      extension.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPhoneData();
      expect(data.type).toBe('work');
      expect(data.phoneNumber).toBe('555-123-4567');
      expect(data.extension).toBe('5678');
    });
  });

  describe('Public API', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      pattern.showType = true;
      pattern.showExtension = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should get phone data', () => {
      const data = pattern.getPhoneData();
      expect(data).toBeDefined();
      expect(data.type).toBe('');
    });

    it('should set phone data', async () => {
      const phoneData: PhoneNumberData = {
        phoneNumber: '555-123-4567',
        extension: '1234',
        type: 'mobile',
      };

      pattern.setPhoneData(phoneData);
      await pattern.updateComplete;

      const data = pattern.getPhoneData();
      expect(data).toEqual(phoneData);
    });

    it('should clear phone number', async () => {
      const phoneData: PhoneNumberData = {
        phoneNumber: '555-123-4567',
        extension: '1234',
        type: 'mobile',
      };

      pattern.setPhoneData(phoneData);
      await pattern.updateComplete;

      pattern.clearPhoneNumber();
      await pattern.updateComplete;

      const data = pattern.getPhoneData();
      expect(data.type).toBe('');
      expect(data.phoneNumber).toBeUndefined();
      expect(data.extension).toBeUndefined();
    });

    it('should validate required phone number', async () => {
      pattern.required = true;
      await pattern.updateComplete;

      // Empty phone should not be valid
      expect(pattern.validatePhoneNumber()).toBe(false);

      // Partial phone should not be valid
      pattern.setPhoneData({ phoneNumber: '555-123' });
      await pattern.updateComplete;
      expect(pattern.validatePhoneNumber()).toBe(false);

      // Complete phone should be valid
      pattern.setPhoneData({ phoneNumber: '555-123-4567' });
      await pattern.updateComplete;
      expect(pattern.validatePhoneNumber()).toBe(true);
    });

    it('should always validate true when not required', async () => {
      pattern.required = false;
      await pattern.updateComplete;

      expect(pattern.validatePhoneNumber()).toBe(true);

      pattern.setPhoneData({ phoneNumber: '555' });
      await pattern.updateComplete;
      expect(pattern.validatePhoneNumber()).toBe(true);
    });

    it('should get formatted phone number', async () => {
      pattern.setPhoneData({ phoneNumber: '555-123-4567' });
      await pattern.updateComplete;

      expect(pattern.getFormattedPhoneNumber()).toBe('555-123-4567');
    });

    it('should get raw phone number without formatting', async () => {
      pattern.setPhoneData({ phoneNumber: '555-123-4567' });
      await pattern.updateComplete;

      expect(pattern.getRawPhoneNumber()).toBe('5551234567');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      pattern.showType = true;
      pattern.showExtension = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have fieldset and legend for screen readers', () => {
      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toContain('Phone number');
    });

    it('should have proper label associations', async () => {
      await pattern.updateComplete;

      const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
      const extension = pattern.querySelector('usa-text-input[name="extension"]');

      expect(phoneNumber?.getAttribute('label')).toBeTruthy();
      expect(phoneType?.getAttribute('label')).toBeTruthy();
      expect(extension?.getAttribute('label')).toBeTruthy();
    });

    it('should use USWDS form markup structure', () => {
      const fieldset = pattern.querySelector('.usa-fieldset');
      const legend = pattern.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });

    it('should have hint text with accessibility guidance', () => {
      const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneNumber?.getAttribute('hint')).toContain('10-digit');
    });

    it('should show SMS hint when required', async () => {
      pattern.smsRequired = true;
      await pattern.updateComplete;

      const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
      expect(phoneNumber?.getAttribute('hint')).toContain('SMS-capable');
    });

    it('should mark optional fields appropriately', () => {
      const extension = pattern.querySelector('usa-text-input[name="extension"]');
      expect(extension?.getAttribute('hint')).toContain('optional');
    });
  });

  describe('Phone Type Selection', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      pattern.showType = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render phone type options', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="phoneType"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const options = selectComponent?.querySelectorAll('option');

      // Should have "- Select -" plus 3 types (mobile, home, work)
      expect(options?.length).toBe(4);
    });

    it('should have default empty option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="phoneType"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const firstOption = selectComponent?.querySelector('option');

      expect(firstOption?.value).toBe('');
      expect(firstOption?.textContent).toContain('Select');
    });

    it('should have mobile option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="phoneType"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const mobileOption = Array.from(selectComponent?.querySelectorAll('option') || []).find(
        (opt) => (opt as HTMLOptionElement).value === 'mobile'
      );

      expect(mobileOption).toBeTruthy();
      expect(mobileOption?.textContent?.trim()).toBe('Mobile');
    });

    it('should have home option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="phoneType"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const homeOption = Array.from(selectComponent?.querySelectorAll('option') || []).find(
        (opt) => (opt as HTMLOptionElement).value === 'home'
      );

      expect(homeOption).toBeTruthy();
      expect(homeOption?.textContent?.trim()).toBe('Home');
    });

    it('should have work option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="phoneType"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered as Light DOM children of the pattern before <usa-select> projects them
      const workOption = Array.from(selectComponent?.querySelectorAll('option') || []).find(
        (opt) => (opt as HTMLOptionElement).value === 'work'
      );

      expect(workOption).toBeTruthy();
      expect(workOption?.textContent?.trim()).toBe('Work');
    });
  });

  describe('Extension Field', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      pattern.showExtension = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have pattern attribute for extension validation', () => {
      const extension = pattern.querySelector('usa-text-input[name="extension"]');
      expect(extension?.getAttribute('pattern')).toBe('[0-9]*');
    });

    it('should have maxlength for extension', () => {
      const extension = pattern.querySelector('usa-text-input[name="extension"]');
      expect(extension?.getAttribute('maxlength')).toBe('6');
    });

    it('should use numeric inputmode', () => {
      const extension = pattern.querySelector('usa-text-input[name="extension"]');
      expect(extension?.getAttribute('inputmode')).toBe('numeric');
    });

    it('should not be required', () => {
      const extension = pattern.querySelector('usa-text-input[name="extension"]');
      expect(extension?.hasAttribute('required')).toBe(false);
    });
  });

  describe('Custom Labels', () => {
    it('should use custom label', async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      pattern.label = 'Contact Number';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const legend = pattern.querySelector('legend');
      expect(legend?.textContent).toBe('Contact Number');
    });
  });

  describe('SMS Required Mode', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
      pattern.smsRequired = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show SMS alert', () => {
      const alert = pattern.querySelector('.usa-alert');
      expect(alert).toBeTruthy();
    });

    it('should use info alert style', () => {
      const alert = pattern.querySelector('.usa-alert');
      expect(alert?.classList.contains('usa-alert--info')).toBe(true);
      expect(alert?.classList.contains('usa-alert--slim')).toBe(true);
    });

    it('should explain SMS verification', () => {
      const alert = pattern.querySelector('.usa-alert');
      const text = alert?.querySelector('.usa-alert__text');
      expect(text?.textContent).toContain('verification code');
      expect(text?.textContent).toContain('text message');
    });
  });

  describe('Slot Rendering & Composition', () => {
    describe('Child Component Initialization', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
        pattern.showType = true;
        pattern.showExtension = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should initialize phone type select component', async () => {
        const phoneType = await verifyChildComponent(pattern, 'usa-select[name="phoneType"]');
        expect(phoneType).toBeTruthy();

        // Verify internal structure rendered
        const select = phoneType.querySelector('select.usa-select');
        expect(select).toBeTruthy();
      });

      it('should initialize phone number text input component', async () => {
        const phoneNumber = await verifyChildComponent(
          pattern,
          'usa-text-input[name="phoneNumber"]'
        );
        expect(phoneNumber).toBeTruthy();

        const input = phoneNumber.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize extension text input component', async () => {
        const extension = await verifyChildComponent(pattern, 'usa-text-input[name="extension"]');
        expect(extension).toBeTruthy();

        const input = extension.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should render all child components', async () => {
        // All components should exist
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
        const extension = pattern.querySelector('usa-text-input[name="extension"]');

        expect(phoneType).toBeTruthy();
        expect(phoneNumber).toBeTruthy();
        expect(extension).toBeTruthy();

        // Phone number is always visible
        expect(phoneNumber?.closest('.display-none')).toBe(null);

        // Phone type and extension are visible when enabled
        expect(phoneType?.classList.contains('display-none')).toBe(false);
        expect(extension?.classList.contains('display-none')).toBe(false);
      });

      it('should hide optional components by default', async () => {
        const defaultPattern = document.createElement(
          'usa-phone-number-pattern'
        ) as USAPhoneNumberPattern;
        container.appendChild(defaultPattern);
        await defaultPattern.updateComplete;

        const phoneType = defaultPattern.querySelector('usa-select[name="phoneType"]');
        const extension = defaultPattern.querySelector('usa-text-input[name="extension"]');

        // Components exist but are hidden
        expect(phoneType).toBeTruthy();
        expect(extension).toBeTruthy();
        expect(phoneType?.classList.contains('display-none')).toBe(true);
        expect(extension?.classList.contains('display-none')).toBe(true);

        defaultPattern.remove();
      });
    });

    describe('Child Components Render with Correct USWDS Classes', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
        pattern.showType = true;
        pattern.showExtension = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should have correct USWDS classes on phone type select', async () => {
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
        const select = phoneType?.querySelector('select');

        expect(select?.classList.contains('usa-select')).toBe(true);
      });

      it('should have correct USWDS classes on phone number input', async () => {
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
        const input = phoneNumber?.querySelector('input');

        expect(input?.classList.contains('usa-input')).toBe(true);
      });

      it('should have correct USWDS classes on extension input', async () => {
        const extension = pattern.querySelector('usa-text-input[name="extension"]');
        const input = extension?.querySelector('input');

        expect(input?.classList.contains('usa-input')).toBe(true);
      });

      it('should have labels for all child components', async () => {
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
        const extension = pattern.querySelector('usa-text-input[name="extension"]');

        expect(phoneType?.querySelector('label')).toBeTruthy();
        expect(phoneNumber?.querySelector('label')).toBeTruthy();
        expect(extension?.querySelector('label')).toBeTruthy();
      });
    });

    describe('Pattern Composition and USWDS Structure Compliance', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
        pattern.showType = true;
        pattern.showExtension = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should compose all expected fields', async () => {
        await verifyUSWDSStructure(pattern, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: [
            'usa-select[name="phoneType"]',
            'usa-text-input[name="phoneNumber"]',
            'usa-text-input[name="extension"]',
          ],
        });
      });

      it('should have proper fieldset structure', () => {
        const fieldset = pattern.querySelector('fieldset.usa-fieldset');
        const legend = pattern.querySelector('legend.usa-legend');

        expect(fieldset).toBeTruthy();
        expect(legend).toBeTruthy();
        expect(legend?.textContent).toBe('Phone number');
      });

      it('should show/hide phone type based on showType property', async () => {
        pattern.showType = false;
        await pattern.updateComplete;

        const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
        expect(phoneType?.classList.contains('display-none')).toBe(true);

        pattern.showType = true;
        await pattern.updateComplete;
        expect(phoneType?.classList.contains('display-none')).toBe(false);
      });

      it('should show/hide extension based on showExtension property', async () => {
        pattern.showExtension = false;
        await pattern.updateComplete;

        const extension = pattern.querySelector('usa-text-input[name="extension"]');
        expect(extension?.classList.contains('display-none')).toBe(true);

        pattern.showExtension = true;
        await pattern.updateComplete;
        expect(extension?.classList.contains('display-none')).toBe(false);
      });

      it('should show/hide SMS alert based on smsRequired property', async () => {
        pattern.smsRequired = false;
        await pattern.updateComplete;

        const alert = pattern.querySelector('.usa-alert');
        expect(alert?.classList.contains('display-none')).toBe(true);

        pattern.smsRequired = true;
        await pattern.updateComplete;
        expect(alert?.classList.contains('display-none')).toBe(false);
      });

      it('should render SMS alert with correct USWDS classes', async () => {
        pattern.smsRequired = true;
        await pattern.updateComplete;

        const alert = pattern.querySelector('.usa-alert');
        expect(alert?.classList.contains('usa-alert--info')).toBe(true);
        expect(alert?.classList.contains('usa-alert--slim')).toBe(true);

        const body = alert?.querySelector('.usa-alert__body');
        const text = alert?.querySelector('.usa-alert__text');
        expect(body).toBeTruthy();
        expect(text).toBeTruthy();
      });
    });

    describe('Event Propagation from Child Components', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
        pattern.showType = true;
        pattern.showExtension = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should propagate change event from phone type select child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('phone-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const phoneType = pattern.querySelector('usa-select[name="phoneType"]') as any;
        await phoneType?.updateComplete;

        const select = phoneType?.querySelector('select') as HTMLSelectElement;
        select.value = 'mobile';
        select.dispatchEvent(new Event('change', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('type');
        expect(events[0].value).toBe('mobile');
      });

      it('should propagate input event from phone number child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('phone-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;
        await phoneNumber?.updateComplete;

        const input = phoneNumber?.querySelector('input') as HTMLInputElement;
        input.value = '5551234567';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('phoneNumber');
        // Phone number should be formatted
        expect(events[0].value).toBe('555-123-4567');
      });

      it('should propagate input event from extension child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('phone-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const extension = pattern.querySelector('usa-text-input[name="extension"]') as any;
        await extension?.updateComplete;

        const input = extension?.querySelector('input') as HTMLInputElement;
        input.value = '1234';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('extension');
        expect(events[0].value).toBe('1234');
      });

      it('should include full phone data in phone-change event', async () => {
        const events: any[] = [];
        pattern.addEventListener('phone-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        // Set phone type
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]') as any;
        const select = phoneType?.querySelector('select') as HTMLSelectElement;
        select.value = 'work';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        await pattern.updateComplete;

        // Set phone number
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;
        const phoneInput = phoneNumber?.querySelector('input') as HTMLInputElement;
        phoneInput.value = '5551234567';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        await pattern.updateComplete;

        expect(events.length).toBeGreaterThan(0);
        const lastEvent = events[events.length - 1];
        expect(lastEvent.phoneData).toBeDefined();
        expect(lastEvent.phoneData.type).toBe('work');
        expect(lastEvent.phoneData.phoneNumber).toBe('555-123-4567');
      });
    });

    describe('Phone Type Select Property Binding', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
        pattern.showType = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should render phone type options via property binding', async () => {
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]') as any;
        await phoneType?.updateComplete;

        // Verify options were created from property binding
        // - Select - + 3 types (mobile, home, work) = 4 options
        await verifyPropertyBinding(phoneType, 'select', 'option', 4);
      });

      it('should have correct phone type option values', async () => {
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
        const select = phoneType?.querySelector('select');
        const options = select?.querySelectorAll('option');

        const values = Array.from(options || []).map((opt) => (opt as HTMLOptionElement).value);

        expect(values).toContain('');
        expect(values).toContain('mobile');
        expect(values).toContain('home');
        expect(values).toContain('work');
      });

      it('should have correct phone type option text', async () => {
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]');
        const select = phoneType?.querySelector('select');
        const options = select?.querySelectorAll('option');

        const texts = Array.from(options || []).map((opt) =>
          (opt as HTMLOptionElement).textContent?.trim()
        );

        expect(texts).toContain('- Select -');
        expect(texts).toContain('Mobile');
        expect(texts).toContain('Home');
        expect(texts).toContain('Work');
      });
    });

    describe('Compact Mode for Child Components', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
        pattern.showType = true;
        pattern.showExtension = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should use compact mode for phone type select component', async () => {
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]');

        // Verify compact attribute is set
        expect(phoneType?.hasAttribute('compact')).toBe(true);

        // Note: Select components use combo-box wrapper, so verifyCompactMode won't work
        // Just verify no form-group wrapper
        const formGroup = phoneType?.querySelector('.usa-form-group');
        expect(formGroup).toBeFalsy();
      });

      it('should use compact mode for phone number text input component', async () => {
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');
        await verifyCompactMode(phoneNumber as HTMLElement);
      });

      it('should use compact mode for extension text input component', async () => {
        const extension = pattern.querySelector('usa-text-input[name="extension"]');
        await verifyCompactMode(extension as HTMLElement);
      });

      it('should not have form-group wrappers in compact mode', async () => {
        const components = pattern.querySelectorAll('usa-text-input, usa-select');
        await Promise.all(
          Array.from(components).map((c: any) => c.updateComplete || Promise.resolve())
        );

        components.forEach((component) => {
          const formGroup = component.querySelector('.usa-form-group');
          expect(formGroup).toBeFalsy();
        });
      });
    });

    describe('Programmatic Access to Child Components', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
        pattern.showType = true;
        pattern.showExtension = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should allow direct access to child component APIs', async () => {
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]') as any;
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;
        const extension = pattern.querySelector('usa-text-input[name="extension"]') as any;

        expect(typeof phoneType?.reset).toBe('function');
        expect(typeof phoneNumber?.reset).toBe('function');
        expect(typeof extension?.reset).toBe('function');
      });

      it('should allow setting child component values programmatically', async () => {
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;
        await phoneNumber?.updateComplete;

        phoneNumber.value = '555-123-4567';
        await phoneNumber.updateComplete;

        expect(phoneNumber.value).toBe('555-123-4567');
        const input = phoneNumber.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('555-123-4567');
      });

      it('should allow resetting child components via pattern API', async () => {
        // Set some values
        pattern.setPhoneData({
          phoneNumber: '555-123-4567',
          extension: '1234',
          type: 'mobile',
        });
        await pattern.updateComplete;

        // Clear via pattern API
        pattern.clearPhoneNumber();
        await pattern.updateComplete;

        // Verify all children were reset
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]') as any;
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]') as any;
        const extension = pattern.querySelector('usa-text-input[name="extension"]') as any;

        const select = phoneType?.querySelector('select') as HTMLSelectElement;
        const phoneInput = phoneNumber?.querySelector('input') as HTMLInputElement;
        const extInput = extension?.querySelector('input') as HTMLInputElement;

        expect(select?.value).toBe('');
        expect(phoneInput?.value).toBe('');
        expect(extInput?.value).toBe('');
      });
    });

    describe('Child Component Attributes and Properties', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-phone-number-pattern') as USAPhoneNumberPattern;
        pattern.showType = true;
        pattern.showExtension = true;
        pattern.required = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should set correct attributes on phone type select', () => {
        const phoneType = pattern.querySelector('usa-select[name="phoneType"]');

        expect(phoneType?.getAttribute('name')).toBe('phoneType');
        expect(phoneType?.getAttribute('label')).toBe('Phone type');
        expect(phoneType?.hasAttribute('compact')).toBe(true);
      });

      it('should set correct attributes on phone number input', () => {
        const phoneNumber = pattern.querySelector('usa-text-input[name="phoneNumber"]');

        expect(phoneNumber?.getAttribute('name')).toBe('phoneNumber');
        expect(phoneNumber?.getAttribute('type')).toBe('text');
        expect(phoneNumber?.getAttribute('inputmode')).toBe('numeric');
        expect(phoneNumber?.getAttribute('pattern')).toBe('[0-9]{3}-[0-9]{3}-[0-9]{4}');
        expect(phoneNumber?.getAttribute('maxlength')).toBe('12');
        expect(phoneNumber?.hasAttribute('required')).toBe(true);
        expect(phoneNumber?.hasAttribute('compact')).toBe(true);
      });

      it('should set correct attributes on extension input', () => {
        const extension = pattern.querySelector('usa-text-input[name="extension"]');

        expect(extension?.getAttribute('name')).toBe('extension');
        expect(extension?.getAttribute('label')).toBe('Extension');
        expect(extension?.getAttribute('type')).toBe('text');
        expect(extension?.getAttribute('inputmode')).toBe('numeric');
        expect(extension?.getAttribute('pattern')).toBe('[0-9]*');
        expect(extension?.getAttribute('maxlength')).toBe('6');
        expect(extension?.hasAttribute('required')).toBe(false);
        expect(extension?.hasAttribute('compact')).toBe(true);
      });

      it('should set phone number label based on initial showType property', async () => {
        // When showType is true at initialization, label should be "Number"
        expect(pattern.showType).toBe(true);
        const phoneNumberWithType = pattern.querySelector('usa-text-input[name="phoneNumber"]');
        expect(phoneNumberWithType?.getAttribute('label')).toBe('Number');
      });

      it('should set phone number label to "Phone number" when showType is false', async () => {
        // Create pattern without showType
        const patternWithoutType = document.createElement(
          'usa-phone-number-pattern'
        ) as USAPhoneNumberPattern;
        container.appendChild(patternWithoutType);
        await patternWithoutType.updateComplete;

        const phoneNumber = patternWithoutType.querySelector('usa-text-input[name="phoneNumber"]');
        expect(phoneNumber?.getAttribute('label')).toBe('Phone number');

        patternWithoutType.remove();
      });
    });
  });
});
