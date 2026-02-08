---
meta:
  title: USADatePicker
  component: usa-date-picker
---

# USADatePicker

A USWDS date-picker component built with Lit Element.

## Usage

```html
<usa-date-picker></usa-date-picker>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/date-picker/index.js';
```

## Properties

| Property      | Type  | Default               | Description          |
| ------------- | ----- | --------------------- | -------------------- |
| `value`       | `any` | `''`                  | Property description |
| `name`        | `any` | `'date-picker'`       | Property description |
| `inputId`     | `any` | `'date-picker-input'` | Property description |
| `label`       | `any` | `'Date'`              | Property description |
| `hint`        | `any` | `''`                  | Property description |
| `placeholder` | `any` | `'mm/dd/yyyy'`        | Property description |
| `disabled`    | `any` | `false`               | Property description |
| `required`    | `any` | `false`               | Property description |
| `readonly`    | `any` | `false`               | Property description |
| `minDate`     | `any` | `''`                  | Property description |
| `maxDate`     | `any` | `''`                  | Property description |
| `error`       | `any` | `''`                  | Property description |
| `errorState`  | `any` | `false`               | Property description |

## Events

| Event         | Type        | Description       |
| ------------- | ----------- | ----------------- |
| `date-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Date-picker - U.S. Web Design System](https://designsystem.digital.gov/components/date-picker/)
- [Date-picker Guidance](https://designsystem.digital.gov/components/date-picker/#guidance)
- [Date-picker Accessibility](https://designsystem.digital.gov/components/date-picker/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/date-picker/usa-date-picker.test.ts
```

## Storybook

View component examples: [USADatePicker Stories](http://localhost:6006/?path=/story/components-date-picker)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
