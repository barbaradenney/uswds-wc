import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import USWDS web components
import '@uswds-wc/forms';

/**
 * Date of birth data interface
 */
export interface DateOfBirthData {
  month?: string; // "01" through "12"
  day?: string; // "01" through "31"
  year?: string; // "YYYY" (4 digits)
}

/**
 * USA Date of Birth Pattern
 *
 * USWDS pattern for collecting date of birth with proper validation.
 *
 * **Pattern Responsibilities:**
 * - Collect date of birth with three separate fields (month, day, year)
 * - Validate date format and ranges
 * - Support leap years
 * - NO auto-advance focus (critical accessibility requirement)
 * - Emit date data changes
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 *
 * **CRITICAL Accessibility Requirements:**
 * - NO JavaScript auto-advance focus between fields
 * - Use type="text" with inputmode="numeric" (NOT type="number")
 * - Always include visible labels
 * - Avoid auto-submission
 * - Group fields in fieldset with legend
 *
 * @element usa-date-of-birth-pattern
 *
 * @fires {CustomEvent} dob-change - Fired when date data changes
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @example Basic usage
 * ```html
 * <usa-date-of-birth-pattern
 *   label="Date of birth"
 *   required
 * ></usa-date-of-birth-pattern>
 * ```
 *
 * @example With hint
 * ```html
 * <usa-date-of-birth-pattern
 *   hint="For example: January 19 2000"
 *   required
 * ></usa-date-of-birth-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/create-a-user-profile/date-of-birth/
 */
@customElement('usa-date-of-birth-pattern')
export class USADateOfBirthPattern extends LitElement {
  // Use Light DOM for patterns
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Label for the date of birth section
   */
  @property({ type: String })
  label = 'Date of birth';

  /**
   * Whether date of birth is required
   */
  @property({ type: Boolean })
  required = true;

  /**
   * Hint text for date field
   */
  @property({ type: String })
  hint = 'For example: January 19 2000';

  /**
   * Current date of birth data
   */
  @state()
  private dobData: DateOfBirthData = {};

  /**
   * Unique ID for this pattern instance (for ARIA connections)
   */
  private patternId: string;

  /**
   * Month options for select dropdown
   */
  private readonly monthOptions = [
    { value: '01', text: '01 - January' },
    { value: '02', text: '02 - February' },
    { value: '03', text: '03 - March' },
    { value: '04', text: '04 - April' },
    { value: '05', text: '05 - May' },
    { value: '06', text: '06 - June' },
    { value: '07', text: '07 - July' },
    { value: '08', text: '08 - August' },
    { value: '09', text: '09 - September' },
    { value: '10', text: '10 - October' },
    { value: '11', text: '11 - November' },
    { value: '12', text: '12 - December' },
  ];

  constructor() {
    super();
    this.patternId = `dob-${Math.random().toString(36).substring(2, 11)}`;
  }

  override connectedCallback() {
    super.connectedCallback();
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: { dobData: this.dobData },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle field changes
   */
  private handleFieldChange(field: keyof DateOfBirthData, value: string) {
    this.dobData = { ...this.dobData, [field]: value };

    this.dispatchEvent(
      new CustomEvent('dob-change', {
        detail: { dobData: this.dobData, field, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Validate date of birth
   * Checks:
   * - Month is 01-12
   * - Day is 01-31 (validated based on month/year)
   * - Year is 4 digits
   * - Date is valid (no February 30, considers leap years)
   */
  private isValidDate(month: string, day: string, year: string): boolean {
    // Check all parts exist
    if (!month || !day || !year) return false;

    // Validate month (01-12)
    const monthNum = parseInt(month, 10);
    if (monthNum < 1 || monthNum > 12) return false;

    // Validate year (4 digits)
    if (!/^\d{4}$/.test(year)) return false;
    const yearNum = parseInt(year, 10);

    // Validate day (01-31 based on month)
    const dayNum = parseInt(day, 10);
    if (dayNum < 1 || dayNum > 31) return false;

    // Check days in month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Check for leap year
    const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0;
    if (isLeapYear) {
      daysInMonth[1] = 29; // February has 29 days in leap year
    }

    // Validate day against month
    if (dayNum > daysInMonth[monthNum - 1]) return false;

    return true;
  }

  override render() {
    return html`
      <fieldset class="usa-fieldset">
        <legend class="usa-legend usa-legend--large">${this.label}</legend>
        ${this.hint ? html`<p class="usa-hint" id="${this.patternId}-hint">${this.hint}</p>` : ''}

        <div class="usa-memorable-date">
          <!-- Month Select -->
          <div class="usa-form-group usa-form-group--month usa-form-group--select">
            <usa-select
              id="${this.patternId}-month"
              name="date_of_birth_month"
              label="Month"
              defaultOption="- Select -"
              .options="${this.monthOptions}"
              ?required="${this.required}"
              compact
              no-combo-box
              @change="${(e: Event) => {
                const select = e.target as HTMLSelectElement;
                this.handleFieldChange('month', select.value);
              }}"
            ></usa-select>
          </div>

          <!-- Day Input -->
          <div class="usa-form-group usa-form-group--day">
            <usa-text-input
              id="${this.patternId}-day"
              name="date_of_birth_day"
              label="Day"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="2"
              ?required="${this.required}"
              compact
              @input="${(e: Event) =>
                this.handleFieldChange('day', (e.target as HTMLInputElement).value)}"
            ></usa-text-input>
          </div>

          <!-- Year Input -->
          <div class="usa-form-group usa-form-group--year">
            <usa-text-input
              id="${this.patternId}-year"
              name="date_of_birth_year"
              label="Year"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              minlength="4"
              maxlength="4"
              ?required="${this.required}"
              compact
              @input="${(e: Event) =>
                this.handleFieldChange('year', (e.target as HTMLInputElement).value)}"
            ></usa-text-input>
          </div>
        </div>
      </fieldset>
    `;
  }

  /**
   * Public API: Get current date of birth data
   */
  getDateOfBirthData(): DateOfBirthData {
    return { ...this.dobData };
  }

  /**
   * Public API: Set date of birth data
   */
  setDateOfBirthData(data: DateOfBirthData) {
    this.dobData = { ...data };

    // Manually update child component values (Light DOM pattern)
    Promise.resolve().then(() => {
      const monthSelect = this.querySelector('usa-select[name="date_of_birth_month"]') as any;
      if (monthSelect) monthSelect.value = data.month || '';

      const dayInput = this.querySelector('usa-text-input[name="date_of_birth_day"]') as any;
      if (dayInput) dayInput.value = data.day || '';

      const yearInput = this.querySelector('usa-text-input[name="date_of_birth_year"]') as any;
      if (yearInput) yearInput.value = data.year || '';
    });
  }

  /**
   * Public API: Clear date of birth
   */
  clearDateOfBirth() {
    this.dobData = {};

    // Reset form components using their public APIs
    const monthSelect = this.querySelector('usa-select[name="date_of_birth_month"]') as any;
    if (monthSelect?.reset) {
      monthSelect.reset();
    }

    const textInputs = this.querySelectorAll('usa-text-input');
    textInputs.forEach((input: any) => {
      if (input.reset) {
        input.reset();
      }
    });
  }

  /**
   * Public API: Validate date of birth
   */
  validateDateOfBirth(): boolean {
    if (!this.required) return true;

    const { month = '', day = '', year = '' } = this.dobData;
    return this.isValidDate(month, day, year);
  }

  /**
   * Public API: Get month value
   */
  getMonth(): string {
    return this.dobData.month || '';
  }

  /**
   * Public API: Get day value
   */
  getDay(): string {
    return this.dobData.day || '';
  }

  /**
   * Public API: Get year value
   */
  getYear(): string {
    return this.dobData.year || '';
  }

  /**
   * Public API: Get formatted date string (MM/DD/YYYY)
   */
  getFormattedDate(): string {
    const { month, day, year } = this.dobData;
    if (!month || !day || !year) return '';
    return `${month}/${day}/${year}`;
  }

  /**
   * Public API: Get ISO date string (YYYY-MM-DD)
   */
  getISODate(): string {
    const { month, day, year } = this.dobData;
    if (!month || !day || !year) return '';
    return `${year}-${month}-${day}`;
  }
}
