---
meta:
  title: USATooltip
  component: usa-tooltip
---

# USATooltip

A USWDS tooltip component built with Lit Element.

## Usage

```html
<usa-tooltip></usa-tooltip>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/tooltip/index.js';
```

## Properties

| Property   | Type   | Default  | Description          |
| ---------- | ------ | -------- | -------------------- | -------- | ------- | -------------------- |
| `text`     | `any`  | `''`     | Property description |
| `position` | `'top' | 'bottom' | 'left'               | 'right'` | `'top'` | Property description |
| `label`    | `any`  | `''`     | Property description |
| `visible`  | `any`  | `false`  | Property description |
| `classes`  | `any`  | `''`     | Property description |

## Events

| Event          | Type        | Description       |
| -------------- | ----------- | ----------------- |
| `tooltip-show` | CustomEvent | Event description |
| `tooltip-hide` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Tooltip - U.S. Web Design System](https://designsystem.digital.gov/components/tooltip/)
- [Tooltip Guidance](https://designsystem.digital.gov/components/tooltip/#guidance)
- [Tooltip Accessibility](https://designsystem.digital.gov/components/tooltip/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/tooltip/usa-tooltip.test.ts
```

## Storybook

View component examples: [USATooltip Stories](http://localhost:6006/?path=/story/components-tooltip)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
