import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles

// Import USWDS web components
import '@uswds-wc/feedback';
import '@uswds-wc/navigation';
import '@uswds-wc/layout';
import '@uswds-wc/actions';
import '@uswds-wc/forms';
import '@uswds-wc/patterns';

/**
 * Create account form data interface
 */
export interface CreateAccountData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  agreeToTerms?: boolean;
}

/**
 * USA Create Account Template
 *
 * Registration page template following USWDS patterns.
 * Composes name and email patterns with password fields.
 *
 * **Template Structure (from USWDS):**
 * - Skip navigation + Banner + Header
 * - Registration form in centered card
 * - Sign-in link for existing users
 * - Footer + Identifier
 *
 * @element usa-create-account-template
 *
 * @slot form-header - Custom content above the form
 * @slot form-fields - Additional form fields
 * @slot form-footer - Custom content below the form (terms, links)
 * @slot header - Site header
 * @slot footer - Site footer
 *
 * @fires {CustomEvent} create-account-submit - Fired when form is submitted
 * @fires {CustomEvent} template-ready - Fired when template initializes
 *
 * @example Basic usage
 * ```html
 * <usa-create-account-template
 *   heading="Create account"
 *   show-name-fields
 *   show-password-requirements
 *   terms-url="/terms"
 *   privacy-url="/privacy"
 * ></usa-create-account-template>
 * ```
 *
 * @uswds-template https://designsystem.digital.gov/templates/create-account-page/
 */
@customElement('usa-create-account-template')
export class USACreateAccountTemplate extends LitElement {
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
  showIdentifier = true;

  /**
   * Page heading
   */
  @property({ type: String })
  heading = 'Create account';

  /**
   * Form legend (accessibility)
   */
  @property({ type: String, attribute: 'form-legend' })
  formLegend = 'Create your account';

  /**
   * Whether to show name fields
   */
  @property({ type: Boolean, attribute: 'show-name-fields' })
  showNameFields = true;

  /**
   * Whether to show password requirements
   */
  @property({ type: Boolean, attribute: 'show-password-requirements' })
  showPasswordRequirements = true;

  /**
   * Password requirements text
   */
  @property({ type: String, attribute: 'password-requirements-text' })
  passwordRequirementsText =
    'Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.';

  /**
   * Whether to show terms checkbox
   */
  @property({ type: Boolean, attribute: 'show-terms' })
  showTerms = true;

  /**
   * Terms of service URL
   */
  @property({ type: String, attribute: 'terms-url' })
  termsUrl = '/terms';

  /**
   * Privacy policy URL
   */
  @property({ type: String, attribute: 'privacy-url' })
  privacyUrl = '/privacy';

  /**
   * Submit button text
   */
  @property({ type: String, attribute: 'submit-text' })
  submitText = 'Create account';

  /**
   * Whether to show sign-in link
   */
  @property({ type: Boolean, attribute: 'show-sign-in-link' })
  showSignInLink = true;

  /**
   * Sign-in URL
   */
  @property({ type: String, attribute: 'sign-in-url' })
  signInUrl = '/sign-in';

  /**
   * Sign-in link text
   */
  @property({ type: String, attribute: 'sign-in-text' })
  signInText = 'Sign in';

  /**
   * Sign-in label text
   */
  @property({ type: String, attribute: 'sign-in-label' })
  signInLabel = 'Already have an account?';

  /**
   * Form action URL
   */
  @property({ type: String, attribute: 'action-url' })
  actionUrl = '';

  /**
   * Form method
   */
  @property({ type: String })
  method = 'POST';

  /**
   * Current form data state
   */
  @state()
  private formData: CreateAccountData = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false,
  };

  /**
   * Password mismatch error state
   */
  @state()
  private passwordMismatch = false;

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
        detail: { template: 'create-account' },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle form field changes
   */
  private handleFieldChange(field: keyof CreateAccountData, value: string | boolean) {
    this.formData = { ...this.formData, [field]: value };

    // Check password match
    if (field === 'password' || field === 'confirmPassword') {
      this.passwordMismatch =
        this.formData.password !== '' &&
        this.formData.confirmPassword !== '' &&
        this.formData.password !== this.formData.confirmPassword;
    }
  }

  /**
   * Handle form submission
   */
  private handleSubmit(e: Event) {
    e.preventDefault();

    // Validate passwords match
    if (this.formData.password !== this.formData.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.dispatchEvent(
      new CustomEvent('create-account-submit', {
        detail: { formData: { ...this.formData } },
        bubbles: true,
        composed: true,
      })
    );

    // If action URL is set, submit the form
    if (this.actionUrl) {
      const form = e.target as HTMLFormElement;
      form.submit();
    }
  }

  /**
   * Render name fields
   */
  private renderNameFields() {
    if (!this.showNameFields) {
      return nothing;
    }

    return html`
      <div class="grid-row grid-gap">
        <div class="grid-col-12 tablet:grid-col-6">
          <usa-text-input
            id="firstName"
            name="firstName"
            label="First name"
            required
            autocomplete="given-name"
            @input="${(e: Event) =>
              this.handleFieldChange('firstName', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>
        </div>
        <div class="grid-col-12 tablet:grid-col-6">
          <usa-text-input
            id="lastName"
            name="lastName"
            label="Last name"
            required
            autocomplete="family-name"
            @input="${(e: Event) =>
              this.handleFieldChange('lastName', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>
        </div>
      </div>
    `;
  }

  /**
   * Render the registration form
   */
  private renderForm() {
    return html`
      <form
        class="usa-form usa-form--large"
        @submit="${this.handleSubmit}"
        action="${this.actionUrl || nothing}"
        method="${this.method}"
      >
        <fieldset class="usa-fieldset">
          <legend class="usa-sr-only">${this.formLegend}</legend>

          <!-- Name Fields -->
          ${this.renderNameFields()}

          <!-- Email Field -->
          <usa-text-input
            id="email"
            name="email"
            type="email"
            label="Email address"
            required
            autocomplete="email"
            @input="${(e: Event) =>
              this.handleFieldChange('email', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>

          <!-- Password Field -->
          <usa-text-input
            id="password"
            name="password"
            type="password"
            label="Create password"
            required
            autocomplete="new-password"
            @input="${(e: Event) =>
              this.handleFieldChange('password', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>

          ${this.showPasswordRequirements
            ? html`
                <div class="usa-hint margin-top-1 margin-bottom-2">
                  ${this.passwordRequirementsText}
                </div>
              `
            : nothing}

          <!-- Confirm Password Field -->
          <usa-text-input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            required
            autocomplete="new-password"
            ?error="${this.passwordMismatch}"
            error-message="${this.passwordMismatch ? 'Passwords do not match' : ''}"
            @input="${(e: Event) =>
              this.handleFieldChange('confirmPassword', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>

          <!-- Additional Form Fields Slot -->
          <slot name="form-fields"></slot>

          <!-- Terms Checkbox -->
          ${this.showTerms
            ? html`
                <usa-checkbox
                  id="agreeToTerms"
                  name="agreeToTerms"
                  required
                  @change="${(e: CustomEvent) =>
                    this.handleFieldChange('agreeToTerms', e.detail.checked)}"
                >
                  <span slot="label">
                    I agree to the
                    <a href="${this.termsUrl}" class="usa-link" target="_blank">terms of service</a>
                    and
                    <a href="${this.privacyUrl}" class="usa-link" target="_blank">privacy policy</a>
                  </span>
                </usa-checkbox>
              `
            : nothing}

          <!-- Submit Button -->
          <usa-button type="submit" class="margin-top-3">${this.submitText}</usa-button>
        </fieldset>
      </form>
    `;
  }

  override render() {
    return html`
      <div class="usa-create-account-template">
        <!-- Skip Navigation -->
        <usa-skip-link href="#main-content" text="Skip to main content"></usa-skip-link>

        <!-- Government Banner -->
        ${this.showBanner ? html`<usa-banner></usa-banner>` : nothing}

        <!-- Header -->
        <slot name="header"></slot>

        <!-- Main Content -->
        <main id="main-content">
          <div class="bg-base-lightest">
            <section class="grid-container usa-section">
              <div class="grid-row flex-justify-center">
                <div class="grid-col-12 tablet:grid-col-8 desktop:grid-col-6">
                  <!-- Create Account Card -->
                  <div class="bg-white padding-y-3 padding-x-5 border border-base-lighter">
                    <h1 class="margin-bottom-0">${this.heading}</h1>

                    <!-- Form Header Slot -->
                    <slot name="form-header"></slot>

                    <!-- Registration Form -->
                    ${this.renderForm()}
                  </div>

                  <!-- Sign In Link -->
                  ${this.showSignInLink
                    ? html`
                        <p class="text-center">
                          ${this.signInLabel}
                          <a class="usa-link" href="${this.signInUrl}">${this.signInText}</a>.
                        </p>
                      `
                    : nothing}

                  <!-- Form Footer Slot -->
                  <slot name="form-footer"></slot>
                </div>
              </div>
            </section>
          </div>
        </main>

        <!-- Footer -->
        <slot name="footer"></slot>

        <!-- Identifier -->
        ${this.showIdentifier ? html`<usa-identifier></usa-identifier>` : nothing}
      </div>
    `;
  }

  /**
   * Public API: Get form data
   */
  getFormData(): CreateAccountData {
    return { ...this.formData };
  }

  /**
   * Public API: Reset form
   */
  resetForm(): void {
    this.formData = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      agreeToTerms: false,
    };
    this.passwordMismatch = false;

    // Reset form elements
    const form = this.querySelector('form');
    if (form) {
      form.reset();
    }
  }

  /**
   * Public API: Validate form
   */
  validateForm(): boolean {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.passwordMismatch = true;
      return false;
    }
    return true;
  }
}
