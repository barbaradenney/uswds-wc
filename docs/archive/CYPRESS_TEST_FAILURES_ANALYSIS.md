# Cypress Test Failures Analysis

**Date:** 2025-11-11
**CI Run:** 19253387797
**Status:** 240/373 passing (64% pass rate)

## Executive Summary

After fixing the CI infrastructure issues (story ID migration), Cypress tests are now running successfully. The remaining 133 test failures are legitimate test issues requiring individual attention, not infrastructure problems.

### Progress Made
- ✅ **Infrastructure Fixed:** Tests can find and load stories (was completely broken)
- ✅ **Story IDs Migrated:** 113 references updated across 29 files
- ✅ **Massive Improvement:** From 5/373 passing (1%) to 240/373 passing (64%)

## Failing Tests by Category

### Critical (100% Failure Rate) - 3 files

#### 1. storybook-integration.cy.ts (0/6 passing)
**File:** `cypress/e2e/storybook-integration.cy.ts`

**Issues:**
- Test expects `.usa-button` class on `<usa-button>` component
- Test expects `.usa-alert` class on `<usa-alert>` component
- Accessibility violations in accordion story
- Tests are looking for CSS classes instead of using component selectors

**Error Examples:**
```
AssertionError: Timed out retrying after 4000ms: expected '<usa-button>' to have class 'usa-button'
AssertionError: Timed out retrying after 4000ms: expected '<usa-alert>' to have class 'usa-alert'
```

**Root Cause:** Tests are checking for USWDS CSS classes on web components instead of checking the Shadow DOM or component behavior.

**Fix Strategy:**
1. Update selectors to target actual web components: `usa-button`, `usa-alert`
2. If checking for USWDS classes, look inside the component's rendered HTML
3. Fix accessibility violations in accordion story

---

#### 2. storybook-navigation-regression.cy.ts (0/5 passing)
**File:** `cypress/e2e/storybook-navigation-regression.cy.ts`

**Issues:**
- Tests checking for `.usa-modal-wrapper` but component may not have rendered
- BoundingClientRect regression tests timing out
- Navigation between stories causing state issues

**Error Pattern:** Tests rely on Storybook navigation which may have timing issues.

**Fix Strategy:**
1. Add proper wait conditions after navigation
2. Verify modal is fully initialized before checking wrapper
3. Add layout forcing after story navigation

---

#### 3. site-alert-dom-manipulation.cy.ts (0/16 passing)
**File:** `cypress/e2e/site-alert-dom-manipulation.cy.ts`

**Status:** All 16 tests failing

**Likely Issues:**
- Story not loading
- Component not rendering
- Selector mismatch

**Action Required:** Full investigation needed - likely story ID issue or component initialization problem.

---

### High Priority (>50% Failure Rate) - 2 files

#### 4. in-page-navigation-sticky-active.cy.ts (2/26 passing - 92% failure)
**File:** `cypress/e2e/in-page-navigation-sticky-active.cy.ts`

**Passing Tests:**
- Basic rendering tests

**Failing Tests:**
- 24 tests related to sticky behavior and active state tracking

**Likely Issues:**
- Scroll-based tests with timing issues
- Intersection Observer not firing in test environment
- Active state not updating during scroll

**Fix Strategy:**
1. Add scroll event completion waits
2. Mock/stub Intersection Observer if needed
3. Verify USWDS JavaScript is initializing scroll listeners

---

### Medium Priority (25-75% Failure Rate) - 7 files

#### 5. accessibility.cy.ts (3/13 passing - 77% failure)
**File:** `cypress/e2e/accessibility.cy.ts`

**Common Error:**
```
AssertionError: Timed out retrying after 4000ms: expected '<button>' to be 'focused'
```

**Pattern:** Keyboard navigation and focus management tests failing.

**Issues:**
- Focus not being set properly
- Tab key navigation not working as expected
- ARIA attributes not present or incorrect

**Affected Components:**
- Accordion
- Alert
- Button
- Several others

**Fix Strategy:**
1. Add explicit `cy.wait()` after focus commands
2. Verify components are fully initialized before testing
3. Check if USWDS JavaScript is setting up focus management
4. May need to force focus with `.focus()` before assertions

---

#### 6. date-picker-calendar.cy.ts (12/24 passing - 50% failure)
**File:** `cypress/e2e/date-picker-calendar.cy.ts`

**Passing:** Basic rendering, some date selection
**Failing:** Calendar navigation, month changes, date validation

**Issues:**
- Calendar popup timing issues
- Month navigation not working
- Date selection in calendar failing

**Fix Strategy:**
1. Add waits after calendar opens
2. Verify USWDS datepicker JavaScript is loaded
3. Check for proper event listeners on calendar controls

---

#### 7. date-picker-month-navigation.cy.ts (9/17 passing - 47% failure)
**File:** `cypress/e2e/date-picker-month-navigation.cy.ts`

**Issues:** Similar to calendar tests - month navigation failing

---

#### 8. header-navigation.cy.ts (6/15 passing - 60% failure)
**File:** `cypress/e2e/header-navigation.cy.ts`

**Passing:** Basic header rendering
**Failing:** Menu toggle, navigation interactions, mobile menu

**Issues:**
- Menu toggle not working
- Mobile menu not opening
- Navigation items not clickable

**Fix Strategy:**
1. Verify USWDS header JavaScript is initialized
2. Check menu toggle button selectors
3. Add waits after menu toggle clicks

---

#### 9. in-page-navigation-scroll.cy.ts (9/16 passing - 44% failure)
**File:** `cypress/e2e/in-page-navigation-scroll.cy.ts`

**Issues:** Scroll-to-section behavior failing

---

#### 10. character-count-accessibility.cy.ts (11/17 passing - 35% failure)
**File:** `cypress/e2e/character-count-accessibility.cy.ts`

**Passing:** Label association, some keyboard tests
**Failing:** Comprehensive a11y tests, some character count updates

**Issues:**
- Accessibility test timing out
- Character count not updating properly
- Screen reader announcements not working

---

#### 11. modal-focus-management.cy.ts (12/14 passing - 14% failure)
**File:** `cypress/e2e/modal-focus-management.cy.ts`

**Issues:** Focus trap and return focus failing (2 tests)

**Fix Strategy:**
1. Verify modal is fully opened before testing focus
2. Check USWDS modal JavaScript focus trap implementation
3. Add waits after modal close for focus return

---

## Common Patterns Across Failures

### 1. Focus/Keyboard Navigation Issues (~40 tests)
**Pattern:** `expected '<element>' to be 'focused'` timeouts

**Root Cause Options:**
- Components not fully initialized when tests run
- USWDS JavaScript not setting up focus management
- Test assertions running before focus completes

**Global Fix Approach:**
```javascript
// Add custom command with built-in wait
Cypress.Commands.add('assertFocused', (selector) => {
  cy.get(selector)
    .should('be.visible')
    .wait(100) // Allow focus to settle
    .should('have.focus');
});
```

### 2. Timing/Async Issues (~30 tests)
**Pattern:** Tests timing out or assertions failing intermittently

**Fix Approach:**
- Increase default command timeout for slow operations
- Add explicit waits after component state changes
- Use `cy.wait()` after USWDS JavaScript interactions

### 3. Component Initialization (~20 tests)
**Pattern:** Components expected to have certain classes/attributes but don't

**Fix Approach:**
- Ensure tests wait for USWDS JavaScript to initialize
- Add custom commands to verify component ready state
- Check for `data-` attributes or classes USWDS adds on init

### 4. Web Component vs USWDS Class Confusion (~10 tests)
**Pattern:** Tests checking for `.usa-*` classes on `<usa-*>` elements

**Fix Approach:**
- Update selectors to target correct elements
- Look inside component structure for USWDS classes
- Use `.shadow()` if components use Shadow DOM (they shouldn't but verify)

## Recommended Fix Order

### Phase 1: Quick Wins (Estimated: 2-3 hours)
1. **storybook-integration.cy.ts** - Update selectors (simple find/replace)
2. **storybook-navigation-regression.cy.ts** - Add wait conditions
3. **modal-focus-management.cy.ts** - Only 2 failing tests

### Phase 2: Medium Effort (Estimated: 4-6 hours)
4. **accessibility.cy.ts** - Add focus settling waits globally
5. **header-navigation.cy.ts** - Fix menu toggle
6. **character-count-accessibility.cy.ts** - Fix remaining 6 tests

### Phase 3: Complex (Estimated: 8-10 hours)
7. **date-picker-calendar.cy.ts** - Calendar interaction fixes
8. **date-picker-month-navigation.cy.ts** - Month navigation
9. **in-page-navigation-scroll.cy.ts** - Scroll behavior
10. **in-page-navigation-sticky-active.cy.ts** - Complex scroll/intersection observer

### Phase 4: Investigation Required (Estimated: 2-4 hours)
11. **site-alert-dom-manipulation.cy.ts** - Full investigation needed

## Global Fixes to Consider

### 1. Increase Default Timeouts
```javascript
// cypress.config.ts
export default defineConfig({
  e2e: {
    defaultCommandTimeout: 8000, // Increased from 4000
    pageLoadTimeout: 60000,
  }
});
```

### 2. Add Component Ready Wait
```javascript
// cypress/support/commands.ts
Cypress.Commands.add('waitForUSWDS', () => {
  cy.window().then((win) => {
    expect(win.USWDS).to.exist;
  });
});

// Use in tests:
beforeEach(() => {
  cy.waitForUSWDS();
});
```

### 3. Add Focus Helper
```javascript
Cypress.Commands.add('focusAndVerify', (selector) => {
  cy.get(selector)
    .focus()
    .wait(200) // Let focus settle
    .should('have.focus');
});
```

## Testing Recommendations

### Before Fixing
1. Run tests locally to reproduce failures
2. Enable Cypress video recording for failed tests
3. Check browser console for JavaScript errors

### While Fixing
1. Fix one file at a time
2. Run full test suite after each fix to catch regressions
3. Document any USWDS behavior quirks discovered

### After Fixing
1. Run tests multiple times to verify no flakiness
2. Update test timeouts if needed
3. Add comments explaining any non-obvious waits

## Known Issues

### USWDS JavaScript Timing
Some USWDS components initialize asynchronously. Tests may need to wait for:
- DOM mutations
- Event listener setup
- CSS class additions
- ARIA attribute updates

### Storybook Navigation
Tests that navigate between stories may encounter:
- Layout not recalculating (known issue, has workaround in preview.ts)
- Component state not resetting
- Event listeners persisting

## Next Steps

1. **Immediate:** Start with Phase 1 (Quick Wins)
2. **Short-term:** Complete Phases 2-3 over next sprint
3. **Long-term:** Investigate Phase 4 and add flaky test detection

## Resources

- **CI Run with Failures:** https://github.com/barbaradenney/uswds-wc/actions/runs/19253387797
- **Cypress Best Practices:** https://docs.cypress.io/guides/references/best-practices
- **USWDS Documentation:** https://designsystem.digital.gov/
- **Test Screenshots:** Available in CI artifacts under `cypress-screenshots`

---

**Generated:** 2025-11-11
**Last Updated:** 2025-11-11
**Maintainer:** Development Team
