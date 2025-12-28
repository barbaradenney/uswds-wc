---
"@uswds-wc/navigation": patch
"@uswds-wc/actions": patch
"@uswds-wc/bundle": patch
---

Add attribute-based initialization for breadcrumb, side-navigation, and button-group components

- usa-breadcrumb: Parse count, item1-label, item1-href attributes into items array
- usa-side-navigation: Parse count, item1-label, item1-href, item1-current attributes  
- usa-button-group: Parse btn-count, btn1-text, btn1-variant attributes into buttons array

This enables declarative HTML usage for prototyping tools where attributes are easier to manage than JavaScript property assignment.
