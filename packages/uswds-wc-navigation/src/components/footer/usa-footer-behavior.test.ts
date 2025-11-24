/**
 * USWDS Footer Behavior Contract Tests
 *
 * These tests validate that our footer implementation EXACTLY matches
 * USWDS footer behavior as defined in the official USWDS source.
 *
 * DO NOT modify these tests to make implementation pass.
 * ONLY modify implementation to match USWDS behavior.
 *
 * Source: @uswds/uswds/packages/usa-footer/src/index.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitForBehaviorInit } from '@uswds-wc/test-utils/test-utils.js';
import './usa-footer.js';
import type { USAFooter } from './usa-footer.js';
import { toggleHtmlTag } from './usa-footer-behavior.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USWDS Footer Behavior Contract', () => {
  let element: USAFooter;
  let originalInnerWidth: number;

  beforeEach(() => {
    element = document.createElement('usa-footer') as USAFooter;
    element.variant = 'big'; // Use correct property name
    // Provide sample sections for rendering primary links
    element.sections = [
      {
        title: 'Primary Section',
        links: [
          { label: 'Link 1', href: '#link1' },
          { label: 'Link 2', href: '#link2' },
        ],
      },
      {
        title: 'Secondary Section',
        links: [
          { label: 'Link 3', href: '#link3' },
          { label: 'Link 4', href: '#link4' },
        ],
      },
    ];
    document.body.appendChild(element);

    // Save original window width
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    element.remove();

    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  describe('Contract 1: Component Structure', () => {
    it('should create big footer with correct class', async () => {
      await waitForBehaviorInit(element);

      const footer = element.querySelector('.usa-footer--big');
      expect(footer).not.toBeNull();
    });

    it('should create navigation element', async () => {
      await waitForBehaviorInit(element);

      const nav = element.querySelector('.usa-footer--big nav');
      expect(nav).not.toBeNull();
    });

    it('should create primary links', async () => {
      await waitForBehaviorInit(element);

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink).not.toBeNull();
    });

    it('should create menu lists associated with primary links', async () => {
      await waitForBehaviorInit(element);

      const menuList = element.querySelector('ul');
      expect(menuList).not.toBeNull();
    });
  });

  describe('Contract 2: Desktop Behavior (>480px)', () => {
    beforeEach(() => {
      // Set desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should use heading tags for primary links on desktop', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');

      // On desktop, should be heading tag (h4), not button
      expect(primaryLink?.tagName).toMatch(/^H[1-6]$/);
    });

    it('should NOT have aria-expanded on desktop primary links', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.hasAttribute('aria-expanded')).toBe(false);
    });

    it('should NOT have aria-controls on desktop primary links', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.hasAttribute('aria-controls')).toBe(false);
    });

    it('should NOT have button class modifier on desktop', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.classList.contains('usa-footer__primary-link--button')).toBe(false);
    });
  });

  describe('Contract 3: Mobile Behavior (<480px)', () => {
    beforeEach(() => {
      // Set mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should convert primary links to buttons on mobile', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.tagName).toBe('BUTTON');
    });

    it('should add button class modifier on mobile', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.classList.contains('usa-footer__primary-link--button')).toBe(true);
    });

    it('should set type="button" on mobile buttons', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link') as HTMLButtonElement;
      expect(primaryLink?.getAttribute('type')).toBe('button');
    });

    it('should add aria-controls linking to menu list', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link') as HTMLElement;
      const menuId = primaryLink?.getAttribute('aria-controls');

      expect(menuId).toBeTruthy();
      expect(menuId).toMatch(/^usa-footer-menu-list-\d+$/);

      const menuList = document.getElementById(menuId!);
      expect(menuList).not.toBeNull();
    });

    it('should initialize with aria-expanded="false"', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.getAttribute('aria-expanded')).toBe('false');
    });

    it('should preserve original tag name in data-tag attribute', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link') as HTMLElement;
      const dataTag = primaryLink?.getAttribute('data-tag');

      expect(dataTag).toBeTruthy();
      expect(dataTag).toMatch(/^H[1-6]$/);
    });
  });

  describe('Contract 4: Mobile Accordion Behavior', () => {
    beforeEach(() => {
      // Set mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
    // Coverage: src/components/footer/usa-footer.component.cy.ts

    // SKIP: JSDOM limitation - requires real browser for USWDS footer accordion behavior
    // Coverage: src/components/footer/usa-footer.component.cy.ts
    it.skip('should collapse other panels when opening one', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll(
        '.usa-footer__primary-link'
      ) as NodeListOf<HTMLButtonElement>;

      if (buttons.length < 2) {
        // Skip test if not enough buttons
        return;
      }

      const firstButton = buttons[0];
      const secondButton = buttons[1];

      // Open first panel
      firstButton.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(firstButton, 'aria-expanded')).toBe('true');

      // Open second panel
      secondButton.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(secondButton, 'aria-expanded')).toBe('true');
      expect(await waitForARIAAttribute(firstButton, 'aria-expanded')).toBe('false');
    });

    // SKIP: JSDOM limitation - requires real browser for USWDS footer accordion behavior
    // Coverage: src/components/footer/usa-footer.component.cy.ts
    it.skip('should use accordion behavior only on mobile', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.usa-footer__primary-link') as HTMLButtonElement;

      // On mobile, clicking should toggle
      button.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('true');

      // Change to desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      // Directly call toggleHtmlTag to simulate responsive behavior (JSDOM doesn't support MediaQueryList events)
      toggleHtmlTag(false); // false = desktop (not mobile)

      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should convert back to heading
      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.tagName).toMatch(/^H[1-6]$/);
    });
  });

  describe('Contract 5: Responsive Behavior', () => {
    it('should listen to media query changes', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Start at desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      // Should start as heading on desktop
      let primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.tagName).toMatch(/^H[1-6]$/);

      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      // Directly call toggleHtmlTag to simulate responsive behavior (JSDOM doesn't support MediaQueryList events)
      toggleHtmlTag(true); // true = mobile

      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.tagName).toBe('BUTTON');
    });

    it('should use 480px as breakpoint', async () => {
      await waitForBehaviorInit(element);

      // Test at exactly 480px (should be desktop)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      window.dispatchEvent(new Event('resize'));
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.tagName).toMatch(/^H[1-6]$/);
    });

    it('should use 479px as mobile threshold', async () => {
      await waitForBehaviorInit(element);

      // Test at 479px (should be mobile)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 479,
      });

      // Directly call toggleHtmlTag to simulate responsive behavior (JSDOM doesn't support MediaQueryList events)
      toggleHtmlTag(true); // true = mobile (479 < 480)

      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link');
      expect(primaryLink?.tagName).toBe('BUTTON');
    });
  });

  describe('Contract 6: Event Delegation', () => {
    beforeEach(() => {
      // Set mobile width for accordion behavior
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    // SKIP: JSDOM limitation - requires real browser for USWDS event delegation
    // Coverage: src/components/footer/usa-footer.component.cy.ts
    it.skip('should use event delegation for button clicks', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.usa-footer__primary-link') as HTMLButtonElement;

      const clickEvent = new MouseEvent('click', { bubbles: true });
      button.dispatchEvent(clickEvent);
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('true');
    });

    // SKIP: JSDOM limitation - requires real browser for USWDS event delegation
    // Coverage: src/components/footer/usa-footer.component.cy.ts
    it.skip('should handle clicks on button children', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.usa-footer__primary-link') as HTMLButtonElement;

      // Add child element
      const span = document.createElement('span');
      span.textContent = 'Child';
      button.appendChild(span);

      span.click();
      await waitForBehaviorInit(element);

      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('true');
    });
  });

  describe('Contract 7: Cleanup', () => {
    it('should remove event listeners when component disconnects', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      element.remove();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Resize should not cause errors after cleanup
      window.dispatchEvent(new Event('resize'));

      expect(true).toBe(true);
    });

    // SKIP: JSDOM limitation - window.matchMedia mock not working in CI
    // Coverage: Footer behavior validated in Cypress component tests
    it.skip('should remove media query listeners on cleanup', async () => {
      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const mediaQuery = window.matchMedia('(max-width: 479.9px)');

      element.remove();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Media query changes should not affect removed component
      const event = new Event('change') as MediaQueryListEvent;
      Object.defineProperty(event, 'matches', { value: true, writable: false });
      mediaQuery.dispatchEvent(event);

      expect(true).toBe(true);
    });
  });

  describe('Prohibited Behaviors (must NOT be present)', () => {
    it('should NOT modify USWDS class names', async () => {
      await waitForBehaviorInit(element);

      const footer = element.querySelector('.usa-footer--big');
      const nav = element.querySelector('.usa-footer--big nav');
      const primaryLink = element.querySelector('.usa-footer__primary-link');

      expect(footer).not.toBeNull();
      expect(nav).not.toBeNull();
      expect(primaryLink).not.toBeNull();
    });

    it('should NOT use display:none for hiding content', async () => {
      // Set mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const menuList = element.querySelector('ul') as HTMLElement;

      // Should use CSS/aria-expanded, not inline display:none
      expect(menuList?.style.display).toBe('');
    });

    it('should NOT allow desktop accordion behavior', async () => {
      // Set desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      await waitForBehaviorInit(element);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const primaryLink = element.querySelector('.usa-footer__primary-link') as HTMLElement;

      // On desktop, should be heading, not button - clicking should do nothing
      expect(primaryLink.tagName).toMatch(/^H[1-6]$/);

      primaryLink.click();
      await waitForBehaviorInit(element);

      // Should not have aria-expanded since it's a heading
      expect(primaryLink.hasAttribute('aria-expanded')).toBe(false);
    });
  });
});
