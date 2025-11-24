# Form Summary Pattern

USWDS pattern for "Keep a Record" - helps users review and retain submitted information with summary display, print functionality, and confirmation messaging.

## Overview

The Form Summary Pattern provides a simple way to display submitted form data in an organized, reviewable format. It handles summary presentation, print/download actions, and confirmation messaging while developers provide the actual data.

**Pattern vs Component**: This is a pattern (workflow orchestration), not a component (UI element). It coordinates the review and record-keeping experience.

## When to Use This Pattern

- **Form confirmation** pages after submission
- **Review and edit** workflows
- **Record keeping** - users need to save or print their submission
- **Summary pages** showing collected information
- **Confirmation receipts** for applications or registrations

## When Not to Use

- Real-time form preview (use live validation instead)
- Editable forms (use form components directly)
- Simple success messages (use alert component)

## Usage

### Basic Example

```html
<usa-form-summary-pattern .sections="${sections}" show-print> </usa-form-summary-pattern>

<script>
  const sections = [
    {
      heading: 'Personal Information',
      items: [
        { label: 'Full Name', value: 'John Smith' },
        { label: 'Email', value: 'john@example.com' },
      ],
    },
    {
      heading: 'Contact Details',
      items: [
        { label: 'Phone', value: '(555) 123-4567' },
        { label: 'Address', value: '123 Main St' },
      ],
    },
  ];
</script>
```

### With Confirmation Message

```html
<usa-form-summary-pattern
  .sections="${sections}"
  show-confirmation
  confirmation-title="Application Submitted"
  confirmation-type="success"
  show-print
>
  <div slot="confirmation">
    <p>Your application #12345 has been received.</p>
    <p>You will receive a confirmation email shortly.</p>
  </div>
</usa-form-summary-pattern>
```

### With Edit Capability

```javascript
const sections = [
  {
    heading: 'Personal Information',
    items: [
      {
        label: 'Full Name',
        value: 'John Smith',
        onEdit: () => {
          // Navigate back to edit form
          window.location.href = '/edit?section=personal';
        },
      },
    ],
  },
];
```

```html
<usa-form-summary-pattern .sections="${sections}" show-edit show-print> </usa-form-summary-pattern>
```

## Properties

| Property                | Type                                          | Default                     | Description                        |
| ----------------------- | --------------------------------------------- | --------------------------- | ---------------------------------- |
| `sections`              | `SummarySection[]`                            | `[]`                        | Array of summary sections          |
| `title`                 | `string`                                      | `'Review Your Information'` | Page title                         |
| `show-confirmation`     | `boolean`                                     | `false`                     | Whether to show confirmation alert |
| `confirmation-title`    | `string`                                      | `'Success'`                 | Confirmation alert title           |
| `confirmation-type`     | `'success' \| 'info' \| 'warning' \| 'error'` | `'success'`                 | Alert type                         |
| `show-print`            | `boolean`                                     | `true`                      | Whether to show print button       |
| `show-download`         | `boolean`                                     | `false`                     | Whether to show download button    |
| `show-edit`             | `boolean`                                     | `false`                     | Whether to show edit buttons       |
| `print-button-label`    | `string`                                      | `'Print'`                   | Print button label                 |
| `download-button-label` | `string`                                      | `'Download'`                | Download button label              |

## Interfaces

### SummarySection

```typescript
interface SummarySection {
  heading: string; // Section heading
  items: SummaryItem[]; // Items in the section
}
```

### SummaryItem

```typescript
interface SummaryItem {
  label: string; // Field label
  value: string; // Field value
  onEdit?: () => void; // Optional edit callback
}
```

## Events

### pattern-ready

Fired when the pattern initializes.

```javascript
pattern.addEventListener('pattern-ready', (e) => {
  console.log('Sections:', e.detail.sections);
});
```

### edit-field

Fired when user clicks edit on a field.

```javascript
pattern.addEventListener('edit-field', (e) => {
  console.log('Section:', e.detail.section);
  console.log('Field:', e.detail.field);
  console.log('Current value:', e.detail.currentValue);
  // Navigate to edit page or show edit modal
});
```

### print-summary

Fired when user clicks print button.

```javascript
pattern.addEventListener('print-summary', (e) => {
  console.log('Printing sections:', e.detail.sections);
  // Custom print logic can go here
  // Default: window.print()
});
```

### download-summary

Fired when user clicks download button.

```javascript
pattern.addEventListener('download-summary', (e) => {
  console.log('Downloading sections:', e.detail.sections);
  // Implement custom download logic (PDF, CSV, etc.)
});
```

## Slots

| Slot           | Description                                     |
| -------------- | ----------------------------------------------- |
| `header`       | Optional custom header (replaces default title) |
| `footer`       | Optional footer content                         |
| `confirmation` | Custom confirmation message content             |

## Public API

### setSummaryData(sections: SummarySection[])

Set all summary data at once.

```javascript
pattern.setSummaryData(sections);
```

### addSection(section: SummarySection)

Add a new section to the summary.

```javascript
pattern.addSection({
  heading: 'Additional Information',
  items: [{ label: 'Notes', value: 'Special instructions' }],
});
```

### clearSummary()

Clear all sections.

```javascript
pattern.clearSummary();
```

### print()

Programmatically trigger print.

```javascript
pattern.print();
```

### download()

Programmatically trigger download event.

```javascript
pattern.download();
```

## Advanced Usage

### Custom Header and Footer

```html
<usa-form-summary-pattern .sections="${sections}">
  <div slot="header">
    <h1 class="font-heading-xl">Application Summary</h1>
    <p class="usa-intro">Reference #: APP-2025-001234</p>
  </div>

  <div slot="footer">
    <div class="usa-alert usa-alert--info">
      <div class="usa-alert__body">
        <p>Please save this page for your records.</p>
      </div>
    </div>
  </div>
</usa-form-summary-pattern>
```

### Custom Download Implementation

```javascript
pattern.addEventListener('download-summary', async (e) => {
  e.preventDefault(); // Prevent default behavior

  const sections = e.detail.sections;

  // Generate PDF using a library like jsPDF
  const pdf = generatePDF(sections);
  pdf.save('application-summary.pdf');
});
```

### Integration with Multi-Step Form

```html
<!-- Multi-step form -->
<usa-multi-step-form-pattern .steps="${formSteps}" @form-complete="${handleFormComplete}">
  <!-- Form steps -->
</usa-multi-step-form-pattern>

<!-- Summary (hidden until form complete) -->
<usa-form-summary-pattern id="summary" style="display: none" show-confirmation show-print>
</usa-form-summary-pattern>

<script>
  function handleFormComplete(e) {
    // Collect form data
    const formData = collectFormData();

    // Convert to summary sections
    const sections = convertToSections(formData);

    // Show summary
    const summary = document.getElementById('summary');
    summary.sections = sections;
    summary.style.display = 'block';

    // Hide form
    document.querySelector('usa-multi-step-form-pattern').style.display = 'none';
  }
</script>
```

### React Integration

```jsx
import { USAFormSummaryPattern } from '@uswds-wc/patterns';

function ConfirmationPage({ submittedData }) {
  const sections = formatDataAsSections(submittedData);

  const handleEdit = (e) => {
    const { section, field } = e.detail;
    navigate(`/edit?section=${section}&field=${field}`);
  };

  return (
    <usa-form-summary-pattern
      sections={sections}
      show-confirmation
      confirmation-title="Application Submitted"
      show-print
      show-edit
      onEdit-field={handleEdit}
    >
      <div slot="confirmation">
        <p>Your application has been successfully submitted.</p>
      </div>
    </usa-form-summary-pattern>
  );
}
```

## Accessibility

- Semantic HTML with proper heading hierarchy
- Print-friendly styles
- Keyboard navigable edit buttons
- Screen reader friendly labels
- ARIA labels on action buttons

## Browser Support

Works in all modern browsers that support:

- Web Components (Custom Elements v1)
- ES2015+
- Print API (for print functionality)

## USWDS Reference

- [Complete a complex form pattern](https://designsystem.digital.gov/patterns/complete-a-complex-form/)
- [Keep a record](https://designsystem.digital.gov/patterns/complete-a-complex-form/keep-a-record/)

## Related Patterns

- **Multi-Step Form Pattern**: Navigate multi-step form workflows
- **Form Trust Pattern**: Establish trust and set expectations
