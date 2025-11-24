# Changelog - USA Name Pattern

All notable changes to the USA Name Pattern will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-05

### ✨ Initial Release

#### Overview

**Data Collection Pattern for collecting names**

#### Features

- **Multiple Name Formats (full, first-middle-last, etc.)**
- **Preferred Name Support**
- **Honorific and Suffix Support**
- **Light DOM Architecture for USWDS style compatibility**
- **Standard Data Pattern APIs: `getNameData()`, `setNameData()`, `clearName()`, `validateName()`**
- **Event Emission: `name-change` and `pattern-ready` events**
- **USWDS Component Composition: Uses `usa-text-input` components**

#### Properties

- `label` - Label for the name section
- `required` - Whether the name is required
- `format` - Name format (full, first-middle-last, etc.)
- `showMiddle` - Whether to show middle name
- `showSuffix` - Whether to show suffix
- `showPreferred` - Whether to show preferred name

#### Contract Compliance

- ✅ Custom element registration
- ✅ Light DOM architecture
- ✅ Standard data pattern APIs
- ✅ Required properties (label, required)
- ✅ Event emission
- ✅ USWDS component composition
- ✅ Data immutability

#### USWDS Alignment

- Implements [USWDS Pattern](https://designsystem.digital.gov/patterns/create-a-user-profile/name/)
- Uses official USWDS components and styles
- Follows USWDS accessibility standards
