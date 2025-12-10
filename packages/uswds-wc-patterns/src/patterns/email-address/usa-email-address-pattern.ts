import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles

// Import USWDS web components
import '@uswds-wc/forms';

/**
 * Email address data interface
 */
export interface EmailAddressData {
  email?: string;
  sensitiveInfoConsent?: 'yes-info' | 'no-info' | '';
}

/**
 * USA Email Address Pattern
 *
 * USWDS pattern for collecting email addresses with proper validation.
 * Optionally collects consent for sending sensitive information via email.
 *
 * **Pattern Responsibilities:**
 * - Collect email address with validation
 * - Optional consent for sensitive information
 * - Email format validation
 * - Support autocomplete and paste
 * - Emit email data changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 *
 * **Validation:**
 * - Must contain @ with characters before and after
 * - Supports up to 256 characters
 * - Allows standard email characters (letters, numbers, hyphens, underscores, plus, periods)
 *
 * @element usa-email-address-pattern
 *
 * @fires {CustomEvent} email-change - Fired when email data changes
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @example Basic usage
 * ```html
 * <usa-email-address-pattern
 *   label="Email address"
 *   required
 * ></usa-email-address-pattern>
 * ```
 *
 * @example With consent option
 * ```html
 * <usa-email-address-pattern
 *   show-consent
 *   consent-label="May we send sensitive information to this email?"
 * ></usa-email-address-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/create-a-user-profile/email-address/
 */
@customElement('usa-email-address-pattern')
export class USAEmailAddressPattern extends LitElement {
  // Use Light DOM for patterns
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Label for the email section
   */
  @property({ type: String })
  label = 'Email address';

  /**
   * Whether email is required
   */
  @property({ type: Boolean })
  required = true;

  /**
   * Whether to show sensitive information consent section
   */
  @property({ type: Boolean, attribute: 'show-consent' })
  get showConsent() {
    return this._showConsent;
  }
  set showConsent(value: boolean) {
    this._showConsent = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.toggleConsentVisibility());
  }
  private _showConsent = false;

  /**
   * Label for the consent question
   */
  @property({ type: String, attribute: 'consent-label' })
  consentLabel = 'May we send sensitive information to this email?';

  /**
   * Hint text for email field
   */
  @property({ type: String })
  hint = '';

  /**
   * Current email data
   */
  @state()
  private emailData: EmailAddressData = {
    sensitiveInfoConsent: '',
  };

  /**
   * Unique ID for this pattern instance (for ARIA connections)
   */
  private patternId: string;

  constructor() {
    super();
    this.patternId = `email-${Math.random().toString(36).substring(2, 11)}`;
  }

  override connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Light DOM Pattern: Prevent template re-rendering
   *
   * ARCHITECTURE: Light DOM + Lit incompatibility
   * - Light DOM cannot be re-rendered after initial render
   * - Only allow re-render for non-visibility properties
   * - Visibility changes handled manually in updated()
   */
  override shouldUpdate(changedProperties: Map<string, any>): boolean {
    // Allow initial render (before the component has updated for the first time)
    if (!this.hasUpdated) {
      return true;
    }

    // Check if only visibility properties or internal state changed
    const noRerenderProps = ['showConsent', 'emailData'];
    const hasRerenderNeeded = Array.from(changedProperties.keys()).some(
      (key) => !noRerenderProps.includes(key as string)
    );

    // Only re-render if properties that affect template changed
    return hasRerenderNeeded;
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: { emailData: this.emailData },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Light DOM Pattern: Manual CSS class toggling
   *
   * ARCHITECTURE: Light DOM + Lit incompatibility with template re-rendering
   * - Light DOM cannot handle Lit template re-rendering after initial render
   * - Solution: Manually toggle USWDS `display-none` class on property changes
   * - Bypasses Lit's template system, directly manipulates DOM
   * - Maintains 100% USWDS compliance (only uses official utility class)
   */
  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Toggle consent visibility only when showConsent property changes
    if (changedProperties.has('showConsent')) {
      this.toggleConsentVisibility();
    }
  }

  /**
   * Toggle consent section visibility
   */
  private toggleConsentVisibility() {
    const consentSection = this.querySelector('.consent-section');
    if (consentSection) {
      if (this.showConsent) {
        consentSection.classList.remove('display-none');
      } else {
        consentSection.classList.add('display-none');
      }
    }
  }

  /**
   * Handle field changes
   */
  private handleFieldChange(field: keyof EmailAddressData, value: string) {
    this.emailData = { ...this.emailData, [field]: value };

    this.dispatchEvent(
      new CustomEvent('email-change', {
        detail: { emailData: this.emailData, field, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    // Basic validation: must contain @ with characters before and after
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 256;
  }

  override render() {
    const consentId = `${this.patternId}-consent`;

    return html`
      <fieldset class="usa-fieldset">
        <legend class="usa-legend usa-legend--large">${this.label}</legend>

        <!-- Email Address Input -->
        <usa-text-input
          id="email"
          name="email"
          label="Email address"
          type="email"
          ?required="${this.required}"
          autocapitalize="off"
          autocorrect="off"
          maxlength="256"
          hint="${this.hint}"
          compact
          @input="${(e: Event) =>
            this.handleFieldChange('email', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>

        <!-- Sensitive Information Consent (Optional) - visibility controlled by updated() -->
        <div class="consent-section display-none">
          <fieldset class="usa-fieldset margin-top-3">
            <legend class="usa-legend">${this.consentLabel}</legend>
            <usa-radio
              id="${consentId}-yes"
              name="sensitiveInfoConsent"
              value="yes-info"
              label="Yes, you may send sensitive information via email"
              @change="${(e: CustomEvent) => {
                if (e.detail.checked) {
                  this.handleFieldChange('sensitiveInfoConsent', 'yes-info');
                }
              }}"
            ></usa-radio>
            <usa-radio
              id="${consentId}-no"
              name="sensitiveInfoConsent"
              value="no-info"
              label="No, please do not send sensitive information via email"
              @change="${(e: CustomEvent) => {
                if (e.detail.checked) {
                  this.handleFieldChange('sensitiveInfoConsent', 'no-info');
                }
              }}"
            ></usa-radio>
          </fieldset>
        </div>
      </fieldset>
    `;
  }

  /**
   * Public API: Get current email data
   */
  getEmailData(): EmailAddressData {
    return { ...this.emailData };
  }

  /**
   * Public API: Set email data
   */
  setEmailData(data: EmailAddressData) {
    this.emailData = { ...data };

    // Manually update child component values (Light DOM pattern)
    Promise.resolve().then(() => {
      const email = this.querySelector('usa-text-input[name="email"]') as any;
      if (email) email.value = data.email || '';

      // Update radio buttons
      if (data.sensitiveInfoConsent) {
        const radios = this.querySelectorAll('usa-radio');
        radios.forEach((radio: any) => {
          if (radio.value === data.sensitiveInfoConsent) {
            radio.checked = true;
          }
        });
      }
    });
  }

  /**
   * Public API: Clear email
   */
  clearEmail() {
    this.emailData = { sensitiveInfoConsent: '' };

    // Reset form components using their public APIs
    const textInputs = this.querySelectorAll('usa-text-input');
    textInputs.forEach((input: any) => {
      if (input.reset) {
        input.reset();
      }
    });

    const radios = this.querySelectorAll('usa-radio');
    radios.forEach((radio: any) => {
      if (radio.reset) {
        radio.reset();
      }
    });
  }

  /**
   * Public API: Validate email
   */
  validateEmail(): boolean {
    if (!this.required) return true;

    const email = this.emailData.email || '';
    return this.isValidEmail(email);
  }

  /**
   * Public API: Get email value
   */
  getEmail(): string {
    return this.emailData.email || '';
  }

  /**
   * Public API: Get consent value
   */
  getConsent(): string {
    return this.emailData.sensitiveInfoConsent || '';
  }
}
