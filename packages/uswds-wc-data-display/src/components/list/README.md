---
meta:
  title: USAList
  component: usa-list
---

# USAList

A USWDS list component built with Lit Element.

## Usage

```html
<usa-list></usa-list>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/list/index.js';
```

## Properties

| Property   | Type         | Default    | Description          |
| ---------- | ------------ | ---------- | -------------------- | -------------------- |
| `type`     | `'unordered' | 'ordered'` | `'unordered'`        | Property description |
| `unstyled` | `any`        | `false`    | Property description |

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

- [List - U.S. Web Design System](https://designsystem.digital.gov/components/list/)
- [List Guidance](https://designsystem.digital.gov/components/list/#guidance)
- [List Accessibility](https://designsystem.digital.gov/components/list/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/list/usa-list.test.ts
```

## Storybook

View component examples: [USAList Stories](http://localhost:6006/?path=/story/components-list)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
