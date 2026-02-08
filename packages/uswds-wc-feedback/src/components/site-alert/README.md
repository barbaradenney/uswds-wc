---
meta:
  title: USASiteAlert
  component: usa-site-alert
---

# USASiteAlert

A USWDS site-alert component built with Lit Element.

## Usage

```html
<usa-site-alert></usa-site-alert>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/site-alert/index.js';
```

## Properties

| Property     | Type            | Default   | Description          |
| ------------ | --------------- | --------- | -------------------- |
| `type`       | `SiteAlertType` | `'info'`  | Property description |
| `heading`    | `any`           | `''`      | Property description |
| `content`    | `any`           | `''`      | Property description |
| `slim`       | `any`           | `false`   | Property description |
| `noIcon`     | `any`           | `false`   | Property description |
| `closable`   | `any`           | `false`   | Property description |
| `visible`    | `any`           | `true`    | Property description |
| `closeLabel` | `any`           | `'Close'` | Property description |

## Events

| Event              | Type        | Description       |
| ------------------ | ----------- | ----------------- |
| `site-alert-close` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Site-alert - U.S. Web Design System](https://designsystem.digital.gov/components/site-alert/)
- [Site-alert Guidance](https://designsystem.digital.gov/components/site-alert/#guidance)
- [Site-alert Accessibility](https://designsystem.digital.gov/components/site-alert/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/site-alert/usa-site-alert.test.ts
```

## Storybook

View component examples: [USASiteAlert Stories](http://localhost:6006/?path=/story/components-site-alert)

---

_This README is automatically updated when component code changes._
_Last updated: 2026-02-08_
