# Changelog - USA Phone Number Pattern

All notable changes to the USA Phone Number Pattern will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-05

### ✨ Initial Release

#### Overview

**Data Collection Pattern for collecting phone numbers**

#### Features

- **Phone Number Input with formatting**
- **Extension Support for business numbers**
- **Phone Type Selection (mobile, home, work)**
- **Light DOM Architecture for USWDS style compatibility**
- **Standard Data Pattern APIs: `getPhoneData()`, `setPhoneData()`, `clearPhoneNumber()`, `validatePhoneNumber()`**
- **Event Emission: `phone-change` and `pattern-ready` events**
- **USWDS Component Composition: Uses `usa-text-input` and `usa-select` components**

#### Properties

- `label` - Label for the phone number section
- `required` - Whether the phone number is required
- `showExtension` - Whether to show extension field
- `showType` - Whether to show phone type selector

#### Contract Compliance

- ✅ Custom element registration
- ✅ Light DOM architecture
- ✅ Standard data pattern APIs
- ✅ Required properties (label, required)
- ✅ Event emission
- ✅ USWDS component composition
- ✅ Data immutability

#### USWDS Alignment

- Implements [USWDS Pattern](https://designsystem.digital.gov/patterns/create-a-user-profile/phone-number/)
- Uses official USWDS components and styles
- Follows USWDS accessibility standards
