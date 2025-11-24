# Changelog - USA Multi-Step Form Pattern

All notable changes to the USA Multi-Step Form Pattern will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-05

### ✨ Initial Release

#### Overview

**Workflow Pattern for navigating multi-step forms with progress tracking**

#### Features

- **Step Navigation with next/back/skip buttons**
- **Progress Tracking across form steps**
- **State Persistence with localStorage**
- **Step Validation before progression**
- **Optional Step Support with skip functionality**
- **Light DOM Architecture for USWDS style compatibility**
- **Specialized APIs: `setSteps()`, `goToStep()`, `getCurrentStepIndex()`, `getCurrentStepData()`, `clearPersistedState()`, `reset()`**
- **Event Emission: `step-change`, `form-complete`, `pattern-ready` events**
- **USWDS Component Composition: Uses `usa-button` components**

#### Properties

- `steps` - Array of form steps
- `showNavigation` - Whether to show navigation buttons
- `backButtonLabel` - Label for back button
- `nextButtonLabel` - Label for next button
- `skipButtonLabel` - Label for skip button
- `submitButtonLabel` - Label for submit button
- `persistState` - Whether to persist form state
- `storageKey` - localStorage key for state persistence

#### Contract Compliance

- ✅ Custom element registration
- ✅ Light DOM architecture
- ✅ Specialized workflow APIs
- ✅ Event emission
- ✅ USWDS component composition
- ✅ Data immutability

#### USWDS Alignment

- Implements [USWDS Pattern](https://designsystem.digital.gov/patterns/complete-a-complex-form/progress-easily/)
- Uses official USWDS components and styles
- Follows USWDS accessibility standards
