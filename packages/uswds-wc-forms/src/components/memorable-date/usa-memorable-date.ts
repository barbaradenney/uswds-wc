import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS

export interface MemorableDateValue {
  month: string;
  day: string;
  year: string;
}

/**
 * USA Memorable Date Web Component
 *
 * A simple, accessible USWDS memorable date implementation as a custom element.
 * Three-field date input (month/day/year) for better accessibility and usability.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-memorable-date
 * @fires date-change - Dispatched when date value changes
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-memorable-date/src/styles/_usa-memorable-date.scss
 * @uswds-docs https://designsystem.digital.gov/components/memorable-date/
 * @uswds-guidance https://designsystem.digital.gov/components/memorable-date/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/memorable-date/#accessibility
 */
@customElement('usa-memorable-date')
export class USAMemorableDate extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  month = '';

  @property({ type: String })
  day = '';

  @property({ type: String })
  year = '';

  @property({ type: String })
  name = 'memorable-date';

  @property({ type: String })
  label = 'Date';

  @property({ type: String })
  hint = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  private dispatchDateChange() {
    const dateValue: MemorableDateValue = {
      month: this.month,
      day: this.day,
      year: this.year,
    };

    // Create ISO date string if all fields are complete and valid
    let isoDate = '';
    let isValid = false;

    if (this.month && this.day && this.year && this.year.length === 4) {
      const monthNum = parseInt(this.month);
      const dayNum = parseInt(this.day);
      const yearNum = parseInt(this.year);

      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31 && yearNum >= 1900) {
        isoDate = `${this.year.padStart(4, '0')}-${this.month.padStart(2, '0')}-${this.day.padStart(2, '0')}`;
        // Create date using UTC to avoid timezone issues
        const date = new Date(yearNum, monthNum - 1, dayNum);
        isValid =
          date.getFullYear() === yearNum &&
          date.getMonth() + 1 === monthNum &&
          date.getDate() === dayNum;
      }
    }

    this.dispatchEvent(
      new CustomEvent('date-change', {
        detail: {
          value: dateValue,
          month: this.month,
          day: this.day,
          year: this.year,
          isoDate: isValid ? isoDate : '',
          isValid: isValid,
          isComplete: !!(this.month && this.day && this.year && this.year.length === 4),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getFormattedMonth(): string {
    if (!this.month) return '';
    const monthNum = parseInt(this.month);
    if (monthNum >= 1 && monthNum <= 12) {
      return monthNum.toString().padStart(2, '0');
    }
    return '';
  }

  private get monthOptions() {
    return [
      { value: '', label: '- Select -' },
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' },
    ];
  }

  private uswdsInitialized = false;

  // Store bound event handlers for proper cleanup
  private boundHandleMonthChange: ((event: Event) => void) | null = null;
  private boundHandleDayInput: ((event: Event) => void) | null = null;
  private boundHandleYearInput: ((event: Event) => void) | null = null;

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    this.initializeUSWDSMemorableDate();
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const monthSelect = this.querySelector(`#${this.name}-month`) as HTMLSelectElement;
    const dayInput = this.querySelector(`#${this.name}-day`) as HTMLInputElement;
    const yearInput = this.querySelector(`#${this.name}-year`) as HTMLInputElement;

    // Create bound handlers for proper cleanup
    this.boundHandleMonthChange = this.handleMonthChange.bind(this);
    this.boundHandleDayInput = this.handleDayInput.bind(this);
    this.boundHandleYearInput = this.handleYearInput.bind(this);

    if (monthSelect) {
      monthSelect.addEventListener('change', this.boundHandleMonthChange);
    }

    if (dayInput) {
      dayInput.addEventListener('input', this.boundHandleDayInput);
    }

    if (yearInput) {
      yearInput.addEventListener('input', this.boundHandleYearInput);
    }
  }

  private handleMonthChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.month = target.value;
    this.dispatchDateChange();
  }

  private handleDayInput(event: Event) {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    // Limit to 2 digits and validate range
    if (value.length > 2) {
      value = value.slice(0, 2);
      target.value = value;
    }

    const dayNum = parseInt(value);
    if (dayNum > 31) {
      value = '31';
      target.value = value;
    } else if (dayNum < 1 && value !== '') {
      value = '1';
      target.value = value;
    }

    this.day = value;
    this.dispatchDateChange();
  }

  private handleYearInput(event: Event) {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    // Limit to 4 digits
    if (value.length > 4) {
      value = value.slice(0, 4);
      target.value = value;
    }

    this.year = value;
    this.dispatchDateChange();
  }

  private async initializeUSWDSMemorableDate() {
    if (this.uswdsInitialized) return;

    try {
      // Note: USWDS memorable date is primarily a presentational component
      // However, it can benefit from USWDS form validation and accessibility enhancements
      await this.updateComplete;

      // Wait for DOM to be fully rendered
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Memorable Date is a CSS-only component (no USWDS JavaScript required)
      // This component provides HTML structure and lets USWDS CSS handle the styling
    } catch {
      // USWDS integration failed, using standalone implementation
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupEventListeners();
    this.cleanupUSWDS();
  }

  private cleanupEventListeners() {
    const monthSelect = this.querySelector(`#${this.name}-month`) as HTMLSelectElement;
    const dayInput = this.querySelector(`#${this.name}-day`) as HTMLInputElement;
    const yearInput = this.querySelector(`#${this.name}-year`) as HTMLInputElement;

    if (monthSelect && this.boundHandleMonthChange) {
      monthSelect.removeEventListener('change', this.boundHandleMonthChange);
    }

    if (dayInput && this.boundHandleDayInput) {
      dayInput.removeEventListener('input', this.boundHandleDayInput);
    }

    if (yearInput && this.boundHandleYearInput) {
      yearInput.removeEventListener('input', this.boundHandleYearInput);
    }

    // Clear the bound handlers
    this.boundHandleMonthChange = null;
    this.boundHandleDayInput = null;
    this.boundHandleYearInput = null;
  }

  private cleanupUSWDS() {
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS['memorable-date'] && typeof USWDS['memorable-date'].off === 'function') {
          USWDS['memorable-date'].off(this);
        }
      }
    } catch {
      // Cleanup failed silently
    }
    this.uswdsInitialized = false;
  }

  private renderRequiredIndicator() {
    return this.required
      ? html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`
      : '';
  }

  private renderHint() {
    return this.hint ? html`<div class="usa-hint" id="${this.name}-hint">${this.hint}</div>` : '';
  }

  private renderMonthOption(option: { value: string; label: string }) {
    return html`
      <option value="${option.value}" ?selected=${this.getFormattedMonth() === option.value}>
        ${option.label}
      </option>
    `;
  }

  private renderMonthOptions() {
    return this.monthOptions.map((option) => this.renderMonthOption(option));
  }

  override render() {
    const fieldsetClasses = [
      'usa-fieldset',
      'usa-form-group',
      this.required ? 'usa-form-group--required' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const ariaDescribedBy = this.hint ? `${this.name}-hint` : '';

    return html`
      <fieldset class="${fieldsetClasses}">
        <legend class="usa-legend">${this.label} ${this.renderRequiredIndicator()}</legend>
        ${this.renderHint()}

        <div class="usa-memorable-date">
          <div class="usa-form-group usa-form-group--month">
            <label class="usa-label" for="${this.name}-month">Month</label>
            <select
              class="usa-select"
              id="${this.name}-month"
              name="${this.name}-month"
              .value="${this.getFormattedMonth()}"
              ?disabled=${this.disabled}
              ?required=${this.required}
              aria-describedby="${ariaDescribedBy}"
            >
              ${this.renderMonthOptions()}
            </select>
          </div>

          <div class="usa-form-group usa-form-group--day">
            <label class="usa-label" for="${this.name}-day">Day</label>
            <input
              class="usa-input"
              id="${this.name}-day"
              name="${this.name}-day"
              type="number"
              min="1"
              max="31"
              maxlength="2"
              pattern="[0-9]*"
              inputmode="numeric"
              .value="${this.day}"
              ?disabled=${this.disabled}
              ?required=${this.required}
              aria-describedby="${ariaDescribedBy}"
            />
          </div>

          <div class="usa-form-group usa-form-group--year">
            <label class="usa-label" for="${this.name}-year">Year</label>
            <input
              class="usa-input"
              id="${this.name}-year"
              name="${this.name}-year"
              type="number"
              min="1900"
              max="9999"
              maxlength="4"
              pattern="[0-9]*"
              inputmode="numeric"
              .value="${this.year}"
              ?disabled=${this.disabled}
              ?required=${this.required}
              aria-describedby="${ariaDescribedBy}"
            />
          </div>
        </div>
      </fieldset>
    `;
  }

  // Public API methods
  setValue(month: string, day: string, year: string) {
    this.month = month;
    this.day = day;
    this.year = year;
    this.dispatchDateChange();
  }

  setFromISODate(isoDate: string) {
    // Parse ISO date string directly to avoid timezone issues
    const parts = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (parts) {
      const [, year, month, day] = parts;
      this.month = month;
      this.day = day;
      this.year = year;
      this.dispatchDateChange();
    }
  }

  clear() {
    this.month = '';
    this.day = '';
    this.year = '';
    this.dispatchDateChange();
  }

  getDateValue(): MemorableDateValue {
    return {
      month: this.month,
      day: this.day,
      year: this.year,
    };
  }

  checkValidity(): boolean {
    // Get all the input elements
    const monthSelect = this.querySelector(`#${this.name}-month`) as HTMLSelectElement;
    const dayInput = this.querySelector(`#${this.name}-day`) as HTMLInputElement;
    const yearInput = this.querySelector(`#${this.name}-year`) as HTMLInputElement;

    // Check if all inputs are valid
    const monthValid = monthSelect ? monthSelect.checkValidity() : true;
    const dayValid = dayInput ? dayInput.checkValidity() : true;
    const yearValid = yearInput ? yearInput.checkValidity() : true;

    return monthValid && dayValid && yearValid;
  }
}
