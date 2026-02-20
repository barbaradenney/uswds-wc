import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
// Removed unsafeHTML import - using safer HTML content handling

// Import official USWDS compiled CSS

export interface ProcessItem {
  heading: string;
  content: string;
}

/**
 * USA Process List Web Component
 *
 * A simple, accessible USWDS process list implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-process-list
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-process-list/src/styles/_usa-process-list.scss
 * @uswds-docs https://designsystem.digital.gov/components/process-list/
 * @uswds-guidance https://designsystem.digital.gov/components/process-list/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/process-list/#accessibility
 */
@customElement('usa-process-list')
export class USAProcessList extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Array })
  items: ProcessItem[] = [];

  @property({ type: String })
  headingLevel = 'h4';

  @property({ type: Number, attribute: 'item-count' })
  itemCount = 0;

  private slottedContent: string = '';
  private slottedContentApplied: boolean = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Parse item attributes if items array is empty
    this.parseItemAttributes();

    // Capture any initial slotted content before render
    // This allows using BOTH property-based items AND custom slotted process list content
    if (this.items.length === 0 && this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }
  }

  /**
   * Parse item1-heading, item1-content, etc. attributes into items array
   * This supports declarative HTML usage for prototyping tools
   */
  private parseItemAttributes() {
    // Only parse if items is empty and we have item-count or item attributes
    if (this.items.length > 0) return;

    const count = this.itemCount || this.getAttributeCount();
    if (count === 0) return;

    const parsedItems: ProcessItem[] = [];
    for (let i = 1; i <= count; i++) {
      const heading = this.getAttribute(`item${i}-heading`);
      if (heading) {
        parsedItems.push({
          heading,
          content: this.getAttribute(`item${i}-content`) || '',
        });
      }
    }

    if (parsedItems.length > 0) {
      this.items = parsedItems;
    }
  }

  /**
   * Detect item count from attributes if not explicitly set
   */
  private getAttributeCount(): number {
    let count = 0;
    for (let i = 1; i <= 20; i++) {
      if (this.getAttribute(`item${i}-heading`)) {
        count = i;
      } else {
        break;
      }
    }
    return count;
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Apply slotted content if no items are provided
    this.applySlottedContent();
  }

  private applySlottedContent() {
    // Only apply slotted content once to prevent duplication
    if (this.slottedContent && !this.slottedContentApplied) {
      // Use slotted content in addition to or instead of property-based items
      const slotElement = this.querySelector('slot');
      if (slotElement && slotElement.parentElement) {
        // Create a temporary div to parse content safely
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.slottedContent;

        // Move nodes from temp div to slot parent
        while (tempDiv.firstChild) {
          slotElement.parentElement.insertBefore(tempDiv.firstChild, slotElement);
        }

        // Remove the slot element
        slotElement.remove();
        this.slottedContentApplied = true;
      }
    }
  }

  private renderItemHeading(heading: string) {
    switch (this.headingLevel) {
      case 'h1':
        return html`<h1 class="usa-process-list__heading">${heading}</h1>`;
      case 'h2':
        return html`<h2 class="usa-process-list__heading">${heading}</h2>`;
      case 'h3':
        return html`<h3 class="usa-process-list__heading">${heading}</h3>`;
      case 'h4':
        return html`<h4 class="usa-process-list__heading">${heading}</h4>`;
      case 'h5':
        return html`<h5 class="usa-process-list__heading">${heading}</h5>`;
      case 'h6':
        return html`<h6 class="usa-process-list__heading">${heading}</h6>`;
      default:
        return html`<h4 class="usa-process-list__heading">${heading}</h4>`;
    }
  }

  private renderProcessItem(item: ProcessItem): any {
    return html`
      <li class="usa-process-list__item">
        ${this.renderItemHeading(item.heading)}
        <div class="usa-process-list__content" .innerHTML="${item.content || ''}"></div>
      </li>
    `;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS['process-list'] && typeof USWDS['process-list'].off === 'function') {
          USWDS['process-list'].off(this);
        }
      }
    } catch {
      // Cleanup may fail if USWDS was already torn down
    }
    // Additional cleanup for event listeners would go here
  }
  override render() {
    if (this.items.length === 0) {
      return html`<slot></slot>`;
    }

    return html`
      <ol class="usa-process-list">
        ${this.items.map((item) => this.renderProcessItem(item))}
      </ol>
    `;
  }
}
