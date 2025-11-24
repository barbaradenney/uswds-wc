# Changelog - USA Language Selector Pattern

All notable changes to the USA Language Selector Pattern will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-05

### ✨ Initial Release

#### Overview

**Workflow Pattern for language preference selection**

#### Features

- **Multiple Display Variants (two-languages, dropdown, unstyled)**
- **Language Persistence with localStorage**
- **Document Language Update (updates html lang attribute)**
- **Light DOM Architecture for USWDS style compatibility**
- **Specialized APIs: `setLanguages()`, `getCurrentLanguageCode()`, `changeLanguage()`, `clearPersistedPreference()`**
- **Event Emission: `language-change` and `pattern-ready` events**
- **USWDS Component Composition: Uses `usa-language-selector` component**

#### Properties

- `variant` - Display variant (two-languages, dropdown, unstyled)
- `small` - Whether to use small size
- `buttonText` - Text for dropdown button
- `persistPreference` - Whether to persist language preference
- `storageKey` - localStorage key for persistence
- `updateDocumentLang` - Whether to update html lang attribute

#### Contract Compliance

- ✅ Custom element registration
- ✅ Light DOM architecture
- ✅ Specialized workflow APIs
- ✅ Event emission
- ✅ USWDS component composition
- ✅ Data immutability

#### USWDS Alignment

- Implements [USWDS Pattern](https://designsystem.digital.gov/components/language-selector/)
- Uses official USWDS components and styles
- Follows USWDS accessibility standards
