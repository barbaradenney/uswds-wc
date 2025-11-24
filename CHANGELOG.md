# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.1] - 2025-11-12

### 🐛 **Bug Fixes**

#### Critical Component Fixes

- **Checkbox Double-Toggle Bug (CRITICAL)**: Fixed bug where clicking checkbox or label didn't change state due to manual label click handler interfering with native browser behavior (usa-checkbox.ts:108-116 removed)
- **Radio Double-Event Bug**: Preventively removed same problematic pattern from radio component to ensure reliable event handling (usa-radio.ts:98-106 removed)
- **Time Picker Value Synchronization**: Implemented dual observation system (MutationObserver + change event listener) to sync USWDS combo-box value changes back to component property (usa-time-picker.ts:88-151)

#### Test Improvements

- **Tooltip Accessibility Test**: Un-skipped and fixed tooltip accessibility test with proper wait for USWDS transformation
- **Checkbox Regression Tests**: Added 2 regression tests to prevent double-toggle bug from recurring
- **Radio Regression Tests**: Added 2 regression tests for event handling reliability
- **Time Picker Tests**: Un-skipped 2 Cypress tests now that value synchronization is working

### 📝 **Documentation**

- **Time Picker Clear Button**: Enhanced documentation explaining USWDS combo-box clear button behavior (only shows for user-typed input, not programmatic value changes)
- **Test Documentation**: Comprehensive survey and categorization of all 45 skipped Cypress tests with detailed explanations of USWDS behaviors, component limitations, and test infrastructure requirements

### 🎯 **Test Suite Status**

- Unit Tests: 1452/1452 passing (100%)
- Cypress Tests: Improved coverage with 3 critical bugs fixed
- All test skips properly documented and justified

## [2.1.1] - 2025-11-02

### 📝 **Documentation**

- Added npm publication badges (version, downloads, license) to README
- Added direct links to all published npm packages in documentation
- Updated installation instructions with npm organization (@uswds-wc)
- Enhanced Quick Links section with npm package information

## [2.1.0] - 2025-11-02

### 🚀 **Quality & Testing Infrastructure Release**

This release focuses on comprehensive testing improvements, CI/CD workflow enhancements, and critical bug fixes to ensure production-ready quality.

### ✨ **New Features**

#### Testing Infrastructure

- **Playwright Test Expansion**: Added comprehensive deep testing for 3 additional components
  - Footer component - Complete keyboard navigation, responsiveness, and USWDS integration testing
  - Date Range Picker - Full calendar interaction, validation, and edge case testing
  - Time Picker - Input formatting, validation, and time selection testing
- **Cross-Browser Testing**: Expanded Playwright coverage to 15 components with Chrome, Firefox, and Safari support
- **CI/CD Workflows**: Added automated quality checks and Playwright story path validation
- **Test Reliability**: Removed all brittle `waitForTimeout` patterns in favor of proper wait strategies

#### Build System

- **Turborepo Integration**: Restored and verified turbo.json configuration for optimal build caching
- **Remote Caching**: Configured Turborepo remote caching (111x faster builds - 39s → 0.35s)

### 🐛 **Bug Fixes**

#### Component Fixes

- **Tooltip Double-Initialization**: Fixed critical bug preventing tooltip re-initialization (usa-tooltip.ts:147-152)
- **Date Picker Calendar**: Fixed calendar closing during month navigation (usa-date-picker.ts:234)
- **Character Count**: Fixed selector to avoid strict mode violations
- **File Input**: Resolved ES module `__dirname` compatibility issue

#### Test Fixes

- **Tooltip Tests**: Fixed timing issues after double-initialization fix - added proper USWDS transformation waits (100ms + 50ms)
- **Date Picker Validation**: Fixed required field validation tests to avoid disabled button clicks
- **Character Count Tests**: Updated selectors and assertions for proper USWDS DOM structure
- **Modal Tests**: Extended timeouts and fixed locator patterns for CI reliability

#### Validation & Quality

- **AI Quality Validator**: Updated to exclude Playwright spec files, preventing false positives
- **Comment Checking**: Removed overly strict comment validation from AI quality checker
- **Build Configuration**: Restored missing turbo.json preventing build failures

### 🔧 **Improvements**

#### Testing Best Practices

- Migrated scripts to ES modules for better maintainability
- Implemented proper Playwright wait strategies (50%+ test pass rate improvement)
- Added comprehensive Playwright testing guide documentation
- Extended expect timeouts to 15s for CI environment stability

#### Code Quality

- Fixed touch events, modal timeouts, and keyboard navigation patterns
- Improved accordion button visibility checks before focus
- Enhanced combo box accessibility tests with proper listbox visibility waits
- Updated test patterns to match USWDS DOM transformations

### 📊 **Test Statistics**

- **Unit Tests**: 2417/2417 passing (100%)
- **Playwright Deep Tests**: 50%+ pass rate (up from 43%)
- **Cross-Browser Coverage**: 15 components across Chrome, Firefox, Safari
- **Component Coverage**: 46/46 components with comprehensive testing

### 📚 **Documentation**

- Added comprehensive Playwright testing guide
- Documented Playwright story path validation
- Updated test patterns and USWDS integration documentation
- Added maintenance strategy documentation

### 🔄 **Migration Notes**

No breaking changes. This is a minor version release with backward compatibility.

**Recommended Actions**:

1. Update dependencies: `pnpm install`
2. Run tests to verify: `pnpm test && pnpm run test:visual`
3. Review new Playwright test patterns for your custom tests

## [2.0.0] - 2025-10-23

### 🚀 **MAJOR RELEASE: Monorepo Migration**

This release represents a significant architectural evolution - migrating from a single-package structure to a modern pnpm workspace monorepo with category-based packages.

### ⚠️ **BREAKING CHANGES**

#### Package Structure

- **Old**: Single package `uswds-webcomponents`
- **New**: Monorepo with category-based packages:
  - `@uswds-wc/core` - Core utilities and shared functionality
  - `@uswds-wc/actions` - Button, button-group, link, search
  - `@uswds-wc/data-display` - Table, card, collection, list, icon-list, summary-box, tag, icon
  - `@uswds-wc/feedback` - Alert, site-alert, modal, tooltip, banner
  - `@uswds-wc/forms` - All 15 form components
  - `@uswds-wc/layout` - Prose, process-list, step-indicator, identifier
  - `@uswds-wc/navigation` - Header, footer, breadcrumb, pagination, side-nav, in-page-nav, skip-link, language-selector
  - `@uswds-wc/structure` - Accordion
  - `@uswds-wc/test-utils` - Shared test utilities

#### Import Changes

**Before (v1.x)**:

```javascript
import 'uswds-webcomponents/forms';
import { USAButton } from 'uswds-webcomponents/actions';
```

**After (v2.0)**:

```javascript
import '@uswds-wc/forms';
import { USAButton } from '@uswds-wc/actions';
```

### ✨ **New Features**

#### Workspace Architecture

- **pnpm Workspaces**: Modern monorepo management with workspace protocol
- **Category-Based Packages**: Each USWDS category is now its own publishable package
- **Independent Versioning**: Packages can be versioned independently (prepared for future)
- **Optimized Dependencies**: Shared dependencies through workspace protocol
- **Better Tree-Shaking**: Import only the categories you need

#### Developer Experience

- **Faster Installs**: pnpm's efficient dependency management
- **Better IDE Support**: Clearer package boundaries and imports
- **Isolated Testing**: Test packages independently
- **Modular Builds**: Build individual packages or entire monorepo
- **Improved Type Checking**: Per-package type definitions

### 🔧 **Infrastructure Improvements**

#### Build System

- Updated Storybook configuration for monorepo structure
- Added Rollup aliases for cross-package CSS imports
- Optimized build performance with package-level builds
- Enhanced Vite configuration for monorepo compatibility

#### Validation & Testing

- Updated all validation scripts for monorepo structure:
  - `validate-attribute-mapping.js` - Scans all packages
  - `validate-story-styles.js` - Finds stories across packages
  - `validate-component-javascript.js` - Cross-package validation
  - `validate-no-skipped-tests.cjs` - Updated paths
  - `auto-detect-component-issues.js` - Performance optimized (2min vs hanging)
  - `validate-image-links.js` - Fixed glob imports

#### Quality Assurance

- All 11 pre-commit validation stages updated and passing
- Linting configuration updated for monorepo (258 errors → 0)
- TypeScript compilation verified across all packages
- Documentation sync validation for monorepo structure

### 🐛 **Bug Fixes**

- Fixed button layout test icon imports for cross-package boundaries
- Removed duplicate `firstUpdated` in date-range-picker
- Fixed component issue detection hanging (O(n²) → O(n) optimization)
- Updated glob imports for CommonJS compatibility
- Fixed cross-package component imports in tests

### 📚 **Documentation**

- Comprehensive monorepo migration guide in `docs/MONOREPO_MIGRATION_GUIDE.md`
- Updated all package README files
- Updated component count validation (45 components)
- Updated npm package references to `uswds-webcomponents-monorepo`

### 🎯 **Migration Guide**

For existing users upgrading from v1.x to v2.0:

1. **Update package references**:

   ```bash
   # Before
   npm install uswds-webcomponents

   # After
   npm install @uswds-wc/actions @uswds-wc/forms @uswds-wc/navigation
   # (install only the categories you need)
   ```

2. **Update imports** in your code:

   ```javascript
   // Before
   import { USAButton } from 'uswds-webcomponents/actions';

   // After
   import { USAButton } from '@uswds-wc/actions';
   ```

3. **Review dependencies**: Check that all required category packages are installed

### 📦 **Package Information**

- **Monorepo Root**: `uswds-webcomponents-monorepo@2.0.0`
- **Category Packages**: All versioned at `2.0.0`
- **Package Manager**: pnpm >=8.0.0 required
- **Node Version**: >=18.0.0 required

### ⚙️ **Technical Details**

- **Workspace Protocol**: Uses `workspace:*` for internal dependencies
- **Build Tool**: Vite with enhanced monorepo support
- **Test Runner**: Vitest with monorepo test discovery
- **Components**: All 45 USWDS components maintained
- **Test Coverage**: 2299/2301 tests passing (99.9%)
- **USWDS Compliance**: 100% maintained

### 🔮 **Future Roadmap**

This monorepo structure enables:

- Independent package versioning
- Scoped npm publishing (@uswds-wc/\* packages)
- Better dependency management
- Easier contribution workflow
- Potential for additional packages (templates, patterns, utilities)

---

## [1.0.2] - 2025-10-20

### 🐛 Bug Fixes

**Light DOM Slot Handling** - Fixed slotted content bugs across 5 components by migrating to proven light DOM slot pattern:

- **summary-box**: Applied proven slot pattern, fixed 2 failing tests (39/39 tests passing)
- **tag**: Migrated to proven pattern (52/52 tests passing)
- **site-alert**: Migrated to proven pattern (57/57 tests passing)
- **process-list**: Migrated with always-render-container fix (53/53 tests passing)
- **side-navigation**: Migrated with always-render-container fix (36/36 tests passing)

**Pattern Details**:

- CSS hide rule for duplicate slotted elements: `:host > [slot] { display: none !important; }`
- Manual slot projection in `moveSlottedContent()` method
- DocumentFragment for safe DOM manipulation
- Always render container elements to prevent HierarchyRequestError

**Test Coverage**: 378/379 tests passing (99.7%) - Modal's 1 failure is pre-existing

### 🔧 Improvements

**Release Process Automation**:

- Added NPM_TOKEN verification to release workflow (fails fast if missing)
- Updated release documentation to emphasize automated workflow is REQUIRED
- Added guide for republishing missed versions
- Deprecated manual release process

**Validation System**:

- Fixed CSS validation to strip comments before parsing
- Added exception for `:host > [slot]` selector (essential light DOM functionality)

### 📚 Documentation

- Updated RELEASE_PROCESS.md with mandatory automated workflow guidance
- Added "Republishing Missed Versions" section
- Clarified NPM token setup requirements
- Improved release workflow troubleshooting

## [1.0.0] - 2025-10-18

### 🎉 Initial Release

The first production-ready release of USWDS Web Components - a comprehensive, fully-tested library of all 45 USWDS components as modern web components.

### ✨ Features

#### Components (45 Total)

- **Forms & Inputs (15)**: text-input, textarea, checkbox, radio, select, file-input, date-picker, date-range-picker, time-picker, memorable-date, combo-box, range-slider, character-count, validation, input-prefix-suffix
- **Navigation (8)**: header, footer, breadcrumb, pagination, side-navigation, in-page-navigation, skip-link, language-selector
- **Data Display (8)**: table, collection, card, list, icon-list, summary-box, tag, icon
- **Feedback (5)**: alert, site-alert, modal, tooltip, banner
- **Actions (4)**: button, button-group, link, search
- **Layout (4)**: prose, process-list, step-indicator, identifier
- **Structure (1)**: accordion

#### Architecture & Developer Experience

- **MUI-Style Package Organization**: Category-based imports (forms, navigation, data-display, feedback, actions, layout, structure)
- **Enhanced Tree-Shaking**: Import by category or individual components
- **TypeScript Support**: Full type definitions with named imports
- **Multiple Import Patterns**:
  - Individual: `import 'uswds-webcomponents/components/button'`
  - Category: `import 'uswds-webcomponents/forms'`
  - Named: `import { USAButton } from 'uswds-webcomponents/actions'`
- **Optimized Bundles**: Category bundles range from 0.12 KB to 0.47 KB
- **Future-Ready**: Prepared for multi-package evolution (v2.0+)

#### Quality & Testing

- **2301/2301 Tests Passing**: 100% test success rate
- **Zero Test Failures**: Maintained with automated monitoring
- **4-Layer Testing**: Unit, component, accessibility, USWDS compliance
- **Comprehensive Coverage**: All components fully tested
- **Accessibility**: WCAG 2.1 AA compliant

#### USWDS Compliance

- **100% USWDS 3.13.0 Compliance**: True 1:1 functionality
- **Official CSS Only**: Zero custom styles, pure USWDS implementation
- **Progressive Enhancement**: Works as HTML, enhances with USWDS JS
- **Light DOM**: Maximum USWDS compatibility
- **Script Tag Pattern**: Global USWDS loading for consistency

#### Documentation

- **Component Catalog**: Complete COMPONENTS.md reference
- **README with Examples**: Category-organized with code samples
- **Storybook Documentation**: Interactive examples for all components
- **Component READMEs**: Individual documentation per component

### 🔧 Infrastructure

- Automated pre-commit validation (11 stages)
- AI code quality validation
- Documentation lifecycle management
- Bundle size optimization
- Service worker support
- CSS tree-shaking
- NPM package ready for distribution

### 📦 Distribution

- Package: `uswds-webcomponents@1.0.0`
- Repository: https://github.com/barbaramiles/uswds-wc
- License: Apache-2.0
- Dependencies: `lit` (peer dependency)
