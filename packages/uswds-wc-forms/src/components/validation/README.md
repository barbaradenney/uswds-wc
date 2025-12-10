---
meta:
  title: USAValidation
  component: usa-validation
---

# USAValidation

A USWDS validation component built with Lit Element.

## Usage

```html
<usa-validation></usa-validation>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/validation/index.js';
```

## Properties

| Property           | Type               | Default                   | Description          |
| ------------------ | ------------------ | ------------------------- | -------------------- | --------- | -------------------- |
| `value`            | `any`              | `''`                      | Property description |
| `label`            | `any`              | `'Input with validation'` | Property description |
| `hint`             | `any`              | `''`                      | Property description |
| `name`             | `any`              | `'validation-input'`      | Property description |
| `inputType`        | `'input'           | 'textarea'                | 'select'`            | `'input'` | Property description |
| `type`             | `any`              | `'text'`                  | Property description |
| `options`          | `{ value: string`  | ``                        | Property description |
| `rows`             | `any`              | `3`                       | Property description |
| `placeholder`      | `any`              | `''`                      | Property description |
| `disabled`         | `any`              | `false`                   | Property description |
| `readonly`         | `any`              | `false`                   | Property description |
| `rules`            | `ValidationRule[]` | `[]`                      | Property description |
| `errors`           | `string[]`         | `[]`                      | Property description |
| `validateOnInput`  | `any`              | `true`                    | Property description |
| `validateOnBlur`   | `any`              | `true`                    | Property description |
| `showSuccessState` | `any`              | `true`                    | Property description |
| `message`          | `any`              | `''`                      | Property description |
| `valid`            | `any`              | `true`                    | Property description |

## Events

| Event               | Type        | Description       |
| ------------------- | ----------- | ----------------- |
| `validation-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Validation - U.S. Web Design System](https://designsystem.digital.gov/components/validation/)
- [Validation Guidance](https://designsystem.digital.gov/components/validation/#guidance)
- [Validation Accessibility](https://designsystem.digital.gov/components/validation/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/validation/usa-validation.test.ts
```

## Storybook

View component examples: [USAValidation Stories](http://localhost:6006/?path=/story/components-validation)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
