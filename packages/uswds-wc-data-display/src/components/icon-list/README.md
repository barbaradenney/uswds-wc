---
meta:
  title: USAIconList
  component: usa-icon-list
---

# USAIconList

A USWDS icon-list component built with Lit Element.

## Usage

```html
<usa-icon-list></usa-icon-list>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/icon-list/index.js';
```

## Properties

| Property | Type             | Default   | Description          |
| -------- | ---------------- | --------- | -------------------- | --------- | -------------------- | ------- | ------- | ---- | -------------------- |
| `items`  | `IconListItem[]` | `[]`      | Property description |
| `color`  | `''              | 'primary' | 'secondary'          | 'success' | 'warning'            | 'error' | 'info'` | `''` | Property description |
| `size`   | `''              | 'lg'      | 'xl'`                | `''`      | Property description |

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

- [Icon-list - U.S. Web Design System](https://designsystem.digital.gov/components/icon-list/)
- [Icon-list Guidance](https://designsystem.digital.gov/components/icon-list/#guidance)
- [Icon-list Accessibility](https://designsystem.digital.gov/components/icon-list/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/icon-list/usa-icon-list.test.ts
```

## Storybook

View component examples: [USAIconList Stories](http://localhost:6006/?path=/story/components-icon-list)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
