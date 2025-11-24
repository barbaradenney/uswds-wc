import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-form-summary-pattern.js';
import type { USAFormSummaryPattern, SummarySection } from './usa-form-summary-pattern.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USAFormSummaryPattern', () => {
  let pattern: USAFormSummaryPattern;
  let container: HTMLDivElement;

  const mockSections: SummarySection[] = [
    {
      heading: 'Personal Information',
      items: [
        { label: 'Full Name', value: 'Jane Smith' },
        { label: 'Email', value: 'jane.smith@example.com' },
        { label: 'Phone', value: '202-555-0123' },
      ],
    },
    {
      heading: 'Address',
      items: [
        { label: 'Street', value: '1600 Pennsylvania Ave NW' },
        { label: 'City', value: 'Washington' },
        { label: 'State', value: 'DC' },
        { label: 'ZIP Code', value: '20500' },
      ],
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Pattern Initialization', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      container.appendChild(pattern);
    });

    it('should create pattern element', () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-FORM-SUMMARY-PATTERN');
    });

    it('should have default properties', () => {
      expect(pattern.title).toBe('Review Your Information');
      expect(pattern.showConfirmation).toBe(false);
      expect(pattern.confirmationTitle).toBe('Success');
      expect(pattern.confirmationType).toBe('success');
      expect(pattern.showPrint).toBe(true);
      expect(pattern.showDownload).toBe(false);
      expect(pattern.showEdit).toBe(false);
      expect(pattern.printButtonLabel).toBe('Print');
      expect(pattern.downloadButtonLabel).toBe('Download');
      expect(pattern.sections).toEqual([]);
    });

    it('should use Light DOM for USWDS style compatibility', () => {
      expect(pattern.shadowRoot).toBeNull();
    });

    it('should render title', async () => {
      await pattern.updateComplete;
      const title = pattern.querySelector('h1');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Review Your Information');
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement(
        'usa-form-summary-pattern'
      ) as USAFormSummaryPattern;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.sections).toBe(0);

      newPattern.remove();
    });
  });

  describe('Summary Display', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.sections = mockSections;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should render all sections', () => {
      const summaryBoxes = pattern.querySelectorAll('.usa-summary-box');
      expect(summaryBoxes.length).toBe(2);
    });

    it('should render section headings', () => {
      const headings = pattern.querySelectorAll('.usa-summary-box__heading');
      expect(headings.length).toBe(2);
      expect(headings[0]?.textContent).toBe('Personal Information');
      expect(headings[1]?.textContent).toBe('Address');
    });

    it('should render all items in sections', () => {
      const items = pattern.querySelectorAll('dt');
      expect(items.length).toBe(7); // 3 + 4 items
    });

    it('should render item labels and values', () => {
      const firstLabel = pattern.querySelector('dt');
      const firstValue = pattern.querySelector('dd');
      expect(firstLabel?.textContent).toBe('Full Name');
      expect(firstValue?.textContent).toBe('Jane Smith');
    });

    it('should render em dash for empty values', async () => {
      pattern.sections = [
        {
          heading: 'Test',
          items: [{ label: 'Empty Field', value: '' }],
        },
      ];
      await pattern.updateComplete;

      const value = pattern.querySelector('dd');
      expect(value?.textContent).toBe('—');
    });
  });

  describe('Confirmation Message', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      container.appendChild(pattern);
    });

    it('should not show confirmation by default', async () => {
      await pattern.updateComplete;
      const alert = pattern.querySelector('.usa-alert');
      expect(alert).toBeNull();
    });

    it('should show confirmation when enabled', async () => {
      pattern.showConfirmation = true;
      await pattern.updateComplete;

      const alert = pattern.querySelector('.usa-alert');
      expect(alert).toBeTruthy();
      expect(alert?.classList.contains('usa-alert--success')).toBe(true);
    });

    it('should render confirmation title', async () => {
      pattern.showConfirmation = true;
      pattern.confirmationTitle = 'Application Submitted';
      await pattern.updateComplete;

      const heading = pattern.querySelector('.usa-alert__heading');
      expect(heading?.textContent).toBe('Application Submitted');
    });

    it('should support different confirmation types', async () => {
      pattern.showConfirmation = true;

      const types = ['success', 'info', 'warning', 'error'] as const;
      for (const type of types) {
        pattern.confirmationType = type;
        await pattern.updateComplete;

        const alert = pattern.querySelector('.usa-alert');
        expect(alert?.classList.contains(`usa-alert--${type}`)).toBe(true);
      }
    });

    it('should render default confirmation text', async () => {
      pattern.showConfirmation = true;
      await pattern.updateComplete;

      const text = pattern.querySelector('.usa-alert__text');
      expect(text?.textContent).toBe('Your information has been successfully submitted.');
    });
  });

  describe('Action Buttons', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.sections = mockSections;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show print button by default', () => {
      const printButton = pattern.querySelector('usa-button');
      expect(printButton).toBeTruthy();
      expect(printButton?.textContent?.trim()).toBe('Print');
    });

    it('should not show download button by default', () => {
      const buttons = pattern.querySelectorAll('usa-button');
      expect(buttons.length).toBe(1); // Only print button
    });

    it('should show download button when enabled', async () => {
      pattern.showDownload = true;
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      expect(buttons.length).toBe(2);
      expect(buttons[1]?.textContent?.trim()).toBe('Download');
    });

    it('should hide all buttons when showPrint and showDownload are false', async () => {
      pattern.showPrint = false;
      pattern.showDownload = false;
      await pattern.updateComplete;

      const buttonGroup = pattern.querySelector('.usa-button-group');
      expect(buttonGroup).toBeNull();
    });

    it('should use custom button labels', async () => {
      // Create new pattern with custom labels set before rendering
      const customPattern = document.createElement(
        'usa-form-summary-pattern'
      ) as USAFormSummaryPattern;
      customPattern.sections = mockSections;
      customPattern.printButtonLabel = 'Print Summary';
      customPattern.downloadButtonLabel = 'Download PDF';
      customPattern.showDownload = true;
      container.appendChild(customPattern);
      await customPattern.updateComplete;

      const buttons = customPattern.querySelectorAll('usa-button');
      expect(buttons[0]?.textContent?.trim()).toBe('Print Summary');
      expect(buttons[1]?.textContent?.trim()).toBe('Download PDF');
    });
  });

  describe('Edit Functionality', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.sections = mockSections;
      pattern.showEdit = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show edit buttons when enabled', () => {
      const editButtons = pattern.querySelectorAll('.usa-button--unstyled');
      expect(editButtons.length).toBe(7); // One for each item
    });

    it('should not show edit buttons by default', async () => {
      const newPattern = document.createElement(
        'usa-form-summary-pattern'
      ) as USAFormSummaryPattern;
      newPattern.sections = mockSections;
      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const editButtons = newPattern.querySelectorAll('.usa-button--unstyled');
      expect(editButtons.length).toBe(0);

      newPattern.remove();
    });

    it('should have descriptive aria-label on edit buttons', () => {
      const firstEditButton = pattern.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      expect(firstEditButton?.getAttribute('aria-label')).toBe('Edit Full Name');
    });

    it('should emit edit-field event when clicking edit', async () => {
      const editPromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('edit-field', (e) => resolve(e as CustomEvent));
      });

      const firstEditButton = pattern.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      firstEditButton?.click();

      const event = await editPromise;
      expect(event.detail.section).toBe('Personal Information');
      expect(event.detail.field).toBe('Full Name');
      expect(event.detail.currentValue).toBe('Jane Smith');
    });

    it('should call item onEdit callback when provided', async () => {
      const onEdit = vi.fn();
      pattern.sections = [
        {
          heading: 'Test',
          items: [{ label: 'Field', value: 'Value', onEdit }],
        },
      ];
      await pattern.updateComplete;

      const editButton = pattern.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      editButton?.click();

      expect(onEdit).toHaveBeenCalledOnce();
    });
  });

  describe('Print Functionality', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.sections = mockSections;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit print-summary event when clicking print', async () => {
      const printPromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('print-summary', (e) => resolve(e as CustomEvent));
      });

      const printButton = pattern.querySelector('usa-button') as HTMLElement;
      printButton?.click();

      const event = await printPromise;
      expect(event.detail.sections).toEqual(mockSections);
    });

    it('should call window.print() after emitting event', async () => {
      const originalPrint = window.print;
      window.print = vi.fn();

      const printButton = pattern.querySelector('usa-button') as HTMLElement;
      printButton?.click();

      // Wait for setTimeout to complete
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(window.print).toHaveBeenCalled();

      window.print = originalPrint;
    });

    it('should support programmatic print() method', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      pattern.print();

      // Wait for setTimeout
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(printSpy).toHaveBeenCalled();
          printSpy.mockRestore();
          resolve(undefined);
        }, 150);
      });
    });
  });

  describe('Download Functionality', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.sections = mockSections;
      pattern.showDownload = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should emit download-summary event when clicking download', async () => {
      const downloadPromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('download-summary', (e) => resolve(e as CustomEvent));
      });

      const buttons = pattern.querySelectorAll('usa-button');
      const downloadButton = buttons[1] as HTMLElement;
      downloadButton?.click();

      const event = await downloadPromise;
      expect(event.detail.sections).toEqual(mockSections);
    });

    it('should support programmatic download() method', async () => {
      const downloadPromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('download-summary', (e) => resolve(e as CustomEvent));
      });

      pattern.download();

      const event = await downloadPromise;
      expect(event.detail.sections).toEqual(mockSections);
    });
  });

  describe('Public API', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      container.appendChild(pattern);
    });

    it('should get summary data via getSummaryData()', async () => {
      pattern.setSummaryData(mockSections);
      await pattern.updateComplete;

      const data = pattern.getSummaryData();
      expect(data).toEqual(mockSections);
      expect(data).not.toBe(mockSections); // Should return a copy
    });

    it('should set summary data via setSummaryData()', async () => {
      pattern.setSummaryData(mockSections);
      await pattern.updateComplete;

      expect(pattern.sections).toEqual(mockSections);
      const headings = pattern.querySelectorAll('.usa-summary-box__heading');
      expect(headings.length).toBe(2);
    });

    it('should add section via addSection()', async () => {
      pattern.sections = mockSections;
      await pattern.updateComplete;

      const newSection: SummarySection = {
        heading: 'Emergency Contact',
        items: [{ label: 'Name', value: 'John Doe' }],
      };

      pattern.addSection(newSection);
      await pattern.updateComplete;

      expect(pattern.sections.length).toBe(3);
      const headings = pattern.querySelectorAll('.usa-summary-box__heading');
      expect(headings.length).toBe(3);
      expect(headings[2]?.textContent).toBe('Emergency Contact');
    });

    it('should clear summary via clearSummary()', async () => {
      pattern.sections = mockSections;
      await pattern.updateComplete;

      expect(pattern.sections.length).toBe(2);

      pattern.clearSummary();
      await pattern.updateComplete;

      expect(pattern.sections.length).toBe(0);
      const summaryBoxes = pattern.querySelectorAll('.usa-summary-box');
      expect(summaryBoxes.length).toBe(0);
    });
  });

  describe('Slots', () => {
    it('should support header slot', async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.innerHTML = '<div slot="header"><h1>Custom Header</h1></div>';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const customHeader = pattern.querySelector('div[slot="header"]');
      expect(customHeader).toBeTruthy();
      expect(customHeader?.querySelector('h1')?.textContent).toBe('Custom Header');
    });

    it('should support footer slot', async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.innerHTML = '<div slot="footer"><p>Custom Footer</p></div>';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const customFooter = pattern.querySelector('div[slot="footer"]');
      expect(customFooter).toBeTruthy();
      expect(customFooter?.querySelector('p')?.textContent).toBe('Custom Footer');
    });

    it('should support confirmation slot', async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.showConfirmation = true;
      pattern.innerHTML = '<div slot="confirmation"><p>Custom Confirmation</p></div>';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const customConfirmation = pattern.querySelector('div[slot="confirmation"]');
      expect(customConfirmation).toBeTruthy();
      expect(customConfirmation?.querySelector('p')?.textContent).toBe('Custom Confirmation');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-form-summary-pattern') as USAFormSummaryPattern;
      pattern.sections = mockSections;
      pattern.showEdit = true;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should use semantic HTML for key-value pairs', () => {
      const dl = pattern.querySelector('dl');
      expect(dl).toBeTruthy();
    });

    it('should have descriptive aria-labels on edit buttons', async () => {
      const editButtons = pattern.querySelectorAll('.usa-button--unstyled');
      for (const button of editButtons) {
        expect(await waitForARIAAttribute(button, 'aria-label')).toBeTruthy();
        expect(await waitForARIAAttribute(button, 'aria-label')).toMatch(/^Edit /);
      }
    });

    it('should use USWDS alert component for confirmation', async () => {
      pattern.showConfirmation = true;
      await pattern.updateComplete;

      const alert = pattern.querySelector('.usa-alert');
      const alertBody = pattern.querySelector('.usa-alert__body');
      expect(alert).toBeTruthy();
      expect(alertBody).toBeTruthy();
    });
  });
});
