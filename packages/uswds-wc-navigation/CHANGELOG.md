# @uswds-wc/navigation

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

- Updated dependencies [d8e84a3]
  - @uswds-wc/actions@2.5.4
