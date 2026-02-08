import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS

type SiteAlertType = 'info' | 'emergency';

/**
 * USA Site Alert Web Component
 *
 * A simple, accessible USWDS site alert implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-site-alert
 * @fires site-alert-close - Dispatched when alert is closed
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-site-alert/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-site-alert/src/styles/_usa-site-alert.scss
 * @uswds-docs https://designsystem.digital.gov/components/site-alert/
 * @uswds-guidance https://designsystem.digital.gov/components/site-alert/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/site-alert/#accessibility
 */
@customElement('usa-site-alert')
export class USASiteAlert extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  type: SiteAlertType = 'info';

  // Alias for type property
  get variant() {
    return this.type;
  }
  set variant(value: SiteAlertType) {
    this.type = value;
  }

  @property({ type: String })
  heading = '';

  @property({ type: String })
  content = '';

  @property({ type: Boolean })
  slim = false;

  @property({ type: Boolean })
  noIcon = false;

  @property({ type: Boolean })
  closable = false;

  @property({ type: Boolean })
  visible = true;

  @property({ type: String, attribute: 'close-label' })
  closeLabel = 'Close';

  private slottedContent: string = '';

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial light DOM content before render to prevent duplication
    if (this.childNodes.length > 0 && !this.content) {
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
    if (this.slottedContent && !this.content) {
      const textElement = this.querySelector('.usa-alert__text');
      if (textElement) {
        // Clear existing content except slot safely
        const slot = textElement.querySelector('slot');
        if (slot) {
          // Create temp div to parse content safely
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = this.slottedContent;

          // Replace slot with parsed content
          while (tempDiv.firstChild) {
            textElement.insertBefore(tempDiv.firstChild, slot);
          }
          slot.remove();
        } else {
          // Clear and add content safely
          while (textElement.firstChild) {
            textElement.removeChild(textElement.firstChild);
          }
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = this.slottedContent;
          while (tempDiv.firstChild) {
            textElement.appendChild(tempDiv.firstChild);
          }
        }
      }
    }

    // Apply content property if provided (safely)
    if (this.content) {
      const textElement = this.querySelector('.usa-alert__text');
      if (textElement) {
        // Clear and set content safely
        while (textElement.firstChild) {
          textElement.removeChild(textElement.firstChild);
        }
        textElement.textContent = this.content;
      }
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof window.USWDS !== 'undefined') {
        const USWDS = window.USWDS;
        if (USWDS['site-alert'] && typeof USWDS['site-alert'].off === 'function') {
          USWDS['site-alert'].off(this);
        }
      }
    } catch (error) {
      // Silently ignore cleanup errors
    }
    // Additional cleanup for event listeners would go here
  }
  private renderAlertText() {
    return this.content ? this.content : html`<slot></slot>`;
  }

  override render() {
    if (!this.visible) return html``;

    const alertClasses = [
      'usa-site-alert',
      `usa-site-alert--${this.variant}`,
      this.slim ? 'usa-site-alert--slim' : '',
      this.noIcon ? 'usa-site-alert--no-icon' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <section class="${alertClasses}" aria-label="Site alert" role="${this.type === 'emergency' ? 'alert' : 'region'}">
        <div class="usa-alert">
          <div class="usa-alert__body">
            <h3 class="usa-alert__heading">${this.heading}</h3>
            <div class="usa-alert__text">${this.renderAlertText()}</div>
          </div>
        </div>
      </section>
    `;
  }

  // Public API methods
  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;

    this.dispatchEvent(
      new CustomEvent('site-alert-close', {
        detail: {
          type: this.type,
          heading: this.heading,
          content: this.content,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  toggle() {
    this.visible = !this.visible;
  }
}
