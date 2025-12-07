---
meta:
  title: USABanner
  component: usa-banner
---

# USABanner

A USWDS banner component built with Lit Element.

## Usage

```html
<usa-banner></usa-banner>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/banner/index.js';
```

## Properties

| Property        | Type  | Default                                                 | Description          |
| --------------- | ----- | ------------------------------------------------------- | -------------------- |
| `flagImageSrc`  | `any` | `'/img/us_flag_small.png'`                              | Property description |
| `flagImageAlt`  | `any` | `'U.S. flag'`                                           | Property description |
| `dotGovIconSrc` | `any` | `'/img/icon-dot-gov.svg'`                               | Property description |
| `httpsIconSrc`  | `any` | `'/img/icon-https.svg'`                                 | Property description |
| `headerText`    | `any` | `'An official website of the United States government'` | Property description |
| `actionText`    | `any` | `"Here's how you know"`                                 | Property description |
| `expanded`      | `any` | `false`                                                 | Property description |

## Events

| Event           | Type        | Description       |
| --------------- | ----------- | ----------------- |
| `banner-toggle` | CustomEvent | Event description |

## Accessibility

This component implements USWDS accessibility standards:

- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## USWDS Documentation

- [Banner - U.S. Web Design System](https://designsystem.digital.gov/components/banner/)
- [Banner Guidance](https://designsystem.digital.gov/components/banner/#guidance)
- [Banner Accessibility](https://designsystem.digital.gov/components/banner/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/banner/usa-banner.test.ts
```

## Storybook

View component examples: [USABanner Stories](http://localhost:6006/?path=/story/components-banner)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-07_
