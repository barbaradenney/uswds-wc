# Changelog - USA Address Pattern

All notable changes to the Address Pattern will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-15

### ✨ Initial Release

#### Features

- **Data Collection Pattern** for collecting physical or mailing addresses
- **US Address Support** with street, city, state, and ZIP code
- **International Address Support** with country field
- **Optional Street Line 2** for apartment/suite numbers
- **Light DOM Architecture** for USWDS style compatibility
- **Standard Data Pattern APIs**: `getAddressData()`, `setAddressData()`, `clearAddress()`, `validateAddress()`
- **Event Emission**: `address-change` and `pattern-ready` events
- **USWDS Component Composition**: Uses `usa-text-input` and `usa-select` components

#### Properties

- `label` - Label for the address section
- `required` - Whether all fields are required
- `showStreet2` - Whether to show street line 2
- `international` - Whether to support international addresses

#### Contract Compliance

- ✅ Custom element registration
- ✅ Light DOM architecture
- ✅ Standard data pattern APIs
- ✅ Required properties (label, required)
- ✅ Event emission
- ✅ USWDS component composition
- ✅ Data immutability

#### USWDS Alignment

- Implements [USWDS Address Pattern](https://designsystem.digital.gov/patterns/create-a-user-profile/address/)
- Uses official USWDS components and styles
- Follows USWDS accessibility standards
