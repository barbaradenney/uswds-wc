# Monorepo Migration Plan - MUI-Style Architecture

> **Status:** Planning Phase
> **Target Completion:** TBD
> **Architecture Model:** Material-UI (MUI) monorepo structure

## 🎯 Goals

### Developer Experience
- **Category-based imports** - Import only what you need: `import { USAButton } from '@uswds-wc/actions'`
- **Optimal tree-shaking** - Each package is independently tree-shakeable
- **Faster builds** - Only rebuild changed packages
- **Better testing** - Test packages in isolation

### Bundle Optimization
- **Smaller bundles** - Users only download what they import
- **Per-package CSS** - Include only CSS for imported components
- **Independent versioning** - Update packages independently
- **Better caching** - Browser caches packages separately

### Scalability
- **Clear boundaries** - Each package has defined responsibilities
- **Parallel development** - Teams can work on different packages
- **Independent releases** - Don't need to release everything at once
- **Future-proof** - Easy to add new packages (icons, lab, etc.)

## 📦 Proposed Package Structure

```
uswds-webcomponents/
├── packages/
│   ├── uswds-wc/                  # Meta package (exports everything)
│   ├── uswds-wc-core/             # Core utilities and base components
│   ├── uswds-wc-forms/            # Forms category (15 components)
│   ├── uswds-wc-navigation/       # Navigation (8 components)
│   ├── uswds-wc-data-display/     # Data Display (8 components)
│   ├── uswds-wc-feedback/         # Feedback (5 components)
│   ├── uswds-wc-actions/          # Actions (4 components)
│   ├── uswds-wc-layout/           # Layout (4 components)
│   └── uswds-wc-structure/        # Structure (1 component)
├── apps/
│   └── docs/                      # Storybook documentation site
├── scripts/                       # Shared build/validation scripts
├── pnpm-workspace.yaml
├── package.json                   # Root package.json
└── turbo.json                     # Turborepo configuration
```

### Package Details

#### 1. `@uswds-wc/core` (Foundation Package)

**Purpose:** Shared utilities, base components, and types

**Contents:**
- `USWDSBaseComponent` - Base class for all components
- Shared TypeScript types
- Common utilities
- USWDS styles import
- Theme configuration (if applicable)

**Size:** ~50KB (estimated)

**Dependencies:**
- `lit` (peer dependency)

#### 2. `@uswds-wc/forms` (Forms Package)

**Purpose:** All form-related components

**Components (15):**
- text-input
- textarea
- checkbox
- radio
- select
- file-input
- date-picker
- date-range-picker
- time-picker
- memorable-date
- combo-box
- range-slider
- character-count
- validation
- input-prefix-suffix

**Size:** ~120KB (estimated)

**Dependencies:**
- `@uswds-wc/core`
- `lit` (peer dependency)

#### 3. `@uswds-wc/navigation` (Navigation Package)

**Purpose:** Navigation and wayfinding components

**Components (8):**
- header
- footer
- breadcrumb
- pagination
- side-navigation
- in-page-navigation
- skip-link
- language-selector

**Size:** ~80KB (estimated)

**Dependencies:**
- `@uswds-wc/core`
- `@uswds-wc/actions` (for search in header)
- `lit` (peer dependency)

#### 4. `@uswds-wc/data-display` (Data Display Package)

**Purpose:** Components for displaying data

**Components (8):**
- table
- collection
- card
- list
- icon-list
- summary-box
- tag
- icon

**Size:** ~60KB (estimated)

**Dependencies:**
- `@uswds-wc/core`
- `lit` (peer dependency)

#### 5. `@uswds-wc/feedback` (Feedback Package)

**Purpose:** User feedback and notification components

**Components (5):**
- alert
- site-alert
- modal
- tooltip
- banner

**Size:** ~40KB (estimated)

**Dependencies:**
- `@uswds-wc/core`
- `lit` (peer dependency)

#### 6. `@uswds-wc/actions` (Actions Package)

**Purpose:** Interactive action components

**Components (4):**
- button
- button-group
- link
- search

**Size:** ~30KB (estimated)

**Dependencies:**
- `@uswds-wc/core`
- `lit` (peer dependency)

#### 7. `@uswds-wc/layout` (Layout Package)

**Purpose:** Page layout and structure components

**Components (4):**
- prose
- process-list
- step-indicator
- identifier

**Size:** ~35KB (estimated)

**Dependencies:**
- `@uswds-wc/core`
- `lit` (peer dependency)

#### 8. `@uswds-wc/structure` (Structure Package)

**Purpose:** Content organization components

**Components (1):**
- accordion

**Size:** ~15KB (estimated)

**Dependencies:**
- `@uswds-wc/core`
- `lit` (peer dependency)

#### 9. `@uswds-wc` (Meta Package)

**Purpose:** Convenience package that re-exports everything

**Contents:**
- Re-exports from all category packages
- Main entry point for users who want everything
- Backwards compatibility with current API

**Size:** 0KB (just re-exports)

**Dependencies:**
- All category packages

## 🛠️ Tooling Selection

### Package Manager: **pnpm**

**Why pnpm:**
- Used by MUI
- Efficient disk space usage (symlinks)
- Fast installs
- Strict dependency resolution
- Built-in workspace support

### Build Orchestration: **Turborepo**

**Why Turborepo:**
- Fast, incremental builds
- Intelligent caching
- Parallel execution
- Simple configuration
- Used by Vercel/Next.js ecosystem

**Alternative:** Nx (more features, steeper learning curve)

### Versioning: **Changesets**

**Why Changesets:**
- Developer-friendly
- Automatic changelog generation
- Supports independent versioning
- GitHub integration
- Used by many modern monorepos

**Alternative:** Lerna (more traditional, still works)

## 📋 Migration Phases

### Phase 1: Setup Infrastructure ✅ (Week 1)

**Tasks:**
1. Install pnpm globally and locally
2. Create `pnpm-workspace.yaml`
3. Install Turborepo
4. Install Changesets
5. Create root `package.json` with workspace configuration
6. Set up Turborepo configuration (`turbo.json`)

**Deliverables:**
- Working monorepo infrastructure
- Able to run commands across packages
- Caching configured

### Phase 2: Create Package Structure (Week 1-2)

**Tasks:**
1. Create `packages/` directory structure
2. Create `apps/` directory for Storybook
3. Set up `@uswds-wc/core` package
   - Move `USWDSBaseComponent` and utilities
   - Create package.json
   - Set up build configuration
4. Create initial package.json for each category package
5. Configure TypeScript project references

**Deliverables:**
- All package directories created
- TypeScript project references working
- Core package building successfully

### Phase 3: Migrate Components (Week 2-3)

**Tasks:**
1. Migrate components to category packages
   - Move component files
   - Update imports
   - Create category-level index files
2. Update component imports to reference `@uswds-wc/core`
3. Set up package-level builds
4. Create per-package exports

**Deliverables:**
- All components in appropriate packages
- Each package builds independently
- Tests still passing

### Phase 4: Update Build System (Week 3)

**Tasks:**
1. Configure Turborepo pipeline
2. Update Vite configuration for monorepo
3. Set up CSS extraction per package
4. Configure parallel builds
5. Set up build caching

**Deliverables:**
- Fast monorepo builds
- Caching working correctly
- CSS properly split by package

### Phase 5: Update Testing (Week 3-4)

**Tasks:**
1. Update test configurations for monorepo
2. Configure Vitest for workspaces
3. Update Cypress for monorepo
4. Update test scripts in root package.json
5. Ensure all tests pass

**Deliverables:**
- All tests passing in monorepo structure
- Can test individual packages
- Can test all packages

### Phase 6: Update CI/CD (Week 4)

**Tasks:**
1. Update GitHub Actions for monorepo
2. Add affected package detection
3. Configure parallel CI jobs per package
4. Update deployment workflows
5. Configure Changesets GitHub Action

**Deliverables:**
- CI/CD working with monorepo
- Only builds affected packages
- Automated changelog and versioning

### Phase 7: Update Documentation (Week 4-5)

**Tasks:**
1. Move Storybook to `apps/docs`
2. Update Storybook to work with monorepo
3. Create migration guide for users
4. Update README with new import patterns
5. Update CLAUDE.md with monorepo commands

**Deliverables:**
- Storybook working with monorepo
- Documentation complete
- Migration guide published

### Phase 8: Publishing & Release (Week 5)

**Tasks:**
1. Configure npm publishing for scoped packages
2. Set up Changesets workflow
3. Test publishing to npm (dry-run)
4. Publish v2.0.0 with monorepo structure
5. Update documentation site

**Deliverables:**
- All packages published to npm
- Documentation deployed
- Migration guide live

## 📊 Import Patterns Comparison

### Current (Single Package)

```typescript
// Import everything (not optimal)
import 'uswds-webcomponents';

// Import by category (better, but still in one package)
import 'uswds-webcomponents/forms';
import 'uswds-webcomponents/navigation';

// Import specific component
import { USAButton } from 'uswds-webcomponents';
```

### After Monorepo Migration

```typescript
// Import everything (backwards compatible)
import '@uswds-wc';
// or
import 'uswds-webcomponents'; // alias to @uswds-wc

// Import by category (optimal - separate packages)
import '@uswds-wc/forms';
import '@uswds-wc/navigation';

// Import specific component (most optimal)
import { USAButton } from '@uswds-wc/actions';
import { USATextInput } from '@uswds-wc/forms';

// Import core utilities
import { USWDSBaseComponent } from '@uswds-wc/core';
```

## 📈 Expected Benefits

### Bundle Size Reduction

**Current:**
- Import all: ~500KB
- Import category: ~100-150KB
- Import component: Still loads category

**After Monorepo:**
- Import all: ~500KB (same)
- Import category package: ~40-120KB (per package)
- Import component: ~15-30KB (true tree-shaking)

**Example:**
```typescript
// Current: Loads entire forms category
import { USATextInput } from 'uswds-webcomponents/forms';
// Bundle: ~120KB

// After: Loads only text-input + core
import { USATextInput } from '@uswds-wc/forms';
// Bundle: ~25KB (15KB component + 10KB core)
```

### Build Performance

**Current:**
- Full build: ~45 seconds
- Incremental rebuild: ~30 seconds (everything rebuilds)

**After Monorepo (with Turborepo):**
- Full build (first time): ~60 seconds (all packages)
- Incremental rebuild: ~5-10 seconds (only changed packages)
- Cached build: ~2 seconds

## 🚨 Breaking Changes

### Version 2.0.0 Breaking Changes

1. **Package names change:**
   - `uswds-webcomponents` → `@uswds-wc` (meta package)
   - New scoped packages: `@uswds-wc/forms`, etc.

2. **Import paths change (recommended, not required):**
   - Old: `import { USAButton } from 'uswds-webcomponents'`
   - New: `import { USAButton } from '@uswds-wc/actions'`

3. **Backwards compatibility maintained:**
   - Meta package `@uswds-wc` exports everything
   - Can still use: `import '@uswds-wc'` (loads all)

## 📚 Migration Guide for Users

### Minimal Migration (No Code Changes)

```bash
# Replace package name
npm uninstall uswds-webcomponents
npm install @uswds-wc
```

```typescript
// Update imports
- import 'uswds-webcomponents';
+ import '@uswds-wc';
// Everything else works the same
```

### Optimal Migration (Smaller Bundles)

```bash
# Install only what you need
npm install @uswds-wc/core @uswds-wc/forms @uswds-wc/actions
```

```typescript
// Update to category imports
- import { USAButton, USATextInput } from 'uswds-webcomponents';
+ import { USAButton } from '@uswds-wc/actions';
+ import { USATextInput } from '@uswds-wc/forms';
```

## ⚙️ Configuration Files

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Root `package.json`

```json
{
  "name": "uswds-webcomponents-monorepo",
  "private": true,
  "version": "0.0.0",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "dev": "turbo run dev --parallel",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build --filter=./packages/* && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Package `package.json` Template

```json
{
  "name": "@uswds-wc/forms",
  "version": "2.0.0",
  "description": "USWDS Form Components",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./*": {
      "import": "./dist/components/*.js",
      "types": "./dist/components/*.d.ts"
    }
  },
  "files": ["dist", "src"],
  "scripts": {
    "build": "tsc && vite build",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@uswds-wc/core": "workspace:*"
  },
  "peerDependencies": {
    "lit": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## 🎯 Success Metrics

### Build Performance
- [ ] Full build < 60 seconds
- [ ] Incremental build < 10 seconds
- [ ] Cached build < 5 seconds

### Bundle Size
- [ ] Per-package imports 60-80% smaller than full import
- [ ] Core package < 50KB
- [ ] Each category package < 150KB

### Developer Experience
- [ ] Can build individual packages
- [ ] Can test individual packages
- [ ] Clear import patterns documented
- [ ] Migration guide complete

### CI/CD
- [ ] Only builds affected packages
- [ ] Parallel package testing
- [ ] Automated versioning with Changesets
- [ ] Automated publishing

## 📝 Next Steps

1. **Review this plan** - Discuss and approve approach
2. **Set timeline** - Agree on migration schedule
3. **Create tracking issue** - GitHub issue with all tasks
4. **Begin Phase 1** - Set up monorepo infrastructure
5. **Iterative migration** - Complete phases one by one

## 🤝 Coordination Required

### Documentation Updates
- [ ] Update all imports in Storybook examples
- [ ] Create migration guide
- [ ] Update CLAUDE.md with monorepo commands
- [ ] Add "Monorepo Architecture" Storybook doc

### Communication
- [ ] Announce v2.0.0 monorepo migration
- [ ] Create migration timeline
- [ ] Support users during transition
- [ ] Provide codemods if needed

---

**This migration will transform USWDS Web Components into a modern, scalable monorepo similar to MUI, providing better tree-shaking, faster builds, and a superior developer experience.**
