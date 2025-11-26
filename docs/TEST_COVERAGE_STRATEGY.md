# Test Coverage Strategy

**Purpose**: Clarify which tests run where and why, prevent duplicate test coverage.

**Created**: 2025-11-26
**Status**: Active Guide

## Testing Philosophy

We use a **layered testing approach** with clear separation of concerns:

1. **Vitest (Unit Tests)** - Component logic, state management, properties
2. **Cypress (Browser Tests)** - Interactive behavior, USWDS integration, visual validation
3. **Playwright (Cross-Browser Tests)** - Accessibility, performance, cross-browser compatibility

## Test Layer Responsibilities

### Layer 1: Vitest Unit Tests

**Purpose**: Fast, isolated component logic testing

**What to Test**:
- Component property bindings
- State management
- Event emissions
- DOM structure (Light DOM only)
- Accessibility attributes (ARIA, roles)
- Edge cases and error handling

**What NOT to Test**:
- Browser-specific behavior (positioning, sizing, getBoundingClientRect)
- Mouse/touch interactions
- USWDS JavaScript transformation
- Visual appearance
- Cross-browser compatibility

**Test File Pattern**: `usa-[component].test.ts`

**Example**:
```typescript
// packages/uswds-wc-feedback/src/components/alert/usa-alert.test.ts
describe('USAAlert', () => {
  it('should set type property correctly', () => {
    element.type = 'success';
    expect(element.type).toBe('success');
  });

  it('should emit close event when close button clicked', () => {
    // Event emission logic
  });
});
```

### Layer 2: Cypress Component Tests

**Purpose**: Browser-based interactive behavior testing

**What to Test**:
- USWDS JavaScript integration
- Mouse/touch/keyboard interactions
- Focus management
- Modal/tooltip positioning
- Visual state changes
- Timing and animation
- DOM transformations

**What NOT to Test**:
- Simple property bindings (covered by Vitest)
- Cross-browser differences (covered by Playwright)
- Performance metrics (covered by Playwright)

**Test File Pattern**: `usa-[component].component.cy.ts`

**Example**:
```typescript
// packages/uswds-wc-feedback/src/components/modal/usa-modal.component.cy.ts
describe('USAModal Browser Behavior', () => {
  it('should open modal on button click', () => {
    cy.mount('<button id="open">Open</button><usa-modal id="modal">...</usa-modal>');
    cy.get('#open').click();
    cy.get('usa-modal').should('have.attr', 'open', 'true');
    cy.get('.usa-modal-wrapper').should('be.visible');
  });

  it('should close modal on Escape key', () => {
    // Keyboard interaction testing
  });
});
```

### Layer 3: Playwright Cross-Browser Tests

**Purpose**: Accessibility, performance, and cross-browser validation

**What to Test**:
- Accessibility compliance (axe-core)
- Cross-browser compatibility (Chromium, Firefox, Webkit)
- Performance metrics
- Screen reader compatibility
- Responsive behavior across viewports

**What NOT to Test**:
- Component logic (covered by Vitest)
- Interactive behavior (covered by Cypress)

**Test File Pattern**: `tests/playwright/*.spec.ts`

**Example**:
```typescript
// tests/playwright/accessibility-cross-browser.spec.ts
test('Modal should pass accessibility tests in all browsers', async ({ page, browserName }) => {
  await page.goto('http://localhost:6006/iframe.html?id=feedback-modal--default');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Removed Test Patterns

### ❌ Browser Test Files (`.browser.test.ts`)

**DEPRECATED**: Browser test files in Vitest are no longer used.

**Why Removed**:
- Duplicate coverage with Cypress tests
- Fail in jsdom environment (no real browser)
- Maintenance burden (2600+ lines of skipped tests)

**Migration Path**:
If you see a `.browser.test.ts` file:
1. Check Cypress test coverage (`*.component.cy.ts` and `cypress/e2e/`)
2. If coverage exists, delete the browser test file
3. If coverage missing, add to Cypress (not Vitest)

**Files Removed** (2025-11-26):
- ✅ `packages/uswds-wc-feedback/src/components/modal/usa-modal.browser.test.ts` (2333 lines)
  - Cypress coverage: `usa-modal.component.cy.ts` (53 tests), `usa-modal.behavioral.cy.ts` (20 tests), `usa-modal-timing-regression.component.cy.ts` (11 tests), plus 4 E2E test files
- ✅ `packages/uswds-wc-feedback/src/components/tooltip/usa-tooltip.browser.test.ts` (275 lines)
  - Cypress coverage: `usa-tooltip.component.cy.ts`, `usa-tooltip-timing-regression.component.cy.ts`, plus 2 E2E test files

## Test Coverage by Component

### Modal Component

**Unit Tests** (`usa-modal.test.ts`):
- Property bindings (heading, description, open, large, forceAction)
- Event emissions (modal-open, modal-close, modal-primary-action, modal-secondary-action)
- ARIA attributes
- DOM structure

**Cypress Tests**:
- `usa-modal.component.cy.ts` - 53 tests (Component functionality, edge cases)
- `usa-modal.behavioral.cy.ts` - 20 tests (Behavioral verification)
- `usa-modal-timing-regression.component.cy.ts` - 11 tests (Timing issues)
- `cypress/e2e/modal-focus-management.cy.ts` - Focus management
- `cypress/e2e/modal-programmatic-api.cy.ts` - Programmatic API
- `cypress/e2e/modal-storybook-test.cy.ts` - Storybook integration
- `cypress/e2e/modal-variants.cy.ts` - Modal variants

**Playwright Tests**:
- `tests/playwright/accessibility-cross-browser.spec.ts` - Cross-browser accessibility

**Total**: 84+ tests across all layers

### Tooltip Component

**Unit Tests** (`usa-tooltip.test.ts`):
- Property bindings (text, position, visible, classes)
- Event emissions
- ARIA attributes
- DOM structure

**Cypress Tests**:
- `usa-tooltip.component.cy.ts` - Component functionality
- `usa-tooltip-timing-regression.component.cy.ts` - Timing issues
- `cypress/e2e/tooltip.cy.ts` - Tooltip behavior
- `cypress/e2e/tooltip-positioning.cy.ts` - Positioning logic

**Playwright Tests**:
- Cross-browser accessibility validation

**Total**: 20+ tests across all layers

## Decision Matrix: Which Test Layer?

| What You're Testing | Test Layer | Why |
|---------------------|------------|-----|
| Property binding | Vitest Unit | Fast, isolated, no browser needed |
| Event emission | Vitest Unit | Fast, isolated, no browser needed |
| DOM structure | Vitest Unit | Fast, no browser needed |
| ARIA attributes | Vitest Unit | Fast, no browser needed |
| Mouse interaction | Cypress | Requires real browser events |
| Keyboard navigation | Cypress | Requires real browser events |
| USWDS JS transformation | Cypress | Requires USWDS initialization |
| Modal positioning | Cypress | Requires real DOM layout |
| Focus management | Cypress | Requires real browser focus |
| Accessibility compliance | Playwright | Cross-browser, axe-core |
| Cross-browser compatibility | Playwright | Multiple browser engines |
| Performance metrics | Playwright | Performance APIs |
| Screen reader compatibility | Playwright | Accessibility tree |

## Best Practices

### ✅ DO

- Use Vitest for component logic and state
- Use Cypress for interactive behavior
- Use Playwright for accessibility and cross-browser
- Keep tests in their appropriate layer
- Remove duplicate coverage
- Reference related test files in comments

### ❌ DON'T

- Create `.browser.test.ts` files (use Cypress instead)
- Test browser behavior in Vitest (use Cypress)
- Duplicate tests across layers
- Skip tests without documented reason
- Create "skipped" test files

## Skipped Tests Policy

If you must skip a test:

1. **Add clear documentation**:
   ```typescript
   /**
    * SKIP: Modal rendering timing issue in unit tests - buttons not rendering
    * Coverage: cypress/e2e/modal-focus-management.cy.ts (lines 45-78)
    * Issue: #1234
    */
   it.skip('should focus modal when opened', () => {
     // ...
   });
   ```

2. **Link to alternative coverage** (Cypress or Playwright)
3. **Reference GitHub issue** if it's a bug
4. **Never commit entire skipped test files** (delete them instead)

## Future Improvements

### Performance Test Skipping

**File**: `packages/uswds-wc-layout/src/components/process-list/usa-process-list.test.ts`

**Current**: 2 performance tests skipped in CI with `it.skipIf(process.env.CI === 'true')`

**Investigation Needed**:
- Determine if skip is intentional (performance tests too slow/flaky)
- Consider moving to separate performance test suite
- Document decision in this file

## Related Documentation

- [docs/TESTING_GUIDE.md](TESTING_GUIDE.md) - Complete testing documentation
- [docs/CI_CLEANUP_PLAN.md](CI_CLEANUP_PLAN.md) - CI/CD cleanup tracking
- [docs/CYPRESS_TESTING_PATTERNS.md](CYPRESS_TESTING_PATTERNS.md) - Cypress patterns
- [docs/PLAYWRIGHT_TESTING_PATTERNS.md](PLAYWRIGHT_TESTING_PATTERNS.md) - Playwright patterns

## Summary

**Test Coverage Philosophy**: Each layer has a specific purpose. Avoid duplicate coverage by using the right tool for the right job.

**Key Principle**: **Browser behavior → Cypress. Component logic → Vitest. Accessibility & Cross-browser → Playwright.**
