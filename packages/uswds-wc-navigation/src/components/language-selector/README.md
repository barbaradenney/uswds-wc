---
meta:
  title: USALanguageSelector
  component: usa-language-selector
---

# USALanguageSelector

A USWDS language-selector component built with Lit Element.

## Usage

```html
<usa-language-selector></usa-language-selector>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/language-selector/index.js';
```

## Properties

| Property          | Type               | Default | Description          |
| ----------------- | ------------------ | ------- | -------------------- |
| `currentLanguage` | `any`              | `'en'`  | Property description |
| `languages`       | `LanguageOption[]` | `[      |

    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },

]`| Property description |
|`variant`|`'two-languages' | 'dropdown' | 'unstyled'`|`'two-languages'`| Property description |
|`buttonText`|`any`|`'Languages'`| Property description |
|`small`|`any`|`false` | Property description |

## Events

| Event             | Type        | Description       |
| ----------------- | ----------- | ----------------- |
| `language-select` | CustomEvent | Event description |
| `menu-toggle`     | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Language-selector - U.S. Web Design System](https://designsystem.digital.gov/components/language-selector/)
- [Language-selector Guidance](https://designsystem.digital.gov/components/language-selector/#guidance)
- [Language-selector Accessibility](https://designsystem.digital.gov/components/language-selector/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/language-selector/usa-language-selector.test.ts
```

## Storybook

View component examples: [USALanguageSelector Stories](http://localhost:6006/?path=/story/components-language-selector)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
