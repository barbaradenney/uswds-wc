---
meta:
  title: USATimePicker
  component: usa-time-picker
---

# USATimePicker

A USWDS time-picker component built with Lit Element.

## Usage

```html
<usa-time-picker></usa-time-picker>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/time-picker/index.js';
```

## Properties

| Property      | Type  | Default               | Description          |
| ------------- | ----- | --------------------- | -------------------- |
| `value`       | `any` | `''`                  | Property description |
| `name`        | `any` | `'time-picker'`       | Property description |
| `inputId`     | `any` | `'time-picker-input'` | Property description |
| `listId`      | `any` | `'time-picker-list'`  | Property description |
| `label`       | `any` | `'Appointment time'`  | Property description |
| `hint`        | `any` | `''`                  | Property description |
| `placeholder` | `any` | `'hh:mm am'`          | Property description |
| `disabled`    | `any` | `false`               | Property description |
| `required`    | `any` | `false`               | Property description |
| `minTime`     | `any` | `''`                  | Property description |
| `maxTime`     | `any` | `''`                  | Property description |
| `step`        | `any` | `'30'`                | Property description |
| `error`       | `any` | `''`                  | Property description |
| `errorState`  | `any` | `false`               | Property description |

## Events

| Event         | Type        | Description       |
| ------------- | ----------- | ----------------- |
| `time-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Time-picker - U.S. Web Design System](https://designsystem.digital.gov/components/time-picker/)
- [Time-picker Guidance](https://designsystem.digital.gov/components/time-picker/#guidance)
- [Time-picker Accessibility](https://designsystem.digital.gov/components/time-picker/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/time-picker/usa-time-picker.test.ts
```

## Storybook

View component examples: [USATimePicker Stories](http://localhost:6006/?path=/story/components-time-picker)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
