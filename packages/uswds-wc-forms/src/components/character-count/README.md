---
meta:
  title: USACharacterCount
  component: usa-character-count
---

# USACharacterCount

A USWDS character-count component built with Lit Element.

## Usage

```html
<usa-character-count></usa-character-count>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/character-count/index.js';
```

## Properties

| Property      | Type     | Default                             | Description          |
| ------------- | -------- | ----------------------------------- | -------------------- | -------------------- |
| `value`       | `any`    | `''`                                | Property description |
| `maxlength`   | `any`    | `0`                                 | Property description |
| `label`       | `any`    | `'Text input with character count'` | Property description |
| `hint`        | `any`    | `''`                                | Property description |
| `name`        | `any`    | `'character-count'`                 | Property description |
| `inputType`   | `'input' | 'textarea'`                         | `'textarea'`         | Property description |
| `rows`        | `any`    | `5`                                 | Property description |
| `placeholder` | `any`    | `''`                                | Property description |
| `disabled`    | `any`    | `false`                             | Property description |
| `required`    | `any`    | `false`                             | Property description |
| `readonly`    | `any`    | `false`                             | Property description |
| `error`       | `any`    | `''`                                | Property description |

## Events

| Event                    | Type        | Description       |
| ------------------------ | ----------- | ----------------- |
| `character-count-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Character-count - U.S. Web Design System](https://designsystem.digital.gov/components/character-count/)
- [Character-count Guidance](https://designsystem.digital.gov/components/character-count/#guidance)
- [Character-count Accessibility](https://designsystem.digital.gov/components/character-count/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/character-count/usa-character-count.test.ts
```

## Storybook

View component examples: [USACharacterCount Stories](http://localhost:6006/?path=/story/components-character-count)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
