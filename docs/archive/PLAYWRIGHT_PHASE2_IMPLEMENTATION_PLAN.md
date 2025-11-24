# Playwright Phase 2: Deep Testing Implementation Plan

**Target:** 8 High-Risk Components
**Estimated Coverage After Phase 2:** 51.1% (23/45 components)
**Timeline:** 8-12 hours implementation time
**Created:** November 1, 2025

## Overview

Phase 2 focuses on components with complex interactions, dynamic content, or known integration challenges. Each component receives comprehensive testing beyond the baseline 4-test suite from Phase 1.

## Test Scope per Component

### Baseline Tests (4 tests - inherited from Phase 1)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

### Deep Testing (6-10 additional tests per component)
5. Interaction workflows
6. State management
7. Edge cases
8. Error handling
9. Integration tests
10. Performance validation

**Total:** 10-14 tests per component × 3 browsers = 30-42 test runs per component

## Priority 1: Form Components (4 components)

### 1. Date Picker (`forms-date-picker--default`)

**Complexity:** High - Calendar widget, date parsing, validation
**Storybook Stories:** 6 variants
**Risk Factors:**
- Complex calendar interactions
- Date format parsing
- Min/max date validation
- Disabled date ranges
- Localization support

**Test Suite (14 tests):**

#### Baseline Tests (4)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

#### Calendar Interaction Tests (4)
5. **Calendar Toggle**
   - Click input to open calendar
   - Verify calendar visibility
   - Click outside to close
   - Escape key to close

6. **Date Selection**
   - Click date in current month
   - Verify input value updates
   - Verify calendar closes
   - Check aria-selected attribute

7. **Month Navigation**
   - Click next/previous month buttons
   - Verify month changes
   - Keyboard navigation (arrows)
   - Year dropdown selection

8. **Today Button**
   - Click "Today" button
   - Verify current date selected
   - Calendar closes automatically

#### Validation Tests (3)
9. **Min/Max Date Constraints**
   - Set min-date attribute
   - Verify earlier dates disabled
   - Set max-date attribute
   - Verify later dates disabled
   - Attempt to select disabled date

10. **Required Field Validation**
    - Mark field required
    - Submit empty form
    - Verify validation error
    - Fill date and re-submit
    - Verify error clears

11. **Date Format Validation**
    - Type invalid date (e.g., "13/45/2025")
    - Verify validation error
    - Type valid date
    - Verify parsing succeeds

#### Edge Cases (3)
12. **Leap Year Handling**
    - Navigate to February of leap year
    - Verify 29 days shown
    - Navigate to non-leap year
    - Verify 28 days shown

13. **Month/Year Boundaries**
    - Select date at end of year (Dec 31)
    - Navigate to next month (Jan 1 next year)
    - Verify year increments
    - Test reverse (Jan 1 → Dec 31 previous year)

14. **Pre-filled Date Handling**
    - Render with value="2025-11-01"
    - Verify calendar opens to correct month/year
    - Verify date is pre-selected

**Implementation File:** `tests/playwright/date-picker-deep.spec.ts`

---

### 2. Date Range Picker (`forms-date-range-picker--default`)

**Complexity:** Very High - Dual calendars, range selection, validation
**Storybook Stories:** 4 variants
**Risk Factors:**
- Start/end date coordination
- Range validation
- Cross-month selection
- Disabled date ranges within selection

**Test Suite (12 tests):**

#### Baseline Tests (4)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

#### Range Selection Tests (4)
5. **Basic Range Selection**
   - Click start date
   - Verify highlighted
   - Click end date (later)
   - Verify range highlighted
   - Both inputs filled

6. **Reverse Selection Handling**
   - Click end date first
   - Click start date (earlier)
   - Verify dates swap correctly
   - Range displayed properly

7. **Cross-Month Selection**
   - Select start date in current month
   - Navigate to next month
   - Select end date
   - Verify range spans months

8. **Range Modification**
   - Select initial range
   - Click new start date
   - Verify end date clears
   - Select new end date
   - Verify new range set

#### Validation Tests (2)
9. **Min Range Validation**
    - Set min-range="7" (7 days minimum)
    - Select range < 7 days
    - Verify validation error
    - Select valid range
    - Error clears

10. **Max Range Validation**
    - Set max-range="30" (30 days maximum)
    - Select range > 30 days
    - Verify validation error
    - Select valid range
    - Error clears

#### Edge Cases (2)
11. **Same Date Selection**
    - Click same date for start and end
    - Verify single-day range allowed
    - Inputs show same date

12. **Disabled Dates in Range**
    - Set disabled dates array
    - Attempt to select range spanning disabled dates
    - Verify selection prevented or adjusted

**Implementation File:** `tests/playwright/date-range-picker-deep.spec.ts`

---

### 3. Time Picker (`forms-time-picker--default`)

**Complexity:** High - Time input, dropdown, 12/24 hour format
**Storybook Stories:** 5 variants
**Risk Factors:**
- 12/24 hour format switching
- AM/PM handling
- Minute increment validation
- Time format parsing

**Test Suite (12 tests):**

#### Baseline Tests (4)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

#### Time Selection Tests (4)
5. **Dropdown Selection**
   - Click input to open dropdown
   - Verify time options visible
   - Click time option
   - Input value updates
   - Dropdown closes

6. **Keyboard Time Entry**
   - Type time in input (e.g., "2:30 PM")
   - Verify parsing succeeds
   - Dropdown shows matching time
   - Tab to next field

7. **Arrow Key Navigation**
   - Focus time input
   - Press up arrow (increment hour)
   - Press down arrow (decrement hour)
   - Alt+Up/Down for minutes

8. **Scroll to Current Time**
   - Open dropdown
   - Verify current time visible/highlighted
   - Click "Now" if available

#### Format Tests (3)
9. **12-Hour Format**
    - Render with format="12"
    - Verify AM/PM options
    - Select PM time
    - Verify "PM" suffix

10. **24-Hour Format**
    - Render with format="24"
    - Verify no AM/PM
    - Select time > 12:00
    - Verify military time (e.g., "14:30")

11. **Format Switching**
    - Change format attribute dynamically
    - Verify displayed time updates
    - Selected time remains valid

#### Edge Cases (1)
12. **Minute Increment Validation**
    - Set step="15" (15-minute increments)
    - Verify dropdown shows :00, :15, :30, :45
    - Type :10 manually
    - Verify rounds to nearest increment

**Implementation File:** `tests/playwright/time-picker-deep.spec.ts`

---

### 4. Character Count (`forms-character-count--default`)

**Complexity:** Medium - Live counting, limit enforcement
**Storybook Stories:** 4 variants
**Risk Factors:**
- Real-time count updates
- Limit enforcement
- Visual feedback on approach/exceed
- Multi-byte character handling

**Test Suite (11 tests):**

#### Baseline Tests (4)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

#### Live Counting Tests (4)
5. **Character Count Display**
   - Type text in textarea
   - Verify count updates live
   - Delete characters
   - Count decrements

6. **Remaining Count Display**
   - Set maxlength="100"
   - Type characters
   - Verify "X characters remaining" updates
   - Approach limit
   - Message changes tone

7. **Visual Feedback States**
   - Type to 80% of limit
   - Verify warning class applied
   - Type to 100% of limit
   - Verify error class applied
   - Under limit: neutral class

8. **Real-time Validation**
   - Type beyond limit
   - Verify submission prevented
   - Delete to under limit
   - Verify submission allowed

#### Limit Enforcement Tests (2)
9. **Hard Limit Enforcement**
    - Set maxlength="50"
    - Type 50 characters
    - Attempt to type more
    - Verify input blocked

10. **Soft Limit Warning**
    - Set threshold="80" (warning at 80%)
    - Type to 40/50 characters
    - Verify warning message appears
    - Visual indicator changes

#### Edge Cases (1)
11. **Multi-byte Character Handling**
    - Type emoji characters (e.g., "😀")
    - Verify count handles correctly
    - Type accented characters (é, ñ)
    - Verify accurate counting

**Implementation File:** `tests/playwright/character-count-deep.spec.ts`

---

## Priority 2: Navigation Components (2 components)

### 5. Header (`navigation-header--default`)

**Complexity:** Very High - Mobile menu, dropdowns, mega menu
**Storybook Stories:** 8 variants
**Risk Factors:**
- Mobile menu toggle
- Dropdown navigation
- Mega menu interactions
- Responsive breakpoint transitions
- Focus management

**Test Suite (13 tests):**

#### Baseline Tests (4)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

#### Mobile Menu Tests (3)
5. **Menu Toggle**
   - Mobile viewport
   - Click hamburger icon
   - Menu slides in
   - Click close/outside
   - Menu slides out

6. **Menu Navigation**
   - Open mobile menu
   - Click nav item
   - Verify navigation
   - Menu closes

7. **Accordion Behavior**
   - Mobile menu with dropdowns
   - Click dropdown trigger
   - Submenu expands
   - Click again
   - Submenu collapses

#### Desktop Navigation Tests (3)
8. **Hover Dropdown**
   - Desktop viewport
   - Hover over nav item with dropdown
   - Dropdown appears
   - Move mouse away
   - Dropdown disappears

9. **Keyboard Dropdown**
   - Tab to nav item
   - Press Enter/Space
   - Dropdown opens
   - Arrow keys navigate items
   - Escape closes dropdown

10. **Mega Menu Display**
    - Hover mega menu trigger
    - Verify full-width menu appears
    - Multiple columns visible
    - Click outside
    - Mega menu closes

#### Breakpoint Tests (2)
11. **Responsive Transition**
    - Start desktop viewport
    - Resize to mobile
    - Verify menu converts to mobile
    - Resize back to desktop
    - Verify menu converts back

12. **Search Bar Toggle**
    - Click search icon
    - Search bar expands
    - Type query
    - Click search or Enter
    - Search executes

#### Accessibility Tests (1)
13. **Focus Trap in Mobile Menu**
    - Open mobile menu
    - Tab through items
    - Verify focus stays in menu
    - Cannot tab to content behind
    - Escape releases focus

**Implementation File:** `tests/playwright/header-deep.spec.ts`

---

### 6. Footer (`navigation-footer--default`)

**Complexity:** Medium - Collapsible sections, responsive layout
**Storybook Stories:** 6 variants
**Risk Factors:**
- Accordion sections on mobile
- Link organization
- Social media icons
- Contact information layout

**Test Suite (10 tests):**

#### Baseline Tests (4)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

#### Collapsible Section Tests (3)
5. **Desktop Full Display**
   - Desktop viewport
   - All sections expanded
   - No accordion behavior
   - All links visible

6. **Mobile Accordion**
   - Mobile viewport
   - Sections collapsed by default
   - Click section header
   - Section expands
   - Click again
   - Section collapses

7. **Multiple Sections**
   - Mobile viewport
   - Expand section 1
   - Expand section 2
   - Verify both expanded (multi-select accordion)
   - Collapse section 1
   - Section 2 remains expanded

#### Content Tests (2)
8. **Link Validation**
   - Verify all links present
   - Check href attributes
   - Click link
   - Verify navigation

9. **Social Media Icons**
   - Verify icons render
   - Accessible names present
   - Click icon
   - Opens in new tab (target="_blank")

#### Edge Cases (1)
10. **Return to Top Button**
    - Scroll down page
    - Click "Return to top"
    - Verify scroll to top
    - Focus moves to top

**Implementation File:** `tests/playwright/footer-deep.spec.ts`

---

## Priority 3: Advanced Form Components (2 components)

### 7. File Input (`forms-file-input--default`)

**Complexity:** Very High - File upload, drag-drop, validation
**Storybook Stories:** 7 variants
**Risk Factors:**
- File selection dialog
- Drag-and-drop
- Multiple file handling
- File type validation
- File size validation

**Test Suite (14 tests):**

#### Baseline Tests (4)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

#### File Selection Tests (4)
5. **Click to Select**
   - Click "Choose file" button
   - File dialog opens (cannot automate)
   - Verify button text updates after selection
   - File name displays

6. **Drag and Drop**
   - Create test file blob
   - Simulate drop event
   - Verify file name displays
   - Verify file accepted

7. **Multiple File Selection**
   - Set multiple attribute
   - Select multiple files
   - Verify all names display
   - Count matches selected

8. **File Removal**
   - Select file(s)
   - Click remove button
   - Verify file(s) removed
   - Input cleared

#### Validation Tests (4)
9. **File Type Validation**
    - Set accept=".pdf,.doc"
    - Attempt to upload .jpg (mock)
    - Verify error message
    - Upload .pdf
    - Accepted

10. **File Size Validation**
    - Set max-size="5MB"
    - Upload large file (mock > 5MB)
    - Verify error message
    - Upload small file
    - Accepted

11. **Required Field Validation**
    - Mark required
    - Submit without file
    - Verify error
    - Upload file
    - Error clears

12. **Multiple File Limit**
    - Set max-files="3"
    - Upload 3 files
    - Attempt to upload 4th
    - Verify prevented/error

#### Edge Cases (2)
13. **Preview Display**
    - Upload image file
    - Verify thumbnail preview
    - Upload non-image
    - Verify file icon/name only

14. **Drag Over Visual Feedback**
    - Drag file over drop zone
    - Verify hover state
    - Drag away
    - Hover state clears

**Implementation File:** `tests/playwright/file-input-deep.spec.ts`

---

### 8. Language Selector (`forms-language-selector--default`)

**Complexity:** Medium - Dropdown, selection, localization
**Storybook Stories:** 3 variants
**Risk Factors:**
- Dropdown interactions
- Language selection
- Flag icons
- Accessibility labels

**Test Suite (10 tests):**

#### Baseline Tests (4)
1. Rendering validation
2. Keyboard accessibility
3. Accessibility compliance
4. Responsive design

#### Dropdown Interaction Tests (3)
5. **Dropdown Toggle**
   - Click language button
   - Dropdown opens
   - Click outside
   - Dropdown closes

6. **Language Selection**
   - Open dropdown
   - Click language option
   - Selected language updates
   - Dropdown closes
   - Button text changes

7. **Keyboard Navigation**
   - Tab to button
   - Press Enter
   - Arrow keys navigate options
   - Enter to select
   - Dropdown closes

#### Display Tests (2)
8. **Flag Icons**
   - Verify flag icons render
   - Correct icon for each language
   - Accessible alt text

9. **Language Labels**
   - Verify native language names (e.g., "Español" not "Spanish")
   - Verify English translations present
   - Verify lang attributes

#### Integration Tests (1)
10. **Selection Persistence**
    - Select language
    - Reload page (if applicable)
    - Verify selection persists
    - Or verify event emitted for persistence

**Implementation File:** `tests/playwright/language-selector-deep.spec.ts`

---

## Implementation Strategy

### Phase 2A: Forms Priority (Week 1)
1. Date Picker (Day 1-2)
2. Date Range Picker (Day 2-3)
3. Time Picker (Day 3-4)
4. Character Count (Day 4-5)

### Phase 2B: Navigation + Advanced (Week 2)
5. Header (Day 1-2)
6. Footer (Day 2-3)
7. File Input (Day 3-4)
8. Language Selector (Day 4-5)

### Test File Structure

Each deep test file follows this pattern:

```typescript
import { test, expect } from '@playwright/test';

test.describe('[Component] Deep Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Baseline Tests (4)
  test.describe('Baseline Tests', () => {
    // Import from shared baseline suite or duplicate
  });

  // Component-Specific Deep Tests (6-10)
  test.describe('[Feature] Tests', () => {
    // Detailed interaction tests
  });

  test.describe('Validation Tests', () => {
    // Edge cases and error handling
  });

  test.describe('Integration Tests', () => {
    // Cross-component interactions
  });
});
```

## Success Metrics

### Coverage Goals
- **Phase 2 Complete:** 51.1% (23/45 components)
- **Forms Category:** 66.7% (10/15 components)
- **Navigation Category:** 37.5% (3/8 components)
- **High-Risk Components:** 100% (8/8 components)

### Quality Goals
- All tests pass across 3 browsers
- No flaky tests (< 1% failure rate)
- Test execution time < 5 minutes for full suite
- Visual regression screenshots for all states

### Documentation Goals
- Each component has deep test documentation
- Test scenarios mapped to USWDS documentation
- Edge cases documented with rationale
- Accessibility patterns validated against WCAG 2.1

## Next Steps

1. Review and approve Phase 2 plan
2. Begin Phase 2A implementation (Forms Priority)
3. Create baseline test helpers for reuse
4. Implement Date Picker deep tests (first component)
5. Iterate and refine based on initial results

## References

- [Phase 1 Coverage Analysis](./PLAYWRIGHT_COVERAGE_ANALYSIS.md)
- [Playwright Testing Guide](./PLAYWRIGHT_TESTING.md)
- [USWDS Component Documentation](https://designsystem.digital.gov/components/)
- [Testing Guide](./TESTING_GUIDE.md)
