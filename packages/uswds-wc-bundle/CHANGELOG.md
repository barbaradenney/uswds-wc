# @uswds-wc/bundle

## 2.5.11

### Patch Changes

- Fix broken banner image URLs by changing defaults from relative paths to absolute CDN URLs

## 2.5.10

### Patch Changes

- c52248f: Add text property to usa-link component for attribute-based text content

## 2.5.7

### Patch Changes

- f4e5f15: Add attribute-based initialization for breadcrumb, side-navigation, and button-group components
  - usa-breadcrumb: Parse count, item1-label, item1-href attributes into items array
  - usa-side-navigation: Parse count, item1-label, item1-href, item1-current attributes
  - usa-button-group: Parse btn-count, btn1-text, btn1-variant attributes into buttons array

  This enables declarative HTML usage for prototyping tools where attributes are easier to manage than JavaScript property assignment.

- abbe241: Add text property to usa-link component for attribute-based text content
