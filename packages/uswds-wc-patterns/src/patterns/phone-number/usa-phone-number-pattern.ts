import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles

// Import USWDS web components
import '@uswds-wc/forms';

/**
 * Phone number data interface
 */
export interface PhoneNumberData {
  phoneNumber?: string;
  extension?: string;
  type?: 'mobile' | 'home' | 'work' | '';
}

/**
 * USA Phone Number Pattern
 *
 * USWDS pattern for collecting US phone numbers with proper formatting and validation.
 * Supports extensions and phone type classification.
 *
 * **Pattern Responsibilities:**
 * - Collect US phone numbers in 10-digit format
 * - Automatic input masking (999-999-9999)
 * - Extension field for business lines
 * - Phone type selection (mobile/home/work)
 * - SMS capability indication
 * - Format validation
 * - Emit phone number data changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 *
 * **Format Requirements:**
 * - US phone numbers only (10 digits)
 * - Single field (not split into parts)
 * - Automatic formatting as user types
 * - Accepts input with or without hyphens
 *
 * @element usa-phone-number-pattern
 *
 * @fires {CustomEvent} phone-change - Fired when phone data changes
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @example Basic usage
 * ```html
 * <usa-phone-number-pattern
 *   label="Phone Number"
 *   required
 * ></usa-phone-number-pattern>
 * ```
 *
 * @example With extension and type
 * ```html
 * <usa-phone-number-pattern
 *   show-extension
 *   show-type
 *   sms-required
 * ></usa-phone-number-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/create-a-user-profile/phone-number/
 */
@customElement('usa-phone-number-pattern')
export class USAPhoneNumberPattern extends LitElement {
  // Use Light DOM for patterns
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Label for the phone number section
   */
  @property({ type: String })
  label = 'Phone number';

  /**
   * Whether phone number is required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Whether to show extension field
   */
  @property({ type: Boolean, attribute: 'show-extension' })
  get showExtension() {
    return this._showExtension;
  }
  set showExtension(value: boolean) {
    this._showExtension = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.toggleExtensionVisibility());
  }
  private _showExtension = false;

  /**
   * Whether to show phone type selector
   */
  @property({ type: Boolean, attribute: 'show-type' })
  get showType() {
    return this._showType;
  }
  set showType(value: boolean) {
    this._showType = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.togglePhoneTypeVisibility());
  }
  private _showType = false;

  /**
   * Whether SMS capability is required
   */
  @property({ type: Boolean, attribute: 'sms-required' })
  get smsRequired() {
    return this._smsRequired;
  }
  set smsRequired(value: boolean) {
    this._smsRequired = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.toggleSmsAlertVisibility());
  }
  private _smsRequired = false;

  /**
   * Current phone number data
   */
  @state()
  private phoneData: PhoneNumberData = {
    type: '',
  };

  /**
   * Unique ID for this pattern instance (for ARIA connections)
   * Currently not used as hints are passed directly to child components,
   * but available for future fieldset-level aria-describedby if needed.
   */
  // @ts-expect-error - Reserved for future fieldset-level aria-describedby
  private _patternId: string;

  constructor() {
    super();
    this._patternId = `phone-${Math.random().toString(36).substring(2, 11)}`;
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
    // Note: smsRequired NOT included here because we need updated() to run to update hint text
    const noRerenderProps = ['showType', 'showExtension', 'phoneData'];
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
        detail: { phoneData: this.phoneData },
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

    // Toggle phone type visibility
    if (changedProperties.has('showType') || changedProperties.size === 0) {
      this.togglePhoneTypeVisibility();
    }

    // Toggle extension visibility
    if (changedProperties.has('showExtension') || changedProperties.size === 0) {
      this.toggleExtensionVisibility();
    }

    // Toggle SMS alert visibility and update hint text
    if (changedProperties.has('smsRequired') || changedProperties.size === 0) {
      this.toggleSmsAlertVisibility();
      this.updatePhoneNumberHint();
    }
  }

  /**
   * Toggle phone type visibility
   */
  private togglePhoneTypeVisibility() {
    const phoneType = this.querySelector('usa-select[name="phoneType"]');
    if (phoneType) {
      if (this.showType) {
        phoneType.classList.remove('display-none');
      } else {
        phoneType.classList.add('display-none');
      }
    }
  }

  /**
   * Toggle extension visibility
   */
  private toggleExtensionVisibility() {
    const extension = this.querySelector('usa-text-input[name="extension"]');
    if (extension) {
      if (this.showExtension) {
        extension.classList.remove('display-none');
      } else {
        extension.classList.add('display-none');
      }
    }
  }

  /**
   * Toggle SMS alert visibility
   */
  private toggleSmsAlertVisibility() {
    const alert = this.querySelector('.usa-alert');
    if (alert) {
      if (this.smsRequired) {
        alert.classList.remove('display-none');
      } else {
        alert.classList.add('display-none');
      }
    }
  }

  /**
   * Update phone number hint text when smsRequired changes
   */
  private updatePhoneNumberHint() {
    const phoneNumber = this.querySelector('usa-text-input[name="phoneNumber"]') as any;
    if (phoneNumber) {
      const hintText = this.smsRequired
        ? 'Please enter an SMS-capable mobile phone number'
        : '10-digit U.S. phone number';
      // Set both property and attribute to ensure synchronization
      phoneNumber.hint = hintText;
      phoneNumber.setAttribute('hint', hintText);
    }
  }

  /**
   * Format phone number as user types
   */
  private formatPhoneNumber(value: string): string {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Apply masking: 999-999-9999
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  }

  /**
   * Handle phone number input with formatting
   */
  private handlePhoneInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const formatted = this.formatPhoneNumber(input.value);
    input.value = formatted;

    this.handleFieldChange('phoneNumber', formatted);
  }

  /**
   * Handle field changes
   */
  private handleFieldChange(field: keyof PhoneNumberData, value: string) {
    this.phoneData = { ...this.phoneData, [field]: value };

    this.dispatchEvent(
      new CustomEvent('phone-change', {
        detail: { phoneData: this.phoneData, field, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  }

  override render() {
    const hintText = this.smsRequired
      ? 'Please enter an SMS-capable mobile phone number'
      : '10-digit U.S. phone number';

    return html`
      <fieldset class="usa-fieldset">
        <legend class="usa-legend usa-legend--large">${this.label}</legend>

        <!-- Phone Type (Optional) - CSS visibility control -->
        <usa-select
          id="phoneType"
          name="phoneType"
          label="Phone type"
          hint="${!this.required ? '(optional)' : ''}"
          compact
          .options="${[
            { value: '', text: '- Select -' },
            { value: 'mobile', text: 'Mobile' },
            { value: 'home', text: 'Home' },
            { value: 'work', text: 'Work' },
          ]}"
          @change="${(e: Event) =>
            this.handleFieldChange('type', (e.target as HTMLSelectElement).value as any)}"
        ></usa-select>

        <!-- Phone Number -->
        <usa-text-input
          id="phoneNumber"
          name="phoneNumber"
          label="${this.showType ? 'Number' : 'Phone number'}"
          hint="${hintText}"
          type="text"
          inputmode="numeric"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          maxlength="12"
          ?required="${this.required}"
          compact
          @input="${this.handlePhoneInput}"
        ></usa-text-input>

        <!-- Extension (Optional) - CSS visibility control -->
        <usa-text-input
          id="extension"
          name="extension"
          label="Extension"
          hint="For business lines or switchboards (optional)"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          compact
          @input="${(e: Event) =>
            this.handleFieldChange('extension', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>

        <!-- SMS Alert - visibility controlled by updated() -->
        <div class="usa-alert usa-alert--info usa-alert--slim">
          <div class="usa-alert__body">
            <p class="usa-alert__text">
              We will send a verification code to this number via text message.
            </p>
          </div>
        </div>
      </fieldset>
    `;
  }

  /**
   * Public API: Get current phone data
   */
  getPhoneData(): PhoneNumberData {
    return { ...this.phoneData };
  }

  /**
   * Public API: Set phone data
   */
  setPhoneData(data: PhoneNumberData) {
    this.phoneData = { ...data };

    // Manually update child component values (Light DOM pattern)
    // Use Promise.resolve() instead of updateComplete to avoid triggering update cycle
    Promise.resolve().then(() => {
      const phoneType = this.querySelector('usa-select[name="phoneType"]') as any;
      const phoneNumber = this.querySelector('usa-text-input[name="phoneNumber"]') as any;
      const extension = this.querySelector('usa-text-input[name="extension"]') as any;

      if (phoneType) phoneType.value = data.type || '';
      if (phoneNumber) phoneNumber.value = data.phoneNumber || '';
      if (extension) extension.value = data.extension || '';
    });
  }

  /**
   * Public API: Clear phone number
   */
  clearPhoneNumber() {
    this.phoneData = { type: '' };
    // Reset form components using their public APIs
    const textInputs = this.querySelectorAll('usa-text-input');
    textInputs.forEach((input: any) => {
      if (input.reset) {
        input.reset();
      }
    });

    const selects = this.querySelectorAll('usa-select');
    selects.forEach((select: any) => {
      if (select.reset) {
        select.reset();
      }
    });
  }

  /**
   * Public API: Validate phone number
   */
  validatePhoneNumber(): boolean {
    if (!this.required) return true;

    const phone = this.phoneData.phoneNumber || '';
    return this.isValidPhoneNumber(phone);
  }

  /**
   * Public API: Get formatted phone number
   */
  getFormattedPhoneNumber(): string {
    return this.phoneData.phoneNumber || '';
  }

  /**
   * Public API: Get raw phone digits (no formatting)
   */
  getRawPhoneNumber(): string {
    const phone = this.phoneData.phoneNumber || '';
    return phone.replace(/\D/g, '');
  }
}
