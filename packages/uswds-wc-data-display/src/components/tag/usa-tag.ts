import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS

/**
 * USA Tag Web Component
 *
 * A simple, accessible USWDS tag implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-tag
 * @fires tag-remove - Dispatched when a removable tag is removed
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-tag/src/styles/_usa-tag.scss
 * @uswds-docs https://designsystem.digital.gov/components/tag/
 * @uswds-guidance https://designsystem.digital.gov/components/tag/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/tag/#accessibility
 */
@customElement('usa-tag')
export class USATag extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
  `;

  @property({ type: String })
  text = '';

  @property({ type: Boolean, reflect: true })
  big = false;

  @property({ type: Boolean, reflect: true })
  removable = false;

  @property({ type: String })
  value = '';

  private slottedContent: string = '';

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial content before render
    if (this.childNodes.length > 0 && !this.text) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Apply captured content using DOM manipulation (avoids directive compatibility issues)
    this.applySlottedContent();
  }

  private applySlottedContent() {
    if (this.slottedContent && !this.text) {
      const tagSpan = this.querySelector('.usa-tag');
      if (tagSpan) {
        // Clear existing content except remove button
        const removeButton = tagSpan.querySelector('button');
        tagSpan.innerHTML = this.slottedContent;
        if (removeButton) {
          tagSpan.appendChild(removeButton);
        }
      }
    }
  }

  private handleRemove(e: Event) {
    e.stopPropagation();

    // Dispatch remove event
    this.dispatchEvent(
      new CustomEvent('tag-remove', {
        detail: {
          text: this.text,
          value: this.value,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Remove the tag from DOM
    this.remove();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Note: USWDS tags are purely presentational with no JavaScript behavior
  }

  private renderTagContent() {
    return this.text ? this.text : html`<slot></slot>`;
  }

  private renderRemoveButton() {
    if (!this.removable) return '';

    // prettier-ignore
    return html`<button
      type="button"
      class="usa-button usa-button--unstyled"
      aria-label="Remove tag: ${this.text}"
      @click="${this.handleRemove}"
    >✕</button>`;
  }

  override render() {
    // Determine CSS classes
    const tagClasses = [
      'usa-tag',
      this.big ? 'usa-tag--big' : '',
      this.removable ? 'usa-tag--removable' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // prettier-ignore
    return html`
      <span class="${tagClasses}">
        ${this.renderTagContent()}
        ${this.renderRemoveButton()}
      </span>
    `;
  }
}
