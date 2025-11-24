import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './index.js';
import type {
  USALanguageSelectorPattern,
  LanguageOption,
} from './usa-language-selector-pattern.js';

const meta: Meta<USALanguageSelectorPattern> = {
  title: 'Patterns/Language Selection',
  component: 'usa-language-selector-pattern',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Language Selection Pattern

**USWDS Pattern for helping users select their preferred language.**

## Pattern vs Component

- **Component** (\`usa-language-selector\`): Atomic UI for selecting languages
- **Pattern** (\`usa-language-selector-pattern\`): Orchestrates component + document state + persistence

## Pattern Responsibilities

1. **Document-level language management** - Updates \`html[lang]\` attribute
2. **Preference persistence** - Saves selection to localStorage (optional)
3. **Initialization** - Restores language from storage/document on load
4. **Pattern-level events** - Provides higher-level workflow events

## When to Use This Pattern

Use this pattern when you need:
- Document language state management
- Language preference persistence
- Full-page language switching workflow
- Integration with i18n systems

Use the component directly when you only need:
- UI for language selection
- Custom language change handling
- Integration with existing state management

## USWDS Pattern Reference

https://designsystem.digital.gov/patterns/select-a-language/
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['two-languages', 'dropdown', 'unstyled'],
      description: 'Display variant of the language selector',
    },
    small: {
      control: 'boolean',
      description: 'Use compact size (dropdown only)',
    },
    buttonText: {
      control: 'text',
      description: 'Text for dropdown button',
    },
    persistPreference: {
      control: 'boolean',
      description: 'Save language preference to localStorage',
    },
    storageKey: {
      control: 'text',
      description: 'LocalStorage key for persisting preference',
    },
    updateDocumentLang: {
      control: 'boolean',
      description: 'Update document html[lang] attribute',
    },
  },
  args: {
    variant: 'two-languages',
    small: false,
    buttonText: 'Languages',
    persistPreference: false,
    storageKey: 'uswds-language-preference',
    updateDocumentLang: true,
  },
};

export default meta;
type Story = StoryObj<USALanguageSelectorPattern>;

// Common language sets
const multipleLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

/**
 * Default pattern with two languages and no persistence
 */
export const Default: Story = {
  render: (args) => {
    // Handler to show pattern events in Storybook Actions panel
    const handlePatternLanguageChange = (e: CustomEvent) => {
      console.log('Pattern Language Change:', e.detail);
      // Update display
      const display = document.getElementById('pattern-state-display');
      if (display) {
        display.innerHTML = `
          <strong>Current Language:</strong> ${e.detail.code}<br>
          <strong>Document Lang:</strong> ${e.detail.documentLang}<br>
          <strong>Persisted:</strong> ${e.detail.persisted}
        `;
      }
    };

    const handlePatternReady = (e: CustomEvent) => {
      console.log('Pattern Ready:', e.detail);
    };

    return html`
      <usa-language-selector-pattern
        variant="${args.variant}"
        ?small="${args.small}"
        button-text="${args.buttonText}"
        ?persist-preference="${args.persistPreference}"
        storage-key="${args.storageKey}"
        ?update-document-lang="${args.updateDocumentLang}"
        @pattern-language-change="${handlePatternLanguageChange}"
        @pattern-ready="${handlePatternReady}"
      ></usa-language-selector-pattern>

      <div style="margin-top: 2rem; padding: 1rem; background: #f0f0f0; border-radius: 4px;">
        <h4 style="margin-top: 0;">Pattern State:</h4>
        <div id="pattern-state-display">
          <em>Select a language to see state changes</em>
        </div>
        <p style="margin-bottom: 0; font-size: 0.875rem; color: #71767a;">
          Check browser console for pattern-level events
        </p>
      </div>
    `;
  },
};

/**
 * Pattern with persistence enabled - language preference saved to localStorage
 */
export const WithPersistence: Story = {
  args: {
    variant: 'dropdown',
    persistPreference: true,
  },
  render: (args) => {
    const pattern = html`
      <usa-language-selector-pattern
        variant="${args.variant}"
        ?persist-preference="${args.persistPreference}"
        storage-key="${args.storageKey}"
        @pattern-language-change="${(e: CustomEvent) => {
          console.log('Language persisted to localStorage:', e.detail);
        }}"
      ></usa-language-selector-pattern>
    `;

    return html`
      ${pattern}

      <div
        style="margin-top: 2rem; padding: 1rem; background: #e7f6f8; border-left: 4px solid #00bde3; border-radius: 4px;"
      >
        <h4 style="margin-top: 0;">Persistence Enabled</h4>
        <p style="margin-bottom: 0;">
          Your language selection is saved to localStorage and will be restored when you reload the
          page.
        </p>
        <button
          style="margin-top: 1rem;"
          class="usa-button usa-button--secondary"
          @click="${() => {
            localStorage.removeItem(args.storageKey);
            alert('Persisted preference cleared! Reload page to see default language.');
          }}"
        >
          Clear Saved Preference
        </button>
      </div>
    `;
  },
};

/**
 * Dropdown variant with multiple languages
 */
export const DropdownVariant: Story = {
  args: {
    variant: 'dropdown',
  },
  render: (args) => {
    // Set custom languages
    setTimeout(() => {
      const pattern = document.querySelector('usa-language-selector-pattern');
      if (pattern) {
        (pattern as any).setLanguages(multipleLanguages);
      }
    }, 0);

    return html`
      <usa-language-selector-pattern
        variant="${args.variant}"
        button-text="${args.buttonText}"
      ></usa-language-selector-pattern>

      <div
        style="margin-top: 2rem; padding: 1rem; background: #fef0e6; border-left: 4px solid #ffbc78; border-radius: 4px;"
      >
        <h4 style="margin-top: 0;">Dropdown Variant</h4>
        <p style="margin-bottom: 0;">
          Use dropdown variant for 3+ languages. This example shows 7 languages.
        </p>
      </div>
    `;
  },
};

/**
 * Small variant for compact layouts
 */
export const SmallVariant: Story = {
  args: {
    variant: 'dropdown',
    small: true,
  },
  render: (args) => html`
    <div
      style="display: flex; align-items: center; gap: 1rem; background: #f0f0f0; padding: 0.5rem;"
    >
      <span style="font-size: 0.875rem;">Compact header:</span>
      <usa-language-selector-pattern
        variant="${args.variant}"
        ?small="${args.small}"
        button-text="Lang"
      ></usa-language-selector-pattern>
    </div>

    <div
      style="margin-top: 2rem; padding: 1rem; background: #f1f3f6; border-left: 4px solid #565c65; border-radius: 4px;"
    >
      <h4 style="margin-top: 0;">Small Variant</h4>
      <p style="margin-bottom: 0;">
        Use the small variant when space is limited, such as in compact headers or mobile layouts.
      </p>
    </div>
  `,
};

/**
 * Pattern with custom event handling for application integration
 */
export const ApplicationIntegration: Story = {
  args: {
    variant: 'dropdown',
    persistPreference: true,
  },
  render: (args) => {
    const handleLanguageChange = (e: CustomEvent) => {
      const { code, language, previousCode } = e.detail;

      // Simulate application-level actions
      console.log(`🌍 Application: Language changed from ${previousCode} to ${code}`);

      // Example: Load translated content
      console.log(`📥 Application: Loading ${language.name} content...`);

      // Example: Update analytics
      console.log(`📊 Analytics: Language switch tracked`);

      // Update UI feedback
      const feedback = document.getElementById('app-feedback');
      if (feedback) {
        feedback.innerHTML = `
          <div class="usa-alert usa-alert--success usa-alert--slim">
            <div class="usa-alert__body">
              <p class="usa-alert__text">
                Content loaded in <strong>${language.nativeName}</strong>
              </p>
            </div>
          </div>
        `;
      }
    };

    return html`
      <usa-language-selector-pattern
        variant="${args.variant}"
        ?persist-preference="${args.persistPreference}"
        @pattern-language-change="${handleLanguageChange}"
      ></usa-language-selector-pattern>

      <div id="app-feedback" style="margin-top: 1rem;"></div>

      <div style="margin-top: 2rem; padding: 1rem; background: #f1f3f6; border-radius: 4px;">
        <h4 style="margin-top: 0;">Application Integration Example</h4>
        <p>This example shows how to integrate the pattern with your application:</p>
        <ul>
          <li>Listen to <code>pattern-language-change</code> event</li>
          <li>Load translated content</li>
          <li>Update analytics</li>
          <li>Provide user feedback</li>
        </ul>
        <p style="margin-bottom: 0; font-size: 0.875rem; color: #71767a;">
          Check browser console to see simulated application actions
        </p>
      </div>
    `;
  },
};

/**
 * Pattern ready event - shows initial language detection
 */
export const PatternReadyEvent: Story = {
  render: () => {
    // Use requestAnimationFrame to access DOM after render
    requestAnimationFrame(() => {
      const pattern = document.querySelector('usa-language-selector-pattern');
      const display = document.getElementById('ready-state-display');

      if (pattern && display) {
        pattern.addEventListener('pattern-ready', ((e: CustomEvent) => {
          display.innerHTML = `
            <div class="usa-alert usa-alert--info usa-alert--slim">
              <div class="usa-alert__body">
                <p class="usa-alert__text">
                  Pattern initialized with language: <strong>${e.detail.code}</strong>
                  ${e.detail.persisted ? '(restored from localStorage)' : '(default)'}
                </p>
              </div>
            </div>
          `;
          console.log('Pattern Ready Event:', e.detail);
        }) as EventListener);
      }
    });

    return html`
      <usa-language-selector-pattern persist-preference></usa-language-selector-pattern>

      <div id="ready-state-display" style="margin-top: 1rem;"></div>

      <div style="margin-top: 2rem; padding: 1rem; background: #e7f6f8; border-radius: 4px;">
        <h4 style="margin-top: 0;">Pattern Ready Event</h4>
        <p>
          The <code>pattern-ready</code> event fires when the pattern initializes, providing the
          initial language state. This is useful for:
        </p>
        <ul>
          <li>Loading initial translated content</li>
          <li>Configuring i18n systems</li>
          <li>Setting up language-specific behavior</li>
        </ul>
      </div>
    `;
  },
};

/**
 * Programmatic control of the pattern
 */
export const ProgrammaticControl: Story = {
  render: () => {
    const changeToSpanish = () => {
      const pattern = document.querySelector('usa-language-selector-pattern') as any;
      pattern?.changeLanguage('es');
    };

    const changeToEnglish = () => {
      const pattern = document.querySelector('usa-language-selector-pattern') as any;
      pattern?.changeLanguage('en');
    };

    const getCurrentLanguage = () => {
      const pattern = document.querySelector('usa-language-selector-pattern') as any;
      const lang = pattern?.getCurrentLanguage();
      alert('Current language: ' + (lang?.nativeName || '') + ' (' + (lang?.code || '') + ')');
    };

    return html`
      <usa-language-selector-pattern variant="dropdown"></usa-language-selector-pattern>

      <div style="margin-top: 2rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="usa-button" @click="${changeToEnglish}">Change to English</button>
        <button class="usa-button" @click="${changeToSpanish}">Change to Spanish</button>
        <button class="usa-button usa-button--outline" @click="${getCurrentLanguage}">
          Get Current Language
        </button>
      </div>

      <div style="margin-top: 2rem; padding: 1rem; background: #f1f3f6; border-radius: 4px;">
        <h4 style="margin-top: 0;">Programmatic Control</h4>
        <p>The pattern provides a public API for programmatic control:</p>
        <ul>
          <li><code>changeLanguage(code)</code> - Programmatically change language</li>
          <li><code>getCurrentLanguage()</code> - Get current language object</li>
          <li><code>getCurrentLanguageCode()</code> - Get current language code</li>
          <li><code>setLanguages(languages)</code> - Update available languages</li>
          <li><code>clearPersistedPreference()</code> - Clear saved preference</li>
        </ul>
      </div>
    `;
  },
};
