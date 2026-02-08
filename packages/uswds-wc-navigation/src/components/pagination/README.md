---
meta:
  title: USAPagination
  component: usa-pagination
---

# USAPagination

A USWDS pagination component built with Lit Element.

## Usage

```html
<usa-pagination></usa-pagination>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/pagination/index.js';
```

## Properties

| Property      | Type  | Default | Description          |
| ------------- | ----- | ------- | -------------------- |
| `currentPage` | `any` | `1`     | Property description |
| `totalPages`  | `any` | `1`     | Property description |
| `maxVisible`  | `any` | `7`     | Property description |

## Events

| Event         | Type        | Description       |
| ------------- | ----------- | ----------------- |
| `page-change` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Pagination - U.S. Web Design System](https://designsystem.digital.gov/components/pagination/)
- [Pagination Guidance](https://designsystem.digital.gov/components/pagination/#guidance)
- [Pagination Accessibility](https://designsystem.digital.gov/components/pagination/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/pagination/usa-pagination.test.ts
```

## Storybook

View component examples: [USAPagination Stories](http://localhost:6006/?path=/story/components-pagination)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
