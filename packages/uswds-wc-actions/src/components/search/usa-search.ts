import { html, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeSearch } from './usa-search-behavior.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

// Import usa-icon component for search icon
import '@uswds-wc/data-display';

/**
 * USA Search Web Component
 *
 * Minimal wrapper around USWDS search functionality.
 * Uses USWDS-mirrored behavior pattern for 100% behavioral parity.
 *
 * @element usa-search
 * @fires search-submit - Dispatched when search form is submitted
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-search/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-search/src/styles/_usa-search.scss
 * @uswds-docs https://designsystem.digital.gov/components/search/
 * @uswds-guidance https://designsystem.digital.gov/components/search/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/search/#accessibility
 */
@customElement('usa-search')
export class USASearch extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: inline-block;
      width: 100%;
    }
  `;

  @property({ type: String })
  placeholder = 'Search';

  @property({ type: String })
  label = '';

  @property({ type: String })
  buttonText = 'Search';

  @property({ type: String })
  value = '';

  @property({ type: String })
  size: 'small' | 'medium' | 'big' = 'medium';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String })
  name = 'search';

  @property({ type: String })
  inputId = 'search-field';

  @property({ type: String, attribute: 'button-id' })
  buttonId = 'search-button';

  @property({ type: Boolean })
  toggleable = false;

  // Store cleanup function from behavior
  private cleanup?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('data-web-component-managed', 'true');
  }

  override async firstUpdated(changedProperties: PropertyValues) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-search-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties as any);

    // Listen for form submission to dispatch custom event
    this.setupFormListener();

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Initialize using mirrored USWDS behavior
    this.cleanup = initializeSearch(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  private setupFormListener() {
    // Only listen for form submission to dispatch custom event for web component consumers
    const form = this.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        const input = form.querySelector('.usa-search__input') as HTMLInputElement;

        // For toggleable variant: don't prevent submission, let USWDS behavior handle it
        // For regular variant: prevent and dispatch custom event
        if (!this.toggleable) {
          e.preventDefault();
        }

        // Don't dispatch events if disabled
        if (this.disabled) {
          return;
        }

        // Dispatch custom event for web component consumers
        this.dispatchEvent(
          new CustomEvent('search-submit', {
            detail: {
              query: input?.value || '',
              form: form,
            },
            bubbles: true,
            composed: true,
          })
        );
      });

      // Add keydown listener for Enter key handling
      const input = form.querySelector('.usa-search__input') as HTMLInputElement;
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !this.disabled) {
            // Dispatch the same search-submit event
            this.dispatchEvent(
              new CustomEvent('search-submit', {
                detail: {
                  query: input.value || '',
                  form: form,
                },
                bubbles: true,
                composed: true,
              })
            );
          }
        });
      }
    }
  }

  private handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;

    // Dispatch search-input event
    this.dispatchEvent(
      new CustomEvent('search-input', {
        detail: {
          query: input.value,
          input: input,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  override render() {
    const sizeClass = this.size ? `usa-search--${this.size}` : '';
    const labelText = this.label || this.placeholder || 'Search';

    // Render toggleable big search variant (used in headers)
    // Wrap in header context per USWDS JavaScript requirements
    if (this.toggleable) {
      return html`
        <header>
          <button type="button" class="usa-button js-search-button" aria-label="Toggle search">
            ${this.buttonText}
          </button>
          <form role="search" class="usa-search ${sizeClass} js-search-form" data-enhanced="false">
            <label class="usa-sr-only" for="${this.inputId}">${labelText}</label>
            <div role="search">
              <input
                id="${this.inputId}"
                class="usa-input usa-search__input"
                type="search"
                name="${this.name}"
                placeholder="${this.placeholder}"
                .value="${this.value}"
                ?disabled="${this.disabled}"
                aria-label="${labelText}"
                @input="${this.handleInputChange}"
              />
              <button
                id="${this.buttonId}"
                class="usa-button usa-search__submit"
                type="submit"
                ?disabled="${this.disabled}"
              >
                ${this.size !== 'small'
                  ? html`<span class="usa-search__submit-text">${this.buttonText}</span>`
                  : ''}
                <usa-icon
                  name="search"
                  class="usa-search__submit-icon"
                  role="img"
                  aria-label="Search"
                ></usa-icon>
              </button>
            </div>
          </form>
        </header>
      `;
    }

    // Render regular always-visible search
    return html`
      <form role="search" class="usa-search ${sizeClass}" data-enhanced="false">
        <label class="usa-sr-only" for="${this.inputId}">${labelText}</label>
        <div role="search">
          <input
            id="${this.inputId}"
            class="usa-input usa-search__input"
            type="search"
            name="${this.name}"
            placeholder="${this.placeholder}"
            .value="${this.value}"
            ?disabled="${this.disabled}"
            aria-label="${labelText}"
            @input="${this.handleInputChange}"
          />
          <button
            id="${this.buttonId}"
            class="usa-button usa-search__submit"
            type="submit"
            ?disabled="${this.disabled}"
          >
            ${this.size !== 'small'
              ? html`<span class="usa-search__submit-text">${this.buttonText}</span>`
              : ''}
            <usa-icon
              name="search"
              class="usa-search__submit-icon"
              role="img"
              aria-label="Search"
            ></usa-icon>
          </button>
        </div>
      </form>
    `;
  }
}
