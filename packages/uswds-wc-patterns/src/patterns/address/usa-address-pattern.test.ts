import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-address-pattern.js';
import type { USAAddressPattern, AddressData } from './usa-address-pattern.js';
import {
  verifyChildComponent,
  verifyPropertyBinding,
  verifyUSWDSStructure,
  verifyCompactMode,
} from '@uswds-wc/test-utils/slot-testing-utils.js';

describe('USAAddressPattern', () => {
  let pattern: USAAddressPattern;
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
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-ADDRESS-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.label).toBe('Address');
      expect(pattern.required).toBe(false);
      expect(pattern.showStreet2).toBe(true);
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
      expect(legend?.textContent).toBe('Address');
    });

    it('should render required form fields', async () => {
      await pattern.updateComplete;

      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      const city = pattern.querySelector('usa-text-input[name="city"]');
      const state = pattern.querySelector('usa-select[name="state"]');
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');

      expect(street1).toBeTruthy();
      expect(city).toBeTruthy();
      expect(state).toBeTruthy();
      expect(zipCode).toBeTruthy();
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement('usa-address-pattern') as USAAddressPattern;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.addressData).toBeDefined();
      expect(event.detail.addressData).toEqual({});

      newPattern.remove();
    });
  });

  describe('Field Visibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show street2 field by default', () => {
      const street2 = pattern.querySelector('usa-text-input[name="street2"]');
      expect(street2).toBeTruthy();
    });

    it('should hide street2 when showStreet2 is false', async () => {
      pattern.showStreet2 = false;
      await pattern.updateComplete;

      const street2 = pattern.querySelector('usa-text-input[name="street2"]');
      expect(street2).toBeTruthy(); // Element exists
      expect(street2?.classList.contains('display-none')).toBe(true); // But hidden with USWDS utility class
    });
  });

  describe('Required Fields', () => {
    it('should not mark fields as required by default', async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      expect(street1?.hasAttribute('required')).toBe(false);
    });

    it('should mark fields as required when required prop is true', async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      pattern.required = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      const city = pattern.querySelector('usa-text-input[name="city"]');
      const state = pattern.querySelector('usa-select[name="state"]');
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');

      expect(street1?.hasAttribute('required')).toBe(true);
      expect(city?.hasAttribute('required')).toBe(true);
      expect(state?.hasAttribute('required')).toBe(true);
      expect(zipCode?.hasAttribute('required')).toBe(true);
    });
  });

  describe('Data Changes', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit address-change event when field changes', async () => {
      const changePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('address-change', (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });

      const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
      street1.dispatchEvent(new Event('input', { bubbles: true }));

      const event = await changePromise;
      expect(event.detail.addressData).toBeDefined();
      expect(event.detail.field).toBe('street1');
    });

    it('should track all field values', async () => {
      const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
      const city = pattern.querySelector('usa-text-input[name="city"]') as any;
      const state = pattern.querySelector('usa-select[name="state"]') as any;
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]') as any;

      // Simulate user input by setting element value and dispatching event
      street1.value = '123 Main St';
      street1.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      city.value = 'Springfield';
      city.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      state.value = 'IL';
      state.dispatchEvent(new Event('change', { bubbles: true }));
      await pattern.updateComplete;

      zipCode.value = '62701';
      zipCode.dispatchEvent(new Event('input', { bubbles: true }));
      await pattern.updateComplete;

      const data = pattern.getAddressData();
      expect(data.street1).toBe('123 Main St');
      expect(data.city).toBe('Springfield');
      expect(data.state).toBe('IL');
      expect(data.zipCode).toBe('62701');
    });
  });

  describe('Public API', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should get address data', () => {
      const data = pattern.getAddressData();
      expect(data).toBeDefined();
      expect(data).toEqual({});
    });

    it('should set address data', async () => {
      const addressData: AddressData = {
        street1: '456 Oak Ave',
        street2: 'Apt 2B',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
      };

      pattern.setAddressData(addressData);
      await pattern.updateComplete;

      const data = pattern.getAddressData();
      expect(data).toEqual(addressData);
    });

    it('should clear address', async () => {
      const addressData: AddressData = {
        street1: '456 Oak Ave',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
      };

      pattern.setAddressData(addressData);
      await pattern.updateComplete;

      pattern.clearAddress();
      await pattern.updateComplete;

      const data = pattern.getAddressData();
      expect(data).toEqual({});
    });

    it('should validate required address', async () => {
      pattern.required = true;
      await pattern.updateComplete;

      // Empty address should not be valid
      expect(pattern.validateAddress()).toBe(false);

      // Partial address should not be valid
      pattern.setAddressData({ street1: '123 Main St' });
      await pattern.updateComplete;
      expect(pattern.validateAddress()).toBe(false);

      // Complete address should be valid
      pattern.setAddressData({
        street1: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
      });
      await pattern.updateComplete;
      expect(pattern.validateAddress()).toBe(true);
    });

    it('should always validate true when not required', async () => {
      pattern.required = false;
      await pattern.updateComplete;

      expect(pattern.validateAddress()).toBe(true);

      pattern.setAddressData({ street1: '123 Main St' });
      await pattern.updateComplete;
      expect(pattern.validateAddress()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have fieldset and legend for screen readers', () => {
      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
      expect(legend?.textContent).toContain('Address');
    });

    it('should have proper label associations', async () => {
      await pattern.updateComplete;

      const street1 = pattern.querySelector('usa-text-input[name="street1"]');
      const city = pattern.querySelector('usa-text-input[name="city"]');

      expect(street1?.getAttribute('label')).toBeTruthy();
      expect(city?.getAttribute('label')).toBeTruthy();
    });

    it('should use USWDS form markup structure', () => {
      const fieldset = pattern.querySelector('.usa-fieldset');
      const legend = pattern.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });
  });

  describe('ZIP Code Validation', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have pattern attribute for ZIP code validation', () => {
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
      expect(zipCode?.getAttribute('pattern')).toBe('[0-9]{5}(-[0-9]{4})?');
    });

    it('should have maxlength for ZIP code', () => {
      const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
      expect(zipCode?.getAttribute('maxlength')).toBe('10');
    });
  });

  describe('State Selection', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render all US states in select', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered inside the <select> element via .options property
      const select = selectComponent?.querySelector('select');
      const options = select?.querySelectorAll('option');

      // Should have "- Select -" plus 50 states
      expect(options?.length).toBeGreaterThan(50);
    });

    it('should have default empty option', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete; // Wait for select component to render

      // Options are rendered inside the <select> element via .options property
      const select = selectComponent?.querySelector('select');
      const firstOption = select?.querySelector('option');

      expect(firstOption?.value).toBe('');
      expect(firstOption?.textContent).toContain('Select');
    });
  });

  describe('Pattern Composition (CRITICAL)', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should use usa-select component with options property not slotted content', () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;

      // Verify select component receives options via .options property
      expect(selectComponent).toBeTruthy();
      expect(selectComponent.options).toBeDefined();
      expect(selectComponent.options.length).toBeGreaterThan(0);
    });

    it('should render state options inside select element not as siblings', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select') as HTMLSelectElement;
      const options = select?.querySelectorAll('option');

      // All options should be inside the select element
      expect(select?.contains(options?.[0])).toBe(true);
      expect(select?.contains(options?.[options.length - 1])).toBe(true);

      // No orphaned options outside select
      const allPatternOptions = pattern.querySelectorAll('option');
      const selectOptions = select?.querySelectorAll('option');
      expect(allPatternOptions.length).toBe(selectOptions?.length || 0);
    });

    it('should render state select in initial render without waiting', async () => {
      const freshPattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      container.appendChild(freshPattern);

      // Wait for Lit to render (Light DOM still requires initial render cycle)
      await freshPattern.updateComplete;

      const selectComponent = freshPattern.querySelector('usa-select[name="state"]');
      expect(selectComponent).toBeTruthy();

      freshPattern.remove();
    });
  });

  describe('Custom Labels', () => {
    it('should use custom label', async () => {
      pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
      pattern.label = 'Mailing Address';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const legend = pattern.querySelector('legend');
      expect(legend?.textContent).toBe('Mailing Address');
    });
  });

  describe('Slot Rendering & Composition', () => {
    describe('Child Component Initialization', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
        pattern.showStreet2 = true;
        pattern.showPlusCode = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should initialize street1 text input component', async () => {
        const street1 = await verifyChildComponent(pattern, 'usa-text-input[name="street1"]');
        expect(street1).toBeTruthy();

        // Verify internal structure rendered
        const input = street1.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize street2 text input component', async () => {
        const street2 = await verifyChildComponent(pattern, 'usa-text-input[name="street2"]');
        expect(street2).toBeTruthy();

        const input = street2.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize city text input component', async () => {
        const city = await verifyChildComponent(pattern, 'usa-text-input[name="city"]');
        expect(city).toBeTruthy();

        const input = city.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize state select component', async () => {
        const state = await verifyChildComponent(pattern, 'usa-select[name="state"]');
        expect(state).toBeTruthy();

        const select = state.querySelector('select.usa-select');
        expect(select).toBeTruthy();
      });

      it('should initialize zipCode text input component', async () => {
        const zipCode = await verifyChildComponent(pattern, 'usa-text-input[name="zipCode"]');
        expect(zipCode).toBeTruthy();

        const input = zipCode.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize urbanization text input component', async () => {
        const urbanization = await verifyChildComponent(
          pattern,
          'usa-text-input[name="urbanization"]'
        );
        expect(urbanization).toBeTruthy();

        const input = urbanization.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should initialize plusCode text input component', async () => {
        const plusCode = await verifyChildComponent(pattern, 'usa-text-input[name="plusCode"]');
        expect(plusCode).toBeTruthy();

        const input = plusCode.querySelector('input.usa-input');
        expect(input).toBeTruthy();
      });

      it('should render all child components with correct USWDS classes', async () => {
        // Wait for all child components to initialize
        const components = pattern.querySelectorAll('usa-text-input, usa-select');
        await Promise.all(
          Array.from(components).map((c: any) => c.updateComplete || Promise.resolve())
        );

        // Verify each component rendered its internal structure
        const street1 = pattern.querySelector('usa-text-input[name="street1"]');
        const street2 = pattern.querySelector('usa-text-input[name="street2"]');
        const city = pattern.querySelector('usa-text-input[name="city"]');
        const state = pattern.querySelector('usa-select[name="state"]');
        const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
        const urbanization = pattern.querySelector('usa-text-input[name="urbanization"]');
        const plusCode = pattern.querySelector('usa-text-input[name="plusCode"]');

        expect(street1?.querySelector('input')).toBeTruthy();
        expect(street2?.querySelector('input')).toBeTruthy();
        expect(city?.querySelector('input')).toBeTruthy();
        expect(state?.querySelector('select')).toBeTruthy();
        expect(zipCode?.querySelector('input')).toBeTruthy();
        expect(urbanization?.querySelector('input')).toBeTruthy();
        expect(plusCode?.querySelector('input')).toBeTruthy();
      });

      it('should have correct USWDS classes on child components', async () => {
        const street1 = pattern.querySelector('usa-text-input[name="street1"]');
        const state = pattern.querySelector('usa-select[name="state"]');

        const street1Input = street1?.querySelector('input');
        const stateSelect = state?.querySelector('select');

        expect(street1Input?.classList.contains('usa-input')).toBe(true);
        expect(stateSelect?.classList.contains('usa-select')).toBe(true);
      });

      it('should have labels for all child components', async () => {
        const street1 = pattern.querySelector('usa-text-input[name="street1"]');
        const city = pattern.querySelector('usa-text-input[name="city"]');
        const state = pattern.querySelector('usa-select[name="state"]');
        const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');

        expect(street1?.querySelector('label')).toBeTruthy();
        expect(city?.querySelector('label')).toBeTruthy();
        expect(state?.querySelector('label')).toBeTruthy();
        expect(zipCode?.querySelector('label')).toBeTruthy();
      });
    });

    describe('Pattern Composition', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
        pattern.showStreet2 = true;
        pattern.showPlusCode = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should compose all required address fields', async () => {
        await verifyUSWDSStructure(pattern, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: [
            'usa-text-input[name="street1"]',
            'usa-text-input[name="city"]',
            'usa-select[name="state"]',
            'usa-text-input[name="zipCode"]',
          ],
        });
      });

      it('should compose all optional address fields when enabled', async () => {
        await verifyUSWDSStructure(pattern, {
          fieldsetClass: 'usa-fieldset',
          legendClass: 'usa-legend usa-legend--large',
          expectedChildren: [
            'usa-text-input[name="street1"]',
            'usa-text-input[name="street2"]',
            'usa-text-input[name="city"]',
            'usa-select[name="state"]',
            'usa-text-input[name="zipCode"]',
            'usa-text-input[name="urbanization"]',
            'usa-text-input[name="plusCode"]',
          ],
        });
      });

      it('should show/hide street2 based on showStreet2 property', async () => {
        pattern.showStreet2 = false;
        await pattern.updateComplete;

        const street2 = pattern.querySelector('usa-text-input[name="street2"]');
        expect(street2?.classList.contains('display-none')).toBe(true);

        pattern.showStreet2 = true;
        await pattern.updateComplete;
        expect(street2?.classList.contains('display-none')).toBe(false);
      });

      it('should show/hide plusCode based on showPlusCode property', async () => {
        pattern.showPlusCode = false;
        await pattern.updateComplete;

        const plusCode = pattern.querySelector('usa-text-input[name="plusCode"]');
        expect(plusCode?.classList.contains('display-none')).toBe(true);

        pattern.showPlusCode = true;
        await pattern.updateComplete;
        expect(plusCode?.classList.contains('display-none')).toBe(false);
      });

      it('should always show urbanization field (Puerto Rico)', async () => {
        const urbanization = pattern.querySelector('usa-text-input[name="urbanization"]');
        expect(urbanization).toBeTruthy();
        expect(urbanization?.classList.contains('display-none')).toBe(false);
      });
    });

    describe('Event Propagation from Child Components', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
        pattern.showStreet2 = true;
        pattern.showPlusCode = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should propagate input event from street1 child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('address-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
        await street1?.updateComplete;

        const input = street1?.querySelector('input') as HTMLInputElement;
        input.value = '123 Main St';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('street1');
        expect(events[0].value).toBe('123 Main St');
      });

      it('should propagate input event from street2 child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('address-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const street2 = pattern.querySelector('usa-text-input[name="street2"]') as any;
        await street2?.updateComplete;

        const input = street2?.querySelector('input') as HTMLInputElement;
        input.value = 'Apt 2B';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('street2');
        expect(events[0].value).toBe('Apt 2B');
      });

      it('should propagate input event from city child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('address-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const city = pattern.querySelector('usa-text-input[name="city"]') as any;
        await city?.updateComplete;

        const input = city?.querySelector('input') as HTMLInputElement;
        input.value = 'Portland';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('city');
        expect(events[0].value).toBe('Portland');
      });

      it('should propagate change event from state select child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('address-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const state = pattern.querySelector('usa-select[name="state"]') as any;
        await state?.updateComplete;

        const select = state?.querySelector('select') as HTMLSelectElement;
        select.value = 'OR';
        select.dispatchEvent(new Event('change', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('state');
        expect(events[0].value).toBe('OR');
      });

      it('should propagate input event from zipCode child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('address-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]') as any;
        await zipCode?.updateComplete;

        const input = zipCode?.querySelector('input') as HTMLInputElement;
        input.value = '97201';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('zipCode');
        expect(events[0].value).toBe('97201');
      });

      it('should propagate input event from urbanization child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('address-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const urbanization = pattern.querySelector('usa-text-input[name="urbanization"]') as any;
        await urbanization?.updateComplete;

        const input = urbanization?.querySelector('input') as HTMLInputElement;
        input.value = 'URB Las Lomas';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('urbanization');
        expect(events[0].value).toBe('URB Las Lomas');
      });

      it('should propagate input event from plusCode child component', async () => {
        const events: any[] = [];
        pattern.addEventListener('address-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        const plusCode = pattern.querySelector('usa-text-input[name="plusCode"]') as any;
        await plusCode?.updateComplete;

        const input = plusCode?.querySelector('input') as HTMLInputElement;
        input.value = '87G8Q23F+GH';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        expect(events[0].field).toBe('plusCode');
        expect(events[0].value).toBe('87G8Q23F+GH');
      });

      it('should include full address data in address-change event', async () => {
        const events: any[] = [];
        pattern.addEventListener('address-change', (e: Event) => {
          events.push((e as CustomEvent).detail);
        });

        // Set some initial values
        const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
        const street1Input = street1?.querySelector('input') as HTMLInputElement;
        street1Input.value = '123 Main St';
        street1Input.dispatchEvent(new Event('input', { bubbles: true }));
        await pattern.updateComplete;

        const city = pattern.querySelector('usa-text-input[name="city"]') as any;
        const cityInput = city?.querySelector('input') as HTMLInputElement;
        cityInput.value = 'Portland';
        cityInput.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events.length).toBeGreaterThan(0);
        const lastEvent = events[events.length - 1];
        expect(lastEvent.addressData).toBeDefined();
        expect(lastEvent.addressData.street1).toBe('123 Main St');
        expect(lastEvent.addressData.city).toBe('Portland');
      });
    });

    describe('State Select Property Binding', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should render state options via property binding', async () => {
        const state = pattern.querySelector('usa-select[name="state"]') as any;
        await state?.updateComplete;

        // Verify options were created from property binding
        // Count actual options in the implementation (from getStates() method)
        const select = state?.querySelector('select');
        const options = select?.querySelectorAll('option');

        // Should have all states, territories, and military posts
        expect(options?.length).toBeGreaterThan(50); // At least 50 states + territories + military
        await verifyPropertyBinding(state, 'select', 'option', options?.length || 0);
      });

      it('should have correct state option values', async () => {
        const state = pattern.querySelector('usa-select[name="state"]');
        const select = state?.querySelector('select');
        const options = select?.querySelectorAll('option');

        const values = Array.from(options || []).map((opt) => (opt as HTMLOptionElement).value);

        // Test a few key states
        expect(values).toContain('');
        expect(values).toContain('AL');
        expect(values).toContain('CA');
        expect(values).toContain('NY');
      });

      it('should include US territories in state select', async () => {
        const state = pattern.querySelector('usa-select[name="state"]');
        const select = state?.querySelector('select');
        const options = select?.querySelectorAll('option');

        const values = Array.from(options || []).map((opt) => (opt as HTMLOptionElement).value);

        expect(values).toContain('PR'); // Puerto Rico
        expect(values).toContain('GU'); // Guam
        expect(values).toContain('VI'); // Virgin Islands
        expect(values).toContain('AS'); // American Samoa
        expect(values).toContain('MP'); // Northern Mariana Islands
      });

      it('should include military posts in state select', async () => {
        const state = pattern.querySelector('usa-select[name="state"]');
        const select = state?.querySelector('select');
        const options = select?.querySelectorAll('option');

        const values = Array.from(options || []).map((opt) => (opt as HTMLOptionElement).value);

        expect(values).toContain('AA'); // Armed Forces Americas
        expect(values).toContain('AE'); // Armed Forces Europe
        expect(values).toContain('AP'); // Armed Forces Pacific
      });

      it('should have default empty option', async () => {
        const state = pattern.querySelector('usa-select[name="state"]');
        const select = state?.querySelector('select');
        const firstOption = select?.querySelector('option');

        expect(firstOption?.value).toBe('');
        expect(firstOption?.textContent).toContain('Select');
      });
    });

    describe('Compact Mode', () => {
      beforeEach(async () => {
        pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should use compact mode for all child text input components', async () => {
        const street1 = pattern.querySelector('usa-text-input[name="street1"]');
        await verifyCompactMode(street1 as HTMLElement);

        const city = pattern.querySelector('usa-text-input[name="city"]');
        await verifyCompactMode(city as HTMLElement);

        const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]');
        await verifyCompactMode(zipCode as HTMLElement);
      });

      it('should use compact mode for state select component', async () => {
        const state = pattern.querySelector('usa-select[name="state"]');

        // Verify compact attribute is set
        expect(state?.hasAttribute('compact')).toBe(true);

        // Verify no form-group wrapper
        const formGroup = state?.querySelector('.usa-form-group');
        expect(formGroup).toBeFalsy();

        // Note: Select components may have combo-box wrapper, which is expected behavior
        // The compact mode for select means no form-group wrapper, not no combo-box
      });

      it('should use compact mode for optional fields', async () => {
        pattern.showStreet2 = true;
        pattern.showPlusCode = true;
        await pattern.updateComplete;

        const street2 = pattern.querySelector('usa-text-input[name="street2"]');
        await verifyCompactMode(street2 as HTMLElement);

        const urbanization = pattern.querySelector('usa-text-input[name="urbanization"]');
        await verifyCompactMode(urbanization as HTMLElement);

        const plusCode = pattern.querySelector('usa-text-input[name="plusCode"]');
        await verifyCompactMode(plusCode as HTMLElement);
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
        pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
        pattern.showStreet2 = true;
        pattern.showPlusCode = true;
        container.appendChild(pattern);
        await pattern.updateComplete;
      });

      it('should allow direct access to child component APIs', async () => {
        const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
        const state = pattern.querySelector('usa-select[name="state"]') as any;

        expect(typeof street1?.reset).toBe('function');
        expect(typeof state?.reset).toBe('function');
      });

      it('should allow setting child component values programmatically', async () => {
        const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
        await street1?.updateComplete;

        street1.value = '456 Oak Ave';
        await street1.updateComplete;

        expect(street1.value).toBe('456 Oak Ave');
        const input = street1.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe('456 Oak Ave');
      });

      it('should allow resetting child components via pattern API', async () => {
        // Set some values
        pattern.setAddressData({
          street1: '123 Main St',
          street2: 'Apt 2B',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          urbanization: 'URB Las Lomas',
          plusCode: '87G8Q23F+GH',
        });
        await pattern.updateComplete;

        // Clear via pattern API
        pattern.clearAddress();
        await pattern.updateComplete;

        // Verify all children were reset
        const street1 = pattern.querySelector('usa-text-input[name="street1"]') as any;
        const street2 = pattern.querySelector('usa-text-input[name="street2"]') as any;
        const city = pattern.querySelector('usa-text-input[name="city"]') as any;
        const state = pattern.querySelector('usa-select[name="state"]') as any;
        const zipCode = pattern.querySelector('usa-text-input[name="zipCode"]') as any;
        const urbanization = pattern.querySelector('usa-text-input[name="urbanization"]') as any;
        const plusCode = pattern.querySelector('usa-text-input[name="plusCode"]') as any;

        const street1Input = street1?.querySelector('input') as HTMLInputElement;
        const street2Input = street2?.querySelector('input') as HTMLInputElement;
        const cityInput = city?.querySelector('input') as HTMLInputElement;
        const stateSelect = state?.querySelector('select') as HTMLSelectElement;
        const zipCodeInput = zipCode?.querySelector('input') as HTMLInputElement;
        const urbanizationInput = urbanization?.querySelector('input') as HTMLInputElement;
        const plusCodeInput = plusCode?.querySelector('input') as HTMLInputElement;

        expect(street1Input?.value).toBe('');
        expect(street2Input?.value).toBe('');
        expect(cityInput?.value).toBe('');
        expect(stateSelect?.value).toBe('');
        expect(zipCodeInput?.value).toBe('');
        expect(urbanizationInput?.value).toBe('');
        expect(plusCodeInput?.value).toBe('');
      });
    });
  });
});
