import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

export interface SkipLinkDetail {
  href: string;
  text: string;
}

/**
 * USA Skip Link Web Component
 *
 * Implements the official USWDS skip link behavior pattern.
 * Based on the USWDS JavaScript implementation for consistent functionality.
 *
 * @element usa-skip-link
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-skip-link/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-skip-link/src/styles/_usa-skip-link.scss
 * @uswds-docs https://designsystem.digital.gov/components/skip-link/
 * @uswds-guidance https://designsystem.digital.gov/components/skip-link/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/skip-link/#accessibility
 */
@customElement('usa-skip-link')
export class USASkipLink extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @property({ type: String })
  href = '#main-content';

  @property({ type: String })
  text = 'Skip to main content';

  @property({ type: Boolean, reflect: true })
  multiple = false;

  // Store USWDS module for cleanup
  private uswdsModule: any = null;
  private usingUSWDSEnhancement = false;
  // Light DOM is handled by USWDSBaseComponent

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
    console.log('🔗 Skip Link: Using USWDS pattern (no external JavaScript needed)');
    // Initialize progressive enhancement
    this.initializeUSWDSSkipLink();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    console.log('🔗 Skip Link: Cleaning up USWDS patterns');
    this.cleanupUSWDS();

    // Clean up timeout to prevent memory leaks and DOM access after disconnect
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;

      // Reset enhancement flag to allow reinitialization
      this.usingUSWDSEnhancement = false;
    }
  }

  // USWDS-style skip link methods
  // Based on: https://github.com/uswds/uswds/blob/develop/packages/usa-skip-link/src/index.js

  private timeoutId: number | null = null;

  private getSkipLinkClasses(): string {
    const classes = ['usa-skipnav'];

    if (this.multiple) {
      classes.push('usa-skipnav--multiple');
    }

    return classes.join(' ');
  }
  private async initializeUSWDSSkipLink() {
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(
        `⚠️ ${this.constructor.name}: Already initialized, skipping duplicate initialization`
      );
      return;
    }

    console.log('🎯 Skip Link: Initializing USWDS skipnav for focus management and accessibility');
    try {
      // Use standardized USWDS loader utility for consistency with other components
      const { loadUSWDSModule } = await import('@uswds-wc/core');

      await this.updateComplete;
      const skipLinkElement = this.querySelector('.usa-skipnav');

      if (skipLinkElement) {
        // Let USWDS handle skip link clicks and focus management using standard loader
        this.uswdsModule = await loadUSWDSModule('skipnav');

        // Initialize the loaded module on the element
        if (this.uswdsModule && typeof this.uswdsModule.on === 'function') {
          this.uswdsModule.on(skipLinkElement);
        }

        this.usingUSWDSEnhancement = true;

        console.log(
          '✅ USWDS skipnav initialized successfully - focus management handled by USWDS'
        );
        return; // USWDS owns all skip link behavior now
      } else {
        console.warn(
          '⚠️ Skip Link: No .usa-skipnav element found, using fallback focus management'
        );
        this.setupFallbackBehavior();
      }
    } catch (error) {
      console.warn('🔧 Skip Link: USWDS integration failed, using fallback:', error);
      await this.loadFullUSWDSLibrary();
    }
  }

  /**
   * Fallback: Check for existing USWDS or use component fallback
   */
  private async loadFullUSWDSLibrary(): Promise<void> {
    // Check if USWDS is already loaded globally
    if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
      console.log(`📦 USWDS already available globally`);
      this.initializeWithGlobalUSWDS();
      return;
    }

    // If not in browser environment, use fallback
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.log(`📦 Not in browser environment, using component fallback`);
      this.setupFallbackBehavior();
      return;
    }

    console.log(`📦 USWDS not available, using component fallback behavior`);
    this.setupFallbackBehavior();
  }

  /**
   * Initialize using global USWDS object (fallback mode)
   */
  private initializeWithGlobalUSWDS() {
    // Prevent multiple initializations
    if (this.usingUSWDSEnhancement) {
      console.log(`⚠️ Skip Link: Already initialized globally, skipping duplicate initialization`);
      return;
    }

    if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
      const USWDS = (window as any).USWDS;
      if (USWDS['skip-link'] && typeof USWDS['skip-link'].on === 'function') {
        USWDS['skip-link'].on(this);
        this.usingUSWDSEnhancement = true;
        console.log(`🎯 USWDS skip link initialized (fallback mode)`);
      }
    }
  }

  /**
   * Setup basic component functionality without USWDS enhancement
   */
  private setupFallbackBehavior() {
    console.log(`🔍 Setting up basic skip link functionality`);
    // Component already has full fallback behavior implemented
    console.log(`🎯 Skip Link ready with basic functionality`);
  }

  /**
   * Clean up USWDS module on component destruction
   */
  private async cleanupUSWDS() {
    try {
      // Cleanup USWDS module
      if (this.uswdsModule && typeof this.uswdsModule.off === 'function') {
        this.uswdsModule.off(this);
      }
    } catch (error) {
      console.warn('⚠️ Skip Link: Cleanup error:', error);
    }

    this.uswdsModule = null;
    this.usingUSWDSEnhancement = false;
  }

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  private handleClick(e: Event) {
    e.preventDefault();

    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('skip-link-click', {
        detail: {
          href: this.href,
          text: this.text,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Focus target element
    this.focusTarget();
  }

  private focusTarget() {
    const target = this.getTargetElement();
    if (target) {
      // Add tabindex if not present to make element focusable
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus();
    }
  }

  override render() {
    return html`
      <a class="${this.getSkipLinkClasses()}" href="${this.href}" @click="${this.handleClick}">
        ${this.text}
      </a>
    `;
  }

  // Public API methods
  override focus() {
    const link = this.querySelector('a');
    if (link) {
      link.focus();
    }
  }

  setHref(href: string) {
    this.href = href;
  }

  setText(text: string) {
    this.text = text;
  }

  setMultiple(multiple: boolean) {
    this.multiple = multiple;
  }

  getTargetElement(): HTMLElement | null {
    // Guard against accessing document when component is not connected
    if (!this.isConnected) return null;

    // Guard against empty or just '#' selector (common edge case, not an error)
    if (!this.href || this.href === '#') {
      return null;
    }

    // Guard against malformed selectors
    try {
      return document.querySelector(this.href);
    } catch (error) {
      console.warn(`Skip link: Invalid target selector "${this.href}"`, error);
      return null;
    }
  }
}
