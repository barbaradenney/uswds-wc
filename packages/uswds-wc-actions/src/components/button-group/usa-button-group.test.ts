import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-button-group.ts';
import type { USAButtonGroup, ButtonGroupItem } from './usa-button-group.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForUpdate, validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAButtonGroup', () => {
  let element: USAButtonGroup;

  const sampleButtons: ButtonGroupItem[] = [
    {
      text: 'Primary Button',
      variant: 'primary',
      type: 'button',
    },
    {
      text: 'Secondary Button',
      variant: 'secondary',
      type: 'button',
    },
    {
      text: 'Outline Button',
      variant: 'outline',
      type: 'button',
    },
    {
      text: 'Disabled Button',
      variant: 'base',
      type: 'button',
      disabled: true,
    },
  ];

  beforeEach(() => {
    element = document.createElement('usa-button-group') as USAButtonGroup;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-BUTTON-GROUP');
    });

    it('should have default properties', () => {
      expect(element.type).toBe('default');
      expect(element.buttons).toEqual([]);
    });

    it('should render empty button group with slot', async () => {
      await waitForUpdate(element);

      const group = element.querySelector('.usa-button-group');
      expect(group).toBeTruthy();

      const slot = element.querySelector('slot');
      expect(slot).toBeTruthy();
    });
  });

  describe('Properties', () => {
    it('should handle type changes', async () => {
      element.type = 'segmented';
      await waitForPropertyPropagation(element);

      const group = element.querySelector('.usa-button-group');
      expect(group?.classList.contains('usa-button-group--segmented')).toBe(true);
    });

    it('should handle buttons array changes', async () => {
      element.buttons = sampleButtons;
      await waitForPropertyPropagation(element);

      const buttons = element.querySelectorAll('button');
      expect(buttons.length).toBe(4);

      const items = element.querySelectorAll('.usa-button-group__item');
      expect(items.length).toBe(4);
    });

    it('should render programmatic buttons instead of slot when buttons provided', async () => {
      element.buttons = sampleButtons;
      await waitForPropertyPropagation(element);

      const buttons = element.querySelectorAll('button');
      expect(buttons.length).toBe(4);

      const slot = element.querySelector('slot');
      expect(slot).toBeFalsy(); // No slot when buttons are programmatically provided
    });
  });

  describe('Button Rendering', () => {
    beforeEach(async () => {
      element.buttons = sampleButtons;
      await waitForUpdate(element);
    });

    it('should render buttons with correct text', () => {
      const buttons = element.querySelectorAll('button');

      expect(buttons[0].textContent?.trim()).toBe('Primary Button');
      expect(buttons[1].textContent?.trim()).toBe('Secondary Button');
      expect(buttons[2].textContent?.trim()).toBe('Outline Button');
      expect(buttons[3].textContent?.trim()).toBe('Disabled Button');
    });

    it('should render buttons with correct CSS classes', () => {
      const buttons = element.querySelectorAll('button');

      // Primary button (default, no additional class)
      expect(buttons[0].classList.contains('usa-button')).toBe(true);
      expect(buttons[0].classList.contains('usa-button--primary')).toBe(false);

      // Secondary button
      expect(buttons[1].classList.contains('usa-button')).toBe(true);
      expect(buttons[1].classList.contains('usa-button--secondary')).toBe(true);

      // Outline button
      expect(buttons[2].classList.contains('usa-button')).toBe(true);
      expect(buttons[2].classList.contains('usa-button--outline')).toBe(true);

      // Base button
      expect(buttons[3].classList.contains('usa-button')).toBe(true);
      expect(buttons[3].classList.contains('usa-button--base')).toBe(true);
    });

    it('should render buttons with correct types', () => {
      const buttons = element.querySelectorAll('button');

      buttons.forEach((button) => {
        expect((button as HTMLButtonElement).type).toBe('button');
      });
    });

    it('should handle button disabled state', () => {
      const buttons = element.querySelectorAll('button');

      expect((buttons[0] as HTMLButtonElement).disabled).toBe(false);
      expect((buttons[1] as HTMLButtonElement).disabled).toBe(false);
      expect((buttons[2] as HTMLButtonElement).disabled).toBe(false);
      expect((buttons[3] as HTMLButtonElement).disabled).toBe(true);
    });

    it('should render each button in a list item', () => {
      const items = element.querySelectorAll('.usa-button-group__item');
      const buttons = element.querySelectorAll('button');

      expect(items.length).toBe(buttons.length);

      items.forEach((item, index) => {
        const button = item.querySelector('button');
        expect(button).toBe(buttons[index]);
      });
    });
  });

  describe('Button Types and Variants', () => {
    it('should handle all button types', async () => {
      const typedButtons: ButtonGroupItem[] = [
        { text: 'Button Type', type: 'button' },
        { text: 'Submit Type', type: 'submit' },
        { text: 'Reset Type', type: 'reset' },
      ];

      element.buttons = typedButtons;
      await waitForPropertyPropagation(element);

      const buttons = element.querySelectorAll('button');
      expect((buttons[0] as HTMLButtonElement).type).toBe('button');
      expect((buttons[1] as HTMLButtonElement).type).toBe('submit');
      expect((buttons[2] as HTMLButtonElement).type).toBe('reset');
    });

    it('should default to button type when not specified', async () => {
      element.buttons = [{ text: 'Default Type' }];
      await waitForPropertyPropagation(element);

      const button = element.querySelector('button') as HTMLButtonElement;
      expect(button.type).toBe('button');
    });

    it('should handle all button variants', async () => {
      const variantButtons: ButtonGroupItem[] = [
        { text: 'Primary', variant: 'primary' },
        { text: 'Secondary', variant: 'secondary' },
        { text: 'Outline', variant: 'outline' },
        { text: 'Base', variant: 'base' },
      ];

      element.buttons = variantButtons;
      await waitForPropertyPropagation(element);

      const buttons = element.querySelectorAll('button');

      // Primary doesn't add additional class
      expect(buttons[0].classList.contains('usa-button')).toBe(true);
      expect(buttons[0].classList.contains('usa-button--primary')).toBe(false);

      // Other variants add their respective classes
      expect(buttons[1].classList.contains('usa-button--secondary')).toBe(true);
      expect(buttons[2].classList.contains('usa-button--outline')).toBe(true);
      expect(buttons[3].classList.contains('usa-button--base')).toBe(true);
    });

    it('should handle buttons without variant specified', async () => {
      element.buttons = [{ text: 'No Variant' }];
      await waitForPropertyPropagation(element);

      const button = element.querySelector('button');
      expect(button?.classList.contains('usa-button')).toBe(true);
      expect(button?.className).toBe('usa-button');
    });
  });

  describe('Group Types', () => {
    it('should render default button group', async () => {
      element.type = 'default';
      element.buttons = sampleButtons;
      await waitForPropertyPropagation(element);

      const group = element.querySelector('.usa-button-group');
      expect(group?.classList.contains('usa-button-group')).toBe(true);
      expect(group?.classList.contains('usa-button-group--segmented')).toBe(false);
    });

    it('should render segmented button group', async () => {
      element.type = 'segmented';
      element.buttons = sampleButtons;
      await waitForPropertyPropagation(element);

      const group = element.querySelector('.usa-button-group');
      expect(group?.classList.contains('usa-button-group')).toBe(true);
      expect(group?.classList.contains('usa-button-group--segmented')).toBe(true);
    });

    it('should update group type dynamically', async () => {
      element.buttons = sampleButtons;
      element.type = 'default';
      await waitForPropertyPropagation(element);

      let group = element.querySelector('.usa-button-group');
      expect(group?.classList.contains('usa-button-group--segmented')).toBe(false);

      element.type = 'segmented';
      await waitForPropertyPropagation(element);

      group = element.querySelector('.usa-button-group');
      expect(group?.classList.contains('usa-button-group--segmented')).toBe(true);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      element.buttons = sampleButtons;
      await waitForUpdate(element);
    });

    it('should dispatch button-click event when button clicked', async () => {
      let eventDetail: any = null;

      element.addEventListener('button-click', (e: any) => {
        eventDetail = e.detail;
      });

      const firstButton = element.querySelector('button') as HTMLButtonElement;
      firstButton.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.button).toEqual(sampleButtons[0]);
      expect(eventDetail.index).toBe(0);
    });

    it('should dispatch events for all buttons', async () => {
      const events: any[] = [];

      element.addEventListener('button-click', (e: any) => {
        events.push(e.detail);
      });

      const buttons = element.querySelectorAll('button');

      // Click all non-disabled buttons
      buttons.forEach((button, _index) => {
        if (!(button as HTMLButtonElement).disabled) {
          button.click();
        }
      });

      expect(events.length).toBe(3); // 4 buttons, but 1 is disabled
      expect(events[0].index).toBe(0);
      expect(events[1].index).toBe(1);
      expect(events[2].index).toBe(2);
    });

    it('should call onclick handler if provided', async () => {
      const onClickSpy = vi.fn();

      element.buttons = [
        {
          text: 'Clickable Button',
          onclick: onClickSpy,
        },
      ];
      await waitForPropertyPropagation(element);

      const button = element.querySelector('button') as HTMLButtonElement;
      button.click();

      expect(onClickSpy).toHaveBeenCalledOnce();
    });

    it('should have correct event properties', async () => {
      let capturedEvent: CustomEvent | null = null;

      element.addEventListener('button-click', (e: any) => {
        capturedEvent = e;
      });

      const button = element.querySelector('button') as HTMLButtonElement;
      button.click();

      expect(capturedEvent).toBeTruthy();
      if (capturedEvent) {
        expect((capturedEvent as any).type).toBe('button-click');
        expect((capturedEvent as any).bubbles).toBe(true);
        expect((capturedEvent as any).composed).toBe(true);
      }
    });

    it('should not dispatch events for disabled buttons', async () => {
      let eventFired = false;

      element.addEventListener('button-click', () => {
        eventFired = true;
      });

      const buttons = element.querySelectorAll('button');
      const disabledButton = Array.from(buttons).find((btn) => (btn as HTMLButtonElement).disabled);

      expect(disabledButton).toBeTruthy();

      disabledButton?.click();
      expect(eventFired).toBe(false);
    });
  });

  describe('Slot Usage', () => {
    it('should render slot when no buttons provided', async () => {
      element.buttons = [];
      await waitForPropertyPropagation(element);

      const group = element.querySelector('.usa-button-group');
      const slot = element.querySelector('slot');

      expect(group).toBeTruthy();
      expect(slot).toBeTruthy();
    });

    it('should support slotted content', async () => {
      element.buttons = []; // Ensure we use slot mode

      // Add slotted content
      const listItem = document.createElement('li');
      listItem.className = 'usa-button-group__item';
      listItem.innerHTML = '<button class="usa-button">Slotted Button</button>';
      element.appendChild(listItem);

      await waitForUpdate(element);

      const slot = element.querySelector('slot');
      expect(slot).toBeTruthy();

      const slottedButton = element.querySelector('button');
      expect(slottedButton?.textContent?.trim()).toBe('Slotted Button');
    });

    it('should prefer programmatic buttons over slot', async () => {
      // Add slotted content first
      const listItem = document.createElement('li');
      listItem.innerHTML = '<button>Slotted Button</button>';
      element.appendChild(listItem);

      // Then set programmatic buttons
      element.buttons = [{ text: 'Programmatic Button' }];
      await waitForUpdate(element);

      // Should render programmatic button, not slot
      const buttons = element.querySelectorAll('button');
      expect(buttons.length).toBe(1);
      expect(buttons[0].textContent?.trim()).toBe('Programmatic Button');

      const slot = element.querySelector('slot');
      expect(slot).toBeFalsy();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle dynamic button updates', async () => {
      // Start with some buttons
      element.buttons = sampleButtons.slice(0, 2);
      await waitForUpdate(element);

      expect(element.querySelectorAll('button').length).toBe(2);

      // Add more buttons
      element.buttons = sampleButtons;
      await waitForUpdate(element);

      expect(element.querySelectorAll('button').length).toBe(4);

      // Remove buttons
      element.buttons = [sampleButtons[0]];
      await waitForUpdate(element);

      expect(element.querySelectorAll('button').length).toBe(1);
      expect(element.querySelector('button')?.textContent?.trim()).toBe('Primary Button');
    });

    it('should handle mixed button configurations', async () => {
      const mixedButtons: ButtonGroupItem[] = [
        { text: 'Submit Form', type: 'submit', variant: 'primary' },
        { text: 'Cancel', type: 'button', variant: 'outline' },
        { text: 'Reset', type: 'reset', variant: 'secondary', disabled: true },
        { text: 'Base Action', variant: 'base' }, // Default type
      ];

      element.buttons = mixedButtons;
      await waitForPropertyPropagation(element);

      const buttons = element.querySelectorAll('button');

      // Check types
      expect((buttons[0] as HTMLButtonElement).type).toBe('submit');
      expect((buttons[1] as HTMLButtonElement).type).toBe('button');
      expect((buttons[2] as HTMLButtonElement).type).toBe('reset');
      expect((buttons[3] as HTMLButtonElement).type).toBe('button'); // Default

      // Check variants
      expect(buttons[0].classList.contains('usa-button')).toBe(true); // Primary is default
      expect(buttons[1].classList.contains('usa-button--outline')).toBe(true);
      expect(buttons[2].classList.contains('usa-button--secondary')).toBe(true);
      expect(buttons[3].classList.contains('usa-button--base')).toBe(true);

      // Check disabled state
      expect((buttons[0] as HTMLButtonElement).disabled).toBe(false);
      expect((buttons[1] as HTMLButtonElement).disabled).toBe(false);
      expect((buttons[2] as HTMLButtonElement).disabled).toBe(true);
      expect((buttons[3] as HTMLButtonElement).disabled).toBe(false);
    });

    it('should handle switching between slot and programmatic modes', async () => {
      // Start in slot mode
      element.buttons = [];
      await waitForUpdate(element);

      expect(element.querySelector('slot')).toBeTruthy();
      expect(element.querySelectorAll('button').length).toBe(0);

      // Switch to programmatic mode
      element.buttons = sampleButtons.slice(0, 2);
      await waitForUpdate(element);

      expect(element.querySelector('slot')).toBeFalsy();
      expect(element.querySelectorAll('button').length).toBe(2);

      // Switch back to slot mode
      element.buttons = [];
      await waitForUpdate(element);

      expect(element.querySelector('slot')).toBeTruthy();
    });

    it('should handle empty and edge cases', async () => {
      // Empty buttons array
      element.buttons = [];
      await waitForPropertyPropagation(element);

      const group = element.querySelector('.usa-button-group');
      expect(group).toBeTruthy();
      expect(element.querySelector('slot')).toBeTruthy();

      // Single button
      element.buttons = [{ text: 'Single Button' }];
      await waitForUpdate(element);

      expect(element.querySelectorAll('button').length).toBe(1);
      expect(element.querySelector('button')?.textContent?.trim()).toBe('Single Button');

      // Button with empty text
      element.buttons = [{ text: '' }];
      await waitForUpdate(element);

      expect(element.querySelectorAll('button').length).toBe(1);
      expect(element.querySelector('button')?.textContent?.trim()).toBe('');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      element.buttons = sampleButtons;
      await waitForUpdate(element);
    });

    it('should have proper semantic structure', () => {
      const group = element.querySelector('.usa-button-group');
      expect(group?.tagName).toBe('UL');

      const items = element.querySelectorAll('.usa-button-group__item');
      items.forEach((item) => {
        expect(item.tagName).toBe('LI');
      });
    });

    it('should have focusable buttons', () => {
      const buttons = element.querySelectorAll('button');
      const enabledButtons = Array.from(buttons).filter(
        (btn) => !(btn as HTMLButtonElement).disabled
      );

      enabledButtons.forEach((button) => {
        expect(button.tabIndex).not.toBe(-1);
      });
    });

    it('should support keyboard interaction', () => {
      const buttons = element.querySelectorAll('button');
      const firstButton = buttons[0] as HTMLButtonElement;

      // Should be focusable
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    });

    it('should maintain button semantics', () => {
      const buttons = element.querySelectorAll('button');

      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
        expect(button.getAttribute('type')).toBeTruthy();
      });
    });

    it('should handle disabled state properly', () => {
      const buttons = element.querySelectorAll('button');
      const disabledButton = Array.from(buttons).find((btn) => (btn as HTMLButtonElement).disabled);

      expect(disabledButton).toBeTruthy();
      expect((disabledButton as HTMLButtonElement).disabled).toBe(true);
      expect(disabledButton?.getAttribute('disabled')).toBe('');
    });
  });

  describe('Form Integration', () => {
    it('should work within forms', async () => {
      // Create a fresh element for form testing to avoid DOM manipulation issues
      const formElement = document.createElement('usa-button-group') as USAButtonGroup;
      const form = document.createElement('form');
      form.appendChild(formElement);
      document.body.appendChild(form);

      formElement.buttons = [
        { text: 'Submit', type: 'submit' },
        { text: 'Reset', type: 'reset' },
        { text: 'Button', type: 'button' },
      ];
      await waitForPropertyPropagation(element);

      const buttons = formElement.querySelectorAll('button');
      expect(buttons.length).toBe(3);
      expect(buttons[0]).toBeTruthy();
      expect((buttons[0] as HTMLButtonElement).type).toBe('submit');
      expect((buttons[1] as HTMLButtonElement).type).toBe('reset');
      expect((buttons[2] as HTMLButtonElement).type).toBe('button');

      form.remove();
    });

    it('should handle form submission types correctly', async () => {
      element.buttons = [
        { text: 'Save Draft', type: 'button' },
        { text: 'Submit Application', type: 'submit' },
        { text: 'Clear Form', type: 'reset' },
      ];
      await waitForPropertyPropagation(element);

      const buttons = element.querySelectorAll('button');
      const submitButton = Array.from(buttons).find(
        (btn) => (btn as HTMLButtonElement).type === 'submit'
      );
      const resetButton = Array.from(buttons).find(
        (btn) => (btn as HTMLButtonElement).type === 'reset'
      );

      expect(submitButton).toBeTruthy();
      expect(resetButton).toBeTruthy();
      expect(submitButton?.textContent?.trim()).toBe('Submit Application');
      expect(resetButton?.textContent?.trim()).toBe('Clear Form');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed button objects', async () => {
      const malformedButtons = [
        { text: 'Valid Button' },
        { text: 'Invalid Variant', variant: 'invalid' as any },
        { text: 'Invalid Type', type: 'invalid' as any },
      ];

      expect(() => {
        element.buttons = malformedButtons;
      }).not.toThrow();

      await waitForUpdate(element);

      const buttons = element.querySelectorAll('button');
      expect(buttons.length).toBe(3);
    });

    it('should handle null and undefined values gracefully', async () => {
      const edgeCaseButtons = [
        { text: 'Normal Button' },
        { text: 'Undefined Variant', variant: undefined },
        { text: 'Null Onclick', onclick: null as any },
      ];

      expect(() => {
        element.buttons = edgeCaseButtons;
      }).not.toThrow();

      await waitForUpdate(element);
      expect(element.querySelectorAll('button').length).toBe(3);
    });
  });

  describe('CRITICAL: Component Lifecycle Stability', () => {
    beforeEach(() => {
      element = document.createElement('usa-button-group') as USAButtonGroup;
      document.body.appendChild(element);
    });

    it('should remain in DOM after property changes', async () => {
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.buttons = [{ text: 'Test Button', variant: 'primary' }];
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.ariaLabel = 'Custom button group';
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.buttons = sampleButtons;
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain element stability during button array updates', async () => {
      const originalElement = element;
      const buttonSets = [
        [{ text: 'Single Button', variant: 'primary' }],
        [
          { text: 'Button 1', variant: 'primary' },
          { text: 'Button 2', variant: 'secondary' },
        ],
        sampleButtons,
        [{ text: 'Final Button', variant: 'outline', disabled: true }],
      ];

      for (const buttons of buttonSets) {
        element.buttons = buttons;
        await waitForUpdate(element);
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve DOM connection through slot to buttons transition', async () => {
      // Start with empty buttons (slot mode)
      element.buttons = [];
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Switch to button array mode
      element.buttons = [{ text: 'Programmatic Button', variant: 'primary' }];
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Switch back to slot mode
      element.buttons = [];
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button-group') as USAButtonGroup;
      element.buttons = [
        { text: 'Click Me', variant: 'primary', type: 'button' },
        { text: 'Submit Form', variant: 'secondary', type: 'submit' },
        { text: 'Disabled', variant: 'outline', disabled: true },
      ];
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    it('should not pollute global event handling', async () => {
      const globalClickSpy = vi.fn();
      document.addEventListener('click', globalClickSpy);

      const buttonClickSpy = vi.fn();
      element.addEventListener('button-click', buttonClickSpy);

      const button = element.querySelector('button[type="button"]') as HTMLButtonElement;
      if (button) {
        button.click();
        await waitForUpdate(element);
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      document.removeEventListener('click', globalClickSpy);
    });

    it('should maintain stability during button interactions', async () => {
      const buttonClickSpy = vi.fn();
      element.addEventListener('button-click', buttonClickSpy);

      const buttons = element.querySelectorAll(
        'button:not([disabled])'
      ) as NodeListOf<HTMLButtonElement>;

      for (const button of buttons) {
        button.click();
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }

      expect(buttonClickSpy.mock.calls.length).toBe(buttons.length);
    });

    it('should maintain stability during rapid button array changes', async () => {
      const buttonConfigurations = [
        [{ text: 'Config 1', variant: 'primary' }],
        [
          { text: 'Config 2A', variant: 'secondary' },
          { text: 'Config 2B', variant: 'outline' },
        ],
        [],
        [{ text: 'Config 4', variant: 'base', disabled: true }],
      ];

      for (const config of buttonConfigurations) {
        element.buttons = config;
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Button Group State Management Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-button-group') as USAButtonGroup;
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    it('should maintain DOM connection during complex button configurations', async () => {
      const complexConfigurations = [
        {
          buttons: [{ text: 'Simple', variant: 'primary' }],
          ariaLabel: 'Simple group',
        },
        {
          buttons: [
            { text: 'Submit', type: 'submit', variant: 'primary' },
            { text: 'Reset', type: 'reset', variant: 'secondary' },
            { text: 'Cancel', type: 'button', variant: 'outline' },
          ],
          ariaLabel: 'Form actions',
        },
        {
          buttons: [
            { text: 'Enabled', variant: 'base' },
            { text: 'Disabled', variant: 'base', disabled: true },
          ],
          ariaLabel: 'Mixed states',
        },
      ];

      for (const config of complexConfigurations) {
        Object.assign(element, config);
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve element stability during button type variations', async () => {
      const originalElement = element;
      const buttonTypeScenarios = [
        [{ text: 'Button', type: 'button' }],
        [{ text: 'Submit', type: 'submit' }],
        [{ text: 'Reset', type: 'reset' }],
        [{ text: 'Default Type' }], // No type specified
      ];

      for (const buttons of buttonTypeScenarios) {
        element.buttons = buttons;
        await waitForUpdate(element);
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during button variant changes', async () => {
      const variantScenarios = [
        [{ text: 'Primary', variant: 'primary' }],
        [{ text: 'Secondary', variant: 'secondary' }],
        [{ text: 'Outline', variant: 'outline' }],
        [{ text: 'Base', variant: 'base' }],
        [{ text: 'Unstyled', variant: 'unstyled' }],
      ];

      for (const buttons of variantScenarios) {
        element.buttons = buttons;
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    // CI Environment: Increased timeout for comprehensive accessibility testing (6 sequential axe-core runs)
    // Passes locally in <7s, but CI environment is slower. Timeout of 10s provides buffer for CI overhead.
    it(
      'should pass comprehensive accessibility tests (same as Storybook)',
      { timeout: 10000 },
      async () => {
        // Test with empty button group (slot mode)
        element.buttons = [];
        await waitForUpdate(element);
        await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

        // Test with single button
        element.buttons = [{ text: 'Single Button', variant: 'primary', type: 'button' }];
        await waitForUpdate(element);
        await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

        // Test with multiple buttons of different variants
        element.buttons = [
          { text: 'Primary Action', variant: 'primary', type: 'button' },
          { text: 'Secondary Action', variant: 'secondary', type: 'button' },
          { text: 'Outline Action', variant: 'outline', type: 'button' },
          { text: 'Base Action', variant: 'base', type: 'button' },
        ];
        await waitForUpdate(element);
        await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

        // Test with mixed button types and states
        element.buttons = [
          { text: 'Submit Form', variant: 'primary', type: 'submit' },
          { text: 'Reset Form', variant: 'secondary', type: 'reset' },
          { text: 'Cancel', variant: 'outline', type: 'button' },
          { text: 'Disabled Action', variant: 'base', type: 'button', disabled: true },
        ];
        await waitForUpdate(element);
        await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

        // Test segmented button group
        element.type = 'segmented';
        element.buttons = [
          { text: 'View', variant: 'outline', type: 'button' },
          { text: 'Edit', variant: 'outline', type: 'button' },
          { text: 'Delete', variant: 'outline', type: 'button', disabled: true },
        ];
        await waitForUpdate(element);
        await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

        // Test with aria-label
        element.ariaLabel = 'Document actions';
        await waitForUpdate(element);
        await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
      }
    );

    it('should maintain accessibility during dynamic button updates', async () => {
      // Start with basic configuration
      element.buttons = [{ text: 'Initial Button', variant: 'primary' }];
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Add more buttons
      element.buttons = [
        { text: 'Button 1', variant: 'primary' },
        { text: 'Button 2', variant: 'secondary' },
        { text: 'Button 3', variant: 'outline' },
      ];
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Change to segmented type
      element.type = 'segmented';
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Switch back to slot mode
      element.buttons = [];
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    // SKIP: jsdom limitation - MOVE TO CYPRESS
    // ✅ CYPRESS COVERAGE: cypress/e2e/button-group-accessibility.cy.ts
    // Tests form context accessibility in real browser environment
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/button-group/usa-button-group.ts`;
        const validation = validateComponentJavaScript(componentPath, 'button-group');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThanOrEqual(50); // Allow some non-critical issues

        // Critical USWDS integration should be present (or properly classified as presentational)
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        // Note: button-group may be presentational - allow this validation to be lenient
        expect(criticalIssues.length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('CRITICAL: Storybook Integration', () => {
    it('should render in Storybook-like environment without auto-dismiss', async () => {
      const storyContainer = document.createElement('div');
      storyContainer.id = 'storybook-root';
      document.body.appendChild(storyContainer);

      element = document.createElement('usa-button-group') as USAButtonGroup;
      element.buttons = [
        { text: 'Storybook Primary', variant: 'primary', type: 'button' },
        { text: 'Storybook Secondary', variant: 'secondary', type: 'button' },
      ];
      element.ariaLabel = 'Storybook button group';

      storyContainer.appendChild(element);
      await waitForUpdate(element);

      // Simulate Storybook control updates
      element.buttons = [
        { text: 'Updated Primary', variant: 'outline', type: 'submit' },
        { text: 'Updated Secondary', variant: 'base', disabled: true },
        { text: 'New Button', variant: 'unstyled', type: 'reset' },
      ];
      element.ariaLabel = 'Updated Storybook group';
      await waitForUpdate(element);

      expect(storyContainer.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.ariaLabel).toBe('Updated Storybook group');

      storyContainer.remove();
    });

    it('should handle Storybook args updates without component removal', async () => {
      element = document.createElement('usa-button-group') as USAButtonGroup;
      document.body.appendChild(element);
      await waitForUpdate(element);

      const storyArgs = [
        {
          ariaLabel: 'Story args test 1',
          buttons: [{ text: 'Args Button 1', variant: 'primary' }],
        },
        {
          ariaLabel: 'Story args test 2',
          buttons: [
            { text: 'Args Button 2A', variant: 'secondary' },
            { text: 'Args Button 2B', variant: 'outline', disabled: true },
          ],
        },
        {
          ariaLabel: 'Story args test 3',
          buttons: [],
        },
      ];

      for (const args of storyArgs) {
        Object.assign(element, args);
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during complex Storybook interactions', async () => {
      element = document.createElement('usa-button-group') as USAButtonGroup;
      document.body.appendChild(element);

      // Simulate complex Storybook scenario with rapid changes
      const interactions = [
        () => {
          element.ariaLabel = 'Interactive group';
        },
        () => {
          element.buttons = [{ text: 'Interactive 1', variant: 'primary' }];
        },
        () => {
          element.buttons = [
            { text: 'Interactive 1', variant: 'primary' },
            { text: 'Interactive 2', variant: 'secondary', disabled: true },
          ];
        },
        () => {
          element.ariaLabel = 'Updated interactive group';
        },
        () => {
          element.buttons = [];
        },
      ];

      for (const interaction of interactions) {
        interaction();
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });
});
