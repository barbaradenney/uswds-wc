import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-accordion.ts';
import type { USAAccordion } from './usa-accordion.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';
/**
 * Accordion DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Missing accordion buttons
 * - Missing content containers
 * - Incorrect multiselectable behavior
 * - Missing ARIA attributes
 */

describe('Accordion DOM Structure Validation', () => {
  let element: USAAccordion;
  let container: HTMLElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-accordion') as USAAccordion;
    element.id = 'test-accordion';

    // Add test items so accordion has buttons and content to validate
    element.items = [
      { id: 'item-1', title: 'First Item', content: 'First item content' },
      { id: 'item-2', title: 'Second Item', content: 'Second item content' },
      { id: 'item-3', title: 'Third Item', content: 'Third item content' },
    ];

    container.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should have accordion container', async () => {
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion).toBeTruthy();
    });

    it('should have accordion buttons', async () => {
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-accordion__button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accordion content containers', async () => {
      await element.updateComplete;

      const content = element.querySelectorAll('.usa-accordion__content');
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Multiselectable Behavior', () => {
    it('should have multiselectable class when enabled', async () => {
      element.multiselectable = true;
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--multiselectable')).toBe(true);
    });

    it('should NOT have multiselectable class when disabled', async () => {
      element.multiselectable = false;
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--multiselectable')).toBe(false);
    });
  });

  describe('Bordered Variant', () => {
    it('should have bordered class when bordered is true', async () => {
      element.bordered = true;
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--bordered')).toBe(true);
    });

    it('should NOT have bordered class when bordered is false', async () => {
      element.bordered = false;
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--bordered')).toBe(false);
    });
  });

  describe('Accessibility Structure', () => {
    it('should have proper ARIA attributes on buttons', async () => {
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-accordion__button');
      buttons.forEach((button) => {
        expect(button.hasAttribute('aria-expanded')).toBe(true);
        expect(button.hasAttribute('aria-controls')).toBe(true);
      });
    });

    it('should have heading wrapper with correct level', async () => {
      await element.updateComplete;

      const headings = element.querySelectorAll('.usa-accordion__heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should connect buttons to content via IDs', async () => {
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-accordion__button');
      for (const button of buttons) {
        const controlsId = await waitForARIAAttribute(button, 'aria-controls');
        expect(controlsId).toBeTruthy();

        const content = element.querySelector(`#${controlsId}`);
        expect(content).toBeTruthy();
      }
    });
  });

  describe('Expansion State', () => {
    it('should show expanded content when aria-expanded is true', async () => {
      await element.updateComplete;
      // Wait for firstUpdated() to complete its async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      const button = element.querySelector('.usa-accordion__button[aria-expanded="true"]');
      if (button) {
        const controlsId = await waitForARIAAttribute(button, 'aria-controls');
        const content = element.querySelector(`#${controlsId}`);
        expect(content?.hasAttribute('hidden')).toBe(false);
      }
    });

    it('should hide collapsed content when aria-expanded is false', async () => {
      await element.updateComplete;
      // Wait for firstUpdated() to complete its async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      const button = element.querySelector('.usa-accordion__button[aria-expanded="false"]');
      if (button) {
        const controlsId = await waitForARIAAttribute(button, 'aria-controls');
        const content = element.querySelector(`#${controlsId}`);
        expect(content?.hasAttribute('hidden')).toBe(true);
      }
    });
  });
});
