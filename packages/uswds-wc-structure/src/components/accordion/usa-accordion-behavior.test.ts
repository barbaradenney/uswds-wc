/**
 * USWDS Accordion Behavior Contract Tests
 *
 * These tests validate that our accordion implementation EXACTLY matches
 * USWDS accordion behavior as defined in:
 * docs/USWDS_ACCORDION_BEHAVIOR_CONTRACT.md
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-accordion/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-accordion.js';
import type { USAAccordion } from './usa-accordion.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USWDS Accordion Behavior Contract', () => {
  let element: USAAccordion;

  beforeEach(() => {
    // CRITICAL: Clear DOM completely to prevent pollution from previous tests
    document.body.innerHTML = '';

    element = document.createElement('usa-accordion') as USAAccordion;
    element.items = [
      { id: 'item-1', title: 'First Item', content: '<p>First content</p>', expanded: false },
      { id: 'item-2', title: 'Second Item', content: '<p>Second content</p>', expanded: false },
      { id: 'item-3', title: 'Third Item', content: '<p>Third content</p>', expanded: false },
    ];
    document.body.appendChild(element);
  });

  afterEach(async () => {
    // Explicitly remove element and trigger cleanup
    if (element && element.isConnected) {
      element.remove();
    }

    // Wait for any pending async operations to complete before cleanup
    // USWDS behavior needs time to fully detach event listeners
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  describe('Contract 1: Button Click Toggle', () => {
    it('should toggle aria-expanded on button click', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;

      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');

      button.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('true');

      button.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');
    });

    it('should use string "true"/"false" for aria-expanded, not boolean', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;

      button.click();
      await waitForBehaviorInit(element);

      // CRITICAL: Must be string "true", not boolean true
      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('true');
      expect(await waitForARIAAttribute(button, 'aria-expanded')).not.toBe(true as any);
    });
  });

  describe('Contract 2: Toggle Function', () => {
    it('should control content visibility via hidden attribute', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;
      const contentId = await waitForARIAAttribute(button, 'aria-controls');
      const content = element.querySelector(`#${contentId}`) as HTMLElement;

      expect(content.hasAttribute('hidden')).toBe(true);

      button.click();
      await waitForBehaviorInit(element);

      expect(content.hasAttribute('hidden')).toBe(false);

      button.click();
      await waitForBehaviorInit(element);

      expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('should use hidden attribute (not display:none)', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;
      const contentId = await waitForARIAAttribute(button, 'aria-controls');
      const content = element.querySelector(`#${contentId}`) as HTMLElement;

      // Collapsed: must use hidden attribute
      expect(content.hasAttribute('hidden')).toBe(true);
      expect(content.getAttribute('hidden')).toBe('');

      button.click();
      await waitForBehaviorInit(element);

      // Expanded: must remove hidden attribute (not set to false)
      expect(content.hasAttribute('hidden')).toBe(false);
    });

    it('should find controlled element via aria-controls → getElementById', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;
      const controlsId = await waitForARIAAttribute(button, 'aria-controls');
      const content = document.getElementById(controlsId!);

      expect(content).not.toBeNull();
      expect(content?.classList.contains('usa-accordion__content')).toBe(true);
    });
  });

  describe('Contract 3: Single-Select Mode', () => {
    it('should close other items when opening in single-select mode', async () => {
      element.multiselectable = false;
      await waitForBehaviorInit(element);

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // Open first item
      (buttons[0] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);
      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

      // Open second item - should close first
      (buttons[1] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);
      expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('true');

      // Open third item - should close second
      (buttons[2] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);
      expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('false');
      expect(buttons[2].getAttribute('aria-expanded')).toBe('true');
    });

    it('should NOT close other items when collapsing in single-select mode', async () => {
      element.multiselectable = false;
      await waitForBehaviorInit(element);

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // Open first item
      (buttons[0] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);
      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

      // Close first item - should just close it, not affect others
      (buttons[0] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);
      expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('false');
      expect(buttons[2].getAttribute('aria-expanded')).toBe('false');
    });

    it('should check data-allow-multiple attribute (not property)', async () => {
      element.multiselectable = false;
      await waitForBehaviorInit(element);

      const accordion = element.querySelector('.usa-accordion') as HTMLElement;

      // CRITICAL: USWDS checks hasAttribute('data-allow-multiple')
      expect(accordion.hasAttribute('data-allow-multiple')).toBe(false);
    });
  });

  describe('Contract 4: Multi-Select Mode', () => {
    it('should allow multiple items open in multi-select mode', async () => {
      element.multiselectable = true;
      await waitForBehaviorInit(element);

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // Open first item
      (buttons[0] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);
      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

      // Open second item - first should stay open
      (buttons[1] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);
      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('true');

      // Open third item - all should stay open
      (buttons[2] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);
      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[2].getAttribute('aria-expanded')).toBe('true');
    });

    it('should set data-allow-multiple attribute when multiselectable', async () => {
      element.multiselectable = true;
      await waitForBehaviorInit(element);

      const accordion = element.querySelector('.usa-accordion') as HTMLElement;

      // CRITICAL: USWDS checks hasAttribute('data-allow-multiple')
      expect(accordion.hasAttribute('data-allow-multiple')).toBe(true);
      expect(accordion.getAttribute('data-allow-multiple')).toBe('');
    });

    it('should allow independent toggling of each item', async () => {
      element.multiselectable = true;
      await waitForBehaviorInit(element);

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // Open all
      (buttons[0] as HTMLButtonElement).click();
      (buttons[1] as HTMLButtonElement).click();
      (buttons[2] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);

      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[2].getAttribute('aria-expanded')).toBe('true');

      // Close middle item - others should stay open
      (buttons[1] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);

      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('false');
      expect(buttons[2].getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Contract 5: Initialization', () => {
    it('should initialize content visibility from aria-expanded', async () => {
      element.items = [
        { id: 'test-1', title: 'Test', content: '<p>Test</p>', expanded: true },
        { id: 'test-2', title: 'Test 2', content: '<p>Test 2</p>', expanded: false },
      ];
      await waitForBehaviorInit(element);

      const button1 = element.querySelector(
        '[aria-controls="test-1-content"]'
      ) as HTMLButtonElement;
      const content1 = element.querySelector('#test-1-content') as HTMLElement;
      const button2 = element.querySelector(
        '[aria-controls="test-2-content"]'
      ) as HTMLButtonElement;
      const content2 = element.querySelector('#test-2-content') as HTMLElement;

      expect(await waitForARIAAttribute(button1, 'aria-expanded')).toBe('true');
      expect(content1.hasAttribute('hidden')).toBe(false);

      expect(await waitForARIAAttribute(button2, 'aria-expanded')).toBe('false');
      expect(content2.hasAttribute('hidden')).toBe(true);
    });

    it('should sync content hidden state to match button aria-expanded on init', async () => {
      await waitForBehaviorInit(element);

      const buttons = element.querySelectorAll('.usa-accordion__button');

      for (const button of buttons) {
        const contentId = await waitForARIAAttribute(button, 'aria-controls');
        const content = element.querySelector(`#${contentId}`) as HTMLElement;
        const expanded = (await waitForARIAAttribute(button, 'aria-expanded')) === 'true';

        expect(content.hasAttribute('hidden')).toBe(!expanded);
      }
    });
  });

  describe('Contract 6: HTML Structure Requirements', () => {
    it('should have correct button structure', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;

      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.classList.contains('usa-accordion__button')).toBe(true);
      expect(button.hasAttribute('aria-expanded')).toBe(true);
      expect(button.hasAttribute('aria-controls')).toBe(true);
    });

    it('should have correct content structure', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;
      const contentId = await waitForARIAAttribute(button, 'aria-controls');
      const content = element.querySelector(`#${contentId}`) as HTMLElement;

      expect(content.tagName).toBe('DIV');
      expect(content.classList.contains('usa-accordion__content')).toBe(true);
      expect(content.classList.contains('usa-prose')).toBe(true);
      expect(content.id).toBe(contentId);
    });

    it('should have correct container structure', async () => {
      await waitForBehaviorInit(element);
      const accordion = element.querySelector('.usa-accordion') as HTMLElement;

      expect(accordion.tagName).toBe('DIV');
      expect(accordion.classList.contains('usa-accordion')).toBe(true);
    });

    it('should use usa-accordion--bordered class when bordered', async () => {
      element.bordered = true;
      await waitForBehaviorInit(element);

      const accordion = element.querySelector('.usa-accordion') as HTMLElement;
      expect(accordion.classList.contains('usa-accordion--bordered')).toBe(true);
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT use display:none for hiding content', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;
      const contentId = await waitForARIAAttribute(button, 'aria-controls');
      const content = element.querySelector(`#${contentId}`) as HTMLElement;

      // Content should use hidden attribute, not inline styles
      expect(content.style.display).toBe('');
    });

    it('should NOT use boolean for aria-expanded', async () => {
      await waitForBehaviorInit(element);
      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;

      button.click();
      await waitForBehaviorInit(element);

      // Must be string "true", not boolean
      const expanded = await waitForARIAAttribute(button, 'aria-expanded');
      expect(typeof expanded).toBe('string');
      expect(expanded).toBe('true');
    });

    it('should NOT modify USWDS class names', async () => {
      await waitForBehaviorInit(element);

      const accordion = element.querySelector('.usa-accordion');
      const button = element.querySelector('.usa-accordion__button');
      const content = element.querySelector('.usa-accordion__content');

      expect(accordion).not.toBeNull();
      expect(button).not.toBeNull();
      expect(content).not.toBeNull();
    });
  });

  describe('Property Reactivity (Web Component Extension)', () => {
    it('should update mode when multiselectable property changes', async () => {
      element.multiselectable = false;
      await waitForBehaviorInit(element);

      const accordion = element.querySelector('.usa-accordion') as HTMLElement;
      expect(accordion.hasAttribute('data-allow-multiple')).toBe(false);

      element.multiselectable = true;
      await waitForBehaviorInit(element);

      expect(accordion.hasAttribute('data-allow-multiple')).toBe(true);
    });

    it('should maintain correct behavior after mode switch', async () => {
      const buttons = element.querySelectorAll('.usa-accordion__button');

      // Start in multi-select
      element.multiselectable = true;
      await waitForBehaviorInit(element);

      (buttons[0] as HTMLButtonElement).click();
      (buttons[1] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);

      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('true');

      // Switch to single-select
      element.multiselectable = false;
      await waitForBehaviorInit(element);

      // Click third button - should close others
      (buttons[2] as HTMLButtonElement).click();
      await waitForBehaviorInit(element);

      expect(buttons[0].getAttribute('aria-expanded')).toBe('false');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('false');
      expect(buttons[2].getAttribute('aria-expanded')).toBe('true');
    });
  });
});
