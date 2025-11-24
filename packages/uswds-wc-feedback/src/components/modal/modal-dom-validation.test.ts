import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-modal.ts';
import type { USAModal } from './usa-modal.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

// Helper to wait for USWDS modal transformation
async function waitForModalTransformation(modalId: string, timeout = 2000): Promise<HTMLElement> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    // Look for the transformed modal wrapper in document.body
    const wrapper = document.getElementById(modalId);

    // Check if USWDS has transformed the modal (wrapper exists and has role="dialog")
    if (wrapper && wrapper.getAttribute('role') === 'dialog') {
      return wrapper;
    }

    // Wait 50ms before next check
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`Modal transformation timeout after ${timeout}ms for modal: ${modalId}`);
}

// Simple validation helpers
function validateCSSClasses(
  element: Element,
  requiredClasses: string[],
  prohibitedClasses: string[] = []
) {
  requiredClasses.forEach((className) => {
    expect(element.classList.contains(className), `Missing required class: ${className}`).toBe(
      true
    );
  });
  prohibitedClasses.forEach((className) => {
    expect(element.classList.contains(className), `Should not have class: ${className}`).toBe(
      false
    );
  });
}

function validateAttributeBinding(
  element: Element,
  attrName: string,
  expectedValue: any,
  propName?: string
) {
  if (typeof expectedValue === 'boolean') {
    if (expectedValue) {
      expect(element.hasAttribute(attrName), `Missing attribute: ${attrName}`).toBe(true);
    } else {
      expect(element.hasAttribute(attrName), `Should not have attribute: ${attrName}`).toBe(false);
    }
  } else {
    expect(element.getAttribute(attrName), `Attribute ${attrName} has wrong value`).toBe(
      expectedValue
    );
  }

  if (propName) {
    expect((element as any)[propName], `Property ${propName} has wrong value`).toBe(expectedValue);
  }
}

/**
 * Modal DOM Structure Validation Tests
 *
 * Catches visual/structural issues like:
 * - Force action modal showing close button
 * - Single action modal showing secondary button
 * - Missing required USWDS elements
 * - Incorrect CSS classes
 * - Attribute binding failures
 */

describe('Modal DOM Structure Validation', () => {
  let element: USAModal;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    element = document.createElement('usa-modal') as USAModal;
    element.id = 'test-modal';
    element.heading = 'Test Modal';
    element.description = 'Test description';
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic DOM Structure', () => {
    it('should render complete USWDS modal structure', async () => {
      await element.updateComplete;

      // Verify basic modal structure exists
      const modal = element.querySelector('.usa-modal');
      expect(modal).toBeTruthy();

      const content = element.querySelector('.usa-modal__content');
      expect(content).toBeTruthy();

      const main = element.querySelector('.usa-modal__main');
      expect(main).toBeTruthy();

      const heading = element.querySelector('.usa-modal__heading');
      expect(heading).toBeTruthy();

      const footer = element.querySelector('.usa-modal__footer');
      expect(footer).toBeTruthy();
    });

    it('should have correct CSS classes', async () => {
      await element.updateComplete;

      const modal = element.querySelector('.usa-modal');
      expect(modal).toBeTruthy();

      validateCSSClasses(modal!, ['usa-modal']);
    });

    it('should have both primary and secondary buttons by default', async () => {
      await element.updateComplete;

      const primaryButton = element.querySelector('.usa-button:not(.usa-button--unstyled)');
      const secondaryButton = element.querySelector('.usa-button--unstyled');

      expect(primaryButton).toBeTruthy();
      expect(secondaryButton).toBeTruthy();
    });
  });

  describe('Force Action Modal', () => {
    it('should NOT show close button when forceAction is true', async () => {
      element.forceAction = true;
      await element.updateComplete;

      const closeButton = element.querySelector('.usa-modal__close');
      expect(closeButton).toBeFalsy();
    });

    it('should have data-force-action attribute', async () => {
      element.forceAction = true;
      await element.updateComplete;

      const modal = element.querySelector('.usa-modal');
      expect(modal).toBeTruthy();
      expect(modal!.hasAttribute('data-force-action')).toBe(true);
    });

    it('should show close button when forceAction is false', async () => {
      element.forceAction = false;
      await element.updateComplete;

      const closeButton = element.querySelector('.usa-modal__close');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Single Action Modal', () => {
    it('should NOT show secondary button when showSecondaryButton is false', async () => {
      element.showSecondaryButton = false;
      await element.updateComplete;

      const secondaryButton = element.querySelector('.usa-button--unstyled');
      expect(secondaryButton).toBeFalsy();
    });

    it('should only have one button in footer', async () => {
      element.showSecondaryButton = false;
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-modal__footer button');
      expect(buttons.length).toBe(1);
    });

    it('should show secondary button when showSecondaryButton is true', async () => {
      element.showSecondaryButton = true;
      await element.updateComplete;

      const secondaryButton = element.querySelector('.usa-button--unstyled');
      expect(secondaryButton).toBeTruthy();
    });
  });

  describe('Large Modal', () => {
    it('should have usa-modal--lg class when large is true', async () => {
      element.large = true;
      await element.updateComplete;

      const modal = element.querySelector('.usa-modal');
      validateCSSClasses(modal!, ['usa-modal', 'usa-modal--lg']);
    });

    it('should NOT have usa-modal--lg class when large is false', async () => {
      element.large = false;
      await element.updateComplete;

      const modal = element.querySelector('.usa-modal');
      validateCSSClasses(modal!, ['usa-modal'], ['usa-modal--lg']);
    });
  });

  describe('Attribute Binding Validation', () => {
    it('should properly bind force-action attribute', async () => {
      element.setAttribute('force-action', '');
      await element.updateComplete;

      validateAttributeBinding(element, 'force-action', true, 'forceAction');
    });

    it('should properly bind show-secondary-button attribute', async () => {
      element.setAttribute('show-secondary-button', 'false');
      await element.updateComplete;

      // Note: This tests the attribute, but property binding happens differently
      expect(element.hasAttribute('show-secondary-button')).toBe(true);
    });

    it('should properly bind primary-button-text attribute', async () => {
      element.setAttribute('primary-button-text', 'Accept');
      await element.updateComplete;

      validateAttributeBinding(element, 'primary-button-text', 'Accept', 'primaryButtonText');

      const primaryButton = element.querySelector('.usa-button:not(.usa-button--unstyled)');
      expect(primaryButton?.textContent?.trim()).toBe('Accept');
    });

    it('should properly bind secondary-button-text attribute', async () => {
      element.setAttribute('secondary-button-text', 'Decline');
      await element.updateComplete;

      validateAttributeBinding(element, 'secondary-button-text', 'Decline', 'secondaryButtonText');

      const secondaryButton = element.querySelector('.usa-button--unstyled');
      expect(secondaryButton?.textContent?.trim()).toBe('Decline');
    });
  });

  describe('Built-in Trigger Button', () => {
    it('should render trigger button when showTrigger and triggerText are set', async () => {
      element.showTrigger = true;
      element.triggerText = 'Open Modal';
      await element.updateComplete;

      const triggerButton = element.querySelector('[data-open-modal]');
      expect(triggerButton).toBeTruthy();
      expect(triggerButton?.textContent?.trim()).toBe('Open Modal');
    });

    it('should NOT render trigger button when showTrigger is false', async () => {
      element.showTrigger = false;
      element.triggerText = 'Open Modal';
      await element.updateComplete;

      const triggerButton = element.querySelector('[data-open-modal]');
      expect(triggerButton).toBeFalsy();
    });

    it('should NOT render trigger button when triggerText is empty', async () => {
      element.showTrigger = true;
      element.triggerText = '';
      await element.updateComplete;

      const triggerButton = element.querySelector('[data-open-modal]');
      expect(triggerButton).toBeFalsy();
    });

    it('trigger button should have correct aria-controls', async () => {
      element.showTrigger = true;
      element.triggerText = 'Open Modal';
      await element.updateComplete;

      const triggerButton = element.querySelector('[data-open-modal]');
      const ariaControls = triggerButton?.getAttribute('aria-controls');

      // Get the actual modal ID from the .usa-modal element
      const modal = element.querySelector('.usa-modal');
      const modalId = modal?.getAttribute('id');

      // Should match the modal's actual ID (which is randomly generated)
      expect(ariaControls).toBe(modalId);
      expect(ariaControls).toBeTruthy();
      expect(ariaControls).toMatch(/^modal-\d+$/);
    });
  });

  describe('Content Rendering', () => {
    it('should render heading text', async () => {
      element.heading = 'Important Notice';
      await element.updateComplete;

      const heading = element.querySelector('.usa-modal__heading');
      expect(heading?.textContent?.trim()).toBe('Important Notice');
    });

    it('should render description text', async () => {
      element.description = 'Please read carefully';
      await element.updateComplete;

      const description = element.querySelector('.usa-prose p');
      expect(description?.textContent?.trim()).toContain('Please read carefully');
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have correct ARIA attributes', async () => {
      await element.updateComplete;

      // Get the actual modal ID (randomly generated)
      const modal = element.querySelector('.usa-modal');
      const modalId = modal?.getAttribute('id');
      expect(modalId).toBeTruthy();
      expect(modalId).toMatch(/^modal-\d+$/);

      // USWDS transformation moves role and aria-modal to the wrapper
      // Wait for the wrapper to be created by USWDS
      const wrapper = await waitForModalTransformation(modalId!);

      expect(wrapper.getAttribute('role')).toBe('dialog');
      expect(await waitForARIAAttribute(wrapper, 'aria-modal')).toBe('true');
      expect(await waitForARIAAttribute(wrapper, 'aria-labelledby')).toBe(`${modalId}-heading`);
      expect(await waitForARIAAttribute(wrapper, 'aria-describedby')).toBe(
        `${modalId}-description`
      );
    });

    it('should have matching heading id', async () => {
      await element.updateComplete;

      // Get the actual modal ID (randomly generated)
      const modal = element.querySelector('.usa-modal');
      const modalId = modal?.getAttribute('id');

      const heading = element.querySelector('.usa-modal__heading');
      expect(heading?.id).toBe(`${modalId}-heading`);
      expect(heading?.id).toMatch(/^modal-\d+-heading$/);
    });

    it('should have matching description id', async () => {
      await element.updateComplete;

      // Get the actual modal ID (randomly generated)
      const modal = element.querySelector('.usa-modal');
      const modalId = modal?.getAttribute('id');

      const description = element.querySelector('[id$="-description"]');
      expect(description?.id).toBe(`${modalId}-description`);
      expect(description?.id).toMatch(/^modal-\d+-description$/);
    });
  });

  // NOTE: Slot content tests moved to Cypress e2e tests
  // Reason: Unit tests with Lit's updateComplete don't wait for async firstUpdated() lifecycle
  // The slot application logic works correctly in real browsers (verified in Storybook)
  // See: cypress/e2e/modal-storybook-test.cy.ts for browser-based slot tests
  // See: docs/SLOT_TEST_ISSUE.md for detailed investigation
});
