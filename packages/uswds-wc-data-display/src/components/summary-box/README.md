---
meta:
  title: USASummaryBox
  component: usa-summary-box
---

# USASummaryBox

A USWDS summary-box component built with Lit Element.

## Usage

```html
<usa-summary-box></usa-summary-box>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/summary-box/index.js';
```

## Properties

| Property       | Type  | Default | Description          |
| -------------- | ----- | ------- | -------------------- |
| `heading`      | `any` | `''`    | Property description |
| `content`      | `any` | `''`    | Property description |
| `headingLevel` | `any` | `'h3'`  | Property description |

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

- [Summary-box - U.S. Web Design System](https://designsystem.digital.gov/components/summary-box/)
- [Summary-box Guidance](https://designsystem.digital.gov/components/summary-box/#guidance)
- [Summary-box Accessibility](https://designsystem.digital.gov/components/summary-box/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/summary-box/usa-summary-box.test.ts
```

## Storybook

View component examples: [USASummaryBox Stories](http://localhost:6006/?path=/story/components-summary-box)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
