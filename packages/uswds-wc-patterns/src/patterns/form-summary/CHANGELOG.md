# Changelog - USA Form Summary Pattern

All notable changes to the USA Form Summary Pattern will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-05

### ✨ Initial Release

#### Overview

**Workflow Pattern for reviewing and retaining submitted information**

#### Features

- **Organized Section Display with key-value pairs**
- **Print Functionality for record keeping**
- **Download Support for saving information**
- **Edit Capabilities for reviewed information**
- **Confirmation Messaging with USWDS alert**
- **Light DOM Architecture for USWDS style compatibility**
- **Specialized APIs: `getSummaryData()`, `setSummaryData()`, `addSection()`, `clearSummary()`, `print()`, `download()`**
- **Event Emission: `edit-field`, `print-summary`, `download-summary`, `pattern-ready` events**
- **USWDS Component Composition: Uses `usa-button` and `usa-alert` components**

#### Properties

- `title` - Title for the summary
- `showConfirmation` - Whether to show confirmation message
- `confirmationTitle` - Confirmation message title
- `confirmationType` - Confirmation message type (success, info, warning, error)
- `showPrint` - Whether to show print button
- `showDownload` - Whether to show download button
- `showEdit` - Whether to show edit buttons

#### Contract Compliance

- ✅ Custom element registration
- ✅ Light DOM architecture
- ✅ Specialized workflow APIs
- ✅ Event emission
- ✅ USWDS component composition
- ✅ Data immutability

#### USWDS Alignment

- Implements [USWDS Pattern](https://designsystem.digital.gov/patterns/complete-a-complex-form/keep-a-record/)
- Uses official USWDS components and styles
- Follows USWDS accessibility standards
