---
meta:
  title: USAMemorableDate
  component: usa-memorable-date
---

# USAMemorableDate

A USWDS memorable-date component built with Lit Element.

## Usage

```html
<usa-memorable-date></usa-memorable-date>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/memorable-date/index.js';
```

## Properties

| Property   | Type  | Default            | Description          |
| ---------- | ----- | ------------------ | -------------------- |
| `month`    | `any` | `''`               | Property description |
| `day`      | `any` | `''`               | Property description |
| `year`     | `any` | `''`               | Property description |
| `name`     | `any` | `'memorable-date'` | Property description |
| `label`    | `any` | `'Date'`           | Property description |
| `hint`     | `any` | `''`               | Property description |
| `disabled` | `any` | `false`            | Property description |
| `required` | `any` | `false`            | Property description |

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

- [Memorable-date - U.S. Web Design System](https://designsystem.digital.gov/components/memorable-date/)
- [Memorable-date Guidance](https://designsystem.digital.gov/components/memorable-date/#guidance)
- [Memorable-date Accessibility](https://designsystem.digital.gov/components/memorable-date/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/memorable-date/usa-memorable-date.test.ts
```

## Storybook

View component examples: [USAMemorableDate Stories](http://localhost:6006/?path=/story/components-memorable-date)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
