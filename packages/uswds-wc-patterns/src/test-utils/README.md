# Pattern Compliance Test Utilities

Reusable test utilities for validating USWDS pattern compliance across all pattern components.

## Purpose

These utilities ensure consistent USWDS compliance testing across all patterns without duplicating code.

## What Can Be Generalized

### ✅ Highly Reusable (All Patterns)

- Fieldset/legend structure validation
- Compact mode usage validation
- No form-group wrappers validation
- No grid layout wrappers validation
- Fields as direct children validation
- Combo-box wrapper validation (for patterns with selects)
- Required indicators validation
- Compact rendering validation

### ⚠️ Partially Reusable (Pattern-Specific Configuration)

- Field label validation (labels are pattern-specific, but validation logic is reusable)
- Field order validation (order is pattern-specific, but validation logic is reusable)
- Field count validation (counts are pattern-specific)

### ❌ Pattern-Specific (Not Reusable)

- Dropdown option lists (e.g., state/territory options in address pattern)
- Pattern-specific field behavior (e.g., urbanization field logic)
- Custom validation rules unique to a pattern

## Usage

### Option 1: Use Individual Validators

```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-my-pattern.js';
import type { USAMyPattern } from './usa-my-pattern.js';
import {
  validateFieldsetStructure,
  validateCompactMode,
  validateNoFormGroups,
  validateFieldLabels,
  validateComboBoxWrapper,
} from '../../test-utils/pattern-compliance-tests.js';

describe('USAMyPattern - USWDS Compliance', () => {
  let pattern: USAMyPattern;
  let container: HTMLDivElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    pattern = document.createElement('usa-my-pattern') as USAMyPattern;
    container.appendChild(pattern);
    await pattern.updateComplete;
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Generic USWDS Structure', () => {
    it('should have correct fieldset structure', () => {
      validateFieldsetStructure(pattern);
    });

    it('should use compact mode on all form components', () => {
      validateCompactMode(pattern);
    });

    it('should not have form-group wrappers', async () => {
      await validateNoFormGroups(pattern);
    });

    it('should wrap selects in combo-box', async () => {
      await validateComboBoxWrapper(pattern);
    });
  });

  describe('Pattern-Specific Labels', () => {
    it('should use exact USWDS labels', () => {
      validateFieldLabels(pattern, {
        field1: 'Field 1 Label',
        field2: 'Field 2 Label',
        field3: 'Field 3 Label',
      });
    });
  });

  // Add pattern-specific tests here
  describe('Pattern-Specific Behavior', () => {
    it('should handle custom pattern logic', () => {
      // Custom tests for this pattern
    });
  });
});
```

### Option 2: Use Batch Runner

```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-my-pattern.js';
import type { USAMyPattern } from './usa-my-pattern.js';
import { runGenericPatternCompliance } from '../../test-utils/pattern-compliance-tests.js';

describe('USAMyPattern - USWDS Compliance', () => {
  let pattern: USAMyPattern;
  let container: HTMLDivElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    pattern = document.createElement('usa-my-pattern') as USAMyPattern;
    container.appendChild(pattern);
    await pattern.updateComplete;
  });

  afterEach(() => {
    container?.remove();
  });

  it('should pass all generic USWDS compliance tests', async () => {
    await runGenericPatternCompliance({
      pattern,
      expectedLabels: {
        field1: 'Field 1 Label',
        field2: 'Field 2 Label',
        field3: 'Field 3 Label',
      },
      expectedFieldOrder: ['field1', 'field2', 'field3'],
    });
  });

  // Add pattern-specific tests
  describe('Pattern-Specific Tests', () => {
    it('should handle custom dropdown options', () => {
      // Pattern-specific validation
    });
  });
});
```

## Real Example: Address Pattern

Here's how the address pattern could use these utilities:

```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-address-pattern.js';
import type { USAAddressPattern } from './usa-address-pattern.js';
import {
  validateFieldsetStructure,
  validateCompactMode,
  validateNoFormGroups,
  validateNoGridWrappers,
  validateFieldLabels,
  validateFieldOrder,
  validateComboBoxWrapper,
} from '../../test-utils/pattern-compliance-tests.js';

describe('USAAddressPattern - USWDS Compliance', () => {
  let pattern: USAAddressPattern;
  let container: HTMLDivElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    pattern = document.createElement('usa-address-pattern') as USAAddressPattern;
    container.appendChild(pattern);
    await pattern.updateComplete;
  });

  afterEach(() => {
    container?.remove();
  });

  // Generic structure tests (reusable across ALL patterns)
  describe('Generic USWDS Structure', () => {
    it('should have correct fieldset structure', () => {
      validateFieldsetStructure(pattern);
    });

    it('should use compact mode on all form components', () => {
      validateCompactMode(pattern);
    });

    it('should not have form-group wrappers', async () => {
      await validateNoFormGroups(pattern);
    });

    it('should not have grid wrappers', () => {
      validateNoGridWrappers(pattern);
    });

    it('should wrap select in combo-box', async () => {
      await validateComboBoxWrapper(pattern);
    });
  });

  // Pattern-specific label tests (use generic validator with pattern-specific data)
  describe('Field Labels (Exact USWDS Text)', () => {
    it('should use exact USWDS labels', () => {
      validateFieldLabels(pattern, {
        street1: 'Street address',
        street2: 'Street address line 2',
        city: 'City',
        state: 'State, territory, or military post',
        zipCode: 'ZIP code',
        urbanization: 'Urbanization (Puerto Rico only)',
      });
    });
  });

  // Pattern-specific order test (use generic validator with pattern-specific data)
  describe('Field Order', () => {
    it('should render fields in correct USWDS order', () => {
      validateFieldOrder(pattern, [
        'street1',
        'street2',
        'city',
        'state',
        'zipCode',
        'urbanization',
      ]);
    });
  });

  // Address-specific tests (NOT reusable - unique to address pattern)
  describe('State/Territory Options (Address-Specific)', () => {
    it('should have exactly 61 total options', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select');
      const options = select?.querySelectorAll('option');

      expect(options?.length).toBe(61);
    });

    it('should include all US territories', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select');
      const optionValues = Array.from(select?.querySelectorAll('option') || []).map(
        (opt: any) => opt.value
      );

      expect(optionValues).toContain('AS'); // American Samoa
      expect(optionValues).toContain('DC'); // District of Columbia
      expect(optionValues).toContain('GU'); // Guam
      expect(optionValues).toContain('MP'); // Northern Mariana Islands
      expect(optionValues).toContain('PR'); // Puerto Rico
      expect(optionValues).toContain('UM'); // United States Minor Outlying Islands
      expect(optionValues).toContain('VI'); // Virgin Islands
    });

    it('should include all military post options', async () => {
      const selectComponent = pattern.querySelector('usa-select[name="state"]') as any;
      await selectComponent?.updateComplete;

      const select = selectComponent?.querySelector('select');
      const optionValues = Array.from(select?.querySelectorAll('option') || []).map(
        (opt: any) => opt.value
      );

      expect(optionValues).toContain('AA'); // Armed Forces Americas
      expect(optionValues).toContain('AE'); // Armed Forces Europe
      expect(optionValues).toContain('AP'); // Armed Forces Pacific
    });
  });
});
```

## Benefits

1. **Consistency**: All patterns tested the same way
2. **Maintainability**: Fix a bug in one place, all patterns benefit
3. **Clarity**: Separates generic USWDS compliance from pattern-specific logic
4. **Reusability**: ~70% of pattern tests can use generic validators
5. **Documentation**: Clear pattern for new pattern development

## When to Use Generic vs Pattern-Specific Tests

### Use Generic Validators For:

- Fieldset/legend structure
- Compact mode usage
- No form-group/grid wrappers
- Combo-box wrappers
- Basic label validation
- Field order validation

### Write Pattern-Specific Tests For:

- Dropdown option lists (like state/territory options)
- Complex field interactions
- Conditional field visibility logic
- Custom validation rules
- Pattern-specific computed values

## Summary

**Generic validators handle ~70% of pattern compliance testing**, leaving you to focus on the 30% that's truly unique to each pattern. This reduces code duplication and ensures consistent USWDS compliance across all patterns.
