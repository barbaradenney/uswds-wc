import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import USWDS core styles
import '@uswds-wc/core/styles.css';

// Import language-selector component
import '@uswds-wc/navigation';

/**
 * Language option interface for pattern consumers
 */
export interface LanguageOption {
  code: string;
  name: string;
  nativeName?: string;
}

/**
 * USA Language Selector Pattern
 *
 * USWDS pattern for helping users select their preferred language.
 * Orchestrates the usa-language-selector component with document-level language management.
 *
 * **Pattern Responsibilities:**
 * - Manage document-level language state (html[lang] attribute)
 * - Persist language preference (localStorage/cookies)
 * - Coordinate language changes across the application
 * - Provide pattern-level events for application integration
 *
 * **Component Composition:**
 * Uses `<usa-language-selector>` component from @uswds-wc/navigation
 *
 * **Architecture Note:**
 * Uses Light DOM (no Shadow DOM) to allow USWDS styles to cascade properly to child components.
 * Patterns orchestrate components without encapsulation.
 *
 * @element usa-language-selector-pattern
 *
 * @fires {CustomEvent} pattern-language-change - Fired when user selects a new language
 * @fires {CustomEvent} pattern-ready - Fired when pattern initializes with current language
 *
 * @example
 * ```html
 * <usa-language-selector-pattern
 *   variant="dropdown"
 *   persist-preference
 * ></usa-language-selector-pattern>
 * ```
 *
 * @example With custom languages
 * ```html
 * <usa-language-selector-pattern
 *   variant="dropdown"
 *   persist-preference
 *   storage-key="app-language"
 * ></usa-language-selector-pattern>
 * ```
 *
 * @uswds-pattern https://designsystem.digital.gov/patterns/select-a-language/
 * @see docs/PATTERNS_GUIDE.md - Pattern development guidelines
 */
@customElement('usa-language-selector-pattern')
export class USALanguageSelectorPattern extends LitElement {
  // Use Light DOM for patterns - no Shadow DOM encapsulation
  protected override createRenderRoot() {
    return this;
  }

  /**
   * Variant of the language selector
   */
  @property({ type: String })
  variant: 'two-languages' | 'dropdown' | 'unstyled' = 'two-languages';

  /**
   * Whether to show the small variant
   */
  @property({ type: Boolean })
  small = false;

  /**
   * Text for the dropdown button
   */
  @property({ type: String, attribute: 'button-text' })
  buttonText = 'Languages';

  /**
   * Whether to persist language preference to localStorage
   */
  @property({ type: Boolean, attribute: 'persist-preference' })
  persistPreference = false;

  /**
   * LocalStorage key for persisting language preference
   */
  @property({ type: String, attribute: 'storage-key' })
  storageKey = 'uswds-language-preference';

  /**
   * Whether to update document html[lang] attribute
   */
  @property({ type: Boolean, attribute: 'update-document-lang' })
  updateDocumentLang = true;

  /**
   * Current selected language code
   */
  @state()
  private currentLanguage = 'en';

  /**
   * Available languages
   */
  @state()
  private languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
  ];

  override connectedCallback() {
    super.connectedCallback();
    this.initializeLanguagePreference();
  }

  /**
   * Initialize language preference from:
   * 1. Persisted preference (if enabled)
   * 2. Document html[lang] attribute
   * 3. Default (en)
   */
  private initializeLanguagePreference() {
    let initialLanguage: string | undefined;
    let fromStorage = false;

    // Priority 1: Check localStorage if persistence enabled
    if (this.persistPreference) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        initialLanguage = stored;
        fromStorage = true;
      }
    }

    // Priority 2: Check document lang attribute (only if not from storage)
    if (!fromStorage && !initialLanguage) {
      const docLang = document.documentElement.lang;
      if (docLang) {
        initialLanguage = docLang;
      }
    }

    // Priority 3: Use default
    if (!initialLanguage) {
      initialLanguage = this.currentLanguage; // 'en'
    }

    this.currentLanguage = initialLanguage;

    // Update document lang if needed
    if (this.updateDocumentLang && document.documentElement.lang !== initialLanguage) {
      document.documentElement.lang = initialLanguage;
    }
  }

  /**
   * Emit ready event after first render
   */
  override firstUpdated(changedProperties: Map<string, any>) {
    super.firstUpdated(changedProperties);
    this.dispatchPatternReady();
  }

  /**
   * Handle language selection from child component
   */
  private handleLanguageSelect(e: CustomEvent) {
    const { code, language } = e.detail;

    this.currentLanguage = code;

    // Update document html[lang] attribute
    if (this.updateDocumentLang) {
      document.documentElement.lang = code;
    }

    // Persist preference if enabled
    if (this.persistPreference) {
      localStorage.setItem(this.storageKey, code);
    }

    // Dispatch pattern-level event
    this.dispatchEvent(
      new CustomEvent('pattern-language-change', {
        detail: {
          code,
          language,
          previousCode: e.detail.previousCode,
          documentLang: document.documentElement.lang,
          persisted: this.persistPreference,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Dispatch pattern-ready event with current language
   */
  private dispatchPatternReady() {
    const currentLang = this.languages.find((lang) => lang.code === this.currentLanguage);

    this.dispatchEvent(
      new CustomEvent('pattern-ready', {
        detail: {
          code: this.currentLanguage,
          language: currentLang,
          documentLang: document.documentElement.lang,
          persisted: this.persistPreference,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Render the pattern
   */
  override render() {
    return html`
      <usa-language-selector
        variant="${this.variant}"
        ?small="${this.small}"
        button-text="${this.buttonText}"
        current-language="${this.currentLanguage}"
        .languages="${this.languages}"
        @language-select="${this.handleLanguageSelect}"
      ></usa-language-selector>
    `;
  }

  /**
   * Public API: Set available languages
   */
  setLanguages(
    languages: Array<{ code: string; name: string; nativeName: string; href?: string }>
  ) {
    this.languages = languages;
  }

  /**
   * Public API: Get current language code
   */
  getCurrentLanguageCode(): string {
    return this.currentLanguage;
  }

  /**
   * Public API: Get current language object
   */
  getCurrentLanguage() {
    return this.languages.find((lang) => lang.code === this.currentLanguage);
  }

  /**
   * Public API: Programmatically change language
   */
  changeLanguage(code: string) {
    const language = this.languages.find((lang) => lang.code === code);
    if (language) {
      this.handleLanguageSelect(
        new CustomEvent('language-select', {
          detail: { code, language, previousCode: this.currentLanguage },
        })
      );
    }
  }

  /**
   * Public API: Clear persisted preference
   */
  clearPersistedPreference() {
    if (this.persistPreference) {
      localStorage.removeItem(this.storageKey);
    }
  }

  /**
   * Public API: Validate language selection
   * Returns true if current language is valid (exists in languages array)
   */
  validateLanguageSelection(): boolean {
    if (!this.currentLanguage) {
      return false;
    }

    // Verify current language exists in available languages
    const languageExists = this.languages.some((lang) => lang.code === this.currentLanguage);
    return languageExists;
  }
}
