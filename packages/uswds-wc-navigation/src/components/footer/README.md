---
meta:
  title: USAFooter
  component: usa-footer
---

# USAFooter

A USWDS footer component built with Lit Element.

## Usage

```html
<usa-footer></usa-footer>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/footer/index.js';
```

## Properties

| Property     | Type              | Default  | Description          |
| ------------ | ----------------- | -------- | -------------------- | ---------- | -------------------- |
| `variant`    | `'slim'           | 'medium' | 'big'`               | `'medium'` | Property description |
| `agencyName` | `any`             | `''`     | Property description |
| `sections`   | `FooterSection[]` | `[]`     | Property description |

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

- [Footer - U.S. Web Design System](https://designsystem.digital.gov/components/footer/)
- [Footer Guidance](https://designsystem.digital.gov/components/footer/#guidance)
- [Footer Accessibility](https://designsystem.digital.gov/components/footer/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/footer/usa-footer.test.ts
```

## Storybook

View component examples: [USAFooter Stories](http://localhost:6006/?path=/story/components-footer)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
