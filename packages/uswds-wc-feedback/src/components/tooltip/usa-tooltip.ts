// Trigger CI run to verify tooltip test fix
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeTooltip } from './usa-tooltip-behavior.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

/**
 * USA Tooltip Web Component
 *
 * Minimal wrapper around USWDS tooltip functionality.
 * All tooltip behavior and positioning is managed by USWDS JavaScript.
 *
 * @element usa-tooltip
 * @fires tooltip-show - Dispatched when tooltip is shown
 * @fires tooltip-hide - Dispatched when tooltip is hidden
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-tooltip/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-tooltip/src/styles/_usa-tooltip.scss
 * @uswds-docs https://designsystem.digital.gov/components/tooltip/
 * @uswds-guidance https://designsystem.digital.gov/components/tooltip/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/tooltip/#accessibility
 */
@customElement('usa-tooltip')
export class USATooltip extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: inline-block;
    }
    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  text = '';

  @property({ type: String })
  position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  @property({ type: String })
  override title = '';

  @property({ type: String })
  label = '';

  @property({ type: Boolean, reflect: true })
  visible = false;

  @property({ type: String })
  classes = '';

  // Slot content handling to prevent duplication
  private slottedContent: string = '';

  // Store cleanup function from behavior
  private cleanup?: () => void;

  // Track initialization state to prevent double-initialization
  private initialized = false;

  // CRITICAL: Light DOM implementation for USWDS compatibility
  protected override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Capture any initial light DOM content before render to prevent duplication
    if (this.childNodes.length > 0) {
      this.slottedContent = this.innerHTML;
      this.innerHTML = '';
    }
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-tooltip-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior (only once)
    this.cleanup = initializeTooltip(this);
    this.initialized = true;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  private applySlottedContent() {
    if (this.slottedContent) {
      const slotElement = this.querySelector('slot');
      if (slotElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.slottedContent;
        slotElement.replaceWith(...Array.from(tempDiv.childNodes));
      }
    }
  }

  /**
   * Show the tooltip (API method)
   */
  show() {
    this.visible = true;
    const trigger = this.querySelector('.usa-tooltip__trigger');
    if (trigger) {
      trigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    }
    this.dispatchEvent(
      new CustomEvent('tooltip-show', {
        bubbles: true,
        composed: true,
        detail: {
          tooltip: this,
          text: this.text || this.title || this.label,
          position: this.position,
        },
      })
    );
  }

  /**
   * Hide the tooltip (API method)
   */
  hide() {
    this.visible = false;
    const wrapper =
      this.closest('.usa-tooltip') || this.parentElement?.querySelector('.usa-tooltip');
    if (wrapper) {
      wrapper.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }
    this.dispatchEvent(
      new CustomEvent('tooltip-hide', {
        bubbles: true,
        composed: true,
        detail: {
          tooltip: this,
          text: this.text || this.title || this.label,
          position: this.position,
        },
      })
    );
  }

  /**
   * Toggle the tooltip visibility
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  override render() {
    // Generate USWDS tooltip structure from properties
    const tooltipText = this.text || this.title || this.label;

    // Check if we have slotted content or text
    const hasSlottedContent = this.children.length > 0 || this.slottedContent.length > 0;
    const hasExplicitText = this.text || this.title || this.label;

    // If we have slotted content (with or without text), render slot
    // The slotted element will be marked with .usa-tooltip class in updated()
    if (hasSlottedContent) {
      return html`<slot></slot>`;
    } else if (hasExplicitText) {
      // No slotted content - create a span trigger with the label
      const displayLabel = this.label || 'Tooltip trigger';

      // USWDS expects element with .usa-tooltip class and title attribute
      return html`
        <span
          class="usa-tooltip ${this.classes}"
          data-position="${this.position}"
          data-classes="${this.classes}"
          title="${tooltipText}"
        >
          ${displayLabel}
        </span>
      `;
    } else {
      // No content at all - render empty slot
      return html`<slot></slot>`;
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Apply captured slot content using DOM manipulation
    this.applySlottedContent();

    const tooltipText = this.text || this.title || this.label;
    const hasSlottedContent = this.children.length > 0;

    // If we have slotted content AND text, add .usa-tooltip class and title to slotted element
    // This only happens on first update before initialization
    if (
      hasSlottedContent &&
      tooltipText &&
      !this.initialized &&
      (changedProperties.has('text') || changedProperties.has('title'))
    ) {
      // Find the first child element (the trigger)
      const triggerElement = this.children[0] as HTMLElement;
      if (triggerElement && !triggerElement.classList.contains('usa-tooltip')) {
        // Add USWDS tooltip class and attributes so USWDS will transform it
        triggerElement.classList.add('usa-tooltip');
        triggerElement.setAttribute('title', tooltipText);
        triggerElement.setAttribute('data-position', this.position);
        if (this.classes) {
          triggerElement.setAttribute('data-classes', this.classes);
        }
        // Initialization will happen in firstUpdated() - don't call it here to avoid double-init
      }
    }

    // Update tooltip text if text property changed
    if (changedProperties.has('text') || changedProperties.has('title')) {
      // After USWDS initialization, the structure is:
      // <usa-tooltip>
      //   <span class="usa-tooltip"> (wrapper)
      //     <span class="usa-tooltip__trigger"> (trigger with removed title)
      //     <span class="usa-tooltip__body"> (tooltip content)

      // Check if USWDS has already transformed the tooltip
      const tooltipBody = this.querySelector('.usa-tooltip__body');

      if (tooltipBody) {
        // USWDS has transformed - update the body content directly
        // DO NOT set title attribute as USWDS removes it during transformation
        tooltipBody.textContent = tooltipText;
      } else if (!hasSlottedContent) {
        // No slotted content - we rendered a span, ensure title is set
        const wrapper = this.querySelector('.usa-tooltip');
        if (wrapper && !wrapper.hasAttribute('title')) {
          wrapper.setAttribute('title', tooltipText);
        }
      }
    }

    // Update position if changed
    if (changedProperties.has('position')) {
      const wrapper = this.querySelector('.usa-tooltip');
      const trigger = this.querySelector('.usa-tooltip__trigger');

      if (trigger) {
        (trigger as HTMLElement).setAttribute('data-position', this.position);
      } else if (wrapper) {
        wrapper.setAttribute('data-position', this.position);
      }
    }

    // Update classes if changed
    if (changedProperties.has('classes') && this.classes) {
      // After USWDS transformation with slotted content, the structure is:
      // <usa-tooltip>
      //   <span class="usa-tooltip"> (wrapper created by USWDS from slotted element)
      //     <element class="usa-tooltip__trigger"> (original slotted element)

      // Find the wrapper - must be a direct child with .usa-tooltip class
      const wrapper = Array.from(this.children).find((child) =>
        child.classList.contains('usa-tooltip')
      ) as HTMLElement;

      if (wrapper) {
        // Remove old custom classes (not usa-tooltip)
        const classesToRemove = Array.from(wrapper.classList).filter(
          (cls) => cls !== 'usa-tooltip' && cls !== 'usa-tooltip--active'
        );
        classesToRemove.forEach((cls) => wrapper.classList.remove(cls));

        // Add new classes
        const newClasses = this.classes.split(' ').filter((cls) => cls.trim());
        newClasses.forEach((cls) => wrapper.classList.add(cls));
      } else if (hasSlottedContent) {
        // Not yet transformed - add data-classes to trigger element for USWDS to pick up
        const triggerElement = this.children[0] as HTMLElement;
        if (triggerElement) {
          triggerElement.setAttribute('data-classes', this.classes);
        }
      }
    }
  }
}
