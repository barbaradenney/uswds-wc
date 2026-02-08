---
name: qa-check
description: QA tester check for a USWDS web component — runs unit tests, reports test coverage across all test types (unit, Cypress, accessibility, visual), checks for skipped tests, runs accessibility audit, and reports known regressions. Use when testing or validating a component.
argument-hint: "<component-name> (e.g., 'button', 'modal', 'date-picker')"
---

# QA Check — USWDS Web Component Test & Quality Report

You are acting as a QA/testing specialist. Provide a comprehensive quality assessment of the specified component, running tests and analyzing coverage.

## Instructions

The target component is: `$ARGUMENTS`

If no component name is provided, ask the user which component they want to check. Offer the option to run checks across all components.

### 1. Locate Component Test Files

Find all test files for the component:
```
packages/uswds-wc-*/src/components/usa-$ARGUMENTS/usa-*.test.ts
packages/uswds-wc-*/src/components/usa-$ARGUMENTS/usa-*.component.cy.ts
tests/visual/*$ARGUMENTS*
tests/browser-required/*$ARGUMENTS*
cypress/component/*$ARGUMENTS*
```

List each test file found and its type (unit, Cypress, visual, browser-required).

### 2. Run Unit Tests

Execute the component's unit tests:
```bash
pnpm test -- usa-$ARGUMENTS.test.ts --reporter=verbose
```

Report:
- Total tests: passed / failed / skipped
- Test duration
- Any failure details with error messages

### 3. Test Coverage Analysis

Read each test file and categorize what's tested:

**Property Tests**: Which component properties are tested?
**Event Tests**: Which events are tested?
**Accessibility Tests**: Look for:
- `axe` / `axe-core` / accessibility assertions
- ARIA attribute tests
- Keyboard navigation tests
- Focus management tests

**Slot Tests**: Tests for slotted content rendering
**USWDS Compliance Tests**: Tests verifying USWDS class structure
**Edge Case Tests**: Error handling, boundary values, empty states

Present as a coverage matrix:

| Test Category | Covered | Test Count | Notes |
|---------------|---------|------------|-------|
| Properties | Yes/No | N | ... |
| Events | Yes/No | N | ... |
| Accessibility | Yes/No | N | ... |
| Slots | Yes/No | N | ... |
| USWDS Structure | Yes/No | N | ... |
| Edge Cases | Yes/No | N | ... |

### 4. Skipped Test Audit

Search for skipped tests in the component's test files:
- Look for `it.skip`, `describe.skip`, `test.skip`, `xit`, `xdescribe`
- For each skipped test, report:
  - Test name
  - Skip reason (from comments or TODO markers)
  - Whether the skip is justified

Also check the project-wide skipped test audit:
```bash
pnpm run audit:skipped-tests --json
```

### 5. Accessibility Audit

Check accessibility test results. If axe-core tests exist in the unit tests, report their results from step 2. Additionally check:
- Component source for ARIA attributes
- Whether keyboard interactions are handled
- Focus trap implementation (for modals/dialogs)
- `role` attributes on key elements

If the component has dedicated accessibility tests, run:
```bash
pnpm run validate:accessibility
```

### 6. Regression Check

Look for known regressions:
- Check `__tests__/` for regression tests mentioning this component
- Check `.git/DISCOVERED_ISSUES.json` for any open issues
- Look for `REGRESSION` markers in test names:
  ```bash
  grep -r "REGRESSION" packages/uswds-wc-*/src/components/usa-$ARGUMENTS/
  ```

### 7. Compliance Validation

Run component-level compliance:
```bash
pnpm run validate:component=$ARGUMENTS
```

Report compliance status and any violations.

### 8. QA Summary

Provide a quality scorecard:

| Metric | Status | Details |
|--------|--------|---------|
| Unit Tests | Pass/Fail | X/Y passing |
| Accessibility | Pass/Issues | ... |
| Skipped Tests | N skipped | Justified: Y/N |
| Regressions | None/Found | ... |
| USWDS Compliance | Pass/Fail | ... |
| Overall Quality | High/Medium/Low | ... |

List action items for any issues found.
