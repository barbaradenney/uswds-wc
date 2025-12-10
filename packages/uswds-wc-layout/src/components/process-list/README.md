---
meta:
  title: USAProcessList
  component: usa-process-list
---

# USAProcessList

A USWDS process-list component built with Lit Element.

## Usage

```html
<usa-process-list></usa-process-list>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/process-list/index.js';
```

## Properties

| Property       | Type            | Default | Description          |
| -------------- | --------------- | ------- | -------------------- |
| `items`        | `ProcessItem[]` | `[]`    | Property description |
| `headingLevel` | `any`           | `'h4'`  | Property description |

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

- [Process-list - U.S. Web Design System](https://designsystem.digital.gov/components/process-list/)
- [Process-list Guidance](https://designsystem.digital.gov/components/process-list/#guidance)
- [Process-list Accessibility](https://designsystem.digital.gov/components/process-list/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/process-list/usa-process-list.test.ts
```

## Storybook

View component examples: [USAProcessList Stories](http://localhost:6006/?path=/story/components-process-list)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
