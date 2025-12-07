/**
 * Reusable USWDS Pattern Compliance Test Utilities
 *
 * Generic test helpers that can be used across all pattern components
 * to validate USWDS HTML structure compliance.
 */

import { expect } from 'vitest';

/**
 * Configuration for pattern compliance tests
 */
export interface PatternComplianceConfig {
  /** Pattern element to test */
  pattern: Element;

  /** Expected field labels mapped to field names */
  expectedLabels?: Record<string, string>;

  /** Expected field order (array of field names) */
  expectedFieldOrder?: string[];

  /** Expected number of text inputs */
  expectedTextInputCount?: number;

  /** Expected number of selects */
  expectedSelectCount?: number;

  /** Expected number of textareas */
  expectedTextareaCount?: number;
}

/**
 * Validates that pattern uses correct USWDS fieldset structure
 */
export function validateFieldsetStructure(pattern: Element) {
  const fieldset = pattern.querySelector('fieldset.usa-fieldset');
  const legend = fieldset?.querySelector('legend.usa-legend');

  expect(fieldset).toBeTruthy();
  expect(legend).toBeTruthy();

  // Only USWDS classes used
  expect(fieldset?.className).toBe('usa-fieldset');
  // Pattern legends should use usa-legend--large modifier for proper visual hierarchy per USWDS spec
  expect(legend?.className).toBe('usa-legend usa-legend--large');
}

/**
 * Validates all form components use compact mode
 */
export function validateCompactMode(pattern: Element) {
  const textInputs = pattern.querySelectorAll('usa-text-input');
  textInputs.forEach((input) => {
    expect(input.hasAttribute('compact')).toBe(true);
  });

  const selects = pattern.querySelectorAll('usa-select');
  selects.forEach((select) => {
    expect(select.hasAttribute('compact')).toBe(true);
  });

  const textareas = pattern.querySelectorAll('usa-textarea');
  textareas.forEach((textarea) => {
    expect(textarea.hasAttribute('compact')).toBe(true);
  });
}

/**
 * Validates no form-group wrappers exist (compact mode result)
 */
export async function validateNoFormGroups(pattern: Element) {
  // Wait for components to render
  await new Promise((resolve) => setTimeout(resolve, 100));

  const formGroups = pattern.querySelectorAll('.usa-form-group');
  expect(formGroups.length).toBe(0);
}

/**
 * Validates no grid layout wrappers (fields stack vertically)
 */
export function validateNoGridWrappers(pattern: Element) {
  const gridRows = pattern.querySelectorAll('.grid-row');
  expect(gridRows.length).toBe(0);

  const gridCols = pattern.querySelectorAll('[class*="grid-col"]');
  expect(gridCols.length).toBe(0);
}

/**
 * Validates fields are direct children of fieldset
 */
export function validateFieldsAreDirectChildren(pattern: Element) {
  const fieldset = pattern.querySelector('fieldset');
  const formComponents = pattern.querySelectorAll('usa-text-input, usa-select, usa-textarea');

  formComponents.forEach((component) => {
    expect(component.parentElement === fieldset || fieldset?.contains(component)).toBe(true);
  });
}

/**
 * Validates field labels match expected USWDS text
 */
export function validateFieldLabels(pattern: Element, expectedLabels: Record<string, string>) {
  Object.entries(expectedLabels).forEach(([fieldName, expectedLabel]) => {
    const field = pattern.querySelector(`[name="${fieldName}"]`);
    const actualLabel = field?.getAttribute('label');

    expect(actualLabel).toBe(expectedLabel);
  });
}

/**
 * Validates fields are rendered in correct USWDS order
 */
export function validateFieldOrder(pattern: Element, expectedOrder: string[]) {
  const allInputs = Array.from(
    pattern.querySelectorAll('usa-text-input, usa-select, usa-textarea')
  );

  const names = allInputs.map((input) => input.getAttribute('name'));

  // Verify each field comes before the next one
  for (let i = 0; i < expectedOrder.length - 1; i++) {
    const currentIndex = names.indexOf(expectedOrder[i]);
    const nextIndex = names.indexOf(expectedOrder[i + 1]);

    expect(currentIndex).toBeLessThan(nextIndex);
  }
}

/**
 * Validates select elements render correctly
 * Note: usa-select no longer uses combo-box wrapper (simplified in v2.5.3)
 */
export async function validateSelectRendering(pattern: Element) {
  const selects = pattern.querySelectorAll('usa-select');

  for (const selectComponent of Array.from(selects)) {
    await (selectComponent as any)?.updateComplete;

    // Select element should be directly inside usa-select component
    const select = selectComponent.querySelector('select.usa-select');
    expect(select).toBeTruthy();
  }
}

/**
 * Validates required indicators show when pattern is required
 */
export async function validateRequiredIndicators(pattern: Element, required: boolean) {
  if (!required) return;

  // Wait for components to render
  await new Promise((resolve) => setTimeout(resolve, 100));

  const firstInput = pattern.querySelector('usa-text-input[required]') as any;
  if (!firstInput) return;

  await firstInput?.updateComplete;

  const label = firstInput?.querySelector('label');
  const abbr = label?.querySelector('abbr.usa-hint--required');

  expect(abbr).toBeTruthy();
  expect(abbr?.getAttribute('title')).toBe('required');
}

/**
 * Validates compact form components render correctly
 */
export async function validateCompactRendering(pattern: Element) {
  const textInput = pattern.querySelector('usa-text-input') as any;
  if (!textInput) return;

  await textInput?.updateComplete;

  const label = textInput?.querySelector('label.usa-label');
  const input = textInput?.querySelector('input.usa-input');

  expect(label).toBeTruthy();
  expect(input).toBeTruthy();

  // In compact mode, label and input should be direct children (no form-group wrapper)
  expect(label?.parentElement).toBe(textInput);
  expect(input?.parentElement).toBe(textInput);
}

/**
 * Validates field count matches expectations
 */
export function validateFieldCounts(
  pattern: Element,
  config: {
    textInputs?: number;
    selects?: number;
    textareas?: number;
  }
) {
  if (config.textInputs !== undefined) {
    const textInputs = pattern.querySelectorAll('usa-text-input');
    expect(textInputs.length).toBe(config.textInputs);
  }

  if (config.selects !== undefined) {
    const selects = pattern.querySelectorAll('usa-select');
    expect(selects.length).toBe(config.selects);
  }

  if (config.textareas !== undefined) {
    const textareas = pattern.querySelectorAll('usa-textarea');
    expect(textareas.length).toBe(config.textareas);
  }
}

/**
 * Run all generic pattern compliance validations
 */
export async function runGenericPatternCompliance(config: PatternComplianceConfig) {
  const { pattern, expectedLabels, expectedFieldOrder } = config;

  // Structure validations
  validateFieldsetStructure(pattern);
  validateCompactMode(pattern);
  await validateNoFormGroups(pattern);
  validateNoGridWrappers(pattern);
  validateFieldsAreDirectChildren(pattern);

  // Select validation (if selects present)
  if (pattern.querySelector('usa-select')) {
    await validateSelectRendering(pattern);
  }

  // Label validation (if provided)
  if (expectedLabels) {
    validateFieldLabels(pattern, expectedLabels);
  }

  // Order validation (if provided)
  if (expectedFieldOrder) {
    validateFieldOrder(pattern, expectedFieldOrder);
  }

  // Component rendering validation
  await validateCompactRendering(pattern);
}

/**
 * Creates a describe block with all generic pattern compliance tests
 */
export function createGenericPatternComplianceTests(
  _patternName: string,
  getPattern: () => Element,
  _config?: Partial<PatternComplianceConfig>
) {
  return {
    'should have correct USWDS fieldset structure': () => {
      validateFieldsetStructure(getPattern());
    },

    'should use compact mode on all form components': () => {
      validateCompactMode(getPattern());
    },

    'should not have form-group wrappers (compact mode result)': async () => {
      await validateNoFormGroups(getPattern());
    },

    'should not have grid layout wrappers': () => {
      validateNoGridWrappers(getPattern());
    },

    'should have fields as direct children of fieldset': () => {
      validateFieldsAreDirectChildren(getPattern());
    },

    'should render selects correctly': async () => {
      if (getPattern().querySelector('usa-select')) {
        await validateSelectRendering(getPattern());
      }
    },

    'should have compact form components rendering correctly': async () => {
      await validateCompactRendering(getPattern());
    },
  };
}
