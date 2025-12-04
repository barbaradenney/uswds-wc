import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

type AlertVariant = 'info' | 'warning' | 'error' | 'success' | 'emergency';

/**
 * USA Alert Web Component
 *
 * Simple, accessible USWDS alert implementation as a custom element.
 * Uses official USWDS classes and styling. Alert is a presentational
 * component that requires no JavaScript enhancement.
 *
 * @element usa-alert
 *
 * @slot - Default slot for alert body content
 * @slot heading - Slot for alert heading (alternative to heading attribute)
 *
 * @attr {string} variant - Alert type: 'info' | 'warning' | 'error' | 'success' | 'emergency'. Defaults to 'info'.
 * @attr {string} heading - Alert heading text.
 * @attr {boolean} slim - Use slim variant with reduced padding.
 * @attr {boolean} no-icon - Hide the alert icon.
 * @attr {string} text - Alert body text (alternative to using default slot).
 *
 * @example
 * ```html
 * <!-- Info alert with heading -->
 * <usa-alert variant="info" heading="Important">
 *   This is an informational message.
 * </usa-alert>
 *
 * <!-- Success alert -->
 * <usa-alert variant="success" heading="Success!">
 *   Your changes have been saved.
 * </usa-alert>
 *
 * <!-- Error alert -->
 * <usa-alert variant="error" heading="Error">
 *   There was a problem processing your request.
 * </usa-alert>
 *
 * <!-- Slim warning alert without icon -->
 * <usa-alert variant="warning" slim no-icon>
 *   Please review your information.
 * </usa-alert>
 *
 * <!-- Emergency alert -->
 * <usa-alert variant="emergency" heading="Emergency">
 *   This is an emergency notification.
 * </usa-alert>
 * ```
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-alert/src/styles/_usa-alert.scss
 * @uswds-docs https://designsystem.digital.gov/components/alert/
 * @uswds-guidance https://designsystem.digital.gov/components/alert/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/alert/#accessibility
 */
@customElement('usa-alert')
export class USAAlert extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  variant: AlertVariant = 'info';

  @property({ type: String })
  heading = '';

  @property({ type: Boolean, reflect: true })
  slim = false;

  @property({ type: Boolean, attribute: 'no-icon', reflect: true })
  noIcon = false;

  @property({ type: String })
  text = '';

  // Store child nodes for slot-like behavior in light DOM
  private childNodes_: Node[] = [];
  private hasProcessedChildren = false;

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
    this.updateAriaRole();

    // Capture child nodes before first render (only once)
    if (!this.hasProcessedChildren && !this.text) {
      this.childNodes_ = Array.from(this.childNodes);
      this.hasProcessedChildren = true;
    }

    console.log('📋 Alert: Initialized as presentational component (no USWDS JavaScript required)');
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);

    // Move captured child nodes into alert text container (first render only)
    if (this.childNodes_.length > 0 && !this.text) {
      const alertText = this.querySelector('.usa-alert__text');
      if (alertText) {
        // Move nodes (not clone) to avoid duplication
        this.childNodes_.forEach((node) => {
          alertText.appendChild(node);
        });
        // Clear the array since nodes have been moved
        this.childNodes_ = [];
      }
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('variant')) {
      this.updateAriaRole();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    console.log('📋 Alert: Cleanup complete (no USWDS JavaScript required)');
  }

  private updateAriaRole() {
    const role = this.variant === 'error' || this.variant === 'emergency' ? 'alert' : 'status';
    this.setAttribute('role', role);
  }

  private getAlertClasses(): string {
    const classes = [
      'usa-alert',
      `usa-alert--${this.variant}`,
      this.slim ? 'usa-alert--slim' : '',
      this.noIcon ? 'usa-alert--no-icon' : '',
    ];

    return classes.filter(Boolean).join(' ');
  }
  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  private renderHeading() {
    if (!this.heading) return '';
    return html`<h4 class="usa-alert__heading">${this.heading}</h4>`;
  }

  override render() {
    // Use <p> tag for text property, empty <p> for slotted content (filled in updated())
    // This ensures proper USWDS HTML structure
    const textContent = this.text
      ? html`<p class="usa-alert__text">${this.text}</p>`
      : html`<p class="usa-alert__text"></p>`;

    return html`
      <div class="${this.getAlertClasses()}">
        <div class="usa-alert__body">${this.renderHeading()} ${textContent}</div>
      </div>
    `;
  }
}
