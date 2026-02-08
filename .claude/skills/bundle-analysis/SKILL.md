---
name: bundle-analysis
description: Bundle size analysis for USWDS web components — shows per-package bundle sizes, identifies largest components, tracks size changes, and suggests optimization opportunities like tree-shaking and lazy loading. Use when concerned about performance or bundle size.
argument-hint: "[optional: package-name or 'all']"
---

# Bundle Analysis — USWDS Web Components Size Report

You are acting as a performance engineer. Analyze bundle sizes across the USWDS Web Components library and identify optimization opportunities.

## Instructions

If `$ARGUMENTS` specifies a package name, focus on that package. Otherwise, analyze all packages.

### 1. Run Bundle Size Validation

```bash
pnpm run validate:bundle-size 2>/dev/null || echo "Bundle size validation script not available — proceeding with manual analysis"
```

### 2. Package Build Output Analysis

Check for built output in each package:
```
packages/uswds-wc-core/dist/
packages/uswds-wc-actions/dist/
packages/uswds-wc-forms/dist/
packages/uswds-wc-navigation/dist/
packages/uswds-wc-data-display/dist/
packages/uswds-wc-feedback/dist/
packages/uswds-wc-layout/dist/
packages/uswds-wc-structure/dist/
packages/uswds-wc-bundle/dist/
```

For each package with a `dist/` directory, measure file sizes:
```bash
du -sh packages/uswds-wc-*/dist/ 2>/dev/null
```

Also check individual file sizes within dist:
```bash
find packages/uswds-wc-*/dist -name "*.js" -exec ls -lh {} \; 2>/dev/null | sort -k5 -h
```

### 3. Per-Component Size Estimation

For each component source file, report file size as a proxy for component complexity:
```bash
find packages/uswds-wc-*/src/components -name "usa-*.ts" ! -name "*.test.ts" ! -name "*.stories.ts" ! -name "*.cy.ts" -exec wc -l {} \; | sort -rn
```

Identify the top 10 largest components by line count and the top 10 by file size.

### 4. Dependency Analysis

For each feature package, read its `package.json` and check:
- Dependencies on other `@uswds-wc/*` packages
- External dependencies beyond Lit and USWDS
- Any heavy dependencies that could be optimized

Check the dependency graph:
```bash
pnpm list --filter @uswds-wc/* --depth=1 2>/dev/null | head -60
```

### 5. CSS Bundle Analysis

The USWDS CSS is a significant part of the bundle. Check:
```bash
ls -lh packages/uswds-wc-core/src/styles/ 2>/dev/null
ls -lh packages/uswds-wc-core/dist/*.css 2>/dev/null
```

Report:
- Total CSS size
- Whether CSS tree-shaking is enabled (`pnpm run css:tree-shake:stats`)
- Per-component CSS extraction status

### 6. Bundle Package Analysis

Check the combined bundle package:
```bash
ls -lh packages/uswds-wc-bundle/dist/ 2>/dev/null
```

Read `packages/uswds-wc-bundle/package.json` for:
- What's included in the bundle
- Entry points (main, module, exports)
- Whether tree-shaking is supported

### 7. Optimization Opportunities

Based on the analysis, identify:

**Tree-Shaking**:
- Are packages configured with `"sideEffects": false`?
- Do package.json files have proper `exports` maps?
- Are there barrel files that prevent tree-shaking?

**Lazy Loading**:
- Which components could benefit from lazy loading?
- Are there dynamic imports for heavy sub-components?

**Code Splitting**:
- Behavior files that could be loaded on demand
- Large utility functions that could be split

**Dead Code**:
- Unused exports or utilities
- Components that import more than they need

### 8. Size Report

Present a comprehensive size report:

```
Bundle Size Report
==================

Package Sizes:
  @uswds-wc/core          XX KB (JS) + XX KB (CSS)
  @uswds-wc/actions       XX KB
  @uswds-wc/forms         XX KB
  @uswds-wc/navigation    XX KB
  @uswds-wc/data-display  XX KB
  @uswds-wc/feedback      XX KB
  @uswds-wc/layout        XX KB
  @uswds-wc/structure     XX KB
  ---
  Total JS:               XX KB
  Total CSS:              XX KB
  Combined Bundle:        XX KB

Largest Components (by source lines):
  1. usa-[name]    XXXX lines
  2. usa-[name]    XXX lines
  ...

Optimization Opportunities:
  - [suggestion with estimated savings]
```

### 9. Size Budget Recommendations

Based on the analysis, suggest reasonable size budgets:
- Per-component budget (KB)
- Per-package budget (KB)
- Total bundle budget (KB)
- CSS budget (KB)
