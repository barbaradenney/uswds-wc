---
meta:
  title: USARadio
  component: usa-radio
---

# USARadio

A USWDS radio component built with Lit Element.

## Usage

```html
<usa-radio></usa-radio>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/radio/index.js';
```

## Properties

| Property      | Type  | Default | Description          |
| ------------- | ----- | ------- | -------------------- |
| `name`        | `any` | `''`    | Property description |
| `value`       | `any` | `''`    | Property description |
| `checked`     | `any` | `false` | Property description |
| `label`       | `any` | `''`    | Property description |
| `description` | `any` | `''`    | Property description |
| `error`       | `any` | `''`    | Property description |
| `disabled`    | `any` | `false` | Property description |
| `required`    | `any` | `false` | Property description |
| `tile`        | `any` | `false` | Property description |

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

- [Radio - U.S. Web Design System](https://designsystem.digital.gov/components/radio/)
- [Radio Guidance](https://designsystem.digital.gov/components/radio/#guidance)
- [Radio Accessibility](https://designsystem.digital.gov/components/radio/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/radio/usa-radio.test.ts
```

## Storybook

View component examples: [USARadio Stories](http://localhost:6006/?path=/story/components-radio)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
