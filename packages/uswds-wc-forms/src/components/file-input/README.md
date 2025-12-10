---
meta:
  title: USAFileInput
  component: usa-file-input
---

# USAFileInput

A USWDS file-input component built with Lit Element.

## Usage

```html
<usa-file-input></usa-file-input>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/file-input/index.js';
```

## Properties

| Property        | Type     | Default         | Description          |
| --------------- | -------- | --------------- | -------------------- |
| `name`          | `any`    | `'file-input'`  | Property description |
| `inputId`       | `any`    | `'file-input'`  | Property description |
| `label`         | `any`    | `'Select file'` | Property description |
| `hint`          | `any`    | `''`            | Property description |
| `multiple`      | `any`    | `false`         | Property description |
| `disabled`      | `any`    | `false`         | Property description |
| `required`      | `any`    | `false`         | Property description |
| `accept`        | `any`    | `''`            | Property description |
| `maxFileSize`   | `any`    | `''`            | Property description |
| `selectedFiles` | `File[]` | `[]`            | Property description |

## Events

| Event            | Type | Description |
| ---------------- | ---- | ----------- |
| No custom events |      |             |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [File-input - U.S. Web Design System](https://designsystem.digital.gov/components/file-input/)
- [File-input Guidance](https://designsystem.digital.gov/components/file-input/#guidance)
- [File-input Accessibility](https://designsystem.digital.gov/components/file-input/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/file-input/usa-file-input.test.ts
```

## Storybook

View component examples: [USAFileInput Stories](http://localhost:6006/?path=/story/components-file-input)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
