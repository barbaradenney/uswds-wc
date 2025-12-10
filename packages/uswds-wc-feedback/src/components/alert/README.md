---
meta:
  title: USAAlert
  component: usa-alert
---

# USAAlert

A USWDS alert component built with Lit Element.

## Usage

```html
<usa-alert></usa-alert>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/alert/index.js';
```

## Properties

| Property  | Type           | Default  | Description          |
| --------- | -------------- | -------- | -------------------- |
| `variant` | `AlertVariant` | `'info'` | Property description |
| `heading` | `any`          | `''`     | Property description |
| `slim`    | `any`          | `false`  | Property description |
| `noIcon`  | `any`          | `false`  | Property description |
| `text`    | `any`          | `''`     | Property description |

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

- [Alert - U.S. Web Design System](https://designsystem.digital.gov/components/alert/)
- [Alert Guidance](https://designsystem.digital.gov/components/alert/#guidance)
- [Alert Accessibility](https://designsystem.digital.gov/components/alert/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/alert/usa-alert.test.ts
```

## Storybook

View component examples: [USAAlert Stories](http://localhost:6006/?path=/story/components-alert)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
