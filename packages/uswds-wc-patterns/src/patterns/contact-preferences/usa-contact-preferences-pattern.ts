import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import USWDS web components
import '@uswds-wc/forms';

/**
 * Contact preference data interface
 */
export interface ContactPreferencesData {
  preferredMethods?: string[]; // 'phone', 'text', 'email', 'mail'
  additionalInfo?: string;
}

/**
 * Contact preference method
 */
export interface ContactMethod {
  value: string;
  label: string;
  description?: string;
}

/**
 * USA Contact Preferences Pattern
 *
 * USWDS pattern for collecting user communication channel preferences.
 * Supports multiple contact methods with accessibility considerations.
 *
 * **Pattern Responsibilities:**
 * - Collect preferred communication channels
 * - Support multi-channel selection
 * - Allow special accommodation requests
 * - Provide clear expectations about contact
 * - Emit preference data changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 *
 * **Best Practices:**
 * - Only collect if you can honor the preference
 * - Make selection optional (not required)
 * - Explain contact timeline and conditions
 * - Consider household privacy implications
 * - Allow multiple method selection
 *
 * @element usa-contact-preferences-pattern
 *
 * @fires {CustomEvent} preferences-change - Fired when preferences change
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @example Basic usage
 * ```html
 * <usa-contact-preferences-pattern></usa-contact-preferences-pattern>
 * ```
 *
 * @example With custom methods and hint
 * ```html
 * <usa-contact-preferences-pattern
 *   show-additional-info
 *   label="How would you like us to contact you?"
 *   hint="We will contact you within 5 business days"
 * ></usa-contact-preferences-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/create-a-user-profile/contact-preferences/
 */
@customElement('usa-contact-preferences-pattern')
export class USAContactPreferencesPattern extends LitElement {
  // Use Light DOM for patterns
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Label for the contact preferences section
   */
  @property({ type: String })
  label = 'Contact preferences';

  /**
   * Hint text explaining contact expectations
   */
  @property({ type: String })
  hint = '';

  /**
   * Whether at least one method selection is required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Whether to show additional information textarea
   */
  @property({ type: Boolean, attribute: 'show-additional-info' })
  showAdditionalInfo = false;

  /**
   * Custom contact methods (if not provided, uses default)
   */
  @property({ type: Array })
  methods?: ContactMethod[];

  /**
   * Current preference data
   */
  @state()
  private preferencesData: ContactPreferencesData = {
    preferredMethods: [],
  };

  /**
   * Unique ID for this pattern instance (for ARIA connections)
   */
  private patternId: string;

  constructor() {
    super();
    this.patternId = `contact-prefs-${Math.random().toString(36).substring(2, 11)}`;
  }

  override connectedCallback() {
    super.connectedCallback();
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: { preferencesData: this.preferencesData },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Get default contact methods
   */
  private getDefaultMethods(): ContactMethod[] {
    return [
      {
        value: 'phone',
        label: 'Telephone call',
        description: 'We may leave voicemails',
      },
      {
        value: 'text',
        label: 'Text message',
        description: 'SMS to your mobile number',
      },
      {
        value: 'email',
        label: 'Email',
      },
      {
        value: 'mail',
        label: 'Postal mail',
      },
    ];
  }

  /**
   * Handle checkbox change
   */
  private handleMethodChange(value: string, checked: boolean) {
    const currentMethods = this.preferencesData.preferredMethods || [];

    const newMethods = checked
      ? [...currentMethods, value]
      : currentMethods.filter((m) => m !== value);

    this.preferencesData = {
      ...this.preferencesData,
      preferredMethods: newMethods,
    };

    this.dispatchEvent(
      new CustomEvent('preferences-change', {
        detail: {
          preferencesData: this.preferencesData,
          field: 'preferredMethods',
          value: newMethods,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle additional info change
   */
  private handleAdditionalInfoChange(value: string) {
    this.preferencesData = {
      ...this.preferencesData,
      additionalInfo: value,
    };

    this.dispatchEvent(
      new CustomEvent('preferences-change', {
        detail: {
          preferencesData: this.preferencesData,
          field: 'additionalInfo',
          value,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const methods = this.methods || this.getDefaultMethods();
    const hintId = `${this.patternId}-hint`;
    const optionalHintId = `${this.patternId}-optional`;

    // Build aria-describedby for fieldset
    const describedByIds: string[] = [];
    if (this.hint) {
      describedByIds.push(hintId);
    }
    describedByIds.push(optionalHintId);
    const fieldsetDescribedBy = describedByIds.join(' ');

    return html`
      <fieldset class="usa-fieldset" aria-describedby="${fieldsetDescribedBy}">
        <legend class="usa-legend usa-legend--large">${this.label}</legend>
        ${this.hint ? html` <span class="usa-hint" id="${hintId}"> ${this.hint} </span> ` : ''}

        <div class="usa-hint margin-top-1" id="${optionalHintId}">
          Select all that apply (optional)
        </div>

        ${methods.map(
          (method) => html`
            <usa-checkbox
              id="contact-${method.value}"
              name="contact-preferences"
              value="${method.value}"
              label="${method.label}"
              description="${method.description || ''}"
              @change="${(e: Event) => {
                const checkbox = e.target as any;
                this.handleMethodChange(method.value, checkbox.checked);
              }}"
            ></usa-checkbox>
          `
        )}
        ${this.showAdditionalInfo
          ? html`
              <div class="margin-top-3">
                <usa-textarea
                  id="additional-info"
                  name="additional-info"
                  label="Additional information"
                  hint="For example, accessibility needs, preferred language, best time to contact, etc. (optional)"
                  rows="3"
                  compact
                  @input="${(e: Event) => {
                    const textarea = e.target as any;
                    this.handleAdditionalInfoChange(textarea.value);
                  }}"
                ></usa-textarea>
              </div>
            `
          : ''}
      </fieldset>
    `;
  }

  /**
   * Public API: Get current preferences data
   */
  getPreferencesData(): ContactPreferencesData {
    return { ...this.preferencesData };
  }

  /**
   * Public API: Set preferences data
   */
  setPreferencesData(data: ContactPreferencesData) {
    this.preferencesData = { ...data };

    // Manually update child component values (Light DOM pattern)
    this.updateComplete.then(() => {
      // Update checkbox components using their public APIs
      const checkboxes = this.querySelectorAll('usa-checkbox');
      checkboxes.forEach((checkbox: any) => {
        if (checkbox.value) {
          checkbox.checked =
            this.preferencesData.preferredMethods?.includes(checkbox.value) || false;
        }
      });

      // Update textarea component using its public API
      const textareas = this.querySelectorAll('usa-textarea');
      textareas.forEach((textarea: any) => {
        textarea.value = this.preferencesData.additionalInfo || '';
      });
    });
  }

  /**
   * Public API: Clear preferences
   */
  clearPreferences() {
    this.preferencesData = { preferredMethods: [] };

    // Reset checkbox components using their public APIs
    const checkboxes = this.querySelectorAll('usa-checkbox');
    checkboxes.forEach((checkbox: any) => {
      if (checkbox.reset) {
        checkbox.reset();
      }
    });

    // Reset textarea components using their public APIs
    const textareas = this.querySelectorAll('usa-textarea');
    textareas.forEach((textarea: any) => {
      if (textarea.reset) {
        textarea.reset();
      }
    });
  }

  /**
   * Public API: Get selected method count
   */
  getSelectedMethodCount(): number {
    return this.preferencesData.preferredMethods?.length || 0;
  }

  /**
   * Public API: Check if specific method is selected
   */
  isMethodSelected(method: string): boolean {
    return this.preferencesData.preferredMethods?.includes(method) || false;
  }

  /**
   * Public API: Validate preferences
   */
  validatePreferences(): boolean {
    if (!this.required) return true;

    // If required, at least one preference must be selected
    return this.getSelectedMethodCount() > 0;
  }
}
