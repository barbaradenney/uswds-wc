import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';

// Import official USWDS compiled CSS

/**
 * USA List Web Component
 *
 * Simple presentational wrapper for USWDS list styling.
 * Organizes information into discrete sequential sections using only USWDS CSS classes.
 *
 * @element usa-list
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-list/src/styles/_usa-list.scss
 * @uswds-docs https://designsystem.digital.gov/components/list/
 * @uswds-guidance https://designsystem.digital.gov/components/list/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/list/#accessibility
 *
 * @example
 * ```html
 * <usa-list type="unordered" ?unstyled=${false}>
 *   <li>First item</li>
 *   <li>Second item</li>
 *   <li>Third item</li>
 * </usa-list>
 * ```
 */
@customElement('usa-list')
export class USAList extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;
  @property({ type: String })
  type: 'unordered' | 'ordered' = 'unordered';

  @property({ type: Boolean, reflect: true })
  unstyled = false;

  private slottedContent: string = '';

  // Light DOM is handled by USWDSBaseComponent

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial content before render
    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }

    // Set appropriate ARIA role if needed
    if (this.type === 'ordered') {
      this.setAttribute('role', 'list');
    }

    // Force re-render if innerHTML was manipulated
    this.requestUpdate();
  }

  override firstUpdated(changedProperties: Map<string, unknown>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);
    this.reorganizeListItems();
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('type')) {
      // Set appropriate ARIA role if needed
      if (this.type === 'ordered') {
        this.setAttribute('role', 'list');
      } else {
        this.removeAttribute('role');
      }
    }

    // Apply captured content using DOM manipulation
    this.applySlottedContent();

    // Always reorganize items after any update to catch dynamically added content
    this.reorganizeListItems();
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

  private reorganizeListItems() {
    // Immediate check for the list element
    const listElement = this.querySelector(':scope > ul, :scope > ol');

    // If no list element yet, defer to next tick
    if (!listElement) {
      setTimeout(() => this.reorganizeListItems(), 10);
      return;
    }

    // Only reorganize if there are li elements that are direct children of this component
    // and not already in the list element
    const directLiElements = Array.from(this.children).filter(
      (child) =>
        child.tagName === 'LI' && child.parentElement === this && !listElement.contains(child)
    );

    this.debug('reorganizeListItems', {
      listElementFound: !!listElement,
      directLiElements: directLiElements.length,
      totalChildren: this.children.length,
    });

    // If we don't have any misplaced li elements, don't reorganize
    if (directLiElements.length === 0) return;

    // Move them into the list element, preserving their order
    directLiElements.forEach((item) => {
      this.debug('Moving li element to list', { itemText: item.textContent });
      listElement.appendChild(item);
    });

    this.debug('Reorganization complete', {
      listElementChildren: listElement.children.length,
      componentChildren: this.children.length,
    });
  }

  // Public method to force reorganization - useful for testing
  forceReorganize() {
    this.reorganizeListItems();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Note: USWDS lists are purely presentational with no JavaScript behavior
    console.log('📋 List: Disconnected (presentational component, no cleanup needed)');
  }

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override render() {
    const classes = ['usa-list', this.unstyled ? 'usa-list--unstyled' : '']
      .filter(Boolean)
      .join(' ');

    if (this.type === 'ordered') {
      return html`
        <ol class="${classes}">
          <slot></slot>
        </ol>
      `;
    } else {
      return html`
        <ul class="${classes}">
          <slot></slot>
        </ul>
      `;
    }
  }
}
