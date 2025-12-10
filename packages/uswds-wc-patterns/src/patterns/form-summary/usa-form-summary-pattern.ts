import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles

// Import button component
import '@uswds-wc/actions/components/button/index.js';

/**
 * Summary item interface
 */
export interface SummaryItem {
  /**
   * Label for the field
   */
  label: string;
  /**
   * Value of the field
   */
  value: string;
  /**
   * Optional edit callback
   */
  onEdit?: () => void;
}

/**
 * Summary section interface
 */
export interface SummarySection {
  /**
   * Section heading
   */
  heading: string;
  /**
   * Items in the section
   */
  items: SummaryItem[];
}

/**
 * USA Form Summary Pattern
 *
 * USWDS pattern for "Keep a Record" - helps users review and retain submitted information.
 * Provides summary display, print functionality, and confirmation messaging.
 *
 * **Pattern Responsibilities:**
 * - Display submitted form data in organized sections
 * - Provide print/download capability
 * - Allow editing of reviewed information
 * - Show confirmation messaging
 * - Emit events for integration
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly.
 * Patterns orchestrate workflows without encapsulation.
 *
 * **Simplicity Philosophy:**
 * This pattern is intentionally simple - it only manages summary display and actions.
 * Developers provide their own data structure and handle edit/print actions.
 *
 * @element usa-form-summary-pattern
 *
 * @fires {CustomEvent} edit-field - Fired when user clicks edit on a field
 * @fires {CustomEvent} print-summary - Fired when user clicks print
 * @fires {CustomEvent} download-summary - Fired when user clicks download
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes
 *
 * @slot header - Optional header content above summary
 * @slot footer - Optional footer content below summary
 * @slot confirmation - Optional confirmation message slot
 *
 * @example Basic usage
 * ```html
 * <usa-form-summary-pattern
 *   .sections=${sections}
 *   show-print
 *   confirmation-title="Application Submitted"
 * >
 *   <div slot="confirmation">
 *     <p>Your application has been successfully submitted.</p>
 *   </div>
 * </usa-form-summary-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/complete-a-complex-form/keep-a-record/
 * @see docs/PATTERNS_GUIDE.md - Pattern development guidelines
 */
@customElement('usa-form-summary-pattern')
export class USAFormSummaryPattern extends LitElement {
  // Use Light DOM for patterns - no Shadow DOM encapsulation
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Summary sections with data
   */
  @property({ type: Array })
  sections: SummarySection[] = [];

  /**
   * Title for the summary
   */
  @property({ type: String })
  override title = 'Review Your Information';

  /**
   * Whether to show confirmation message
   */
  @property({ type: Boolean, attribute: 'show-confirmation' })
  showConfirmation = false;

  /**
   * Confirmation message title
   */
  @property({ type: String, attribute: 'confirmation-title' })
  confirmationTitle = 'Success';

  /**
   * Confirmation message type (success, info, warning, error)
   */
  @property({ type: String, attribute: 'confirmation-type' })
  confirmationType: 'success' | 'info' | 'warning' | 'error' = 'success';

  /**
   * Whether to show print button
   */
  @property({ type: Boolean, attribute: 'show-print' })
  showPrint = true;

  /**
   * Whether to show download button
   */
  @property({ type: Boolean, attribute: 'show-download' })
  showDownload = false;

  /**
   * Whether to show edit buttons on each field
   */
  @property({ type: Boolean, attribute: 'show-edit' })
  showEdit = false;

  /**
   * Label for print button
   */
  @property({ type: String, attribute: 'print-button-label' })
  printButtonLabel = 'Print';

  /**
   * Label for download button
   */
  @property({ type: String, attribute: 'download-button-label' })
  downloadButtonLabel = 'Download';

  /**
   * Current print/download state
   */
  @state()
  private isProcessing = false;

  override connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Emit ready event after first render
   */
  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: {
          sections: this.sections.length,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle print action
   */
  private handlePrint() {
    this.isProcessing = true;

    this.dispatchEvent(
      new CustomEvent('print-summary', {
        detail: {
          sections: this.sections,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Default print behavior
    setTimeout(() => {
      window.print();
      this.isProcessing = false;
    }, 100);
  }

  /**
   * Handle download action
   */
  private handleDownload() {
    this.isProcessing = true;

    this.dispatchEvent(
      new CustomEvent('download-summary', {
        detail: {
          sections: this.sections,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Developers can prevent default and implement their own download logic
    this.isProcessing = false;
  }

  /**
   * Handle edit field action
   */
  private handleEdit(section: SummarySection, item: SummaryItem) {
    this.dispatchEvent(
      new CustomEvent('edit-field', {
        detail: {
          section: section.heading,
          field: item.label,
          currentValue: item.value,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Call the item's edit callback if provided
    if (item.onEdit) {
      item.onEdit();
    }
  }

  /**
   * Render confirmation alert
   */
  private renderConfirmation() {
    if (!this.showConfirmation) {
      return '';
    }

    const alertClass = `usa-alert usa-alert--${this.confirmationType}`;

    return html`
      <div class="${alertClass}">
        <div class="usa-alert__body">
          <h4 class="usa-alert__heading">${this.confirmationTitle}</h4>
          <slot name="confirmation">
            <p class="usa-alert__text">Your information has been successfully submitted.</p>
          </slot>
        </div>
      </div>
    `;
  }

  /**
   * Render summary section
   */
  private renderSection(section: SummarySection) {
    return html`
      <div class="usa-summary-box margin-bottom-4">
        <div class="usa-summary-box__body">
          <h3 class="usa-summary-box__heading">${section.heading}</h3>
          <div class="usa-summary-box__text">
            <dl class="usa-list usa-list--unstyled">
              ${section.items.map((item) => this.renderItem(section, item))}
            </dl>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render summary item
   */
  private renderItem(section: SummarySection, item: SummaryItem) {
    return html`
      <div class="display-flex flex-justify margin-bottom-2">
        <div class="flex-1">
          <dt class="text-bold">${item.label}</dt>
          <dd class="margin-left-0 margin-top-05">${item.value || '—'}</dd>
        </div>
        ${this.showEdit
          ? html`
              <button
                class="usa-button usa-button--unstyled"
                @click="${() => this.handleEdit(section, item)}"
                aria-label="Edit ${item.label}"
              >
                Edit
              </button>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Render action buttons
   */
  private renderActions() {
    if (!this.showPrint && !this.showDownload) {
      return '';
    }

    return html`
      <div class="usa-button-group margin-top-4">
        ${this.showPrint
          ? html`
              <usa-button
                variant="outline"
                @click="${this.handlePrint}"
                ?disabled="${this.isProcessing}"
              >
                ${this.printButtonLabel}
              </usa-button>
            `
          : ''}
        ${this.showDownload
          ? html`
              <usa-button
                variant="outline"
                @click="${this.handleDownload}"
                ?disabled="${this.isProcessing}"
              >
                ${this.downloadButtonLabel}
              </usa-button>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Render the pattern
   */
  override render() {
    return html`
      <div class="usa-prose">
        <!-- Optional header slot -->
        <slot name="header">
          <h1>${this.title}</h1>
        </slot>

        <!-- Confirmation message -->
        ${this.renderConfirmation()}

        <!-- Summary sections -->
        <div class="margin-top-4">
          ${this.sections.map((section) => this.renderSection(section))}
        </div>

        <!-- Action buttons -->
        ${this.renderActions()}

        <!-- Optional footer slot -->
        <div class="margin-top-4">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  /**
   * Public API: Get current summary data
   */
  getSummaryData(): SummarySection[] {
    return [...this.sections];
  }

  /**
   * Public API: Set summary data
   */
  setSummaryData(sections: SummarySection[]) {
    this.sections = sections;
  }

  /**
   * Public API: Add a section
   */
  addSection(section: SummarySection) {
    this.sections = [...this.sections, section];
  }

  /**
   * Public API: Clear all sections
   */
  clearSummary() {
    this.sections = [];
  }

  /**
   * Public API: Trigger print
   */
  print() {
    this.handlePrint();
  }

  /**
   * Public API: Trigger download
   */
  download() {
    this.handleDownload();
  }
}
