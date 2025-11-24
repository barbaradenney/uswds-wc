# Path to 100% Test Pass Rate - Action Plan

**Goal**: Achieve 100% pass rate for Vitest and Cypress before launch
**Current**: Vitest 93.4% | Cypress 60%
**Timeline**: Systematic fixes prioritized by impact

---

## Current State Analysis

### Vitest Failures (145 failing)
| Error Type | Count | Impact | Fix Time |
|------------|-------|--------|----------|
| Failed imports (missing helpers) | 28 | HIGH | 30min |
| Navigation not implemented (jsdom) | 34 | MEDIUM | 1hr |
| Accordion async cleanup | 42 | HIGH | 1hr |
| Tooltip null references | ~20 | MEDIUM | 45min |
| Lit ChildPart errors | ~10 | LOW | 30min |
| Other async issues | ~11 | LOW | 1hr |

**Total Estimated**: 5-6 hours for 100% Vitest

### Cypress Failures (33 failing)
| Component | Failing | Fix Strategy | Time |
|-----------|---------|--------------|------|
| File Input | 8 | USWDS behavior expectations | 1hr |
| Character Count | 10 | Timing + assertions | 2hr |
| Summary Box | 7 (+ 2 skip) | For-loop + timing | 1hr |
| Alert | 3 | Edge case assertions | 30min |
| Button Group | 5 | Layout tolerance or fix | 30min |

**Total Estimated**: 5-6 hours for 100% Cypress

---

## Priority 1: Quick Wins (2 hours → +50 tests)

### Fix 1: Missing Test Helpers (30 min → +28 files)
**Problem**: Tests import `./test-utils.js` that doesn't exist
**Solution**: Update imports to use shared test utils

```typescript
// Change from:
import { waitForUpdate } from './test-utils.js';

// To:
import { waitForUpdate } from '../../../__tests__/test-utils.js';
```

**Files to fix**: 28 *-interaction.test.ts and *-dom-validation.test.ts files

**Action**:
```bash
# Find and replace in all test files
find src/components -name "*-interaction.test.ts" -o -name "*-dom-validation.test.ts" | \
  xargs sed -i '' 's|from "./test-utils.js"|from "../../../__tests__/test-utils.js"|g'

find src/components -name "*-dom-validation.test.ts" | \
  xargs sed -i '' 's|from "./dom-structure-validation.js"|from "../../../__tests__/dom-structure-validation.js"|g'
```

### Fix 2: Accordion Async Cleanup (1 hr → +42 errors fixed)
**Problem**: Accordion tries to toggle after DOM cleanup
**Solution**: Clear timers and cleanup properly in afterEach

**Add to accordion tests**:
```typescript
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  element?.remove();
  document.body.innerHTML = '';
});
```

### Fix 3: Card Navigation Mock (30 min → +34 errors)
**Problem**: jsdom doesn't support `window.location.href = ...`
**Solution**: Mock navigation in card tests

```typescript
beforeEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' }
  });
});
```

---

## Priority 2: Test Infrastructure (2 hours → +30 tests)

### Fix 4: Tooltip Null References (45 min → +20 errors)
**Problem**: Tooltip tries to show/hide after element removed
**Solution**: Add null checks in tooltip-behavior.ts

```typescript
const showToolTip = (tooltipBody: HTMLElement | null, ...) => {
  if (!tooltipBody) return; // Add this check
  tooltipBody.setAttribute('aria-hidden', 'false');
  // ...
};
```

### Fix 5: Global Test Cleanup Helper (30 min → +10 errors)
**Problem**: Various async cleanup issues
**Solution**: Create shared cleanup utility

```typescript
// __tests__/test-utils.ts
export function cleanupAfterTest() {
  vi.clearAllTimers();
  vi.useRealTimers();
  document.body.innerHTML = '';
  // Clear any USWDS state
  if (window.USWDS) {
    // USWDS cleanup if needed
  }
}
```

### Fix 6: Lit ChildPart Errors (30 min → +10 errors)
**Problem**: List component innerHTML conflicts with Lit
**Solution**: Use proper Lit patterns or skip in jsdom

---

## Priority 3: Cypress Refinements (5 hours → 100%)

### Fix 7: File Input Expectations (1 hr → +7-8 tests)
**Action**:
1. Read USWDS file-input source
2. Adjust error message expectations
3. Add timing for file processing
4. Update drag-drop assertions

### Fix 8: Character Count Timing (2 hrs → +6-7 tests)
**Action**:
1. Add `cy.wait()` for USWDS transformation
2. Adjust assertions for `.usa-character-count__status`
3. Handle ARIA live region updates
4. Fix timing-dependent tests

### Fix 9: Summary Box For-Loops (1 hr → +2 tests)
**Action**:
1. Refactor 2 skipped for-loop tests to recursive
2. Use `cy.wrap().each()` pattern
3. Unskip and verify passing

### Fix 10: Alert + Button Group (1 hr → +8 tests)
**Action**:
1. Review 3 alert edge cases
2. Determine button-group layout tolerance
3. Fix or document as acceptable

---

## Execution Plan

### Phase 1: Vitest Quick Wins (2 hours)
```bash
# 1. Fix imports (automated)
npm run fix:test-imports

# 2. Add cleanup to accordion
# Edit: src/components/accordion/usa-accordion.test.ts

# 3. Mock navigation in card
# Edit: src/components/card/usa-card.test.ts

# Run tests
npm test

# Expected: 93.4% → 98%
```

### Phase 2: Vitest Infrastructure (2 hours)
```bash
# 4. Add null checks to tooltip
# Edit: src/components/tooltip/usa-tooltip-behavior.ts

# 5. Create cleanup helper
# Edit: __tests__/test-utils.ts

# 6. Fix Lit ChildPart
# Edit: src/components/list/usa-list.test.ts

# Run tests
npm test

# Expected: 98% → 100%
```

### Phase 3: Cypress Refinements (5 hours)
```bash
# 7. File input
npx cypress run --spec "cypress/e2e/file-input-drag-drop.cy.ts"

# 8. Character count
npx cypress run --spec "cypress/e2e/character-count-accessibility.cy.ts"

# 9. Summary box
npx cypress run --spec "cypress/e2e/summary-box-content.cy.ts"

# 10. Alert + Button group
npx cypress run --spec "cypress/e2e/alert-announcements.cy.ts"
npx cypress run --spec "cypress/e2e/button-group-accessibility.cy.ts"

# Expected: 60% → 100%
```

---

## Success Criteria

### Vitest (Target: 100%)
- [ ] All test files have valid imports
- [ ] No unhandled async errors
- [ ] All component tests pass
- [ ] Clean test execution (no warnings)

### Cypress (Target: 100%)
- [ ] File input: 19/19 passing
- [ ] Character count: 17/17 passing
- [ ] Summary box: 14/14 passing
- [ ] Alert: 11/11 passing
- [ ] Button group: 22/22 passing

### Final Validation
- [ ] `npm test` completes with 100% pass
- [ ] `npx cypress run` completes with 100% pass
- [ ] No skipped tests without documentation
- [ ] All errors resolved

---

## Risk Mitigation

### If Tests Still Fail After Fixes

**Backup Plan A**: Document as known limitations
- jsdom vs browser differences
- USWDS timing dependencies
- Acceptable for launch if <1% failure rate

**Backup Plan B**: Skip problematic tests with justification
- Add to APPROVED_SKIPS with reason
- Create Cypress coverage for skipped tests
- Document in test skip policy

**Backup Plan C**: Adjust acceptance criteria
- 99% pass rate acceptable if remaining issues are:
  - Browser-only functionality
  - Timing race conditions
  - Non-critical edge cases

---

## Estimated Timeline

| Phase | Duration | Cumulative | Vitest | Cypress |
|-------|----------|------------|--------|---------|
| Start | - | 0hr | 93.4% | 60% |
| Quick Wins | 2hr | 2hr | 98% | 60% |
| Infrastructure | 2hr | 4hr | 100% | 60% |
| Cypress Refinement | 5hr | 9hr | 100% | 100% |
| **Total** | **9hr** | **9hr** | **100%** | **100%** |

**With breaks/testing**: ~12 hours total

---

## Next Immediate Action

**START HERE**: Fix missing test imports (30 min, +28 files)

This single fix will:
- Eliminate 28 test file failures
- Improve pass rate from 93.4% → 96.8%
- Unblock other test failures
- Quick validation of approach

```bash
# Execute this now:
cd /Users/barbaramiles/Documents/Github/uswds-wc

# Fix interaction test imports
find src/components -name "*-interaction.test.ts" -exec sed -i '' \
  's|from "./test-utils.js"|from "../../../__tests__/test-utils.js"|g' {} \;

# Fix dom-validation test imports
find src/components -name "*-dom-validation.test.ts" -exec sed -i '' \
  's|from "./dom-structure-validation.js"|from "../../../__tests__/dom-structure-validation.js"|g' {} \;

# Fix specific date-range-picker import
sed -i '' 's|from "./usa-date-picker.ts"|from "../date-picker/usa-date-picker.ts"|g' \
  src/components/date-range-picker/date-range-picker-dom-validation.test.ts

# Run tests to verify
npm test
```

---

✅ **Ready to achieve 100% pass rate - Let's execute!**
