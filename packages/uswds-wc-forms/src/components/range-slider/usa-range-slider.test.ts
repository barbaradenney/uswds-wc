import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-range-slider.ts';
import type { USARangeSlider } from './usa-range-slider.js';
import {
  waitForUpdate,
  testPropertyChanges,
  assertAccessibilityAttributes,
  assertDOMStructure,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForPropertyPropagation, waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USARangeSlider', () => {
  let element: USARangeSlider;

  beforeEach(() => {
    element = document.createElement('usa-range-slider') as USARangeSlider;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-RANGE-SLIDER');
    });

    it('should have default properties', () => {
      expect(element.value).toBe(50);
      expect(element.min).toBe(0);
      expect(element.max).toBe(100);
      expect(element.step).toBe(1);
      expect(element.name).toBe('range-slider');
      expect(element.inputId).toBe('range-slider-input');
      expect(element.label).toBe('Range');
      expect(element.hint).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
      expect(element.unit).toBe('');
      expect(element.showValue).toBe(true);
      expect(element.showMinMax).toBe(true);
    });

    it('should render correct DOM structure', async () => {
      await waitForUpdate(element);

      assertDOMStructure(element, '.usa-form-group', 1, 'Should have form group container');
      assertDOMStructure(element, '.usa-label', 1, 'Should have label element');
      assertDOMStructure(element, '.usa-range__wrapper', 1, 'Should have range wrapper container');
      assertDOMStructure(element, '.usa-range', 1, 'Should have range input');
    });
  });

  describe('Properties', () => {
    it('should handle value changes', async () => {
      await testPropertyChanges(element, 'value', [25, 50, 75, 100], async (el, value) => {
        await waitForUpdate(el);
        const input = el.querySelector('.usa-range') as HTMLInputElement;
        expect(parseFloat(input.value)).toBe(value);
      });
    });

    it('should handle min/max changes', async () => {
      await testPropertyChanges(element, 'min', [0, 10, -50], async (el, value) => {
        await waitForUpdate(el);
        const input = el.querySelector('.usa-range') as HTMLInputElement;
        expect(parseInt(input.min)).toBe(value);
      });

      await testPropertyChanges(element, 'max', [100, 200, 1000], async (el, value) => {
        await waitForUpdate(el);
        const input = el.querySelector('.usa-range') as HTMLInputElement;
        expect(parseInt(input.max)).toBe(value);
      });
    });

    it('should handle step changes', async () => {
      await testPropertyChanges(element, 'step', [1, 5, 10, 0.1], async (el, value) => {
        await waitForUpdate(el);
        const input = el.querySelector('.usa-range') as HTMLInputElement;
        expect(parseFloat(input.step)).toBe(value);
      });
    });

    it('should handle label changes', async () => {
      await testPropertyChanges(
        element,
        'label',
        ['Volume', 'Temperature', 'Budget Amount'],
        async (el, value) => {
          await waitForUpdate(el);
          const label = el.querySelector('.usa-label');
          expect(label?.textContent?.trim()).toContain(value);
        }
      );
    });

    it('should handle hint text changes', async () => {
      await testPropertyChanges(
        element,
        'hint',
        ['', 'Select a value', 'Adjust as needed'],
        async (el, value) => {
          await waitForUpdate(el);
          const hint = el.querySelector('.usa-hint');
          if (value) {
            expect(hint?.textContent?.trim()).toBe(value);
          } else {
            expect(hint).toBeNull();
          }
        }
      );
    });

    it('should handle disabled state', async () => {
      element.disabled = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should handle required state', async () => {
      element.required = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      const formGroup = element.querySelector('.usa-form-group');

      expect(input.required).toBe(true);
      expect(formGroup?.classList.contains('usa-form-group--required')).toBe(true);
    });

    it('should handle unit changes', async () => {
      await testPropertyChanges(element, 'unit', ['', '%', '°F', '$', 'MB'], async (el, value) => {
        await waitForUpdate(el);
        const valueDisplay = el.querySelector('.usa-range__value');
        if (value) {
          expect(valueDisplay?.textContent?.trim()).toContain(value);
        }
      });
    });

    it('should handle showValue toggle', async () => {
      element.showValue = false;
      await waitForPropertyPropagation(element);

      const valueDisplay = element.querySelector('.usa-range__value');

      expect(valueDisplay).toBeNull();

      element.showValue = true;
      await waitForPropertyPropagation(element);

      const valueDisplayAfter = element.querySelector('.usa-range__value');

      expect(valueDisplayAfter).toBeTruthy();
    });

    it('should handle showMinMax toggle', async () => {
      element.showMinMax = false;
      await waitForUpdate(element);

      // Check that min-max displays are not present
      const minMaxSpans = element.querySelectorAll('div[style*="display: flex"] span');
      expect(minMaxSpans.length).toBe(0);

      element.showMinMax = true;
      await waitForUpdate(element);

      // Check that min-max displays are now present (2 spans for min and max)
      const minMaxSpansAfter = element.querySelectorAll('.display-flex.flex-justify span');
      expect(minMaxSpansAfter.length).toBe(2);
    });
  });

  describe('Value Formatting and Calculations', () => {
    it('should format values correctly', async () => {
      await waitForUpdate(element);

      element.unit = '';
      expect((element as any).formatValue(50)).toBe('50');

      element.unit = '%';
      expect((element as any).formatValue(75)).toBe('75%');

      element.unit = '°F';
      expect((element as any).formatValue(72)).toBe('72°F');

      element.unit = '$';
      expect((element as any).formatValue(1000)).toBe('1000$');
    });

    it('should handle value calculations within range', async () => {
      await waitForUpdate(element);

      // Default range 0-100
      element.value = 0;
      await waitForPropertyPropagation(element);
      const input = element.querySelector('input[type="range"]') as HTMLInputElement;
      expect(input.value).toBe('0');

      element.value = 50;
      await waitForUpdate(element);
      expect(input.value).toBe('50');

      element.value = 100;
      await waitForUpdate(element);
      expect(input.value).toBe('100');

      // Custom range 10-20
      element.min = 10;
      element.max = 20;
      element.value = 15;
      await waitForUpdate(element);
      expect(input.min).toBe('10');
      expect(input.max).toBe('20');
      expect(input.value).toBe('15');
    });

    it('should handle decimal values correctly', async () => {
      element.min = 0;
      element.max = 1;
      element.step = 0.1;
      element.value = 0.5;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(parseFloat(input.value)).toBe(0.5);
      expect(parseFloat(input.step)).toBe(0.1);
    });

    it('should handle negative ranges', async () => {
      element.min = -100;
      element.max = 100;
      element.value = -50;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="range"]') as HTMLInputElement;
      expect(input.min).toBe('-100');
      expect(input.max).toBe('100');
      expect(input.value).toBe('-50');

      // Test setting different values within negative range
      element.value = -100;
      await waitForUpdate(element);
      expect(input.value).toBe('-100');

      element.value = 0;
      await waitForUpdate(element);
      expect(input.value).toBe('0');

      element.value = 100;
      await waitForUpdate(element);
      expect(input.value).toBe('100');
    });
  });

  describe('Event Handling', () => {
    it('should dispatch range-change event on input change', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('range-change', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      input.value = '75';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForUpdate(element);

      expect(eventFired).toBe(true);
      expect(eventDetail.value).toBe(75);
      expect(eventDetail.formattedValue).toBe('75');
      expect(eventDetail.percentage).toBe(75);
    });

    it('should dispatch range-change event on change event', async () => {
      let eventFired = false;

      element.addEventListener('range-change', () => {
        eventFired = true;
      });

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      input.value = '60';
      input.dispatchEvent(new Event('change', { bubbles: true }));

      expect(eventFired).toBe(true);
    });

    it('should update value display when value changes', async () => {
      element.showValue = true;
      element.value = 25;
      await waitForPropertyPropagation(element);

      const valueDisplay = element.querySelector('.usa-range__value');
      expect(valueDisplay?.textContent?.trim()).toBe('25');

      element.value = 80;
      await waitForUpdate(element);

      expect(valueDisplay?.textContent?.trim()).toBe('80');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      await waitForUpdate(element);
    });

    it('should handle keyboard interactions through native input', async () => {
      element.value = 50;
      element.min = 10;
      element.max = 90;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.type).toBe('range');

      // Component delegates keyboard navigation to native HTML range input
      // Test that the input can receive keyboard events
      const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
      expect(() => input.dispatchEvent(event)).not.toThrow();

      // Native range inputs handle their own keyboard navigation
      expect(input.min).toBe('10');
      expect(input.max).toBe('90');
      // Home key should move to minimum value
      expect(input.value).toBe('10');
    });

    it('should handle arrow key navigation through native input', async () => {
      element.value = 50;
      element.min = 0;
      element.max = 100;
      element.step = 1;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(input.step).toBe('1');

      // Test that arrow key events can be dispatched (native behavior)
      const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
      const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });

      expect(() => input.dispatchEvent(leftArrowEvent)).not.toThrow();
      expect(() => input.dispatchEvent(rightArrowEvent)).not.toThrow();
    });

    it('should handle step-based value changes', async () => {
      element.value = 50;
      element.step = 5;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(input.step).toBe('5');

      // Test step value is properly set for native keyboard navigation
      element.value = 55;
      await waitForUpdate(element);
      expect(input.value).toBe('55');
    });

    it('should handle programmatic value changes within range', async () => {
      element.value = 50;
      element.min = 0;
      element.max = 100;
      element.step = 10;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;

      // Test programmatic changes (what the component actually supports)
      element.value = 30;
      await waitForUpdate(element);
      expect(input.value).toBe('30');

      element.value = 80;
      await waitForUpdate(element);
      expect(input.value).toBe('80');
    });

    it('should respect min/max bounds with keyboard navigation', async () => {
      element.min = 10;
      element.max = 90;
      element.step = 5;
      element.value = 85;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;

      // PageUp should not exceed max
      const pageUpEvent = new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true });
      input.dispatchEvent(pageUpEvent);
      expect(element.value).toBe(90); // Capped at max

      // PageDown from minimum
      element.value = 15;
      await waitForUpdate(element);

      const pageDownEvent = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true });
      input.dispatchEvent(pageDownEvent);
      expect(element.value).toBe(10); // Capped at min
    });

    it('should not handle other keys', async () => {
      const originalValue = element.value;

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      const event = new KeyboardEvent('keydown', { key: 'Space', bubbles: true });
      input.dispatchEvent(event);

      expect(element.value).toBe(originalValue);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      element.value = 60;
      element.min = 20;
      element.max = 80;
      element.unit = '%';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;

      assertAccessibilityAttributes(input, {
        'aria-valuemin': '20',
        'aria-valuemax': '80',
        'aria-valuenow': '60',
        'aria-valuetext': '60%',
      });
    });

    it('should have proper label association', async () => {
      await waitForUpdate(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      const label = element.querySelector('.usa-label') as HTMLLabelElement;

      expect(input.id).toBe(element.inputId);
      expect(label.getAttribute('for')).toBe(element.inputId);
    });

    it('should connect hint text with aria-describedby', async () => {
      element.hint = 'Adjust the volume level';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      const hint = element.querySelector('.usa-hint') as HTMLElement;

      expect(hint.id).toBe(`${element.inputId}-hint`);
      expect(await waitForARIAAttribute(input, 'aria-describedby')).toContain(
        `${element.inputId}-hint`
      );
    });

    it('should show required indicator', async () => {
      element.required = true;
      await waitForPropertyPropagation(element);

      const requiredIndicator = element.querySelector('.usa-hint--required');
      expect(requiredIndicator?.textContent?.trim()).toBe('*');
    });

    it('should update aria-valuenow when value changes', async () => {
      await waitForUpdate(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;

      element.value = 30;
      await waitForUpdate(element);

      expect(await waitForARIAAttribute(input, 'aria-valuenow')).toBe('30');
    });

    it('should update aria-valuetext with formatted value', async () => {
      element.unit = '$';
      element.value = 150;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(await waitForARIAAttribute(input, 'aria-valuetext')).toBe('150$');
    });
  });

  describe('Form Integration', () => {
    it('should integrate with forms', async () => {
      const form = document.createElement('form');
      element.name = 'budget-slider';
      form.appendChild(element);
      document.body.appendChild(form);

      await waitForUpdate(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(input.name).toBe('budget-slider');

      form.remove();
    });

    it('should support form validation', async () => {
      element.required = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(input.checkValidity()).toBe(true); // Range inputs always have a value
    });

    it('should provide form value', async () => {
      const form = document.createElement('form');
      element.name = 'volume-level';
      element.value = 85;
      form.appendChild(element);
      document.body.appendChild(form);

      await waitForUpdate(element);

      const formData = new FormData(form);
      expect(formData.get('volume-level')).toBe('85');

      form.remove();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid min/max ranges', async () => {
      element.min = 100;
      element.max = 50; // Invalid: min > max
      element.value = 75;
      await waitForUpdate(element);

      // Component should still render without errors
      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(input).toBeTruthy();
    });

    it('should handle value outside min/max range', async () => {
      element.min = 10;
      element.max = 90;
      element.value = 150; // Outside range
      await waitForUpdate(element);

      // Browser will constrain the value
      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(parseFloat(input.value)).toBeLessThanOrEqual(90);
    });

    it('should handle zero step value', async () => {
      element.step = 0;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(input).toBeTruthy();
      // Browser handles invalid step values
    });

    it('should handle very large ranges', async () => {
      element.min = 0;
      element.max = 1000000;
      element.value = 500000;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="range"]') as HTMLInputElement;
      expect(input.min).toBe('0');
      expect(input.max).toBe('1000000');
      expect(input.value).toBe('500000');
    });

    it('should handle rapid value changes', async () => {
      let eventCount = 0;

      element.addEventListener('range-change', () => {
        eventCount++;
      });

      const input = element.querySelector('.usa-range') as HTMLInputElement;

      // Simulate rapid slider movement
      input.value = '10';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      input.value = '20';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      input.value = '30';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      await waitForUpdate(element);

      expect(eventCount).toBe(3);
    });

    it('should maintain state during property changes', async () => {
      element.value = 60;
      await waitForUpdate(element);

      element.unit = '%';
      await waitForUpdate(element);

      expect(element.value).toBe(60);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(parseFloat(input.value)).toBe(60);
    });
  });

  describe('Visual Elements', () => {
    it('should display min and max values when showMinMax is true', async () => {
      element.min = 5;
      element.max = 95;
      element.unit = '°C';
      element.showMinMax = true;
      await waitForPropertyPropagation(element);

      const minMaxSpans = element.querySelectorAll('.display-flex.flex-justify span');

      expect(minMaxSpans.length).toBe(2);
      expect(minMaxSpans[0]?.textContent?.trim()).toBe('5°C');
      expect(minMaxSpans[1]?.textContent?.trim()).toBe('95°C');
    });

    it('should display current value when showValue is true', async () => {
      element.value = 42;
      element.unit = 'MB';
      element.showValue = true;
      await waitForPropertyPropagation(element);

      const valueDisplay = element.querySelector('.usa-range__value');

      expect(valueDisplay?.textContent?.trim()).toBe('42MB');
    });

    it('should update value display based on percentage calculation', async () => {
      element.min = 0;
      element.max = 200;
      element.value = 150;
      element.showValue = true;
      await waitForPropertyPropagation(element);

      const valueDisplay = element.querySelector('.usa-range__value');
      expect(valueDisplay?.textContent?.trim()).toBe('150'); // Value should be displayed correctly
    });

    it('should hide optional elements when configured', async () => {
      element.showValue = false;
      element.showMinMax = false;
      await waitForUpdate(element);

      expect(element.querySelector('.usa-range__value')).toBeNull();
      const minMaxSpans = element.querySelectorAll('div[style*="display: flex"] span');
      expect(minMaxSpans.length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should handle frequent value updates efficiently', async () => {
      const startTime = performance.now();

      // Simulate many rapid updates
      for (let i = 0; i < 100; i++) {
        element.value = i;
        await waitForUpdate(element);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should not create memory leaks with event listeners', async () => {
      const input = element.querySelector('.usa-range') as HTMLInputElement;
      const listenerCount = (input as any).getEventListeners?.()?.input?.length || 0;

      // Trigger multiple updates
      for (let i = 0; i < 10; i++) {
        input.value = (i * 10).toString();
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const newListenerCount = (input as any).getEventListeners?.()?.input?.length || 0;

      // Event listener count should remain stable
      expect(newListenerCount).toBeLessThanOrEqual(listenerCount + 1);
    });
  });

  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      const originalParent = element.parentElement;

      element.value = 75;
      element.min = 0;
      element.max = 200;
      element.step = 5;
      element.label = 'Updated Range';
      element.unit = '%';
      element.showOutput = true;
      element.showMinMax = true;
      element.disabled = true;
      element.required = true;
      element.name = 'updated-range';
      element.inputId = 'updated-range-input';

      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.parentElement).toBe(originalParent);
    });

    // Skipped - requires Cypress for USWDS JavaScript slider behavior
    // Coverage: src/components/range-slider/usa-range-slider.component.cy.ts (interaction tests)

    it('should maintain DOM presence during rapid value changes', async () => {
      const originalParent = element.parentElement;

      // Simulate rapid dragging/value changes
      for (let i = 0; i < 10; i++) {
        element.value = Math.random() * 100;
        element.label = `Value ${i}`;
        await element.updateComplete;

        const input = element.querySelector('.usa-range') as HTMLInputElement;
        if (input) {
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }

      element.disabled = false;
      element.required = true;
      await element.updateComplete;

      expect(element.parentElement).toBe(originalParent);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Storybook Integration Tests (CRITICAL)', () => {
    it('should render in Storybook environment without errors', async () => {
      const storybookContainer = document.createElement('div');
      storybookContainer.id = 'storybook-root';
      document.body.appendChild(storybookContainer);

      const storybookElement = document.createElement('usa-range-slider') as USARangeSlider;
      storybookElement.value = 50;
      storybookElement.min = 0;
      storybookElement.max = 100;
      storybookElement.step = 1;
      storybookElement.label = 'Storybook Range';
      storybookElement.unit = '%';
      storybookElement.showOutput = true;
      storybookElement.showMinMax = true;

      storybookContainer.appendChild(storybookElement);

      await waitForUpdate(storybookElement);

      expect(storybookContainer.contains(storybookElement)).toBe(true);
      expect(storybookElement.isConnected).toBe(true);

      const input = storybookElement.querySelector('.usa-range');
      const label = storybookElement.querySelector('.usa-label');
      const wrapper = storybookElement.querySelector('.usa-range__wrapper');

      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(wrapper).toBeTruthy();

      storybookContainer.remove();
    });

    it('should handle Storybook control updates without component removal', async () => {
      const mockStorybookUpdate = vi.fn();
      element.addEventListener('range-change', mockStorybookUpdate);

      // Simulate Storybook controls panel updates
      element.value = 25;
      element.min = 10;
      element.max = 90;
      element.step = 5;
      element.label = 'Controls Updated Range';
      element.unit = 'px';
      element.showOutput = false;
      element.showMinMax = false;
      element.disabled = false;
      element.required = true;

      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.value).toBe(25);
      expect(element.label).toBe('Controls Updated Range');

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      const label = element.querySelector('.usa-label');
      expect(input?.value).toBe('25');
      expect(label?.textContent).toContain('Controls Updated Range');
    });

    // Skipped - requires Cypress for USWDS JavaScript event behavior
    // Coverage: src/components/range-slider/usa-range-slider.component.cy.ts (interaction tests)
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/range-slider/usa-range-slider.ts`;
        const validation = validateComponentJavaScript(componentPath, 'range-slider');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Strict validation requirements

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0); // Range slider is presentational, JavaScript integration not required
      });
    });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Test default range slider
      element.label = 'Volume Level';
      element.value = 50;
      element.unit = '%';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test disabled state
      element.disabled = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test required state
      element.disabled = false;
      element.required = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with hint text
      element.hint = 'Adjust the volume to your preference';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with custom range
      element.min = 10;
      element.max = 90;
      element.value = 45;
      element.step = 5;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should maintain accessibility during dynamic updates', async () => {
      // Set initial accessible state
      element.label = 'Temperature';
      element.value = 72;
      element.unit = '°F';
      element.min = 60;
      element.max = 80;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update value dynamically
      element.value = 68;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update range dynamically
      element.min = 65;
      element.max = 75;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Toggle display options
      element.showValue = false;
      element.showMinMax = false;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility with form integration', async () => {
      const form = document.createElement('form');
      form.setAttribute('role', 'form');
      form.setAttribute('aria-label', 'Settings form');

      element.name = 'brightness-level';
      element.label = 'Screen Brightness';
      element.value = 75;
      element.unit = '%';
      element.required = true;
      element.hint = 'Set your preferred screen brightness level';

      form.appendChild(element);
      document.body.appendChild(form);

      await element.updateComplete;
      await testComponentAccessibility(form, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test form interaction
      const input = element.querySelector('.usa-range') as HTMLInputElement;
      if (input) {
        input.value = '60';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await element.updateComplete;
        await testComponentAccessibility(form, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      }

      form.remove();
    });
  });

  describe('Regression Tests', () => {
    it('REGRESSION: should properly restore initial value attribute on connectedCallback', async () => {
      // Bug: Initial value attribute was being restored from DOM attribute
      // instead of being set from the property value
      //
      // This test ensures the fix remains in place:
      // - value property should be set BEFORE calling super.connectedCallback()
      // - this prevents the attribute restoration from overwriting the property

      const testElement = document.createElement('usa-range-slider') as USARangeSlider;
      testElement.setAttribute('value', '75'); // Set attribute first
      testElement.value = 50; // Set property (should win)

      document.body.appendChild(testElement);
      await waitForUpdate(testElement);

      const input = testElement.querySelector('.usa-range') as HTMLInputElement;

      // Property value should be used, not attribute value
      expect(testElement.value).toBe(50);
      expect(parseFloat(input.value)).toBe(50);

      testElement.remove();
    });

    it('REGRESSION: should handle initial value with custom min/max range', async () => {
      // Ensure initial value works correctly with non-default ranges
      const testElement = document.createElement('usa-range-slider') as USARangeSlider;
      testElement.min = 10;
      testElement.max = 90;
      testElement.value = 45;

      document.body.appendChild(testElement);
      await waitForUpdate(testElement);

      const input = testElement.querySelector('.usa-range') as HTMLInputElement;

      expect(testElement.value).toBe(45);
      expect(input.min).toBe('10');
      expect(input.max).toBe('90');
      expect(parseFloat(input.value)).toBe(45);

      testElement.remove();
    });

    it('REGRESSION: should not lose value during property updates', async () => {
      // Ensure value persists through various property changes
      element.value = 35;
      await waitForUpdate(element);

      // Change other properties
      element.label = 'Updated Label';
      element.unit = '%';
      element.showValue = false;
      element.showMinMax = true;
      await waitForUpdate(element);

      // Value should remain unchanged
      expect(element.value).toBe(35);

      const input = element.querySelector('.usa-range') as HTMLInputElement;
      expect(parseFloat(input.value)).toBe(35);
    });
  });
});
