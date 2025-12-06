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

  // Light DOM is handled by USWDSBaseComponent

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');

    // Note: USWDS Skip Link is CSS-only for styling.
    // Focus management is handled by the component's handleClick method.
    // No dynamic imports needed - works in all environments (bundled, CDN, SSR).
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up timeout to prevent memory leaks and DOM access after disconnect
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
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
      // USWDS behavior: Set tabindex="0" and outline to 0
      // Source: https://github.com/uswds/uswds/blob/develop/packages/usa-skipnav/src/index.js
      target.setAttribute('tabindex', '0');
      target.style.outline = '0';
      target.focus();

      // USWDS behavior: Reset tabindex to -1 on blur (one-time handler)
      const handleBlur = () => {
        target.setAttribute('tabindex', '-1');
        target.removeEventListener('blur', handleBlur);
      };
      target.addEventListener('blur', handleBlur);
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

    // Guard against empty selector
    if (!this.href) {
      return null;
    }

    // USWDS behavior: "#" targets "main-content"
    // Source: https://github.com/uswds/uswds/blob/develop/packages/usa-skipnav/src/index.js
    const targetId = this.href === '#' ? 'main-content' : this.href.slice(1);

    // Guard against malformed selectors
    try {
      return document.getElementById(targetId);
    } catch (error) {
      console.warn(`Skip link: Invalid target selector "${this.href}"`, error);
      return null;
    }
  }
}
