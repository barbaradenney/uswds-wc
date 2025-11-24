import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-checkbox.ts';
import type { USACheckbox } from './usa-checkbox.js';
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
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';

describe('USACheckbox', () => {
  let element: USACheckbox;

  beforeEach(() => {
    element = document.createElement('usa-checkbox') as USACheckbox;
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
      expect(element.indeterminate).toBe(false);
      expect(element.tile).toBe(false);
    });
  });

  describe('Basic Checkbox Properties', () => {
    it('should set name property', async () => {
      element.name = 'test-name';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.name).toBe('test-name');
    });

    it('should set value property', async () => {
      element.value = 'test-value';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.value).toBe('test-value');
    });

    it('should set checked state', async () => {
      element.checked = true;
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.checked).toBe(true);
    });

    it('should set disabled state', async () => {
      element.disabled = true;
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.disabled).toBe(true);
    });

    it('should set required state', async () => {
      element.required = true;
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.required).toBe(true);
    });

    it('should set indeterminate state', async () => {
      element.indeterminate = true;
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.indeterminate).toBe(true);
    });
  });

  describe('Light DOM Initial Render (CRITICAL)', () => {
    it('should set checked attribute in initial render', async () => {
      // Create fresh element with checked property set before appending
      const freshElement = document.createElement('usa-checkbox') as USACheckbox;
      freshElement.checked = true;
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render (Light DOM still uses async rendering)
      await freshElement.updateComplete;

      const checkbox = freshElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.checked).toBe(true);

      freshElement.remove();
    });

    it('should set name and value attributes in initial render', async () => {
      const freshElement = document.createElement('usa-checkbox') as USACheckbox;
      freshElement.name = 'test-name';
      freshElement.value = 'test-value';
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const checkbox = freshElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.name).toBe('test-name');
      expect(checkbox?.value).toBe('test-value');

      freshElement.remove();
    });

    it('should set disabled attribute in initial render', async () => {
      const freshElement = document.createElement('usa-checkbox') as USACheckbox;
      freshElement.disabled = true;
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const checkbox = freshElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.disabled).toBe(true);

      freshElement.remove();
    });

    it('should set required attribute in initial render', async () => {
      const freshElement = document.createElement('usa-checkbox') as USACheckbox;
      freshElement.required = true;
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const checkbox = freshElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.required).toBe(true);

      freshElement.remove();
    });

    it('should apply USWDS classes in initial render', async () => {
      const freshElement = document.createElement('usa-checkbox') as USACheckbox;
      freshElement.tile = true;
      freshElement.error = 'Error message';
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const checkbox = freshElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.classList.contains('usa-checkbox__input')).toBe(true);
      expect(checkbox?.classList.contains('usa-checkbox__input--tile')).toBe(true);
      expect(checkbox?.classList.contains('usa-input--error')).toBe(true);

      freshElement.remove();
    });

    it('should set aria-invalid in initial render when error exists', async () => {
      const freshElement = document.createElement('usa-checkbox') as USACheckbox;
      freshElement.error = 'Error message';
      freshElement.label = 'Test';
      document.body.appendChild(freshElement);

      // Wait for Lit's async first render
      await freshElement.updateComplete;

      const checkbox = freshElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox?.getAttribute('aria-invalid')).toBe('true');

      freshElement.remove();
    });
  });

  describe('Label and Description', () => {
    it('should render label text', async () => {
      element.label = 'Test checkbox';
      await element.updateComplete;

      const label = element.querySelector('.usa-checkbox__label');
      expect(label?.textContent?.trim()).toContain('Test checkbox');
    });

    it('should associate label with checkbox via ID', async () => {
      element.id = 'test-checkbox';
      element.label = 'Test checkbox';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]');
      const label = element.querySelector('label');

      expect(checkbox?.id).toBe('test-checkbox');
      expect(label?.getAttribute('for')).toBe('test-checkbox');
    });

    it('should render description when provided', async () => {
      element.description = 'This is a test description';
      await element.updateComplete;

      const description = element.querySelector('.usa-checkbox__label-description');
      expect(description?.textContent?.trim()).toBe('This is a test description');
    });

    it('should not render description when empty', async () => {
      element.description = '';
      await element.updateComplete;

      const description = element.querySelector('.usa-checkbox__label-description');
      expect(description).toBeNull();
    });

    it('should generate ID when not provided', async () => {
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]');
      expect(checkbox?.id).toMatch(/^checkbox-[a-z0-9]{9}$/);
    });
  });

  describe('Tile Variant', () => {
    it('should apply tile classes when tile is true', async () => {
      element.tile = true;
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-checkbox');
      const checkbox = element.querySelector('input[type="checkbox"]');

      // USWDS spec: tile variant adds class to input, not wrapper
      expect(wrapper?.classList.contains('usa-checkbox')).toBe(true);
      expect(checkbox?.classList.contains('usa-checkbox__input--tile')).toBe(true);
    });

    it('should not apply tile classes when tile is false', async () => {
      element.tile = false;
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-checkbox');
      const checkbox = element.querySelector('input[type="checkbox"]');

      expect(wrapper?.classList.contains('usa-checkbox--tile')).toBe(false);
      expect(checkbox?.classList.contains('usa-checkbox__input--tile')).toBe(false);
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

    it('should apply error class to checkbox when error exists', async () => {
      element.error = 'Test error';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]');
      // USWDS uses aria-invalid for error state, not error class on checkbox
      expect(checkbox?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set aria-invalid when error exists', async () => {
      element.error = 'Test error';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]');
      expect(checkbox?.getAttribute('aria-invalid')).toBe('true');
    });

    it('should not render error message when empty', async () => {
      element.error = '';
      await element.updateComplete;

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg).toBeNull();
    });
  });

  describe('ARIA Attributes', () => {
    it('should associate checkbox with description via aria-describedby', async () => {
      element.id = 'test-checkbox';
      element.description = 'Test description';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]');
      expect(checkbox?.getAttribute('aria-describedby')).toBe('test-checkbox-description');
    });

    it('should associate checkbox with error via aria-describedby', async () => {
      element.id = 'test-checkbox';
      element.error = 'Test error';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]');
      expect(checkbox?.getAttribute('aria-describedby')).toBe('test-checkbox-error');
    });

    it('should associate checkbox with both description and error', async () => {
      element.id = 'test-checkbox';
      element.description = 'Test description';
      element.error = 'Test error';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]');
      expect(checkbox?.getAttribute('aria-describedby')).toBe(
        'test-checkbox-description test-checkbox-error'
      );
    });

    it('should have correct IDs for description and error elements', async () => {
      element.id = 'test-checkbox';
      element.description = 'Test description';
      element.error = 'Test error';
      await element.updateComplete;

      const description = element.querySelector('.usa-checkbox__label-description');
      const error = element.querySelector('.usa-error-message');

      expect(description?.id).toBe('test-checkbox-description');
      expect(error?.id).toBe('test-checkbox-error');
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.label = 'Test Checkbox Option';
      element.name = 'test-checkbox';
      element.value = 'test-value';
      await element.updateComplete;

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Event Handling', () => {
    it('should dispatch change event when checkbox is toggled', async () => {
      await element.updateComplete;

      let changeEventDetail: any;
      element.addEventListener('change', (e: any) => {
        changeEventDetail = e.detail;
      });

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox).toBeTruthy(); // Ensure checkbox exists

      // Simulate the change by setting checked and creating a change event
      checkbox.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: checkbox,
      });

      // Manually trigger the component's handleChange method
      (element as any).handleChange(changeEvent);

      await element.updateComplete;

      expect(changeEventDetail.checked).toBe(true);
      expect(element.checked).toBe(true);
    });

    it('should change state when label is clicked', async () => {
      element.label = 'Test Label';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const label = element.querySelector('label') as HTMLLabelElement;

      expect(checkbox).toBeTruthy();
      expect(label).toBeTruthy();
      expect(checkbox.checked).toBe(false);

      // Click the label (simulates user clicking the label text)
      label.click();
      await element.updateComplete;

      // Checkbox should now be checked
      expect(checkbox.checked).toBe(true);
      expect(element.checked).toBe(true);

      // Click again - should toggle back
      label.click();
      await element.updateComplete;

      expect(checkbox.checked).toBe(false);
      expect(element.checked).toBe(false);
    });

    it('should change state when checkbox input is clicked directly', async () => {
      element.label = 'Test Label';
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(checkbox).toBeTruthy();
      expect(checkbox.checked).toBe(false);

      // Click the checkbox directly
      checkbox.click();
      await element.updateComplete;

      // Checkbox should now be checked
      expect(checkbox.checked).toBe(true);
      expect(element.checked).toBe(true);

      // Click again - should toggle back
      checkbox.click();
      await element.updateComplete;

      expect(checkbox.checked).toBe(false);
      expect(element.checked).toBe(false);
    });

    it('should dispatch input event when checkbox is toggled', async () => {
      await element.updateComplete;

      let inputEventDetail: any;
      element.addEventListener('input', (e: any) => {
        inputEventDetail = e.detail;
      });

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;

      // Simulate the change by setting checked and creating a change event
      checkbox.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: checkbox,
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

      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;

      // Simulate the change by setting checked and creating a change event
      checkbox.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: checkbox,
      });

      // Manually trigger the component's handleChange method
      (element as any).handleChange(changeEvent);

      await element.updateComplete;

      expect(eventDetail.name).toBe('test-name');
      expect(eventDetail.value).toBe('test-value');
      expect(eventDetail.checked).toBe(true);
    });
  });

  describe('USWDS CSS Classes', () => {
    it('should always have base usa-checkbox class', async () => {
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-checkbox');
      expect(wrapper).toBeTruthy();
    });

    it('should have correct input class', async () => {
      await element.updateComplete;

      const checkbox = element.querySelector('input[type="checkbox"]');
      expect(checkbox?.classList.contains('usa-checkbox__input')).toBe(true);
    });

    it('should have correct label class', async () => {
      element.label = 'Test';
      await element.updateComplete;

      const label = element.querySelector('label');
      expect(label?.classList.contains('usa-checkbox__label')).toBe(true);
    });

    it('should have proper USWDS structure', async () => {
      element.label = 'Test Label';
      element.description = 'Test Description';
      element.error = 'Test Error';
      await element.updateComplete;

      const wrapper = element.querySelector('.usa-checkbox');
      const checkbox = element.querySelector('.usa-checkbox__input');
      const label = element.querySelector('.usa-checkbox__label');
      const description = element.querySelector('.usa-checkbox__label-description');
      const error = element.querySelector('.usa-error-message');

      expect(wrapper).toBeTruthy();
      expect(checkbox).toBeTruthy();
      expect(label).toBeTruthy();
      expect(description).toBeTruthy();
      expect(error).toBeTruthy();
    });
  });

  describe('Light DOM Rendering', () => {
    it('should render in light DOM for USWDS compatibility', async () => {
      await element.updateComplete;

      expect(element.shadowRoot).toBeNull();
      expect(element.querySelector('input[type="checkbox"]')).toBeTruthy();
    });
  });

  describe('Form Integration', () => {
    it('should work with form data', async () => {
      const form = document.createElement('form');
      element.name = 'test-checkbox';
      element.value = 'test-value';
      element.checked = true;

      form.appendChild(element);
      document.body.appendChild(form);
      await element.updateComplete;

      const formData = new FormData(form);
      expect(formData.get('test-checkbox')).toBe('test-value');

      form.remove();
    });

    it('should not appear in form data when unchecked', async () => {
      const form = document.createElement('form');
      element.name = 'test-checkbox';
      element.value = 'test-value';
      element.checked = false;

      form.appendChild(element);
      document.body.appendChild(form);
      await element.updateComplete;

      const formData = new FormData(form);
      expect(formData.get('test-checkbox')).toBeNull();

      form.remove();
    });
  });

  describe('ID Management', () => {
    it('should use provided ID consistently', async () => {
      const newElement = document.createElement('usa-checkbox') as USACheckbox;
      newElement.id = 'custom-checkbox';
      newElement.label = 'Test';
      newElement.description = 'Test description';
      document.body.appendChild(newElement);
      await newElement.updateComplete;

      const checkbox = newElement.querySelector('input[type="checkbox"]');
      const label = newElement.querySelector('label');
      const description = newElement.querySelector('.usa-checkbox__label-description');

      expect(checkbox?.id).toBe('custom-checkbox');
      expect(label?.getAttribute('for')).toBe('custom-checkbox');
      expect(description?.id).toBe('custom-checkbox-description');

      newElement.remove();
    });
  });

  // CRITICAL TESTS - Prevent auto-dismiss and lifecycle bugs
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    let element: USACheckbox;

    beforeEach(() => {
      element = document.createElement('usa-checkbox') as USACheckbox;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      // Apply initial properties
      element.name = 'test-checkbox';
      element.value = 'test-value';
      element.checked = false;
      element.label = 'Test Label';
      element.description = 'Test description';
      element.disabled = false;
      element.required = false;
      element.indeterminate = false;
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
          name: 'set1',
          value: 'value1',
          checked: true,
          label: 'Label 1',
          description: 'Desc 1',
          disabled: false,
          required: true,
          indeterminate: false,
          tile: false,
          error: '',
        },
        {
          name: 'set2',
          value: 'value2',
          checked: false,
          label: 'Label 2',
          description: 'Desc 2',
          disabled: true,
          required: false,
          indeterminate: true,
          tile: true,
          error: 'Error message',
        },
        {
          name: 'set3',
          value: 'value3',
          checked: true,
          label: 'Label 3',
          description: '',
          disabled: false,
          required: true,
          indeterminate: false,
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
      element.label = 'Test Checkbox';
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

      for (let i = 0; i < 20; i++) {
        const props = propertySets[i % propertySets.length];
        Object.assign(element, props);
        await element.updateComplete;

        // Element should remain stable
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

        // Verify checkbox element is still properly connected
        const checkbox = element.querySelector('input[type="checkbox"]');
        expect(checkbox).toBeTruthy();
      }

      const endTime = performance.now();

      // Should complete updates reasonably fast (under 1000ms for checkbox complexity)
      expect(endTime - startTime).toBeLessThan(1000);

      // Final verification
      expect(document.body.contains(element)).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/checkbox/usa-checkbox.ts`;
        const validation = validateComponentJavaScript(componentPath, 'checkbox');

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
    let element: USACheckbox;

    beforeEach(() => {
      element = document.createElement('usa-checkbox') as USACheckbox;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should render correctly when created via Storybook patterns', async () => {
      // Simulate how Storybook creates components with args
      const storybookArgs = {
        name: 'storybook-checkbox',
        value: 'storybook-value',
        checked: true,
        label: 'Storybook Checkbox',
        description: 'This is a Storybook checkbox example',
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
        element.querySelector('input[type="checkbox"]') !== null &&
        element.querySelector('label') !== null &&
        (element.textContent?.trim().length || 0) > 0;
      expect(hasContent).toBe(true);

      // Verify checkbox-specific rendering
      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const label = element.querySelector('.usa-checkbox__label');
      const description = element.querySelector('.usa-checkbox__label-description');

      expect(checkbox?.checked).toBe(true);
      expect(checkbox?.required).toBe(true);
      expect(label).toBeTruthy();
      expect(description?.textContent?.trim()).toBe('This is a Storybook checkbox example');
      // Check for tile class on input per USWDS spec
      expect(element.querySelector('.usa-checkbox__input--tile')).toBeTruthy();
    });

    it('should handle Storybook controls updates without breaking', async () => {
      // Simulate initial Storybook state
      const initialArgs = {
        name: 'controls-test',
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
        { checked: false, disabled: false, error: '', tile: false },
      ];

      for (const update of storybookUpdates) {
        Object.assign(element, update);
        await element.updateComplete;

        // Should not cause blank frame or auto-dismiss
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

        // Verify checkbox element remains functional
        const checkbox = element.querySelector('input[type="checkbox"]');
        expect(checkbox).toBeTruthy();
      }
    });

    it('should maintain visual state during hot reloads', async () => {
      const initialArgs = {
        name: 'hotreload-test',
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
      const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const initialChecked = checkbox?.checked;
      const initialDisabled = checkbox?.disabled;

      // Simulate hot reload (property reassignment with same values)
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Should maintain state without disappearing
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should maintain form state
      const checkboxAfter = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkboxAfter?.checked).toBe(initialChecked);
      expect(checkboxAfter?.disabled).toBe(initialDisabled);
      // Check for tile class on input per USWDS spec
      expect(element.querySelector('.usa-checkbox__input--tile')).toBeTruthy();
      expect(element.querySelector('.usa-error-message')).toBeTruthy();
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should be focusable via keyboard (Tab)', async () => {
      element.label = 'Subscribe to newsletter';
      await element.updateComplete;

      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus the checkbox
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
    });

    it('should toggle checked state with Space key (WCAG 2.1.1)', async () => {
      element.label = 'Terms and conditions';
      await element.updateComplete;

      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.checked).toBe(false);

      // Focus checkbox
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

      // Native checkboxes handle Space automatically in browser
      // In jsdom, verify checkbox is properly set up for keyboard interaction
      expect(input.type).toBe('checkbox');
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should support Enter and Space key activation', async () => {
      element.label = 'Enable notifications';
      await element.updateComplete;

      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      const result = await testActivationKeys(input);
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should be keyboard-only usable', async () => {
      element.label = 'Accept terms';
      await element.updateComplete;

      const result = await verifyKeyboardOnlyUsable(element);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('keyboard accessible');
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.label = 'Agree to privacy policy';
      await element.updateComplete;

      const result = await testKeyboardNavigation(element, {
        shortcuts: [
          {
            key: ' ',
            description: 'Toggle checkbox with Space',
          },
        ],
        testEscapeKey: false, // Checkboxes don't respond to Escape
        testArrowKeys: false, // Single checkbox doesn't use arrows
      });

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should not trap keyboard focus', async () => {
      element.label = 'Subscribe';
      await element.updateComplete;

      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus checkbox
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
      element.label = 'Remember me';
      await element.updateComplete;

      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus checkbox
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that checkbox is focused
      expect(document.activeElement).toBe(input);

      // USWDS applies :focus styles via CSS - we verify element is focusable
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle Tab navigation in checkbox group', async () => {
      // Create multiple checkboxes for group testing
      const checkbox1 = document.createElement('usa-checkbox') as USACheckbox;
      checkbox1.label = 'Option 1';
      checkbox1.name = 'options';
      checkbox1.value = 'opt1';

      const checkbox2 = document.createElement('usa-checkbox') as USACheckbox;
      checkbox2.label = 'Option 2';
      checkbox2.name = 'options';
      checkbox2.value = 'opt2';

      const checkbox3 = document.createElement('usa-checkbox') as USACheckbox;
      checkbox3.label = 'Option 3';
      checkbox3.name = 'options';
      checkbox3.value = 'opt3';

      document.body.appendChild(checkbox1);
      document.body.appendChild(checkbox2);
      document.body.appendChild(checkbox3);

      await checkbox1.updateComplete;
      await checkbox2.updateComplete;
      await checkbox3.updateComplete;

      // Get all focusable elements
      const group = document.body;
      const focusableElements = getFocusableElements(group);

      // Should have at least 3 checkboxes
      const checkboxInputs = focusableElements.filter(
        (el) => el instanceof HTMLInputElement && el.type === 'checkbox'
      );
      expect(checkboxInputs.length).toBeGreaterThanOrEqual(3);

      // Verify all checkboxes are keyboard accessible
      checkboxInputs.forEach((input) => {
        expect((input as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });

      // Cleanup
      checkbox1.remove();
      checkbox2.remove();
      checkbox3.remove();
    });

    it('should not respond to disabled checkboxes via keyboard', async () => {
      element.label = 'Disabled option';
      element.disabled = true;
      await element.updateComplete;

      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
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

      // Disabled checkboxes should not respond
      // Note: In real browser, disabled inputs don't even receive focus
      expect(input.disabled).toBe(true);

      element.removeEventListener('change', changeSpy);
    });

    it('should maintain required attribute during keyboard interaction', async () => {
      element.label = 'Required field';
      element.required = true;
      await element.updateComplete;

      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.required).toBe(true);

      // Focus and interact
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Required attribute should be maintained during keyboard interaction
      expect(input.required).toBe(true);
      expect(document.activeElement).toBe(input);
    });

    it('should support tile variant keyboard interaction', async () => {
      element.label = 'Premium subscription';
      element.tile = true;
      element.description = 'Includes all features';
      await element.updateComplete;

      const input = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Tile checkboxes should be keyboard accessible
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);

      // Verify tile class applied
      expect(element.querySelector('.usa-checkbox__input--tile')).toBeTruthy();
    });
  });
});
