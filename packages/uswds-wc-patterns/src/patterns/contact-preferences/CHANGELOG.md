# Changelog - USA Contact Preferences Pattern

All notable changes to the USA Contact Preferences Pattern will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-05

### ✨ Initial Release

#### Overview

**Data Collection Pattern for collecting communication channel preferences**

#### Features

- **Multiple Contact Method Selection (phone, text, email, mail)**
- **Additional Information Field for special requests**
- **Light DOM Architecture for USWDS style compatibility**
- **Standard Data Pattern APIs: `getPreferencesData()`, `setPreferencesData()`, `clearPreferences()`, `validatePreferences()`**
- **Event Emission: `preferences-change` and `pattern-ready` events**
- **USWDS Component Composition: Uses `usa-checkbox` and `usa-textarea` components**

#### Properties

- `label` - Label for the contact preferences section
- `required` - Whether at least one method selection is required
- `hint` - Hint text explaining contact expectations
- `showAdditionalInfo` - Whether to show additional information textarea

#### Contract Compliance

- ✅ Custom element registration
- ✅ Light DOM architecture
- ✅ Standard data pattern APIs
- ✅ Required properties (label, required)
- ✅ Event emission
- ✅ USWDS component composition
- ✅ Data immutability

#### USWDS Alignment

- Implements [USWDS Pattern](https://designsystem.digital.gov/patterns/create-a-user-profile/contact-preferences/)
- Uses official USWDS components and styles
- Follows USWDS accessibility standards
