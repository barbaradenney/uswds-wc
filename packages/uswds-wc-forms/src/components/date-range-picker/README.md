---
meta:
  title: USADateRangePicker
  component: usa-date-range-picker
---

# USADateRangePicker

A USWDS date-range-picker component built with Lit Element.

## Usage

```html
<usa-date-range-picker></usa-date-range-picker>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/date-range-picker/index.js';
```

## Properties

| Property       | Type  | Default               | Description          |
| -------------- | ----- | --------------------- | -------------------- |
| `startDate`    | `any` | `''`                  | Property description |
| `endDate`      | `any` | `''`                  | Property description |
| `name`         | `any` | `'date-range-picker'` | Property description |
| `startInputId` | `any` | `'start-date-input'`  | Property description |
| `endInputId`   | `any` | `'end-date-input'`    | Property description |
| `label`        | `any` | `'Date range'`        | Property description |
| `startLabel`   | `any` | `'Start date'`        | Property description |
| `endLabel`     | `any` | `'End date'`          | Property description |
| `hint`         | `any` | `''`                  | Property description |
| `placeholder`  | `any` | `'mm/dd/yyyy'`        | Property description |
| `disabled`     | `any` | `false`               | Property description |
| `required`     | `any` | `false`               | Property description |
| `minDate`      | `any` | `''`                  | Property description |
| `maxDate`      | `any` | `''`                  | Property description |
| `error`        | `any` | `''`                  | Property description |

## Events

| Event               | Type        | Description       |
| ------------------- | ----------- | ----------------- |
| `date-range-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Date-range-picker - U.S. Web Design System](https://designsystem.digital.gov/components/date-range-picker/)
- [Date-range-picker Guidance](https://designsystem.digital.gov/components/date-range-picker/#guidance)
- [Date-range-picker Accessibility](https://designsystem.digital.gov/components/date-range-picker/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/date-range-picker/usa-date-range-picker.test.ts
```

## Storybook

View component examples: [USADateRangePicker Stories](http://localhost:6006/?path=/story/components-date-range-picker)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-06_
