---
meta:
  title: USAInPageNavigation
  component: usa-in-page-navigation
---

# USAInPageNavigation

A USWDS in-page-navigation component built with Lit Element.

## Usage

```html
<usa-in-page-navigation></usa-in-page-navigation>
```

```javascript
import 'path/to/uswds-webcomponents/src/components/in-page-navigation/index.js';
```

## Properties

| Property            | Type  | Default              | Description          |
| ------------------- | ----- | -------------------- | -------------------- |
| `titleHeadingLevel` | `any` | `'4'`                | Property description |
| `rootSelector`      | `any` | `'main'`             | Property description |
| `headingSelector`   | `any` | `'h2 h3'`            | Property description |
| `smoothScroll`      | `any` | `true`               | Property description |
| `scrollOffset`      | `any` | `0`                  | Property description |
| `threshold`         | `any` | `'0.5'`              | Property description |
| `rootMargin`        | `any` | `'0px 0px -50% 0px'` | Property description |

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

- [In-page-navigation - U.S. Web Design System](https://designsystem.digital.gov/components/in-page-navigation/)
- [In-page-navigation Guidance](https://designsystem.digital.gov/components/in-page-navigation/#guidance)
- [In-page-navigation Accessibility](https://designsystem.digital.gov/components/in-page-navigation/#accessibility)

## Implementation Notes

- Uses light DOM for maximum USWDS compatibility
- Follows official USWDS HTML structure and CSS classes
- Progressive enhancement with USWDS JavaScript behaviors when available

## Testing

Run component tests:

```bash
npm test src/components/in-page-navigation/usa-in-page-navigation.test.ts
```

## Storybook

View component examples: [USAInPageNavigation Stories](http://localhost:6006/?path=/story/components-in-page-navigation)

---

_This README is automatically updated when component code changes._
_Last updated: 2025-12-10_
