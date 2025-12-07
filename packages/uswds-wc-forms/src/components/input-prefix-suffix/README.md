---
meta:
  title: USAInputPrefixSuffix
  component: usa-input-prefix-suffix
---

# USAInputPrefixSuffix

A USWDS input-prefix-suffix component built with Lit Element.

## Usage

```html
<usa-input-prefix-suffix></usa-input-prefix-suffix>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/input-prefix-suffix/index.js';
```

## Properties

| Property       | Type  | Default                 | Description          |
| -------------- | ----- | ----------------------- | -------------------- |
| `value`        | `any` | `''`                    | Property description |
| `name`         | `any` | `'input-prefix-suffix'` | Property description |
| `inputId`      | `any` | `'input-prefix-suffix'` | Property description |
| `label`        | `any` | `'Input'`               | Property description |
| `hint`         | `any` | `''`                    | Property description |
| `placeholder`  | `any` | `''`                    | Property description |
| `suffix`       | `any` | `''`                    | Property description |
| `prefixIcon`   | `any` | `''`                    | Property description |
| `suffixIcon`   | `any` | `''`                    | Property description |
| `disabled`     | `any` | `false`                 | Property description |
| `required`     | `any` | `false`                 | Property description |
| `readonly`     | `any` | `false`                 | Property description |
| `type`         | `any` | `'text'`                | Property description |
| `autocomplete` | `any` | `''`                    | Property description |
| `error`        | `any` | `''`                    | Property description |

## Events

| Event          | Type        | Description       |
| -------------- | ----------- | ----------------- |
| `input-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Input-prefix-suffix - U.S. Web Design System](https://designsystem.digital.gov/components/input-prefix-suffix/)
- [Input-prefix-suffix Guidance](https://designsystem.digital.gov/components/input-prefix-suffix/#guidance)
- [Input-prefix-suffix Accessibility](https://designsystem.digital.gov/components/input-prefix-suffix/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/input-prefix-suffix/usa-input-prefix-suffix.test.ts
```

## Storybook

View component examples: [USAInputPrefixSuffix Stories](http://localhost:6006/?path=/story/components-input-prefix-suffix)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
