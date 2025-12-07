---
meta:
  title: USATextInput
  component: usa-text-input
---

# USATextInput

A USWDS text-input component built with Lit Element.

## Usage

```html
<usa-text-input></usa-text-input>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/text-input/index.js';
```

## Properties

| Property       | Type    | Default | Description          |
| -------------- | ------- | ------- | -------------------- | -------------------- | ------- | ------ | -------- | -------------------- | ---- | ------ | ---- | -------------------- |
| `type`         | `'text' | 'email' | 'password'           | 'number'             | 'tel'   | 'url'` | `'text'` | Property description |
| `name`         | `any`   | `''`    | Property description |
| `value`        | `any`   | `''`    | Property description |
| `placeholder`  | `any`   | `''`    | Property description |
| `label`        | `any`   | `''`    | Property description |
| `hint`         | `any`   | `''`    | Property description |
| `error`        | `any`   | `''`    | Property description |
| `width`        | `''     | '2xs'   | 'xs'                 | 'sm'                 | 'small' | 'md'   | 'medium' | 'lg'                 | 'xl' | '2xl'` | `''` | Property description |
| `disabled`     | `any`   | `false` | Property description |
| `required`     | `any`   | `false` | Property description |
| `readonly`     | `any`   | `false` | Property description |
| `autocomplete` | `any`   | `''`    | Property description |
| `pattern`      | `any`   | `''`    | Property description |
| `maxlength`    | `number | null`   | `null`               | Property description |
| `minlength`    | `number | null`   | `null`               | Property description |
| `compact`      | `any`   | `false` | Property description |

## Events

| Event    | Type        | Description       |
| -------- | ----------- | ----------------- |
| `input`  | CustomEvent | Event description |
| `change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Text-input - U.S. Web Design System](https://designsystem.digital.gov/components/text-input/)
- [Text-input Guidance](https://designsystem.digital.gov/components/text-input/#guidance)
- [Text-input Accessibility](https://designsystem.digital.gov/components/text-input/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/text-input/usa-text-input.test.ts
```

## Storybook

View component examples: [USATextInput Stories](http://localhost:6006/?path=/story/components-text-input)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
