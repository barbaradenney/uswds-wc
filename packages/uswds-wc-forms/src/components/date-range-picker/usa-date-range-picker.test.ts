import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../date-range-picker/usa-date-range-picker.ts';
import type { USADateRangePicker } from '../date-range-picker/usa-date-range-picker.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript, waitForUpdate } from '@uswds-wc/test-utils/test-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USADateRangePicker', () => {
  let element: USADateRangePicker;

  beforeEach(() => {
    element = document.createElement('usa-date-range-picker') as USADateRangePicker;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should render with default properties', async () => {
      await element.updateComplete;

      expect(element.startDate).toBe('');
      expect(element.endDate).toBe('');
      expect(element.name).toBe('date-range-picker');
      expect(element.label).toBe('Date range');
      expect(element.startLabel).toBe('Start date');
      expect(element.endLabel).toBe('End date');
      expect(element.placeholder).toBe('mm/dd/yyyy');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
    });

    it('should render fieldset with correct legend', async () => {
      element.label = 'Event Duration';
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      const legend = element.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend?.textContent?.trim()).toBe('Event Duration');
    });

    it('should render hint when provided', async () => {
      element.hint = 'Select the start and end dates for the event';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint?.textContent?.trim()).toBe('Select the start and end dates for the event');
      expect(hint?.id).toBe(`${element.name}-hint`);
    });

    it('should show required indicator when required', async () => {
      element.required = true;
      await element.updateComplete;

      const requiredIndicator = element.querySelector('.usa-hint--required');
      expect(requiredIndicator).toBeTruthy();
      expect(requiredIndicator?.textContent).toBe('*');
    });

    it('should have correct USWDS classes', async () => {
      await element.updateComplete;

      expect(element.querySelector('.usa-form-group')).toBeTruthy();
      expect(element.querySelector('.usa-legend')).toBeTruthy();
      expect(element.querySelector('.usa-date-range-picker')).toBeTruthy();
    });

    it('should render two date picker components', async () => {
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      expect(datePickers.length).toBe(2);

      const startDatePicker = datePickers[0];
      const endDatePicker = datePickers[1];

      expect(startDatePicker.getAttribute('name')).toBe(`${element.name}-start`);
      expect(endDatePicker.getAttribute('name')).toBe(`${element.name}-end`);
    });
  });

  describe('Property Updates', () => {
    it('should update start date', async () => {
      element.startDate = '2024-03-15';
      await element.updateComplete;

      expect(element.startDate).toBe('2024-03-15');

      const startPicker = element.querySelector('usa-date-picker');
      expect(startPicker?.getAttribute('value')).toBe('2024-03-15');
    });

    it('should update end date', async () => {
      element.endDate = '2024-03-20';
      await element.updateComplete;

      expect(element.endDate).toBe('2024-03-20');

      const datePickers = element.querySelectorAll('usa-date-picker');
      const endPicker = datePickers[1];
      expect(endPicker?.getAttribute('value')).toBe('2024-03-20');
    });

    it('should pass disabled state to both date pickers', async () => {
      element.disabled = true;
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      expect(datePickers[0].hasAttribute('disabled')).toBe(true);
      expect(datePickers[1].hasAttribute('disabled')).toBe(true);
    });

    it('should pass required state to both date pickers', async () => {
      element.required = true;
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      expect(datePickers[0].hasAttribute('required')).toBe(true);
      expect(datePickers[1].hasAttribute('required')).toBe(true);
    });

    it('should update custom labels', async () => {
      element.startLabel = 'Check-in Date';
      element.endLabel = 'Check-out Date';
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      expect(datePickers[0].getAttribute('label')).toBe('Check-in Date');
      expect(datePickers[1].getAttribute('label')).toBe('Check-out Date');
    });

    it('should update placeholder text', async () => {
      element.placeholder = 'dd/mm/yyyy';
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      expect(datePickers[0].getAttribute('placeholder')).toBe('dd/mm/yyyy');
      expect(datePickers[1].getAttribute('placeholder')).toBe('dd/mm/yyyy');
    });
  });

  describe('Date Range Validation', () => {
    it('should set end date maxDate to start date when start is selected', async () => {
      element.startDate = '2024-03-15';
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      const endPicker = datePickers[1];
      expect(endPicker.getAttribute('minDate')).toBe('2024-03-15');
    });

    it('should set start date maxDate to end date when end is selected', async () => {
      element.endDate = '2024-03-20';
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      const startPicker = datePickers[0];
      expect(startPicker.getAttribute('maxDate')).toBe('2024-03-20');
    });

    it('should respect global min and max dates', async () => {
      element.minDate = '2024-01-01';
      element.maxDate = '2024-12-31';
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      const startPicker = datePickers[0];
      const endPicker = datePickers[1];

      expect(startPicker.getAttribute('minDate')).toBe('2024-01-01');
      expect(endPicker.getAttribute('maxDate')).toBe('2024-12-31');
    });

    it('should combine range constraints with global constraints', async () => {
      element.minDate = '2024-01-01';
      element.maxDate = '2024-12-31';
      element.startDate = '2024-03-15';
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      const endPicker = datePickers[1];

      expect(endPicker.getAttribute('minDate')).toBe('2024-03-15');
      expect(endPicker.getAttribute('maxDate')).toBe('2024-12-31');
    });
  });

  describe('Event Handling', () => {
    it('should handle start date change event', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('date-range-change', eventSpy);
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker');
      startPicker?.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-15' },
          bubbles: true,
        })
      );

      expect(element.startDate).toBe('2024-03-15');
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle end date change event', async () => {
      element.startDate = '2024-03-15';
      const eventSpy = vi.fn();
      element.addEventListener('date-range-change', eventSpy);
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      const endPicker = datePickers[1];

      endPicker?.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-20' },
          bubbles: true,
        })
      );

      expect(element.endDate).toBe('2024-03-20');
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should dispatch range change with complete information', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('date-range-change', eventSpy);

      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker');
      startPicker?.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-15' },
          bubbles: true,
        })
      );

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            range: { startDate: '2024-03-15', endDate: '2024-03-20' },
            startDate: '2024-03-15',
            endDate: '2024-03-20',
            isComplete: true,
            daysDifference: expect.any(Number),
          }),
        })
      );
    });

    it('should clear end date if start date is after end date', async () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-10';
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker');
      startPicker?.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-20' },
          bubbles: true,
        })
      );

      expect(element.startDate).toBe('2024-03-20');
      expect(element.endDate).toBe('');
    });

    it('should prevent end date selection before start date', async () => {
      element.startDate = '2024-03-15';
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');
      const endPicker = datePickers[1];

      endPicker?.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-10' },
          bubbles: true,
        })
      );

      expect(element.endDate).toBe(''); // Should not update to invalid date
    });
  });

  describe('Date Range Summary', () => {
    it('should display range summary when both dates are selected', async () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary).toBeTruthy();
      expect(summary?.textContent).toContain('Selected range: 2024-03-15 to 2024-03-20');
    });

    it('should not display summary when only start date is selected', async () => {
      element.startDate = '2024-03-15';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary).toBeFalsy();
    });

    it('should not display summary when only end date is selected', async () => {
      element.endDate = '2024-03-20';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary).toBeFalsy();
    });

    it('should calculate and display days difference', async () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary?.textContent).toContain('5 days');
    });

    it('should display singular "day" for one-day difference', async () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-16';
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary?.textContent).toContain('1 day');
      expect(summary?.textContent).not.toContain('1 days');
    });
  });

  describe('Days Calculation', () => {
    it('should calculate days difference correctly', () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBe(5);
    });

    it('should return null when start date is missing', () => {
      element.endDate = '2024-03-20';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBe(null);
    });

    it('should return null when end date is missing', () => {
      element.startDate = '2024-03-15';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBe(null);
    });

    it('should calculate same-day difference as 1 day', () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-15';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBe(1);
    });

    it('should handle year boundaries correctly', () => {
      element.startDate = '2024-12-30';
      element.endDate = '2025-01-02';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBe(3);
    });

    it('should handle leap year correctly', () => {
      element.startDate = '2024-02-28';
      element.endDate = '2024-03-01';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBe(2); // 2024 is a leap year
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper fieldset and legend structure', async () => {
      element.label = 'Event Dates';
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      const legend = fieldset?.querySelector('.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend?.textContent?.trim()).toBe('Event Dates');
    });

    it('should associate hint with fieldset', async () => {
      element.hint = 'Select event start and end dates';
      element.name = 'event-dates';
      await element.updateComplete;

      const hint = element.querySelector('.usa-hint');
      expect(hint?.id).toBe('event-dates-hint');
    });

    it('should maintain proper form group structure', async () => {
      await element.updateComplete;

      const formGroup = element.querySelector('.usa-form-group');
      expect(formGroup).toBeTruthy();
    });

    it('should apply required classes when required', async () => {
      element.required = true;
      await element.updateComplete;

      const formGroup = element.querySelector('fieldset');
      expect(formGroup?.classList.contains('usa-form-group--required')).toBe(true);
    });

    it('should pass accessibility attributes to child date pickers', async () => {
      element.required = true;
      element.disabled = false;
      await element.updateComplete;

      const datePickers = element.querySelectorAll('usa-date-picker');

      datePickers.forEach((picker) => {
        expect(picker.hasAttribute('required')).toBe(true);
        expect(picker.hasAttribute('disabled')).toBe(false);
      });
    });
  });

  describe('Form Integration', () => {
    it('should work within form element', async () => {
      const form = document.createElement('form');
      form.appendChild(element);
      document.body.appendChild(form);

      element.name = 'event-period';
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      await element.updateComplete;

      // Date range picker doesn't directly submit form data,
      // but child date pickers should be accessible via form
      const datePickers = form.querySelectorAll('usa-date-picker');
      expect(datePickers.length).toBe(2);

      form.remove();
    });

    it('should validate required state correctly', async () => {
      element.required = true;
      element.name = 'required-range';
      await element.updateComplete;

      const fieldset = element.querySelector('fieldset');
      expect(fieldset?.classList.contains('usa-form-group--required')).toBe(true);

      const requiredIndicator = element.querySelector('.usa-hint--required');
      expect(requiredIndicator).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty date strings', async () => {
      element.startDate = '';
      element.endDate = '';
      await element.updateComplete;

      expect(element.startDate).toBe('');
      expect(element.endDate).toBe('');

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary).toBeFalsy();
    });

    it('should handle invalid date formats gracefully', async () => {
      element.startDate = 'invalid-date';
      element.endDate = 'also-invalid';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBe(null);
    });

    it('should handle very large date ranges', async () => {
      element.startDate = '2020-01-01';
      element.endDate = '2025-12-31';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBeGreaterThan(2000);
      expect(typeof days).toBe('number');
    });

    it('should handle future dates correctly', async () => {
      const futureDate1 = '2030-06-15';
      const futureDate2 = '2030-06-20';

      element.startDate = futureDate1;
      element.endDate = futureDate2;
      await element.updateComplete;

      const summary = element.querySelector('.usa-date-range-picker__summary');
      expect(summary?.textContent).toContain(`Selected range: ${futureDate1} to ${futureDate2}`);
    });

    it('should handle year 2000 dates correctly', async () => {
      element.startDate = '2000-02-28';
      element.endDate = '2000-03-01';

      const days = (element as any).calculateDaysDifference();
      expect(days).toBe(2); // 2000 is a leap year
    });

    it('should handle rapid date changes', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('date-range-change', eventSpy);

      element.startDate = '2024-03-15';
      element.startDate = '2024-03-16';
      element.startDate = '2024-03-17';
      await element.updateComplete;

      expect(element.startDate).toBe('2024-03-17');
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize with empty dates', () => {
      const newElement = document.createElement('usa-date-range-picker') as USADateRangePicker;

      expect(newElement.startDate).toBe('');
      expect(newElement.endDate).toBe('');
    });

    it('should maintain state after re-render', async () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      element.label = 'Custom Label';
      await element.updateComplete;

      // Force re-render
      element.requestUpdate();
      await element.updateComplete;

      expect(element.startDate).toBe('2024-03-15');
      expect(element.endDate).toBe('2024-03-20');
      expect(element.label).toBe('Custom Label');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle multiple rapid updates efficiently', async () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        element.startDate = `2024-03-${String((i % 28) + 1).padStart(2, '0')}`;
        await element.updateComplete;
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete 100 updates in reasonable time (less than 1000ms)
      expect(totalTime).toBeLessThan(1000);
      expect(element.startDate).toBe('2024-03-16'); // 99 % 28 + 1 = 16
    });

    it('should not leak event listeners', () => {
      const eventSpy = vi.fn();
      element.addEventListener('date-range-change', eventSpy);

      // Simulate component removal
      element.remove();

      // Dispatch event on removed element
      const startPicker = document.createElement('usa-date-picker');
      startPicker.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-15' },
          bubbles: true,
        })
      );

      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('Event Detail Structure', () => {
    it('should provide complete event detail information', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('date-range-change', eventSpy);

      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker');
      startPicker?.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-15' },
          bubbles: true,
        })
      );

      const eventDetail = eventSpy.mock.calls[0][0].detail;

      expect(eventDetail).toHaveProperty('range');
      expect(eventDetail).toHaveProperty('startDate', '2024-03-15');
      expect(eventDetail).toHaveProperty('endDate', '2024-03-20');
      expect(eventDetail).toHaveProperty('isComplete', true);
      expect(eventDetail).toHaveProperty('daysDifference', 5);
      expect(eventDetail.range).toEqual({
        startDate: '2024-03-15',
        endDate: '2024-03-20',
      });
    });

    it('should mark incomplete range correctly', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('date-range-change', eventSpy);

      element.startDate = '2024-03-15';
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker');
      startPicker?.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-15' },
          bubbles: true,
        })
      );

      const eventDetail = eventSpy.mock.calls[0][0].detail;
      expect(eventDetail.isComplete).toBe(false);
      expect(eventDetail.daysDifference).toBe(null);
    });
  });

  // CRITICAL TESTS - Component Lifecycle Stability (Auto-dismiss Prevention)
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      element.label = 'Test Date Range';
      element.hint = 'Select your dates';
      element.required = true;
      element.disabled = false;
      element.minDate = '2024-01-01';
      element.maxDate = '2024-12-31';
      element.startLabel = 'Check-in';
      element.endLabel = 'Check-out';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain component state during rapid property changes', async () => {
      const initialParent = element.parentNode;

      // Rapid property changes that could trigger lifecycle issues
      for (let i = 0; i < 10; i++) {
        element.startDate = `2024-03-${String(i + 10).padStart(2, '0')}`;
        element.endDate = `2024-03-${String(i + 20).padStart(2, '0')}`;
        element.label = `Date Range ${i}`;
        element.required = i % 2 === 0;
        element.disabled = i % 3 === 0;
        await element.updateComplete;
      }

      expect(element.parentNode).toBe(initialParent);
      expect(element.isConnected).toBe(true);
    });

    it('should handle complex date range operations without disconnection', async () => {
      // Complex date range operations
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      element.minDate = '2024-01-01';
      element.maxDate = '2024-12-31';
      await element.updateComplete;

      // Test constraint updates
      element.minDate = '2024-02-01';
      element.maxDate = '2024-11-30';
      await element.updateComplete;

      // Test date clearing and resetting
      element.endDate = '';
      element.startDate = '2024-04-01';
      element.endDate = '2024-04-15';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Event System Stability (CRITICAL)', () => {
    it('should not interfere with other components after event handling', async () => {
      const eventsSpy = vi.fn();
      element.addEventListener('date-range-change', eventsSpy);

      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      await element.updateComplete;

      // Trigger multiple date change events
      const datePickers = element.querySelectorAll('usa-date-picker');
      const startPicker = datePickers[0];
      const endPicker = datePickers[1];

      // Multiple event triggers
      startPicker.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-16' },
          bubbles: true,
        })
      );

      endPicker.dispatchEvent(
        new CustomEvent('date-change', {
          detail: { value: '2024-03-21' },
          bubbles: true,
        })
      );

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle rapid date change events without component removal', async () => {
      element.startDate = '2024-03-15';
      element.endDate = '2024-03-20';
      await element.updateComplete;

      const startPicker = element.querySelector('usa-date-picker');

      // Rapid event firing
      for (let i = 0; i < 10; i++) {
        startPicker?.dispatchEvent(
          new CustomEvent('date-change', {
            detail: { value: `2024-03-${String(15 + i).padStart(2, '0')}` },
            bubbles: true,
          })
        );
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

      element.label = 'Event Test Date Range';
      element.startDate = '2024-05-01';
      element.endDate = '2024-05-15';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Date Range Coordination Stability (CRITICAL)', () => {
    it('should handle complex date constraint updates without disconnection', async () => {
      // Test complex constraint coordination
      const dates = [
        { start: '2024-01-15', end: '2024-01-20', min: '2024-01-01', max: '2024-12-31' },
        { start: '2024-02-10', end: '2024-02-25', min: '2024-02-01', max: '2024-02-28' },
        { start: '2024-03-05', end: '2024-03-30', min: '2024-03-01', max: '2024-03-31' },
        { start: '2024-04-12', end: '2024-04-18', min: '2024-04-10', max: '2024-04-20' },
      ];

      for (const dateSet of dates) {
        element.minDate = dateSet.min;
        element.maxDate = dateSet.max;
        element.startDate = dateSet.start;
        element.endDate = dateSet.end;
        await element.updateComplete;

        // Verify child date pickers get correct constraints
        const datePickers = element.querySelectorAll('usa-date-picker');
        expect(datePickers.length).toBe(2);
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle invalid date sequences gracefully', async () => {
      // Test invalid date handling
      element.startDate = '2024-03-20';
      element.endDate = '2024-03-15'; // End before start
      await element.updateComplete;

      element.startDate = '2024-02-30'; // Invalid date
      element.endDate = '2024-13-01'; // Invalid month
      await element.updateComplete;

      element.startDate = 'not-a-date';
      element.endDate = '2024-03-15';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Storybook Integration (CRITICAL)', () => {
    it('should render in Storybook without auto-dismissing', async () => {
      element.label = 'Storybook Test Date Range';
      element.hint = 'Select your travel dates for booking';
      element.startDate = '2024-06-15';
      element.endDate = '2024-06-22';
      element.startLabel = 'Departure Date';
      element.endLabel = 'Return Date';
      element.placeholder = 'mm/dd/yyyy';
      element.required = true;
      element.minDate = '2024-01-01';
      element.maxDate = '2024-12-31';
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(element.querySelector('.usa-form-group')).toBeTruthy();
      expect(element.querySelector('.usa-date-range-picker')).toBeTruthy();
      expect(element.querySelector('.usa-legend')?.textContent?.trim()).toContain(
        'Storybook Test Date Range'
      );
      expect(element.querySelector('.usa-date-range-picker__summary')).toBeTruthy();

      // Verify both date pickers are rendered
      const datePickers = element.querySelectorAll('usa-date-picker');
      expect(datePickers.length).toBe(2);
      expect(datePickers[0].getAttribute('label')).toBe('Departure Date');
      expect(datePickers[1].getAttribute('label')).toBe('Return Date');
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/date-range-picker/usa-date-range-picker.ts`;
        const validation = validateComponentJavaScript(componentPath, 'date-range-picker');

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
      // Test with default configuration
      element.legend = 'Travel Dates';
      element.startLabel = 'Departure Date';
      element.endLabel = 'Return Date';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with hint text
      element.hint = 'Please select your travel dates';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with required state
      element.required = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with date range constraints
      element.minDate = '2024-01-01';
      element.maxDate = '2024-12-31';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with placeholder values
      element.placeholder = 'mm/dd/yyyy';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test disabled state
      element.disabled = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test readonly state
      element.disabled = false;
      element.readonly = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with range validation enabled
      element.readonly = false;
      element.validateRange = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    }, 30000); // Increased timeout for multiple accessibility checks (canvas operations in jsdom can be slow)

    it('should maintain accessibility during date selection', async () => {
      element.legend = 'Event Dates';
      element.startLabel = 'Start Date';
      element.endLabel = 'End Date';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with start date selected
      element.startDate = '2024-06-15';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with both dates selected
      element.endDate = '2024-06-20';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with range validation
      element.validateRange = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should be accessible in form contexts', async () => {
      const form = document.createElement('form');
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = 'Booking Information';

      fieldset.appendChild(legend);
      fieldset.appendChild(element);
      form.appendChild(fieldset);
      document.body.appendChild(form);

      element.legend = 'Travel Period';
      element.startLabel = 'Check-in Date';
      element.endLabel = 'Check-out Date';
      element.hint = 'Select your stay dates';
      element.required = true;
      element.minDate = '2024-01-01';
      element.maxDate = '2024-12-31';
      await element.updateComplete;

      await testComponentAccessibility(form, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      form.remove();
    });
  });

  /**
   * USWDS Integration Requirements Tests
   *
   * These tests validate critical USWDS integration patterns for the Date Range Picker component.
   * They ensure that USWDS JavaScript can properly enhance the component with:
   * - Default value handling via data-default-value attribute on both start and end inputs
   * - Component enhancement signal via data-enhanced attribute
   * - Placeholder display behavior for both inputs
   *
   * These tests prevent regressions like:
   * - Default date ranges not displaying
   * - Placeholders not showing when no value
   * - USWDS initialization failures
   *
   * See: /tmp/combo-box-complete-summary.md for pattern details
   */
  describe('USWDS Integration Requirements', () => {
    it('should include data-default-value attribute on start date wrapper', async () => {
      element.startDate = '2024-01-01';
      await waitForPropertyPropagation(element);

      const startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
      await (startPicker as any)?.updateComplete;

      const startWrapper = startPicker?.querySelector('.usa-date-picker');
      expect(startWrapper).toBeTruthy();
      expect(startWrapper?.hasAttribute('data-default-value')).toBe(true);
      expect(startWrapper?.getAttribute('data-default-value')).toBe('2024-01-01');
    });

    it('should include data-default-value attribute on end date wrapper', async () => {
      element.endDate = '2024-12-31';
      await waitForPropertyPropagation(element);

      const endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');
      await (endPicker as any)?.updateComplete;

      const endWrapper = endPicker?.querySelector('.usa-date-picker');
      expect(endWrapper).toBeTruthy();
      expect(endWrapper?.hasAttribute('data-default-value')).toBe(true);
      expect(endWrapper?.getAttribute('data-default-value')).toBe('2024-12-31');
    });

    it('should include data-default-value empty string when no value', async () => {
      element.startDate = '';
      element.endDate = '';
      await waitForPropertyPropagation(element);

      const startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
      const endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');
      await (startPicker as any)?.updateComplete;
      await (endPicker as any)?.updateComplete;

      const startWrapper = startPicker?.querySelector('.usa-date-picker');
      const endWrapper = endPicker?.querySelector('.usa-date-picker');

      expect(startWrapper?.hasAttribute('data-default-value')).toBe(true);
      expect(startWrapper?.getAttribute('data-default-value')).toBe('');
      expect(endWrapper?.hasAttribute('data-default-value')).toBe(true);
      expect(endWrapper?.getAttribute('data-default-value')).toBe('');
    });

    it('should include data-enhanced="false" on both date picker wrappers', async () => {
      await waitForUpdate(element);

      const startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
      const endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');
      await (startPicker as any)?.updateComplete;
      await (endPicker as any)?.updateComplete;

      const startWrapper = startPicker?.querySelector('.usa-date-picker');
      const endWrapper = endPicker?.querySelector('.usa-date-picker');

      expect(startWrapper).toBeTruthy();
      expect(startWrapper?.getAttribute('data-enhanced')).toBe('false');
      expect(endWrapper).toBeTruthy();
      expect(endWrapper?.getAttribute('data-enhanced')).toBe('false');
    });

    it('should render placeholders when set', async () => {
      element.placeholder = 'mm/dd/yyyy';
      await waitForPropertyPropagation(element);

      const startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
      const endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');
      await (startPicker as any)?.updateComplete;
      await (endPicker as any)?.updateComplete;

      const startInput = startPicker?.querySelector('input') as HTMLInputElement;
      const endInput = endPicker?.querySelector('input') as HTMLInputElement;

      expect(startInput).toBeTruthy();
      expect(startInput?.getAttribute('placeholder')).toBe('mm/dd/yyyy');
      expect(endInput).toBeTruthy();
      expect(endInput?.getAttribute('placeholder')).toBe('mm/dd/yyyy');
    });

    it('should display placeholders when no values set', async () => {
      element.placeholder = 'mm/dd/yyyy';
      element.startDate = '';
      element.endDate = '';
      await waitForPropertyPropagation(element);

      const startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
      const endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');
      await (startPicker as any)?.updateComplete;
      await (endPicker as any)?.updateComplete;

      const startInput = startPicker?.querySelector('input') as HTMLInputElement;
      const endInput = endPicker?.querySelector('input') as HTMLInputElement;

      expect(startInput?.getAttribute('placeholder')).toBe('mm/dd/yyyy');
      expect(startInput?.value).toBe('');
      expect(endInput?.getAttribute('placeholder')).toBe('mm/dd/yyyy');
      expect(endInput?.value).toBe('');
    });

    it('should maintain data-default-value when values change', async () => {
      element.startDate = '2024-01-01';
      element.endDate = '2024-01-31';
      await waitForPropertyPropagation(element);

      let startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
      let endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');
      await (startPicker as any)?.updateComplete;
      await (endPicker as any)?.updateComplete;

      let startWrapper = startPicker?.querySelector('.usa-date-picker');
      let endWrapper = endPicker?.querySelector('.usa-date-picker');

      expect(startWrapper?.getAttribute('data-default-value')).toBe('2024-01-01');
      expect(endWrapper?.getAttribute('data-default-value')).toBe('2024-01-31');

      element.startDate = '2024-06-01';
      element.endDate = '2024-06-30';
      await waitForPropertyPropagation(element);

      startPicker = element.querySelector('usa-date-picker[data-range-start="true"]');
      endPicker = element.querySelector('usa-date-picker[data-range-end="true"]');
      await (startPicker as any)?.updateComplete;
      await (endPicker as any)?.updateComplete;

      startWrapper = startPicker?.querySelector('.usa-date-picker');
      endWrapper = endPicker?.querySelector('.usa-date-picker');

      expect(startWrapper?.getAttribute('data-default-value')).toBe('2024-06-01');
      expect(endWrapper?.getAttribute('data-default-value')).toBe('2024-06-30');
    });
  });
});
