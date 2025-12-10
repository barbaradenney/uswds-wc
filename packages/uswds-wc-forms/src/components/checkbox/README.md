---
meta:
  title: USACheckbox
  component: usa-checkbox
---

# USACheckbox

A USWDS checkbox component built with Lit Element.

## Usage

```html
<usa-checkbox></usa-checkbox>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/checkbox/index.js';
```

## Properties

| Property        | Type  | Default | Description          |
| --------------- | ----- | ------- | -------------------- |
| `name`          | `any` | `''`    | Property description |
| `value`         | `any` | `''`    | Property description |
| `checked`       | `any` | `false` | Property description |
| `label`         | `any` | `''`    | Property description |
| `description`   | `any` | `''`    | Property description |
| `error`         | `any` | `''`    | Property description |
| `disabled`      | `any` | `false` | Property description |
| `required`      | `any` | `false` | Property description |
| `indeterminate` | `any` | `false` | Property description |
| `tile`          | `any` | `false` | Property description |
| `compact`       | `any` | `false` | Property description |

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

- [Checkbox - U.S. Web Design System](https://designsystem.digital.gov/components/checkbox/)
- [Checkbox Guidance](https://designsystem.digital.gov/components/checkbox/#guidance)
- [Checkbox Accessibility](https://designsystem.digital.gov/components/checkbox/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/checkbox/usa-checkbox.test.ts
```

## Storybook

View component examples: [USACheckbox Stories](http://localhost:6006/?path=/story/components-checkbox)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
