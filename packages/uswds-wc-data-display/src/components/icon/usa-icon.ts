import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import official USWDS compiled CSS

/**
 * USA Icon Web Component
 *
 * A simple, accessible USWDS icon implementation as a custom element.
 * Uses official USWDS classes and styling with minimal custom code.
 *
 * @element usa-icon
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-icon/src/styles/_usa-icon.scss
 * @uswds-docs https://designsystem.digital.gov/components/icon/
 * @uswds-guidance https://designsystem.digital.gov/components/icon/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/icon/#accessibility
 */
@customElement('usa-icon')
export class USAIcon extends LitElement {
  @property({ type: String })
  name = '';

  @property({ type: String })
  size: '' | '3' | '4' | '5' | '6' | '7' | '8' | '9' = '';

  @property({ type: String, attribute: 'aria-label' })
  override ariaLabel = '';

  @property({ type: String, reflect: true })
  decorative: 'true' | 'false' | '' = '';

  @property({ type: String })
  spriteUrl = '/img/sprite.svg';

  @property({ type: Boolean, reflect: true })
  useSprite = true;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as HTMLElement;
  }

  override connectedCallback() {
    super.connectedCallback();

    // Set web component managed flag to prevent USWDS auto-initialization conflicts
    this.setAttribute('data-web-component-managed', 'true');
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up USWDS behavior
    try {
      if (typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined') {
        // USWDS available but no setup needed
      }
    } catch (error) {
      console.warn('📋 Icon: Cleanup failed:', error);
    }
    // Additional cleanup for event listeners would go here
  }
  override render() {
    // Only apply size class for valid sizes
    const validSizes = ['3', '4', '5', '6', '7', '8', '9'];
    const sizeClass =
      this.size && validSizes.includes(this.size) ? `usa-icon--size-${this.size}` : '';

    const iconClasses = ['usa-icon', sizeClass].filter(Boolean).join(' ');

    // Support both sprite files and inline paths for flexibility
    if (this.useSprite && this.spriteUrl) {
      // USWDS standard structure with sprite file
      return html`
        <svg
          class="${iconClasses}"
          aria-hidden="${this.decorative === 'true' ? 'true' : 'false'}"
          aria-label="${ifDefined(
            this.decorative !== 'true' && this.ariaLabel ? this.ariaLabel : undefined
          )}"
          focusable="false"
          role="img"
        >
          <use href="${this.spriteUrl}#${this.name}"></use>
        </svg>
      `;
    }

    // Fallback: render inline SVG for demo purposes
    const pathData = this.getIconPathData();
    return html`
      <svg
        class="${iconClasses}"
        aria-hidden="${this.decorative === 'true' ? 'true' : 'false'}"
        aria-label="${ifDefined(
          this.decorative !== 'true' && this.ariaLabel ? this.ariaLabel : undefined
        )}"
        focusable="false"
        role="img"
        viewBox="0 0 24 24"
      >
        <path d="${pathData}"></path>
      </svg>
    `;
  }

  // Simple icon paths for demo purposes
  private getIconPathData(): string {
    // Just the d attribute values for path elements
    const iconPaths: Record<string, string> = {
      search:
        'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
      close:
        'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
      menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
      arrow_forward: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
      arrow_back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
      arrow_upward: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z',
      arrow_downward: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z',
      check_circle:
        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      error:
        'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
      warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
      info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
      help: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
      flag: 'M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z',
      phone:
        'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
      mail: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
      location_on:
        'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      expand_more: 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
      expand_less: 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z',
      settings:
        'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
      file_download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
      cancel:
        'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z',
    };

    return (
      iconPaths[this.name] || 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
    );
  }
}
