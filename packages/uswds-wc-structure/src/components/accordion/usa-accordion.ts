import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeAccordion } from './usa-accordion-behavior.js';

// Import official USWDS compiled CSS

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  expanded?: boolean;
}

/**
 * USA Accordion Web Component
 *
 * Uses USWDS-mirrored behavior for reliable interaction.
 * Behavior is replicated from official USWDS source to maintain 100% parity.
 *
 * @element usa-accordion
 *
 * @slot - Default slot for custom accordion content (advanced usage)
 *
 * @attr {boolean} multiselectable - Allow multiple sections open at once.
 * @attr {boolean} bordered - Use bordered variant with visual separation.
 *
 * @prop {Array<{id: string, title: string, content: string, expanded?: boolean}>} items - Array of accordion items.
 *
 * @fires accordion-toggle - Dispatched when accordion item is toggled. Detail: { id, expanded }
 *
 * @example
 * ```html
 * <!-- Basic accordion with items -->
 * <usa-accordion
 *   .items=${[
 *     { id: 'item-1', title: 'First Section', content: 'Content for first section' },
 *     { id: 'item-2', title: 'Second Section', content: 'Content for second section' },
 *     { id: 'item-3', title: 'Third Section', content: 'Content for third section', expanded: true }
 *   ]}
 * ></usa-accordion>
 *
 * <!-- Bordered accordion -->
 * <usa-accordion bordered .items=${items}></usa-accordion>
 *
 * <!-- Multiselectable accordion (multiple sections open) -->
 * <usa-accordion multiselectable .items=${items}></usa-accordion>
 *
 * <!-- Accordion with event handling -->
 * <usa-accordion
 *   .items=${items}
 *   @accordion-toggle=${(e) => console.log('Toggled:', e.detail)}
 * ></usa-accordion>
 * ```
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 * @see usa-accordion-behavior.ts - USWDS behavior mirror
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-accordion/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-accordion/src/styles/_usa-accordion.scss
 * @uswds-docs https://designsystem.digital.gov/components/accordion/
 * @uswds-guidance https://designsystem.digital.gov/components/accordion/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/accordion/#accessibility
 */
@customElement('usa-accordion')
export class USAAccordion extends USWDSBaseComponent {
  // Light DOM for USWDS compatibility
  protected override createRenderRoot() {
    return this;
  }

  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Array }) items: AccordionItem[] = [];
  @property({ type: Boolean, reflect: true }) multiselectable = false;
  @property({ type: Boolean, reflect: true }) bordered = false;

  // Slot content handling to prevent duplication
  private slottedContent: string = '';

  // Cleanup function for USWDS-mirrored behavior
  private cleanup?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial light DOM content before render to prevent duplication
    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }

    // Ensure unique IDs for items
    this.items = this.items.map((item, index) => ({
      ...item,
      id: item.id || `accordion-item-${index}`,
    }));
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);

    // Wait for DOM to be ready
    await this.updateComplete;

    // Wait one frame to ensure DOM elements are queryable
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Set HTML content for each item (can't use unsafeHTML directive in .map())
    // Must do this BEFORE initializing USWDS so content is present
    this.items.forEach((item) => {
      const contentEl = this.querySelector(`#${item.id}-content`);
      if (contentEl) {
        contentEl.innerHTML = item.content;
      }
    });

    // CRITICAL: Manually set hidden attribute on all content panels BEFORE initializing USWDS
    // This ensures they start hidden, then USWDS behavior removes it for expanded items
    this.querySelectorAll('.usa-accordion__content').forEach((content) => {
      content.setAttribute('hidden', '');
    });

    // Initialize USWDS-mirrored behavior
    // This will remove 'hidden' from panels that should be expanded
    this.cleanup = initializeAccordion(this);
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update data-allow-multiple attribute if multiselectable changes
    if (changedProperties.has('multiselectable')) {
      const accordion = this.querySelector('.usa-accordion');
      if (accordion) {
        if (this.multiselectable) {
          accordion.setAttribute('data-allow-multiple', '');
        } else {
          accordion.removeAttribute('data-allow-multiple');
        }
      }
    }

    // If items changed after first render, update content
    if (changedProperties.has('items')) {
      this.items.forEach((item) => {
        const contentEl = this.querySelector(`#${item.id}-content`);
        if (contentEl) {
          contentEl.innerHTML = item.content;
        }
      });
    }

    // Apply captured slot content using DOM manipulation
    this.applySlottedContent();
  }

  private applySlottedContent() {
    if (this.slottedContent) {
      const slotElement = this.querySelector('slot');
      if (slotElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.slottedContent;
        slotElement.replaceWith(...Array.from(tempDiv.childNodes));
      }
    }
  }

  private getAccordionClasses(): string {
    const classes = [
      'usa-accordion',
      this.bordered ? 'usa-accordion--bordered' : '',
      this.multiselectable ? 'usa-accordion--multiselectable' : '',
    ];

    return classes.filter(Boolean).join(' ');
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  override render() {
    return html`
      <div
        class="${this.getAccordionClasses()}"
        data-allow-multiple="${this.multiselectable ? '' : undefined}"
      >
        ${this.items.map((item) => {
          // Create a unique content element for each item
          const contentId = `${item.id}-content`;

          const isExpanded = item.expanded === true;

          return html`
            <h4 class="usa-accordion__heading">
              <button
                type="button"
                id="${item.id}-button"
                class="usa-accordion__button"
                aria-expanded="${isExpanded ? 'true' : 'false'}"
                aria-controls="${contentId}"
              >
                ${item.title}
              </button>
            </h4>
            <div id="${contentId}" class="usa-accordion__content usa-prose">
              <!-- Content set via innerHTML in updated() -->
              <!-- hidden attribute set imperatively in firstUpdated(), managed by USWDS after -->
            </div>
          `;
        })}
        <slot></slot>
      </div>
    `;
  }
}
