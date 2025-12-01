import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import USWDS web components
import '@uswds-wc/feedback';
import '@uswds-wc/navigation';
import '@uswds-wc/layout';
import '@uswds-wc/actions';

/**
 * USA Error Template
 *
 * Error page template for 404, 500, and other error states.
 * Provides a minimal, focused layout for error messaging.
 *
 * **Template Structure (from USWDS):**
 * - Skip navigation + Banner + Header (optional)
 * - Error content with code, title, message
 * - Action buttons (home link, etc.)
 * - Footer + Identifier (optional)
 *
 * @element usa-error-template
 *
 * @slot error-content - Custom error content
 * @slot header - Site header
 * @slot footer - Site footer
 *
 * @fires {CustomEvent} template-ready - Fired when template initializes
 *
 * @example 404 Error
 * ```html
 * <usa-error-template
 *   error-code="404"
 *   error-title="Page not found"
 *   error-message="We couldn't find the page you're looking for."
 *   home-url="/"
 *   home-text="Return to home"
 * ></usa-error-template>
 * ```
 *
 * @example 500 Error
 * ```html
 * <usa-error-template
 *   error-code="500"
 *   error-title="Server error"
 *   error-message="Something went wrong. Please try again later."
 *   show-contact
 *   contact-url="/contact"
 * ></usa-error-template>
 * ```
 *
 * @uswds-template https://designsystem.digital.gov/templates/error-page/
 */
@customElement('usa-error-template')
export class USAErrorTemplate extends LitElement {
  // Use Light DOM for USWDS compatibility
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Page language attribute
   */
  @property({ type: String })
  override lang = 'en';

  /**
   * Whether to show the government banner
   */
  @property({ type: Boolean, attribute: 'show-banner' })
  showBanner = true;

  /**
   * Whether to show the identifier at the bottom
   */
  @property({ type: Boolean, attribute: 'show-identifier' })
  showIdentifier = false;

  /**
   * Error code (e.g., "404", "500")
   */
  @property({ type: String, attribute: 'error-code' })
  errorCode = '404';

  /**
   * Error title/heading
   */
  @property({ type: String, attribute: 'error-title' })
  errorTitle = 'Page not found';

  /**
   * Error description message
   */
  @property({ type: String, attribute: 'error-message' })
  errorMessage = "We couldn't find the page you're looking for.";

  /**
   * Home page URL
   */
  @property({ type: String, attribute: 'home-url' })
  homeUrl = '/';

  /**
   * Home button text
   */
  @property({ type: String, attribute: 'home-text' })
  homeText = 'Return to home';

  /**
   * Whether to show a contact link
   */
  @property({ type: Boolean, attribute: 'show-contact' })
  showContact = false;

  /**
   * Contact page URL
   */
  @property({ type: String, attribute: 'contact-url' })
  contactUrl = '/contact';

  /**
   * Contact link text
   */
  @property({ type: String, attribute: 'contact-text' })
  contactText = 'Contact us';

  /**
   * Additional help text
   */
  @property({ type: String, attribute: 'help-text' })
  helpText = '';

  override connectedCallback() {
    super.connectedCallback();
    if (this.lang) {
      this.setAttribute('lang', this.lang);
    }
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('template-ready', {
        detail: { template: 'error', errorCode: this.errorCode },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Check if a slot has content
   */
  private hasSlotContent(slotName: string): boolean {
    return this.querySelector(`[slot="${slotName}"]`) !== null;
  }

  /**
   * Render the error content
   */
  private renderErrorContent() {
    if (this.hasSlotContent('error-content')) {
      return html`<slot name="error-content"></slot>`;
    }

    return html`
      <div class="grid-container usa-section">
        <div class="grid-row grid-gap">
          <div class="tablet:grid-col-8 tablet:grid-offset-2">
            <div class="usa-prose">
              <h1>
                <span class="usa-tag usa-tag--big">${this.errorCode}</span>
                ${this.errorTitle}
              </h1>
              <p class="usa-intro">${this.errorMessage}</p>
              ${this.helpText ? html`<p>${this.helpText}</p>` : nothing}
              <div class="margin-top-4">
                <a class="usa-button" href="${this.homeUrl}">${this.homeText}</a>
                ${this.showContact
                  ? html`<a class="usa-button usa-button--outline" href="${this.contactUrl}">
                      ${this.contactText}
                    </a>`
                  : nothing}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="usa-error-template">
        <!-- Skip Navigation -->
        <usa-skip-link href="#main-content" text="Skip to main content"></usa-skip-link>

        <!-- Government Banner -->
        ${this.showBanner ? html`<usa-banner></usa-banner>` : nothing}

        <!-- Header -->
        <slot name="header"></slot>

        <!-- Main Content -->
        <main id="main-content">${this.renderErrorContent()}</main>

        <!-- Footer -->
        <slot name="footer"></slot>

        <!-- Identifier -->
        ${this.showIdentifier ? html`<usa-identifier></usa-identifier>` : nothing}
      </div>
    `;
  }

  /**
   * Public API: Set error state
   */
  setError(code: string, title: string, message: string): void {
    this.errorCode = code;
    this.errorTitle = title;
    this.errorMessage = message;
  }
}
