---
meta:
  title: USACollection
  component: usa-collection
---

# USACollection

A USWDS collection component built with Lit Element.

## Usage

```html
<usa-collection></usa-collection>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/collection/index.js';
```

## Properties

| Property          | Type               | Default | Description          |
| ----------------- | ------------------ | ------- | -------------------- |
| `items`           | `CollectionItem[]` | `[]`    | Property description |
| `virtual`         | `any`              | `false` | Property description |
| `itemHeight`      | `any`              | `120`   | Property description |
| `containerHeight` | `any`              | `600`   | Property description |

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

- [Collection - U.S. Web Design System](https://designsystem.digital.gov/components/collection/)
- [Collection Guidance](https://designsystem.digital.gov/components/collection/#guidance)
- [Collection Accessibility](https://designsystem.digital.gov/components/collection/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/collection/usa-collection.test.ts
```

## Storybook

View component examples: [USACollection Stories](http://localhost:6006/?path=/story/components-collection)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
