import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeModal } from './usa-modal-behavior.js';
import { SELECTORS, TIMING, CLASSES } from './modal-constants.js';

// Import official USWDS compiled CSS

/**
 * USA Modal Web Component
 *
 * A minimal wrapper around USWDS modal functionality.
 * Provides the HTML structure for USWDS modal and delegates all behavior to mirrored USWDS JavaScript.
 * This ensures authentic USWDS behavior while providing a web components API.
 *
 * ARCHITECTURE: USWDS-Mirrored Behavior Pattern
 * - Component renders HTML structure
 * - Behavior file (usa-modal-behavior.ts) mirrors USWDS JavaScript exactly
 * - No custom logic - 100% USWDS behavior parity
 *
 * @element usa-modal
 *
 * @slot - Default slot for modal body content
 * @slot footer - Slot for modal footer buttons (alternative to button text attributes)
 *
 * @attr {string} heading - Modal heading/title text.
 * @attr {string} description - Modal description text.
 * @attr {string} trigger-text - Text for the trigger button.
 * @attr {boolean} show-trigger - Show the trigger button. Defaults to true.
 * @attr {boolean} large - Use large modal variant.
 * @attr {boolean} force-action - Force user to take action (no close on backdrop click).
 * @attr {string} primary-button-text - Primary action button text. Defaults to 'Continue'.
 * @attr {string} secondary-button-text - Secondary action button text. Defaults to 'Cancel'.
 * @attr {boolean} show-secondary-button - Show secondary button. Defaults to true.
 * @attr {boolean} open - Whether the modal is currently open.
 *
 * @fires modal-open - Dispatched when the modal is opened
 * @fires modal-close - Dispatched when the modal is closed
 *
 * @example
 * ```html
 * <!-- Basic modal with trigger -->
 * <usa-modal
 *   heading="Confirm Action"
 *   trigger-text="Open Modal"
 * >
 *   Are you sure you want to proceed with this action?
 * </usa-modal>
 *
 * <!-- Large modal -->
 * <usa-modal heading="Terms of Service" large>
 *   <p>Long form content goes here...</p>
 * </usa-modal>
 *
 * <!-- Force action modal (no backdrop close) -->
 * <usa-modal
 *   heading="Session Expiring"
 *   force-action
 *   primary-button-text="Extend Session"
 *   secondary-button-text="Log Out"
 * >
 *   Your session will expire in 5 minutes.
 * </usa-modal>
 *
 * <!-- Programmatically controlled modal -->
 * <usa-modal id="my-modal" heading="Custom Modal" show-trigger="false">
 *   Content here
 * </usa-modal>
 * <script>
 *   document.getElementById('my-modal').open = true;
 * </script>
 * ```
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 * @see usa-modal-behavior.ts - USWDS behavior mirror
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-modal/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-modal/src/styles/_usa-modal.scss
 * @uswds-docs https://designsystem.digital.gov/components/modal/
 * @uswds-guidance https://designsystem.digital.gov/components/modal/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/modal/#accessibility
 */
@customElement('usa-modal')
export class USAModal extends USWDSBaseComponent {
  // CRITICAL: Light DOM implementation for USWDS compatibility
  protected override createRenderRoot() {
    return this;
  }

  // NOTE: static styles do NOT apply in Light DOM
  // The display style is applied directly in connectedCallback()

  @property({ type: String })
  heading = '';

  @property({ type: String })
  description = '';

  @property({ type: String, attribute: 'trigger-text' })
  triggerText = '';

  @property({ type: Boolean, attribute: 'show-trigger', reflect: true })
  showTrigger = true;

  @property({ type: Boolean, reflect: true })
  large = false;

  @property({ type: Boolean, attribute: 'force-action', reflect: true })
  forceAction = false;

  @property({ type: String, attribute: 'primary-button-text' })
  primaryButtonText = 'Continue';

  @property({ type: String, attribute: 'secondary-button-text' })
  secondaryButtonText = 'Cancel';

  @property({ type: Boolean, attribute: 'show-secondary-button', reflect: true })
  showSecondaryButton = true;

  @property({ type: Boolean, reflect: true })
  open = false;

  // Slot content handling to prevent duplication
  private slottedContent: string = '';
  private slotApplicationAttempts = 0;
  private maxSlotApplicationAttempts = 40; // 40 * 50ms = 2 seconds max
  private transformationObserver?: MutationObserver;

  // Cleanup function from USWDS behavior
  private cleanup?: () => void;

  // Track initialization to prevent double-init
  private initialized = false;
  private isInitializing = false; // Guard against concurrent initialization
  private initializationPromise: Promise<void> | null = null;
  private listenersAttached = false;

  // Store event handlers for proper cleanup
  private handlePrimaryClick = () => {
    this.dispatchEvent(
      new CustomEvent('modal-primary-action', {
        detail: {
          heading: this.heading,
          description: this.description,
        },
        bubbles: true,
        composed: true,
      })
    );
    this.open = false;
  };

  private handleSecondaryClick = () => {
    this.dispatchEvent(
      new CustomEvent('modal-secondary-action', {
        detail: {
          heading: this.heading,
          description: this.description,
        },
        bubbles: true,
        composed: true,
      })
    );
    if (!this.forceAction) {
      this.open = false;
    }
  };

  private handleCloseClick = () => {
    this.open = false;
  };

  // Store button references for cleanup
  private buttonRefs: {
    primary?: HTMLElement;
    secondary?: HTMLElement;
    close?: HTMLElement;
  } = {};

  override connectedCallback() {
    super.connectedCallback();

    // Apply display style (required for Light DOM - static styles don't apply)
    this.style.display = 'block';

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

    super.firstUpdated(changedProperties);

    // Set up MutationObserver to watch for USWDS transformation
    if (this.slottedContent) {
      this.watchForUSWDSTransformation();
    }

    this.initializationPromise = this.initializeUSWDS();
    await this.initializationPromise;

    // Fallback: If observer didn't trigger, try applying slots after delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (this.slottedContent) {
      this.applySlottedContent();
    }
  }

  override async updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // If forceAction or large properties change AFTER initial render, we need to reinitialize
    // because USWDS has already moved and wrapped the modal
    // Only reinitialize if:
    // 1. The component was already initialized (this.cleanup exists)
    // 2. AND the properties actually changed from a previous value (not undefined)
    const forceActionChanged =
      changedProperties.has('forceAction') && changedProperties.get('forceAction') !== undefined;
    const largeChanged =
      changedProperties.has('large') && changedProperties.get('large') !== undefined;
    const shouldReinitialize = this.cleanup && (forceActionChanged || largeChanged);

    if (shouldReinitialize && this.cleanup) {
      // Clean up existing modal wrapper
      this.cleanup();
      this.initialized = false;

      // Reinitialize with new properties
      this.initializationPromise = this.initializeUSWDS();
      await this.initializationPromise;

      // Apply slotted content after reinitialization
      this.applySlottedContent();

      // Reattach button listeners
      this.setupButtonListeners();
      this.listenersAttached = true;
    }

    // Setup button listeners after first render
    if (!this.listenersAttached && this.initialized) {
      this.setupButtonListeners();
      this.listenersAttached = true;
    }

    if (changedProperties.has('open')) {
      if (this.open) {
        // Add body class for scroll management
        document.body.classList.add(CLASSES.MODAL_OPEN);

        // Dispatch the open event synchronously
        this.dispatchEvent(
          new CustomEvent('modal-open', {
            detail: {
              heading: this.heading,
              description: this.description,
            },
            bubbles: true,
            composed: true,
          })
        );

        // Then handle the async opening
        this.handleAsyncOpen();
      } else {
        // Remove body class
        document.body.classList.remove(CLASSES.MODAL_OPEN);

        // Dispatch the close event synchronously
        this.dispatchEvent(
          new CustomEvent('modal-close', {
            detail: {
              heading: this.heading,
              description: this.description,
            },
            bubbles: true,
            composed: true,
          })
        );

        // Then handle the async closing
        this.handleAsyncClose();
      }
    }
  }

  private async handleAsyncOpen(): Promise<void> {
    // Wait for initialization to complete
    await this.initializationPromise;

    // Wait for next frame to ensure DOM is ready
    await TIMING.ANIMATION_FRAME_DELAY();

    this.openModal();
  }

  private async handleAsyncClose(): Promise<void> {
    // Wait for initialization to complete
    await this.initializationPromise;

    // Wait for next frame to ensure DOM is ready
    await TIMING.ANIMATION_FRAME_DELAY();

    this.closeModal();
  }

  /**
   * Watch for USWDS transformation using MutationObserver
   * This detects exactly when USWDS moves the modal to document.body
   */
  private watchForUSWDSTransformation(): void {
    // Create observer to watch for modal being moved to document.body
    this.transformationObserver = new MutationObserver((_mutations) => {
      // Check if our modal wrapper was added to document.body
      const wrapper = document.getElementById(this.modalId);
      if (wrapper && wrapper.getAttribute('role') === 'dialog') {
        // USWDS has transformed the modal!
        this.applySlottedContent();
        // Disconnect observer after successful application
        this.transformationObserver?.disconnect();
      }
    });

    // Start observing document.body for child additions
    this.transformationObserver.observe(document.body, {
      childList: true,
      subtree: false, // Only direct children of body
    });

    // Set a timeout to disconnect observer if transformation takes too long
    setTimeout(() => {
      this.transformationObserver?.disconnect();
    }, 5000); // 5 second timeout
  }

  private applySlottedContent(): void {
    if (!this.slottedContent) {
      return;
    }

    // Increment attempt counter
    this.slotApplicationAttempts++;

    // After USWDS transformation, the modal wrapper is moved to document.body
    // The wrapper has role="dialog" and the original modal ID
    const wrapper = document.getElementById(this.modalId);

    if (!wrapper || wrapper.getAttribute('role') !== 'dialog') {
      // USWDS hasn't transformed yet, wait and retry
      if (this.slotApplicationAttempts < this.maxSlotApplicationAttempts) {
        setTimeout(() => this.applySlottedContent(), 50);
      }
      return;
    }

    // Find the actual modal content inside the wrapper
    // Structure after USWDS: wrapper > overlay > modal
    const modal = wrapper.querySelector('.usa-modal');
    if (!modal) {
      if (this.slotApplicationAttempts < this.maxSlotApplicationAttempts) {
        setTimeout(() => this.applySlottedContent(), 50);
      }
      return;
    }

    const slots = modal.querySelectorAll('slot');
    if (slots.length === 0) {
      // No slots found yet, but we have content - retry
      if (this.slotApplicationAttempts < this.maxSlotApplicationAttempts) {
        setTimeout(() => this.applySlottedContent(), 50);
      }
      return;
    }

    // Parse the stored content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.slottedContent;

    // Get all children from the temp div
    const children = Array.from(tempDiv.childNodes);

    // Apply slotted content to matching slots
    children.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element;
        const slotName = element.getAttribute('slot') || '';

        // Find the matching slot in the modal
        const targetSlot = slotName
          ? modal.querySelector(`slot[name="${slotName}"]`)
          : modal.querySelector('slot:not([name])');

        if (targetSlot && targetSlot.parentNode) {
          // Clone the child node to avoid moving it (which can cause issues)
          const clonedChild = child.cloneNode(true);
          // Insert the content before the slot, then remove the slot
          targetSlot.parentNode.insertBefore(clonedChild, targetSlot);
          targetSlot.remove();
        }
      }
    });

    // Reset counter after successful application
    this.slotApplicationAttempts = 0;
  }

  private setupButtonListeners(): void {
    // Clean up existing listeners first
    this.cleanupButtonListeners();

    // Query from the component's light DOM
    // In test environment: buttons are in component itself
    // In browser with USWDS: listeners will be on the transformed buttons too
    const primaryButton = this.querySelector(SELECTORS.PRIMARY_BUTTON) as HTMLElement;
    const secondaryButton = this.querySelector(SELECTORS.SECONDARY_BUTTON) as HTMLElement;
    const closeButton = this.querySelector(SELECTORS.CLOSE_BUTTON) as HTMLElement;

    if (primaryButton) {
      this.buttonRefs.primary = primaryButton;
      primaryButton.addEventListener('click', this.handlePrimaryClick);
    }

    if (secondaryButton) {
      this.buttonRefs.secondary = secondaryButton;
      secondaryButton.addEventListener('click', this.handleSecondaryClick);
    }

    if (closeButton) {
      this.buttonRefs.close = closeButton;
      closeButton.addEventListener('click', this.handleCloseClick);
    }
  }

  private cleanupButtonListeners(): void {
    if (this.buttonRefs.primary) {
      this.buttonRefs.primary.removeEventListener('click', this.handlePrimaryClick);
    }
    if (this.buttonRefs.secondary) {
      this.buttonRefs.secondary.removeEventListener('click', this.handleSecondaryClick);
    }
    if (this.buttonRefs.close) {
      this.buttonRefs.close.removeEventListener('click', this.handleCloseClick);
    }
    this.buttonRefs = {};
  }

  /**
   * Open the modal programmatically
   */
  public openModal(): void {
    // Set the property to update component state
    if (!this.open) {
      this.open = true;
      return; // The updated() method will handle the actual opening
    }

    // Check if modal is already visible (USWDS has already opened it)
    const wrapper = document.getElementById(this.modalId);
    if (wrapper && wrapper.classList.contains('is-visible')) {
      // Already open, do nothing (idempotent)
      return;
    }

    // Click the trigger to actually open the modal via USWDS
    const trigger = this.querySelector(SELECTORS.MODAL_TRIGGER) as HTMLElement;
    if (trigger) {
      trigger.click();
    }
  }

  /**
   * Close the modal programmatically
   */
  public closeModal(): void {
    if (typeof document === 'undefined') return;

    const modalWrapper = document.querySelector(SELECTORS.MODAL_WRAPPER_VISIBLE);
    if (modalWrapper) {
      const closeButton = modalWrapper.querySelector(SELECTORS.CLOSE_MODAL_TRIGGER) as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  private async initializeUSWDS(): Promise<void> {
    // Prevent double initialization - check both flags
    if (this.initialized || this.isInitializing) {
      return;
    }

    // Set BOTH flags immediately to prevent race conditions
    this.isInitializing = true;
    this.initialized = true;

    // Wait for DOM to be ready
    await this.updateComplete;

    // Wait one frame to ensure DOM elements are queryable
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Clean up any existing initialization first
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = undefined;
    }

    // Initialize USWDS-mirrored behavior
    // Note: Modal operates globally on document, so we pass 'this' as the root
    this.cleanup = initializeModal(this);

    // Clear the initializing flag after completion
    this.isInitializing = false;
  }

  override disconnectedCallback() {
    // Clean up button listeners to prevent memory leaks
    this.cleanupButtonListeners();
    // Clean up mutation observer
    this.transformationObserver?.disconnect();
    // Clean up USWDS behavior
    this.cleanup?.();
    super.disconnectedCallback();
  }

  // Counter for generating unique, deterministic IDs
  private static idCounter = 0;

  // Store the modal ID separately from the component ID
  // Using counter-based approach for predictable, testable IDs
  private modalId = `modal-${++USAModal.idCounter}`;

  override render() {
    // Use the stored modal ID
    const modalId = this.modalId;

    return html`
      ${this.showTrigger && this.triggerText
        ? html`
            <button class="usa-button" data-open-modal aria-controls="${modalId}">
              ${this.triggerText}
            </button>
          `
        : ''}

      <div
        class="${CLASSES.MODAL_BASE} ${this.large ? CLASSES.MODAL_LARGE : ''}"
        id="${modalId}"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${modalId}-heading"
        aria-describedby="${modalId}-description"
        data-force-action="${ifDefined(this.forceAction ? '' : undefined)}"
        data-web-component-managed="true"
      >
        <div class="usa-modal__content">
          <div class="usa-modal__main">
            <h2 class="usa-modal__heading" id="${modalId}-heading">
              ${this.heading || html`<slot name="heading"></slot>`}
            </h2>
            <div class="usa-prose">
              ${this.description
                ? html`<p id="${modalId}-description">${this.description}</p>`
                : html`<slot name="description"></slot>`}
              <slot name="body"></slot>
              <slot></slot>
            </div>
            <div class="usa-modal__footer">
              <slot name="footer">
                <ul class="usa-button-group">
                  <li class="usa-button-group__item">
                    <button type="button" class="usa-button" data-close-modal>
                      ${this.primaryButtonText}
                    </button>
                  </li>
                  ${this.showSecondaryButton
                    ? html`
                        <li class="usa-button-group__item">
                          <button
                            type="button"
                            class="usa-button usa-button--unstyled padding-105 text-center"
                            data-close-modal
                          >
                            ${this.secondaryButtonText}
                          </button>
                        </li>
                      `
                    : ''}
                </ul>
              </slot>
            </div>
          </div>
          ${!this.forceAction
            ? html`
                <button
                  type="button"
                  class="usa-button usa-modal__close"
                  aria-label="Close this window"
                  data-close-modal
                >
                  <svg
                    class="usa-icon"
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                  </svg>
                </button>
              `
            : ''}
        </div>
      </div>
    `;
  }
}
