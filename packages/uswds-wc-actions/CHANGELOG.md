# @uswds-wc/actions

## 2.5.7

### Patch Changes

- c52248f: Add text property to usa-link component for attribute-based text content

## 2.5.6

### Patch Changes

- f4e5f15: Add attribute-based initialization for breadcrumb, side-navigation, and button-group components
  - usa-breadcrumb: Parse count, item1-label, item1-href attributes into items array
  - usa-side-navigation: Parse count, item1-label, item1-href, item1-current attributes
  - usa-button-group: Parse btn-count, btn1-text, btn1-variant attributes into buttons array

  This enables declarative HTML usage for prototyping tools where attributes are easier to manage than JavaScript property assignment.

- abbe241: Add text property to usa-link component for attribute-based text content

## 2.5.5

### Patch Changes

- fix: remove CSS imports for CDN compatibility

  Removes `import '@uswds-wc/core/styles.css'` from all components.
  This fixes the "Expected JavaScript module but got text/css" error
  when loading components via CDN (esm.sh).

  The USWDS CSS should be loaded separately via a `<link>` tag, which
  is the standard pattern for CDN usage.

## 2.5.4

### Patch Changes

- d8e84a3: fix(search, header): replace hardcoded img tags with usa-icon component

  Fixes broken icons by using usa-icon web component instead of hardcoded img tags.

  **Components Fixed:**
  - usa-search: Replace img tags with `<usa-icon name="search">`
  - usa-header: Replace close button img tags with `<usa-icon name="close">`

  **Prevention System:**
  - New validation script: validate-component-composition.js (stage 4d/9)
  - New MDX validation script: validate-storybook-mdx.js (stage 11c/11)

  This ensures component composition pattern is enforced going forward.
