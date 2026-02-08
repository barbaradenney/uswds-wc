---
meta:
  title: USAModal
  component: usa-modal
---

# USAModal

A USWDS modal component built with Lit Element.

## Usage

```html
<usa-modal></usa-modal>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/modal/index.js';
```

## Properties

| Property              | Type  | Default      | Description          |
| --------------------- | ----- | ------------ | -------------------- |
| `heading`             | `any` | `''`         | Property description |
| `description`         | `any` | `''`         | Property description |
| `triggerText`         | `any` | `''`         | Property description |
| `showTrigger`         | `any` | `true`       | Property description |
| `large`               | `any` | `false`      | Property description |
| `forceAction`         | `any` | `false`      | Property description |
| `primaryButtonText`   | `any` | `'Continue'` | Property description |
| `secondaryButtonText` | `any` | `'Cancel'`   | Property description |
| `showSecondaryButton` | `any` | `true`       | Property description |
| `open`                | `any` | `false`      | Property description |

## Events

| Event                    | Type        | Description       |
| ------------------------ | ----------- | ----------------- |
| `modal-primary-action`   | CustomEvent | Event description |
| `modal-secondary-action` | CustomEvent | Event description |
| `modal-open`             | CustomEvent | Event description |
| `modal-close`            | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Modal - U.S. Web Design System](https://designsystem.digital.gov/components/modal/)
- [Modal Guidance](https://designsystem.digital.gov/components/modal/#guidance)
- [Modal Accessibility](https://designsystem.digital.gov/components/modal/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/modal/usa-modal.test.ts
```

## Storybook

View component examples: [USAModal Stories](http://localhost:6006/?path=/story/components-modal)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
