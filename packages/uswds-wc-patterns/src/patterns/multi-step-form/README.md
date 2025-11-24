# Multi-Step Form Pattern

USWDS pattern for "Progress Easily" - helps users navigate multi-step forms with step management, progress tracking, and state persistence.

## Overview

The Multi-Step Form Pattern provides a simple, focused way to manage multi-step form workflows. It handles only the orchestration logic (step navigation, progress tracking, state management) while developers provide their own form content via slots.

**Pattern vs Component**: This is a pattern (workflow orchestration), not a component (UI element). It coordinates the multi-step experience without implementing form fields.

## When to Use This Pattern

- **Multi-step forms** with 3 or more steps
- **Complex workflows** that need to be broken into manageable chunks
- **Progressive disclosure** of information
- **Save and resume** functionality needed
- **Step validation** before progression

## When to Use the Component Directly

Use form components directly when:

- Single-page form (no steps)
- Simple form with few fields
- No step navigation needed

## Usage

### Basic Example

```html
<usa-multi-step-form-pattern .steps="${steps}">
  <div slot="step-personal-info">
    <h2>Personal Information</h2>
    <usa-text-input label="Name" required></usa-text-input>
    <usa-text-input label="Email" type="email" required></usa-text-input>
  </div>

  <div slot="step-contact">
    <h2>Contact Details</h2>
    <usa-text-input label="Phone" type="tel"></usa-text-input>
    <usa-text-input label="Address"></usa-text-input>
  </div>

  <div slot="step-review">
    <h2>Review Your Information</h2>
    <p>Please review before submitting.</p>
  </div>
</usa-multi-step-form-pattern>

<script>
  const steps = [
    { id: 'personal-info', label: 'Personal Information' },
    { id: 'contact', label: 'Contact Details' },
    { id: 'review', label: 'Review' },
  ];
</script>
```

### With State Persistence

```html
<usa-multi-step-form-pattern .steps="${steps}" persist-state storage-key="my-form-progress">
  <!-- Step content -->
</usa-multi-step-form-pattern>
```

### With Validation

```javascript
const steps = [
  {
    id: 'step1',
    label: 'Step 1',
    validate: () => {
      const input = document.getElementById('required-field');
      if (!input.value) {
        alert('Please fill required field');
        return false;
      }
      return true;
    },
  },
  { id: 'step2', label: 'Step 2' },
];
```

### With Optional Steps

```javascript
const steps = [
  { id: 'required1', label: 'Required Information' },
  { id: 'optional', label: 'Optional Details', optional: true },
  { id: 'required2', label: 'Final Step' },
];
```

## Properties

| Property              | Type         | Default                 | Description                              |
| --------------------- | ------------ | ----------------------- | ---------------------------------------- |
| `steps`               | `FormStep[]` | `[]`                    | Array of step configurations             |
| `show-navigation`     | `boolean`    | `true`                  | Whether to show navigation buttons       |
| `back-button-label`   | `string`     | `'Back'`                | Label for back button                    |
| `next-button-label`   | `string`     | `'Next'`                | Label for next button                    |
| `skip-button-label`   | `string`     | `'Skip'`                | Label for skip button                    |
| `submit-button-label` | `string`     | `'Submit'`              | Label for submit button                  |
| `persist-state`       | `boolean`    | `false`                 | Whether to persist state to localStorage |
| `storage-key`         | `string`     | `'uswds-form-progress'` | localStorage key                         |

## FormStep Interface

```typescript
interface FormStep {
  id: string; // Unique step identifier
  label: string; // Step label/heading
  optional?: boolean; // Whether step can be skipped
  validate?: () => boolean | Promise<boolean>; // Validation function
}
```

## Events

### pattern-ready

Fired when the pattern initializes.

```javascript
pattern.addEventListener('pattern-ready', (e) => {
  console.log('Current step:', e.detail.currentStep);
  console.log('Total steps:', e.detail.totalSteps);
});
```

### step-change

Fired when the user navigates to a different step.

```javascript
pattern.addEventListener('step-change', (e) => {
  console.log('Current step:', e.detail.currentStep);
  console.log('Previous step:', e.detail.previousStep);
  console.log('Direction:', e.detail.direction); // 'forward', 'back', or 'skip'
  console.log('Step data:', e.detail.step);
});
```

### form-complete

Fired when the user completes the final step.

```javascript
pattern.addEventListener('form-complete', (e) => {
  console.log('Form completed!');
  console.log('Total steps:', e.detail.totalSteps);
  // Submit form data here
});
```

## Slots

| Slot        | Description                                               |
| ----------- | --------------------------------------------------------- |
| `step-{id}` | Content for each step (e.g., `slot="step-personal-info"`) |
| `progress`  | Optional custom progress indicator                        |

## Public API

### goToStep(stepIndex: number)

Navigate to a specific step by index.

```javascript
pattern.goToStep(2); // Jump to third step
```

### getCurrentStepIndex(): number

Get the current step index (0-based).

```javascript
const current = pattern.getCurrentStepIndex();
```

### getCurrentStepData(): FormStep | undefined

Get the current step data.

```javascript
const stepData = pattern.getCurrentStepData();
console.log(stepData.label);
```

### clearPersistedState()

Clear the persisted state from localStorage.

```javascript
pattern.clearPersistedState();
```

### reset()

Reset to the first step.

```javascript
pattern.reset();
```

## Advanced Usage

### Custom Progress Indicator

```html
<usa-multi-step-form-pattern .steps="${steps}">
  <div slot="progress">
    <ol class="usa-process-list">
      <li class="usa-process-list__item">
        <h3 class="usa-process-list__heading">Step 1</h3>
      </li>
      <li class="usa-process-list__item">
        <h3 class="usa-process-list__heading">Step 2</h3>
      </li>
    </ol>
  </div>

  <!-- Step content -->
</usa-multi-step-form-pattern>
```

### Programmatic Navigation

```html
<button onclick="pattern.goToStep(0)">Jump to Step 1</button>
<button onclick="pattern.goToStep(1)">Jump to Step 2</button>
<button onclick="pattern.reset()">Start Over</button>

<usa-multi-step-form-pattern .steps="${steps}" show-navigation="false">
  <!-- Step content -->
</usa-multi-step-form-pattern>
```

### Integration with React

```jsx
import { USAMultiStepFormPattern } from '@uswds-wc/patterns';

function MyForm() {
  const steps = [
    { id: 'step1', label: 'Step 1' },
    { id: 'step2', label: 'Step 2' },
  ];

  const handleStepChange = (e) => {
    console.log('Step changed:', e.detail);
  };

  return (
    <usa-multi-step-form-pattern steps={steps} persist-state onStep-change={handleStepChange}>
      <div slot="step-step1">Step 1 content</div>
      <div slot="step-step2">Step 2 content</div>
    </usa-multi-step-form-pattern>
  );
}
```

## Accessibility

- Navigation buttons have proper ARIA labels
- Step content is keyboard navigable
- Screen readers announce step changes
- Focus management on step transitions

## Browser Support

Works in all modern browsers that support:

- Web Components (Custom Elements v1)
- ES2015+
- localStorage (for persistence)

## USWDS Reference

- [Complete a complex form pattern](https://designsystem.digital.gov/patterns/complete-a-complex-form/)
- [Progress easily](https://designsystem.digital.gov/patterns/complete-a-complex-form/progress-easily/)

## Related Patterns

- **Form Summary Pattern**: Review and confirm submitted information
- **Form Trust Pattern**: Establish trust and set expectations
