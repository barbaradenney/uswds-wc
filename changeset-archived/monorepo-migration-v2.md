---
"@uswds-wc/core": major
"@uswds-wc/forms": major
"@uswds-wc/navigation": major
"@uswds-wc/data-display": major
"@uswds-wc/feedback": major
"@uswds-wc/actions": major
"@uswds-wc/layout": major
"@uswds-wc/structure": major
"@uswds-wc": major
---

# USWDS Web Components v2.0.0 - Initial Release

## 🎉 First Production Release: Category-Based Package Architecture

The official release of USWDS Web Components, organized into independent packages for optimal tree-shaking and smaller bundle sizes.

### 📦 Package Structure

The library is organized into 9 independent packages:

- **@uswds-wc/core** - Base utilities and USWDS integration
- **@uswds-wc/forms** - 15 form components
- **@uswds-wc/navigation** - 8 navigation components
- **@uswds-wc/data-display** - 8 data display components
- **@uswds-wc/feedback** - 5 feedback components
- **@uswds-wc/actions** - 4 action components
- **@uswds-wc/layout** - 4 layout components
- **@uswds-wc/structure** - 1 structural component
- **@uswds-wc** - Meta package (all components)

### ✨ Features

- **Optimal bundle sizes** - Import only what you need (50-80% smaller bundles)
- **Independent packages** - Better browser caching and versioning
- **Turborepo builds** - Parallel execution for faster development
- **Category organization** - Clear component grouping
- **Full USWDS compliance** - 100% USWDS 3.13.0 compatible
- **Complete testing** - 2301 tests passing (100%)
- **Accessibility** - WCAG 2.1 AA compliant

### 💡 Usage

**Install category packages (recommended):**
```bash
npm install @uswds-wc/forms @uswds-wc/actions lit
```

**Or install full library:**
```bash
npm install @uswds-wc lit
```

**Import components:**
```javascript
// Category-based (optimal bundle size)
import { USAButton } from '@uswds-wc/actions';
import { USATextInput } from '@uswds-wc/forms';

// Or from meta package
import { USAButton, USATextInput } from '@uswds-wc';

// Import USWDS styles
import '@uswds-wc/core/styles.css';
```

### 📚 Documentation

Complete documentation available at:
- **README**: Installation and usage
- **Architecture**: `docs/MONOREPO_MIGRATION_SUMMARY.md`
- **Component Catalog**: All 45 components documented
- **Storybook**: Interactive component examples

### 🛠️ Development

- **Build System**: Vite + Turborepo for optimal builds
- **Testing**: Vitest with 100% test coverage
- **Versioning**: Changesets for automated releases
- **CI/CD**: GitHub Actions with Turborepo caching

### 📊 Statistics

- **9 packages** independently publishable
- **45 components** categorized by function
- **2301 tests** passing (100%)
- **Full TypeScript** support with type definitions
- **Tree-shakeable** for minimal bundle sizes

### 🎯 Quality Metrics

- ✅ 100% USWDS compliance
- ✅ WCAG 2.1 AA accessibility
- ✅ 2301/2301 tests passing
- ✅ Zero dependencies (except Lit and USWDS CSS)
- ✅ Complete documentation
- ✅ Storybook with all components

---

For complete installation and usage instructions, see the [README](https://github.com/barbaramiles/uswds-wc#readme).
