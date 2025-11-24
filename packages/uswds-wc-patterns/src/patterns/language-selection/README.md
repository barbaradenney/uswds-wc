# Language Selection Pattern

**USWDS pattern for helping users select their preferred language.**

## Overview

The Language Selection Pattern orchestrates the `usa-language-selector` component with document-level language management and optional preference persistence. This pattern implements the [USWDS Select a Language pattern](https://designsystem.digital.gov/patterns/select-a-language/).

### Pattern vs Component

| Aspect       | Component (`usa-language-selector`) | Pattern (`usa-language-selector-pattern`)  |
| ------------ | ----------------------------------- | ------------------------------------------ |
| **Purpose**  | UI for selecting languages          | Document language workflow                 |
| **Scope**    | Visual selector                     | Document state + persistence               |
| **State**    | Selected language                   | Document lang + localStorage               |
| **Events**   | `language-select`                   | `pattern-language-change`, `pattern-ready` |
| **Use Case** | Custom integration                  | Complete language workflow                 |

## When to Use This Pattern

### Use the Pattern When You Need:

- ✅ **Document language management** - Automatic `html[lang]` updates
- ✅ **Preference persistence** - Save user selection to localStorage
- ✅ **Initialization handling** - Restore language on page load
- ✅ **Application integration** - Hook into i18n systems
- ✅ **Complete workflow** - Full language switching experience

### Use the Component Directly When You:

- ❌ Have existing language state management
- ❌ Need custom persistence logic
- ❌ Want fine-grained control over document updates
- ❌ Are integrating with a custom i18n framework

## Installation

```bash
npm install @uswds-wc/patterns
```

## Basic Usage

### Simple Two-Language Pattern

```html
<usa-language-selector-pattern></usa-language-selector-pattern>
```

Default behavior:

- Two languages: English and Spanish
- Updates document `html[lang]` attribute
- No persistence
- Two-language variant (simple toggle)

### With Persistence

```html
<usa-language-selector-pattern
  persist-preference
  storage-key="my-app-language"
></usa-language-selector-pattern>
```

User's language selection is saved to localStorage and restored on subsequent visits.

### Dropdown Variant with Multiple Languages

```html
<usa-language-selector-pattern
  variant="dropdown"
  button-text="Languages"
></usa-language-selector-pattern>

<script>
  const pattern = document.querySelector('usa-language-selector-pattern');
  pattern.setLanguages([
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'zh-Hans', name: 'Chinese', nativeName: '简体中文' },
  ]);
</script>
```

### Small Variant

```html
<usa-language-selector-pattern
  variant="dropdown"
  small
  button-text="Lang"
></usa-language-selector-pattern>
```

Use in compact layouts like mobile headers.

## Properties/Attributes

| Property             | Attribute              | Type                                          | Default                       | Description                  |
| -------------------- | ---------------------- | --------------------------------------------- | ----------------------------- | ---------------------------- |
| `variant`            | `variant`              | `'two-languages' \| 'dropdown' \| 'unstyled'` | `'two-languages'`             | Display variant              |
| `small`              | `small`                | `boolean`                                     | `false`                       | Compact size (dropdown only) |
| `buttonText`         | `button-text`          | `string`                                      | `'Languages'`                 | Dropdown button text         |
| `persistPreference`  | `persist-preference`   | `boolean`                                     | `false`                       | Save to localStorage         |
| `storageKey`         | `storage-key`          | `string`                                      | `'uswds-language-preference'` | localStorage key             |
| `updateDocumentLang` | `update-document-lang` | `boolean`                                     | `true`                        | Update `html[lang]`          |

## Events

### `pattern-language-change`

Fired when user selects a new language.

```javascript
pattern.addEventListener('pattern-language-change', (e) => {
  console.log('Language changed to:', e.detail.code);
  console.log('Previous language:', e.detail.previousCode);
  console.log('Language object:', e.detail.language);
  console.log('Document lang:', e.detail.documentLang);
  console.log('Persisted:', e.detail.persisted);
});
```

**Event Detail:**

```typescript
{
  code: string; // New language code (e.g., 'es')
  language: LanguageOption; // Full language object
  previousCode: string; // Previous language code
  documentLang: string; // Current html[lang] value
  persisted: boolean; // Whether preference was saved
}
```

### `pattern-ready`

Fired when pattern initializes with current language.

```javascript
pattern.addEventListener('pattern-ready', (e) => {
  console.log('Initial language:', e.detail.code);
  console.log('Restored from storage:', e.detail.persisted);
});
```

**Event Detail:**

```typescript
{
  code: string;              // Current language code
  language?: LanguageOption; // Current language object
  documentLang: string;      // Current html[lang] value
  persisted: boolean;        // Whether restored from storage
}
```

## Public API

### Methods

#### `setLanguages(languages: LanguageOption[])`

Set available languages.

```javascript
pattern.setLanguages([
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
]);
```

#### `changeLanguage(code: string)`

Programmatically change language.

```javascript
pattern.changeLanguage('es'); // Switch to Spanish
```

Triggers `pattern-language-change` event.

#### `getCurrentLanguageCode(): string`

Get current language code.

```javascript
const code = pattern.getCurrentLanguageCode(); // 'en'
```

#### `getCurrentLanguage(): LanguageOption | undefined`

Get current language object.

```javascript
const lang = pattern.getCurrentLanguage();
// { code: 'en', name: 'English', nativeName: 'English' }
```

#### `clearPersistedPreference()`

Clear saved language preference from localStorage.

```javascript
pattern.clearPersistedPreference();
```

## Advanced Usage

### Application Integration

```html
<usa-language-selector-pattern
  persist-preference
  @pattern-language-change="${this.handleLanguageChange}"
  @pattern-ready="${this.handlePatternReady}"
></usa-language-selector-pattern>

<script>
  class MyApp {
    handlePatternReady(e) {
      // Initialize app with restored language
      this.loadTranslations(e.detail.code);
      this.configureI18n(e.detail.code);
    }

    handleLanguageChange(e) {
      // Handle language change
      const { code, language, previousCode } = e.detail;

      // Load new translations
      this.loadTranslations(code);

      // Update i18n system
      this.i18n.locale = code;

      // Track analytics
      this.analytics.track('language_change', {
        from: previousCode,
        to: code,
      });

      // Show feedback
      this.showNotification(`Content loaded in ${language.nativeName}`);
    }

    loadTranslations(code) {
      // Load translation files
      import(`./translations/${code}.json`).then((translations) => {
        this.i18n.setTranslations(code, translations);
      });
    }
  }
</script>
```

### React Integration

```jsx
import { useEffect, useRef } from 'react';

function App() {
  const patternRef = useRef(null);

  useEffect(() => {
    const pattern = patternRef.current;

    const handleLanguageChange = (e) => {
      const { code } = e.detail;

      // Update React i18n
      i18n.changeLanguage(code);

      // Update state
      setLanguage(code);
    };

    pattern?.addEventListener('pattern-language-change', handleLanguageChange);

    return () => {
      pattern?.removeEventListener('pattern-language-change', handleLanguageChange);
    };
  }, []);

  return <usa-language-selector-pattern ref={patternRef} persist-preference variant="dropdown" />;
}
```

### Vue Integration

```vue
<template>
  <usa-language-selector-pattern
    ref="pattern"
    persist-preference
    variant="dropdown"
    @pattern-language-change="handleLanguageChange"
  />
</template>

<script>
export default {
  methods: {
    handleLanguageChange(e) {
      const { code } = e.detail;

      // Update Vue i18n
      this.$i18n.locale = code;

      // Update Vuex store
      this.$store.commit('setLanguage', code);
    },
  },
  mounted() {
    // Get initial language
    const pattern = this.$refs.pattern;
    const initialLang = pattern.getCurrentLanguageCode();
    this.$i18n.locale = initialLang;
  },
};
</script>
```

### Server-Side Language Detection

```html
<!-- Server renders initial language from headers/cookies -->
<usa-language-selector-pattern
  persist-preference
  storage-key="user-language"
></usa-language-selector-pattern>

<script>
  // Pattern automatically detects and uses document.documentElement.lang
  // Set by server based on Accept-Language header or cookie
</script>
```

### Custom Storage Implementation

```javascript
// Override localStorage with custom storage
const pattern = document.querySelector('usa-language-selector-pattern');

// Disable built-in persistence
pattern.persistPreference = false;

// Implement custom persistence
pattern.addEventListener('pattern-language-change', (e) => {
  // Save to cookie instead of localStorage
  document.cookie = `language=${e.detail.code}; path=/; max-age=31536000`;

  // Or save to server
  fetch('/api/user/language', {
    method: 'POST',
    body: JSON.stringify({ language: e.detail.code }),
  });
});
```

## Pattern Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Pattern Initialization                                  │
│  ├─ Check localStorage (if persist-preference enabled)      │
│  ├─ Check document.documentElement.lang                     │
│  └─ Use default ('en')                                      │
│                                                              │
│  2. Emit pattern-ready Event                                │
│  └─ Application can initialize with restored language       │
│                                                              │
│  3. User Selects Language                                   │
│  └─ usa-language-selector emits language-select             │
│                                                              │
│  4. Pattern Handles Change                                  │
│  ├─ Update document.documentElement.lang                    │
│  ├─ Save to localStorage (if enabled)                       │
│  └─ Emit pattern-language-change                            │
│                                                              │
│  5. Application Responds                                    │
│  ├─ Load translations                                       │
│  ├─ Update i18n system                                      │
│  ├─ Track analytics                                         │
│  └─ Show user feedback                                      │
└─────────────────────────────────────────────────────────────┘
```

## Accessibility

The pattern inherits all accessibility features from the `usa-language-selector` component:

- ✅ **Keyboard navigation** - Full keyboard support
- ✅ **Screen reader support** - Proper ARIA labels and roles
- ✅ **Language attributes** - Native language names with `lang` attribute
- ✅ **Focus management** - Proper focus handling for dropdown
- ✅ **High contrast support** - USWDS styling compliant

Additional pattern-level accessibility:

- ✅ **Document language** - Updates `html[lang]` for assistive technology
- ✅ **Persistence** - Respects user preference across sessions

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile browsers: ✅ iOS Safari, Chrome Mobile

**LocalStorage requirement:** Persistence feature requires localStorage support (available in all modern browsers).

## Component Dependencies

This pattern uses:

- `usa-language-selector` from `@uswds-wc/navigation`

## Related Resources

- [USWDS Language Selector Pattern](https://designsystem.digital.gov/patterns/select-a-language/)
- [USWDS Language Selector Component](https://designsystem.digital.gov/components/language-selector/)
- [Pattern Development Guide](../../../../docs/PATTERNS_GUIDE.md)
- [Component README](../../../../../uswds-wc-navigation/src/components/language-selector/README.md)

## Testing

See [usa-language-selector-pattern.test.ts](./usa-language-selector-pattern.test.ts) for unit tests.

### Example Tests

```javascript
import { fixture, expect } from '@uswds-wc/test-utils';
import './usa-language-selector-pattern.js';

describe('usa-language-selector-pattern', () => {
  it('updates document lang on language change', async () => {
    const el = await fixture('<usa-language-selector-pattern></usa-language-selector-pattern>');

    el.changeLanguage('es');
    await el.updateComplete;

    expect(document.documentElement.lang).to.equal('es');
  });

  it('persists preference when enabled', async () => {
    const el = await fixture(`
      <usa-language-selector-pattern persist-preference></usa-language-selector-pattern>
    `);

    el.changeLanguage('es');
    await el.updateComplete;

    const stored = localStorage.getItem('uswds-language-preference');
    expect(stored).to.equal('es');
  });
});
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

This project is licensed under the MIT License.
