import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles

// Import USWDS web components
import '@uswds-wc/forms';

/**
 * Address data interface
 *
 * USWDS Address Pattern - U.S. Domestic Addresses Only
 * Supports U.S. states, territories, and military posts.
 * Does NOT support international addresses per USWDS specification.
 */
export interface AddressData {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  urbanization?: string;
  plusCode?: string;
}

/**
 * USA Address Pattern
 *
 * USWDS pattern for collecting physical or mailing addresses.
 * Supports U.S. domestic addresses only (states, territories, and military posts).
 *
 * **IMPORTANT:** This pattern does NOT support international addresses per USWDS specification.
 * The USWDS documentation states: "This pattern supports domestic U.S. addresses, including
 * the U.S. territories and military outposts. If you need to collect addresses that may not
 * fit this format, such as international addresses, you will need to use something else."
 *
 * **Pattern Responsibilities:**
 * - Manage address field visibility
 * - Handle optional street line 2
 * - Provide state/ZIP validation
 * - Emit address data changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 *
 * **Simplicity Philosophy:**
 * Simple orchestration of form inputs with address-specific logic.
 * Developers can customize field labels and validation.
 *
 * @element usa-address-pattern
 *
 * @fires {CustomEvent} address-change - Fired when address data changes
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @example Basic usage
 * ```html
 * <usa-address-pattern
 *   label="Mailing Address"
 *   required
 * ></usa-address-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/create-a-user-profile/address/
 */
@customElement('usa-address-pattern')
export class USAAddressPattern extends LitElement {
  // Use Light DOM for patterns
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Label for the address section
   */
  @property({ type: String })
  label = 'Address';

  /**
   * Whether all fields are required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Whether to show street line 2
   */
  @property({ type: Boolean, attribute: 'show-street2' })
  get showStreet2() {
    return this._showStreet2;
  }
  set showStreet2(value: boolean) {
    this._showStreet2 = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.toggleStreet2Visibility());
  }
  private _showStreet2 = true;

  /**
   * Whether to show Google Plus Code field
   */
  @property({ type: Boolean, attribute: 'show-plus-code' })
  get showPlusCode() {
    return this._showPlusCode;
  }
  set showPlusCode(value: boolean) {
    this._showPlusCode = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.togglePlusCodeVisibility());
  }
  private _showPlusCode = false;

  /**
   * Current address data
   */
  @state()
  private addressData: AddressData = {};

  /**
   * Unique ID for this pattern instance (for ARIA connections)
   * Currently not used as hints are passed directly to child components,
   * but available for future fieldset-level aria-describedby if needed.
   */
  // @ts-expect-error - Reserved for future fieldset-level aria-describedby
  private _patternId: string;

  constructor() {
    super();
    this._patternId = `address-${Math.random().toString(36).substring(2, 11)}`;
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
    const noRerenderProps = ['showStreet2', 'showPlusCode', 'addressData'];
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
        detail: { addressData: this.addressData },
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

    // Toggle street2 visibility
    if (changedProperties.has('showStreet2') || changedProperties.size === 0) {
      this.toggleStreet2Visibility();
    }

    // Toggle plus code visibility
    if (changedProperties.has('showPlusCode') || changedProperties.size === 0) {
      this.togglePlusCodeVisibility();
    }
  }

  /**
   * Toggle street2 field visibility
   */
  private toggleStreet2Visibility() {
    const street2 = this.querySelector('usa-text-input[name="street2"]');
    if (street2) {
      if (this.showStreet2) {
        street2.classList.remove('display-none');
      } else {
        street2.classList.add('display-none');
      }
    }
  }

  /**
   * Toggle plus code field visibility
   */
  private togglePlusCodeVisibility() {
    const plusCode = this.querySelector('usa-text-input[name="plusCode"]');
    if (plusCode) {
      if (this.showPlusCode) {
        plusCode.classList.remove('display-none');
      } else {
        plusCode.classList.add('display-none');
      }
    }
  }

  /**
   * Handle field changes
   */
  private handleFieldChange(field: keyof AddressData, value: string) {
    this.addressData = { ...this.addressData, [field]: value };

    this.dispatchEvent(
      new CustomEvent('address-change', {
        detail: { addressData: this.addressData, field, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Get US states, territories, and military posts
   * Complete list per USWDS specification
   * Reference: https://designsystem.digital.gov/patterns/create-a-user-profile/address/
   */
  private getStates() {
    return [
      { value: '', label: '- Select -' },
      { value: 'AL', label: 'AL - Alabama' },
      { value: 'AK', label: 'AK - Alaska' },
      { value: 'AS', label: 'AS - American Samoa' },
      { value: 'AZ', label: 'AZ - Arizona' },
      { value: 'AR', label: 'AR - Arkansas' },
      { value: 'CA', label: 'CA - California' },
      { value: 'CO', label: 'CO - Colorado' },
      { value: 'CT', label: 'CT - Connecticut' },
      { value: 'DE', label: 'DE - Delaware' },
      { value: 'DC', label: 'DC - District of Columbia' },
      { value: 'FL', label: 'FL - Florida' },
      { value: 'GA', label: 'GA - Georgia' },
      { value: 'GU', label: 'GU - Guam' },
      { value: 'HI', label: 'HI - Hawaii' },
      { value: 'ID', label: 'ID - Idaho' },
      { value: 'IL', label: 'IL - Illinois' },
      { value: 'IN', label: 'IN - Indiana' },
      { value: 'IA', label: 'IA - Iowa' },
      { value: 'KS', label: 'KS - Kansas' },
      { value: 'KY', label: 'KY - Kentucky' },
      { value: 'LA', label: 'LA - Louisiana' },
      { value: 'ME', label: 'ME - Maine' },
      { value: 'MD', label: 'MD - Maryland' },
      { value: 'MA', label: 'MA - Massachusetts' },
      { value: 'MI', label: 'MI - Michigan' },
      { value: 'MN', label: 'MN - Minnesota' },
      { value: 'MS', label: 'MS - Mississippi' },
      { value: 'MO', label: 'MO - Missouri' },
      { value: 'MT', label: 'MT - Montana' },
      { value: 'NE', label: 'NE - Nebraska' },
      { value: 'NV', label: 'NV - Nevada' },
      { value: 'NH', label: 'NH - New Hampshire' },
      { value: 'NJ', label: 'NJ - New Jersey' },
      { value: 'NM', label: 'NM - New Mexico' },
      { value: 'NY', label: 'NY - New York' },
      { value: 'NC', label: 'NC - North Carolina' },
      { value: 'ND', label: 'ND - North Dakota' },
      { value: 'MP', label: 'MP - Northern Mariana Islands' },
      { value: 'OH', label: 'OH - Ohio' },
      { value: 'OK', label: 'OK - Oklahoma' },
      { value: 'OR', label: 'OR - Oregon' },
      { value: 'PA', label: 'PA - Pennsylvania' },
      { value: 'PR', label: 'PR - Puerto Rico' },
      { value: 'RI', label: 'RI - Rhode Island' },
      { value: 'SC', label: 'SC - South Carolina' },
      { value: 'SD', label: 'SD - South Dakota' },
      { value: 'TN', label: 'TN - Tennessee' },
      { value: 'TX', label: 'TX - Texas' },
      { value: 'UM', label: 'UM - United States Minor Outlying Islands' },
      { value: 'UT', label: 'UT - Utah' },
      { value: 'VT', label: 'VT - Vermont' },
      { value: 'VI', label: 'VI - Virgin Islands' },
      { value: 'VA', label: 'VA - Virginia' },
      { value: 'WA', label: 'WA - Washington' },
      { value: 'WV', label: 'WV - West Virginia' },
      { value: 'WI', label: 'WI - Wisconsin' },
      { value: 'WY', label: 'WY - Wyoming' },
      { value: 'AA', label: 'AA - Armed Forces Americas' },
      { value: 'AE', label: 'AE - Armed Forces Europe' },
      { value: 'AP', label: 'AP - Armed Forces Pacific' },
    ];
  }

  override render() {
    return html`
      <fieldset class="usa-fieldset">
        <legend class="usa-legend usa-legend--large">${this.label}</legend>

        <!-- Street Address Line 1 -->
        <usa-text-input
          id="street1"
          name="street1"
          label="Street address"
          ?required="${this.required}"
          compact
          @input="${(e: Event) =>
            this.handleFieldChange('street1', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>

        <!-- Street Address Line 2 (Optional) - visibility controlled by updated() -->
        <usa-text-input
          id="street2"
          name="street2"
          label="Street address line 2"
          hint="(optional)"
          compact
          @input="${(e: Event) =>
            this.handleFieldChange('street2', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>

        <!-- City -->
        <usa-text-input
          id="city"
          name="city"
          label="City"
          ?required="${this.required}"
          compact
          @input="${(e: Event) =>
            this.handleFieldChange('city', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>

        <!-- State -->
        <usa-select
          id="state"
          name="state"
          label="State, territory, or military post"
          ?required="${this.required}"
          compact
          .options="${this.getStates().map((state) => ({
            value: state.value,
            text: state.label,
          }))}"
          @change="${(e: Event) =>
            this.handleFieldChange('state', (e.target as HTMLSelectElement).value)}"
        ></usa-select>

        <!-- ZIP Code -->
        <usa-text-input
          id="zipCode"
          name="zipCode"
          label="ZIP code"
          type="text"
          width="medium"
          pattern="[0-9]{5}(-[0-9]{4})?"
          maxlength="10"
          ?required="${this.required}"
          compact
          @input="${(e: Event) =>
            this.handleFieldChange('zipCode', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>

        <!-- Urbanization (Puerto Rico only) -->
        <usa-text-input
          id="urbanization"
          name="urbanization"
          label="Urbanization (Puerto Rico only)"
          hint="(optional)"
          compact
          @input="${(e: Event) =>
            this.handleFieldChange('urbanization', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>

        <!-- Google Plus Code (Optional) - visibility controlled by updated() -->
        <usa-text-input
          id="plusCode"
          name="plusCode"
          label="Google Plus Code"
          hint="A location code for places without street addresses (optional)"
          compact
          class="display-none"
          @input="${(e: Event) =>
            this.handleFieldChange('plusCode', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>
      </fieldset>
    `;
  }

  /**
   * Public API: Get current address data
   */
  getAddressData(): AddressData {
    return { ...this.addressData };
  }

  /**
   * Public API: Set address data
   */
  setAddressData(data: AddressData) {
    this.addressData = { ...data };

    // Manually update child component values (Light DOM pattern)
    // Use Promise.resolve() instead of updateComplete to avoid triggering update cycle
    Promise.resolve().then(() => {
      const street1 = this.querySelector('usa-text-input[name="street1"]') as any;
      const street2 = this.querySelector('usa-text-input[name="street2"]') as any;
      const city = this.querySelector('usa-text-input[name="city"]') as any;
      const state = this.querySelector('usa-select[name="state"]') as any;
      const zipCode = this.querySelector('usa-text-input[name="zipCode"]') as any;
      const urbanization = this.querySelector('usa-text-input[name="urbanization"]') as any;
      const plusCode = this.querySelector('usa-text-input[name="plusCode"]') as any;

      if (street1) street1.value = data.street1 || '';
      if (street2) street2.value = data.street2 || '';
      if (city) city.value = data.city || '';
      if (state) state.value = data.state || '';
      if (zipCode) zipCode.value = data.zipCode || '';
      if (urbanization) urbanization.value = data.urbanization || '';
      if (plusCode) plusCode.value = data.plusCode || '';
    });
  }

  /**
   * Public API: Clear address
   */
  clearAddress() {
    this.addressData = {};
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
   * Public API: Validate address
   */
  validateAddress(): boolean {
    if (!this.required) return true;

    const { street1, city, state, zipCode } = this.addressData;
    return !!(street1 && city && state && zipCode);
  }
}
