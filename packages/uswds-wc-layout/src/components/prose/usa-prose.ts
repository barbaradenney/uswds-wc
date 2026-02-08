import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS

export interface ProseContentItem {
  type: 'paragraph' | 'heading' | 'list' | 'blockquote' | 'code';
  level?: number;
  content: string;
  items?: string[];
}

export interface ProseDetail {
  content: string;
  variant: string;
}

/**
 * USA Prose Web Component
 *
 * Provides USWDS-styled content blocks for rich text and document formatting.
 * Applies consistent typography, spacing, and styling to various content types.
 * Perfect for documentation, articles, and formatted text content.
 *
 * @element usa-prose
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-prose/src/styles/_usa-prose.scss
 * @uswds-docs https://designsystem.digital.gov/components/prose/
 * @uswds-guidance https://designsystem.digital.gov/components/prose/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/prose/#accessibility
 */
@customElement('usa-prose')
export class USAProse extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  variant: 'default' | 'condensed' | 'expanded' = 'default';

  @property({ type: String })
  width: 'default' | 'narrow' | 'wide' = 'default';

  @property({ type: String })
  content = '';

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
    if (this.childNodes.length > 0 && !this.content) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Apply captured content using DOM manipulation (avoids unsafeHTML directive issues)
    this.applySlottedContent();
    this.applyContentProperty();
  }

  private applySlottedContent() {
    if (this.slottedContent && !this.content) {
      const container = this.querySelector('.usa-prose');
      if (container) {
        // Clear existing content except slot
        const slot = container.querySelector('slot');
        if (slot && slot.parentElement) {
          const slotContent = this.slottedContent;
          slot.outerHTML = slotContent;
        }
      }
    }
  }

  private applyContentProperty() {
    if (this.content) {
      const container = this.querySelector('.usa-prose');
      if (container) {
        // Apply content property to dedicated div
        let contentDiv = container.querySelector('.prose-content');
        if (!contentDiv) {
          contentDiv = document.createElement('div');
          contentDiv.className = 'prose-content';
          container.appendChild(contentDiv);
        }
        contentDiv.innerHTML = this.content;
      }
    }
  }

  private getProseClasses(): string {
    const classes = ['usa-prose'];

    if (this.variant !== 'default') {
      classes.push(`usa-prose--${this.variant}`);
    }

    if (this.width !== 'default') {
      classes.push(`usa-prose--${this.width}`);
    }

    return classes.join(' ');
  }

  private handleContentChange() {
    this.dispatchEvent(
      new CustomEvent('prose-change', {
        detail: {
          content: this.content,
          variant: this.variant,
        } as ProseDetail,
        bubbles: true,
        composed: true,
      })
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }
  override render() {
    return html`
      <div class="${this.getProseClasses()}">
        <slot></slot>
      </div>
    `;
  }

  // Public API methods
  setVariant(variant: 'default' | 'condensed' | 'expanded') {
    this.variant = variant;
    this.handleContentChange();
  }

  setWidth(width: 'default' | 'narrow' | 'wide') {
    this.width = width;
    this.handleContentChange();
  }

  setContent(content: string) {
    this.content = content;
    this.handleContentChange();
  }

  getContent(): string {
    return this.content;
  }

  addContent(content: string) {
    this.content += content;
    this.handleContentChange();
  }

  clearContent() {
    this.content = '';
    this.handleContentChange();
  }
}
