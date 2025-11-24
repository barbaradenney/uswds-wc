import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import USWDS web components
import '@uswds-wc/forms';

/**
 * Name data interface
 */
export interface NameData {
  fullName?: string;
  givenName?: string;
  middleName?: string;
  familyName?: string;
  suffix?: string;
  preferredName?: string;
}

/**
 * Name format types
 */
export type NameFormat = 'full' | 'separate' | 'flexible';

/**
 * USA Name Pattern
 *
 * USWDS pattern for collecting names with cultural sensitivity.
 * Supports multiple name formats to accommodate diverse naming conventions.
 *
 * **Pattern Responsibilities:**
 * - Provide flexible name collection (single field or separate fields)
 * - Support cultural naming conventions
 * - Handle preferred names for correspondence
 * - Validate name format and length
 * - Emit name data changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 *
 * **Cultural Sensitivity:**
 * - Supports single names (Indonesian, Icelandic)
 * - Accommodates multiple family names (Spanish, Brazilian)
 * - Uses "given name" and "family name" (not "first" and "last")
 * - Supports diacritics, accents, and alternative characters
 * - Allows up to 128 characters per field
 *
 * @element usa-name-pattern
 *
 * @fires {CustomEvent} name-change - Fired when name data changes
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @example Basic usage (single field)
 * ```html
 * <usa-name-pattern
 *   format="full"
 *   required
 * ></usa-name-pattern>
 * ```
 *
 * @example Separate fields
 * ```html
 * <usa-name-pattern
 *   format="separate"
 *   show-middle
 *   show-suffix
 * ></usa-name-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/create-a-user-profile/name/
 */
@customElement('usa-name-pattern')
export class USANamePattern extends LitElement {
  // Use Light DOM for patterns
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Label for the name section
   */
  @property({ type: String })
  label = 'Name';

  /**
   * Name format: 'full' (single field), 'separate' (given/family), 'flexible' (both options)
   */
  @property({ type: String })
  get format() {
    return this._format;
  }
  set format(value: NameFormat) {
    this._format = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.toggleFormatVisibility());
  }
  private _format: NameFormat = 'full';

  /**
   * Whether name fields are required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Whether to show middle name field (only for 'separate' or 'flexible')
   */
  @property({ type: Boolean, attribute: 'show-middle' })
  get showMiddle() {
    return this._showMiddle;
  }
  set showMiddle(value: boolean) {
    this._showMiddle = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.toggleMiddleNameVisibility());
  }
  private _showMiddle = false;

  /**
   * Whether to show suffix field (only for 'separate' or 'flexible')
   */
  @property({ type: Boolean, attribute: 'show-suffix' })
  get showSuffix() {
    return this._showSuffix;
  }
  set showSuffix(value: boolean) {
    this._showSuffix = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.toggleSuffixVisibility());
  }
  private _showSuffix = false;

  /**
   * Whether to show preferred name field
   */
  @property({ type: Boolean, attribute: 'show-preferred' })
  get showPreferred() {
    return this._showPreferred;
  }
  set showPreferred(value: boolean) {
    this._showPreferred = value;
    // Manually toggle visibility immediately (don't trigger Lit's update cycle)
    Promise.resolve().then(() => this.togglePreferredNameVisibility());
  }
  private _showPreferred = false;

  /**
   * Current name data
   */
  @state()
  private nameData: NameData = {};

  /**
   * Unique ID for this pattern instance (for ARIA connections)
   * Currently not used as hints are passed directly to child components,
   * but available for future fieldset-level aria-describedby if needed.
   */
  // @ts-expect-error - Reserved for future fieldset-level aria-describedby
  private _patternId: string;

  constructor() {
    super();
    this._patternId = `name-${Math.random().toString(36).substring(2, 11)}`;
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
    const noRerenderProps = ['showMiddle', 'showSuffix', 'showPreferred', 'format', 'nameData'];
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
        detail: { nameData: this.nameData },
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

    // Toggle format visibility (full name vs separate fields)
    if (changedProperties.has('format') || changedProperties.size === 0) {
      this.toggleFormatVisibility();
    }

    // Toggle middle name visibility
    if (changedProperties.has('showMiddle') || changedProperties.size === 0) {
      this.toggleMiddleNameVisibility();
    }

    // Toggle suffix visibility
    if (changedProperties.has('showSuffix') || changedProperties.size === 0) {
      this.toggleSuffixVisibility();
    }

    // Toggle preferred name visibility
    if (changedProperties.has('showPreferred') || changedProperties.size === 0) {
      this.togglePreferredNameVisibility();
    }
  }

  /**
   * Toggle format visibility (full name vs separate fields)
   */
  private toggleFormatVisibility() {
    const showFull = this.format === 'full' || this.format === 'flexible';
    const showSeparate = this.format === 'separate' || this.format === 'flexible';

    const fullNameContainer = this.querySelector('.full-name-container');
    const separateFieldsContainer = this.querySelector('.separate-fields-container');

    if (fullNameContainer) {
      if (showFull) {
        fullNameContainer.classList.remove('display-none');
      } else {
        fullNameContainer.classList.add('display-none');
      }
    }

    if (separateFieldsContainer) {
      if (showSeparate) {
        separateFieldsContainer.classList.remove('display-none');
      } else {
        separateFieldsContainer.classList.add('display-none');
      }
    }
  }

  /**
   * Toggle middle name visibility
   */
  private toggleMiddleNameVisibility() {
    const middleName = this.querySelector('usa-text-input[name="middleName"]');
    if (middleName) {
      if (this.showMiddle) {
        middleName.classList.remove('display-none');
      } else {
        middleName.classList.add('display-none');
      }
    }
  }

  /**
   * Toggle suffix visibility
   */
  private toggleSuffixVisibility() {
    const suffix = this.querySelector('usa-select[name="suffix"]');
    if (suffix) {
      if (this.showSuffix) {
        suffix.classList.remove('display-none');
      } else {
        suffix.classList.add('display-none');
      }
    }
  }

  /**
   * Toggle preferred name visibility
   */
  private togglePreferredNameVisibility() {
    const preferredName = this.querySelector('usa-text-input[name="preferredName"]');
    if (preferredName) {
      if (this.showPreferred) {
        preferredName.classList.remove('display-none');
      } else {
        preferredName.classList.add('display-none');
      }
    }
  }

  /**
   * Handle field changes
   */
  private handleFieldChange(field: keyof NameData, value: string) {
    this.nameData = { ...this.nameData, [field]: value };

    this.dispatchEvent(
      new CustomEvent('name-change', {
        detail: { nameData: this.nameData, field, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Get common name suffixes
   */
  private getSuffixes() {
    return [
      { value: '', label: '- Select -' },
      { value: 'Jr.', label: 'Jr.' },
      { value: 'Sr.', label: 'Sr.' },
      { value: 'II', label: 'II' },
      { value: 'III', label: 'III' },
      { value: 'IV', label: 'IV' },
      { value: 'V', label: 'V' },
    ];
  }

  override render() {
    return html`
      <fieldset class="usa-fieldset">
        <legend class="usa-legend usa-legend--large">${this.label}</legend>

        <!-- Full Name Field - visibility controlled by updated() -->
        <div class="full-name-container">
          <usa-text-input
            id="fullName"
            name="fullName"
            label="Full name"
            hint="Enter your name as you would like it to appear"
            maxlength="128"
            ?required="${this.required}"
            compact
            @input="${(e: Event) =>
              this.handleFieldChange('fullName', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>
        </div>

        <!-- Separate Fields - visibility controlled by updated() -->
        <div class="separate-fields-container">
          <!-- Given Name -->
          <usa-text-input
            id="givenName"
            name="givenName"
            label="Given name"
            hint="Also called first name or personal name"
            maxlength="128"
            ?required="${this.required}"
            compact
            @input="${(e: Event) =>
              this.handleFieldChange('givenName', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>

          <!-- Middle Name (Optional) - visibility controlled by updated() -->
          <usa-text-input
            id="middleName"
            name="middleName"
            label="Middle name"
            hint="(optional)"
            maxlength="128"
            compact
            @input="${(e: Event) =>
              this.handleFieldChange('middleName', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>

          <!-- Family Name -->
          <usa-text-input
            id="familyName"
            name="familyName"
            label="Family name"
            hint="Also called last name or surname"
            maxlength="128"
            ?required="${this.required}"
            compact
            @input="${(e: Event) =>
              this.handleFieldChange('familyName', (e.target as HTMLInputElement).value)}"
          ></usa-text-input>

          <!-- Suffix (Optional) - visibility controlled by updated() -->
          <usa-select
            id="suffix"
            name="suffix"
            label="Suffix"
            hint="(optional)"
            compact
            .options="${this.getSuffixes().map((suffix) => ({
              value: suffix.value,
              text: suffix.label,
            }))}"
            @change="${(e: Event) =>
              this.handleFieldChange('suffix', (e.target as HTMLSelectElement).value)}"
          ></usa-select>
        </div>

        <!-- Preferred Name Field - visibility controlled by updated() -->
        <usa-text-input
          id="preferredName"
          name="preferredName"
          label="Preferred name"
          hint="How you would like to be addressed in correspondence (optional)"
          maxlength="128"
          compact
          @input="${(e: Event) =>
            this.handleFieldChange('preferredName', (e.target as HTMLInputElement).value)}"
        ></usa-text-input>
      </fieldset>
    `;
  }

  /**
   * Public API: Get current name data
   */
  getNameData(): NameData {
    return { ...this.nameData };
  }

  /**
   * Public API: Set name data
   */
  setNameData(data: NameData) {
    this.nameData = { ...data };

    // Manually update child component values (Light DOM pattern)
    // Use Promise.resolve() instead of updateComplete to avoid triggering update cycle
    Promise.resolve().then(() => {
      const fullName = this.querySelector('usa-text-input[name="fullName"]') as any;
      const givenName = this.querySelector('usa-text-input[name="givenName"]') as any;
      const middleName = this.querySelector('usa-text-input[name="middleName"]') as any;
      const familyName = this.querySelector('usa-text-input[name="familyName"]') as any;
      const suffix = this.querySelector('usa-select[name="suffix"]') as any;
      const preferredName = this.querySelector('usa-text-input[name="preferredName"]') as any;

      if (fullName) fullName.value = data.fullName || '';
      if (givenName) givenName.value = data.givenName || '';
      if (middleName) middleName.value = data.middleName || '';
      if (familyName) familyName.value = data.familyName || '';
      if (suffix) suffix.value = data.suffix || '';
      if (preferredName) preferredName.value = data.preferredName || '';
    });
  }

  /**
   * Public API: Clear name
   */
  clearName() {
    this.nameData = {};
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
   * Public API: Validate name
   */
  validateName(): boolean {
    if (!this.required) return true;

    if (this.format === 'full') {
      return !!this.nameData.fullName;
    } else if (this.format === 'separate') {
      return !!(this.nameData.givenName && this.nameData.familyName);
    } else {
      // flexible: either full name or given+family
      return !!(this.nameData.fullName || (this.nameData.givenName && this.nameData.familyName));
    }
  }

  /**
   * Public API: Get formatted name for display
   */
  getFormattedName(): string {
    if (this.nameData.fullName) {
      return this.nameData.fullName;
    }

    const parts = [
      this.nameData.givenName,
      this.nameData.middleName,
      this.nameData.familyName,
      this.nameData.suffix,
    ].filter(Boolean);

    return parts.join(' ');
  }
}
