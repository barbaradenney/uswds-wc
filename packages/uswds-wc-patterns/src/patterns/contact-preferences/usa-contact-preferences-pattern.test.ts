import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-contact-preferences-pattern.js';
import type {
  USAContactPreferencesPattern,
  ContactPreferencesData,
  ContactMethod,
} from './usa-contact-preferences-pattern.js';
import {
  verifyChildComponent,
  verifyUSWDSStructure,
  verifyCompactMode,
} from '@uswds-wc/test-utils/slot-testing-utils.js';

describe('USAContactPreferencesPattern', () => {
  let pattern: USAContactPreferencesPattern;
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
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-CONTACT-PREFERENCES-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.label).toBe('Contact preferences');
      expect(pattern.hint).toBe('');
      expect(pattern.showAdditionalInfo).toBe(false);
      expect(pattern.methods).toBeUndefined();
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
      expect(legend?.textContent).toBe('Contact preferences');
    });

    it('should render default contact method checkboxes', async () => {
      await pattern.updateComplete;

      const checkboxes = pattern.querySelectorAll('usa-checkbox[name="contact-preferences"]');
      expect(checkboxes.length).toBe(4); // phone, text, email, mail
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.preferencesData).toBeDefined();
      expect(event.detail.preferencesData.preferredMethods).toEqual([]);

      newPattern.remove();
    });
  });

  describe('Default Contact Methods', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render phone option', () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]');
      expect(phoneCheckbox).toBeTruthy();
      expect(phoneCheckbox?.getAttribute('label')).toBe('Telephone call');
    });

    it('should render text option', () => {
      const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]');
      expect(textCheckbox).toBeTruthy();
      expect(textCheckbox?.getAttribute('label')).toBe('Text message');
    });

    it('should render email option', () => {
      const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]');
      expect(emailCheckbox).toBeTruthy();
      expect(emailCheckbox?.getAttribute('label')).toBe('Email');
    });

    it('should render mail option', () => {
      const mailCheckbox = pattern.querySelector('usa-checkbox[value="mail"]');
      expect(mailCheckbox).toBeTruthy();
      expect(mailCheckbox?.getAttribute('label')).toBe('Postal mail');
    });

    it('should include descriptions for some methods', () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]');
      const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]');

      expect(phoneCheckbox?.getAttribute('description')).toContain('voicemails');
      expect(textCheckbox?.getAttribute('description')).toContain('SMS');
    });
  });

  describe('Custom Contact Methods', () => {
    it('should render custom contact methods when provided', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;

      const customMethods: ContactMethod[] = [
        { value: 'fax', label: 'Fax', description: 'Fax number' },
        { value: 'video', label: 'Video call', description: 'Video conferencing' },
      ];

      pattern.methods = customMethods;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const faxCheckbox = pattern.querySelector('usa-checkbox[value="fax"]');
      const videoCheckbox = pattern.querySelector('usa-checkbox[value="video"]');

      expect(faxCheckbox).toBeTruthy();
      expect(videoCheckbox).toBeTruthy();
    });
  });

  describe('Field Visibility', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should not show additional info textarea by default', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea).toBeNull();
    });

    it('should show additional info textarea when showAdditionalInfo is true', async () => {
      pattern.showAdditionalInfo = true;
      await pattern.updateComplete;

      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea).toBeTruthy();
      expect(textarea?.getAttribute('label')).toBe('Additional information');
    });
  });

  describe('Multiple Checkbox Selection', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should allow selecting multiple contact methods', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
      const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]') as any;

      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      emailCheckbox.checked = true;
      emailCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toContain('phone');
      expect(data.preferredMethods).toContain('email');
      expect(data.preferredMethods?.length).toBe(2);
    });

    it('should remove method when unchecked', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;

      // Check
      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      let data = pattern.getPreferencesData();
      expect(data.preferredMethods).toContain('phone');

      // Uncheck
      phoneCheckbox.checked = false;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      data = pattern.getPreferencesData();
      expect(data.preferredMethods).not.toContain('phone');
    });

    it('should track all selected methods independently', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
      const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]') as any;
      const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]') as any;
      const mailCheckbox = pattern.querySelector('usa-checkbox[value="mail"]') as any;

      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      textCheckbox.checked = true;
      textCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      emailCheckbox.checked = true;
      emailCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      mailCheckbox.checked = true;
      mailCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods?.length).toBe(4);
      expect(data.preferredMethods).toContain('phone');
      expect(data.preferredMethods).toContain('text');
      expect(data.preferredMethods).toContain('email');
      expect(data.preferredMethods).toContain('mail');
    });
  });

  describe('Data Changes', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.showAdditionalInfo = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit preferences-change event when checkbox changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('preferences-change', (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });

      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.preferencesData).toBeDefined();
      expect(event.detail.field).toBe('preferredMethods');
    });

    it('should emit preferences-change event when additional info changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('preferences-change', (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });

      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]') as any;
      textarea.value = 'Please call after 5 PM';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.preferencesData).toBeDefined();
      expect(event.detail.field).toBe('additionalInfo');
      expect(event.detail.value).toBe('Please call after 5 PM');
    });

    it('should track all data changes', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]') as any;

      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      textarea.value = 'Prefer morning calls';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toContain('phone');
      expect(data.additionalInfo).toBe('Prefer morning calls');
    });
  });

  describe('Public API', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.showAdditionalInfo = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should get preferences data', () => {
      const data = pattern.getPreferencesData();
      expect(data).toBeDefined();
      expect(data.preferredMethods).toEqual([]);
    });

    it('should set preferences data', async () => {
      const preferencesData: ContactPreferencesData = {
        preferredMethods: ['phone', 'email'],
        additionalInfo: 'Please contact after 6 PM',
      };

      pattern.setPreferencesData(preferencesData);
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toEqual(['phone', 'email']);
      expect(data.additionalInfo).toBe('Please contact after 6 PM');
    });

    it('should clear preferences', async () => {
      const preferencesData: ContactPreferencesData = {
        preferredMethods: ['phone', 'email'],
        additionalInfo: 'Test info',
      };

      pattern.setPreferencesData(preferencesData);
      await pattern.updateComplete;

      pattern.clearPreferences();
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toEqual([]);
      expect(data.additionalInfo).toBeUndefined();
    });

    it('should get selected method count', async () => {
      expect(pattern.getSelectedMethodCount()).toBe(0);

      pattern.setPreferencesData({ preferredMethods: ['phone', 'email'] });
      await pattern.updateComplete;

      expect(pattern.getSelectedMethodCount()).toBe(2);
    });

    it('should check if specific method is selected', async () => {
      expect(pattern.isMethodSelected('phone')).toBe(false);

      pattern.setPreferencesData({ preferredMethods: ['phone', 'email'] });
      await pattern.updateComplete;

      expect(pattern.isMethodSelected('phone')).toBe(true);
      expect(pattern.isMethodSelected('email')).toBe(true);
      expect(pattern.isMethodSelected('text')).toBe(false);
    });
  });

  describe('Validation', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should return true when not required', () => {
      pattern.required = false;
      expect(pattern.validatePreferences()).toBe(true);
    });

    it('should return true when required and preferences are selected', async () => {
      pattern.required = true;
      pattern.setPreferencesData({ preferredMethods: ['email'] });
      await pattern.updateComplete;

      expect(pattern.validatePreferences()).toBe(true);
    });

    it('should return false when required and no preferences are selected', () => {
      pattern.required = true;
      expect(pattern.validatePreferences()).toBe(false);
    });

    it('should return true when required and multiple preferences are selected', async () => {
      pattern.required = true;
      pattern.setPreferencesData({ preferredMethods: ['email', 'phone'] });
      await pattern.updateComplete;

      expect(pattern.validatePreferences()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.hint = 'We will contact you within 5 business days';
      pattern.showAdditionalInfo = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have fieldset and legend for screen readers', () => {
      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toContain('Contact preferences');
    });

    it('should use USWDS form markup structure', () => {
      const fieldset = pattern.querySelector('.usa-fieldset');
      const legend = pattern.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });

    it('should have unique aria-describedby on fieldset', () => {
      const fieldset = pattern.querySelector('fieldset');
      const ariaDescribedBy = fieldset?.getAttribute('aria-describedby');

      expect(ariaDescribedBy).toBeTruthy();
      expect(ariaDescribedBy).not.toBe('');
    });

    it('should reference hint text in aria-describedby when present', () => {
      const fieldset = pattern.querySelector('fieldset');
      const ariaDescribedBy = fieldset?.getAttribute('aria-describedby');
      const hintElement = pattern.querySelector('.usa-hint[id]') as HTMLElement;

      expect(ariaDescribedBy).toContain(hintElement?.id);
    });

    it('should reference optional hint in aria-describedby', () => {
      const fieldset = pattern.querySelector('fieldset');
      const ariaDescribedBy = fieldset?.getAttribute('aria-describedby');
      const optionalHints = pattern.querySelectorAll('.usa-hint[id]');

      // Find the "optional" hint
      const optionalHint = Array.from(optionalHints).find((hint) =>
        hint.textContent?.includes('optional')
      );

      expect(optionalHint).toBeTruthy();
      expect(ariaDescribedBy).toContain(optionalHint?.id);
    });

    it('should have all hint elements with unique IDs', () => {
      const hints = pattern.querySelectorAll('.usa-hint[id]');
      const ids = Array.from(hints).map((hint) => hint.id);

      // Check all IDs are unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Check all IDs are non-empty
      ids.forEach((id) => {
        expect(id).toBeTruthy();
        expect(id.length).toBeGreaterThan(0);
      });
    });

    it('should have proper label associations for checkboxes', () => {
      const checkboxes = pattern.querySelectorAll('usa-checkbox');

      checkboxes.forEach((checkbox) => {
        expect(checkbox.getAttribute('label')).toBeTruthy();
      });
    });

    it('should have proper label for additional info textarea', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea?.getAttribute('label')).toBeTruthy();
      expect(textarea?.getAttribute('hint')).toBeTruthy();
    });

    it('should indicate optional nature of selections', () => {
      const optionalHint = Array.from(pattern.querySelectorAll('.usa-hint')).find((hint) =>
        hint.textContent?.includes('optional')
      );

      expect(optionalHint).toBeTruthy();
      expect(optionalHint?.textContent).toContain('Select all that apply');
    });
  });

  describe('Additional Information Textarea', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.showAdditionalInfo = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render textarea with proper attributes', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');

      expect(textarea).toBeTruthy();
      expect(textarea?.getAttribute('id')).toBe('additional-info');
      expect(textarea?.getAttribute('label')).toBe('Additional information');
    });

    it('should have descriptive hint text', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      const hint = textarea?.getAttribute('hint');

      expect(hint).toContain('accessibility');
      expect(hint).toContain('optional');
    });

    it('should have rows attribute', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea?.getAttribute('rows')).toBe('3');
    });

    it('should not be required', () => {
      const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
      expect(textarea?.hasAttribute('required')).toBe(false);
    });
  });

  describe('Custom Labels and Hints', () => {
    it('should use custom label', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.label = 'How should we reach you?';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const legend = pattern.querySelector('legend');
      expect(legend?.textContent).toBe('How should we reach you?');
    });

    it('should display custom hint when provided', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.hint = 'We will contact you within 24 hours';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const hint = Array.from(pattern.querySelectorAll('.usa-hint')).find((h) =>
        h.textContent?.includes('24 hours')
      );

      expect(hint).toBeTruthy();
    });

    it('should not display hint element when hint is empty', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      pattern.hint = '';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const hints = Array.from(pattern.querySelectorAll('.usa-hint'));

      // Should only have the optional hint, not a custom hint
      expect(hints.length).toBe(1);
      expect(hints[0].textContent).toContain('optional');
    });
  });

  describe('Pattern-specific Features', () => {
    beforeEach(async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render all checkboxes with same name attribute', () => {
      const checkboxes = pattern.querySelectorAll('usa-checkbox');

      checkboxes.forEach((checkbox) => {
        expect(checkbox.getAttribute('name')).toBe('contact-preferences');
      });
    });

    it('should have unique IDs for each checkbox', () => {
      const checkboxes = pattern.querySelectorAll('usa-checkbox[id]');
      const ids = Array.from(checkboxes).map((cb) => cb.id);

      // Check all IDs are unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Check all IDs follow pattern
      ids.forEach((id) => {
        expect(id).toMatch(/^contact-/);
      });
    });

    it('should maintain selection state after re-render', async () => {
      const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;

      phoneCheckbox.checked = true;
      phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      // Force re-render
      pattern.requestUpdate();
      await pattern.updateComplete;

      const data = pattern.getPreferencesData();
      expect(data.preferredMethods).toContain('phone');
    });
  });

  describe('Best Practices', () => {
    it('should make selections optional by default', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const checkboxes = pattern.querySelectorAll('usa-checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox.hasAttribute('required')).toBe(false);
      });
    });

    it('should clearly indicate multiple selection is allowed', async () => {
      pattern = document.createElement(
        'usa-contact-preferences-pattern'
      ) as USAContactPreferencesPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const optionalHint = Array.from(pattern.querySelectorAll('.usa-hint')).find((hint) =>
        hint.textContent?.includes('Select all that apply')
      );

      expect(optionalHint).toBeTruthy();
    });
  });

  describe('Slot Rendering & Composition', () => {
    describe('Child Component Initialization', () => {
      beforeEach(async () => {
        pattern = document.createElement(
          'usa-contact-preferences-pattern'
        ) as USAContactPreferencesPattern;
        pattern.showAdditionalInfo = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should initialize phone checkbox component', async () => {
        const phoneCheckbox = await verifyChildComponent(pattern, 'usa-checkbox[value="phone"]');
        expect(phoneCheckbox).toBeTruthy();

        // Verify internal structure rendered
        const input = phoneCheckbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
      });

      it('should initialize text checkbox component', async () => {
        const textCheckbox = await verifyChildComponent(pattern, 'usa-checkbox[value="text"]');
        expect(textCheckbox).toBeTruthy();

        const input = textCheckbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
      });

      it('should initialize email checkbox component', async () => {
        const emailCheckbox = await verifyChildComponent(pattern, 'usa-checkbox[value="email"]');
        expect(emailCheckbox).toBeTruthy();

        const input = emailCheckbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
      });

      it('should initialize mail checkbox component', async () => {
        const mailCheckbox = await verifyChildComponent(pattern, 'usa-checkbox[value="mail"]');
        expect(mailCheckbox).toBeTruthy();

        const input = mailCheckbox.querySelector('input.usa-checkbox__input');
        expect(input).toBeTruthy();
      });

      it('should initialize additional info textarea component', async () => {
        const textarea = await verifyChildComponent(
          pattern,
          'usa-textarea[name="additional-info"]'
        );
        expect(textarea).toBeTruthy();

        const textareaEl = textarea.querySelector('textarea.usa-textarea');
        expect(textareaEl).toBeTruthy();
      });

      it('should render all default checkbox components', async () => {
        // All 4 default contact method checkboxes should exist
        const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]');
        const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]');
        const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]');
        const mailCheckbox = pattern.querySelector('usa-checkbox[value="mail"]');

        expect(phoneCheckbox).toBeTruthy();
        expect(textCheckbox).toBeTruthy();
        expect(emailCheckbox).toBeTruthy();
        expect(mailCheckbox).toBeTruthy();

        // All checkboxes should be visible
        const checkboxes = pattern.querySelectorAll('usa-checkbox');
        expect(checkboxes.length).toBe(4);
      });

      it('should hide additional info by default', async () => {
        const defaultPattern = document.createElement(
          'usa-contact-preferences-pattern'
        ) as USAContactPreferencesPattern;
        container.appendChild(defaultPattern);
        await defaultPattern.updateComplete;

        const textarea = defaultPattern.querySelector('usa-textarea[name="additional-info"]');

        // Component should not exist when showAdditionalInfo is false
        expect(textarea).toBeFalsy();

        defaultPattern.remove();
      });
    });

    describe('Child Components Render with Correct USWDS Classes', () => {
      beforeEach(async () => {
        pattern = document.createElement(
          'usa-contact-preferences-pattern'
        ) as USAContactPreferencesPattern;
        pattern.showAdditionalInfo = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should have correct USWDS classes on phone checkbox', async () => {
        const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]');
        const input = phoneCheckbox?.querySelector('input');
        const label = phoneCheckbox?.querySelector('label');

        expect(input?.classList.contains('usa-checkbox__input')).toBe(true);
        expect(label?.classList.contains('usa-checkbox__label')).toBe(true);
      });

      it('should have correct USWDS classes on text checkbox', async () => {
        const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]');
        const input = textCheckbox?.querySelector('input');
        const label = textCheckbox?.querySelector('label');

        expect(input?.classList.contains('usa-checkbox__input')).toBe(true);
        expect(label?.classList.contains('usa-checkbox__label')).toBe(true);
      });

      it('should have correct USWDS classes on email checkbox', async () => {
        const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]');
        const input = emailCheckbox?.querySelector('input');
        const label = emailCheckbox?.querySelector('label');

        expect(input?.classList.contains('usa-checkbox__input')).toBe(true);
        expect(label?.classList.contains('usa-checkbox__label')).toBe(true);
      });

      it('should have correct USWDS classes on mail checkbox', async () => {
        const mailCheckbox = pattern.querySelector('usa-checkbox[value="mail"]');
        const input = mailCheckbox?.querySelector('input');
        const label = mailCheckbox?.querySelector('label');

        expect(input?.classList.contains('usa-checkbox__input')).toBe(true);
        expect(label?.classList.contains('usa-checkbox__label')).toBe(true);
      });

      it('should have correct USWDS classes on textarea', async () => {
        const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
        const textareaEl = textarea?.querySelector('textarea');
        const label = textarea?.querySelector('label');

        expect(textareaEl?.classList.contains('usa-textarea')).toBe(true);
        expect(label?.classList.contains('usa-label')).toBe(true);
      });

      it('should have labels for all checkbox components', async () => {
        const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]');
        const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]');
        const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]');
        const mailCheckbox = pattern.querySelector('usa-checkbox[value="mail"]');

        expect(phoneCheckbox?.querySelector('label')).toBeTruthy();
        expect(textCheckbox?.querySelector('label')).toBeTruthy();
        expect(emailCheckbox?.querySelector('label')).toBeTruthy();
        expect(mailCheckbox?.querySelector('label')).toBeTruthy();
      });

      it('should have label for textarea component', async () => {
        const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
        expect(textarea?.querySelector('label')).toBeTruthy();
      });
    });

    describe('Pattern Composition and USWDS Structure Compliance', () => {
      beforeEach(async () => {
        pattern = document.createElement(
          'usa-contact-preferences-pattern'
        ) as USAContactPreferencesPattern;
        pattern.showAdditionalInfo = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should compose all expected fields', async () => {
        await verifyUSWDSStructure(pattern, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: [
            'usa-checkbox[value="phone"]',
            'usa-checkbox[value="text"]',
            'usa-checkbox[value="email"]',
            'usa-checkbox[value="mail"]',
            'usa-textarea[name="additional-info"]',
          ],
        });
      });

      it('should have proper fieldset structure', () => {
        const fieldset = pattern.querySelector('fieldset.usa-fieldset');
        const legend = pattern.querySelector('legend.usa-legend');

        expect(fieldset).toBeTruthy();
        expect(legend).toBeTruthy();
        expect(legend?.textContent).toBe('Contact preferences');
      });

      it('should show/hide additional info based on showAdditionalInfo property', async () => {
        // With showAdditionalInfo = true
        let textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
        expect(textarea).toBeTruthy();

        // Toggle showAdditionalInfo to false
        pattern.showAdditionalInfo = false;
        await pattern.updateComplete;

        textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
        expect(textarea).toBeFalsy();

        // Toggle back to true
        pattern.showAdditionalInfo = true;
        await pattern.updateComplete;

        textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
        expect(textarea).toBeTruthy();
      });

      it('should use fieldset for semantic grouping', () => {
        const fieldset = pattern.querySelector('fieldset');
        const checkboxes = pattern.querySelectorAll('usa-checkbox');

        expect(fieldset).toBeTruthy();
        checkboxes.forEach((checkbox) => {
          expect(fieldset?.contains(checkbox)).toBe(true);
        });
      });

      it('should have legend as first child of fieldset', () => {
        const fieldset = pattern.querySelector('fieldset');
        const firstChild = fieldset?.querySelector(':scope > legend');

        expect(firstChild).toBeTruthy();
        expect(firstChild?.classList.contains('usa-legend')).toBe(true);
      });

      it('should maintain USWDS structure with custom methods', async () => {
        const customPattern = document.createElement(
          'usa-contact-preferences-pattern'
        ) as USAContactPreferencesPattern;
        customPattern.methods = [
          { value: 'fax', label: 'Fax' },
          { value: 'video', label: 'Video call' },
        ];
        container.appendChild(customPattern);
        await customPattern.updateComplete;

        await verifyUSWDSStructure(customPattern, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: ['usa-checkbox[value="fax"]', 'usa-checkbox[value="video"]'],
        });

        customPattern.remove();
      });
    });

    describe('Event Propagation from Child Components', () => {
      beforeEach(async () => {
        pattern = document.createElement(
          'usa-contact-preferences-pattern'
        ) as USAContactPreferencesPattern;
        pattern.showAdditionalInfo = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should propagate checkbox change events to pattern', async () => {
        const events: any[] = [];
        pattern.addEventListener('preferences-change', (e) => {
          events.push((e as CustomEvent).detail);
        });

        const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
        const input = phoneCheckbox?.querySelector('input') as HTMLInputElement;

        // Check the checkbox
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await pattern.updateComplete;

        // Verify event was received
        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('preferredMethods');
        expect(events[0].value).toContain('phone');
      });

      it('should propagate textarea input events to pattern', async () => {
        const events: any[] = [];
        pattern.addEventListener('preferences-change', (e) => {
          events.push((e as CustomEvent).detail);
        });

        const textarea = pattern.querySelector('usa-textarea[name="additional-info"]') as any;
        const textareaEl = textarea?.querySelector('textarea') as HTMLTextAreaElement;

        // Type in textarea
        textareaEl.value = 'Please call after 5 PM';
        textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
        await pattern.updateComplete;

        // Verify event was received
        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('additionalInfo');
        expect(events[0].value).toBe('Please call after 5 PM');
      });

      it('should handle multiple checkbox selections', async () => {
        const events: any[] = [];
        pattern.addEventListener('preferences-change', (e) => {
          events.push((e as CustomEvent).detail);
        });

        // Select multiple checkboxes
        const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]') as any;
        const emailCheckbox = pattern.querySelector('usa-checkbox[value="email"]') as any;

        phoneCheckbox.checked = true;
        phoneCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        await pattern.updateComplete;

        emailCheckbox.checked = true;
        emailCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        await pattern.updateComplete;

        // Verify both events were received
        expect(events.length).toBe(2);
        expect(events[0].value).toContain('phone');
        expect(events[1].value).toContain('phone');
        expect(events[1].value).toContain('email');
      });
    });

    describe('Compact Mode for Child Components', () => {
      beforeEach(async () => {
        pattern = document.createElement(
          'usa-contact-preferences-pattern'
        ) as USAContactPreferencesPattern;
        pattern.showAdditionalInfo = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should render textarea in compact mode', async () => {
        const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');

        // Verify compact attribute is set
        expect(textarea?.hasAttribute('compact')).toBe(true);

        await verifyCompactMode(textarea as HTMLElement);
      });

      it('should not have form-group wrapper on textarea', () => {
        const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
        const formGroup = textarea?.querySelector('.usa-form-group');

        expect(formGroup).toBeFalsy();
      });

      it('should have textarea label as direct child', () => {
        const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
        const label = textarea?.querySelector('label.usa-label');

        expect(label).toBeTruthy();
        expect(label?.parentElement).toBe(textarea);
      });

      it('should have textarea element as direct child', () => {
        const textarea = pattern.querySelector('usa-textarea[name="additional-info"]');
        const textareaEl = textarea?.querySelector('textarea.usa-textarea');

        expect(textareaEl).toBeTruthy();
        expect(textareaEl?.parentElement).toBe(textarea);
      });
    });

    describe('Checkbox Component Properties and Attributes', () => {
      beforeEach(async () => {
        pattern = document.createElement(
          'usa-contact-preferences-pattern'
        ) as USAContactPreferencesPattern;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should have correct name attribute on all checkboxes', () => {
        const checkboxes = pattern.querySelectorAll('usa-checkbox');

        checkboxes.forEach((checkbox) => {
          expect(checkbox.getAttribute('name')).toBe('contact-preferences');
        });
      });

      it('should have unique value attributes on checkboxes', () => {
        const checkboxes = pattern.querySelectorAll('usa-checkbox');
        const values = Array.from(checkboxes).map((cb) => cb.getAttribute('value'));

        // All values should be unique
        const uniqueValues = new Set(values);
        expect(uniqueValues.size).toBe(values.length);

        // Check expected values
        expect(values).toContain('phone');
        expect(values).toContain('text');
        expect(values).toContain('email');
        expect(values).toContain('mail');
      });

      it('should have unique IDs on all checkboxes', () => {
        const checkboxes = pattern.querySelectorAll('usa-checkbox[id]');
        const ids = Array.from(checkboxes).map((cb) => cb.id);

        // All IDs should be unique
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);

        // All IDs should follow pattern
        ids.forEach((id) => {
          expect(id).toMatch(/^contact-/);
        });
      });

      it('should have label attributes on all checkboxes', () => {
        const checkboxes = pattern.querySelectorAll('usa-checkbox');

        checkboxes.forEach((checkbox) => {
          const label = checkbox.getAttribute('label');
          expect(label).toBeTruthy();
          expect(label?.length).toBeGreaterThan(0);
        });
      });

      it('should have description attributes on some checkboxes', () => {
        const phoneCheckbox = pattern.querySelector('usa-checkbox[value="phone"]');
        const textCheckbox = pattern.querySelector('usa-checkbox[value="text"]');

        expect(phoneCheckbox?.getAttribute('description')).toContain('voicemails');
        expect(textCheckbox?.getAttribute('description')).toContain('SMS');
      });
    });
  });
});
