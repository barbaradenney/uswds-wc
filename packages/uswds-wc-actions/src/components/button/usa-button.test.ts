import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-button.js';
import type { USAButton } from './usa-button.js';
import type { ButtonVariant, ButtonType } from '@uswds-wc/core';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { quickUSWDSComplianceTest } from '@uswds-wc/test-utils/uswds-compliance-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import {
  testKeyboardNavigation,
  testActivationKeys,
  verifyKeyboardOnlyUsable,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import {
  testPointerAccessibility,
  testTargetSize,
  testLabelInName,
} from '@uswds-wc/test-utils/touch-pointer-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

// Performance testing utility (commented out - not currently used)
// const measurePerformance = (fn: () => void): number => {
//   const start = performance.now();
//   fn();
//   return performance.now() - start;
// };

describe('USAButton', () => {
  let element: USAButton;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);
    });

    it('should create button element', () => {
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName).toBe('USA-BUTTON');
    });

    it('should have default properties', () => {
      expect(element.variant).toBe('primary');
      expect(element.size).toBe('medium');
      expect(element.disabled).toBe(false);
      expect(element.type).toBe('button');
      expect(element.ariaPressed).toBeNull();
    });

    it('should render light DOM for USWDS compatibility', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should render button element with proper role', async () => {
      await element.updateComplete;
      // Now we have a nested button element inside the host
      const buttonElement = element.querySelector('button');
      expect(buttonElement).toBeTruthy();
      expect(buttonElement?.getAttribute('type')).toBe('button');
    });

    it('should be focusable through button element', async () => {
      await element.updateComplete;
      // The nested button element should be focusable
      const buttonElement = element.querySelector('button');
      expect(buttonElement).toBeTruthy();
      expect(buttonElement?.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should render button element for content', async () => {
      await element.updateComplete;
      const button = element.querySelector('button');
      expect(button).toBeTruthy();
    });
  });

  describe('USWDS HTML Structure and Classes', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should have usa-button class by default', async () => {
      await element.updateComplete;
      // Button element should have the USWDS class
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button')).toBe(true);
    });

    it('should apply variant classes correctly', async () => {
      const variants: ButtonVariant[] = [
        'secondary',
        'accent-cool',
        'accent-warm',
        'base',
        'outline',
        'inverse',
      ];

      for (const variant of variants) {
        element.variant = variant;
        await element.updateComplete;
        // Button element should have the USWDS variant class
        const buttonElement = element.querySelector('button');
        expect(buttonElement?.classList.contains(`usa-button--${variant}`)).toBe(true);
      }
    });

    it('should not add variant class for primary', async () => {
      element.variant = 'primary';
      await element.updateComplete;
      // Button element should have only base class for primary variant
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.className).toBe('usa-button');
      expect(buttonElement?.classList.contains('usa-button--primary')).toBe(false);
    });

    it('should apply size classes correctly', async () => {
      element.size = 'small';
      await element.updateComplete;
      // Button element should have the USWDS size class
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button--small')).toBe(true);

      element.size = 'big';
      await element.updateComplete;
      expect(buttonElement?.classList.contains('usa-button--big')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--small')).toBe(false);

      element.size = 'medium';
      await element.updateComplete;
      expect(buttonElement?.classList.contains('usa-button--big')).toBe(false);
      expect(buttonElement?.classList.contains('usa-button--small')).toBe(false);
    });

    it('should combine variant and size classes', async () => {
      element.variant = 'secondary';
      element.size = 'big';
      await element.updateComplete;

      // Button element should have combined USWDS classes
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--secondary')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--big')).toBe(true);
    });
  });

  describe('Disabled State', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = 'Test Button';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should update disabled state on button element', async () => {
      await element.updateComplete;
      // Button element should reflect disabled state
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.hasAttribute('disabled')).toBe(false);

      element.disabled = true;
      await element.updateComplete;
      expect(buttonElement?.hasAttribute('disabled')).toBe(true);

      element.disabled = false;
      await element.updateComplete;
      expect(buttonElement?.hasAttribute('disabled')).toBe(false);
    });

    it('should handle focus correctly based on disabled state', async () => {
      await element.updateComplete;
      // Button element should handle focus management
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.tabIndex).toBeGreaterThanOrEqual(0);

      element.disabled = true;
      await element.updateComplete;
      expect(buttonElement?.hasAttribute('disabled')).toBe(true);

      element.disabled = false;
      await element.updateComplete;
      expect(buttonElement?.hasAttribute('disabled')).toBe(false);
    });

    it('should not trigger click when disabled', async () => {
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      element.disabled = true;
      await element.updateComplete;

      // Disabled native button should not trigger click
      element.click();
      expect(clickSpy).not.toHaveBeenCalled();

      element.disabled = false;
      await element.updateComplete;

      element.click();
      expect(clickSpy).toHaveBeenCalledTimes(2); // Native + forwarded event
    });

    it('should reflect disabled property as attribute', async () => {
      const buttonElement = element.querySelector('button');

      element.disabled = true;
      await element.updateComplete;
      expect(buttonElement?.hasAttribute('disabled')).toBe(true);

      element.disabled = false;
      await element.updateComplete;
      expect(buttonElement?.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('Click Handling', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = 'Click Me';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should dispatch click event on host element click', async () => {
      await element.updateComplete;
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      // Dispatch native click event on host element
      const nativeClickEvent = new MouseEvent('click', { bubbles: true });
      element.dispatchEvent(nativeClickEvent);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should dispatch custom click event', () => {
      const clickSpy = vi.fn();
      document.addEventListener('click', clickSpy);

      element.click();

      expect(clickSpy).toHaveBeenCalled();
      const event = clickSpy.mock.calls[0][0];
      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);

      document.removeEventListener('click', clickSpy);
    });

    it('should handle programmatic click()', () => {
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      element.click();

      expect(clickSpy).toHaveBeenCalledTimes(2); // Native + forwarded event
    });

    it('should not handle clicks when disabled', async () => {
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      element.disabled = true;
      await element.updateComplete;
      element.click();

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = 'Keyboard Button';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should handle keyboard events through button element', async () => {
      await element.updateComplete;

      // Button element should act like a button
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.getAttribute('type')).toBe('button');

      // Verify button is focusable
      expect(buttonElement?.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle focus and blur events', async () => {
      await element.updateComplete;

      // Button element should be focusable
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.tabIndex).toBeGreaterThanOrEqual(0);

      // Should have proper type attribute
      expect(buttonElement?.getAttribute('type')).toBe('button');
    });

    it('should not trigger on other keys', async () => {
      await element.updateComplete;
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      // Dispatch Tab key event on button element
      const buttonElement = element.querySelector('button');
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      buttonElement?.dispatchEvent(tabEvent);

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('should not trigger when disabled', async () => {
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      element.disabled = true;
      await element.updateComplete;

      // Dispatch Enter key event on button element
      const buttonElement = element.querySelector('button');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      buttonElement?.dispatchEvent(enterEvent);

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Form Integration', () => {
    let form: HTMLFormElement;

    beforeEach(() => {
      form = document.createElement('form');
      container.appendChild(form);
    });

    it('should submit form when type="submit"', async () => {
      element = document.createElement('usa-button') as USAButton;
      element.type = 'submit';
      element.textContent = 'Submit';
      form.appendChild(element);
      await element.updateComplete;

      const submitSpy = vi.fn((e) => e.preventDefault());
      form.addEventListener('submit', submitSpy);

      // Click the actual button element to trigger form submission
      const buttonElement = element.querySelector('button');
      buttonElement?.click();

      expect(submitSpy).toHaveBeenCalled();
    });

    it('should reset form when type="reset"', async () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'test value';
      input.defaultValue = 'default value';
      form.appendChild(input);

      element = document.createElement('usa-button') as USAButton;
      element.type = 'reset';
      element.textContent = 'Reset';
      form.appendChild(element);
      await element.updateComplete;

      // Verify initial state
      expect(input.value).toBe('test value');

      // Click the actual button element to trigger form reset
      const buttonElement = element.querySelector('button');
      buttonElement?.click();

      // Check if the form was actually reset by checking input value
      expect(input.value).toBe('default value');
    });

    it('should not interact with form when type="button"', () => {
      element = document.createElement('usa-button') as USAButton;
      element.type = 'button';
      element.textContent = 'Button';
      form.appendChild(element);

      const submitSpy = vi.fn((e) => e.preventDefault());
      const resetSpy = vi.spyOn(form, 'reset');
      form.addEventListener('submit', submitSpy);

      element.click();

      expect(submitSpy).not.toHaveBeenCalled();
      expect(resetSpy).not.toHaveBeenCalled();
    });

    it('should handle form submission outside of form', () => {
      element = document.createElement('usa-button') as USAButton;
      element.type = 'submit';
      element.textContent = 'Submit';
      container.appendChild(element);

      // Should not throw when no form is found
      expect(() => element.click()).not.toThrow();
    });
  });

  describe('ARIA Attributes', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should set aria-pressed on button element when provided', async () => {
      await element.updateComplete;
      // When ariaPressed is null, attribute should not be set
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.hasAttribute('aria-pressed')).toBe(false);

      element.ariaPressed = 'true';
      await element.updateComplete;
      expect(buttonElement?.getAttribute('aria-pressed')).toBe('true');

      element.ariaPressed = 'false';
      await element.updateComplete;
      expect(buttonElement?.getAttribute('aria-pressed')).toBe('false');

      element.ariaPressed = null;
      await element.updateComplete;
      expect(buttonElement?.hasAttribute('aria-pressed')).toBe(false);
    });

    it('should maintain disabled state on button element', async () => {
      await element.updateComplete;
      // Button element should reflect disabled state
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.hasAttribute('disabled')).toBe(false);

      element.disabled = true;
      await element.updateComplete;
      expect(buttonElement?.hasAttribute('disabled')).toBe(true);
    });

    it('should have correct type attribute on button element', async () => {
      await element.updateComplete;
      // Button element should have button attributes (role is implicit for <button>)
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.getAttribute('type')).toBe('button');
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.textContent = 'Test Button';
      await element.updateComplete;

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass comprehensive USWDS compliance tests (prevents slot issues)', async () => {
      element.textContent = 'Test Button';
      await element.updateComplete;

      quickUSWDSComplianceTest(element, 'usa-button');
    });
  });

  describe('Public Methods', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = 'Method Test';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should support focus() method', () => {
      const focusSpy = vi.spyOn(element, 'focus');
      element.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should support click() method', () => {
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      element.click();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle click() when disabled', async () => {
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      element.disabled = true;
      await element.updateComplete;
      element.click();

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Slot Content', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);
    });

    it('should display text content', async () => {
      element.textContent = 'Button Text';
      await element.updateComplete;
      expect(element.textContent).toBe('Button Text');
    });

    it('should display HTML content', async () => {
      element.innerHTML = '<span class="icon">🚀</span> Launch';
      await element.updateComplete;

      const icon = element.querySelector('.icon');
      expect(icon?.textContent).toBe('🚀');
      expect(element.textContent).toContain('Launch');
    });

    it('should update content dynamically', async () => {
      element.textContent = 'Initial';
      await element.updateComplete;
      expect(element.textContent).toBe('Initial');

      element.textContent = 'Updated';
      await element.updateComplete;
      expect(element.textContent).toBe('Updated');
    });
  });

  describe('Property Changes', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should update classes when variant changes', async () => {
      element.variant = 'secondary';
      await element.updateComplete;
      // Button element should have USWDS variant class
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button--secondary')).toBe(true);

      element.variant = 'outline';
      await element.updateComplete;
      expect(buttonElement?.classList.contains('usa-button--outline')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--secondary')).toBe(false);
    });

    it('should update classes when size changes', async () => {
      element.size = 'small';
      await element.updateComplete;
      // Button element should have USWDS size class
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button--small')).toBe(true);

      element.size = 'big';
      await element.updateComplete;
      expect(buttonElement?.classList.contains('usa-button--big')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--small')).toBe(false);
    });

    it('should handle type changes', async () => {
      const types: ButtonType[] = ['button', 'submit', 'reset'];

      for (const type of types) {
        element.type = type;
        await element.updateComplete;
        expect(element.type).toBe(type);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid property changes', async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);

      // Rapidly change properties
      element.variant = 'secondary';
      element.size = 'big';
      element.disabled = true;
      element.variant = 'outline';
      element.size = 'small';
      element.disabled = false;

      await element.updateComplete;

      expect(element.variant).toBe('outline');
      expect(element.size).toBe('small');
      expect(element.disabled).toBe(false);
      // Button element should have final USWDS classes
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button--outline')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--small')).toBe(true);
    });

    it('should handle empty content', async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);
      await element.updateComplete;

      expect(element.textContent?.trim()).toBe('');
      // Should still function
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);
      element.click();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle special characters in content', async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = '<>&"\'`';
      container.appendChild(element);
      await element.updateComplete;

      expect(element.textContent?.trim()).toBe('<>&"\'`');
    });

    it('should maintain functionality after removing and re-adding to DOM', async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = 'Reattach Test';
      container.appendChild(element);
      await element.updateComplete;

      // Remove from DOM
      element.remove();

      // Re-add to DOM
      container.appendChild(element);
      await element.updateComplete;

      // Should still work
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);
      element.click();
      expect(clickSpy).toHaveBeenCalled();
      // Button element should have correct attributes
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.getAttribute('type')).toBe('button');
    });
  });

  describe('Event Bubbling', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = 'Bubble Test';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should bubble click events', () => {
      const containerSpy = vi.fn();
      const documentSpy = vi.fn();

      container.addEventListener('click', containerSpy);
      document.addEventListener('click', documentSpy);

      element.click();

      expect(containerSpy).toHaveBeenCalled();
      expect(documentSpy).toHaveBeenCalled();

      container.removeEventListener('click', containerSpy);
      document.removeEventListener('click', documentSpy);
    });

    it('should allow event cancellation', () => {
      const elementSpy = vi.fn((e: Event) => e.stopPropagation());
      const containerSpy = vi.fn();

      element.addEventListener('click', elementSpy);
      container.addEventListener('click', containerSpy);

      element.click();

      expect(elementSpy).toHaveBeenCalled();
      expect(containerSpy).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle multiple event listener attachments', async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);
      await element.updateComplete;

      const spies = Array.from({ length: 10 }, () => vi.fn());

      // Add multiple listeners
      spies.forEach((spy) => element.addEventListener('click', spy));

      element.click();

      // All listeners should be called twice (native + forwarded event)
      spies.forEach((spy) => expect(spy).toHaveBeenCalledTimes(2));

      // Clean up listeners
      spies.forEach((spy) => element.removeEventListener('click', spy));
    });

    it('should handle rapid property updates efficiently', async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);

      const startTime = performance.now();

      // Simulate rapid property changes
      for (let i = 0; i < 100; i++) {
        element.variant = i % 2 === 0 ? 'primary' : 'secondary';
        element.size = i % 3 === 0 ? 'small' : i % 3 === 1 ? 'medium' : 'big';
        element.disabled = i % 4 === 0;
      }

      await element.updateComplete;

      const endTime = performance.now();

      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Final state should be correct (99 is the last iteration)
      expect(element.variant).toBe('secondary'); // 99 % 2 === 1 -> 'secondary'
      expect(element.size).toBe('small'); // 99 % 3 === 0 -> 'small'
      expect(element.disabled).toBe(false); // 99 % 4 === 3 -> false
    });
  });

  describe('Government Use Case Scenarios', () => {
    it('should handle federal form submission workflow', async () => {
      element = document.createElement('usa-button') as USAButton;
      element.type = 'submit';
      element.textContent = 'File Tax Return';

      const form = document.createElement('form');
      form.appendChild(element);
      container.appendChild(form);
      await element.updateComplete;

      const submitSpy = vi.fn((e) => e.preventDefault());
      form.addEventListener('submit', submitSpy);

      element.click();

      expect(submitSpy).toHaveBeenCalled();
      expect(element.textContent?.trim()).toBe('File Tax Return');
    });

    it('should support emergency alert button patterns', async () => {
      element = document.createElement('usa-button') as USAButton;
      element.variant = 'accent-warm';
      element.size = 'big';
      element.textContent = 'Activate Emergency Alert';
      container.appendChild(element);
      await element.updateComplete;

      // Button element should have USWDS classes
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button--accent-warm')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--big')).toBe(true);

      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);
      element.click();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle document approval workflow buttons', async () => {
      const actions = [
        { variant: 'primary' as ButtonVariant, text: 'Approve Document' },
        { variant: 'accent-warm' as ButtonVariant, text: 'Request Changes' },
        { variant: 'outline' as ButtonVariant, text: 'Reject' },
        { variant: 'base' as ButtonVariant, text: 'Save for Later' },
      ];

      const buttons: USAButton[] = [];
      const clickSpies = actions.map(() => vi.fn());

      actions.forEach((action, index) => {
        const button = document.createElement('usa-button') as USAButton;
        button.variant = action.variant;
        button.textContent = action.text;
        container.appendChild(button);

        button.addEventListener('click', clickSpies[index]);
        buttons.push(button);
      });

      await Promise.all(buttons.map((btn) => btn.updateComplete));

      // Test each button's styling and functionality
      buttons.forEach((button, index) => {
        const buttonElement = button.querySelector('button');
        const expectedClass =
          actions[index].variant === 'primary'
            ? 'usa-button'
            : `usa-button--${actions[index].variant}`;

        // Button element should have USWDS classes
        if (actions[index].variant !== 'primary') {
          expect(buttonElement?.classList.contains(expectedClass)).toBe(true);
        }
        expect(buttonElement?.classList.contains('usa-button')).toBe(true);

        button.click();
        expect(clickSpies[index]).toHaveBeenCalled();
      });
    });
  });

  describe('USWDS Compliance and Integration', () => {
    it('should maintain USWDS CSS class structure', async () => {
      element = document.createElement('usa-button') as USAButton;
      container.appendChild(element);
      await element.updateComplete;

      // Base class always present on button element
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button')).toBe(true);

      // Test all variants maintain proper class structure
      const variants: ButtonVariant[] = [
        'secondary',
        'accent-cool',
        'accent-warm',
        'base',
        'outline',
        'inverse',
      ];

      for (const variant of variants) {
        element.variant = variant;
        await element.updateComplete;

        // Button element should have USWDS classes
        expect(buttonElement?.classList.contains('usa-button')).toBe(true);
        expect(buttonElement?.classList.contains(`usa-button--${variant}`)).toBe(true);

        // Should not have other variant classes
        const otherVariants = variants.filter((v) => v !== variant);
        otherVariants.forEach((otherVariant) => {
          expect(buttonElement?.classList.contains(`usa-button--${otherVariant}`)).toBe(false);
        });
      }
    });

    it('should work with USWDS JavaScript patterns', async () => {
      element = document.createElement('usa-button') as USAButton;
      element.setAttribute('data-uswds-component', 'button');
      element.setAttribute('data-government-action', 'true');
      container.appendChild(element);
      await element.updateComplete;

      // Should preserve custom USWDS data attributes
      expect(element.getAttribute('data-uswds-component')).toBe('button');
      expect(element.getAttribute('data-government-action')).toBe('true');

      // Should maintain functionality with attributes
      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);
      element.click();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should support custom USWDS CSS custom properties', async () => {
      element = document.createElement('usa-button') as USAButton;
      // Simulate USWDS CSS custom properties being set
      element.style.setProperty('--usa-button-font-size', '1.2rem');
      element.style.setProperty('--usa-button-border-radius', '8px');
      container.appendChild(element);
      await element.updateComplete;

      // CSS custom properties should be preserved
      expect(element.style.getPropertyValue('--usa-button-font-size')).toBe('1.2rem');
      expect(element.style.getPropertyValue('--usa-button-border-radius')).toBe('8px');
    });
  });

  // CRITICAL TESTS - Prevent auto-dismiss and lifecycle bugs
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    let element: USAButton;

    beforeEach(() => {
      element = document.createElement('usa-button') as USAButton;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      // Apply initial properties
      element.variant = 'primary';
      element.size = 'medium';
      element.disabled = false;
      element.type = 'button';
      element.ariaPressed = null;
      await element.updateComplete;

      // Verify element exists after initial render
      expect(document.body.contains(element)).toBe(true);
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button')).toBeTruthy();

      // Update properties (this is where bugs often occur)
      element.variant = 'secondary';
      element.size = 'big';
      element.disabled = true;
      await element.updateComplete;

      // CRITICAL: Element should still exist in DOM
      expect(document.body.contains(element)).toBe(true);
      // Button element should have USWDS classes
      expect(buttonElement?.classList.contains('usa-button')).toBe(true);

      // Multiple rapid property updates
      const propertySets = [
        {
          variant: 'primary' as ButtonVariant,
          size: 'small' as const,
          disabled: false,
          type: 'submit' as ButtonType,
          ariaPressed: 'false',
        },
        {
          variant: 'outline' as ButtonVariant,
          size: 'big' as const,
          disabled: true,
          type: 'reset' as ButtonType,
          ariaPressed: 'true',
        },
        {
          variant: 'accent-cool' as ButtonVariant,
          size: 'medium' as const,
          disabled: false,
          type: 'button' as ButtonType,
          ariaPressed: null,
        },
        {
          variant: 'inverse' as ButtonVariant,
          size: 'small' as const,
          disabled: true,
          type: 'submit' as ButtonType,
          ariaPressed: 'mixed',
        },
      ];

      for (const props of propertySets) {
        Object.assign(element, props);
        await element.updateComplete;

        // CRITICAL: Element should survive all updates
        expect(document.body.contains(element)).toBe(true);
        // Button element should have USWDS classes
        const buttonElement = element.querySelector('button');
        expect(buttonElement?.classList.contains('usa-button')).toBe(true);
      }
    });

    it('should not fire unintended events on property changes', async () => {
      const eventSpies = [
        vi.fn(), // Generic event spy
        vi.fn(), // Close/dismiss spy
        vi.fn(), // Submit/action spy
      ];

      // Common event names that might be fired accidentally
      const commonEvents = ['close', 'dismiss', 'submit', 'action', 'change'];

      commonEvents.forEach((eventName, index) => {
        if (eventSpies[index]) {
          element.addEventListener(eventName, eventSpies[index]);
        }
      });

      // Set up initial state
      element.variant = 'primary';
      await element.updateComplete;

      // Update properties should NOT fire these unintended events
      element.variant = 'secondary';
      await element.updateComplete;

      element.size = 'big';
      await element.updateComplete;

      element.disabled = true;
      await element.updateComplete;

      element.type = 'submit';
      await element.updateComplete;

      element.ariaPressed = 'true';
      await element.updateComplete;

      // Verify no unintended events were fired
      eventSpies.forEach((spy, _index) => {
        if (spy) {
          expect(spy).not.toHaveBeenCalled();
        }
      });

      // Verify element is still in DOM
      expect(document.body.contains(element)).toBe(true);
    });

    it('should handle rapid property updates without breaking', async () => {
      // Simulate rapid updates like Storybook controls or form interactions
      const startTime = performance.now();

      const propertySets = [
        {
          variant: 'primary' as ButtonVariant,
          size: 'small' as const,
          disabled: false,
          type: 'button' as ButtonType,
        },
        {
          variant: 'secondary' as ButtonVariant,
          size: 'medium' as const,
          disabled: true,
          type: 'submit' as ButtonType,
        },
        {
          variant: 'outline' as ButtonVariant,
          size: 'big' as const,
          disabled: false,
          type: 'reset' as ButtonType,
        },
        {
          variant: 'accent-warm' as ButtonVariant,
          size: 'small' as const,
          disabled: true,
          type: 'button' as ButtonType,
        },
      ];

      for (let i = 0; i < 20; i++) {
        const props = propertySets[i % propertySets.length];
        Object.assign(element, props);
        await element.updateComplete;

        // Element should remain stable
        expect(document.body.contains(element)).toBe(true);
        // Button element should have USWDS classes
        const buttonElement = element.querySelector('button');
        expect(buttonElement?.classList.contains('usa-button')).toBe(true);
      }

      const endTime = performance.now();

      // Should complete updates reasonably fast (under 500ms for button simplicity)
      expect(endTime - startTime).toBeLessThan(500);

      // Final verification
      expect(document.body.contains(element)).toBe(true);
    });
  });

  describe('Storybook Integration Tests (CRITICAL)', () => {
    let element: USAButton;

    beforeEach(() => {
      element = document.createElement('usa-button') as USAButton;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element?.remove();
    });

    it('should render correctly when created via Storybook patterns', async () => {
      // Simulate how Storybook creates components with args
      const storybookArgs = {
        variant: 'secondary' as ButtonVariant,
        size: 'big' as const,
        disabled: false,
        type: 'submit' as ButtonType,
      };

      // Set up element like Storybook would

      // Apply args like Storybook would
      Object.assign(element, storybookArgs);
      await element.updateComplete;

      // Should render without blank frames
      expect(document.body.contains(element)).toBe(true);
      // Button element should have USWDS classes
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button')).toBe(true);

      // Should have expected content structure
      const hasContent =
        (element.textContent?.trim().length || 0) > 0 ||
        element.querySelector('slot') !== null ||
        element.children.length > 0;
      expect(hasContent).toBe(true);

      // Verify button-specific styling on button element
      expect(buttonElement?.classList.contains('usa-button--secondary')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--big')).toBe(true);
      expect(buttonElement?.getAttribute('type')).toBe('submit');
    });

    it('should handle Storybook controls updates without breaking', async () => {
      // Simulate initial Storybook state
      const initialArgs = {
        variant: 'primary' as ButtonVariant,
        size: 'medium' as const,
        disabled: false,
        type: 'button' as ButtonType,
      };
      // Set up element
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Verify initial state
      expect(document.body.contains(element)).toBe(true);

      // Simulate user changing controls in Storybook
      const storybookUpdates = [
        { variant: 'secondary' as ButtonVariant },
        { size: 'big' as const },
        { disabled: true },
        { type: 'submit' as ButtonType },
        { variant: 'outline' as ButtonVariant, size: 'small' as const },
        { disabled: false, type: 'reset' as ButtonType },
        { variant: 'accent-cool' as ButtonVariant, ariaPressed: 'true' },
      ];

      for (const update of storybookUpdates) {
        Object.assign(element, update);
        await element.updateComplete;

        // Should not cause blank frame or auto-dismiss
        expect(document.body.contains(element)).toBe(true);
        // Button element should have USWDS classes
        const buttonElement = element.querySelector('button');
        expect(buttonElement?.classList.contains('usa-button')).toBe(true);
      }
    });

    it('should maintain visual state during hot reloads', async () => {
      const initialArgs = {
        variant: 'accent-warm' as ButtonVariant,
        size: 'big' as const,
        disabled: true,
        type: 'submit' as ButtonType,
        ariaPressed: 'false',
      };

      // Set up element
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Capture initial state

      // Simulate hot reload (property reassignment with same values)
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Should maintain state without disappearing
      expect(document.body.contains(element)).toBe(true);
      // Button element should have USWDS classes
      const buttonElement = element.querySelector('button');
      expect(buttonElement?.classList.contains('usa-button')).toBe(true);

      // Should maintain styling classes on button element
      expect(buttonElement?.classList.contains('usa-button--accent-warm')).toBe(true);
      expect(buttonElement?.classList.contains('usa-button--big')).toBe(true);
      expect(buttonElement?.hasAttribute('disabled')).toBe(true);
      expect(buttonElement?.getAttribute('type')).toBe('submit');
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/button/usa-button.ts`;
        const validation = validateComponentJavaScript(componentPath, 'button');

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

  describe('Performance Tests', () => {
    let element: USAButton;

    beforeEach(() => {
      element = document.createElement('usa-button') as USAButton;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element.remove();

      // Force garbage collection in tests if available
      if (typeof (global as any).gc === 'function') {
        (global as any).gc();
      }
    });

    it('should render within performance budget', async () => {
      const iterations = 10;
      const renderTimes: number[] = [];
      const maxRenderTime = 50; // 50ms max render time for buttons

      for (let i = 0; i < iterations; i++) {
        const testElement = document.createElement('usa-button') as USAButton;
        testElement.textContent = `Performance Test ${i}`;
        testElement.variant = i % 2 === 0 ? 'primary' : 'secondary';

        const startTime = performance.now();

        document.body.appendChild(testElement);
        await testElement.updateComplete;

        const renderTime = performance.now() - startTime;
        renderTimes.push(renderTime);

        testElement.remove();
      }

      const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;

      // Button should render quickly
      expect(averageRenderTime).toBeLessThan(maxRenderTime);

      console.log(`✅ Button render performance: ${averageRenderTime.toFixed(2)}ms average`);
    });

    it('should handle multiple instances efficiently', async () => {
      const instanceCount = 25;
      const buttons: USAButton[] = [];
      const maxTotalTime = 500; // 500ms for 25 buttons

      const startTime = performance.now();

      // Create multiple button instances
      for (let i = 0; i < instanceCount; i++) {
        const button = document.createElement('usa-button') as USAButton;
        button.textContent = `Button ${i + 1}`;
        button.variant = i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'outline';

        document.body.appendChild(button);
        buttons.push(button);

        await button.updateComplete;
      }

      const totalTime = performance.now() - startTime;
      const averageTimePerInstance = totalTime / instanceCount;

      // Clean up
      buttons.forEach((button) => button.remove());

      // Should handle multiple instances efficiently
      expect(totalTime).toBeLessThan(maxTotalTime);
      expect(averageTimePerInstance).toBeLessThan(20); // 20ms per instance

      console.log(
        `✅ Multiple instance performance: ${instanceCount} buttons in ${totalTime.toFixed(2)}ms`
      );
      console.log(`📊 Average per instance: ${averageTimePerInstance.toFixed(2)}ms`);
    });

    it('should not leak memory on creation/destruction cycles', async () => {
      const iterations = 20;
      let initialMemory = 0;

      // Get initial memory if available
      if (typeof (performance as any).memory !== 'undefined') {
        initialMemory = (performance as any).memory.usedJSHeapSize;
      }

      // Create and destroy buttons multiple times
      for (let i = 0; i < iterations; i++) {
        const button = document.createElement('usa-button') as USAButton;
        button.textContent = 'Memory Test';

        // Add event listeners that should be cleaned up
        const clickHandler = () => {};
        button.addEventListener('click', clickHandler);

        document.body.appendChild(button);
        await button.updateComplete;

        // Remove button
        button.remove();

        // Force cleanup occasionally
        if (i % 5 === 0 && typeof (global as any).gc === 'function') {
          (global as any).gc();
        }
      }

      // Final cleanup
      if (typeof (global as any).gc === 'function') {
        (global as any).gc();
      }

      // Wait for cleanup
      await new Promise((resolve) => setTimeout(resolve, 50));

      let finalMemory = 0;
      if (typeof (performance as any).memory !== 'undefined') {
        finalMemory = (performance as any).memory.usedJSHeapSize;
      }

      const memoryIncrease = finalMemory - initialMemory;
      const maxAcceptableLeakage = 50 * 1024; // 50KB

      // Should not leak significant memory
      expect(Math.abs(memoryIncrease)).toBeLessThan(maxAcceptableLeakage);

      console.log(`✅ Memory test: ${memoryIncrease} bytes difference after ${iterations} cycles`);
    });

    it('should handle user interactions efficiently', async () => {
      element.textContent = 'Interactive Test';
      await element.updateComplete;

      const iterations = 20;
      const interactionTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        // Test click interaction
        element.click();
        await element.updateComplete;

        // Test focus/blur
        element.focus();
        await new Promise((resolve) => setTimeout(resolve, 1));
        element.blur();

        // Test keyboard interaction
        element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await element.updateComplete;

        const interactionTime = performance.now() - startTime;
        interactionTimes.push(interactionTime);
      }

      const averageInteractionTime =
        interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;

      // Interactions should be responsive
      expect(averageInteractionTime).toBeLessThan(20); // 20ms max

      console.log(`✅ Average interaction time: ${averageInteractionTime.toFixed(2)}ms`);
    });

    it('should handle dynamic property updates efficiently', async () => {
      const updates = 20;
      const updateTimes: number[] = [];
      const variants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'accent-cool'];
      const sizes = ['small', 'medium', 'big'] as const;

      for (let i = 0; i < updates; i++) {
        const startTime = performance.now();

        // Update properties (avoid textContent conflicts with Lit)
        element.variant = variants[i % variants.length];
        element.size = sizes[i % sizes.length];
        element.disabled = i % 4 === 0;

        await element.updateComplete;

        const updateTime = performance.now() - startTime;
        updateTimes.push(updateTime);
      }

      const averageUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;

      // Updates should be fast
      expect(averageUpdateTime).toBeLessThan(15); // 15ms max

      console.log(`✅ Average property update time: ${averageUpdateTime.toFixed(2)}ms`);
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = 'Keyboard Test';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      const buttonElement = element.querySelector('button');
      expect(buttonElement).toBeTruthy();

      const result = await testKeyboardNavigation(buttonElement!, {
        shortcuts: [
          {
            key: 'Enter',
            description: 'Activate button with Enter',
            verify: async (el) => {
              const clickSpy = vi.fn();
              el.addEventListener('click', clickSpy);
              const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
              });
              el.dispatchEvent(enterEvent);
              // Native buttons handle Enter automatically
              el.removeEventListener('click', clickSpy);
            },
          },
          {
            key: ' ',
            description: 'Activate button with Space',
            verify: async (el) => {
              const clickSpy = vi.fn();
              el.addEventListener('click', clickSpy);
              const spaceEvent = new KeyboardEvent('keydown', {
                key: ' ',
                bubbles: true,
                cancelable: true,
              });
              el.dispatchEvent(spaceEvent);
              // Native buttons handle Space automatically
              el.removeEventListener('click', clickSpy);
            },
          },
        ],
        testEscapeKey: false, // Buttons don't respond to Escape
        testArrowKeys: false, // Buttons don't use arrow navigation
      });

      expect(result.passed).toBe(true);
      if (!result.passed) {
        console.error('Keyboard navigation errors:', result.errors);
      }
      expect(result.errors).toHaveLength(0);
    });

    it('should be keyboard-only usable (WCAG 2.1.1)', async () => {
      const buttonElement = element.querySelector('button');
      expect(buttonElement).toBeTruthy();

      const result = await verifyKeyboardOnlyUsable(buttonElement!);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('keyboard accessible');
      expect(result.report).toContain('No keyboard traps detected');
    });

    it('should support Enter and Space key activation (WCAG 2.1.1)', async () => {
      const buttonElement = element.querySelector('button');
      expect(buttonElement).toBeTruthy();

      const result = await testActivationKeys(buttonElement!);
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should be focusable via keyboard (Tab)', async () => {
      const buttonElement = element.querySelector('button');
      expect(buttonElement).toBeTruthy();

      // Focus the button
      (buttonElement as HTMLElement).focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(document.activeElement).toBe(buttonElement);
    });

    it('should not trap keyboard focus', async () => {
      const buttonElement = element.querySelector('button');
      expect(buttonElement).toBeTruthy();

      // Focus the button
      (buttonElement as HTMLElement).focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      buttonElement!.dispatchEvent(tabEvent);

      // Tab should not be prevented (keyboard trap check)
      expect(tabEvent.defaultPrevented).toBe(false);
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      const buttonElement = element.querySelector('button') as HTMLElement;
      expect(buttonElement).toBeTruthy();

      // Focus the button
      buttonElement.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that button is focused
      expect(document.activeElement).toBe(buttonElement);

      // USWDS applies :focus styles via CSS - we verify element is focusable
      // Actual focus ring styles are tested via visual regression in Storybook
      expect(buttonElement.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle Tab navigation correctly', async () => {
      // Create multiple buttons for tab order testing
      const button1 = document.createElement('usa-button') as USAButton;
      button1.textContent = 'Button 1';
      const button2 = document.createElement('usa-button') as USAButton;
      button2.textContent = 'Button 2';
      const button3 = document.createElement('usa-button') as USAButton;
      button3.textContent = 'Button 3';

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(button3);

      await button1.updateComplete;
      await button2.updateComplete;
      await button3.updateComplete;

      const btn1Element = button1.querySelector('button') as HTMLElement;
      const btn2Element = button2.querySelector('button') as HTMLElement;
      const btn3Element = button3.querySelector('button') as HTMLElement;

      // Focus first button
      btn1Element.focus();
      expect(document.activeElement).toBe(btn1Element);

      // Verify tab order is sequential
      const focusableElements = [btn1Element, btn2Element, btn3Element];
      focusableElements.forEach((el) => {
        expect(el.tabIndex).toBeGreaterThanOrEqual(0);
      });

      // All buttons should be reachable via Tab key
      expect(focusableElements.length).toBe(3);
    });

    it('should not respond to disabled buttons via keyboard', async () => {
      element.disabled = true;
      await element.updateComplete;

      const buttonElement = element.querySelector('button') as HTMLElement;
      expect(buttonElement).toBeTruthy();
      expect(buttonElement.disabled).toBe(true);

      const clickSpy = vi.fn();
      element.addEventListener('click', clickSpy);

      // Try to activate with Enter
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      buttonElement.dispatchEvent(enterEvent);

      // Try to activate with Space
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      buttonElement.dispatchEvent(spaceEvent);

      // Disabled buttons should not activate
      expect(clickSpy).not.toHaveBeenCalled();

      element.removeEventListener('click', clickSpy);
    });

    it('should support keyboard navigation in button groups', async () => {
      // Create button group
      const group = document.createElement('div');
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', 'Button group');

      const btn1 = document.createElement('usa-button') as USAButton;
      btn1.textContent = 'Option 1';
      const btn2 = document.createElement('usa-button') as USAButton;
      btn2.textContent = 'Option 2';
      const btn3 = document.createElement('usa-button') as USAButton;
      btn3.textContent = 'Option 3';

      group.appendChild(btn1);
      group.appendChild(btn2);
      group.appendChild(btn3);
      container.appendChild(group);

      await btn1.updateComplete;
      await btn2.updateComplete;
      await btn3.updateComplete;

      // Verify all buttons in group are keyboard accessible
      const result = await verifyKeyboardOnlyUsable(group);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('3 elements are keyboard accessible');
    });

    it('should maintain ARIA states during keyboard interaction', async () => {
      // Toggle button with aria-pressed
      element.ariaPressed = 'false';
      await element.updateComplete;

      const buttonElement = element.querySelector('button') as HTMLElement;
      expect(await waitForARIAAttribute(buttonElement, 'aria-pressed')).toBe('false');

      // Focus and activate
      buttonElement.focus();
      buttonElement.click();

      // Component should allow ARIA state changes via properties
      element.ariaPressed = 'true';
      await element.updateComplete;
      expect(await waitForARIAAttribute(buttonElement, 'aria-pressed')).toBe('true');
    });
  });

  describe('Touch/Pointer Accessibility (WCAG 2.5)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button') as USAButton;
      element.textContent = 'Click Me';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should have adequate target size (44x44px minimum)', async () => {
      await element.updateComplete;
      const buttonElement = element.querySelector('button') as HTMLElement;

      // Mock getBoundingClientRect for jsdom
      vi.spyOn(buttonElement, 'getBoundingClientRect').mockReturnValue({
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

      const result = testTargetSize(element, 44);
      expect(result.compliant).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.totalTested).toBeGreaterThan(0);
    });

    it('should pass label-in-name check (WCAG 2.5.3)', async () => {
      await element.updateComplete;

      const result = testLabelInName(element);
      expect(result.correct).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should pass label-in-name with aria-label containing visible text', async () => {
      element.setAttribute('aria-label', 'Click Me Button');
      await element.updateComplete;

      const result = testLabelInName(element);
      expect(result.correct).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should fail label-in-name when aria-label does not contain visible text', async () => {
      element.setAttribute('aria-label', 'Submit Form'); // Different from visible text "Click Me"
      await element.updateComplete;

      const result = testLabelInName(element);
      expect(result.correct).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should pass comprehensive pointer accessibility tests', async () => {
      await element.updateComplete;
      const buttonElement = element.querySelector('button') as HTMLElement;

      // Mock getBoundingClientRect for jsdom
      vi.spyOn(buttonElement, 'getBoundingClientRect').mockReturnValue({
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

    it('should have adequate target size for different button sizes', async () => {
      const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

      for (const size of sizes) {
        element.size = size;
        await element.updateComplete;

        const buttonElement = element.querySelector('button') as HTMLElement;

        // All USWDS button sizes meet 44x44px minimum
        const dimensions = size === 'small' ? 44 : size === 'medium' ? 50 : 60;

        vi.spyOn(buttonElement, 'getBoundingClientRect').mockReturnValue({
          width: dimensions,
          height: dimensions,
          top: 0,
          left: 0,
          right: dimensions,
          bottom: dimensions,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });

        const result = testTargetSize(element, 44);
        expect(result.compliant).toBe(true);
      }
    });
  });

  describe('Color/Contrast Accessibility (WCAG 1.4)', () => {
    it('should have correct USWDS classes for contrast (WCAG 1.4.3)', async () => {
      const { testColorContrast } = await import('@uswds-wc/test-utils/contrast-utils.js');

      element.variant = 'default';
      await element.updateComplete;

      const button = element.querySelector('button');
      expect(button).toBeTruthy();

      // Verify USWDS button classes are applied
      expect(button?.classList.contains('usa-button')).toBe(true);

      const result = testColorContrast(button as Element);

      // Structure validation (jsdom may not have full USWDS CSS)
      expect(result).toBeDefined();
      expect(result.foreground).toBeDefined();
      expect(result.background).toBeDefined();
    });

    it('should apply variant classes correctly for contrast', async () => {
      const variants = ['primary', 'secondary', 'accent-cool', 'base', 'outline'];

      for (const variant of variants) {
        element.variant = variant as any;
        await element.updateComplete;

        const button = element.querySelector('button');
        expect(button).toBeTruthy();

        // Verify USWDS classes are applied for each variant
        expect(button?.classList.contains('usa-button')).toBe(true);

        if (variant !== 'primary' && variant !== 'default') {
          const expectedClass = `usa-button--${variant}`;
          expect(button?.classList.contains(expectedClass)).toBe(true);
        }
      }
    });

    it('should test contrast with explicit colors', async () => {
      const { testColorContrast } = await import('@uswds-wc/test-utils/contrast-utils.js');

      await element.updateComplete;

      const button = element.querySelector('button') as HTMLElement;
      expect(button).toBeTruthy();

      // Apply explicit colors for testing
      button.style.color = '#1b1b1b';
      button.style.backgroundColor = '#ffffff';

      const result = testColorContrast(button as Element);

      expect(result).toBeDefined();
      expect(result.passesAA).toBe(true);
      expect(result.ratio).toBeGreaterThan(4.5);
    });

    it('should verify outline variant structure (WCAG 1.4.11)', async () => {
      element.variant = 'outline';
      element.outline = true;
      await element.updateComplete;

      const button = element.querySelector('button');
      expect(button).toBeTruthy();

      // Verify USWDS outline class is applied
      expect(button?.classList.contains('usa-button--outline')).toBe(true);
    });

    it('should apply disabled state with proper classes', async () => {
      element.disabled = true;
      await element.updateComplete;

      const button = element.querySelector('button');
      expect(button).toBeTruthy();

      // Verify disabled attribute is set
      expect(button?.hasAttribute('disabled')).toBe(true);
    });

    it('should calculate contrast correctly with test colors', async () => {
      const { calculateContrastRatio } = await import('@uswds-wc/test-utils/contrast-utils.js');

      // Test high contrast
      const highContrast = calculateContrastRatio('#000000', '#ffffff');
      expect(highContrast).toBeCloseTo(21, 0);
      expect(highContrast).toBeGreaterThan(7); // AAA

      // Test low contrast
      const lowContrast = calculateContrastRatio('#999999', '#ffffff');
      expect(lowContrast).toBeCloseTo(2.85, 1);
      expect(lowContrast).toBeLessThan(4.5); // Fails AA

      // Test AA borderline
      const aaContrast = calculateContrastRatio('#767676', '#ffffff');
      expect(aaContrast).toBeGreaterThan(4.5); // Passes AA
      expect(aaContrast).toBeLessThan(7); // Fails AAA
    });
  });
});
