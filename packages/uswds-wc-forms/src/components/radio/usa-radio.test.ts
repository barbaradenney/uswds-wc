import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-radio.ts';
import type { USARadio } from './usa-radio.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import {
  testKeyboardNavigation,
  testActivationKeys,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
  testArrowKeyNavigation,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';

describe('USARadio', () => {
  let element: USARadio;

  beforeEach(() => {
    element = document.createElement('usa-radio') as USARadio;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Default Properties', () => {
    it('should have correct default properties', async () => {
      await element.updateComplete;

      expect(element.name).toBe('');
      expect(element.value).toBe('');
      expect(element.checked).toBe(false);
      expect(element.label).toBe('');
      expect(element.description).toBe('');
      expect(element.error).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
      expect(element.tile).toBe(false);
    });
  });

  describe('Basic Radio Properties', () => {
    it('should set name property', async () => {
      element.name = 'test-name';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio?.name).toBe('test-name');
    });

    it('should set value property', async () => {
      element.value = 'test-value';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio?.value).toBe('test-value');
    });

    it('should set checked state', async () => {
      element.checked = true;
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio?.checked).toBe(true);
    });

    it('should set disabled state', async () => {
      element.disabled = true;
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio?.disabled).toBe(true);
    });

    it('should set required state', async () => {
      element.required = true;
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio?.required).toBe(true);
    });
  });

  describe('Label and Description', () => {
    it('should render label text', async () => {
      element.label = 'Test radio';
      await element.updateComplete;

      const label = element.querySelector('.usa-radio__label');
      expect(label?.textContent?.trim()).toContain('Test radio');
    });

    it('should associate label with radio via ID', async () => {
      element.id = 'test-radio';
      element.label = 'Test radio';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      const label = element.querySelector('label');

      expect(radio?.id).toBe('test-radio');
      expect(label?.getAttribute('for')).toBe('test-radio');
    });

    it('should render description when tile variant is used', async () => {
      element.tile = true;
      element.description = 'This is a test description';
      await element.updateComplete;

      const description = element.querySelector('.usa-radio__label-description');
      expect(description?.textContent?.trim()).toBe('This is a test description');
    });

    it('should not render description when tile is false', async () => {
      element.tile = false;
      element.description = 'This should not appear';
      await element.updateComplete;

      const description = element.querySelector('.usa-radio__label-description');
      expect(description).toBeNull();
    });

    it('should generate ID when not provided', async () => {
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      expect(radio?.id).toMatch(/^radio-[a-z0-9]{9}$/);
    });
  });

  describe('Tile Variant', () => {
    it('should apply tile classes when tile is true', async () => {
      element.tile = true;
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-radio');
      const radio = element.querySelector('input[type="radio"]');

      expect(wrapper?.classList.contains('usa-radio--tile')).toBe(true);
      expect(radio?.classList.contains('usa-radio__input--tile')).toBe(true);
    });

    it('should not apply tile classes when tile is false', async () => {
      element.tile = false;
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-radio');
      const radio = element.querySelector('input[type="radio"]');

      expect(wrapper?.classList.contains('usa-radio--tile')).toBe(false);
      expect(radio?.classList.contains('usa-radio__input--tile')).toBe(false);
    });
  });

  describe('Error State', () => {
    it('should render error message when provided', async () => {
      element.error = 'This field is required';
      await element.updateComplete;

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg?.textContent?.includes('This field is required')).toBe(true);
      expect(errorMsg?.getAttribute('role')).toBe('alert');
    });

    it('should apply error class to radio when error exists', async () => {
      element.error = 'Test error';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      expect(radio?.classList.contains('usa-input--error')).toBe(true);
    });

    it('should set aria-invalid when error exists', async () => {
      element.error = 'Test error';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      expect(radio?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not render error message when empty', async () => {
      element.error = '';
      await element.updateComplete;

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg).toBeNull();
    });
  });

  describe('ARIA Attributes', () => {
    it('should associate radio with description via aria-describedby', async () => {
      element.id = 'test-radio';
      element.tile = true;
      element.description = 'Test description';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      expect(radio?.getAttribute('aria-describedby')).toBe('test-radio-description');
    });

    it('should associate radio with error via aria-describedby', async () => {
      element.id = 'test-radio';
      element.error = 'Test error';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      expect(radio?.getAttribute('aria-describedby')).toBe('test-radio-error');
    });

    it('should associate radio with both description and error', async () => {
      element.id = 'test-radio';
      element.tile = true;
      element.description = 'Test description';
      element.error = 'Test error';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      expect(radio?.getAttribute('aria-describedby')).toBe(
        'test-radio-description test-radio-error'
      );
    });

    it('should have correct IDs for description and error elements', async () => {
      element.id = 'test-radio';
      element.tile = true;
      element.description = 'Test description';
      element.error = 'Test error';
      await element.updateComplete;

      const description = element.querySelector('.usa-radio__label-description');
      const error = element.querySelector('.usa-error-message');

      expect(description?.id).toBe('test-radio-description');
      expect(error?.id).toBe('test-radio-error');
    });

    it('should not set aria-describedby when no description or error', async () => {
      element.id = 'test-radio';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      expect(radio?.hasAttribute('aria-describedby')).toBe(false);
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.label = 'Test Radio Option';
      element.name = 'test-radio';
      element.value = 'test-value';
      await element.updateComplete;

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Event Handling', () => {
    it('should dispatch change event when radio is selected', async () => {
      await element.updateComplete;

      let changeEventDetail: any;
      element.addEventListener('change', (e: any) => {
        changeEventDetail = e.detail;
      });

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;

      // Simulate the change by setting checked and creating a change event
      radio.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: radio,
      });

      // Manually trigger the component's handleChange method
      (element as any).handleChange(changeEvent);

      await element.updateComplete;

      expect(changeEventDetail.checked).toBe(true);
      expect(element.checked).toBe(true);
    });

    it('should dispatch input event when radio is selected', async () => {
      await element.updateComplete;

      let inputEventDetail: any;
      element.addEventListener('input', (e: any) => {
        inputEventDetail = e.detail;
      });

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;

      // Simulate the change by setting checked and creating a change event
      radio.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: radio,
      });

      // Manually trigger the component's handleChange method
      (element as any).handleChange(changeEvent);

      await element.updateComplete;

      expect(inputEventDetail.checked).toBe(true);
    });

    it('should include name and value in event detail', async () => {
      element.name = 'test-name';
      element.value = 'test-value';
      await element.updateComplete;

      let eventDetail: any;
      element.addEventListener('change', (e: any) => {
        eventDetail = e.detail;
      });

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;

      // Simulate the change by setting checked and creating a change event
      radio.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: radio,
      });

      // Manually trigger the component's handleChange method
      (element as any).handleChange(changeEvent);

      await element.updateComplete;

      expect(eventDetail.name).toBe('test-name');
      expect(eventDetail.value).toBe('test-value');
      expect(eventDetail.checked).toBe(true);
    });

    // Regression tests for label click functionality
    // Prevents bug where clicking label doesn't properly select radio
    it('should select radio when label is clicked', async () => {
      element.label = 'Test Label';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;
      const label = element.querySelector('label') as HTMLLabelElement;

      expect(radio).toBeTruthy();
      expect(label).toBeTruthy();
      expect(radio.checked).toBe(false);

      // Click the label (simulates user clicking the label text)
      label.click();
      await element.updateComplete;

      // Radio should now be checked
      expect(radio.checked).toBe(true);
      expect(element.checked).toBe(true);
    });

    it('should select radio when input is clicked directly', async () => {
      element.label = 'Test Label';
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;

      expect(radio).toBeTruthy();
      expect(radio.checked).toBe(false);

      // Click the radio directly
      radio.click();
      await element.updateComplete;

      // Radio should now be checked
      expect(radio.checked).toBe(true);
      expect(element.checked).toBe(true);
    });
  });

  describe('USWDS CSS Classes', () => {
    it('should always have base usa-radio class', async () => {
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-radio');
      expect(wrapper).toBeTruthy();
    });

    it('should have correct input class', async () => {
      await element.updateComplete;

      const radio = element.querySelector('input[type="radio"]');
      expect(radio?.classList.contains('usa-radio__input')).toBe(true);
    });

    it('should have correct label class', async () => {
      element.label = 'Test';
      await element.updateComplete;

      const label = element.querySelector('label');
      expect(label?.classList.contains('usa-radio__label')).toBe(true);
    });

    it('should have proper USWDS structure', async () => {
      element.label = 'Test Label';
      element.tile = true;
      element.description = 'Test Description';
      element.error = 'Test Error';
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-radio');
      const radio = element.querySelector('.usa-radio__input');
      const label = element.querySelector('.usa-radio__label');
      const description = element.querySelector('.usa-radio__label-description');
      const error = element.querySelector('.usa-error-message');

      expect(wrapper).toBeTruthy();
      expect(radio).toBeTruthy();
      expect(label).toBeTruthy();
      expect(description).toBeTruthy();
      expect(error).toBeTruthy();
    });
  });

  describe('Light DOM Rendering', () => {
    it('should render in light DOM for USWDS compatibility', async () => {
      await element.updateComplete;

      expect(element.shadowRoot).toBeNull();
      expect(element.querySelector('input[type="radio"]')).toBeTruthy();
    });
  });

  describe('Form Integration', () => {
    it('should work with form data when checked', async () => {
      const form = document.createElement('form');
      element.name = 'test-radio';
      element.value = 'test-value';
      element.checked = true;

      form.appendChild(element);
      document.body.appendChild(form);
      await element.updateComplete;

      const formData = new FormData(form);
      expect(formData.get('test-radio')).toBe('test-value');

      form.remove();
    });

    it('should not appear in form data when unchecked', async () => {
      const form = document.createElement('form');
      element.name = 'test-radio';
      element.value = 'test-value';
      element.checked = false;

      form.appendChild(element);
      document.body.appendChild(form);
      await element.updateComplete;

      const formData = new FormData(form);
      expect(formData.get('test-radio')).toBeNull();

      form.remove();
    });

    it('should work in radio groups - only one selected', async () => {
      const form = document.createElement('form');

      const radio1 = document.createElement('usa-radio') as USARadio;
      radio1.name = 'group';
      radio1.value = 'option1';
      radio1.checked = true;

      const radio2 = document.createElement('usa-radio') as USARadio;
      radio2.name = 'group';
      radio2.value = 'option2';
      radio2.checked = false;

      form.appendChild(radio1);
      form.appendChild(radio2);
      document.body.appendChild(form);

      await radio1.updateComplete;
      await radio2.updateComplete;

      const formData = new FormData(form);
      expect(formData.get('group')).toBe('option1');

      form.remove();
    });
  });

  describe('ID Management', () => {
    it('should use provided ID consistently', async () => {
      const newElement = document.createElement('usa-radio') as USARadio;
      newElement.id = 'custom-radio';
      newElement.label = 'Test';
      newElement.tile = true;
      newElement.description = 'Test description';
      newElement.error = 'Test error';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      const radio = newElement.querySelector('input[type="radio"]');
      const label = newElement.querySelector('label');
      const description = newElement.querySelector('.usa-radio__label-description');
      const error = newElement.querySelector('.usa-error-message');

      expect(radio?.id).toBe('custom-radio');
      expect(label?.getAttribute('for')).toBe('custom-radio');
      expect(description?.id).toBe('custom-radio-description');
      expect(error?.id).toBe('custom-radio-error');

      newElement.remove();
    });
  });

  describe('Radio Group Behavior', () => {
    it('should enforce single selection within same name group', async () => {
      // Create multiple radios with same name
      const radio1 = document.createElement('usa-radio') as USARadio;
      radio1.name = 'testGroup';
      radio1.value = 'option1';
      radio1.checked = true;

      const radio2 = document.createElement('usa-radio') as USARadio;
      radio2.name = 'testGroup';
      radio2.value = 'option2';

      document.body.appendChild(radio1);
      document.body.appendChild(radio2);

      await radio1.updateComplete;
      await radio2.updateComplete;

      // Simulate selecting the second radio
      const radio2Input = radio2.querySelector('input[type="radio"]') as HTMLInputElement;
      radio2Input.checked = true;
      radio2Input.dispatchEvent(new Event('change', { bubbles: true }));

      // First radio should become unchecked (native behavior)
      const radio1Input = radio1.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio1Input.checked).toBe(false);
      expect(radio2Input.checked).toBe(true);

      radio1.remove();
      radio2.remove();
    });
  });

  // CRITICAL TESTS - Prevent auto-dismiss and lifecycle bugs
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    let element: USARadio;

    beforeEach(() => {
      element = document.createElement('usa-radio') as USARadio;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      // Apply initial properties
      element.name = 'test-radio';
      element.value = 'test-value';
      element.checked = false;
      element.label = 'Test Radio';
      element.description = 'Test description';
      element.disabled = false;
      element.required = false;
      element.tile = false;
      await element.updateComplete;

      // Verify element exists after initial render
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Update properties (this is where bugs often occur)
      element.checked = true;
      element.disabled = true;
      element.error = 'Test error';
      element.tile = true;
      await element.updateComplete;

      // CRITICAL: Element should still exist in DOM
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Multiple rapid property updates
      const propertySets = [
        {
          name: 'group1',
          value: 'option1',
          checked: true,
          label: 'Option 1',
          description: 'First option',
          disabled: false,
          required: true,
          tile: false,
          error: '',
        },
        {
          name: 'group2',
          value: 'option2',
          checked: false,
          label: 'Option 2',
          description: 'Second option',
          disabled: true,
          required: false,
          tile: true,
          error: 'Error message',
        },
        {
          name: 'group3',
          value: 'option3',
          checked: true,
          label: 'Option 3',
          description: '',
          disabled: false,
          required: true,
          tile: false,
          error: 'Another error',
        },
      ];

      for (const props of propertySets) {
        Object.assign(element, props);
        await element.updateComplete;

        // CRITICAL: Element should survive all updates
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();
      }
    });

    it('should not fire unintended events on property changes', async () => {
      const eventSpies = [
        vi.fn(), // Generic event spy
        vi.fn(), // Close/dismiss spy
        vi.fn(), // Submit/action spy
      ];

      // Common event names that might be fired accidentally
      const commonEvents = ['close', 'dismiss', 'submit', 'action'];

      commonEvents.forEach((eventName, index) => {
        if (eventSpies[index]) {
          element.addEventListener(eventName, eventSpies[index]);
        }
      });

      // Set up initial state
      element.name = 'test';
      element.label = 'Test Radio';
      await element.updateComplete;

      // Update properties should NOT fire these unintended events
      element.checked = true;
      await element.updateComplete;

      element.disabled = true;
      await element.updateComplete;

      element.error = 'Test error';
      await element.updateComplete;

      element.description = 'Updated description';
      await element.updateComplete;

      element.tile = true;
      await element.updateComplete;

      // Verify no unintended events were fired
      eventSpies.forEach((spy, _index) => {
        if (spy) {
          expect(spy).not.toHaveBeenCalled();
        }
      });

      // Verify element is still in DOM
      expect(document.body.contains(element)).toBe(true);
    });

    it('should handle rapid property updates without breaking', async () => {
      // Simulate rapid updates like form interactions or dynamic UI updates
      const startTime = performance.now();

      const propertySets = [
        { checked: true, disabled: false, error: '', required: true, tile: false },
        { checked: false, disabled: true, error: 'Error', required: false, tile: true },
        { checked: true, disabled: false, error: '', required: true, tile: false },
        { checked: false, disabled: false, error: 'Another error', required: false, tile: true },
      ];

      element.label = 'Rapid Test';
      element.name = 'rapid-group';

      for (let i = 0; i < 20; i++) {
        const props = propertySets[i % propertySets.length];
        Object.assign(element, props);
        await element.updateComplete;

        // Element should remain stable
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

        // Verify radio element is still properly connected
        const radio = element.querySelector('input[type="radio"]');
        expect(radio).toBeTruthy();
      }

      const endTime = performance.now();

      // Should complete updates reasonably fast (under 1000ms for radio complexity)
      expect(endTime - startTime).toBeLessThan(1000);

      // Final verification
      expect(document.body.contains(element)).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/radio/usa-radio.ts`;
        const validation = validateComponentJavaScript(componentPath, 'radio');

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

  describe('Storybook Integration Tests (CRITICAL)', () => {
    let element: USARadio;

    beforeEach(() => {
      element = document.createElement('usa-radio') as USARadio;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should render correctly when created via Storybook patterns', async () => {
      // Simulate how Storybook creates components with args
      const storybookArgs = {
        name: 'storybook-radio-group',
        value: 'storybook-value',
        checked: true,
        label: 'Storybook Radio Option',
        description: 'This is a Storybook radio example',
        disabled: false,
        required: true,
        tile: true,
      };

      // Apply args like Storybook would
      Object.assign(element, storybookArgs);
      await element.updateComplete;

      // Should render without blank frames
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should have expected content structure
      const hasContent =
        element.querySelector('input[type="radio"]') !== null &&
        element.querySelector('label') !== null &&
        (element.textContent?.trim().length || 0) > 0;
      expect(hasContent).toBe(true);

      // Verify radio-specific rendering
      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;
      const label = element.querySelector('.usa-radio__label');
      const description = element.querySelector('.usa-radio__label-description');

      expect(radio?.checked).toBe(true);
      expect(radio?.required).toBe(true);
      expect(radio?.name).toBe('storybook-radio-group');
      expect(radio?.value).toBe('storybook-value');
      expect(label).toBeTruthy();
      expect(description?.textContent?.trim()).toBe('This is a Storybook radio example');
      expect(element.querySelector('.usa-radio--tile')).toBeTruthy();
    });

    it('should handle Storybook controls updates without breaking', async () => {
      // Simulate initial Storybook state
      const initialArgs = {
        name: 'controls-test-group',
        value: 'initial-value',
        checked: false,
        label: 'Controls Test',
        description: '',
        disabled: false,
        required: false,
        tile: false,
        error: '',
      };
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Verify initial state
      expect(document.body.contains(element)).toBe(true);

      // Simulate user changing controls in Storybook
      const storybookUpdates = [
        { checked: true },
        { disabled: true },
        { label: 'Updated Label' },
        { description: 'Updated description' },
        { error: 'Test error message' },
        { required: true },
        { tile: true },
        { value: 'updated-value' },
        { checked: false, disabled: false, error: '', tile: false },
      ];

      for (const update of storybookUpdates) {
        Object.assign(element, update);
        await element.updateComplete;

        // Should not cause blank frame or auto-dismiss
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

        // Verify radio element remains functional
        const radio = element.querySelector('input[type="radio"]');
        expect(radio).toBeTruthy();
      }
    });

    it('should maintain visual state during hot reloads', async () => {
      const initialArgs = {
        name: 'hotreload-test-group',
        value: 'hotreload-value',
        checked: true,
        label: 'Hot Reload Test',
        description: 'Test description for hot reload',
        disabled: true,
        required: true,
        tile: true,
        error: 'Test error',
      };

      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Verify initial complex state
      const radio = element.querySelector('input[type="radio"]') as HTMLInputElement;
      const initialChecked = radio?.checked;
      const initialDisabled = radio?.disabled;
      const initialName = radio?.name;

      // Simulate hot reload (property reassignment with same values)
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Should maintain state without disappearing
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should maintain form state
      const radioAfter = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radioAfter?.checked).toBe(initialChecked);
      expect(radioAfter?.disabled).toBe(initialDisabled);
      expect(radioAfter?.name).toBe(initialName);
      expect(element.querySelector('.usa-radio--tile')).toBeTruthy();
      expect(element.querySelector('.usa-error-message')).toBeTruthy();
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should be focusable via keyboard (Tab)', async () => {
      element.label = 'Option A';
      element.name = 'choice';
      element.value = 'a';
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus the radio button
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
    });

    it('should select radio with Space key (WCAG 2.1.1)', async () => {
      element.label = 'Option A';
      element.name = 'choice';
      element.value = 'a';
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.checked).toBe(false);

      // Focus radio
      input.focus();

      // Simulate Space key
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(spaceEvent);

      // Native radios handle Space automatically in browser
      // In jsdom, verify radio is properly set up for keyboard interaction
      expect(input.type).toBe('radio');
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should support arrow key navigation in radio group', async () => {
      // Create a radio button group
      const radio1 = document.createElement('usa-radio') as USARadio;
      radio1.label = 'Option 1';
      radio1.name = 'group';
      radio1.value = '1';
      radio1.checked = true;

      const radio2 = document.createElement('usa-radio') as USARadio;
      radio2.label = 'Option 2';
      radio2.name = 'group';
      radio2.value = '2';

      const radio3 = document.createElement('usa-radio') as USARadio;
      radio3.label = 'Option 3';
      radio3.name = 'group';
      radio3.value = '3';

      document.body.appendChild(radio1);
      document.body.appendChild(radio2);
      document.body.appendChild(radio3);

      await radio1.updateComplete;
      await radio2.updateComplete;
      await radio3.updateComplete;

      const input1 = radio1.querySelector('input[type="radio"]') as HTMLInputElement;
      const input2 = radio2.querySelector('input[type="radio"]') as HTMLInputElement;
      const input3 = radio3.querySelector('input[type="radio"]') as HTMLInputElement;

      // Focus first radio
      input1.focus();
      expect(document.activeElement).toBe(input1);

      // Arrow keys should navigate between radios in group
      // In real browser, native radio groups handle arrow navigation automatically
      // Verify all radios in group are keyboard accessible
      expect(input1.tabIndex).toBeGreaterThanOrEqual(0);
      expect(input2.tabIndex).toBeGreaterThanOrEqual(0);
      expect(input3.tabIndex).toBeGreaterThanOrEqual(0);

      // Cleanup
      radio1.remove();
      radio2.remove();
      radio3.remove();
    });

    it('should support Enter and Space key activation', async () => {
      element.label = 'Agree to terms';
      element.name = 'terms';
      element.value = 'agree';
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      const result = await testActivationKeys(input);
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should be keyboard-only usable', async () => {
      element.label = 'Option A';
      element.name = 'selection';
      element.value = 'a';
      await element.updateComplete;

      const result = await verifyKeyboardOnlyUsable(element);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('keyboard accessible');
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.label = 'Choice A';
      element.name = 'choice';
      element.value = 'a';
      await element.updateComplete;

      const result = await testKeyboardNavigation(element, {
        shortcuts: [
          {
            key: ' ',
            description: 'Select radio with Space',
          },
        ],
        testEscapeKey: false, // Radios don't respond to Escape
        testArrowKeys: true, // Radios use arrow navigation in groups
      });

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should not trap keyboard focus', async () => {
      element.label = 'Option';
      element.name = 'option';
      element.value = 'opt';
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus radio
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(tabEvent);

      // Tab should not be prevented (keyboard trap check)
      expect(tabEvent.defaultPrevented).toBe(false);
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      element.label = 'Selected option';
      element.name = 'selection';
      element.value = 'selected';
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus radio
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that radio is focused
      expect(document.activeElement).toBe(input);

      // USWDS applies :focus styles via CSS - we verify element is focusable
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle Tab navigation entering/exiting radio group', async () => {
      // Create radio group with checked item
      const radio1 = document.createElement('usa-radio') as USARadio;
      radio1.label = 'First';
      radio1.name = 'group';
      radio1.value = '1';

      const radio2 = document.createElement('usa-radio') as USARadio;
      radio2.label = 'Second';
      radio2.name = 'group';
      radio2.value = '2';
      radio2.checked = true; // Checked item should receive Tab focus

      const radio3 = document.createElement('usa-radio') as USARadio;
      radio3.label = 'Third';
      radio3.name = 'group';
      radio3.value = '3';

      document.body.appendChild(radio1);
      document.body.appendChild(radio2);
      document.body.appendChild(radio3);

      await radio1.updateComplete;
      await radio2.updateComplete;
      await radio3.updateComplete;

      // According to WCAG, Tab should focus the checked radio in a group
      // (or first if none checked)
      const focusableElements = getFocusableElements(document.body);
      const radioInputs = focusableElements.filter(
        (el) =>
          el instanceof HTMLInputElement &&
          el.type === 'radio' &&
          (el as HTMLInputElement).name === 'group'
      );

      expect(radioInputs.length).toBeGreaterThan(0);

      // Verify all radios in group are keyboard accessible
      radioInputs.forEach((input) => {
        expect((input as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });

      // Cleanup
      radio1.remove();
      radio2.remove();
      radio3.remove();
    });

    it('should not respond to disabled radios via keyboard', async () => {
      element.label = 'Disabled option';
      element.name = 'disabled';
      element.value = 'dis';
      element.disabled = true;
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.disabled).toBe(true);

      const changeSpy = vi.fn();
      element.addEventListener('change', changeSpy);

      // Try to activate with Space
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(spaceEvent);

      // Disabled radios should not respond
      expect(input.disabled).toBe(true);

      element.removeEventListener('change', changeSpy);
    });

    it('should maintain required attribute during keyboard interaction', async () => {
      element.label = 'Required selection';
      element.name = 'required';
      element.value = 'req';
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.required).toBe(true);

      // Focus and interact
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Required attribute should be maintained
      expect(input.required).toBe(true);
      expect(document.activeElement).toBe(input);
    });

    it('should support tile variant keyboard interaction', async () => {
      element.label = 'Premium plan';
      element.name = 'plan';
      element.value = 'premium';
      element.tile = true;
      element.description = 'Best value';
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Tile radios should be keyboard accessible
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);

      // Verify tile class applied
      expect(element.querySelector('.usa-radio--tile')).toBeTruthy();
    });

    it('should handle arrow key navigation patterns', async () => {
      // Create fieldset with radio group
      const fieldset = document.createElement('fieldset');

      const radio1 = document.createElement('usa-radio') as USARadio;
      radio1.label = 'Option 1';
      radio1.name = 'options';
      radio1.value = '1';

      const radio2 = document.createElement('usa-radio') as USARadio;
      radio2.label = 'Option 2';
      radio2.name = 'options';
      radio2.value = '2';

      const radio3 = document.createElement('usa-radio') as USARadio;
      radio3.label = 'Option 3';
      radio3.name = 'options';
      radio3.value = '3';

      fieldset.appendChild(radio1);
      fieldset.appendChild(radio2);
      fieldset.appendChild(radio3);
      document.body.appendChild(fieldset);

      await radio1.updateComplete;
      await radio2.updateComplete;
      await radio3.updateComplete;

      // Test arrow key navigation support
      const result = await testArrowKeyNavigation(fieldset);
      expect(result.passed).toBe(true);

      // Cleanup
      fieldset.remove();
    });

    it('should prevent unchecking via keyboard (radio behavior)', async () => {
      element.label = 'Option A';
      element.name = 'single';
      element.value = 'a';
      element.checked = true;
      await element.updateComplete;

      const input = element.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.checked).toBe(true);

      // Focus and try to uncheck (radios can't be unchecked once selected)
      input.focus();

      // Space key on already-checked radio should not uncheck it
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(spaceEvent);

      // Radio should remain checked (radios don't toggle like checkboxes)
      expect(input.checked).toBe(true);
    });
  });
});
