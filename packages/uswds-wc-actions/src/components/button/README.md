---
meta:
  title: USAButton
  component: usa-button
---

# USAButton

A USWDS button component built with Lit Element.

## Usage

```html
<usa-button></usa-button>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/button/index.js';
```

## Properties

| Property   | Type            | Default     | Description          |
| ---------- | --------------- | ----------- | -------------------- | ---------- | -------------------- |
| `variant`  | `ButtonVariant` | `'primary'` | Property description |
| `size`     | `'small'        | 'medium'    | 'big'`               | `'medium'` | Property description |
| `disabled` | `any`           | `false`     | Property description |
| `type`     | `ButtonType`    | `'button'`  | Property description |
| `text`     | `any`           | `''`        | Property description |

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

- [Button - U.S. Web Design System](https://designsystem.digital.gov/components/button/)
- [Button Guidance](https://designsystem.digital.gov/components/button/#guidance)
- [Button Accessibility](https://designsystem.digital.gov/components/button/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/button/usa-button.test.ts
```

## Storybook

View component examples: [USAButton Stories](http://localhost:6006/?path=/story/components-button)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-20_
