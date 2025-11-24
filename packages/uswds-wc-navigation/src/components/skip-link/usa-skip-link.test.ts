import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-skip-link.ts';
import type { USASkipLink, SkipLinkDetail } from './usa-skip-link.js';
import { waitForUpdate, validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USASkipLink', () => {
  let element: USASkipLink;

  beforeEach(() => {
    element = document.createElement('usa-skip-link') as USASkipLink;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
    // Clean up any test targets
    const testTargets = document.querySelectorAll('[id^="test-"]');
    testTargets.forEach((target) => target.remove());
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-SKIP-LINK');
    });

    it('should have default properties', () => {
      expect(element.href).toBe('#main-content');
      expect(element.text).toBe('Skip to main content');
      expect(element.multiple).toBe(false);
    });

    it('should render skip link with correct attributes', async () => {
      await waitForUpdate(element);

      const link = element.querySelector('a');
      expect(link).toBeTruthy();
      expect(link?.href).toContain('#main-content');
      expect(link?.textContent?.trim()).toBe('Skip to main content');
      expect(link?.classList.contains('usa-skipnav')).toBe(true);
    });
  });

  describe('Properties', () => {
    it('should handle href changes', async () => {
      element.href = '#custom-target';
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link?.href).toContain('#custom-target');
    });

    it('should handle text changes', async () => {
      element.text = 'Skip to navigation';
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link?.textContent?.trim()).toBe('Skip to navigation');
    });

    it('should handle multiple property changes', async () => {
      element.multiple = true;
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link?.classList.contains('usa-skipnav--multiple')).toBe(true);
    });

    it('should update multiple properties together', async () => {
      element.href = '#secondary-nav';
      element.text = 'Skip to secondary navigation';
      element.multiple = true;
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link?.href).toContain('#secondary-nav');
      expect(link?.textContent?.trim()).toBe('Skip to secondary navigation');
      expect(link?.classList.contains('usa-skipnav--multiple')).toBe(true);
    });
  });

  describe('CSS Classes', () => {
    it('should apply base CSS class', async () => {
      await waitForUpdate(element);

      const link = element.querySelector('a');
      expect(link?.classList.contains('usa-skipnav')).toBe(true);
    });

    it('should apply multiple class when enabled', async () => {
      element.multiple = true;
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link?.classList.contains('usa-skipnav')).toBe(true);
      expect(link?.classList.contains('usa-skipnav--multiple')).toBe(true);
    });

    it('should remove multiple class when disabled', async () => {
      element.multiple = true;
      await waitForUpdate(element);

      element.multiple = false;
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link?.classList.contains('usa-skipnav')).toBe(true);
      expect(link?.classList.contains('usa-skipnav--multiple')).toBe(false);
    });
  });

  describe('Click Event Handling', () => {
    it('should dispatch skip-link-click event on click', async () => {
      let eventDetail: SkipLinkDetail | null = null;

      element.addEventListener('skip-link-click', (e: any) => {
        eventDetail = e.detail;
      });

      await waitForUpdate(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      link.click();

      expect(eventDetail).toBeTruthy();
      if (eventDetail) {
        expect((eventDetail as any).href).toBe('#main-content');
        expect((eventDetail as any).text).toBe('Skip to main content');
      }
    });

    it('should dispatch event with custom values', async () => {
      let eventDetail: SkipLinkDetail | null = null;

      element.href = '#custom-section';
      element.text = 'Jump to custom section';

      element.addEventListener('skip-link-click', (e: any) => {
        eventDetail = e.detail;
      });

      await waitForUpdate(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      link.click();

      if (eventDetail) {
        expect((eventDetail as any).href).toBe('#custom-section');
        expect((eventDetail as any).text).toBe('Jump to custom section');
      }
    });

    it('should have bubbling and composed event properties', async () => {
      let capturedEvent: CustomEvent | null = null;

      element.addEventListener('skip-link-click', (e: any) => {
        capturedEvent = e;
      });

      await waitForUpdate(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      link.click();

      expect(capturedEvent).toBeTruthy();
      if (capturedEvent) {
        expect((capturedEvent as any).bubbles).toBe(true);
        expect((capturedEvent as any).composed).toBe(true);
        expect((capturedEvent as any).type).toBe('skip-link-click');
      }
    });
  });

  describe('Target Element Focus', () => {
    beforeEach(() => {
      // Create test target elements
      const mainContent = document.createElement('div');
      mainContent.id = 'test-main-content';
      mainContent.innerHTML = '<p>Main content here</p>';
      document.body.appendChild(mainContent);

      const navigation = document.createElement('nav');
      navigation.id = 'test-navigation';
      navigation.innerHTML = '<ul><li><a href="#">Link</a></li></ul>';
      document.body.appendChild(navigation);
    });

    it('should focus target element after click', async () => {
      element.href = '#test-main-content';
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      const target = document.getElementById('test-main-content') as HTMLElement;

      const focusSpy = vi.spyOn(target, 'focus');

      link.click();

      // Wait for the setTimeout in handleClick
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should add tabindex to target if not present', async () => {
      element.href = '#test-navigation';
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      const target = document.getElementById('test-navigation') as HTMLElement;

      expect(target.getAttribute('tabindex')).toBeNull();

      link.click();

      // Wait for the setTimeout in handleClick
      await new Promise((resolve) => setTimeout(resolve, 150));

      // USWDS skipnav sets tabindex="0" for focus, then changes to "-1" on blur
      // We're checking immediately after click, so it should be "0"
      expect(target.getAttribute('tabindex')).toBe('0');
    });

    it('should not modify existing tabindex', async () => {
      element.href = '#test-main-content';
      await waitForUpdate(element);

      const target = document.getElementById('test-main-content') as HTMLElement;
      target.setAttribute('tabindex', '0');

      const link = element.querySelector('a') as HTMLAnchorElement;
      link.click();

      // Wait for the setTimeout in handleClick
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(target.getAttribute('tabindex')).toBe('0');
    });

    it('should handle non-existent target gracefully', async () => {
      element.href = '#non-existent-target';
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLAnchorElement;

      // Should not throw an error
      expect(() => link.click()).not.toThrow();
    });
  });

  describe('Public API Methods', () => {
    it('should focus the skip link', async () => {
      await waitForUpdate(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      const focusSpy = vi.spyOn(link, 'focus');

      element.focus();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should handle focus when no link present', () => {
      // Remove the link element
      const link = element.querySelector('a');
      if (link) {
        link.remove();
      }

      // Should not throw an error
      expect(() => element.focus()).not.toThrow();
    });

    it('should set href via API', async () => {
      element.setHref('#api-target');
      await waitForUpdate(element);

      expect(element.href).toBe('#api-target');

      const link = element.querySelector('a');
      expect(link?.href).toContain('#api-target');
    });

    it('should set text via API', async () => {
      element.setText('API set text');
      await waitForUpdate(element);

      expect(element.text).toBe('API set text');

      const link = element.querySelector('a');
      expect(link?.textContent?.trim()).toBe('API set text');
    });

    it('should set multiple via API', async () => {
      element.setMultiple(true);
      await waitForUpdate(element);

      expect(element.multiple).toBe(true);

      const link = element.querySelector('a');
      expect(link?.classList.contains('usa-skipnav--multiple')).toBe(true);
    });

    it('should get target element', () => {
      // Create a test target
      const target = document.createElement('section');
      target.id = 'test-target';
      document.body.appendChild(target);

      element.href = '#test-target';

      const foundTarget = element.getTargetElement();
      expect(foundTarget).toBe(target);

      target.remove();
    });

    it('should return null for non-existent target', () => {
      element.href = '#does-not-exist';
      const foundTarget = element.getTargetElement();
      expect(foundTarget).toBeNull();
    });
  });

  describe('Complex Skip Link Scenarios', () => {
    it('should handle multiple skip links on same page', async () => {
      // Create second skip link
      const element2 = document.createElement('usa-skip-link') as USASkipLink;
      element2.href = '#sidebar';
      element2.text = 'Skip to sidebar';
      element2.multiple = true;
      document.body.appendChild(element2);

      // Create targets
      const main = document.createElement('main');
      main.id = 'test-main';
      const sidebar = document.createElement('aside');
      sidebar.id = 'sidebar';
      document.body.appendChild(main);
      document.body.appendChild(sidebar);

      await waitForUpdate(element);
      await waitForUpdate(element2);

      const link1 = element.querySelector('a');
      const link2 = element2.querySelector('a');

      expect(link1?.classList.contains('usa-skipnav--multiple')).toBe(false);
      expect(link2?.classList.contains('usa-skipnav--multiple')).toBe(true);

      // Clean up
      element2.remove();
      main.remove();
      sidebar.remove();
    });

    it('should handle rapid property changes', async () => {
      const changes = [
        { href: '#target1', text: 'Target 1' },
        { href: '#target2', text: 'Target 2' },
        { href: '#target3', text: 'Target 3' },
      ];

      for (const change of changes) {
        element.href = change.href;
        element.text = change.text;
        await waitForPropertyPropagation(element);

        const link = element.querySelector('a');
        expect(link?.href).toContain(change.href);
        expect(link?.textContent?.trim()).toBe(change.text);
      }
    });

    it('should maintain functionality after property reset', async () => {
      // Change properties
      element.href = '#custom';
      element.text = 'Custom text';
      element.multiple = true;
      await waitForUpdate(element);

      // Reset to defaults
      element.href = '#main-content';
      element.text = 'Skip to main content';
      element.multiple = false;
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link?.href).toContain('#main-content');
      expect(link?.textContent?.trim()).toBe('Skip to main content');
      expect(link?.classList.contains('usa-skipnav--multiple')).toBe(false);

      // Test event still works
      let eventFired = false;
      element.addEventListener('skip-link-click', () => {
        eventFired = true;
      });

      link?.click();
      expect(eventFired).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      await waitForUpdate(element);

      const link = element.querySelector('a') as HTMLAnchorElement;

      // Should be focusable
      link.focus();
      expect(document.activeElement).toBe(link);
    });

    it('should have proper ARIA semantics', async () => {
      await waitForUpdate(element);

      const link = element.querySelector('a');
      expect(link?.tagName).toBe('A');
      expect(link?.getAttribute('href')).toBeTruthy();
    });

    it('should work with screen readers', async () => {
      element.text = 'Skip to main content area';
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link?.textContent?.trim()).toBe('Skip to main content area');
      expect(link?.href).toBeTruthy();
    });

    it('should provide meaningful link text', async () => {
      const meaningfulTexts = [
        'Skip to main content',
        'Skip to navigation',
        'Skip to footer',
        'Jump to search',
      ];

      for (const text of meaningfulTexts) {
        element.text = text;
        await waitForPropertyPropagation(element);

        const link = element.querySelector('a');
        expect(link?.textContent?.trim()).toBe(text);
        expect(text.length).toBeGreaterThan(5); // Should be descriptive
      }
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work in complex page layouts', async () => {
      // Create a complex page structure
      const header = document.createElement('header');
      header.id = 'test-header';
      const nav = document.createElement('nav');
      nav.id = 'test-nav';
      const main = document.createElement('main');
      main.id = 'test-main';
      const footer = document.createElement('footer');
      footer.id = 'test-footer';

      document.body.append(header, nav, main, footer);

      // Test multiple targets
      const targets = ['#test-header', '#test-nav', '#test-main', '#test-footer'];

      for (const target of targets) {
        element.href = target;
        await waitForUpdate(element);

        const foundTarget = element.getTargetElement();
        expect(foundTarget?.id).toBe(target.substring(1));
      }

      // Clean up
      [header, nav, main, footer].forEach((el) => el.remove());
    });

    it('should handle dynamic content changes', async () => {
      // Create initial target
      let target = document.createElement('div') as HTMLDivElement;
      target.id = 'dynamic-content';
      document.body.appendChild(target);

      element.href = '#dynamic-content';
      await waitForUpdate(element);

      expect(element.getTargetElement()).toBe(target);

      // Remove and recreate target
      target.remove();
      target = document.createElement('section') as HTMLDivElement;
      target.id = 'dynamic-content';
      document.body.appendChild(target);

      expect(element.getTargetElement()).toBe(target);

      // Clean up
      target.remove();
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/skip-link/usa-skip-link.ts`;
        const validation = validateComponentJavaScript(componentPath, 'skip-link');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThanOrEqual(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed href values', async () => {
      const malformedHrefs = ['', '#', 'not-a-fragment', '###invalid'];

      for (const href of malformedHrefs) {
        element.href = href;
        await waitForPropertyPropagation(element);

        const link = element.querySelector('a');
        expect(() => link?.click()).not.toThrow();
      }
    });

    it('should handle empty or invalid text', async () => {
      const texts = ['', ' ', '\n\t', 'a'.repeat(200)];

      for (const text of texts) {
        element.text = text;
        await waitForPropertyPropagation(element);

        const link = element.querySelector('a');
        // The template may add whitespace, so we trim for comparison
        expect(link?.textContent?.trim()).toBe(text.trim());
      }
    });

    it('should work when target is dynamically removed', async () => {
      const target = document.createElement('div');
      target.id = 'temp-target';
      document.body.appendChild(target);

      element.href = '#temp-target';
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLAnchorElement;

      // Remove target before clicking
      target.remove();

      expect(() => link.click()).not.toThrow();
    });
  });
});
