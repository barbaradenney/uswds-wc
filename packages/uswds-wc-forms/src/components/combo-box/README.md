---
meta:
  title: USAComboBox
  component: usa-combo-box
---

# USAComboBox

A USWDS combo-box component built with Lit Element.

## Usage

```html
<usa-combo-box></usa-combo-box>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/combo-box/index.js';
```

## Properties

| Property           | Type               | Default                    | Description          |
| ------------------ | ------------------ | -------------------------- | -------------------- |
| `value`            | `any`              | `''`                       | Property description |
| `name`             | `any`              | `''`                       | Property description |
| `inputId`          | `any`              | `'uswds-combo-box-select'` | Property description |
| `selectId`         | `any`              | `''`                       | Property description |
| `label`            | `any`              | `''`                       | Property description |
| `hint`             | `any`              | `''`                       | Property description |
| `placeholder`      | `any`              | `''`                       | Property description |
| `disabled`         | `any`              | `false`                    | Property description |
| `required`         | `any`              | `false`                    | Property description |
| `error`            | `any`              | `''`                       | Property description |
| `errorState`       | `any`              | `false`                    | Property description |
| `options`          | `ComboBoxOption[]` | `[]`                       | Property description |
| `disableFiltering` | `any`              | `false`                    | Property description |

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

- [Combo-box - U.S. Web Design System](https://designsystem.digital.gov/components/combo-box/)
- [Combo-box Guidance](https://designsystem.digital.gov/components/combo-box/#guidance)
- [Combo-box Accessibility](https://designsystem.digital.gov/components/combo-box/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/combo-box/usa-combo-box.test.ts
```

## Storybook

View component examples: [USAComboBox Stories](http://localhost:6006/?path=/story/components-combo-box)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
