---
meta:
  title: USASelect
  component: usa-select
---

# USASelect

A USWDS select component built with Lit Element.

## Usage

```html
<usa-select></usa-select>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/select/index.js';
```

## Properties

| Property        | Type                    | Default | Description          |
| --------------- | ----------------------- | ------- | -------------------- |
| `name`          | `any`                   | `''`    | Property description |
| `value`         | `any`                   | `''`    | Property description |
| `label`         | `any`                   | `''`    | Property description |
| `hint`          | `any`                   | `''`    | Property description |
| `error`         | `any`                   | `''`    | Property description |
| `success`       | `any`                   | `''`    | Property description |
| `disabled`      | `any`                   | `false` | Property description |
| `required`      | `any`                   | `false` | Property description |
| `options`       | `Array<{ value: string` | ``      | Property description |
| `defaultOption` | `any`                   | `''`    | Property description |
| `compact`       | `any`                   | `false` | Property description |

## Events

| Event    | Type        | Description       |
| -------- | ----------- | ----------------- |
| `change` | CustomEvent | Event description |
| `input`  | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Select - U.S. Web Design System](https://designsystem.digital.gov/components/select/)
- [Select Guidance](https://designsystem.digital.gov/components/select/#guidance)
- [Select Accessibility](https://designsystem.digital.gov/components/select/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/select/usa-select.test.ts
```

## Storybook

View component examples: [USASelect Stories](http://localhost:6006/?path=/story/components-select)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-06_
