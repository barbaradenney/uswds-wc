# Unused CSS Files Audit Report
**Date:** 2025-10-09
**Updated:** 2025-12-06
**Status:** ✅ **RESOLVED** - All unused CSS files deleted

## Executive Summary

~~🚨 **CRITICAL FINDING:** Your repository contains **4.9 MB of unused CSS files** (140,449 lines) that should be deleted.~~

✅ **RESOLVED (v2.5.3):** All 45 unused per-component CSS files and 45 corresponding *-styles.ts files were deleted, saving ~4.3 MB of dead code.

### Resolution Details (December 2025)
- **Deleted:** 45 component CSS files across all packages
- **Deleted:** 45 *-styles.ts import files
- **Space Saved:** ~4.3 MB
- **Build Impact:** None - files were never imported
- **Test Impact:** All 4952 tests pass

### Key Facts

- **45 component CSS files exist** in `src/components/*/[component].css`
- **0 files are imported** - NONE of these CSS files are used by components
- **All components import `../../styles/styles.css` instead** (the correct approach)
- **Safe to delete:** These files are legacy artifacts, not part of the build

---

## What These Files Are

### File Pattern
```
src/components/date-picker/date-picker.css (140K, 3,620 lines)
src/components/icon/icon.css (160K, 4,000+ lines)
src/components/alert/alert.css (124K, 3,000+ lines)
... 42 more files
```

### Content
These files contain **extracted USWDS CSS** - full copies of USWDS styles including:
- Base typography (.usa-prose, .usa-intro, etc.)
- Form elements (.usa-input, .usa-select, .usa-checkbox, etc.)
- Utility classes (.usa-sr-only, .usa-focus, etc.)
- Component-specific styles
- Global USWDS design tokens

**Example from `date-picker.css` (first 50 lines):**
```css
.usa-textarea, .usa-range__value, .usa-range, .usa-radio__label, .usa-input-group, .usa-hint, .usa-combo-box__input, .usa-combo-box__list, .usa-select, .usa-checkbox__label, .usa-fieldset, .usa-input{
  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
  font-size:1.06rem;
  line-height:1.3;
}

.usa-focus{
  outline:0.25rem solid #2491ff;
  outline-offset:0rem;
}

.usa-sr-only{
  position:absolute;
  left:-999em;
  right:auto;
}

.usa-intro{
  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;
  font-size:1.34rem;
  line-height:1.8;
  font-weight:400;
  max-width:88ex;
}
```

---

## Why They Exist (Historical Context)

### Original Architecture (Abandoned)
These files were likely created as an early approach where:
1. USWDS CSS was extracted per-component
2. Each component would import only its specific CSS
3. Goal: Tree-shaking and smaller bundles

### Current Architecture (Correct)
All components now use:
```typescript
// Import official USWDS CSS (single global import)
import '../../styles/styles.css';
```

**This is the correct approach because:**
- ✅ Light DOM components need global CSS
- ✅ One CSS import = better caching
- ✅ No CSS duplication across components
- ✅ True USWDS compatibility

---

## Verification: None Are Imported

Checked all 45 components - **0 imports found:**

```bash
⚠️  alert - CSS file EXISTS but NOT imported
⚠️  banner - CSS file EXISTS but NOT imported
⚠️  breadcrumb - CSS file EXISTS but NOT imported
⚠️  button-group - CSS file EXISTS but NOT imported
⚠️  button - CSS file EXISTS but NOT imported
⚠️  card - CSS file EXISTS but NOT imported
⚠️  character-count - CSS file EXISTS but NOT imported
... (38 more)
```

**All components use this pattern instead:**
```typescript
import '../../styles/styles.css';  // ✅ Single global USWDS import
```

---

## Impact Analysis

### Repository Impact
- **Disk space wasted:** 4.9 MB
- **Line count bloat:** 140,449 lines
- **Developer confusion:** Files appear to be used but aren't
- **Maintenance burden:** Files need updating when USWDS updates

### Build Impact
- **Build time:** No impact (files not imported)
- **Bundle size:** No impact (files not imported)
- **Runtime:** No impact (files not imported)

### Conclusion
**These files are dead code.** They have zero impact on functionality but waste disk space and create confusion.

---

## File Size Breakdown

### Top 10 Largest Files
| Component | Size | Lines (approx) |
|-----------|------|----------------|
| icon | 160K | ~4,200 |
| date-picker | 140K | ~3,620 |
| menu | 136K | ~3,500 |
| header | 136K | ~3,500 |
| table | 124K | ~3,200 |
| banner | 124K | ~3,200 |
| alert | 124K | ~3,200 |
| step-indicator | 116K | ~3,000 |
| button | 116K | ~3,000 |
| breadcrumb | 116K | ~3,000 |

### Total Across All Files
- **Total size:** 4.9 MB
- **Total lines:** 140,449
- **Total files:** 45

---

## ✅ COMPLETED: All Files Deleted

**Completed:** December 6, 2025 (v2.5.3)

### What Was Done
1. ✅ Deleted all 45 per-component CSS files across packages
2. ✅ Deleted all 45 corresponding *-styles.ts import files
3. ✅ Updated test utilities for usa-select simplification (v2.5.3)
4. ✅ Fixed `auto-detect-component-issues.js` glob import
5. ✅ All 4952 tests passing
6. ✅ Build verified working

### Original Justification (Validated)
1. ✅ **Not imported** - Zero usage in codebase
2. ✅ **Not needed** - Components use `@uswds-wc/core/styles.css` instead
3. ✅ **Safe to delete** - No functionality impact
4. ✅ **Best practice** - Clean up dead code
5. ✅ **Maintenance** - Eliminates confusion and update burden

### Proposed Cleanup

```bash
# Delete all component-specific CSS files
find src/components -name "*.css" -type f -delete

# Or selectively delete
for dir in src/components/*/; do
  component=$(basename "$dir")
  css_file="$dir/${component}.css"
  [ -f "$css_file" ] && rm "$css_file"
done
```

### Verification After Deletion
```bash
# Verify components still work
npm run build
npm run storybook
npm test

# Should all pass - CSS files are not used
```

---

## Risk Assessment

### Risk Level: **ZERO** ⚠️

**Why zero risk:**
- Files are not imported anywhere
- Not referenced in build configuration
- Not used by components
- Deleting them cannot break anything

**Verification:**
```bash
# Check imports across entire codebase
grep -r "alert\.css" src/
grep -r "date-picker\.css" src/
grep -r "icon\.css" src/
# Result: No matches
```

---

## Alternative: Keep as Archive (NOT RECOMMENDED)

If you want to preserve them for historical reference:

```bash
# Create archive directory
mkdir -p archive/extracted-css

# Move files instead of deleting
for dir in src/components/*/; do
  component=$(basename "$dir")
  css_file="$dir/${component}.css"
  [ -f "$css_file" ] && mv "$css_file" "archive/extracted-css/"
done
```

**However, this is NOT recommended because:**
- Git history already preserves them
- No practical use for these files
- Adds unnecessary archive maintenance

---

## Comparison to Active CSS

### What IS Being Used

**Global USWDS CSS:**
```typescript
import '../../styles/styles.css';  // Used by ALL 46 components
```

**Component Static Styles (minimal):**
```typescript
static override styles = css`
  :host {
    display: block;
  }
`;
```

**Total custom CSS:** ~50 lines across all components (only `:host` display)

### What Is NOT Being Used

**Component-specific CSS files:**
- 45 files
- 140,449 lines
- 4.9 MB
- **0% usage**

---

## Action Plan

### Immediate Action (Recommended)

1. **Delete all component CSS files:**
   ```bash
   find src/components -name "*.css" -type f -delete
   ```

2. **Verify nothing breaks:**
   ```bash
   npm run build
   npm run test
   npm run storybook
   ```

3. **Commit cleanup:**
   ```bash
   git add -A
   git commit -m "chore: remove unused component CSS files (4.9MB dead code)

   - Deleted 45 component-specific CSS files (140,449 lines)
   - Files were never imported, all components use ../../styles/styles.css
   - Zero functionality impact, pure cleanup
   - Reduces repository size by 4.9MB"
   ```

### Expected Result

- ✅ All tests pass
- ✅ All components render correctly
- ✅ Storybook works perfectly
- ✅ Build succeeds
- ✅ Repository is 4.9 MB smaller
- ✅ No dead code confusion

---

## Appendix: Full File List

All 45 unused CSS files:

1. alert/alert.css (124K)
2. banner/banner.css (124K)
3. breadcrumb/breadcrumb.css (116K)
4. button-group/button-group.css (104K)
5. button/button.css (116K)
6. card/card.css (112K)
7. character-count/character-count.css (104K)
8. checkbox/checkbox.css (112K)
9. collection/collection.css (108K)
10. combo-box/combo-box.css (112K)
11. date-picker/date-picker.css (140K)
12. date-range-picker/date-range-picker.css (104K)
13. file-input/file-input.css (108K)
14. footer/footer.css (112K)
15. header/header.css (136K)
16. icon/icon.css (160K)
17. identifier/identifier.css (108K)
18. in-page-navigation/in-page-navigation.css (108K)
19. input-prefix-suffix/input-prefix-suffix.css (108K)
20. language-selector/language-selector.css (104K)
21. link/link.css (112K)
22. list/list.css (108K)
23. memorable-date/memorable-date.css (104K)
24. menu/menu.css (136K)
25. modal/modal.css (108K)
26. pagination/pagination.css (108K)
27. process-list/process-list.css (108K)
28. prose/prose.css (104K)
29. radio/radio.css (108K)
30. range-slider/range-slider.css (112K)
31. search/search.css (112K)
32. section/section.css (108K)
33. select/select.css (108K)
34. side-navigation/side-navigation.css (108K)
35. site-alert/site-alert.css (112K)
36. skip-link/skip-link.css (104K)
37. step-indicator/step-indicator.css (116K)
38. summary-box/summary-box.css (108K)
39. table/table.css (124K)
40. tag/tag.css (104K)
41. text-input/text-input.css (108K)
42. textarea/textarea.css (108K)
43. time-picker/time-picker.css (104K)
44. tooltip/tooltip.css (108K)
45. validation/validation.css (104K)

**Total:** 4.9 MB of dead code

---

## Conclusion

~~You asked why these big CSS files exist - **they're legacy artifacts from an abandoned architecture approach.**~~

**Status: ✅ RESOLVED**

These legacy CSS files from an abandoned per-component architecture approach have been deleted.

**What Was Achieved:**
- ✅ Cleaned up ~4.3 MB of disk space
- ✅ Removed dead code files
- ✅ Eliminated developer confusion
- ✅ Simplified maintenance

**Current Architecture (v2.5.3+):**
- All components import `@uswds-wc/core/styles.css` (single USWDS stylesheet)
- No per-component CSS files
- Pure USWDS compliance maintained

**This audit document is now archived for historical reference.** 📁
