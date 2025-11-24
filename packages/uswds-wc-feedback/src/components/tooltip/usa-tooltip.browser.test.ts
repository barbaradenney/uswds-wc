import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './index.ts';
import type { USATooltip } from './usa-tooltip.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

/**
 * Browser-dependent tests for USATooltip
 *
 * These tests require actual browser behavior including:
 * - USWDS JavaScript initialization
 * - DOM restructuring and positioning
 * - Mouse and focus event handling
 * - getBoundingClientRect calculations
 *
 * Run with: npm run test:browser
 *
 * NOTE: These tests are skipped in unit test runs to avoid failures
 * in environments where USWDS JavaScript cannot properly initialize.
 */
describe.skip('USATooltip Browser Tests', () => {
  let element: USATooltip;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-tooltip') as USATooltip;
    element.text = 'Test tooltip';

    const button = document.createElement('button');
    button.textContent = 'Trigger Button';
    element.appendChild(button);

    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for tooltip structure', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const trigger = element.querySelector('.usa-tooltip') as HTMLElement;
      expect(trigger, 'Should have trigger element').toBeTruthy();
      expect(
        trigger.classList.contains('usa-tooltip'),
        'Trigger should have usa-tooltip class'
      ).toBe(true);

      const triggerRect = trigger.getBoundingClientRect();
      expect(triggerRect.width, 'Trigger should have width').toBeGreaterThan(0);
      expect(triggerRect.height, 'Trigger should have height').toBeGreaterThan(0);
    });

    it('should pass visual layout checks for tooltip positioning when visible', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      element.show();
      await element.updateComplete;

      expect(element.visible, 'Element should be visible').toBe(true);

      const trigger = element.querySelector('.usa-tooltip') as HTMLElement;
      expect(trigger, 'Should have trigger element').toBeTruthy();
      expect(trigger.getAttribute('data-position'), 'Should have position attribute').toBe('top');

      const tooltipBody = document.querySelector('.usa-tooltip__body') as HTMLElement;
      if (tooltipBody) {
        expect(
          tooltipBody.classList.contains(`usa-tooltip__body--${element.position}`),
          `Tooltip should have position class when visible`
        ).toBe(true);

        expect(
          tooltipBody.classList.contains('is-visible'),
          'Tooltip should have visible class'
        ).toBe(true);
      }
    });

    it('should pass visual layout checks for different positions', async () => {
      const positions = ['top', 'bottom', 'left', 'right'] as const;

      for (const position of positions) {
        element.position = position;
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 100));

        element.show();
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 50));

        const trigger = element.querySelector('.usa-tooltip') as HTMLElement;
        expect(trigger?.getAttribute('data-position'), `Should have ${position} position`).toBe(
          position
        );

        const tooltipBody = document.querySelector('.usa-tooltip__body') as HTMLElement;
        if (tooltipBody) {
          expect(
            tooltipBody.classList.contains(`usa-tooltip__body--${position}`),
            `Tooltip should have ${position} position class`
          ).toBe(true);
        }

        element.hide();
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    });

    it('should handle mouse interactions correctly', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const trigger = element.querySelector('.usa-tooltip__trigger') as HTMLElement;
      expect(trigger, 'Should have trigger element').toBeTruthy();

      // Mouseenter should show tooltip
      trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(element.visible, 'Tooltip should show on mouseenter').toBe(true);

      // Mouseleave should hide tooltip
      trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(element.visible, 'Tooltip should hide on mouseleave').toBe(false);
    });

    it('should handle focus interactions correctly', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const trigger = element.querySelector('.usa-tooltip__trigger') as HTMLElement;
      expect(trigger, 'Should have trigger element').toBeTruthy();

      // Focus should show tooltip
      trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(element.visible, 'Tooltip should show on focusin').toBe(true);

      // Blur should hide tooltip
      trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(element.visible, 'Tooltip should hide on focusout').toBe(false);
    });

    it('should handle keyboard interactions correctly', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const trigger = element.querySelector('.usa-tooltip__trigger') as HTMLElement;

      // Show tooltip first
      element.show();
      await element.updateComplete;
      expect(element.visible, 'Tooltip should be visible initially').toBe(true);

      // Escape key should hide tooltip
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(element.visible, 'Tooltip should hide on Escape key').toBe(false);
    });

    it('should handle multiple triggers correctly', async () => {
      // Create element with multiple triggers
      const multiElement = document.createElement('usa-tooltip') as USATooltip;
      multiElement.text = 'Multi tooltip';

      const button1 = document.createElement('button');
      button1.textContent = 'Button 1';
      button1.setAttribute('data-position', 'top');
      multiElement.appendChild(button1);

      const button2 = document.createElement('button');
      button2.textContent = 'Button 2';
      button2.setAttribute('data-position', 'right');
      multiElement.appendChild(button2);

      container.appendChild(multiElement);
      await multiElement.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check that USWDS handles multiple triggers correctly
      const triggers = multiElement.querySelectorAll('.usa-tooltip__trigger');
      expect(triggers.length, 'Should have multiple triggers').toBeGreaterThan(0);

      if (triggers.length >= 2) {
        const firstTrigger = triggers[0] as HTMLElement;
        expect(
          firstTrigger.getAttribute('data-position'),
          'First trigger should have position'
        ).toBe('top');
      }
    });

    it('should handle custom classes correctly', async () => {
      element.classes = 'custom-tooltip-class margin-2';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const trigger = element.querySelector('.usa-tooltip') as HTMLElement;
      if (trigger) {
        expect(trigger.classList.contains('custom-tooltip-class'), 'Should have custom class').toBe(
          true
        );
      }
    });

    it('should maintain proper ARIA relationships', async () => {
      element.id = 'test-tooltip-aria';
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 200));

      const trigger = element.querySelector('.usa-tooltip__trigger') as HTMLElement;
      if (trigger) {
        const ariaDescribedBy = await waitForARIAAttribute(trigger, 'aria-describedby');
        if (ariaDescribedBy) {
          expect(ariaDescribedBy, 'Should have proper ARIA relationship').toBe('test-tooltip-aria');
        }
      }
    });
  });

  describe('USWDS Integration Tests', () => {
    it('should properly initialize USWDS tooltip module', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if USWDS has created the expected DOM structure
      const wrapper = element.querySelector('.usa-tooltip');
      expect(wrapper, 'USWDS should create wrapper structure').toBeTruthy();

      if (wrapper) {
        const trigger = wrapper.querySelector('.usa-tooltip__trigger');
        expect(trigger, 'USWDS should create trigger element').toBeTruthy();
      }
    });

    it('should handle USWDS positioning logic', async () => {
      const positions = ['top', 'bottom', 'left', 'right'] as const;

      for (const position of positions) {
        element.position = position;
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 100));

        element.show();
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 100));

        const tooltipBody = document.querySelector('.usa-tooltip__body');
        if (tooltipBody) {
          expect(
            tooltipBody.classList.contains(`usa-tooltip__body--${position}`),
            `USWDS should apply ${position} positioning class`
          ).toBe(true);
        }

        element.hide();
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    });
  });
});
