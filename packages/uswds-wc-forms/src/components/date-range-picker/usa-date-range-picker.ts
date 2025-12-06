import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

// Import the date picker component
import '../date-picker/usa-date-picker.js';

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * ARCHITECTURE: Option B (Pure Global Init)
 * - USWDS is initialized globally via .on(document) in .storybook/preview-head.html
 * - This component ONLY renders HTML structure
 * - All behavior managed by USWDS event delegation
 * - Component properties synced to USWDS-created elements
 *
 * USA Date Range Picker Web Component
 *
 * Minimal wrapper around USWDS date range picker functionality.
 * All calendar behavior, date validation, and interactions are managed by USWDS JavaScript.
 *
 * @element usa-date-range-picker
 * @fires date-range-change - Dispatched when date range changes (via USWDS)
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-date-range-picker/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-date-range-picker/src/styles/_usa-date-range-picker.scss
 * @uswds-docs https://designsystem.digital.gov/components/date-range-picker/
 * @uswds-guidance https://designsystem.digital.gov/components/date-range-picker/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/date-range-picker/#accessibility
 */
@customElement('usa-date-range-picker')
export class USADateRangePicker extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  startDate = '';

  @property({ type: String })
  endDate = '';

  @property({ type: String })
  name = 'date-range-picker';

  @property({ type: String })
  startInputId = 'start-date-input';

  @property({ type: String })
  endInputId = 'end-date-input';

  @property({ type: String })
  label = 'Date range';

  @property({ type: String })
  startLabel = 'Start date';

  @property({ type: String })
  endLabel = 'End date';

  @property({ type: String })
  hint = '';

  @property({ type: String })
  placeholder = 'mm/dd/yyyy';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  required = false;

  @property({ type: String })
  minDate = '';

  @property({ type: String, attribute: 'max-date' })
  maxDate = '';

  @property({ type: String })
  error = '';

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // USWDS sets default min date to "0000-01-01" if not provided
    if (!this.minDate) {
      this.minDate = '0000-01-01';
    }
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);

    // Note: Date range picker coordination is handled by this component.
    // Child usa-date-picker components handle their own calendar behavior.
    // No dynamic imports needed - works in all environments (bundled, CDN, SSR).
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Validate date range whenever properties change
    if (
      changedProperties.has('startDate') ||
      changedProperties.has('endDate') ||
      changedProperties.has('minDate') ||
      changedProperties.has('maxDate')
    ) {
      this.validateDateRange();
    }
  }

  private validateDateRange() {
    // Enforce min/max constraints on start date
    if (this.startDate && this.minDate) {
      const start = new Date(this.startDate);
      const min = new Date(this.minDate);
      if (start < min) {
        this.startDate = '';
      }
    }

    if (this.startDate && this.maxDate) {
      const start = new Date(this.startDate);
      const max = new Date(this.maxDate);
      if (start > max) {
        this.startDate = '';
      }
    }

    // Enforce min/max constraints on end date
    if (this.endDate && this.minDate) {
      const end = new Date(this.endDate);
      const min = new Date(this.minDate);
      if (end < min) {
        this.endDate = '';
      }
    }

    if (this.endDate && this.maxDate) {
      const end = new Date(this.endDate);
      const max = new Date(this.maxDate);
      if (end > max) {
        this.endDate = '';
      }
    }

    // Enforce start date <= end date
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      if (end < start) {
        this.endDate = '';
      }
    }
  }

  // USWDS-style date range picker methods
  // Based on: https://github.com/uswds/uswds/blob/develop/packages/usa-date-range-picker/src/index.js

  private handleStartDateChange(e: CustomEvent) {
    const newValue = e.detail.value;

    // Validate against min/max constraints
    if (newValue && this.minDate) {
      const newDate = new Date(newValue);
      const min = new Date(this.minDate);
      if (newDate < min) {
        // Don't update if before min date
        return;
      }
    }

    if (newValue && this.maxDate) {
      const newDate = new Date(newValue);
      const max = new Date(this.maxDate);
      if (newDate > max) {
        // Don't update if after max date
        return;
      }
    }

    const newStartDate = new Date(newValue);
    this.startDate = newValue;

    // If end date is before start date, clear it (USWDS pattern)
    if (this.endDate && newStartDate && newStartDate > new Date(this.endDate)) {
      this.endDate = '';
    }

    this.dispatchRangeChangeEvent();
  }

  private handleEndDateChange(e: CustomEvent) {
    const newValue = e.detail.value;
    const newEndDate = new Date(newValue);

    // Validate that end date is not before start date (USWDS pattern)
    if (this.startDate && newEndDate && newEndDate < new Date(this.startDate)) {
      // Don't update if invalid range - clear the invalid end date
      this.endDate = '';
      return;
    }

    // Validate against min/max constraints
    if (newValue && this.minDate) {
      const min = new Date(this.minDate);
      if (newEndDate < min) {
        this.endDate = '';
        return;
      }
    }

    if (newValue && this.maxDate) {
      const max = new Date(this.maxDate);
      if (newEndDate > max) {
        this.endDate = '';
        return;
      }
    }

    this.endDate = newValue;
    this.dispatchRangeChangeEvent();
  }

  private dispatchRangeChangeEvent() {
    const range: DateRange = {
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.dispatchEvent(
      new CustomEvent('date-range-change', {
        detail: {
          range: range,
          startDate: this.startDate,
          endDate: this.endDate,
          isComplete: !!(this.startDate && this.endDate),
          daysDifference: this.calculateDaysDifference(),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private calculateDaysDifference(): number | null {
    if (!this.startDate || !this.endDate) return null;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    // Check for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const timeDiff = end.getTime() - start.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Same day should return 1 day, not 0
    return diffDays === 0 ? 1 : diffDays;
  }

  private renderError() {
    return this.error
      ? html`
          <div class="usa-error-message" id="${this.name}-error" role="alert">
            <span class="usa-sr-only">Error:</span> ${this.error}
          </div>
        `
      : '';
  }

  private renderRequiredIndicator() {
    return this.required
      ? html`<abbr title="required" class="usa-hint usa-hint--required">*</abbr>`
      : '';
  }

  private renderHint() {
    return this.hint ? html`<div class="usa-hint" id="${this.name}-hint">${this.hint}</div>` : '';
  }

  private renderRangeSummary() {
    if (!this.startDate || !this.endDate) {
      return '';
    }

    const daysDiff = this.calculateDaysDifference();
    const dayText = daysDiff === 1 ? 'day' : 'days';
    const daysDisplay = daysDiff ? ` (${daysDiff} ${dayText})` : '';

    return html`
      <div
        class="usa-alert usa-alert--info usa-alert--slim margin-top-2 usa-date-range-picker__summary"
      >
        <div class="usa-alert__body">
          <p class="usa-alert__text">
            Selected range: ${this.startDate} to ${this.endDate}${daysDisplay}
          </p>
        </div>
      </div>
    `;
  }

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override render() {
    const groupClasses = [
      'usa-form-group',
      'usa-date-range-picker',
      this.error ? 'usa-form-group--error' : '',
      this.required ? 'usa-form-group--required' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <fieldset class="${groupClasses}" aria-label="${this.label || 'Date range picker'}">
        ${this.renderError()}
        <legend class="usa-legend">${this.label} ${this.renderRequiredIndicator()}</legend>
        ${this.renderHint()}

        <div class="grid-row grid-gap">
          <!-- Start date picker -->
          <usa-date-picker
            class="grid-col"
            data-range-start="true"
            name="${this.name}-start"
            inputId="${this.startInputId}"
            label="${this.startLabel}"
            value="${this.startDate}"
            placeholder="${this.placeholder}"
            error="${this.error}"
            ?disabled=${this.disabled}
            ?required=${this.required}
            minDate="${this.minDate}"
            maxDate="${this.endDate || this.maxDate}"
            @date-change="${this.handleStartDateChange}"
          ></usa-date-picker>

          <!-- End date picker -->
          <usa-date-picker
            class="grid-col"
            data-range-end="true"
            name="${this.name}-end"
            inputId="${this.endInputId}"
            label="${this.endLabel}"
            value="${this.endDate}"
            placeholder="${this.placeholder}"
            error="${this.error}"
            ?disabled=${this.disabled}
            ?required=${this.required}
            minDate="${this.startDate || this.minDate}"
            maxDate="${this.maxDate}"
            @date-change="${this.handleEndDateChange}"
          ></usa-date-picker>

          <!-- Display range summary -->
          ${this.renderRangeSummary()}
        </div>
      </fieldset>
    `;
  }
}
