import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { USWDSBaseComponent } from '@uswds-wc/core';
import { initializeLanguageSelector } from './usa-language-selector-behavior.js';

// Import official USWDS compiled CSS
import '@uswds-wc/core/styles.css';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  href?: string;
}

/**
 * USA Language Selector Web Component
 *
 * Minimal wrapper around USWDS language selector functionality.
 * Uses USWDS-mirrored behavior pattern for 100% behavioral parity.
 *
 * @element usa-language-selector
 * @fires language-select - Dispatched when a language is selected
 * @fires menu-toggle - Dispatched when dropdown menu is toggled
 *
 * @see README.mdx - Complete API documentation, usage examples, and implementation notes
 * @see CHANGELOG.mdx - Component version history and breaking changes
 * @see TESTING.mdx - Testing documentation and coverage reports
 *
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-language-selector/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-language-selector/src/styles/_usa-language-selector.scss
 * @uswds-docs https://designsystem.digital.gov/components/language-selector/
 * @uswds-guidance https://designsystem.digital.gov/components/language-selector/#guidance
 * @uswds-accessibility https://designsystem.digital.gov/components/language-selector/#accessibility
 */
@customElement('usa-language-selector')
export class USALanguageSelector extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: inline-block;
    }
  `;

  @property({ type: String, attribute: 'current-language' })
  currentLanguage = 'en';

  @property({ type: Array })
  languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
  ];

  @property({ type: String })
  variant: 'two-languages' | 'dropdown' | 'unstyled' = 'two-languages';

  @property({ type: String, attribute: 'button-text' })
  buttonText = 'Languages';

  @property({ type: Boolean, reflect: true })
  small = false;

  @state()
  private _isOpen = false;

  // Store cleanup function from behavior
  private cleanup?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('data-web-component-managed', 'true');
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanup?.();
  }

  override async firstUpdated(changedProperties: Map<string, any>) {
    // ARCHITECTURE: Script Tag Pattern
    // USWDS is loaded globally via script tag in .storybook/preview-head.html
    // Components just render HTML - USWDS enhances automatically via window.USWDS

    // ARCHITECTURE: USWDS-Mirrored Behavior Pattern
    // Uses dedicated behavior file (usa-language-selector-behavior.ts) that replicates USWDS source exactly

    super.firstUpdated(changedProperties);

    // Wait for DOM to be fully rendered
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    // Guard against test environment teardown (prevents "document is not defined" in CI)
    if (typeof document === 'undefined') {
      return;
    }

    // Initialize using mirrored USWDS behavior
    // Pass document instead of 'this' to enable click-outside-to-close functionality
    this.cleanup = initializeLanguageSelector(document);
  }

  private handleLanguageSelect(language: LanguageOption, e?: Event) {
    console.log('🌐 Language Selector: Language selected using USWDS pattern:', language.code);

    if (e) {
      e.preventDefault();
    }

    const previousCode = this.currentLanguage;
    this.currentLanguage = language.code;

    // Dispatch language-select event
    this.dispatchEvent(
      new CustomEvent('language-select', {
        detail: {
          language,
          code: language.code,
          previousCode,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Close dropdown if open
    if (this._isOpen) {
      this._isOpen = false;
      this.requestUpdate();
    }

    // If href is provided, navigate to it
    if (language.href && !e?.defaultPrevented) {
      window.location.href = language.href;
    }
  }

  private toggleDropdown(e: Event) {
    e.preventDefault();
    this._isOpen = !this._isOpen;

    this.dispatchEvent(
      new CustomEvent('menu-toggle', {
        detail: {
          isOpen: this._isOpen,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Update aria-expanded on the button
    const button = e.currentTarget as HTMLButtonElement;
    button.setAttribute('aria-expanded', String(this._isOpen));
  }

  private renderTwoLanguages() {
    // For two languages, show a simple toggle button
    const otherLanguage =
      this.languages.find((lang) => lang.code !== this.currentLanguage) || this.languages[0];

    // Handle empty language array
    if (!otherLanguage) {
      return html`<div class="usa-language-container usa-language"></div>`;
    }

    return html`
      <div class="usa-language-container usa-language">
        <button
          type="button"
          class="usa-button usa-button--unstyled"
          @click="${(e: Event) => this.handleLanguageSelect(otherLanguage, e)}"
        >
          <span lang="${otherLanguage.code}" xml:lang="${otherLanguage.code}">
            ${otherLanguage.nativeName}
          </span>
        </button>
      </div>
    `;
  }

  private renderDropdown() {
    const containerClasses = [
      'usa-language-container',
      'usa-language',
      this.small ? 'usa-language--small' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="${containerClasses}">
        <ul class="usa-language__primary usa-accordion">
          <li class="usa-language__primary-item">
            <button
              type="button"
              class="usa-button usa-language__link usa-language-selector__button"
              aria-expanded="${this._isOpen}"
              aria-haspopup="true"
              aria-controls="language-options"
              @click="${this.toggleDropdown}"
            >
              ${this.buttonText}
            </button>
            <ul id="language-options" class="usa-language__submenu" ?hidden=${!this._isOpen}>
              ${this.languages.map((language) => this.renderDropdownLanguageItem(language))}
            </ul>
          </li>
        </ul>
      </div>
    `;
  }

  private renderUnstyled() {
    // Unstyled list of language links
    return html`
      <div class="usa-language-container usa-language--unstyled">
        <ul class="usa-language__primary">
          ${this.languages.map((language) => this.renderUnstyledLanguageItem(language))}
        </ul>
      </div>
    `;
  }

  private renderDropdownLanguageItem(language: LanguageOption) {
    return html`
      <li class="usa-language__submenu-item">
        <a
          href="${language.href || '#'}"
          @click="${(e: Event) => this.handleLanguageSelect(language, e)}"
          class="${language.code === this.currentLanguage ? 'usa-current' : ''}"
        >
          <span lang="${language.code}" xml:lang="${language.code}">
            ${language.nativeName !== language.name
              ? this.renderLanguageNameWithNative(language)
              : language.name}
          </span>
        </a>
      </li>
    `;
  }

  private renderLanguageNameWithNative(language: LanguageOption) {
    return html`<strong>${language.nativeName}</strong> ${language.name}`;
  }

  private renderUnstyledLanguageItem(language: LanguageOption) {
    return html`
      <li class="usa-language__primary-item">
        <a
          href="${language.href || '#'}"
          @click="${(e: Event) => this.handleLanguageSelect(language, e)}"
          class="${language.code === this.currentLanguage ? 'usa-current' : ''}"
        >
          <span lang="${language.code}" xml:lang="${language.code}"> ${language.nativeName} </span>
        </a>
      </li>
    `;
  }

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override render() {
    // Automatically choose variant based on number of languages if not specified
    let effectiveVariant = this.variant;
    if (this.variant === 'two-languages' && this.languages.length > 2) {
      effectiveVariant = 'dropdown';
    }

    switch (effectiveVariant) {
      case 'two-languages':
        return this.renderTwoLanguages();
      case 'dropdown':
        return this.renderDropdown();
      case 'unstyled':
        return this.renderUnstyled();
      default:
        return this.renderTwoLanguages();
    }
  }

  // Public API methods
  setCurrentLanguage(code: string) {
    const language = this.languages.find((lang) => lang.code === code);
    if (language) {
      this.handleLanguageSelect(language);
    } else {
      // If language not found, still update currentLanguage property for tests
      this.currentLanguage = code;
    }
  }

  getCurrentLanguage(): LanguageOption | undefined {
    return this.languages.find((lang) => lang.code === this.currentLanguage);
  }

  addLanguage(language: LanguageOption) {
    if (!this.languages.find((lang) => lang.code === language.code)) {
      this.languages = [...this.languages, language];
      this.requestUpdate();
    }
  }

  removeLanguage(code: string) {
    this.languages = this.languages.filter((lang) => lang.code !== code);
    if (this.currentLanguage === code && this.languages.length > 0) {
      this.currentLanguage = this.languages[0].code;
    }
    this.requestUpdate();
  }

  openDropdown() {
    if (this.variant === 'dropdown') {
      this._isOpen = true;
      this.requestUpdate();
    }
  }

  closeDropdown() {
    this._isOpen = false;
    this.requestUpdate();
  }

  toggleDropdownState() {
    this._isOpen = !this._isOpen;
    this.requestUpdate();
  }
}
