import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import base component and utils
import { USWDSBaseComponent } from '@uswds-wc/core';

// Import official USWDS compiled CSS

/**
 * USA Link Web Component
 *
 * A simple, accessible USWDS link implementation as a custom element.
 * Provides consistent link styling with support for external links,
 * different visual variants, and proper accessibility attributes.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-link
 * @fires link-click - Dispatched when the link is clicked
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-link/src/styles/_usa-link.scss
 * @uswds-docs https://designsystem.digital.gov/components/link/
 * @uswds-guidance https://designsystem.digital.gov/components/link/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/link/#accessibility
 */
@customElement('usa-link')
export class USALink extends USWDSBaseComponent {
  // No shadow DOM styles since we use light DOM

  // Store bound handler for proper cleanup
  private boundHandleLinkClick = this.handleLinkClick.bind(this);

  @property({ type: String })
  href = '';

  @property({ type: String })
  text = '';

  @property({ type: String })
  target = '';

  @property({ type: String })
  rel = '';

  @property({ type: String })
  variant: 'default' | 'external' | 'alt' | 'unstyled' = 'default';

  @property({ type: Boolean, reflect: true })
  external = false;

  @property({ type: Boolean, reflect: true })
  unstyled = false;

  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = '';

  @property({ type: String })
  download = '';

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
    this.debug('Link component connected', { href: this.href, variant: this.variant });
  }

  override firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    super.firstUpdated(changedProperties);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const anchor = this.querySelector('a');
    if (anchor) {
      anchor.addEventListener('click', this.boundHandleLinkClick);
    }
  }

  private handleLinkClick(event: Event) {
    const isExternal = this.external || this.isExternalLink(this.href);

    this.dispatchEvent(
      new CustomEvent('link-click', {
        detail: {
          href: this.href,
          external: isExternal,
          target: isExternal ? '_blank' : this.target,
          event: event,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private isExternalLink(href: string): boolean {
    if (!href) return false;

    // Check if it's a different domain
    if (href.startsWith('http://') || href.startsWith('https://')) {
      try {
        const url = new URL(href);
        return url.hostname !== window.location.hostname;
      } catch {
        return false;
      }
    }

    return false;
  }

  private getLinkClasses(): string {
    const classes: string[] = [];

    // Base link class - always add unless explicitly unstyled
    if (!this.unstyled && this.variant !== 'unstyled') {
      classes.push('usa-link');
    }

    // Variant classes
    if (this.external || this.variant === 'external' || this.isExternalLink(this.href)) {
      classes.push('usa-link--external');
    }

    if (this.variant === 'alt') {
      classes.push('usa-link--alt');
    }

    return classes.join(' ');
  }

  private getRel(): string {
    let relValue = this.rel;

    // Auto-add security attributes for external links
    if (this.external || this.variant === 'external' || this.isExternalLink(this.href)) {
      const relParts = relValue ? relValue.split(' ') : [];

      if (!relParts.includes('noopener')) {
        relParts.push('noopener');
      }

      if (!relParts.includes('noreferrer')) {
        relParts.push('noreferrer');
      }

      relValue = relParts.join(' ');
    }

    return relValue;
  }

  private getTarget(): string {
    // Auto-set target for external links if not specified
    if (this.target) {
      return this.target;
    }

    if (this.external || this.variant === 'external' || this.isExternalLink(this.href)) {
      return '_blank';
    }

    return '';
  }

  override disconnectedCallback() {
    const anchor = this.querySelector('a');
    if (anchor) {
      anchor.removeEventListener('click', this.boundHandleLinkClick);
    }
    super.disconnectedCallback();
  }

  override render() {
    // Debug logging available with ?debug=true

    const linkClasses = this.getLinkClasses();
    const target = this.getTarget();
    const rel = this.getRel();

    // Use text property if set, otherwise content will be moved from children
    return html`
      <a
        class="${linkClasses}"
        href="${this.href}"
        target="${ifDefined(target ? target : undefined)}"
        rel="${ifDefined(rel ? rel : undefined)}"
        aria-label="${ifDefined(this.ariaLabel ? this.ariaLabel : undefined)}"
        download="${ifDefined(this.download ? this.download : undefined)}"
      >${this.text}</a>
    `;
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // Only move children if we're not using the text property
    // This allows both usage patterns:
    // <usa-link text="Click me" href="#">  (attribute-based)
    // <usa-link href="#">Click me</usa-link>  (slot-based)
    if (!this.text) {
      this.moveChildrenToElement('a');
    }
  }

  // Public API methods
  override click() {
    const link = this.querySelector('a');
    if (link) {
      link.click();
    }
  }

  override focus() {
    const link = this.querySelector('a');
    if (link) {
      link.focus();
    }
  }

  override blur() {
    const link = this.querySelector('a');
    if (link) {
      link.blur();
    }
  }
}
