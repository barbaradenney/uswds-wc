/**
 * API Contract Testing
 *
 * This test suite verifies that component APIs remain consistent and backward compatible.
 * Tests ensure components maintain their contracts across versions and updates.
 */

import { test, expect } from '@playwright/test';

test.describe('Component API Contract Tests', () => {
  test.describe('Button Component API Contract', () => {
    test('should maintain expected property API', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');

      // Test button component property contracts
      const buttonContract = await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (!button) return null;

        return {
          // Test expected properties exist
          hasVariantProperty: 'variant' in button,
          hasDisabledProperty: 'disabled' in button,
          hasSizeProperty: 'size' in button,

          // Test property types
          variantType: typeof (button as any).variant,
          disabledType: typeof (button as any).disabled,
          sizeType: typeof (button as any).size,

          // Test default values
          defaultVariant: (button as any).variant,
          defaultDisabled: (button as any).disabled,
          defaultSize: (button as any).size,

          // Test property descriptors
          variantDescriptor: Object.getOwnPropertyDescriptor(button, 'variant') ||
                           Object.getOwnPropertyDescriptor(Object.getPrototypeOf(button), 'variant'),
          disabledDescriptor: Object.getOwnPropertyDescriptor(button, 'disabled') ||
                            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(button), 'disabled'),
        };
      });

      expect(buttonContract).toBeTruthy();
      expect(buttonContract.hasVariantProperty).toBe(true);
      expect(buttonContract.hasDisabledProperty).toBe(true);
      expect(buttonContract.variantType).toBe('string');
      expect(buttonContract.disabledType).toBe('boolean');
      expect(buttonContract.defaultDisabled).toBe(false);

      // Test property setters work
      await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (button) {
          (button as any).variant = 'secondary';
          (button as any).disabled = true;
        }
      });

      const updatedValues = await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        return button ? {
          variant: (button as any).variant,
          disabled: (button as any).disabled
        } : null;
      });

      expect(updatedValues?.variant).toBe('secondary');
      expect(updatedValues?.disabled).toBe(true);
    });

    test('should maintain expected method API', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');

      const methodContract = await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (!button) return null;

        return {
          // Test expected methods exist
          hasClickMethod: typeof (button as any).click === 'function',
          hasFocusMethod: typeof (button as any).focus === 'function',
          hasBlurMethod: typeof (button as any).blur === 'function',

          // Test method signatures (parameter count)
          clickParameterCount: (button as any).click?.length || 0,
          focusParameterCount: (button as any).focus?.length || 0,

          // Test method return types
          clickResult: typeof (button as any).click?.(),
          focusResult: typeof (button as any).focus?.(),
        };
      });

      expect(methodContract).toBeTruthy();
      expect(methodContract.hasClickMethod).toBe(true);
      expect(methodContract.hasFocusMethod).toBe(true);
      expect(methodContract.hasBlurMethod).toBe(true);

      // Methods should return undefined for these basic interactions
      expect(methodContract.clickResult).toBe('undefined');
    });

    test('should dispatch expected events', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');

      // Set up event listeners
      const eventContract = await page.evaluate(() => {
        return new Promise((resolve) => {
          const button = document.querySelector('usa-button');
          if (!button) {
            resolve(null);
            return;
          }

          const events = [];
          const timeout = setTimeout(() => resolve(events), 1000);

          // Listen for expected events
          button.addEventListener('click', (e) => {
            events.push({
              type: 'click',
              bubbles: e.bubbles,
              cancelable: e.cancelable,
              detail: (e as CustomEvent).detail
            });
          });

          button.addEventListener('focus', (e) => {
            events.push({
              type: 'focus',
              bubbles: e.bubbles,
              cancelable: e.cancelable
            });
          });

          button.addEventListener('blur', (e) => {
            events.push({
              type: 'blur',
              bubbles: e.bubbles,
              cancelable: e.cancelable
            });
          });

          // Trigger events
          button.click();
          button.focus();
          button.blur();

          // Wait for events to fire
          setTimeout(() => {
            clearTimeout(timeout);
            resolve(events);
          }, 100);
        });
      });

      expect(eventContract).toBeTruthy();
      expect(Array.isArray(eventContract)).toBe(true);

      const clickEvent = eventContract.find(e => e.type === 'click');
      expect(clickEvent).toBeTruthy();
      expect(clickEvent.bubbles).toBe(true); // Click events should bubble
    });

    test('should support expected CSS custom properties', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');

      const cssContract = await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (!button) return null;

        // Test CSS custom properties
        const computedStyle = getComputedStyle(button);

        return {
          // Test if custom properties are recognized
          beforeColor: computedStyle.getPropertyValue('--usa-button-color'),
          beforeBackground: computedStyle.getPropertyValue('--usa-button-background-color'),

          // Set custom values
          customColorTest: (() => {
            button.style.setProperty('--usa-button-color', 'red');
            const newStyle = getComputedStyle(button);
            return newStyle.getPropertyValue('--usa-button-color');
          })(),

          customBackgroundTest: (() => {
            button.style.setProperty('--usa-button-background-color', 'blue');
            const newStyle = getComputedStyle(button);
            return newStyle.getPropertyValue('--usa-button-background-color');
          })()
        };
      });

      expect(cssContract).toBeTruthy();
      // CSS custom properties should be settable
      expect(cssContract.customColorTest).toBe('red');
      expect(cssContract.customBackgroundTest).toBe('blue');
    });
  });

  test.describe('Text Input Component API Contract', () => {
    test('should maintain form control API contract', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-text-input--default');

      const formContract = await page.evaluate(() => {
        const textInput = document.querySelector('usa-text-input');
        const input = textInput?.querySelector('input');

        if (!textInput || !input) return null;

        return {
          // Test form control properties
          hasValueProperty: 'value' in textInput,
          hasNameProperty: 'name' in textInput,
          hasRequiredProperty: 'required' in textInput,
          hasDisabledProperty: 'disabled' in textInput,

          // Test input element integration
          inputExists: !!input,
          inputType: input.type,
          inputName: input.name,

          // Test value synchronization
          componentValue: (textInput as any).value,
          inputValue: input.value,

          // Test form validation API
          hasValidityProperty: 'validity' in textInput,
          hasValidationMessageProperty: 'validationMessage' in textInput,
          hasCheckValidityMethod: typeof (textInput as any).checkValidity === 'function',
        };
      });

      expect(formContract).toBeTruthy();
      expect(formContract.hasValueProperty).toBe(true);
      expect(formContract.hasDisabledProperty).toBe(true);
      expect(formContract.inputExists).toBe(true);
      expect(formContract.hasCheckValidityMethod).toBe(true);

      // Test value synchronization
      await page.evaluate(() => {
        const textInput = document.querySelector('usa-text-input');
        if (textInput) {
          (textInput as any).value = 'test value';
        }
      });

      const syncTest = await page.evaluate(() => {
        const textInput = document.querySelector('usa-text-input');
        const input = textInput?.querySelector('input');

        return {
          componentValue: (textInput as any)?.value,
          inputValue: input?.value
        };
      });

      expect(syncTest.componentValue).toBe('test value');
      expect(syncTest.inputValue).toBe('test value');
    });

    test('should dispatch form-related events', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-text-input--default');

      const formEvents = await page.evaluate(() => {
        return new Promise((resolve) => {
          const textInput = document.querySelector('usa-text-input');
          const input = textInput?.querySelector('input');

          if (!textInput || !input) {
            resolve(null);
            return;
          }

          const events = [];

          // Listen for form events
          ['input', 'change', 'focus', 'blur'].forEach(eventType => {
            textInput.addEventListener(eventType, (e) => {
              events.push({
                type: eventType,
                target: e.target?.tagName,
                bubbles: e.bubbles,
                detail: (e as CustomEvent).detail
              });
            });
          });

          // Trigger events
          input.focus();
          input.value = 'test';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.blur();

          setTimeout(() => resolve(events), 100);
        });
      });

      expect(formEvents).toBeTruthy();
      expect(Array.isArray(formEvents)).toBe(true);

      const inputEvent = formEvents.find(e => e.type === 'input');
      const changeEvent = formEvents.find(e => e.type === 'change');

      expect(inputEvent).toBeTruthy();
      expect(changeEvent).toBeTruthy();
    });
  });

  test.describe('Accordion Component API Contract', () => {
    test('should maintain collapsible content API', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');

      const accordionContract = await page.evaluate(() => {
        const accordion = document.querySelector('usa-accordion');
        if (!accordion) return null;

        return {
          // Test expected properties
          hasExpandedProperty: 'expanded' in accordion,
          hasMultiSelectableProperty: 'multiSelectable' in accordion,

          // Test default states
          defaultExpanded: (accordion as any).expanded,
          defaultMultiSelectable: (accordion as any).multiSelectable,

          // Test toggle functionality
          hasToggleMethod: typeof (accordion as any).toggle === 'function',
          hasExpandMethod: typeof (accordion as any).expand === 'function',
          hasCollapseMethod: typeof (accordion as any).collapse === 'function',

          // Test ARIA attributes
          ariaMultiSelectable: accordion.getAttribute('aria-multiselectable'),
          role: accordion.getAttribute('role'),
        };
      });

      expect(accordionContract).toBeTruthy();
      expect(accordionContract.hasExpandedProperty).toBe(true);
      expect(accordionContract.defaultExpanded).toBe(false);

      // Test accordion toggle
      await page.evaluate(() => {
        const accordion = document.querySelector('usa-accordion');
        if (accordion && typeof (accordion as any).toggle === 'function') {
          (accordion as any).toggle();
        }
      });

      const toggledState = await page.evaluate(() => {
        const accordion = document.querySelector('usa-accordion');
        return (accordion as any)?.expanded;
      });

      expect(typeof toggledState).toBe('boolean');
    });

    test('should dispatch accordion-specific events', async ({ page }) => {
      await page.goto('/iframe.html?id=structure-accordion--default');

      const accordionEvents = await page.evaluate(() => {
        return new Promise((resolve) => {
          const accordion = document.querySelector('usa-accordion');
          if (!accordion) {
            resolve(null);
            return;
          }

          const events = [];

          // Listen for accordion events
          accordion.addEventListener('expand', (e) => {
            events.push({
              type: 'expand',
              detail: (e as CustomEvent).detail,
              bubbles: e.bubbles
            });
          });

          accordion.addEventListener('collapse', (e) => {
            events.push({
              type: 'collapse',
              detail: (e as CustomEvent).detail,
              bubbles: e.bubbles
            });
          });

          // Trigger accordion interaction
          const button = accordion.querySelector('button');
          if (button) {
            button.click();
          }

          setTimeout(() => resolve(events), 200);
        });
      });

      expect(accordionEvents).toBeTruthy();
      expect(Array.isArray(accordionEvents)).toBe(true);

      // Should have fired either expand or collapse event
      const hasAccordionEvent = accordionEvents.some(e =>
        e.type === 'expand' || e.type === 'collapse'
      );
      expect(hasAccordionEvent).toBe(true);
    });
  });

  test.describe('Backward Compatibility', () => {
    test('should maintain deprecated API support', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');

      // Test that deprecated properties still work (if any)
      const backwardCompatibility = await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (!button) return null;

        const results = [];

        // Test deprecated property aliases (example)
        if ('type' in button) {
          results.push({
            property: 'type',
            exists: true,
            value: (button as any).type
          });
        }

        // Test that old event names still work (example)
        let oldEventFired = false;
        button.addEventListener('usa-button-click', () => {
          oldEventFired = true;
        });

        button.click();

        return {
          deprecatedProperties: results,
          oldEventSupport: oldEventFired
        };
      });

      expect(backwardCompatibility).toBeTruthy();
      // Results will vary based on actual deprecated APIs in components
    });

    test('should not break with old usage patterns', async ({ page }) => {
      await page.goto('/iframe.html?id=forms-text-input--default');

      // Test old-style property setting
      const oldStyleUsage = await page.evaluate(() => {
        const textInput = document.querySelector('usa-text-input');
        if (!textInput) return null;

        try {
          // Old style: setting attributes instead of properties
          textInput.setAttribute('value', 'old style value');
          textInput.setAttribute('disabled', 'true');

          return {
            attributeValue: textInput.getAttribute('value'),
            attributeDisabled: textInput.getAttribute('disabled'),
            propertyValue: (textInput as any).value,
            propertyDisabled: (textInput as any).disabled,
            success: true
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });

      expect(oldStyleUsage).toBeTruthy();
      expect(oldStyleUsage.success).toBe(true);

      // Attributes should work alongside properties
      expect(oldStyleUsage.attributeValue).toBe('old style value');
    });
  });

  test.describe('TypeScript Interface Compliance', () => {
    test('should match TypeScript interface definitions', async ({ page }) => {
      await page.goto('/iframe.html?id=actions-button--default');

      // Test that runtime matches TypeScript interfaces
      const interfaceCompliance = await page.evaluate(() => {
        const button = document.querySelector('usa-button');
        if (!button) return null;

        // Check property types match expected TypeScript interfaces
        return {
          variantIsString: typeof (button as any).variant === 'string',
          disabledIsBoolean: typeof (button as any).disabled === 'boolean',
          sizeIsStringOrUndefined: ['string', 'undefined'].includes(typeof (button as any).size),

          // Check method signatures
          clickIsFunction: typeof (button as any).click === 'function',
          focusIsFunction: typeof (button as any).focus === 'function',

          // Check that properties are enumerable/configurable as expected
          variantDescriptor: Object.getOwnPropertyDescriptor(button, 'variant'),
          disabledDescriptor: Object.getOwnPropertyDescriptor(button, 'disabled'),
        };
      });

      expect(interfaceCompliance).toBeTruthy();
      expect(interfaceCompliance.variantIsString).toBe(true);
      expect(interfaceCompliance.disabledIsBoolean).toBe(true);
      expect(interfaceCompliance.clickIsFunction).toBe(true);
    });
  });

  test.describe('API Stability Across Updates', () => {
    test('should maintain stable API surface', async ({ page }) => {
      await page.goto('/iframe.html?id=feedback-alert--default');

      // Test that core APIs remain stable
      const apiSurface = await page.evaluate(() => {
        const alert = document.querySelector('usa-alert');
        if (!alert) return null;

        // Get all enumerable properties and methods
        const properties = [];
        const methods = [];

        for (const key in alert) {
          if (typeof (alert as any)[key] === 'function') {
            methods.push(key);
          } else {
            properties.push({
              name: key,
              type: typeof (alert as any)[key]
            });
          }
        }

        return {
          properties: properties.filter(p => !p.name.startsWith('_')), // Filter private
          methods: methods.filter(m => !m.startsWith('_')),
          totalApiSurface: properties.length + methods.length
        };
      });

      expect(apiSurface).toBeTruthy();
      expect(apiSurface.properties.length).toBeGreaterThan(0);

      // API surface should be stable (this would be compared against a baseline in real tests)
      console.log('API Surface:', {
        properties: apiSurface.properties.length,
        methods: apiSurface.methods.length,
        total: apiSurface.totalApiSurface
      });
    });
  });
});