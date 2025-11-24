import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../../../../uswds-wc-forms/src/components/checkbox/index.js';
import '../../../../uswds-wc-forms/src/components/text-input/index.js';

/**
 * Race and Ethnicity Data Interface
 */
export interface RaceEthnicityData {
  race?: string[]; // Selected OMB race categories
  ethnicity?: string; // Self-identified ethnicity text
  preferNotToShare?: boolean; // Prefer not to share option
}

/**
 * USWDS Race and Ethnicity Pattern
 *
 * Implements the official USWDS pattern for collecting race and ethnicity information
 * according to OMB standards.
 *
 * **USWDS Documentation**: https://designsystem.digital.gov/patterns/create-a-user-profile/race-and-ethnicity/
 *
 * ## CRITICAL Requirements (per USWDS)
 * - **Use OMB race categories** - 5 standard categories (multi-select checkboxes)
 * - **Separate ethnicity question** - Open text input for self-identification
 * - **Two-part structure** - Race and ethnicity asked together but not combined
 * - **"Prefer not to share" option** - Allow users to decline
 * - **Explain why you're asking** - Privacy and transparency
 *
 * ## OMB Race Categories (Multi-Select)
 * - American Indian or Alaska Native
 * - Asian
 * - Black or African American
 * - Native Hawaiian or Other Pacific Islander
 * - White
 *
 * ## Pattern Responsibilities
 * - Collect race using OMB standard categories
 * - Collect ethnicity via self-identification
 * - Provide "Prefer not to share" option
 * - Emit race-ethnicity-change events
 * - Validate required fields if specified
 *
 * ## When to Use
 * Use this pattern when:
 * - **Required by law** for federal programs
 * - **Demographic data** for research or service delivery
 * - **Equal opportunity** monitoring
 * - **Healthcare** disparities research
 *
 * ## When NOT to Use
 * - When not required by law or regulation
 * - For marketing or profiling purposes
 * - Without clear explanation of data usage
 *
 * @element usa-race-ethnicity-pattern
 * @fires {CustomEvent<{raceEthnicityData: RaceEthnicityData}>} pattern-ready - Fired when pattern is initialized
 * @fires {CustomEvent<{value: string[] | string, raceEthnicityData: RaceEthnicityData}>} race-ethnicity-change - Fired when race or ethnicity changes
 */
@customElement('usa-race-ethnicity-pattern')
export class USARaceEthnicityPattern extends LitElement {
  /**
   * Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly
   */
  protected override createRenderRoot() {
    return this;
  }

  // ========================================
  // Properties
  // ========================================

  /**
   * Main label for the pattern (for consistency with other data patterns)
   * Defaults to the race section label
   */
  @property({ type: String })
  label = 'Race and Ethnicity';

  /**
   * Label for the race section
   */
  @property({ type: String })
  raceLabel = 'Which of the following race classifications best describe you?';

  /**
   * Label for the ethnicity section
   */
  @property({ type: String })
  ethnicityLabel = 'I identify my ethnicity as:';

  /**
   * Hint text for race section
   */
  @property({ type: String })
  raceHint = 'Select all that apply';

  /**
   * Hint text for ethnicity section
   */
  @property({ type: String })
  ethnicityHint = 'You may report more than one ethnicity. For example, "Hmong and Italian"';

  /**
   * Whether race/ethnicity is required
   */
  @property({ type: Boolean })
  required = false;

  /**
   * Show "Why do we ask for this?" link
   */
  @property({ type: Boolean, attribute: 'show-why-link' })
  showWhyLink = false;

  /**
   * URL for "Why do we ask for this?" link
   */
  @property({ type: String, attribute: 'why-url' })
  whyUrl = '';

  /**
   * Show "Prefer not to share" option
   */
  @property({ type: Boolean, attribute: 'show-prefer-not-to-share' })
  showPreferNotToShare = true;

  // ========================================
  // State
  // ========================================

  @state()
  private raceEthnicityData: RaceEthnicityData = {
    race: [],
    ethnicity: '',
    preferNotToShare: false,
  };

  // ========================================
  // Lifecycle
  // ========================================

  override firstUpdated() {
    // Emit pattern-ready event
    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: { raceEthnicityData: this.getRaceEthnicityData() },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ========================================
  // Event Handlers
  // ========================================

  /**
   * Handles race checkbox changes
   */
  private handleRaceChange(e: CustomEvent, raceValue: string) {
    const isChecked = e.detail?.checked || (e.target as any)?.checked;

    const updatedRace = isChecked
      ? [...(this.raceEthnicityData.race || []), raceValue]
      : (this.raceEthnicityData.race || []).filter((r) => r !== raceValue);

    this.raceEthnicityData = {
      ...this.raceEthnicityData,
      race: updatedRace,
    };

    this.emitChangeEvent();
  }

  /**
   * Handles ethnicity input changes
   */
  private handleEthnicityChange(e: Event) {
    const input = e.target as any;
    this.raceEthnicityData = {
      ...this.raceEthnicityData,
      ethnicity: input.value || '',
    };

    this.emitChangeEvent();
  }

  /**
   * Handles "Prefer not to share" checkbox change
   */
  private handlePreferNotToShareChange(e: CustomEvent) {
    const isChecked = e.detail?.checked || (e.target as any)?.checked;

    this.raceEthnicityData = {
      ...this.raceEthnicityData,
      preferNotToShare: isChecked,
    };

    // Clear race and ethnicity if prefer not to share
    if (isChecked) {
      this.clearRaceEthnicity();
      // Keep preferNotToShare as true
      this.raceEthnicityData.preferNotToShare = true;
    }

    this.emitChangeEvent();
  }

  /**
   * Emits race-ethnicity-change event
   */
  private emitChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('race-ethnicity-change', {
        detail: {
          value: this.raceEthnicityData,
          raceEthnicityData: this.getRaceEthnicityData(),
        },
        bubbles: true,
        composed: true,
      })
    );

    this.requestUpdate();
  }

  // ========================================
  // Public API
  // ========================================

  /**
   * Gets the current race and ethnicity data
   * @returns Copy of race and ethnicity data
   */
  getRaceEthnicityData(): RaceEthnicityData {
    return {
      race: [...(this.raceEthnicityData.race || [])],
      ethnicity: this.raceEthnicityData.ethnicity || '',
      preferNotToShare: this.raceEthnicityData.preferNotToShare || false,
    };
  }

  /**
   * Sets race and ethnicity data programmatically
   * @param data - Race and ethnicity data to set
   */
  setRaceEthnicityData(data: Partial<RaceEthnicityData>) {
    this.raceEthnicityData = {
      race: data.race || [],
      ethnicity: data.ethnicity || '',
      preferNotToShare: data.preferNotToShare || false,
    };

    // Update form fields after state update
    Promise.resolve().then(() => {
      this.updateFormFields();
    });
  }

  /**
   * Clears all race and ethnicity data
   */
  clearRaceEthnicity() {
    this.raceEthnicityData = {
      race: [],
      ethnicity: '',
      preferNotToShare: false,
    };

    Promise.resolve().then(() => {
      this.updateFormFields();
    });
  }

  /**
   * Validates race and ethnicity data
   * @returns true if valid, false otherwise
   */
  validateRaceEthnicity(): boolean {
    // If prefer not to share is selected, valid
    if (this.raceEthnicityData.preferNotToShare) {
      return true;
    }

    // If not required, always valid
    if (!this.required) {
      return true;
    }

    // If required, must have at least race or ethnicity
    const hasRace = (this.raceEthnicityData.race || []).length > 0;
    const hasEthnicity = (this.raceEthnicityData.ethnicity || '').trim().length > 0;

    return hasRace || hasEthnicity;
  }

  // ========================================
  // Private Methods
  // ========================================

  /**
   * Updates form fields from data
   */
  private updateFormFields() {
    // Update race checkboxes
    const raceCheckboxes = this.querySelectorAll('usa-checkbox[name="race"]');
    raceCheckboxes.forEach((checkbox: any) => {
      const value = checkbox.getAttribute('value');
      checkbox.checked = (this.raceEthnicityData.race || []).includes(value);
    });

    // Update ethnicity input
    const ethnicityInput = this.querySelector('usa-text-input[name="ethnicity"]') as any;
    if (ethnicityInput) {
      ethnicityInput.value = this.raceEthnicityData.ethnicity || '';
    }

    // Update prefer not to share checkbox
    const preferCheckbox = this.querySelector('usa-checkbox[name="prefer-not-to-share"]') as any;
    if (preferCheckbox) {
      preferCheckbox.checked = this.raceEthnicityData.preferNotToShare || false;
    }
  }

  // ========================================
  // Render
  // ========================================

  override render() {
    const hintId = 'race-ethnicity-hint';
    const raceHintId = 'race-hint';
    const ethnicityHintId = 'ethnicity-hint';

    const isPreferNotToShare = this.raceEthnicityData.preferNotToShare;

    return html`
      <div class="usa-form-group">
        ${this.showWhyLink && this.whyUrl
          ? html`
              <p class="usa-hint" id="${hintId}">
                <a href="${this.whyUrl}" class="usa-link">Why do we ask for this?</a>
              </p>
            `
          : ''}

        <!-- Race Section -->
        <fieldset class="usa-fieldset">
          <legend class="usa-legend usa-legend--large">${this.raceLabel}</legend>

          ${this.raceHint
            ? html` <p class="usa-hint" id="${raceHintId}">${this.raceHint}</p> `
            : ''}

          <usa-checkbox
            name="race"
            value="american-indian-alaska-native"
            label="American Indian or Alaska Native"
            ?disabled="${isPreferNotToShare}"
            @change="${(e: CustomEvent) =>
              this.handleRaceChange(e, 'american-indian-alaska-native')}"
          ></usa-checkbox>

          <usa-checkbox
            name="race"
            value="asian"
            label="Asian"
            ?disabled="${isPreferNotToShare}"
            @change="${(e: CustomEvent) => this.handleRaceChange(e, 'asian')}"
          ></usa-checkbox>

          <usa-checkbox
            name="race"
            value="black-african-american"
            label="Black or African American"
            ?disabled="${isPreferNotToShare}"
            @change="${(e: CustomEvent) => this.handleRaceChange(e, 'black-african-american')}"
          ></usa-checkbox>

          <usa-checkbox
            name="race"
            value="native-hawaiian-pacific-islander"
            label="Native Hawaiian or Other Pacific Islander"
            ?disabled="${isPreferNotToShare}"
            @change="${(e: CustomEvent) =>
              this.handleRaceChange(e, 'native-hawaiian-pacific-islander')}"
          ></usa-checkbox>

          <usa-checkbox
            name="race"
            value="white"
            label="White"
            ?disabled="${isPreferNotToShare}"
            @change="${(e: CustomEvent) => this.handleRaceChange(e, 'white')}"
          ></usa-checkbox>
        </fieldset>

        <!-- Ethnicity Section -->
        <fieldset class="usa-fieldset">
          <legend class="usa-legend usa-legend--large">${this.ethnicityLabel}</legend>

          ${this.ethnicityHint
            ? html` <p class="usa-hint" id="${ethnicityHintId}">${this.ethnicityHint}</p> `
            : ''}

          <usa-text-input
            name="ethnicity"
            type="text"
            class="usa-input--xl"
            aria-describedby="${ethnicityHintId}"
            ?disabled="${isPreferNotToShare}"
            @input="${this.handleEthnicityChange}"
          ></usa-text-input>
        </fieldset>

        <!-- Prefer Not to Share Option -->
        ${this.showPreferNotToShare
          ? html`
              <usa-checkbox
                name="prefer-not-to-share"
                label="Prefer not to share my race and ethnicity"
                @change="${this.handlePreferNotToShareChange}"
              ></usa-checkbox>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-race-ethnicity-pattern': USARaceEthnicityPattern;
  }
}
