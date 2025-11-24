# Testing Guide

Complete testing documentation for USWDS Web Components monorepo.

## 🏗️ Monorepo Testing Architecture

The USWDS Web Components library uses a **monorepo with 11 packages**, each with independent tests that run in parallel via **Turborepo**.

### Package Structure

```
packages/
├── uswds-wc-core/              # Core utilities (9 tests)
├── uswds-wc-actions/           # Button, Link, Search (150+ tests)
├── uswds-wc-forms/             # Form components (650+ tests)
├── uswds-wc-navigation/        # Navigation components (550+ tests)
├── uswds-wc-data-display/      # Cards, Tables, Lists (400+ tests)
├── uswds-wc-feedback/          # Alerts, Modals (250+ tests)
├── uswds-wc-layout/            # Layout utilities (282 tests)
├── uswds-wc-structure/         # Accordion (60+ tests)
├── uswds-wc-test-utils/        # Shared test utilities
├── components/                 # Legacy meta-package
└── uswds-wc/                   # All components bundle
```

**Total:** 2301/2301 tests passing across all packages

### Monorepo Test Commands

```bash
# Run all tests across all packages (parallel via Turborepo)
pnpm test

# Test specific package
pnpm --filter @uswds-wc/forms test
pnpm --filter @uswds-wc/actions test

# Test multiple packages
pnpm --filter "@uswds-wc/forms" --filter "@uswds-wc/actions" test

# Test with Turborepo (explicit)
pnpm turbo test

# Force rebuild and test (no cache)
pnpm turbo test --force
```

### Performance Benefits

**Turborepo Parallel Execution:**
- ✅ **All 11 packages test simultaneously**
- ✅ **Smart caching** - Skip unchanged packages
- ✅ **Remote caching** - Share test results across team
- ✅ **Faster feedback** - Failures surface immediately

**Typical Performance:**
```bash
# Without Turborepo (sequential)
Time: ~5-7 minutes for all tests

# With Turborepo (parallel)
Time: ~1-2 minutes for all tests

# With remote cache (unchanged code)
Time: ~5-10 seconds (skip all tests!)
```

## Quick Start

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:ui

# Run browser tests
pnpm run test:browser

# Type check
pnpm run typecheck

# Lint
pnpm run lint
```

## Consolidated Test Orchestrator ⭐ RECOMMENDED

Single unified testing system with flag-based commands:

```bash
# Default test orchestrator
pnpm run test:run

# Specific test types
pnpm run test:run -- --unit              # Unit tests only
pnpm run test:run -- --browser           # Browser-required tests
pnpm run test:run -- --e2e               # E2E tests
pnpm run test:run -- --all               # All tests (unit + browser + e2e)

# Component-specific testing
pnpm run test:run -- --component=<name>  # Test specific component

# Test modes
pnpm run test:run -- --watch             # Watch mode
pnpm run test:run -- --coverage          # With coverage

# Advanced testing
pnpm run test:run -- --flaky             # Flaky test detection
pnpm run test:run -- --smoke             # Production smoke tests
pnpm run test:run -- --contracts         # Contract testing
pnpm run test:run -- --performance       # Performance regression
pnpm run test:run -- --mutation          # Mutation testing
```

## Consolidated Validation System

Single unified compliance and validation system:

```bash
# Run all validations
pnpm run validate

# Component-specific
pnpm run validate -- --component=<name>

# Validation types
pnpm run validate -- --uswds             # USWDS HTML/CSS compliance
pnpm run validate -- --structure         # Component file structure
pnpm run validate -- --css               # CSS compliance (no custom styles)
pnpm run validate -- --javascript        # JavaScript integration
pnpm run validate -- --accessibility     # Accessibility compliance
pnpm run validate -- --architecture      # Architecture patterns
pnpm run validate -- --storybook         # Storybook story validation

# Options
pnpm run validate -- --fix               # Auto-fix issues
pnpm run validate -- --strict            # Strict mode (warnings as errors)
pnpm run validate -- --report=json       # JSON report output
```

## Testing Infrastructure

### 1. Unit Tests (Vitest)

Fast tests in jsdom environment for component logic:

```bash
pnpm test                    # Run unit tests
pnpm run test:ui            # Interactive UI
pnpm run test:coverage      # With coverage report
```

**Example test:**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-button.ts'; // From same package directory
import type { USAButton } from './usa-button.js';
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '@uswds-wc/test-utils';

describe('USAButton', () => {
  let element: USAButton;

  beforeEach(() => {
    element = document.createElement('usa-button') as USAButton;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have default properties', () => {
    expect(element.variant).toBe('primary');
  });

  it('should pass accessibility tests', async () => {
    await element.updateComplete;
    await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
  });
});
```

### 2. Browser Tests (Vitest + Playwright)

Tests requiring real browser environment:

```bash
pnpm run test:browser          # Run browser tests
pnpm run test:browser:watch    # Watch mode
pnpm run test:browser:coverage # With coverage
```

### 3. Component Tests (Cypress)

Interactive component testing in isolation:

```bash
pnpm run cypress:open          # Interactive mode
pnpm run cypress:run           # Headless mode
pnpm run cypress:component     # Component tests only
```

**Example Cypress test:**
```typescript
describe('usa-button', () => {
  it('should render and be clickable', () => {
    cy.mount('<usa-button variant="primary">Click me</usa-button>');
    cy.get('usa-button').should('be.visible');
    cy.get('usa-button button').click();
  });

  it('should pass accessibility tests', () => {
    cy.mount('<usa-button>Accessible button</usa-button>');
    cy.checkAccessibility();
  });
});
```

### 4. E2E Tests (Cypress)

Full application testing:

```bash
pnpm run e2e                   # Run E2E tests
pnpm run e2e:open              # Interactive E2E testing
```

### 5. Storybook Tests

Automated testing of all Storybook stories:

```bash
pnpm run test:storybook        # Run story tests
pnpm run test:storybook:ci     # CI mode
```

### 6. Visual Regression Testing ⭐ NEW

Automated visual testing to catch appearance bugs and USWDS compliance issues:

```bash
# Playwright Visual Tests
pnpm run test:visual                # Run all visual tests
pnpm run test:visual:baseline       # Update visual baselines
pnpm run test:visual:ui             # Interactive UI mode
pnpm run test:visual:components     # Component-specific tests
pnpm run test:visual:patterns       # Pattern visual tests (NEW)
pnpm run test:visual:patterns:update # Update pattern baselines (NEW)
pnpm run test:visual:headed         # Run with visible browser

# Cross-Browser Testing
pnpm run test:cross-browser         # All browsers
pnpm run test:cross-browser:chromium # Chrome only
pnpm run test:cross-browser:firefox  # Firefox only
pnpm run test:cross-browser:webkit   # Safari only
pnpm run test:cross-browser:mobile   # Mobile browsers

# Chromatic Visual Testing
pnpm run chromatic                  # Run Chromatic
pnpm run chromatic:ci               # CI mode
pnpm run chromatic:build            # Build and run
```

**What Visual Tests Catch:**
- ✅ Icon rendering (sprite vs inline SVG)
- ✅ USWDS structure compliance (aria-live placement, CSS classes)
- ✅ Component appearance changes
- ✅ Cross-browser visual consistency
- ✅ Layout shifts and CSS regressions
- ✅ Accessibility visual indicators

**Real Bugs Caught:**
1. Icon sprite regression - Icons reverted to inline SVG (Oct 22, 2025)
2. Character count aria-live bug - Wrong element had aria-live (Oct 23, 2025)
3. Table sorting visual feedback - Missing indicators

**Visual Test Types:**

**Component Visual Tests** (`tests/visual/components/`):
```typescript
// Example: Icon visual regression test
test('should render icons from sprite file', async ({ page }) => {
  await page.goto('http://localhost:6006/?path=/story/data-display-icon--default');

  const icon = page.locator('usa-icon').first();
  const useElement = icon.locator('use');

  // Validate sprite-first architecture
  await expect(useElement).toBeVisible();
  const href = await useElement.getAttribute('href');
  expect(href).toMatch(/^\/img\/sprite\.svg#/);

  // Take visual snapshot
  await expect(icon).toHaveScreenshot('icon-default.png');
});
```

**USWDS Compliance Tests** (`tests/visual/uswds-compliance.spec.ts`):
```typescript
// Example: Character count USWDS structure validation
test('CRITICAL: message element structure per USWDS spec', async ({ page }) => {
  const message = component.locator('.usa-character-count__message');

  // FAIL CONDITION: Message should NOT have aria-live
  const ariaLive = await message.getAttribute('aria-live');
  expect(ariaLive).toBeNull();

  // PASS CONDITION: Should have usa-sr-only class
  await expect(message).toHaveClass(/usa-sr-only/);
});
```

**Documentation:**
- **Visual Testing Guide**: `docs/VISUAL_TESTING_GUIDE.md` - Complete guide
- **Chromatic Setup**: `docs/CHROMATIC_SETUP_GUIDE.md` - Cloud visual testing
- **Test Improvements**: `TEST_IMPROVEMENT_SUMMARY.md` - Bug analysis
- **Infrastructure Integration**: `TESTING_INFRASTRUCTURE_INTEGRATION_SUMMARY.md`

### 7. Cross-Browser Testing (Playwright) ⭐ OPTIMIZED

Automated cross-browser testing with parallel job execution for optimal CI performance:

```bash
# Local Development (Full Browser Matrix)
pnpm run test:cross-browser              # All 12 browsers
pnpm run test:cross-browser:chromium     # Chromium only
pnpm run test:cross-browser:firefox      # Firefox only
pnpm run test:cross-browser:webkit       # Safari/Webkit only
pnpm run test:cross-browser:mobile       # Mobile browsers
pnpm run test:cross-browser:accessibility # A11y-specific testing
```

**CI/CD Optimization - Split Parallel Jobs:**

To prevent timeout issues with large test suites (252+ test executions), cross-browser tests are split into 2 parallel CI jobs:

1. **Cross-Browser Testing (Desktop)**
   - Browsers: Chromium + Firefox
   - ~126 test executions (63 tests × 2 browsers)
   - Timeout: 25 minutes
   - Typical completion: 15-18 minutes

2. **Cross-Browser Testing (Webkit + A11y)**
   - Browsers: Webkit + Accessibility-Chrome
   - ~126 test executions (63 tests × 2 browsers)
   - Timeout: 25 minutes
   - Typical completion: 15-18 minutes

**Performance Benefits:**
- ⚡ **Parallel execution** - Both jobs run simultaneously (half total time)
- ✅ **No timeouts** - Each job completes well under 25-minute limit
- 🎯 **Optimized browser installation** - Only installs needed browsers per job
- 🐛 **Better debugging** - Separate artifacts for desktop vs webkit/a11y

**Configuration:**
- Local: Full 12-browser matrix (`playwright.config.ts`)
- CI: Optimized 4-browser split (`.github/workflows/ci.yml`)

**Why This Approach:**
- Original single job: 252 executions × ~7.5s/test = 31+ minutes → timeout
- Split jobs: 126 executions × ~7.5s/test = 15-16 minutes → success

**Example Playwright Test:**
```typescript
// tests/playwright/accordion-cross-browser.spec.ts
test('should expand and collapse consistently across browsers', async ({ page, browserName }) => {
  // Webkit needs longer timeouts for element visibility
  const timeout = browserName === 'webkit' ? 10000 : 5000;

  const firstButton = page.locator('.usa-accordion__button').first();
  await expect(firstButton).toBeVisible({ timeout });

  // Initially collapsed
  await expect(firstButton).toHaveAttribute('aria-expanded', 'false', { timeout });

  // Click to expand
  await firstButton.click();
  await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

  // Content visible
  const firstContent = page.locator('.usa-accordion__content').first();
  await expect(firstContent).toBeVisible();
});
```

### 8. Playwright Story Path Validation

**Ensures test story paths match actual Storybook stories** to prevent 100% test failure rates from invalid story references.

#### Problem It Solves

When Playwright tests reference incorrect story paths (e.g., after component refactoring or monorepo restructure), all tests fail because they can't find the target stories:

```typescript
// ❌ Test references old story path
await page.goto('/iframe.html?id=data-display-table--with-large-dataset');
// Story was renamed to: data-display-table--large-dataset

// Result: 100% test failure rate
```

#### Validation Script

**Location:** `scripts/validate/validate-playwright-story-paths.cjs`

**What it does:**
1. Extracts all story paths referenced in Playwright tests
2. Extracts all story IDs from Storybook `.stories.ts` files
3. Compares and reports mismatches
4. Suggests closest matching paths using Levenshtein distance

**How Storybook generates story IDs:**
```typescript
// Storybook meta title
const meta = {
  title: 'Data Display/Table',
  // ...
};

export const LargeDataset: Story = { /* ... */ };

// Generated story ID: data-display-table--large-dataset
// Format: lowercase + replace spaces/slashes with dashes + --story-name
```

#### Running Validation

```bash
# Validate all story paths
pnpm run validate:playwright-story-paths

# Output example:
# 🔍 Validating Playwright Story Paths...
#
# 📊 Found:
#    10 unique story paths in Playwright tests
#    477 story IDs in Storybook
#
# ✅ All Playwright story paths are valid!
```

#### Example Validation Output (with errors)

```bash
❌ Found 3 invalid story path(s):

1. Story path not found: data-display-table--with-large-dataset
   Referenced in:
   - tests/playwright/cross-browser-compatibility.spec.ts

   💡 Did you mean: data-display-table--large-dataset?

2. Story path not found: structure-accordion--multiple-items
   Referenced in:
   - tests/playwright/cross-browser-compatibility.spec.ts

   💡 Did you mean: structure-accordion--multiselectable?
```

#### CI Integration

**Validation runs automatically in CI pipeline:**

`.github/workflows/ci.yml` - Quality job:
```yaml
- name: Validate Playwright Story Paths
  run: pnpm run validate:playwright-story-paths
```

**When it runs:**
- Every commit (via CI)
- Before pull request merge
- On push to main/develop branches

**Result:** Prevents invalid story paths from being merged, ensuring cross-browser tests always work.

#### Common Issues and Fixes

**Issue 1: Story renamed but test not updated**
```typescript
// Fix: Update test to match new story name
- await page.goto('/iframe.html?id=forms-text-input--in-form');
+ await page.goto('/iframe.html?id=forms-text-input--default');
```

**Issue 2: Component moved to different category**
```typescript
// Fix: Update category in path
- await page.goto('/iframe.html?id=components-modal--default');
+ await page.goto('/iframe.html?id=feedback-modal--default');
```

**Issue 3: Story export name changed**
```typescript
// In stories file:
- export const WithLargeDataset: Story = { /* ... */ };
+ export const LargeDataset: Story = { /* ... */ };

// In test file:
- await page.goto('/iframe.html?id=data-display-table--with-large-dataset');
+ await page.goto('/iframe.html?id=data-display-table--large-dataset');
```

#### Validation Script Maintenance

**Critical bug fix (Dec 2024):** Script was matching wrong `title:` property in stories files.

**Problem:** Regex matched first `title:` occurrence, which could be inside story content instead of meta object:
```typescript
// ❌ Old regex matched this first
export const Default: Story = {
  args: {
    title: 'Getting Started'  // Wrong title!
  }
};

const meta = {
  title: 'Structure/Accordion'  // Should match this
};
```

**Solution:** Updated regex to specifically match meta object title:
```javascript
// scripts/validate/validate-playwright-story-paths.cjs:84
const metaMatch = content.match(/const meta[^{]*\{[^}]*title:\s*['"]([^'"]+)['"]/s);
```

#### Best Practices

1. **Always validate after refactoring** - Run validation script after renaming stories or moving components
2. **Check validation output** - Pay attention to fuzzy match suggestions
3. **Update tests immediately** - Fix story paths in same commit as story changes
4. **Use consistent naming** - Keep story export names aligned with their purpose

## Comprehensive Testing Infrastructure

Complete test suite with consolidated reporting:

```bash
# Full test suite
pnpm run test:comprehensive

# Targeted suites
pnpm run test:comprehensive:fast          # Fast critical tests
pnpm run test:comprehensive:critical      # Critical path only
pnpm run test:comprehensive:full          # Everything
pnpm run test:comprehensive:ci            # CI optimized

# Specialized testing
pnpm run test:comprehensive:security      # Security tests
pnpm run test:comprehensive:accessibility # A11y tests
pnpm run test:comprehensive:performance   # Performance tests
pnpm run test:comprehensive:error-recovery # Error handling
pnpm run test:comprehensive:contracts     # Contract tests

# Reporting
pnpm run test:comprehensive:report        # Generate report
```

## Test Health Validation

Automated testing infrastructure to prevent component issues:

```bash
# Health checks
pnpm run test:validate-health             # Comprehensive health check
pnpm run test:validate-health:verbose     # Detailed analysis
pnpm run test:health-report               # Generate report

# Component-specific
pnpm run test:validate-health:component=modal  # Specific component
```

## Regression Testing

Prevent component behavior degradation:

```bash
pnpm run test:regression:baseline         # Create baseline snapshots
pnpm run test:regression:validate         # Check for regressions
pnpm run test:regression:update           # Update baselines after changes
```

## Testing Best Practices

### 1. Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
it('should update value when property changes', async () => {
  // Arrange
  const element = document.createElement('usa-input') as USAInput;
  document.body.appendChild(element);

  // Act
  element.value = 'new value';
  await element.updateComplete;

  // Assert
  expect(element.value).toBe('new value');

  // Cleanup
  element.remove();
});
```

### 2. Async Testing

Always await `updateComplete` for Lit components:

```typescript
it('should render updated content', async () => {
  element.content = 'Updated content';
  await element.updateComplete;  // REQUIRED

  const content = element.querySelector('.content');
  expect(content?.textContent).toBe('Updated content');
});
```

### 3. CI Timing Best Practices ⭐ NEW

**Problem**: CI environments are slower than local development, causing race conditions and timing-dependent test failures.

**Solution**: Proactive timing utilities that automatically adjust wait times based on environment.

#### The Problem

Tests that pass locally may fail in CI due to:
- **ARIA attribute timing** - Attributes not set immediately
- **Property → DOM propagation** - Property changes don't immediately update child elements
- **Component initialization** - Complex components (modal, combo-box, date-picker) need extra time
- **CSS transitions** - Animations and transitions need time to complete

**Impact**: 713 vulnerable test patterns identified across 97 test files

#### CI Timing Utilities

All utilities available from `@uswds-wc/test-utils`:

```typescript
import {
  waitForPropertyPropagation,
  waitForARIAAttribute,
  waitForModalOpen,
  waitForAccordionTransition,
  waitForComboBoxInit,
  waitForDatePickerInit,
  waitForElementRender
} from '@uswds-wc/test-utils';
```

#### Pattern 1: Property → DOM Propagation

**Problem**: Setting element properties doesn't immediately update child element DOM

```typescript
// ❌ Bad - May fail in CI (144 cases found)
element.required = true;
await waitForUpdate(element);
const input = element.querySelector('input');
expect(input.required).toBe(true); // Race condition!

// ✅ Good - CI-safe
element.required = true;
await waitForPropertyPropagation(element);
const input = element.querySelector('input');
expect(input.required).toBe(true); // Guaranteed to be propagated
```

**How it works**:
- Waits 2 iterations locally, 4 iterations in CI
- Uses 2x multiplier for CI environments
- Safe for: `required`, `disabled`, `readonly`, `checked`, `value` properties

#### Pattern 2: ARIA Attribute Timing

**Problem**: Direct `getAttribute('aria-*')` calls may return null in CI before attribute is set

```typescript
// ❌ Bad - May fail in CI (569 cases found)
const ariaSort = header.getAttribute('aria-sort');
expect(ariaSort).toMatch(/none|ascending|descending/);

// ✅ Good - CI-safe
const ariaSort = await waitForARIAAttribute(header, 'aria-sort');
if (ariaSort) {
  expect(ariaSort).toMatch(/none|ascending|descending/);
}
```

**How it works**:
- Polls for attribute with 2s timeout
- 50ms interval locally, 100ms in CI
- Returns null if attribute not set within timeout
- Returns value as soon as attribute is valid (not null or empty)

#### Pattern 3: Modal Opening

**Problem**: Modal content not rendered immediately after `.open = true`

```typescript
// ❌ Bad - May fail in CI
modal.open = true;
await waitForUpdate(modal);
const title = modal.querySelector('.usa-modal__heading');

// ✅ Good - CI-safe
modal.open = true;
await waitForModalOpen(modal);
const title = modal.querySelector('.usa-modal__heading');
```

**How it works**:
- 3 property propagation iterations
- Extra 100ms wait locally, 200ms in CI
- Ensures USWDS modal initialization completes

#### Pattern 4: Component-Specific Timing

**Accordion (transition wait)**:
```typescript
// ❌ Bad - May fail in CI
button.click();
await waitForUpdate(accordion);
expect(button.getAttribute('aria-expanded')).toBe('true');

// ✅ Good - CI-safe
button.click();
await waitForAccordionTransition(accordion);
expect(button.getAttribute('aria-expanded')).toBe('true');
```

**Combo-box (initialization wait)**:
```typescript
// ❌ Bad - May fail in CI
const comboBox = document.createElement('usa-combo-box');
document.body.appendChild(comboBox);
await waitForUpdate(comboBox);
const list = comboBox.querySelector('ul');

// ✅ Good - CI-safe
const comboBox = document.createElement('usa-combo-box');
document.body.appendChild(comboBox);
await waitForComboBoxInit(comboBox);
const list = comboBox.querySelector('ul');
```

**Date Picker (calendar rendering wait)**:
```typescript
// ❌ Bad - May fail in CI
const datePicker = document.createElement('usa-date-picker');
document.body.appendChild(datePicker);
await waitForUpdate(datePicker);
const calendar = datePicker.querySelector('.usa-date-picker__calendar');

// ✅ Good - CI-safe
const datePicker = document.createElement('usa-date-picker');
document.body.appendChild(datePicker);
await waitForDatePickerInit(datePicker);
const calendar = datePicker.querySelector('.usa-date-picker__calendar');
```

#### Proactive Validation

Automatically detect vulnerable patterns before CI runs:

```bash
# Run timing validation (included in pre-commit hooks)
pnpm run validate:test-timing
```

**Validation detects**:
- 6 types of vulnerable timing patterns
- Files missing CI timing utility imports
- Provides actionable fix examples with line numbers

**Example output**:
```
🔍 Validating test timing patterns...
📊 Validated 167 test files

❌ Critical timing issues found:

  packages/uswds-wc-forms/src/components/select/usa-select.test.ts
    Line 156: Property → DOM Without Propagation Wait
    Property changes may not propagate to DOM immediately.

  💡 Fix:
    // Change this:
    element.required = true;
    await waitForUpdate(element);

    // To this:
    element.required = true;
    await waitForPropertyPropagation(element);

📊 Summary: 144 errors, 569 warnings
```

#### Component-Specific Wait Times

All timing utilities automatically adjust based on environment:

| Utility | Local Iterations | CI Iterations | Extra Wait (local) | Extra Wait (CI) |
|---------|-----------------|---------------|-------------------|-----------------|
| `waitForPropertyPropagation()` | 2 | 4 | - | - |
| `waitForARIAAttribute()` | - | - | 50ms poll | 100ms poll |
| `waitForModalOpen()` | 3 | 6 | +100ms | +200ms |
| `waitForAccordionTransition()` | 2 | 4 | +300ms | +400ms |
| `waitForComboBoxInit()` | 3 | 6 | +150ms | +300ms |
| `waitForDatePickerInit()` | 3 | 6 | +150ms | +300ms |

#### Migration Guide

**Step 1**: Add import to test file
```typescript
import {
  waitForPropertyPropagation,
  waitForARIAAttribute
} from '@uswds-wc/test-utils';
```

**Step 2**: Replace vulnerable patterns
```typescript
// Before
element.required = true;
await waitForUpdate(element);
const input = element.querySelector('input');

// After
element.required = true;
await waitForPropertyPropagation(element);
const input = element.querySelector('input');
```

**Step 3**: Verify with validation script
```bash
pnpm run validate:test-timing
```

#### When to Use

**Always use for**:
- Setting element properties that affect child elements
- Checking ARIA attributes
- Modal/accordion/combo-box/date-picker interactions

**Not needed for**:
- Simple element creation
- Static querySelector (no property changes)
- synchronous operations

#### Audit Results Summary

Comprehensive codebase audit found:
- **713 total timing issues** across **97 test files**
- **144 critical errors** (Property → DOM propagation)
- **569 warnings** (ARIA attributes, component-specific)

**Top offenders**:
- `usa-range-slider.test.ts` - 11 errors
- `usa-date-picker.test.ts` - 11 errors
- `usa-file-input.test.ts` - 7 errors
- `usa-email-address-pattern.test.ts` - 5 errors

**Full audit report**: `/tmp/test-timing-audit.txt`

### 4. Cleanup

Remove test elements in `afterEach`:

```typescript
afterEach(() => {
  element.remove();
});
```

### 5. Accessibility Testing

Add axe-core tests to catch issues early:

```typescript
import { testComponentAccessibility, USWDS_A11Y_CONFIG } from '../__tests__/accessibility-utils.js';

it('should pass comprehensive accessibility tests', async () => {
  await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
});
```

### 6. JavaScript Integration Validation

Automated USWDS compliance checking (included automatically):

```typescript
import { validateComponentJavaScript } from '../__tests__/test-utils.js';

// Automatic validation in component tests
it('should have proper USWDS JavaScript integration', () => {
  validateComponentJavaScript(element);
});
```

## Test Configuration

### Vitest Configuration

- **vitest.config.ts**: Main configuration for unit tests (jsdom)
- **vitest.storybook.config.ts**: Storybook-specific tests (browser)

### Separate Configurations

Ensures:
- Unit tests run independently without browser overhead
- Storybook tests have proper browser context
- No configuration conflicts
- Optimal performance for each scenario

## Pre-commit Testing

Tests run automatically before commits:

```bash
# Pre-commit hook runs:
# 1. Repository organization cleanup
# 2. USWDS script tag validation
# 3. Layout forcing pattern
# 4. Component issue detection
# 5. USWDS compliance
# 6. Linting
# 7. TypeScript compilation
# 8. Code quality review
# 9. Component-specific validations
# 10. Test expectations
# 11. USWDS transformation validation
# 12. Component JavaScript integration
# 13. Documentation synchronization
```

## Test Failure Policy

**Do not commit if:**
- ❌ Any tests fail
- ❌ TypeScript errors exist
- ❌ Linting errors present
- ❌ Accessibility violations found
- ❌ USWDS compliance issues detected

## Layout and Visual Regression Testing

Prevent CSS and layout issues with comprehensive validation:

### Testing Strategies

1. **DOM Structure Validation** - Verify exact USWDS HTML structure
2. **CSS Display Properties** - Check computed styles match USWDS
3. **Visual Rendering Tests** - Ensure components render correctly in browser
4. **Component Composition** - Validate use of web components vs inline HTML
5. **USWDS Reference Comparison** - Compare against official USWDS patterns

### Example Tests

See comprehensive testing examples:
- [TESTING_LAYOUT_VISUAL_REGRESSIONS.md](./TESTING_LAYOUT_VISUAL_REGRESSIONS.md) - Complete methodology
- [docs/examples/header-layout-tests.example.ts](./examples/header-layout-tests.example.ts) - Working test examples

### Key Test Patterns

```typescript
// DOM Structure Validation
it('should match USWDS structure exactly', async () => {
  const search = element.querySelector('usa-search');
  const parent = search?.parentElement;

  // Verify correct parent element
  expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);

  // Ensure NOT in wrong structure
  expect(search?.closest('ul')).toBeNull();
});

// CSS Display Properties
it('should have correct display style', async () => {
  const search = element.querySelector('usa-search') as HTMLElement;
  const styles = window.getComputedStyle(search);

  expect(styles.display).toBe('inline-block');
  expect(styles.width).toBe('100%');
});

// Component Composition
it('should use web components not inline HTML', async () => {
  const searchComponent = element.querySelector('usa-search');
  expect(searchComponent?.tagName.toLowerCase()).toBe('usa-search');

  // Should NOT duplicate HTML inline
  const inlineSearch = element.querySelectorAll('form.usa-search');
  expect(inlineSearch.length).toBe(0);
});
```

### Visual Testing Checklist

Before committing layout-heavy components:

- [ ] DOM structure exactly matches USWDS reference
- [ ] CSS display properties verified
- [ ] No extra wrapper elements present
- [ ] Component composition validated (uses web components)
- [ ] Visual rendering confirmed (not cut off or hidden)
- [ ] Responsive layout tested
- [ ] Storybook visual regression (Chromatic) passes

## Further Reading

- [TESTING_LAYOUT_VISUAL_REGRESSIONS.md](./TESTING_LAYOUT_VISUAL_REGRESSIONS.md) - Layout testing methodology
- [TESTING_INFRASTRUCTURE_ENHANCEMENT.md](docs/archived/TESTING_INFRASTRUCTURE_ENHANCEMENT.md) - Enhanced testing features
- [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md) - Troubleshooting test failures
- [Component README files](../packages/*/src/components/) - Component-specific testing notes in each package
