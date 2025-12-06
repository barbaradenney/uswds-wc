import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

export interface StepItem {
  label: string;
  status: 'complete' | 'current' | 'incomplete';
}

/**
 * USA Step Indicator Web Component
 *
 * A simple, accessible USWDS step indicator implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-step-indicator
 * @fires step-click - Dispatched when step is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-step-indicator/src/styles/_usa-step-indicator.scss
 * @uswds-docs https://designsystem.digital.gov/components/step-indicator/
 * @uswds-guidance https://designsystem.digital.gov/components/step-indicator/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/step-indicator/#accessibility
 */
@customElement('usa-step-indicator')
export class USAStepIndicator extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: Array })
  steps: StepItem[] = [];

  @property({ type: Number })
  currentStep = 1;

  @property({ type: Boolean })
  showLabels = true;

  @property({ type: Boolean })
  counters = false;

  @property({ type: Boolean })
  center = false;

  // Alias for center property to match USWDS naming
  get centered() {
    return this.center;
  }
  set centered(value: boolean) {
    this.center = value;
  }

  @property({ type: Boolean })
  small = false;

  @property({ type: String })
  heading = '';

  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = 'Step indicator';

  private slottedContent: string = '';
  private slottedContentApplied: boolean = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback?.();

    // Capture any initial slotted content before render
    // This allows using BOTH property-based steps AND custom slotted content
    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // If steps array is provided, sync currentStep with current status
    this.syncCurrentStep();
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated?.(changedProperties);

    // Note: USWDS Step Indicator is CSS-only for styling.
    // Step navigation is handled by the component's public API methods.
    // No dynamic imports needed - works in all environments (bundled, CDN, SSR).
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    // Handle currentStep changes during the current update cycle
    // Don't trigger additional updates that would cause re-render loops
    if (changedProperties.has('currentStep') && !changedProperties.has('steps')) {
      // Update the internal step statuses without triggering a new update
      this.updateStepStatusesSync();
    }

    // Apply captured content using DOM manipulation
    this.applySlottedContent();
  }

  private applySlottedContent() {
    // Only apply slotted content once to prevent duplication
    if (this.slottedContent && !this.slottedContentApplied) {
      const slotElement = this.querySelector('slot');
      if (slotElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.slottedContent;
        slotElement.replaceWith(...Array.from(tempDiv.childNodes));
        this.slottedContentApplied = true;
      }
    }
  }

  private updateStepStatusesSync() {
    // Update step statuses synchronously without triggering new updates
    // This prevents the "scheduled an update after update completed" warning
    for (let i = 0; i < this.steps.length; i++) {
      const newStatus =
        i + 1 < this.currentStep
          ? ('complete' as const)
          : i + 1 === this.currentStep
            ? ('current' as const)
            : ('incomplete' as const);

      // Only update if status actually changed to avoid unnecessary work
      if (this.steps[i]!.status !== newStatus) {
        // Create new object to ensure reactivity works properly
        this.steps[i] = { ...this.steps[i]!, status: newStatus };
      }
    }
    // Force a re-render since we modified the array in place
    this.requestUpdate('steps');
  }

  private syncCurrentStep(): void {
    // Find current step from steps array if not explicitly set
    const currentIndex = this.steps.findIndex((step) => step.status === 'current');
    if (currentIndex !== -1 && this.currentStep !== currentIndex + 1) {
      this.currentStep = currentIndex + 1;
    }

    // Check if any updates are actually needed to avoid unnecessary re-renders
    const needsUpdate = false;

    if (needsUpdate) {
      this.requestUpdate();
    }
  }

  private renderStepLabel(step: StepItem) {
    if (!this.showLabels) return '';

    const isCurrent = step.status === 'current';
    const isComplete = step.status === 'complete';

    return html`
      <span class="usa-step-indicator__segment-label"> ${step.label} </span>
      <span class="usa-sr-only"
        >${isComplete ? 'completed' : isCurrent ? 'current' : 'not completed'}</span
      >
    `;
  }

  private renderStep(step: StepItem, _index: number): any {
    const isCurrent = step.status === 'current';
    const isComplete = step.status === 'complete';
    const isIncomplete = step.status === 'incomplete';

    const segmentClasses = [
      'usa-step-indicator__segment',
      isComplete ? 'usa-step-indicator__segment--complete' : '',
      isCurrent ? 'usa-step-indicator__segment--current' : '',
      isIncomplete ? 'usa-step-indicator__segment--incomplete' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <li class="${segmentClasses}" aria-current="${isCurrent ? 'step' : 'false'}" role="listitem">
        <span></span>
        ${this.renderStepLabel(step)}
      </li>
    `;
  }

  private renderHeader() {
    if (this.steps.length === 0) return '';

    const currentStepData = this.steps[this.currentStep - 1];
    const currentStepLabel = currentStepData ? currentStepData.label : '';

    return html`
      <div class="usa-step-indicator__header">
        <h4 class="usa-step-indicator__heading">
          <span class="usa-step-indicator__heading-counter">
            <span class="usa-sr-only">Step</span>
            <span class="usa-step-indicator__current-step">${this.currentStep}</span>
            <span class="usa-step-indicator__total-steps">of ${this.steps.length}</span>
          </span>
          <span class="usa-step-indicator__heading-text">${this.heading || currentStepLabel}</span>
        </h4>
      </div>
    `;
  }

  override render() {
    const containerClasses = [
      'usa-step-indicator',
      this.counters ? 'usa-step-indicator--counters' : '',
      this.centered ? 'usa-step-indicator--center' : '',
      this.small ? 'usa-step-indicator--small' : '',
      !this.showLabels ? 'usa-step-indicator--no-labels' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${containerClasses}" aria-label="${this.ariaLabel}">
        <ol class="usa-step-indicator__segments" role="list">
          ${this.steps.length > 0
            ? this.steps.map((step, index) => this.renderStep(step, index))
            : ''}
        </ol>
        ${this.renderHeader()}
        <slot></slot>
      </div>
    `;
  }

  // Public API methods
  nextStep() {
    if (this.currentStep < this.steps.length) {
      this.currentStep += 1;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  goToStep(stepNumber: number) {
    if (stepNumber >= 1 && stepNumber <= this.steps.length) {
      this.currentStep = stepNumber;
    }
  }

  markStepComplete(stepNumber: number) {
    if (stepNumber >= 1 && stepNumber <= this.steps.length) {
      this.steps = this.steps.map((step, index) =>
        index + 1 === stepNumber ? { ...step, status: 'complete' as const } : step
      );
      this.requestUpdate();
    }
  }

  setCurrentStep(stepNumber: number) {
    this.goToStep(stepNumber);
  }
}
