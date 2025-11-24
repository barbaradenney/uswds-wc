import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import USWDS web components
import '@uswds-wc/forms';

/**
 * SSN data interface
 */
export interface SSNData {
  ssn?: string;
}

/**
 * USA SSN Pattern
 *
 * USWDS pattern for collecting Social Security Number with proper formatting and validation.
 *
 * **CRITICAL Requirements (per USWDS):**
 * - Use SINGLE text field (NOT three separate fields)
 * - Input type: text with inputmode="numeric"
 * - Accept hyphens and spaces (fault tolerance)
 * - NO placeholder text
 * - Only collect when absolutely necessary
 * - Explain why you're asking (privacy/security)
 *
 * **Pattern Responsibilities:**
 * - Collect SSN using single input field
 * - Validate SSN format (with/without hyphens)
 * - Provide clear format example
 * - Emit SSN data changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 *
 * @element usa-ssn-pattern
 *
 * @fires {CustomEvent} ssn-change - Fired when SSN data changes
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @example Basic usage
 * ```html
 * <usa-ssn-pattern
 *   label="Social Security number"
 *   required
 * ></usa-ssn-pattern>
 * ```
 *
 * @example With helper text
 * ```html
 * <usa-ssn-pattern
 *   label="Social Security number"
 *   hint="For example, 555 11 0000"
 *   show-why-link
 *   why-url="/privacy-policy"
 * ></usa-ssn-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/create-a-user-profile/social-security-number/
 */
@customElement('usa-ssn-pattern')
export class USASSNPattern extends LitElement {
  // Use Light DOM for patterns
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Label for the SSN section
   */
  @property({ type: String })
  label = 'Social Security number';

  /**
   * Whether SSN is required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Hint text explaining format and why this information is collected
   */
  @property({ type: String })
  hint = 'For example, 555 11 0000';

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
   * Current SSN data
   */
  @state()
  private ssnData: SSNData = {
    ssn: '',
  };

  /**
   * Unique ID for this pattern instance (for ARIA connections)
   */
  private patternId: string;

  constructor() {
    super();
    this.patternId = `ssn-${Math.random().toString(36).substring(2, 11)}`;
  }

  override connectedCallback() {
    super.connectedCallback();
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: { ssnData: this.ssnData },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Normalize SSN by removing spaces and hyphens
   */
  private normalizeSSN(ssn: string): string {
    return ssn.replace(/[\s-]/g, '');
  }

  /**
   * Format SSN with hyphens (XXX-XX-XXXX)
   */
  private formatSSN(ssn: string): string {
    const normalized = this.normalizeSSN(ssn);
    if (normalized.length === 0) return '';
    if (normalized.length <= 3) return normalized;
    if (normalized.length <= 5) return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 5)}-${normalized.slice(5, 9)}`;
  }

  /**
   * Validate SSN format
   */
  private isValidSSN(ssn: string): boolean {
    const normalized = this.normalizeSSN(ssn);

    // Must be exactly 9 digits
    if (!/^\d{9}$/.test(normalized)) return false;

    // SSA validation rules
    const area = parseInt(normalized.substring(0, 3), 10);
    const group = parseInt(normalized.substring(3, 5), 10);
    const serial = parseInt(normalized.substring(5, 9), 10);

    // Invalid SSN patterns per SSA
    if (area === 0) return false; // Area cannot be 000
    if (area === 666) return false; // 666 is not valid
    if (area >= 900) return false; // 900-999 reserved for TINs
    if (group === 0) return false; // Group cannot be 00
    if (serial === 0) return false; // Serial cannot be 0000

    return true;
  }

  /**
   * Handle field changes
   */
  private handleFieldChange(value: string) {
    this.ssnData = { ssn: value };

    this.dispatchEvent(
      new CustomEvent('ssn-change', {
        detail: { ssnData: this.ssnData, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const hintText =
      this.showWhyLink && this.whyUrl
        ? html`${this.hint} <a href="${this.whyUrl}" class="usa-link">Why do we ask for this?</a>`
        : this.hint;

    return html`
      <fieldset class="usa-fieldset">
        <legend class="usa-legend usa-legend--large">${this.label}</legend>
        ${this.hint ? html`<p class="usa-hint" id="${this.patternId}-hint">${hintText}</p>` : ''}

        <usa-text-input
          id="${this.patternId}-input"
          name="social-security-no"
          type="text"
          inputmode="numeric"
          class="usa-input--xl"
          ?required="${this.required}"
          aria-describedby="${this.hint ? `${this.patternId}-hint` : ''}"
          autocomplete="off"
          maxlength="11"
          @input="${(e: Event) => {
            const input = e.target as any;
            const value = input.value || '';
            this.handleFieldChange(value);
          }}"
        ></usa-text-input>
      </fieldset>
    `;
  }

  /**
   * Public API: Get current SSN data
   */
  getSSNData(): SSNData {
    return { ...this.ssnData };
  }

  /**
   * Public API: Set SSN data
   */
  setSSNData(data: SSNData) {
    this.ssnData = { ...data };

    // Manually update input (Light DOM pattern)
    Promise.resolve().then(() => {
      const input = this.querySelector('usa-text-input') as any;
      if (input) {
        input.value = data.ssn || '';
      }
    });
  }

  /**
   * Public API: Clear SSN
   */
  clearSSN() {
    this.ssnData = { ssn: '' };

    // Clear input
    Promise.resolve().then(() => {
      const input = this.querySelector('usa-text-input') as any;
      if (input) {
        if (input.reset) {
          input.reset();
        } else {
          input.value = '';
        }
      }
    });
  }

  /**
   * Public API: Validate SSN
   */
  validateSSN(): boolean {
    if (!this.required && !this.ssnData.ssn) return true;
    if (this.required && !this.ssnData.ssn) return false;

    return this.isValidSSN(this.ssnData.ssn || '');
  }

  /**
   * Public API: Get SSN value
   */
  getSSN(): string {
    return this.ssnData.ssn || '';
  }

  /**
   * Public API: Get normalized SSN (without hyphens/spaces)
   */
  getNormalizedSSN(): string {
    return this.normalizeSSN(this.ssnData.ssn || '');
  }

  /**
   * Public API: Get formatted SSN (with hyphens: XXX-XX-XXXX)
   */
  getFormattedSSN(): string {
    return this.formatSSN(this.ssnData.ssn || '');
  }
}
