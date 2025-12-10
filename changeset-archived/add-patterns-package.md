---
"@uswds-wc/patterns": major
---

feat(patterns): add new @uswds-wc/patterns package for USWDS pattern implementations

Creates new patterns package to implement official USWDS design patterns as web component compositions.

**New Package:** `@uswds-wc/patterns@1.0.0`

**Infrastructure:**
- Package configuration with dependencies on all category packages
- TypeScript, Vite, and Vitest setup
- Directory structure for 3 official USWDS patterns:
  - `language-selection/` - Language selector pattern
  - `complex-form/` - Multi-step form pattern
  - `user-profile/` - User profile creation pattern

**Documentation:**
- New `docs/PATTERNS_GUIDE.md` - Comprehensive guide explaining:
  - Patterns vs Components distinction
  - Pattern architecture principles (thin orchestration, component composition)
  - Development guidelines and best practices
  - Testing strategies for workflow validation
  - Official USWDS pattern descriptions

**Configuration Updates:**
- Added "patterns" to `.commitlintrc.json` scope enum
- Package registered in pnpm workspace
- Build infrastructure verified (successful test build)

**Initial Pattern Implementation:**

✅ **Language Selection Pattern (COMPLETE)**
- **Implementation** (`usa-language-selector-pattern.ts`): 260+ lines
  - Document-level language management (updates `html[lang]`)
  - LocalStorage persistence (optional via `persistPreference` property)
  - Pattern-level events: `pattern-language-change`, `pattern-ready`
  - Public API: `setLanguages()`, `changeLanguage()`, `getCurrentLanguageCode()`, `getCurrentLanguage()`, `clearPersistedPreference()`
  - Component composition: imports and uses `<usa-language-selector>` from @uswds-wc/navigation

- **Storybook Stories** (`usa-language-selector-pattern.stories.ts`): 7 comprehensive examples
  1. Default - Basic two-language pattern with state display
  2. WithPersistence - LocalStorage integration with clear button
  3. DropdownVariant - Multiple languages (7 languages)
  4. SmallVariant - Compact layout demonstration
  5. ApplicationIntegration - Event handling for i18n systems
  6. PatternReadyEvent - Initialization handling demonstration
  7. ProgrammaticControl - Public API usage with interactive buttons

- **Documentation** (`README.md`): 400+ lines comprehensive guide
  - Pattern vs Component comparison table
  - When to use guide (pattern vs component directly)
  - Properties/attributes reference
  - Events documentation with TypeScript interfaces
  - Public API methods with examples
  - Advanced usage: React, Vue, Server-side integration
  - Pattern workflow diagram
  - Accessibility features
  - Testing examples

- **Unit Tests** (`usa-language-selector-pattern.test.ts`): 400+ lines, 9 test suites
  - Pattern Initialization
  - Document Language Management
  - LocalStorage Persistence
  - Pattern Events
  - Public API
  - Initialization Priority (localStorage > document.lang > default)
  - Component Integration
  - Pattern Workflow (end-to-end)

✅ **Multi-Step Form Pattern (COMPLETE)**
- **Implementation** (`usa-multi-step-form-pattern.ts`): 400+ lines
  - Step navigation management (next/back/skip)
  - Progress tracking and display
  - LocalStorage state persistence (optional via `persistState` property)
  - Per-step validation support
  - Pattern-level events: `step-change`, `form-complete`, `pattern-ready`
  - Public API: `goToStep()`, `getCurrentStepIndex()`, `getCurrentStepData()`, `clearPersistedState()`, `reset()`
  - Slot-based content (`step-{id}` slots for each step, `progress` slot for custom indicators)

- **Storybook Stories** (`usa-multi-step-form-pattern.stories.ts`): 7 comprehensive examples
  1. Default - Basic three-step form with event logging
  2. WithPersistence - LocalStorage integration with state saving
  3. WithOptionalSteps - Demonstrates skippable steps
  4. WithValidation - Per-step validation example
  5. WithCustomProgress - Custom progress indicator via slot
  6. ProgrammaticControl - Public API usage demonstration
  7. JobApplicationForm - Real-world application example

✅ **Form Summary Pattern (COMPLETE)**
- **Implementation** (`usa-form-summary-pattern.ts`): 350+ lines
  - Summary display with organized sections
  - Print and download functionality
  - Edit capability for reviewed information
  - Confirmation messaging (customizable)
  - Pattern-level events: `edit-field`, `print-summary`, `download-summary`, `pattern-ready`
  - Public API: `setSummaryData()`, `addSection()`, `clearSummary()`, `print()`, `download()`
  - Slot-based content (`header`, `footer`, `confirmation` slots)

- **Storybook Stories** (`usa-form-summary-pattern.stories.ts`): 5 comprehensive examples
  1. Default - Basic summary with print
  2. WithConfirmation - Success message after submission
  3. WithEditCapability - Editable fields
  4. WithDownload - Print and download options
  5. JobApplicationSummary - Real-world example with custom slots

✅ **Address Pattern (COMPLETE)**
- **Implementation** (`usa-address-pattern.ts`): 300+ lines
  - US and international address support
  - Complete US state dropdown (all 50 states)
  - ZIP code validation (5-digit and ZIP+4 formats)
  - Optional street line 2 field
  - Required field marking
  - Pattern-level events: `address-change`, `pattern-ready`
  - Public API: `getAddressData()`, `setAddressData()`, `clearAddress()`, `validateAddress()`
  - Flexible configuration (`required`, `show-street2`, `international` properties)

- **Storybook Stories** (`usa-address-pattern.stories.ts`): 6 comprehensive examples
  1. Default - Basic address pattern
  2. Required - Required field validation
  3. WithoutStreetLine2 - Simplified address form
  4. International - International address support with country field
  5. WithEventHandling - Event handling and validation demonstration
  6. MultipleAddresses - Multiple addresses in one form (shipping/billing)

✅ **Name Pattern (COMPLETE)**
- **Implementation** (`usa-name-pattern.ts`): 370+ lines
  - Three name formats: full (single field), separate (given/family), flexible (both)
  - Cultural sensitivity support (single names, multiple family names, diacritics)
  - Optional middle name and suffix fields
  - Optional preferred name for correspondence
  - Supports up to 128 characters per field
  - Pattern-level events: `name-change`, `pattern-ready`
  - Public API: `getNameData()`, `setNameData()`, `clearName()`, `validateName()`, `getFormattedName()`
  - Flexible configuration (`format`, `required`, `show-middle`, `show-suffix`, `show-preferred` properties)

- **Storybook Stories** (`usa-name-pattern.stories.ts`): 8 comprehensive examples
  1. Default - Single full name field
  2. Required - Required name validation
  3. SeparateFields - Given and family name fields
  4. WithMiddleAndSuffix - Complete name collection
  5. WithPreferredName - Preferred name for correspondence
  6. FlexibleFormat - Both full and separate fields
  7. WithEventHandling - API usage and event listening
  8. CulturalSensitivity - Demonstrates diverse naming convention support

✅ **Phone Number Pattern (COMPLETE)**
- **Implementation** (`usa-phone-number-pattern.ts`): 280+ lines
  - US phone numbers only (10-digit format)
  - Automatic input masking (999-999-9999)
  - Optional extension field for business lines
  - Optional phone type selector (mobile/home/work)
  - SMS capability indication support
  - Pattern-level events: `phone-change`, `pattern-ready`
  - Public API: `getPhoneData()`, `setPhoneData()`, `clearPhoneNumber()`, `validatePhoneNumber()`, `getFormattedPhoneNumber()`, `getRawPhoneNumber()`
  - Flexible configuration (`required`, `show-extension`, `show-type`, `sms-required` properties)

- **Storybook Stories** (`usa-phone-number-pattern.stories.ts`): 8 comprehensive examples
  1. Default - Basic phone number with auto-formatting
  2. Required - Required phone number validation
  3. WithType - Phone type selector
  4. WithExtension - Extension field for business lines
  5. SMSRequired - SMS-capable mobile number requirement
  6. Complete - All options enabled
  7. WithEventHandling - API usage and validation
  8. MultiplePhoneNumbers - Primary and secondary contact numbers

✅ **Contact Preferences Pattern (COMPLETE)**
- **Implementation** (`usa-contact-preferences-pattern.ts`): 310+ lines
  - Multi-channel preference selection (phone, text, email, mail)
  - Multiple method selection support
  - Optional additional information textarea for accessibility needs
  - Custom contact methods support
  - Pattern-level events: `preferences-change`, `pattern-ready`
  - Public API: `getPreferencesData()`, `setPreferencesData()`, `clearPreferences()`, `getSelectedMethodCount()`, `isMethodSelected()`
  - Flexible configuration (`show-additional-info`, custom `methods` array)

- **Storybook Stories** (`usa-contact-preferences-pattern.stories.ts`): 7 comprehensive examples
  1. Default - Standard communication channels
  2. WithHint - Contact timeline expectations
  3. WithAdditionalInfo - Accessibility accommodations field
  4. CustomMethods - Application-specific channels
  5. WithEventHandling - API usage demonstration
  6. ProfileFormExample - Integrated profile form
  7. AccessibilityFocused - Emphasizes inclusive communication

**What's Next:**
Additional patterns can be implemented following USWDS specifications:
1. Form Trust Pattern - Establish trust and set expectations (optional)

**Pattern Philosophy:**
Patterns orchestrate existing USWDS web components to solve complete user workflows. They provide thin coordination layers without reimplementing component functionality.

**USWDS Reference:** https://designsystem.digital.gov/patterns/
