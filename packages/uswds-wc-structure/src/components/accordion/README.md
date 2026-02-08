---
meta:
  title: USAAccordion
  component: usa-accordion
---

# USAAccordion

A USWDS accordion component built with Lit Element.

## Usage

```html
<usa-accordion></usa-accordion>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/accordion/index.js';
```

## Properties

| Property          | Type              | Default | Description          |
| ----------------- | ----------------- | ------- | -------------------- |
| `items`           | `AccordionItem[]` | `[]`    | Property description |
| `multiselectable` | `any`             | `false` | Property description |
| `bordered`        | `any`             | `false` | Property description |
| `sectionCount`    | `any`             | `0`     | Property description |

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

- [Accordion - U.S. Web Design System](https://designsystem.digital.gov/components/accordion/)
- [Accordion Guidance](https://designsystem.digital.gov/components/accordion/#guidance)
- [Accordion Accessibility](https://designsystem.digital.gov/components/accordion/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/accordion/usa-accordion.test.ts
```

## Storybook

View component examples: [USAAccordion Stories](http://localhost:6006/?path=/story/components-accordion)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
