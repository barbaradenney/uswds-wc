import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import USWDS web components
import '@uswds-wc/forms';

/**
 * Sex data interface
 */
export interface SexData {
  sex?: 'male' | 'female' | '';
}

/**
 * USA Sex Pattern
 *
 * USWDS pattern for collecting sex information with proper terminology and compliance.
 *
 * **CRITICAL Requirements (per USWDS):**
 * - Use "sex" terminology ONLY (NOT "gender")
 * - Only provide "Male" and "Female" options (NO other options)
 * - NO "Prefer not to answer" option (reconsider if question is needed at all)
 * - Explain why you're asking (modal or helper text)
 * - Use tested translations for multilingual forms
 *
 * **Pattern Responsibilities:**
 * - Collect sex information using radio buttons
 * - Provide clear explanation of data usage
 * - Emit sex data changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 *
 * @element usa-sex-pattern
 *
 * @fires {CustomEvent} sex-change - Fired when sex data changes
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @example Basic usage
 * ```html
 * <usa-sex-pattern
 *   label="Sex"
 *   required
 * ></usa-sex-pattern>
 * ```
 *
 * @example With helper text explaining why
 * ```html
 * <usa-sex-pattern
 *   label="Sex"
 *   hint="We ask for this information to ensure proper medical care"
 *   show-why-link
 *   why-url="/why-we-ask-for-sex"
 * ></usa-sex-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/create-a-user-profile/sex/
 */
@customElement('usa-sex-pattern')
export class USASexPattern extends LitElement {
  // Use Light DOM for patterns
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Label for the sex section
   */
  @property({ type: String })
  label = 'Sex';

  /**
   * Whether sex is required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Hint text explaining why this information is collected
   */
  @property({ type: String })
  hint = 'Please select your sex from the following options.';

  /**
   * Whether to show "Why do we ask for this?" link
   */
  @property({ type: Boolean, attribute: 'show-why-link' })
  showWhyLink = false;

  /**
   * URL for "Why do we ask for this?" link
   */
  @property({ type: String, attribute: 'why-url' })
  whyUrl = '';

  /**
   * Current sex data
   */
  @state()
  private sexData: SexData = {
    sex: '',
  };

  /**
   * Unique ID for this pattern instance (for ARIA connections)
   */
  private patternId: string;

  constructor() {
    super();
    this.patternId = `sex-${Math.random().toString(36).substring(2, 11)}`;
  }

  override connectedCallback() {
    super.connectedCallback();
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: { sexData: this.sexData },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle field changes
   */
  private handleFieldChange(value: string) {
    this.sexData = { sex: value as 'male' | 'female' | '' };

    this.dispatchEvent(
      new CustomEvent('sex-change', {
        detail: { sexData: this.sexData, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const hintText =
      this.showWhyLink && this.whyUrl
        ? html`${this.hint}
            <a href="${this.whyUrl}" class="usa-link">Why do we ask for sex information?</a>`
        : this.hint;

    return html`
      <fieldset class="usa-fieldset">
        <legend class="usa-legend usa-legend--large">${this.label}</legend>
        ${this.hint ? html`<p class="usa-hint" id="${this.patternId}-hint">${hintText}</p>` : ''}

        <!-- Male Radio Button -->
        <usa-radio
          id="${this.patternId}-male"
          name="sex"
          value="male"
          label="Male"
          ?required="${this.required}"
          @change="${(e: CustomEvent) => {
            if (e.detail?.checked || (e.target as any)?.checked) {
              this.handleFieldChange('male');
            }
          }}"
        ></usa-radio>

        <!-- Female Radio Button -->
        <usa-radio
          id="${this.patternId}-female"
          name="sex"
          value="female"
          label="Female"
          ?required="${this.required}"
          @change="${(e: CustomEvent) => {
            if (e.detail?.checked || (e.target as any)?.checked) {
              this.handleFieldChange('female');
            }
          }}"
        ></usa-radio>
      </fieldset>
    `;
  }

  /**
   * Public API: Get current sex data
   */
  getSexData(): SexData {
    return { ...this.sexData };
  }

  /**
   * Public API: Set sex data
   */
  setSexData(data: SexData) {
    this.sexData = { ...data };

    // Manually update radio buttons (Light DOM pattern)
    Promise.resolve().then(() => {
      const radios = this.querySelectorAll('usa-radio[name="sex"]');
      radios.forEach((radio: any) => {
        if (radio.value === data.sex) {
          radio.checked = true;
        } else {
          radio.checked = false;
        }
      });
    });
  }

  /**
   * Public API: Clear sex
   */
  clearSex() {
    this.sexData = { sex: '' };

    // Reset radio buttons by setting checked to false
    Promise.resolve().then(() => {
      const radios = this.querySelectorAll('usa-radio[name="sex"]');
      radios.forEach((radio: any) => {
        radio.checked = false;
      });
    });
  }

  /**
   * Public API: Validate sex
   */
  validateSex(): boolean {
    if (!this.required) return true;

    return !!this.sexData.sex;
  }

  /**
   * Public API: Get sex value
   */
  getSex(): string {
    return this.sexData.sex || '';
  }
}
