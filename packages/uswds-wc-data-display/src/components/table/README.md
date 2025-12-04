---
meta:
  title: USATable
  component: usa-table
---

# USATable

A USWDS table component built with Lit Element.

## Usage

```html
<usa-table></usa-table>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/table/index.js';
```

## Properties

| Property          | Type            | Default | Description          |
| ----------------- | --------------- | ------- | -------------------- | -------------------- |
| `caption`         | `any`           | `''`    | Property description |
| `headers`         | `TableColumn[]` | `[]`    | Property description |
| `data`            | `TableRow[]`    | `[]`    | Property description |
| `striped`         | `any`           | `false` | Property description |
| `borderless`      | `any`           | `false` | Property description |
| `compact`         | `any`           | `false` | Property description |
| `stacked`         | `any`           | `false` | Property description |
| `stackedHeader`   | `any`           | `false` | Property description |
| `stickyHeader`    | `any`           | `false` | Property description |
| `scrollable`      | `any`           | `false` | Property description |
| `sortColumn`      | `any`           | `''`    | Property description |
| `sortDirection`   | `'asc'          | 'desc'` | `'asc'`              | Property description |
| `virtual`         | `any`           | `false` | Property description |
| `rowHeight`       | `any`           | `48`    | Property description |
| `containerHeight` | `any`           | `400`   | Property description |

## Events

| Event               | Type        | Description       |
| ------------------- | ----------- | ----------------- |
| `table-initialized` | CustomEvent | Event description |
| `table-sort`        | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Table - U.S. Web Design System](https://designsystem.digital.gov/components/table/)
- [Table Guidance](https://designsystem.digital.gov/components/table/#guidance)
- [Table Accessibility](https://designsystem.digital.gov/components/table/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/table/usa-table.test.ts
```

## Storybook

View component examples: [USATable Stories](http://localhost:6006/?path=/story/components-table)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-04_
