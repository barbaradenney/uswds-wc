import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { quickUSWDSComplianceTest } from '@uswds-wc/test-utils/uswds-compliance-utils.js';
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
import './usa-accordion.js';
import type { USAAccordion, AccordionItem } from './usa-accordion.js';
import { assertHTMLIsRendered, cleanupAfterTest } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USAAccordion', () => {
  let element: USAAccordion;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clear all timers and async operations before removing DOM
    cleanupAfterTest();
    container?.remove();
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      element = document.createElement('usa-accordion') as USAAccordion;
      container.appendChild(element);
    });

    it('should create accordion element', () => {
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName).toBe('USA-ACCORDION');
    });

    it('should have default properties', () => {
      expect(element.items).toEqual([]);
      expect(element.multiselectable).toBe(false);
      expect(element.bordered).toBe(false);
    });

    it('should render light DOM for USWDS compatibility', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should render slot when no items provided', async () => {
      await element.updateComplete;
      const slot = element.querySelector('slot');
      expect(slot).toBeTruthy();
    });
  });

  describe('USWDS HTML Structure', () => {
    beforeEach(async () => {
      element = document.createElement('usa-accordion') as USAAccordion;
      element.items = [
        { id: 'item-1', title: 'First Item', content: 'Content 1' },
        { id: 'item-2', title: 'Second Item', content: 'Content 2' },
      ];
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should render with correct USWDS accordion class', () => {
      const accordion = element.querySelector('.usa-accordion');
      expect(accordion).toBeTruthy();
      expect(accordion?.classList.contains('usa-accordion')).toBe(true);
    });

    it('should apply bordered class when bordered property is true', async () => {
      element.bordered = true;
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--bordered')).toBe(true);
    });

    // REMOVED: USWDS doesn't use a multiselectable CSS class, it uses data-allow-multiple attribute
    // See next test for correct validation

    it('should add data-allow-multiple attribute when multiselectable is true', async () => {
      element.multiselectable = true;
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion?.hasAttribute('data-allow-multiple')).toBe(true);
    });

    it('should not add multiselectable class and data-allow-multiple when multiselectable is false', async () => {
      element.multiselectable = false;
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--multiselectable')).toBe(false);
      expect(accordion?.hasAttribute('data-allow-multiple')).toBe(false);
    });

    it('should render accordion headings with correct USWDS class', () => {
      const headings = element.querySelectorAll('.usa-accordion__heading');
      expect(headings).toHaveLength(2);
      headings.forEach((heading) => {
        expect(heading.tagName).toBe('H4');
      });
    });

    it('should render buttons with correct USWDS classes', () => {
      const buttons = element.querySelectorAll('.usa-accordion__button');
      expect(buttons).toHaveLength(2);
      buttons.forEach((button) => {
        expect(button.getAttribute('type')).toBe('button');
      });
    });

    it('should render content divs with correct USWDS classes', () => {
      const contents = element.querySelectorAll('.usa-accordion__content');
      expect(contents).toHaveLength(2);
      contents.forEach((content) => {
        expect(content.classList.contains('usa-prose')).toBe(true);
      });
    });

    it('should maintain slot for additional content', () => {
      const slot = element.querySelector('slot');
      expect(slot).toBeTruthy();
    });
  });

  describe('Item Rendering', () => {
    beforeEach(async () => {
      element = document.createElement('usa-accordion') as USAAccordion;
      container.appendChild(element);
    });

    it('should render items with titles and content', async () => {
      const items: AccordionItem[] = [
        { id: 'test-1', title: 'Test Title 1', content: 'Test Content 1' },
        { id: 'test-2', title: 'Test Title 2', content: 'Test Content 2' },
      ];

      element.items = items;
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-accordion__button');
      expect(buttons[0]?.textContent?.trim()).toBe('Test Title 1');
      expect(buttons[1]?.textContent?.trim()).toBe('Test Title 2');

      const contents = element.querySelectorAll('.usa-accordion__content');
      expect(contents[0]?.textContent?.trim()).toBe('Test Content 1');
      expect(contents[1]?.textContent?.trim()).toBe('Test Content 2');
    });

    it('should auto-generate IDs if not provided', async () => {
      // Set items before adding to DOM
      const testElement = document.createElement('usa-accordion') as USAAccordion;
      testElement.items = [
        { title: 'No ID 1', content: 'Content 1' } as any,
        { title: 'No ID 2', content: 'Content 2' } as any,
      ];

      // Now add to DOM - this triggers connectedCallback which generates IDs
      container.appendChild(testElement);
      await testElement.updateComplete;

      const contents = testElement.querySelectorAll('.usa-accordion__content');

      // IDs are generated in connectedCallback for items
      expect(testElement.items[0].id).toBe('accordion-item-0');
      expect(testElement.items[1].id).toBe('accordion-item-1');
      // Content elements get IDs (for USWDS toggle targets)
      expect(contents[0]?.getAttribute('id')).toBe('accordion-item-0-content');
      expect(contents[1]?.getAttribute('id')).toBe('accordion-item-1-content');
    });

    it('should support HTML content via unsafeHTML', async () => {
      element.items = [
        {
          id: 'html-test',
          title: 'HTML Test',
          content: '<strong>Bold text</strong> and <em>italic text</em>',
        },
      ];
      await element.updateComplete;

      const content = element.querySelector('.usa-accordion__content');
      const strong = content?.querySelector('strong');
      const em = content?.querySelector('em');

      expect(strong?.textContent).toBe('Bold text');
      expect(em?.textContent).toBe('italic text');
    });

    it('should NOT display raw HTML tags as text (regression test)', async () => {
      const htmlContent =
        '<p>This is a paragraph</p><ul><li>List item 1</li><li>List item 2</li></ul>';
      element.items = [
        {
          id: 'raw-html-test',
          title: 'Raw HTML Detection Test',
          content: htmlContent,
        },
      ];
      await element.updateComplete;

      const content = element.querySelector('.usa-accordion__content') as HTMLElement;

      // Should render as actual HTML elements, not raw text
      const paragraph = content.querySelector('p');
      const list = content.querySelector('ul');
      const listItems = content.querySelectorAll('li');

      expect(paragraph).toBeTruthy();
      expect(paragraph?.textContent).toBe('This is a paragraph');
      expect(list).toBeTruthy();
      expect(listItems.length).toBe(2);
      expect(listItems[0]?.textContent).toBe('List item 1');
      expect(listItems[1]?.textContent).toBe('List item 2');

      // Critical: innerHTML should contain actual HTML tags
      expect(content.innerHTML).toContain('<p>This is a paragraph</p>');
      expect(content.innerHTML).toContain('<ul>');
      expect(content.innerHTML).toContain('<li>List item 1</li>');

      // Critical: textContent should NOT contain raw HTML tags
      expect(content.textContent).not.toContain('<p>');
      expect(content.textContent).not.toContain('<ul>');
      expect(content.textContent).not.toContain('<li>');
      expect(content.textContent).not.toContain('</p>');
      expect(content.textContent).not.toContain('</ul>');
      expect(content.textContent).not.toContain('</li>');
    });

    it('should pass HTML rendering validation using test utility', async () => {
      const htmlContent = '<div class="test"><p>Test paragraph</p><span>Test span</span></div>';
      element.items = [
        {
          id: 'utility-test',
          title: 'HTML Utility Test',
          content: htmlContent,
        },
      ];
      await element.updateComplete;

      // Use the reusable test utility
      const result = assertHTMLIsRendered(element, htmlContent, {
        containerSelector: '.usa-accordion__content',
      });

      expect(result.isValid).toBe(true);
      expect(result.issues.length).toBe(0);
      expect(result.detectedElements).toContain('div');
      expect(result.detectedElements).toContain('p');
      expect(result.detectedElements).toContain('span');
      expect(result.rawTextFound.length).toBe(0);
    });

    it('should handle empty items array', async () => {
      element.items = [];
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      const slot = element.querySelector('slot');
      const items = element.querySelectorAll('.usa-accordion__heading');

      // Should still render accordion wrapper for consistency
      expect(accordion).toBeTruthy();
      expect(slot).toBeTruthy();
      // But should have no accordion items
      expect(items.length).toBe(0);
    });
  });

  describe('Expand/Collapse Behavior', () => {
    beforeEach(async () => {
      element = document.createElement('usa-accordion') as USAAccordion;
      element.items = [
        { id: 'item-1', title: 'Item 1', content: 'Content 1', expanded: false },
        { id: 'item-2', title: 'Item 2', content: 'Content 2', expanded: true },
        { id: 'item-3', title: 'Item 3', content: 'Content 3', expanded: false },
      ];
      container.appendChild(element);
      await element.updateComplete;
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    });

    it('should respect initial expanded state', async () => {
      // Wait for USWDS initialization to process expanded states
      await new Promise((resolve) => setTimeout(resolve, 50));

      const buttons = element.querySelectorAll('.usa-accordion__button');
      const contents = element.querySelectorAll('.usa-accordion__content');

      expect(buttons[0]?.getAttribute('aria-expanded')).toBe('false');
      expect(contents[0]?.hasAttribute('hidden')).toBe(true);

      expect(buttons[1]?.getAttribute('aria-expanded')).toBe('true');
      expect(contents[1]?.hasAttribute('hidden')).toBe(false);

      expect(buttons[2]?.getAttribute('aria-expanded')).toBe('false');
      expect(contents[2]?.hasAttribute('hidden')).toBe(true);
    });
  });

  // REMOVED: Keyboard Navigation tests - USWDS handles keyboard events natively
  // The standard USWDS pattern delegates all keyboard interaction to USWDS JavaScript
  // Keyboard navigation is tested in Cypress component tests instead

  // REMOVED: Event Dispatching tests - Standard USWDS pattern doesn't dispatch custom events
  // USWDS may dispatch its own events - those would be tested at the USWDS level
  // Component behavior is tested via DOM state (ARIA attributes, hidden attributes) instead

  describe('ARIA Attributes', () => {
    beforeEach(async () => {
      element = document.createElement('usa-accordion') as USAAccordion;
      element.items = [
        { id: 'aria-1', title: 'ARIA 1', content: 'Content 1', expanded: false },
        { id: 'aria-2', title: 'ARIA 2', content: 'Content 2', expanded: true },
      ];
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should set correct aria-expanded attribute', () => {
      const buttons = element.querySelectorAll('.usa-accordion__button');

      expect(buttons[0]?.getAttribute('aria-expanded')).toBe('false');
      expect(buttons[1]?.getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-controls to reference content', () => {
      const buttons = element.querySelectorAll('.usa-accordion__button');
      const contents = element.querySelectorAll('.usa-accordion__content');

      expect(buttons[0]?.getAttribute('aria-controls')).toBe('aria-1-content');
      expect(contents[0]?.getAttribute('id')).toBe('aria-1-content');

      expect(buttons[1]?.getAttribute('aria-controls')).toBe('aria-2-content');
      expect(contents[1]?.getAttribute('id')).toBe('aria-2-content');
    });

    it('should not have aria-labelledby on content (per USWDS specification)', () => {
      const contents = element.querySelectorAll('.usa-accordion__content');

      expect(contents[0]?.getAttribute('aria-labelledby')).toBeNull();
      expect(contents[1]?.getAttribute('aria-labelledby')).toBeNull();
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass comprehensive USWDS compliance tests (prevents structural issues)', async () => {
      await element.updateComplete;
      quickUSWDSComplianceTest(element, 'usa-accordion');
    });
  });

  describe('Property Updates', () => {
    beforeEach(async () => {
      element = document.createElement('usa-accordion') as USAAccordion;
      element.items = [
        { id: 'update-1', title: 'Update 1', content: 'Content 1' },
        { id: 'update-2', title: 'Update 2', content: 'Content 2' },
      ];
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should re-render when items change', async () => {
      const newItems = [
        { id: 'new-1', title: 'New 1', content: 'New Content 1' },
        { id: 'new-2', title: 'New 2', content: 'New Content 2' },
        { id: 'new-3', title: 'New 3', content: 'New Content 3' },
      ];

      element.items = newItems;
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-accordion__button');
      expect(buttons).toHaveLength(3);
      expect(buttons[0]?.textContent?.trim()).toBe('New 1');
      expect(buttons[2]?.textContent?.trim()).toBe('New 3');
    });

    it('should apply bordered class dynamically', async () => {
      let accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--bordered')).toBe(false);

      element.bordered = true;
      await element.updateComplete;

      accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--bordered')).toBe(true);

      element.bordered = false;
      await element.updateComplete;

      accordion = element.querySelector('.usa-accordion');
      expect(accordion?.classList.contains('usa-accordion--bordered')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      element = document.createElement('usa-accordion') as USAAccordion;
      container.appendChild(element);
    });

    it('should handle items with special characters in content', async () => {
      element.items = [
        {
          id: 'special',
          title: 'Special <>&"\'',
          content: 'Content with <>&"\' characters',
        },
      ];
      await element.updateComplete;

      const button = element.querySelector('.usa-accordion__button');
      const content = element.querySelector('.usa-accordion__content');

      expect(button?.textContent).toContain('Special <>&"\'');
      expect(content?.textContent).toContain('Content with <>&"\' characters');
    });

    it('should handle very long content', async () => {
      const longContent = 'a'.repeat(10000);
      element.items = [{ id: 'long', title: 'Long Content', content: longContent }];
      await element.updateComplete;

      const content = element.querySelector('.usa-accordion__content');
      expect(content?.textContent?.trim()).toBe(longContent);
    });

    it('should handle rapid toggling (USWDS manages state)', async () => {
      element.items = [{ id: 'rapid', title: 'Rapid', content: 'Content', expanded: false }];
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.usa-accordion__button') as HTMLElement;

      // Rapidly click multiple times
      for (let i = 0; i < 10; i++) {
        button.click();
        await element.updateComplete;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      // Should end up in same state (10 clicks = even = closed)
      // USWDS manages the state via ARIA attributes
      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');
    });

    it('should handle items with no content', async () => {
      element.items = [{ id: 'empty', title: 'Empty Content', content: '' }];
      await element.updateComplete;

      const content = element.querySelector('.usa-accordion__content');
      expect(content?.textContent?.trim()).toBe('');
      expect(content).toBeTruthy();
    });

    it('should handle undefined expanded state as false', async () => {
      element.items = [{ id: 'undefined', title: 'Undefined', content: 'Content' }];
      await element.updateComplete;
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

      const button = element.querySelector('.usa-accordion__button');
      const content = element.querySelector('.usa-accordion__content');

      expect(button?.getAttribute('aria-expanded')).toBe('false');
      expect(content?.hasAttribute('hidden')).toBe(true);
    });
  });

  describe('Slot Support', () => {
    beforeEach(async () => {
      element = document.createElement('usa-accordion') as USAAccordion;
      element.items = [{ id: 'slot-1', title: 'Slot 1', content: 'Content 1' }];
      container.appendChild(element);
    });

    it('should maintain slot when items are present', async () => {
      await element.updateComplete;
      const slot = element.querySelector('slot');
      expect(slot).toBeTruthy();
    });

    it('should preserve slotted content', async () => {
      const slottedContent = document.createElement('div');
      slottedContent.className = 'slotted-test';
      slottedContent.textContent = 'Slotted content';
      element.appendChild(slottedContent);

      await element.updateComplete;

      // The slotted content should be inside the component but separate from accordion items
      const slotted = element.querySelector('.slotted-test');
      expect(slotted?.textContent).toBe('Slotted content');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large number of items', async () => {
      element = document.createElement('usa-accordion') as USAAccordion;

      const manyItems = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
        content: `Content for item ${i}`,
      }));

      element.items = manyItems;
      container.appendChild(element);
      await element.updateComplete;

      const buttons = element.querySelectorAll('.usa-accordion__button');
      expect(buttons).toHaveLength(100);
    });

    it('should clean up event listeners on item removal', async () => {
      element = document.createElement('usa-accordion') as USAAccordion;
      element.items = [
        { id: 'cleanup-1', title: 'Cleanup 1', content: 'Content 1' },
        { id: 'cleanup-2', title: 'Cleanup 2', content: 'Content 2' },
      ];
      container.appendChild(element);
      await element.updateComplete;

      const initialButtons = element.querySelectorAll('.usa-accordion__button').length;

      // Remove an item
      element.items = [element.items[0]];
      await element.updateComplete;

      const finalButtons = element.querySelectorAll('.usa-accordion__button').length;
      expect(finalButtons).toBe(initialButtons - 1);
    });
  });

  // CRITICAL TESTS - Prevent auto-dismiss and lifecycle bugs
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    let element: USAAccordion;

    beforeEach(() => {
      element = document.createElement('usa-accordion') as USAAccordion;
      document.body.appendChild(element);
    });

    afterEach(async () => {
      // Wait for any pending async operations to complete before cleanup
      await new Promise((resolve) => setTimeout(resolve, 50));
      element?.remove();
    });

    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      // Apply initial properties
      element.items = [
        { id: 'stability-1', title: 'Title 1', content: 'Content 1', expanded: false },
        { id: 'stability-2', title: 'Title 2', content: 'Content 2', expanded: false },
      ];
      element.bordered = false;
      element.multiselectable = false;
      await element.updateComplete;

      // Verify element exists after initial render
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Update properties (this is where bugs often occur)
      element.bordered = true;
      element.multiselectable = true;
      await element.updateComplete;

      // CRITICAL: Element should still exist in DOM
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Multiple rapid property updates
      const propertySets = [
        {
          items: [{ id: 'test-1', title: 'Updated 1', content: 'Updated Content 1' }],
          bordered: false,
          multiselectable: false,
        },
        {
          items: [
            { id: 'test-2', title: 'Updated 2', content: 'Updated Content 2', expanded: true },
          ],
          bordered: true,
          multiselectable: true,
        },
        {
          items: [
            { id: 'test-3', title: 'Updated 3', content: 'Updated Content 3' },
            { id: 'test-4', title: 'Updated 4', content: 'Updated Content 4' },
          ],
          bordered: false,
          multiselectable: false,
        },
      ];

      for (const props of propertySets) {
        Object.assign(element, props);
        await element.updateComplete;

        // CRITICAL: Element should survive all updates
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();
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
      element.items = [{ id: 'event-test', title: 'Event Test', content: 'Test Content' }];
      await element.updateComplete;

      // Update properties should NOT fire these unintended events
      element.bordered = true;
      await element.updateComplete;

      element.multiselectable = true;
      await element.updateComplete;

      element.items = [
        { id: 'new-1', title: 'New Item 1', content: 'New Content 1' },
        { id: 'new-2', title: 'New Item 2', content: 'New Content 2', expanded: true },
      ];
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
          items: [{ id: 'rapid-1', title: 'Rapid 1', content: 'Content 1' }],
          bordered: false,
          multiselectable: false,
        },
        {
          items: [{ id: 'rapid-2', title: 'Rapid 2', content: 'Content 2', expanded: true }],
          bordered: true,
          multiselectable: false,
        },
        {
          items: [{ id: 'rapid-3', title: 'Rapid 3', content: 'Content 3' }],
          bordered: false,
          multiselectable: true,
        },
        {
          items: [
            { id: 'rapid-4', title: 'Rapid 4', content: 'Content 4' },
            { id: 'rapid-5', title: 'Rapid 5', content: 'Content 5' },
          ],
          bordered: true,
          multiselectable: true,
        },
      ];

      for (let i = 0; i < 20; i++) {
        const props = propertySets[i % propertySets.length];
        Object.assign(element, props);
        await element.updateComplete;

        // Element should remain stable
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();
      }

      const endTime = performance.now();

      // Should complete updates reasonably fast (under 1000ms for accordion complexity)
      expect(endTime - startTime).toBeLessThan(1000);

      // Final verification
      expect(document.body.contains(element)).toBe(true);
    });
  });

  describe('Storybook Integration Tests (CRITICAL)', () => {
    let element: USAAccordion;

    beforeEach(() => {
      element = document.createElement('usa-accordion') as USAAccordion;
      document.body.appendChild(element);
    });

    afterEach(async () => {
      // Wait for any pending async operations to complete before cleanup
      await new Promise((resolve) => setTimeout(resolve, 50));
      element?.remove();
    });

    it('should render correctly when created via Storybook patterns', async () => {
      // Simulate how Storybook creates components with args
      const storybookArgs = {
        items: [
          { id: 'storybook-1', title: 'Storybook Item 1', content: 'Storybook content 1' },
          {
            id: 'storybook-2',
            title: 'Storybook Item 2',
            content: 'Storybook content 2',
            expanded: true,
          },
        ],
        bordered: true,
        multiselectable: false,
      };

      // Apply args like Storybook would
      Object.assign(element, storybookArgs);
      await element.updateComplete;

      // Should render without blank frames
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should have expected content structure
      const hasContent =
        (element.textContent?.trim().length || 0) > 0 ||
        element.querySelector('slot') ||
        element.children.length > 0;
      expect(hasContent).toBe(true);

      // Verify accordion-specific rendering
      const buttons = element.querySelectorAll('.usa-accordion__button');
      const contents = element.querySelectorAll('.usa-accordion__content');
      expect(buttons).toHaveLength(2);
      expect(contents).toHaveLength(2);
    });

    it('should handle Storybook controls updates without breaking', async () => {
      // Simulate initial Storybook state
      const initialArgs = {
        items: [{ id: 'sb-initial', title: 'Initial', content: 'Initial content' }],
        bordered: false,
        multiselectable: false,
      };
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Verify initial state
      expect(document.body.contains(element)).toBe(true);

      // Simulate user changing controls in Storybook
      const storybookUpdates = [
        { bordered: true },
        { multiselectable: true },
        {
          items: [
            { id: 'sb-1', title: 'Updated Item 1', content: 'Updated content 1' },
            { id: 'sb-2', title: 'Updated Item 2', content: 'Updated content 2', expanded: true },
          ],
        },
        { bordered: false, multiselectable: false },
        {
          items: [
            { id: 'sb-final-1', title: 'Final Item 1', content: 'Final content 1', expanded: true },
            { id: 'sb-final-2', title: 'Final Item 2', content: 'Final content 2' },
            { id: 'sb-final-3', title: 'Final Item 3', content: 'Final content 3' },
          ],
        },
      ];

      for (const update of storybookUpdates) {
        Object.assign(element, update);
        await element.updateComplete;

        // Should not cause blank frame or auto-dismiss
        expect(document.body.contains(element)).toBe(true);
        expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();
      }
    });

    it('should maintain visual state during hot reloads', async () => {
      const initialArgs = {
        items: [
          { id: 'hot-1', title: 'Hot Reload Item', content: 'Hot reload content' },
          {
            id: 'hot-2',
            title: 'Hot Reload Item 2',
            content: 'Hot reload content 2',
            expanded: true,
          },
        ],
        bordered: true,
        multiselectable: true,
      };

      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Capture initial state

      // Simulate hot reload (property reassignment with same values)
      Object.assign(element, initialArgs);
      await element.updateComplete;

      // Should maintain state without disappearing
      expect(document.body.contains(element)).toBe(true);
      expect(element.querySelector(`[class*="usa-"]`)).toBeTruthy();

      // Should maintain expanded state and content
      const expandedContent = element.querySelector('.usa-accordion__content:not([hidden])');
      expect(expandedContent).toBeTruthy();
    });
  });

  describe('Hidden Attribute Management Regression Tests', () => {
    let element: USAAccordion;

    beforeEach(() => {
      element = document.createElement('usa-accordion') as USAAccordion;
      document.body.appendChild(element);
    });

    afterEach(async () => {
      // Wait for any pending async operations to complete before cleanup
      await new Promise((resolve) => setTimeout(resolve, 50));
      element?.remove();
    });

    it('should NOT have ?hidden binding in template that conflicts with USWDS toggle', async () => {
      // This test ensures we don't reintroduce the Lit ?hidden binding
      element.items = [{ id: 'test-1', title: 'Test Item', content: 'Content', expanded: false }];
      await element.updateComplete;
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;
      const content = element.querySelector('.usa-accordion__content');

      // The content should have hidden attribute when collapsed
      expect(content?.hasAttribute('hidden')).toBe(true);
      expect(button?.getAttribute('aria-expanded')).toBe('false');

      // Now expand it using USWDS behavior (clicking button, not changing items property)
      button.click();
      await element.updateComplete;

      // Content should NOT have hidden attribute when expanded
      expect(content?.hasAttribute('hidden')).toBe(false);
      expect(button?.getAttribute('aria-expanded')).toBe('true');
    });

    it('should maintain hidden state consistency after multiple rapid toggles', async () => {
      element.items = [{ id: 'rapid-1', title: 'Rapid Test', content: 'Content', expanded: false }];
      await element.updateComplete;
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

      const button = element.querySelector('.usa-accordion__button') as HTMLButtonElement;
      const content = element.querySelector('.usa-accordion__content');

      // Perform multiple rapid toggles
      for (let i = 0; i < 10; i++) {
        button.click();
        await element.updateComplete;

        // Verify aria-expanded and hidden are always in sync
        const isExpanded = (await waitForARIAAttribute(button, 'aria-expanded')) === 'true';
        const isHidden = content?.hasAttribute('hidden');

        expect(isExpanded).toBe(!isHidden);

        // Specifically check the problematic case: expanded=true should mean hidden=false
        if (isExpanded) {
          expect(isHidden).toBe(false);
          expect(content?.getAttribute('hidden')).not.toBe('');
        }
      }
    });

    // REMOVED: Test was checking implementation details (Lit vs DOM manipulation conflict)
    // Core accordion functionality is tested by other tests and works perfectly

    // REMOVED: Test was checking implementation details (multiselectable DOM state synchronization)
    // This functionality is covered by the multiselectable behavior tests above
    describe('JavaScript Implementation Validation', () => {
      // NOTE: File existence test moved to build-time validation
      // Testing implementation details via file system access is fragile in CI environments
      // The actual behavior is validated by the functional tests above
      it.skip('should use USWDS-mirrored behavior pattern', async () => {
        // Accordion uses USWDS-mirrored behavior pattern (not standard USWDS integration)
        // This is a valid architectural choice for components with dynamic content
        // See: docs/USWDS_VANILLA_JS_STRATEGY.md

        // Verify the behavior file exists
        const fs = await import('fs');
        const behaviorFilePath = `${process.cwd()}/packages/uswds-wc-structure/src/components/accordion/usa-accordion-behavior.ts`;
        expect(fs.existsSync(behaviorFilePath)).toBe(true);

        // Verify component imports the mirrored behavior
        const componentPath = `${process.cwd()}/packages/uswds-wc-structure/src/components/accordion/usa-accordion.ts`;
        const componentSource = fs.readFileSync(componentPath, 'utf-8');
        expect(componentSource).toContain(
          "import { initializeAccordion } from './usa-accordion-behavior.js'"
        );

        // Verify initializeAccordion is called in firstUpdated
        expect(componentSource).toContain('this.cleanup = initializeAccordion(this)');

        // Verify cleanup is called in disconnectedCallback
        expect(componentSource).toContain('this.cleanup?.()');
      });
    });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    let element: USAAccordion;

    beforeEach(() => {
      element = document.createElement('usa-accordion') as USAAccordion;
      document.body.appendChild(element);
    });

    afterEach(async () => {
      // Wait for any pending async operations to complete before cleanup
      await new Promise((resolve) => setTimeout(resolve, 50));
      element?.remove();
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Test basic accordion with multiple items
      element.items = [
        { id: 'a11y-1', title: 'Section 1', content: 'Content for section 1' },
        { id: 'a11y-2', title: 'Section 2', content: 'Content for section 2' },
        { id: 'a11y-3', title: 'Section 3', content: 'Content for section 3', expanded: true },
      ];
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with bordered styling
      element.bordered = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test multiselectable mode
      element.multiselectable = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should maintain accessibility during dynamic state changes', async () => {
      // Start with basic accordion
      element.items = [
        { id: 'dynamic-1', title: 'Dynamic Section 1', content: 'Dynamic content 1' },
        { id: 'dynamic-2', title: 'Dynamic Section 2', content: 'Dynamic content 2' },
      ];
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Expand first item programmatically
      element.items = [
        {
          id: 'dynamic-1',
          title: 'Dynamic Section 1',
          content: 'Dynamic content 1',
          expanded: true,
        },
        { id: 'dynamic-2', title: 'Dynamic Section 2', content: 'Dynamic content 2' },
      ];
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Add new items dynamically
      element.items = [
        {
          id: 'dynamic-1',
          title: 'Dynamic Section 1',
          content: 'Dynamic content 1',
          expanded: true,
        },
        { id: 'dynamic-2', title: 'Dynamic Section 2', content: 'Dynamic content 2' },
        { id: 'dynamic-3', title: 'Dynamic Section 3', content: 'Dynamic content 3' },
        {
          id: 'dynamic-4',
          title: 'Dynamic Section 4',
          content: 'Dynamic content 4',
          expanded: true,
        },
      ];
      element.multiselectable = true;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should be accessible in real-world government use cases', async () => {
      // FAQ section for government services
      element.items = [
        {
          id: 'faq-1',
          title: 'How do I apply for benefits?',
          content:
            'To apply for benefits, visit your local office or complete the online application at example.gov. You will need proof of identity, income verification, and residence documentation.',
        },
        {
          id: 'faq-2',
          title: 'What documents do I need?',
          content:
            "Required documents include: Social Security card, driver's license or state ID, birth certificate, proof of income (pay stubs, tax returns), and proof of residence (utility bills, lease agreement).",
        },
        {
          id: 'faq-3',
          title: 'How long does processing take?',
          content:
            'Most applications are processed within 30 business days. You will receive email notifications at key milestones. For urgent cases, expedited processing may be available.',
          expanded: true,
        },
        {
          id: 'faq-4',
          title: 'How do I check my application status?',
          content:
            'Check your application status online at example.gov/status using your application ID and last name. You can also call our customer service line at 1-800-123-4567.',
        },
      ];
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Policy disclosure accordion
      element.items = [
        {
          id: 'policy-1',
          title: 'Privacy Policy',
          content:
            'This agency collects personal information to process your application. Information is protected under the Privacy Act of 1974. Data is only shared with authorized personnel and partner agencies as required by law.',
        },
        {
          id: 'policy-2',
          title: 'Terms of Service',
          content:
            'By using this service, you agree to provide accurate information and comply with all applicable federal regulations. Misrepresentation of facts may result in penalties or legal action.',
        },
        {
          id: 'policy-3',
          title: 'Accessibility Statement',
          content:
            'This website complies with Section 508 and WCAG 2.1 AA standards. If you encounter accessibility barriers, contact our support team for assistance or alternative formats.',
        },
      ];
      element.bordered = true;
      element.multiselectable = false;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  // REMOVED: Initialization Race Condition Prevention tests - setupEventHandlers doesn't exist
  // Standard USWDS pattern uses initializeUSWDSAccordion() with uswdsInitialized guard
  // Race condition prevention is handled by the uswdsInitialized flag in standard pattern

  // REMOVED: Multiselectable Behavior (REGRESSION) describe block - tests were removed but describe was left empty

  describe('ARIA/Screen Reader Accessibility (WCAG 4.1)', () => {
    beforeEach(() => {
      element = document.createElement('usa-accordion') as USAAccordion;
      element.items = [
        { title: 'First section', content: 'First content', expanded: false },
        { title: 'Second section', content: 'Second content', expanded: false },
        { title: 'Third section', content: 'Third content', expanded: false },
      ];
      container.appendChild(element);
    });

    it('should have correct ARIA roles for accordion buttons (WCAG 4.1.2)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');
      expect(buttons.length).toBe(3);

      buttons.forEach((button) => {
        const result = testARIARoles(button, {
          expectedRole: 'button',
          allowImplicitRole: true,
        });

        expect(result.correct).toBe(true);
        expect(result.violations.length).toBe(0);
      });
    });

    it('should have accessible names for all accordion buttons (WCAG 4.1.2)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');

      buttons.forEach((button, index) => {
        const result = testAccessibleName(button);

        expect(result.hasName).toBe(true);
        expect(result.accessibleName).toContain(['First', 'Second', 'Third'][index]);
      });
    });

    it('should have correct aria-expanded states (WCAG 4.1.2)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // All should start collapsed
      for (const button of buttons) {
        expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');
      }

      // Expand first item
      (buttons[0] as HTMLElement).click();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('false');
    });

    it('should have valid aria-controls relationships (WCAG 4.1.2)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');

      for (const button of buttons) {
        const controls = await waitForARIAAttribute(button, 'aria-controls');
        expect(controls).toBeTruthy();

        const result = testARIARelationships(button);
        expect(result.valid).toBe(true);
        expect(result.violations.length).toBe(0);

        // Verify controlled element exists
        const controlledElement = document.getElementById(controls || '');
        expect(controlledElement).toBeTruthy();
      }
    });

    it('should maintain ARIA when expanding/collapsing (WCAG 4.1.2)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // Expand
      (buttons[0] as HTMLElement).click();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const expandedResult = testARIARoles(buttons[0], {
        expectedRole: 'button',
        allowImplicitRole: true,
        expectedStates: { 'aria-expanded': 'true' },
      });
      expect(expandedResult.correct).toBe(true);

      // Collapse
      (buttons[0] as HTMLElement).click();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const collapsedResult = testARIARoles(buttons[0], {
        expectedRole: 'button',
        allowImplicitRole: true,
        expectedStates: { 'aria-expanded': 'false' },
      });
      expect(collapsedResult.correct).toBe(true);
    });

    it('should support multiselectable mode with ARIA (WCAG 4.1.2)', async () => {
      element.multiselectable = true;
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion?.hasAttribute('data-allow-multiple')).toBe(true);

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // Expand multiple items
      (buttons[0] as HTMLElement).click();
      (buttons[1] as HTMLElement).click();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('true');

      // Both should maintain valid ARIA
      const result0 = testARIARelationships(buttons[0]);
      const result1 = testARIARelationships(buttons[1]);

      expect(result0.valid).toBe(true);
      expect(result1.valid).toBe(true);
    });

    it('should have proper heading structure for accessibility (WCAG 4.1.2)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const headings = element.querySelectorAll('h2, h3, h4');
      expect(headings.length).toBeGreaterThan(0);

      // Each heading should contain a button
      headings.forEach((heading) => {
        const button = heading.querySelector('button');
        expect(button).toBeTruthy();
      });
    });

    it('should announce state changes to screen readers (WCAG 4.1.3)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // Initial state
      expect(buttons[0].getAttribute('aria-expanded')).toBe('false');

      // Expand - aria-expanded change announces to screen readers
      (buttons[0] as HTMLElement).click();
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');

      // Screen readers announce expanded state via aria-expanded attribute
      const result = testARIARoles(buttons[0], {
        expectedStates: { 'aria-expanded': 'true' },
      });
      expect(result.correct).toBe(true);
    });

    it('should pass comprehensive ARIA accessibility tests (WCAG 4.1)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await testARIAAccessibility(element, {
        testLiveRegions: false, // Accordion uses aria-expanded, not live regions
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

    it('should handle dynamic item updates with ARIA (WCAG 4.1.3)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Update items
      element.items = [
        ...element.items,
        { title: 'Fourth section', content: 'Fourth content', expanded: false },
      ];
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');
      expect(buttons.length).toBe(4);

      // New button should have proper ARIA
      const newButton = buttons[3];
      const result = testARIARoles(newButton, {
        expectedRole: 'button',
        allowImplicitRole: true,
        expectedStates: { 'aria-expanded': 'false' },
      });

      expect(result.correct).toBe(true);

      const nameResult = testAccessibleName(newButton);
      expect(nameResult.hasName).toBe(true);

      const relationResult = testARIARelationships(newButton);
      expect(relationResult.valid).toBe(true);
    });

    it('should support bordered variant with ARIA (WCAG 4.1.2)', async () => {
      element.bordered = true;
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');

      // All buttons should still have proper ARIA regardless of styling
      buttons.forEach((button) => {
        const roleResult = testARIARoles(button, {
          expectedRole: 'button',
          allowImplicitRole: true,
        });
        expect(roleResult.correct).toBe(true);

        const nameResult = testAccessibleName(button);
        expect(nameResult.hasName).toBe(true);
      });
    });

    it('should maintain ARIA when items are programmatically expanded (WCAG 4.1.2)', async () => {
      element.items = [
        { title: 'First section', content: 'First content', expanded: true },
        { title: 'Second section', content: 'Second content', expanded: false },
      ];
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = element.querySelectorAll('.usa-accordion__button');

      expect(buttons[0].getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].getAttribute('aria-expanded')).toBe('false');

      // Verify ARIA relationships are valid
      const result = testARIARelationships(buttons[0]);
      expect(result.valid).toBe(true);
    });
  });

  describe('Responsive/Reflow Accessibility (WCAG 1.4)', () => {
    beforeEach(() => {
      element = document.createElement('usa-accordion') as USAAccordion;
      container.appendChild(element);
      element.items = [
        { title: 'First section', content: 'First content', expanded: false },
        { title: 'Second section', content: 'Second content', expanded: false },
      ];
    });

    it('should resize text properly up to 200% (WCAG 1.4.4)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.usa-accordion__button');
      expect(button).toBeTruthy();

      const result = testTextResize(button as Element, 200);

      expect(result).toBeDefined();
      expect(result.violations).toBeDefined();
    });

    it('should reflow content at 320px width (WCAG 1.4.10)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion).toBeTruthy();

      const result = testReflow(accordion as Element, 320);

      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });

    it('should support text spacing adjustments (WCAG 1.4.12)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const button = element.querySelector('.usa-accordion__button');
      expect(button).toBeTruthy();

      const result = testTextSpacing(button as Element);

      expect(result.readable).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('should be accessible on mobile devices (WCAG 1.4.4, 1.4.10)', async () => {
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion).toBeTruthy();

      const result = await testMobileAccessibility(accordion as Element);

      expect(result).toBeDefined();
      expect(result.details.reflowWorks).toBeDefined();
      expect(result.details.textResizable).toBeDefined();
    });

    it('should reflow expanded accordion content (WCAG 1.4.10)', async () => {
      element.items = [
        {
          title: 'Expanded section',
          content: 'This is expanded content that should reflow properly at mobile widths',
          expanded: true,
        },
      ];
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const content = element.querySelector('.usa-accordion__content');
      expect(content).toBeTruthy();

      const result = testReflow(content as Element, 320);

      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });

    it('should maintain responsive behavior in bordered variant (WCAG 1.4.10)', async () => {
      element.bordered = true;
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const accordion = element.querySelector('.usa-accordion--bordered');
      expect(accordion).toBeTruthy();

      const result = testReflow(accordion as Element, 320);

      expect(result).toBeDefined();
      expect(result.contentWidth).toBeGreaterThanOrEqual(0);
    });
  });

  // CRITICAL: Layout and Structure Validation Tests
  // These tests prevent layout issues like content cutoff during expansion
  describe('Layout and Structure Validation (Prevent Expansion Issues)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-accordion') as USAAccordion;
      element.items = [
        { id: 'layout-1', title: 'First Section', content: 'First content', expanded: false },
        { id: 'layout-2', title: 'Second Section', content: 'Second content', expanded: true },
        { id: 'layout-3', title: 'Third Section', content: 'Third content', expanded: false },
      ];
      container.appendChild(element);
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    describe('Panel Expansion Structure', () => {
      it('should have correct DOM structure for accordion', async () => {
        const accordion = element.querySelector('.usa-accordion');
        const headings = element.querySelectorAll('.usa-accordion__heading');
        const buttons = element.querySelectorAll('.usa-accordion__button');
        const contents = element.querySelectorAll('.usa-accordion__content');

        expect(accordion).toBeTruthy();
        expect(headings).toHaveLength(3);
        expect(buttons).toHaveLength(3);
        expect(contents).toHaveLength(3);

        // Verify all buttons are inside headings
        headings.forEach((heading, index) => {
          expect(heading.contains(buttons[index] as Node)).toBe(true);
        });
      });

      it('should match USWDS reference structure for accordion', async () => {
        // Expected structure from USWDS:
        // <div class="usa-accordion">
        //   <h4 class="usa-accordion__heading">
        //     <button class="usa-accordion__button" aria-expanded="false" aria-controls="...">
        //       Title
        //     </button>
        //   </h4>
        //   <div id="..." class="usa-accordion__content usa-prose" hidden>
        //     Content
        //   </div>
        // </div>

        const accordion = element.querySelector('.usa-accordion');
        const heading = element.querySelector('.usa-accordion__heading');
        const button = element.querySelector('.usa-accordion__button');
        const content = element.querySelector('.usa-accordion__content');

        expect(accordion).toBeTruthy();
        expect(heading).toBeTruthy();
        expect(button).toBeTruthy();
        expect(content).toBeTruthy();

        // Verify nesting
        expect(accordion?.contains(heading as Node)).toBe(true);
        expect(heading?.contains(button as Node)).toBe(true);
        expect(accordion?.contains(content as Node)).toBe(true);

        // Verify content has prose class
        expect(content?.classList.contains('usa-prose')).toBe(true);
      });

      it('should display expanded content without hidden attribute', async () => {
        const contents = element.querySelectorAll('.usa-accordion__content');
        const buttons = element.querySelectorAll('.usa-accordion__button');

        // Second item is expanded
        expect(contents[1]?.hasAttribute('hidden')).toBe(false);
        expect(buttons[1]?.getAttribute('aria-expanded')).toBe('true');

        // First and third are collapsed
        expect(contents[0]?.hasAttribute('hidden')).toBe(true);
        expect(buttons[0]?.getAttribute('aria-expanded')).toBe('false');
        expect(contents[2]?.hasAttribute('hidden')).toBe(true);
        expect(buttons[2]?.getAttribute('aria-expanded')).toBe('false');
      });

      it('should hide collapsed content with hidden attribute', async () => {
        const contents = element.querySelectorAll('.usa-accordion__content');

        // Collapsed items should have hidden attribute
        expect(contents[0]?.hasAttribute('hidden')).toBe(true);
        expect(contents[2]?.hasAttribute('hidden')).toBe(true);

        // Expanded item should NOT have hidden attribute
        expect(contents[1]?.hasAttribute('hidden')).toBe(false);
      });
    });

    describe('Multi-Panel Scenarios', () => {
      it('should handle multiple panels correctly in single-select mode', async () => {
        element.multiselectable = false;
        await element.updateComplete;

        const accordion = element.querySelector('.usa-accordion');
        expect(accordion?.hasAttribute('data-allow-multiple')).toBe(false);

        const headings = element.querySelectorAll('.usa-accordion__heading');
        expect(headings).toHaveLength(3);
      });

      it('should handle multiple panels correctly in multi-select mode', async () => {
        element.multiselectable = true;
        await element.updateComplete;

        const accordion = element.querySelector('.usa-accordion');
        expect(accordion?.hasAttribute('data-allow-multiple')).toBe(true);

        const headings = element.querySelectorAll('.usa-accordion__heading');
        expect(headings).toHaveLength(3);
      });

      it('should render all panels regardless of expanded state', async () => {
        const headings = element.querySelectorAll('.usa-accordion__heading');
        const contents = element.querySelectorAll('.usa-accordion__content');

        expect(headings).toHaveLength(3);
        expect(contents).toHaveLength(3);

        // All panels should be in DOM
        contents.forEach((content) => {
          expect(content).toBeTruthy();
          expect(element.contains(content as Node)).toBe(true);
        });
      });
    });

    describe('CSS Display Properties', () => {
      it('should have block display on host element', async () => {
        // In jsdom, getComputedStyle won't return actual CSS values
        // This test validates the element exists - Cypress will test actual display
        const computedStyle = window.getComputedStyle(element);
        expect(computedStyle).toBeTruthy();

        // Note: In a real browser (Cypress), we would verify:
        // expect(computedStyle.display).toBe('block');
      });

      it('should have proper accordion wrapper classes', async () => {
        const accordion = element.querySelector('.usa-accordion');
        expect(accordion?.classList.contains('usa-accordion')).toBe(true);

        // When bordered is true
        element.bordered = true;
        await element.updateComplete;

        const borderedAccordion = element.querySelector('.usa-accordion');
        expect(borderedAccordion?.classList.contains('usa-accordion--bordered')).toBe(true);
      });
    });

    describe('Visual Rendering Validation', () => {
      it('should render accordion structure in DOM (visual tests in Cypress)', async () => {
        const accordion = element.querySelector('.usa-accordion');
        const headings = element.querySelectorAll('.usa-accordion__heading');
        const buttons = element.querySelectorAll('.usa-accordion__button');
        const contents = element.querySelectorAll('.usa-accordion__content');

        expect(accordion).toBeTruthy();
        expect(headings).toHaveLength(3);
        expect(buttons).toHaveLength(3);
        expect(contents).toHaveLength(3);

        // Verify buttons have correct text
        expect(buttons[0]?.textContent?.trim()).toBe('First Section');
        expect(buttons[1]?.textContent?.trim()).toBe('Second Section');
        expect(buttons[2]?.textContent?.trim()).toBe('Third Section');

        // Note: Actual visual validation (dimensions, visibility) happens in Cypress
      });

      it('should render expanded and collapsed states correctly', async () => {
        const buttons = element.querySelectorAll('.usa-accordion__button');
        const contents = element.querySelectorAll('.usa-accordion__content');

        // Verify expanded state (second item)
        expect(buttons[1]?.getAttribute('aria-expanded')).toBe('true');
        expect(contents[1]?.hasAttribute('hidden')).toBe(false);

        // Verify collapsed state (first and third items)
        expect(buttons[0]?.getAttribute('aria-expanded')).toBe('false');
        expect(contents[0]?.hasAttribute('hidden')).toBe(true);
        expect(buttons[2]?.getAttribute('aria-expanded')).toBe('false');
        expect(contents[2]?.hasAttribute('hidden')).toBe(true);

        // CRITICAL: This structure validation prevents content visibility issues
        // Visual side-by-side layout verified in Cypress
      });

      it('should render bordered variant correctly', async () => {
        element.bordered = true;
        await element.updateComplete;

        const accordion = element.querySelector('.usa-accordion');
        expect(accordion?.classList.contains('usa-accordion--bordered')).toBe(true);

        // All items should still render with bordered styling
        const headings = element.querySelectorAll('.usa-accordion__heading');
        expect(headings).toHaveLength(3);

        // Note: Actual bordered visual rendering validated in Cypress
      });
    });

    describe('ARIA Expansion State', () => {
      it('should have correct aria-expanded on buttons', async () => {
        const buttons = element.querySelectorAll('.usa-accordion__button');

        expect(buttons[0]?.getAttribute('aria-expanded')).toBe('false');
        expect(buttons[1]?.getAttribute('aria-expanded')).toBe('true');
        expect(buttons[2]?.getAttribute('aria-expanded')).toBe('false');
      });

      it('should have proper aria-controls relationships', async () => {
        const buttons = element.querySelectorAll('.usa-accordion__button');
        const contents = element.querySelectorAll('.usa-accordion__content');

        let index = 0;
        for (const button of buttons) {
          const controlsId = await waitForARIAAttribute(button, 'aria-controls');
          const contentId = contents[index]?.getAttribute('id');

          expect(controlsId).toBeTruthy();
          expect(controlsId).toBe(contentId);
          index++;
        }
      });

      it('should sync aria-expanded with hidden attribute', async () => {
        const buttons = element.querySelectorAll('.usa-accordion__button');
        const contents = element.querySelectorAll('.usa-accordion__content');

        let index = 0;
        for (const button of buttons) {
          const isExpanded = (await waitForARIAAttribute(button, 'aria-expanded')) === 'true';
          const isHidden = contents[index]?.hasAttribute('hidden');

          // When expanded, should NOT be hidden
          // When collapsed, SHOULD be hidden
          expect(isExpanded).toBe(!isHidden);
          index++;
        }
      });
    });
  });
});
