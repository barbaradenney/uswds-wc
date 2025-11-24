import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ButtonVariant, ButtonType } from '@uswds-wc/core';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

/**
 * USA Button Web Component
 *
 * A simple, accessible USWDS button implementation using a native button element.
 * Follows USWDS specifications exactly with a proper <button> element inside the web component.
 * This ensures full form integration and native button behavior.
 *
 * @element usa-button
 * @fires click - Dispatched when the button is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-button/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-button/src/styles/_usa-button.scss
 * @uswds-docs https://designsystem.digital.gov/components/button/
 * @uswds-guidance https://designsystem.digital.gov/components/button/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/button/#accessibility
 */
@customElement('usa-button')
export class USAButton extends LitElement {
  // Store USWDS module for cleanup

  static override styles = css`
    :host {
      display: inline-block;
    }
  `;

  @property({ type: String })
  variant: ButtonVariant = 'primary';

  @property({ type: String })
  size: 'small' | 'medium' | 'big' = 'medium';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String })
  type: ButtonType = 'button';

  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = '';

  @property({ type: String, attribute: 'aria-pressed' })
  override ariaPressed: string | null = null;

  private buttonElement?: HTMLButtonElement;
  private originalContent: Node[] = [];
  private usingUSWDSEnhancement = false;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
    // Preserve the original content before rendering
    this.originalContent = Array.from(this.childNodes);
    // Initialize progressive enhancement
    this.initializeUSWDSButton();

    // Add keyboard event listeners to forward Enter/Space to internal button
    this.addEventListener('keydown', this.handleKeyDown);
  }

  override firstUpdated() {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // Get reference to the button element after first render
    this.buttonElement = this.querySelector('button') as HTMLButtonElement;
    if (this.buttonElement) {
      this.updateButtonElement();
      // Move the original content into the button (not clone, move)
      while (this.originalContent.length > 0) {
        const node = this.originalContent.shift()!;
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
          this.buttonElement.appendChild(node);
        }
      }
      // Native button click events bubble naturally - no custom forwarding needed
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Update the button element if it exists
    if (this.buttonElement) {
      this.updateButtonElement();
    }
  }

  private updateButtonElement() {
    if (!this.buttonElement) return;

    // Apply USWDS button classes to the actual button element
    const classes = ['usa-button'];

    // Add variant classes (primary doesn't need additional class)
    if (this.variant !== 'primary') {
      classes.push(`usa-button--${this.variant}`);
    }

    // Add size classes (medium is default, doesn't need additional class)
    if (this.size !== 'medium') {
      classes.push(`usa-button--${this.size}`);
    }

    // Apply classes to the button element
    this.buttonElement.className = classes.join(' ');

    // Update button attributes
    this.buttonElement.type = this.type;
    this.buttonElement.disabled = this.disabled;

    if (this.ariaLabel) {
      this.buttonElement.setAttribute('aria-label', this.ariaLabel);
    } else {
      this.buttonElement.removeAttribute('aria-label');
    }

    if (this.ariaPressed !== null) {
      this.buttonElement.setAttribute('aria-pressed', this.ariaPressed);
    } else {
      this.buttonElement.removeAttribute('aria-pressed');
    }
  }

  private async initializeUSWDSButton() {
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(
        `⚠️ ${this.constructor.name}: Already initialized, skipping duplicate initialization`
      );
      return;
    }

    console.log(`🔘 Button: Initializing (presentational component - no USWDS JavaScript needed)`);

    try {
      // Check if global USWDS is available for potential future enhancements
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS.button && typeof USWDS.button.on === 'function') {
          USWDS.button.on(this);
          console.log(`🔘 Button: Enhanced with global USWDS JavaScript`);
          return;
        }
      }

      console.log(`🔘 Button: Using presentational component behavior (USWDS Button is CSS-only)`);
    } catch (error) {
      console.warn(`🔘 Button: Initialization completed with basic behavior:`, error);
    }
  }

  /**
   * Handle keyboard events to forward Enter/Space to the internal button
   * This ensures the button works correctly when focus is on the web component host
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    // Only handle Enter and Space keys
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    // Prevent default to avoid page scrolling on Space
    event.preventDefault();

    // Don't activate if disabled
    if (this.disabled) {
      return;
    }

    // Trigger the button click
    this.buttonElement?.click();
  };

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
    // Remove event listeners to prevent memory leaks
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Clean up USWDS module on component destruction
   */
  private cleanupUSWDS() {
    // Try cleanup with global USWDS (button components are presentational)
    if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
      const USWDS = (window as any).USWDS;
      if (USWDS.button?.off) {
        try {
          USWDS.button.off(this);
          console.log(`🧹 Cleaned up USWDS button`);
        } catch (error) {
          console.warn(`⚠️ Error cleaning up USWDS:`, error);
        }
      }
    }
  }

  // Public methods for programmatic interaction
  override focus(options?: FocusOptions) {
    this.buttonElement?.focus(options);
  }

  override click() {
    if (this.disabled) return;

    // First trigger the native button click
    this.buttonElement?.click();

    // Then dispatch a custom click event on the host element
    this.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  override render() {
    // Render a native button element following USWDS structure
    // The content will be moved in firstUpdated
    return html` <button></button> `;
  }
}
