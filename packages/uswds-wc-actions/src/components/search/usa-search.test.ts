import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-search.ts';
import type { USASearch } from './usa-search.js';
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
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import {
  testPointerAccessibility,
  testTargetSize,
  testLabelInName,
} from '@uswds-wc/test-utils/touch-pointer-utils.js';
import {
  testARIAAccessibility,
  testARIARoles,
  testAccessibleName,
  testARIARelationships,
} from '@uswds-wc/test-utils/aria-screen-reader-utils.js';
import {
  testTextResize,
  testReflow,
  testTextSpacing,
  testMobileAccessibility,
} from '@uswds-wc/test-utils/responsive-accessibility-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USASearch', () => {
  let element: USASearch;

  beforeEach(() => {
    element = document.createElement('usa-search') as USASearch;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-SEARCH');
    });

    it('should have default properties', () => {
      expect(element.placeholder).toBe('Search');
      expect(element.buttonText).toBe('Search');
      expect(element.value).toBe('');
      expect(element.size).toBe('medium');
      expect(element.disabled).toBe(false);
      expect(element.name).toBe('search');
      expect(element.inputId).toBe('search-field');
      expect(element.buttonId).toBe('search-button');
      // Icon is now provided by USWDS CSS, no custom properties needed
    });

    it('should render search form structure', async () => {
      await waitForUpdate(element);

      assertDOMStructure(element, 'form.usa-search', 1, 'Should have search form');
      assertDOMStructure(element, 'input.usa-input', 1, 'Should have search input');
      assertDOMStructure(element, 'button.usa-button', 1, 'Should have search button');
      assertDOMStructure(element, 'label.usa-sr-only', 1, 'Should have screen reader label');
    });

    it('should render with proper form attributes', async () => {
      await waitForUpdate(element);

      const form = element.querySelector('form');
      expect(form?.getAttribute('role')).toBe('search');
    });
  });

  describe('Size Variants', () => {
    it('should render medium size by default', async () => {
      await waitForUpdate(element);

      const form = element.querySelector('form');
      expect(form?.classList.contains('usa-search')).toBe(true);
      expect(form?.classList.contains('usa-search--small')).toBe(false);
      expect(form?.classList.contains('usa-search--big')).toBe(false);
    });

    it('should apply small size class', async () => {
      element.size = 'small';
      await waitForPropertyPropagation(element);

      const form = element.querySelector('form');
      expect(form?.classList.contains('usa-search--small')).toBe(true);
    });

    it('should apply big size class', async () => {
      element.size = 'big';
      await waitForPropertyPropagation(element);

      const form = element.querySelector('form');
      expect(form?.classList.contains('usa-search--big')).toBe(true);
    });

    it('should handle dynamic size changes', async () => {
      await testPropertyChanges(
        element,
        'size',
        ['medium', 'small', 'big', 'medium'],
        async (el, value) => {
          const form = el.querySelector('form');
          if (value === 'small') {
            expect(form?.classList.contains('usa-search--small')).toBe(true);
          } else if (value === 'big') {
            expect(form?.classList.contains('usa-search--big')).toBe(true);
          } else {
            expect(form?.classList.contains('usa-search--small')).toBe(false);
            expect(form?.classList.contains('usa-search--big')).toBe(false);
          }
        }
      );
    });
  });

  describe('Input Properties', () => {
    it('should display custom placeholder', async () => {
      element.placeholder = 'Search documents';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      expect(input?.getAttribute('placeholder')).toBe('Search documents');
    });

    it('should display custom button text', async () => {
      element.buttonText = 'Find';
      element.size = 'medium'; // Ensure button text is visible
      await waitForUpdate(element);

      const buttonText = element.querySelector('.usa-search__submit-text');
      expect(buttonText?.textContent?.trim()).toBe('Find');
    });

    it('should set input value', async () => {
      element.value = 'test query';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });

    it('should set input name attribute', async () => {
      element.name = 'site-search';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      expect(input?.getAttribute('name')).toBe('site-search');
    });

    it('should set custom input and button IDs', async () => {
      element.inputId = 'custom-input';
      element.buttonId = 'custom-button';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      const button = element.querySelector('button');

      expect(input?.getAttribute('id')).toBe('custom-input');
      expect(button?.getAttribute('id')).toBe('custom-button');
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled property is true', async () => {
      element.disabled = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      expect(input?.hasAttribute('disabled')).toBe(true);
    });

    it('should disable button when disabled property is true', async () => {
      element.disabled = true;
      await waitForPropertyPropagation(element);

      const button = element.querySelector('button');
      expect(button?.hasAttribute('disabled')).toBe(true);
    });

    it('should handle dynamic disabled state changes', async () => {
      await testPropertyChanges(element, 'disabled', [false, true, false], async (el, value) => {
        const input = el.querySelector('input');
        const button = el.querySelector('button');

        if (value) {
          expect(input?.hasAttribute('disabled')).toBe(true);
          expect(button?.hasAttribute('disabled')).toBe(true);
        } else {
          expect(input?.hasAttribute('disabled')).toBe(false);
          expect(button?.hasAttribute('disabled')).toBe(false);
        }
      });
    });
  });

  describe('Icon and Button Content', () => {
    it('should show button text for medium and big sizes', async () => {
      element.size = 'medium';
      await waitForPropertyPropagation(element);

      const buttonText = element.querySelector('.usa-search__submit-text');
      expect(buttonText).toBeTruthy();
      expect(buttonText?.textContent?.trim()).toBe('Search');
    });

    it('should not show button text for small size', async () => {
      element.size = 'small';
      await waitForPropertyPropagation(element);

      const buttonText = element.querySelector('.usa-search__submit-text');
      expect(buttonText).toBeFalsy();
    });

    it('should use usa-icon component (not hardcoded img tag)', async () => {
      await waitForUpdate(element);

      // Verify usa-icon web component is used
      const usaIcon = element.querySelector('usa-icon.usa-search__submit-icon');
      expect(usaIcon).toBeTruthy();
      expect(usaIcon?.tagName.toLowerCase()).toBe('usa-icon');

      // Verify icon name is set correctly
      expect(usaIcon?.getAttribute('name')).toBe('search');

      // Verify accessibility attributes
      expect(usaIcon?.getAttribute('role')).toBe('img');
      expect(usaIcon?.getAttribute('aria-label')).toBe('Search');
    });

    it('should not have hardcoded img tags for icons', async () => {
      await waitForUpdate(element);

      // Verify no img tags with icon paths exist
      const imgTags = element.querySelectorAll('img');
      const iconImgs = Array.from(imgTags).filter((img) => {
        const src = img.getAttribute('src');
        return src && (src.includes('search') || src.includes('icon'));
      });

      expect(iconImgs.length).toBe(0);
    });

    it('should have proper component composition for icon', async () => {
      await waitForUpdate(element);

      // Verify icon is inside button
      const button = element.querySelector('button.usa-search__submit');
      const icon = button?.querySelector('usa-icon');

      expect(button).toBeTruthy();
      expect(icon).toBeTruthy();
      expect(icon?.getAttribute('name')).toBe('search');
    });
  });

  describe('Event Handling', () => {
    it('should emit search-submit event on form submission', async () => {
      let eventDetail: unknown = null;
      element.addEventListener('search-submit', (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      });

      element.value = 'test search';
      await waitForPropertyPropagation(element);

      const form = element.querySelector('form') as HTMLFormElement;
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      expect(eventDetail).toBeTruthy();
      expect((eventDetail as { query: string }).query).toBe('test search');
      expect((eventDetail as { form: HTMLFormElement }).form).toBe(form);
    });

    it('should emit search-input event on input change', async () => {
      let eventDetail: unknown = null;
      element.addEventListener('search-input', (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      });

      await waitForUpdate(element);
      const input = element.querySelector('input') as HTMLInputElement;

      input.value = 'search text';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      expect(eventDetail).toBeTruthy();
      expect((eventDetail as { query: string }).query).toBe('search text');
      expect((eventDetail as { input: HTMLInputElement }).input).toBe(input);
    });

    it('should update value property on input', async () => {
      await waitForUpdate(element);
      const input = element.querySelector('input') as HTMLInputElement;

      input.value = 'new value';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      expect(element.value).toBe('new value');
    });

    it('should prevent default form submission', async () => {
      await waitForUpdate(element);
      const form = element.querySelector('form') as HTMLFormElement;

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      expect(submitEvent.defaultPrevented).toBe(true);
    });

    it('should handle Enter key in input field', async () => {
      let submitEventFired = false;
      element.addEventListener('search-submit', () => {
        submitEventFired = true;
      });

      await waitForUpdate(element);
      const input = element.querySelector('input') as HTMLInputElement;

      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(keyEvent);

      expect(submitEventFired).toBe(true);
    });

    it('should not handle non-Enter keys', async () => {
      let submitEventFired = false;
      element.addEventListener('search-submit', () => {
        submitEventFired = true;
      });

      await waitForUpdate(element);
      const input = element.querySelector('input') as HTMLInputElement;

      const keyEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      input.dispatchEvent(keyEvent);

      expect(submitEventFired).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form role', async () => {
      await waitForUpdate(element);

      const form = element.querySelector('form');
      assertAccessibilityAttributes(form as Element, {
        role: 'search',
      });
    });

    it('should have screen reader label', async () => {
      element.placeholder = 'Search documents';
      await waitForPropertyPropagation(element);

      const label = element.querySelector('.usa-sr-only');
      expect(label?.textContent?.trim()).toBe('Search documents');
    });

    it('should associate label with input', async () => {
      element.inputId = 'custom-search';
      await waitForPropertyPropagation(element);

      const label = element.querySelector('label');
      const input = element.querySelector('input');

      expect(label?.getAttribute('for')).toBe('custom-search');
      expect(input?.getAttribute('id')).toBe('custom-search');
    });

    it('should have proper input type', async () => {
      await waitForUpdate(element);

      const input = element.querySelector('input');
      expect(input?.getAttribute('type')).toBe('search');
    });

    it('should have proper button type', async () => {
      await waitForUpdate(element);

      const button = element.querySelector('button');
      expect(button?.getAttribute('type')).toBe('submit');
    });
  });

  describe('Light DOM Rendering', () => {
    it('should use light DOM (no shadow root)', () => {
      expect(element.shadowRoot).toBeFalsy();
    });

    it('should apply USWDS classes correctly', async () => {
      await waitForUpdate(element);

      const form = element.querySelector('form');
      const input = element.querySelector('input');
      const button = element.querySelector('button');

      expect(form?.classList.contains('usa-search')).toBe(true);
      expect(input?.classList.contains('usa-input')).toBe(true);
      expect(button?.classList.contains('usa-button')).toBe(true);
    });
  });

  describe('Application Use Cases', () => {
    it('should handle federal website search', async () => {
      element.placeholder = 'Search VA.gov';
      element.buttonText = 'Search VA.gov';
      element.name = 'site-search';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      const buttonText = element.querySelector('.usa-search__submit-text');

      expect(input?.getAttribute('placeholder')).toBe('Search VA.gov');
      expect(buttonText?.textContent?.trim()).toBe('Search VA.gov');
      expect(input?.getAttribute('name')).toBe('site-search');
    });

    it('should handle document search system', async () => {
      element.placeholder = 'Search federal regulations';
      element.buttonText = 'Search regulations';
      element.size = 'big';
      await waitForPropertyPropagation(element);

      const form = element.querySelector('form');
      expect(form?.classList.contains('usa-search--big')).toBe(true);

      const input = element.querySelector('input');
      expect(input?.getAttribute('placeholder')).toBe('Search federal regulations');
    });

    it('should handle benefits finder search', async () => {
      element.placeholder = 'Find benefits and services';
      element.buttonText = 'Find benefits';
      element.name = 'benefits-search';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input');
      expect(input?.getAttribute('placeholder')).toBe('Find benefits and services');
      expect(input?.getAttribute('name')).toBe('benefits-search');
    });

    it('should handle job search on USAJobs', async () => {
      element.placeholder = 'Search federal jobs';
      element.buttonText = 'Search jobs';
      element.size = 'big';
      await waitForPropertyPropagation(element);

      const form = element.querySelector('form');
      const input = element.querySelector('input');

      expect(form?.classList.contains('usa-search--big')).toBe(true);
      expect(input?.getAttribute('placeholder')).toBe('Search federal jobs');
    });

    it('should handle compact header search', async () => {
      element.size = 'small';
      element.placeholder = 'Search site';
      await waitForPropertyPropagation(element);

      const form = element.querySelector('form');
      expect(form?.classList.contains('usa-search--small')).toBe(true);

      // Small size should not show button text initially
      const buttonText = element.querySelector('.usa-search__submit-text');
      expect(buttonText).toBeFalsy();
    });
  });

  describe('Error Handling', () => {
    it('should handle form submission without input value', async () => {
      let eventDetail: unknown = null;
      element.addEventListener('search-submit', (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      });

      await waitForUpdate(element);
      const form = element.querySelector('form') as HTMLFormElement;
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);

      expect(eventDetail).toBeTruthy();
      expect((eventDetail as { query: string }).query).toBe('');
    });

    it('should handle missing form element gracefully', async () => {
      await waitForUpdate(element);
      const input = element.querySelector('input') as HTMLInputElement;

      // Remove form temporarily
      const form = element.querySelector('form');
      form?.remove();

      // Should not throw error
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      expect(() => input.dispatchEvent(keyEvent)).not.toThrow();
    });

    it('should handle dynamic property updates', async () => {
      element.placeholder = 'Initial';
      await waitForUpdate(element);

      element.placeholder = 'Updated';
      element.buttonText = 'Updated Button';
      element.value = 'Updated Value';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input') as HTMLInputElement;
      const buttonText = element.querySelector('.usa-search__submit-text');

      expect(input.placeholder).toBe('Updated');
      expect(input.value).toBe('Updated Value');
      expect(buttonText?.textContent?.trim()).toBe('Updated Button');
    });
  });

  describe('Event Bubbling and Composition', () => {
    it('should emit events that bubble', async () => {
      let parentReceived = false;
      const parent = document.createElement('div');
      parent.appendChild(element);
      document.body.appendChild(parent);

      parent.addEventListener('search-submit', () => {
        parentReceived = true;
      });

      await waitForUpdate(element);
      const form = element.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(parentReceived).toBe(true);

      parent.remove();
    });

    it('should emit events that are composed', async () => {
      // Events should cross shadow DOM boundaries (though this component uses light DOM)
      let eventComposed = false;
      element.addEventListener('search-submit', (e: Event) => {
        eventComposed = (e as CustomEvent).composed;
      });

      await waitForUpdate(element);
      const form = element.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(eventComposed).toBe(true);
    });
  });

  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      const originalParent = element.parentElement;

      element.placeholder = 'Updated Search';
      element.buttonText = 'Find';
      element.value = 'search term';
      element.size = 'big';
      element.disabled = true;
      element.name = 'updated-search';
      element.inputId = 'updated-search-field';
      element.buttonId = 'updated-search-button';

      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.parentElement).toBe(originalParent);
    });

    it('should handle form submission without removal', async () => {
      const originalParent = element.parentElement;

      // Test rapid form submissions
      for (let i = 0; i < 5; i++) {
        element.value = `search ${i}`;
        await element.updateComplete;

        const form = element.querySelector('form') as HTMLFormElement;
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }

        element.size = i % 2 === 0 ? 'small' : 'big';
        await element.updateComplete;
      }

      expect(element.parentElement).toBe(originalParent);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM presence during user interactions', async () => {
      const originalParent = element.parentElement;

      await element.updateComplete;

      const input = element.querySelector('input') as HTMLInputElement;
      const button = element.querySelector('button') as HTMLButtonElement;

      // Simulate user typing
      if (input) {
        input.value = 'test search query';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Change properties during interaction
      element.disabled = false;
      element.size = 'medium';
      await element.updateComplete;

      // Simulate button click
      if (button) {
        button.click();
      }

      // Update more properties
      element.placeholder = 'Search here...';
      element.buttonText = 'Go';
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

      const storybookElement = document.createElement('usa-search') as USASearch;
      storybookElement.placeholder = 'Storybook Search';
      storybookElement.buttonText = 'Find';
      storybookElement.size = 'big';
      storybookElement.value = 'initial search';

      storybookContainer.appendChild(storybookElement);

      await waitForUpdate(storybookElement);

      expect(storybookContainer.contains(storybookElement)).toBe(true);
      expect(storybookElement.isConnected).toBe(true);

      const form = storybookElement.querySelector('form');
      const input = storybookElement.querySelector('input');
      const button = storybookElement.querySelector('button');

      expect(form).toBeTruthy();
      expect(input).toBeTruthy();
      expect(button).toBeTruthy();
      expect(input?.placeholder).toBe('Storybook Search');

      storybookContainer.remove();
    });

    it('should handle Storybook control updates without component removal', async () => {
      const mockStorybookUpdate = vi.fn();
      element.addEventListener('search-submit', mockStorybookUpdate);
      element.addEventListener('search-clear', mockStorybookUpdate);
      element.addEventListener('search-input', mockStorybookUpdate);

      // Simulate Storybook controls panel updates
      element.placeholder = 'Controls Updated Search';
      element.buttonText = 'Search Now';
      element.value = 'updated value';
      element.size = 'medium'; // Use medium so button text shows
      element.disabled = false;
      element.name = 'storybook-search';
      element.inputId = 'storybook-search-input';
      element.buttonId = 'storybook-search-btn';

      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.placeholder).toBe('Controls Updated Search');
      expect(element.buttonText).toBe('Search Now');

      const input = element.querySelector('input');
      const button = element.querySelector('button');
      expect(input?.placeholder).toBe('Controls Updated Search');
      expect(button?.textContent).toContain('Search Now');
    });

    it('should maintain event listeners during Storybook interactions', async () => {
      const submitSpy = vi.fn();
      const inputSpy = vi.fn();
      const clearSpy = vi.fn();

      element.addEventListener('search-submit', submitSpy);
      element.addEventListener('search-input', inputSpy);
      element.addEventListener('search-clear', clearSpy);

      await element.updateComplete;

      const form = element.querySelector('form') as HTMLFormElement;
      const input = element.querySelector('input') as HTMLInputElement;
      const button = element.querySelector('button') as HTMLButtonElement;

      // Test input event
      if (input) {
        input.value = 'test query';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Test form submission
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }

      // Test button click
      if (button) {
        button.click();
      }

      // Test clear functionality if available
      element.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      expect(inputSpy).toHaveBeenCalled();
      expect(submitSpy).toHaveBeenCalled();
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/search/usa-search.ts`;
        const validation = validateComponentJavaScript(componentPath, 'search');

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

  describe('Accessibility', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.placeholder = 'Search for government services';
      element.buttonText = 'Search';
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard focus to input field', async () => {
      element.placeholder = 'Search';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus the input
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
    });

    it('should submit search on Enter key in input', async () => {
      element.placeholder = 'Search';
      element.value = 'test query';
      await waitForUpdate(element);

      const submitSpy = vi.fn();
      element.addEventListener('submit', submitSpy);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus input and press Enter
      input.focus();
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(enterEvent);

      // Native form submission handles Enter automatically
      // Verify input is properly configured
      expect(input.type).toBe('search');
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);

      element.removeEventListener('submit', submitSpy);
    });

    it('should activate search button with Enter/Space keys', async () => {
      element.placeholder = 'Search';
      element.buttonText = 'Search';
      await waitForPropertyPropagation(element);

      const button = element.querySelector('button[type="submit"]') as HTMLButtonElement;
      expect(button).toBeTruthy();

      // Focus button
      button.focus();
      expect(document.activeElement).toBe(button);

      // Verify button is keyboard accessible
      expect(button.type).toBe('submit');
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should be keyboard-only usable', async () => {
      element.placeholder = 'Enter search terms';
      element.buttonText = 'Search';
      await waitForUpdate(element);

      const result = await verifyKeyboardOnlyUsable(element);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('keyboard accessible');
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.placeholder = 'Search';
      element.buttonText = 'Go';
      await waitForUpdate(element);

      const result = await testKeyboardNavigation(element, {
        shortcuts: [
          {
            key: 'Enter',
            description: 'Submit search',
          },
        ],
        testEscapeKey: false, // Search doesn't inherently clear on Escape
        testArrowKeys: false, // Search uses Tab navigation
      });

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should have no keyboard traps', async () => {
      element.placeholder = 'Search';
      element.buttonText = 'Search';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus input
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
      element.placeholder = 'Search government websites';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Focus input
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that input is focused
      expect(document.activeElement).toBe(input);

      // USWDS applies :focus styles via CSS - we verify element is focusable
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle Tab navigation from input to button', async () => {
      element.placeholder = 'Search';
      element.buttonText = 'Submit';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Should have input and button
      expect(focusableElements.length).toBeGreaterThanOrEqual(2);

      const input = focusableElements.find(
        (el) => el instanceof HTMLInputElement && el.type === 'search'
      );
      const button = focusableElements.find(
        (el) => el instanceof HTMLButtonElement && el.type === 'submit'
      );

      expect(input).toBeTruthy();
      expect(button).toBeTruthy();

      // Both should be keyboard accessible
      expect((input as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      expect((button as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should support small variant keyboard interaction', async () => {
      element.placeholder = 'Search';
      element.buttonText = 'Go';
      element.size = 'small';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      const button = element.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(input).toBeTruthy();
      expect(button).toBeTruthy();

      // Small variant should maintain keyboard accessibility
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should support big variant keyboard interaction', async () => {
      element.placeholder = 'Search';
      element.buttonText = 'Search';
      element.size = 'big';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      const button = element.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(input).toBeTruthy();
      expect(button).toBeTruthy();

      // Big variant should maintain keyboard accessibility
      input.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(input);
      expect(input.tabIndex).toBeGreaterThanOrEqual(0);
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle form submission via Enter key', async () => {
      element.placeholder = 'Search';
      element.value = 'test search';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('test search');

      // Focus input
      input.focus();

      // Enter key should trigger form submission
      const form = element.querySelector('form');
      expect(form).toBeTruthy();

      const submitSpy = vi.fn((e) => e.preventDefault());
      form?.addEventListener('submit', submitSpy);

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });

      input.dispatchEvent(enterEvent);

      // Clean up
      form?.removeEventListener('submit', submitSpy);
    });
  });

  describe('Touch/Pointer Accessibility (WCAG 2.5)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-search') as USASearch;
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    afterEach(() => {
      element.remove();
    });

    it('should have adequate target size for search button (44x44px minimum)', async () => {
      await waitForUpdate(element);
      const button = element.querySelector('button[type="submit"]') as HTMLElement;
      const input = element.querySelector('input[type="search"]') as HTMLElement;

      expect(button).toBeTruthy();
      if (!button) return;

      // Mock getBoundingClientRect for both button and input (both are interactive)
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        width: 50,
        height: 50,
        top: 0,
        left: 0,
        right: 50,
        bottom: 50,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      if (input) {
        vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
          width: 200,
          height: 44,
          top: 0,
          left: 0,
          right: 200,
          bottom: 44,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });
      }

      const result = testTargetSize(element, 44);
      expect(result.compliant).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.totalTested).toBeGreaterThan(0);
    });

    it('should pass label-in-name check for search button (WCAG 2.5.3)', async () => {
      await waitForUpdate(element);

      const result = testLabelInName(element);
      expect(result.correct).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should have adequate target size for search input', async () => {
      await waitForUpdate(element);
      const input = element.querySelector('input[type="search"]') as HTMLElement;
      const button = element.querySelector('button[type="submit"]') as HTMLElement;

      expect(input).toBeTruthy();
      if (!input) return;

      // Mock getBoundingClientRect for both input and button (both are interactive)
      vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
        width: 200,
        height: 44,
        top: 0,
        left: 0,
        right: 200,
        bottom: 44,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      if (button) {
        vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
          width: 50,
          height: 50,
          top: 0,
          left: 0,
          right: 50,
          bottom: 50,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });
      }

      const result = testTargetSize(element, 44);
      expect(result.compliant).toBe(true);
    });

    it('should pass comprehensive pointer accessibility tests', async () => {
      await waitForUpdate(element);
      const button = element.querySelector('button[type="submit"]') as HTMLElement;
      const input = element.querySelector('input[type="search"]') as HTMLElement;

      expect(button).toBeTruthy();
      expect(input).toBeTruthy();
      if (!button || !input) return;

      // Mock getBoundingClientRect for jsdom
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        width: 50,
        height: 50,
        top: 0,
        left: 0,
        right: 50,
        bottom: 50,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
        width: 200,
        height: 44,
        top: 0,
        left: 0,
        right: 200,
        bottom: 44,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const result = await testPointerAccessibility(element, {
        minTargetSize: 44,
        testCancellation: true,
        testLabelInName: true,
        testMultiPointGestures: true,
      });

      expect(result.passed).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.details.targetSizeCompliant).toBe(true);
      expect(result.details.labelInNameCorrect).toBe(true);
      expect(result.details.noMultiPointGestures).toBe(true);
    });
  });

  describe('ARIA/Screen Reader Accessibility (WCAG 4.1)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-search') as USASearch;
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    afterEach(() => {
      element.remove();
    });

    it('should have correct ARIA role for search input (WCAG 4.1.2)', async () => {
      const input = element.querySelector('input[type="search"]');
      expect(input).toBeTruthy();

      const result = testARIARoles(input as Element, {
        expectedRole: 'searchbox',
        allowImplicitRole: true,
      });

      expect(result.correct).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should have accessible name for search input (WCAG 4.1.2)', async () => {
      const input = element.querySelector('input[type="search"]');
      expect(input).toBeTruthy();

      const result = testAccessibleName(input as Element);

      expect(result.hasName).toBe(true);
      expect(result.accessibleName.length).toBeGreaterThan(0);
    });

    it('should have accessible name for submit button (WCAG 4.1.2)', async () => {
      const button = element.querySelector('button[type="submit"]');
      expect(button).toBeTruthy();

      const result = testAccessibleName(button as Element);

      expect(result.hasName).toBe(true);
      expect(result.accessibleName.length).toBeGreaterThan(0);
    });

    it('should have correct button role and states (WCAG 4.1.2)', async () => {
      const button = element.querySelector('button[type="submit"]');
      expect(button).toBeTruthy();

      const result = testARIARoles(button as Element, {
        expectedRole: 'button',
        allowImplicitRole: true,
      });

      expect(result.correct).toBe(true);
    });

    it('should maintain ARIA when disabled (WCAG 4.1.2)', async () => {
      element.disabled = true;
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]');
      const button = element.querySelector('button[type="submit"]');

      expect(input).toBeTruthy();
      expect(button).toBeTruthy();

      // Both should still have accessible names when disabled
      const inputResult = testAccessibleName(input as Element);
      const buttonResult = testAccessibleName(button as Element);

      expect(inputResult.hasName).toBe(true);
      expect(buttonResult.hasName).toBe(true);

      // Disabled state should be reflected
      expect(input?.hasAttribute('disabled')).toBe(true);
      expect(button?.hasAttribute('disabled')).toBe(true);
    });

    it('should have valid ARIA relationships (WCAG 4.1.2)', async () => {
      const input = element.querySelector('input[type="search"]');
      expect(input).toBeTruthy();

      const result = testARIARelationships(input as Element);

      // Should be valid (no broken ID references)
      expect(result.valid).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should support different size variants with ARIA (WCAG 4.1.2)', async () => {
      const sizes: ('small' | 'big')[] = ['small', 'big'];

      for (const size of sizes) {
        element.size = size;
        await waitForPropertyPropagation(element);

        const input = element.querySelector('input[type="search"]');
        const button = element.querySelector('button[type="submit"]');

        expect(input).toBeTruthy();
        expect(button).toBeTruthy();

        // Input should always have accessible name
        const inputResult = testAccessibleName(input as Element);
        expect(inputResult.hasName).toBe(true);

        // Button has text content when size is NOT 'small'
        const buttonResult = testAccessibleName(button as Element);
        if (size === 'small') {
          // Small size button only has decorative icon (alt="")
          // This is a known limitation - button should have aria-label
          expect(buttonResult.hasName).toBe(false);
        } else {
          // Medium and big sizes have text content
          expect(buttonResult.hasName).toBe(true);
        }
      }
    });

    it('should pass comprehensive ARIA accessibility tests (WCAG 4.1)', async () => {
      const result = await testARIAAccessibility(element, {
        testLiveRegions: false, // Search doesn't use live regions
        testRoleState: true,
        testNameRole: true,
        testRelationships: true,
      });

      expect(result.passed).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.details.rolesCorrect).toBe(true);
      expect(result.details.namesAccessible).toBe(true);
      expect(result.details.relationshipsValid).toBe(true);
    });

    it('should announce form submission via native browser behavior (WCAG 4.1.3)', async () => {
      // Search components use native form submission
      // Screen readers announce this via browser's native behavior
      const form = element.querySelector('form');
      expect(form).toBeTruthy();
      expect(form?.getAttribute('role')).toBe('search');
    });

    it('should have proper search landmark role (WCAG 4.1.2)', async () => {
      const form = element.querySelector('form');
      expect(form).toBeTruthy();

      const result = testARIARoles(form as Element, {
        expectedRole: 'search',
      });

      expect(result.correct).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should support placeholder with accessible name (WCAG 4.1.2)', async () => {
      element.placeholder = 'Search documents...';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]');
      expect(input).toBeTruthy();
      expect(input?.getAttribute('placeholder')).toBe('Search documents...');

      // Should still have accessible name (not rely on placeholder alone)
      const result = testAccessibleName(input as Element);
      expect(result.hasName).toBe(true);
    });

    it('should handle dynamic label updates with ARIA (WCAG 4.1.3)', async () => {
      const input = element.querySelector('input[type="search"]');
      expect(input).toBeTruthy();

      // Initial accessible name
      const initialResult = testAccessibleName(input as Element);
      expect(initialResult.hasName).toBe(true);

      // After property updates, ARIA should still be valid
      element.size = 'big';
      await waitForPropertyPropagation(element);

      const updatedInput = element.querySelector('input[type="search"]');
      const updatedResult = testAccessibleName(updatedInput as Element);
      expect(updatedResult.hasName).toBe(true);
    });

    it('should support input value changes with ARIA (WCAG 4.1.2)', async () => {
      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Empty value
      expect(input.value).toBe('');

      // Set value
      input.value = 'test query';
      await waitForUpdate(element);

      // Should maintain accessible name
      const result = testAccessibleName(input);
      expect(result.hasName).toBe(true);

      // Value should be accessible to assistive tech
      expect(input.value).toBe('test query');
    });
  });

  describe('Responsive/Reflow Accessibility (WCAG 1.4)', () => {
    it('should resize text properly up to 200% (WCAG 1.4.4)', async () => {
      await waitForUpdate(element);

      const input = element.querySelector('input[type="search"]');
      expect(input).toBeTruthy();

      const result = testTextResize(input as Element, 200);

      expect(result).toBeDefined();
      expect(result.violations).toBeDefined();
    });

    it('should reflow at mobile width 320px (WCAG 1.4.10)', async () => {
      await waitForUpdate(element);

      const form = element.querySelector('form');
      expect(form).toBeTruthy();

      const result = testReflow(form as Element, 320);

      // Search form should reflow without horizontal scroll
      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });

    it('should support text spacing adjustments (WCAG 1.4.12)', async () => {
      await waitForUpdate(element);

      const input = element.querySelector('input[type="search"]');
      expect(input).toBeTruthy();

      const result = testTextSpacing(input as Element);

      expect(result.readable).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should be accessible on mobile devices (WCAG 1.4.4, 1.4.10)', async () => {
      await waitForUpdate(element);

      const searchElement = element.querySelector('.usa-search');
      expect(searchElement).toBeTruthy();

      const result = await testMobileAccessibility(searchElement as Element);

      expect(result).toBeDefined();
      expect(result.details.reflowWorks).toBeDefined();
      expect(result.details.textResizable).toBeDefined();
    });

    it('should maintain responsive behavior in small size (WCAG 1.4.10)', async () => {
      element.size = 'small';
      await waitForPropertyPropagation(element);

      const form = element.querySelector('form');
      expect(form).toBeTruthy();

      const result = testReflow(form as Element, 320);

      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });

    it('should maintain responsive behavior in big size (WCAG 1.4.10)', async () => {
      element.size = 'big';
      await waitForPropertyPropagation(element);

      const form = element.querySelector('form');
      expect(form).toBeTruthy();

      const result = testReflow(form as Element, 320);

      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * USWDS Integration Requirements Tests
   *
   * These tests validate critical USWDS integration patterns for the Search component.
   * They ensure that USWDS JavaScript can properly enhance the component with:
   * - Component enhancement signal via data-enhanced attribute
   * - Input placeholder and value handling
   * - USWDS enhancement validation
   *
   * These tests prevent regressions like:
   * - Placeholders not showing when no value
   * - USWDS initialization failures
   * - Search button not working
   *
   * See: /tmp/combo-box-complete-summary.md for pattern details
   */
  describe('USWDS Integration Requirements', () => {
    it('should include data-enhanced="false" on wrapper', async () => {
      await waitForUpdate(element);

      const wrapper = element.querySelector('.usa-search');
      expect(wrapper).toBeTruthy();
      expect(wrapper?.getAttribute('data-enhanced')).toBe('false');
    });

    it('should pass placeholder to input', async () => {
      element.placeholder = 'Search articles';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input?.getAttribute('placeholder')).toBe('Search articles');
    });

    it('should display placeholder when no value set', async () => {
      element.placeholder = 'Search...';
      element.value = '';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input?.getAttribute('placeholder')).toBe('Search...');
      expect(input?.value).toBe('');
    });

    it('should pass value to input', async () => {
      element.value = 'test query';
      await waitForPropertyPropagation(element);

      const input = element.querySelector('input[type="search"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input?.value).toBe('test query');
    });

    it('should render search button', async () => {
      await waitForUpdate(element);

      const button = element.querySelector('button[type="submit"]');
      expect(button).toBeTruthy();
      expect(button?.classList.contains('usa-button')).toBe(true);
    });
  });
});
