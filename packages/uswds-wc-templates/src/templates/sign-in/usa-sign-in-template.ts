import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles

// Import USWDS web components used by this template
import '@uswds-wc/feedback'; // usa-banner, usa-identifier
import '@uswds-wc/navigation'; // usa-skip-link
import '@uswds-wc/actions'; // usa-button
import '@uswds-wc/forms'; // usa-text-input, usa-checkbox

/**
 * Sign-in form data interface
 */
export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * USA Sign-In Template
 *
 * Authentication page template following USWDS patterns.
 * Composes the email-address pattern with password field.
 *
 * **Template Structure (from USWDS):**
 * - Skip navigation + Banner + Header
 * - Sign-in form in centered card
 * - Create account link
 * - Footer + Identifier
 *
 * @element usa-sign-in-template
 *
 * @slot form-header - Custom content above the form
 * @slot form-footer - Custom content below the form (links, etc.)
 * @slot additional-options - SSO or alternative login options
 * @slot header - Site header
 * @slot footer - Site footer
 *
 * @fires {CustomEvent} sign-in-submit - Fired when form is submitted
 * @fires {CustomEvent} template-ready - Fired when template initializes
 *
 * @example Basic usage
 * ```html
 * <usa-sign-in-template
 *   heading="Sign in"
 *   show-create-account
 *   create-account-url="/register"
 *   forgot-password-url="/forgot-password"
 * ></usa-sign-in-template>
 * ```
 *
 * @example With custom login options
 * ```html
 * <usa-sign-in-template heading="Sign in">
 *   <div slot="additional-options">
 *     <p>Or sign in with:</p>
 *     <usa-button variant="outline">Login.gov</usa-button>
 *   </div>
 * </usa-sign-in-template>
 * ```
 *
 * @uswds-template https://designsystem.digital.gov/templates/sign-in-page/
 */
@customElement('usa-sign-in-template')
export class USASignInTemplate extends LitElement {
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
  heading = 'Sign in';

  /**
   * Form legend (accessibility)
   */
  @property({ type: String, attribute: 'form-legend' })
  formLegend = 'Access your account';

  /**
   * Email field label
   */
  @property({ type: String, attribute: 'email-label' })
  emailLabel = 'Email address';

  /**
   * Password field label
   */
  @property({ type: String, attribute: 'password-label' })
  passwordLabel = 'Password';

  /**
   * Submit button text
   */
  @property({ type: String, attribute: 'submit-text' })
  submitText = 'Sign in';

  /**
   * Whether to show "Remember me" checkbox
   */
  @property({ type: Boolean, attribute: 'show-remember-me' })
  showRememberMe = false;

  /**
   * Whether to show the create account link
   */
  @property({ type: Boolean, attribute: 'show-create-account' })
  showCreateAccount = true;

  /**
   * Create account URL
   */
  @property({ type: String, attribute: 'create-account-url' })
  createAccountUrl = '/create-account';

  /**
   * Create account link text
   */
  @property({ type: String, attribute: 'create-account-text' })
  createAccountText = 'Create your account now';

  /**
   * Create account label text
   */
  @property({ type: String, attribute: 'create-account-label' })
  createAccountLabel = "Don't have an account?";

  /**
   * Whether to show forgot password link
   */
  @property({ type: Boolean, attribute: 'show-forgot-password' })
  showForgotPassword = true;

  /**
   * Forgot password URL
   */
  @property({ type: String, attribute: 'forgot-password-url' })
  forgotPasswordUrl = '/forgot-password';

  /**
   * Forgot password link text
   */
  @property({ type: String, attribute: 'forgot-password-text' })
  forgotPasswordText = 'Forgot password?';

  /**
   * Whether to show password toggle
   */
  @property({ type: Boolean, attribute: 'show-password-toggle' })
  showPasswordToggle = true;

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
  private formData: SignInData = {
    email: '',
    password: '',
    rememberMe: false,
  };

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
        detail: { template: 'sign-in' },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle form field changes
   */
  private handleFieldChange(field: keyof SignInData, value: string | boolean) {
    this.formData = { ...this.formData, [field]: value };
  }

  /**
   * Handle form submission
   */
  private handleSubmit(e: Event) {
    e.preventDefault();

    this.dispatchEvent(
      new CustomEvent('sign-in-submit', {
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
   * Render the sign-in form
   */
  private renderForm() {
    return html`
      <form
        class="usa-form"
        @submit="${this.handleSubmit}"
        action="${this.actionUrl || nothing}"
        method="${this.method}"
      >
        <fieldset class="usa-fieldset">
          <legend class="usa-sr-only">${this.formLegend}</legend>

          <!-- Email Field -->
          <usa-text-input
            id="email"
            name="email"
            type="email"
            label="${this.emailLabel}"
            required
            autocomplete="email"
            @input="${(e: Event) =>
              this.handleFieldChange('email', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>

          <!-- Password Field -->
          <div class="usa-form-group">
            <usa-text-input
              id="password"
              name="password"
              type="password"
              label="${this.passwordLabel}"
              required
              autocomplete="current-password"
              @input="${(e: Event) =>
                this.handleFieldChange('password', (e.target as HTMLInputElement).value)}"
            ></usa-text-input>
            ${this.showForgotPassword
              ? html`
                  <p class="margin-top-1">
                    <a href="${this.forgotPasswordUrl}" class="usa-link">
                      ${this.forgotPasswordText}
                    </a>
                  </p>
                `
              : nothing}
          </div>

          <!-- Remember Me -->
          ${this.showRememberMe
            ? html`
                <usa-checkbox
                  id="remember-me"
                  name="rememberMe"
                  label="Remember me"
                  @change="${(e: CustomEvent) =>
                    this.handleFieldChange('rememberMe', e.detail.checked)}"
                ></usa-checkbox>
              `
            : nothing}

          <!-- Submit Button -->
          <usa-button type="submit">${this.submitText}</usa-button>
        </fieldset>
      </form>
    `;
  }

  override render() {
    return html`
      <div class="usa-sign-in-template">
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
                  <!-- Sign In Card -->
                  <div class="bg-white padding-y-3 padding-x-5 border border-base-lighter">
                    <h1 class="margin-bottom-0">${this.heading}</h1>

                    <!-- Form Header Slot -->
                    <slot name="form-header"></slot>

                    <!-- Sign In Form -->
                    ${this.renderForm()}

                    <!-- Additional Options Slot -->
                    <slot name="additional-options"></slot>
                  </div>

                  <!-- Create Account Link -->
                  ${this.showCreateAccount
                    ? html`
                        <p class="text-center">
                          ${this.createAccountLabel}
                          <a class="usa-link" href="${this.createAccountUrl}">
                            ${this.createAccountText} </a
                          >.
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
  getFormData(): SignInData {
    return { ...this.formData };
  }

  /**
   * Public API: Reset form
   */
  resetForm(): void {
    this.formData = {
      email: '',
      password: '',
      rememberMe: false,
    };

    // Reset form elements
    const form = this.querySelector('form');
    if (form) {
      form.reset();
    }
  }

  /**
   * Public API: Set form data
   */
  setFormData(data: Partial<SignInData>): void {
    this.formData = { ...this.formData, ...data };
  }
}
