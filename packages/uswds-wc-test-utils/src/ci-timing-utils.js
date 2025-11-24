/**
 * CI Timing Utilities
 *
 * Utilities for handling timing differences between local and CI environments.
 * CI environments are typically slower, requiring additional waits for:
 * - ARIA attribute updates
 * - Property propagation to DOM
 * - USWDS component initialization
 */

import { waitForUpdate } from './test-utils.js';

/**
 * Checks if running in CI environment
 */
export function isCI() {
  // eslint-disable-next-line no-undef
  return process.env.CI === 'true' || process.env.CI === '1';
}

/**
 * Gets the CI timing multiplier
 * CI environments need more iterations due to slower execution
 */
function getCIMultiplier() {
  return isCI() ? 2 : 1;
}

/**
 * Waits for property changes to propagate to the DOM
 *
 * Use this after setting properties that affect child elements:
 * ```typescript
 * element.required = true;
 * await waitForPropertyPropagation(element);
 * const input = element.querySelector('input');
 * expect(input.required).toBe(true); // Now safe to check
 * ```
 *
 * @param element - The element to wait for
 * @param iterations - Base number of iterations (multiplied in CI)
 */
export async function waitForPropertyPropagation(element, iterations = 2) {
  const totalIterations = iterations * getCIMultiplier();
  for (let i = 0; i < totalIterations; i++) {
    await waitForUpdate(element);
  }
}

/**
 * Waits for an ARIA attribute to be set with a valid value
 *
 * Use this when checking ARIA attributes that may not be set immediately:
 * ```typescript
 * const ariaSort = await waitForARIAAttribute(header, 'aria-sort');
 * if (ariaSort) {
 *   expect(ariaSort).toMatch(/none|ascending|descending/);
 * }
 * ```
 *
 * @param element - The element with the ARIA attribute
 * @param attribute - The ARIA attribute name
 * @param timeout - Maximum time to wait in milliseconds
 * @returns The attribute value, or null if not set within timeout
 */
export async function waitForARIAAttribute(element, attribute, timeout = 2000) {
  const start = Date.now();
  const checkInterval = isCI() ? 100 : 50;

  while (Date.now() - start < timeout) {
    const value = element.getAttribute(attribute);
    // Consider both null and empty string as "not set"
    if (value !== null && value !== '') {
      return value;
    }
    // Controlled delay for polling - Promise auto-completes, no cleanup needed
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  // Return final value (might be null or empty)
  return element.getAttribute(attribute);
}

/**
 * Waits for a modal to fully open and render
 *
 * Modals require extra time for USWDS initialization and rendering:
 * ```typescript
 * modal.open = true;
 * await waitForModalOpen(modal);
 * // Now safe to query modal content
 * const title = modal.querySelector('.usa-modal__heading');
 * ```
 *
 * @param modal - The modal element
 */
export async function waitForModalOpen(modal) {
  // Wait for property propagation
  await waitForPropertyPropagation(modal, 3);

  // Extra wait for USWDS modal initialization
  const extraWait = isCI() ? 200 : 100;
  await new Promise((resolve) => setTimeout(resolve, extraWait));
}

/**
 * Waits for an accordion to fully expand/collapse
 *
 * Accordions use transitions that need time to complete:
 * ```typescript
 * button.click();
 * await waitForAccordionTransition(accordion);
 * // Now safe to check expanded state
 * ```
 *
 * @param accordion - The accordion element
 */
export async function waitForAccordionTransition(accordion) {
  await waitForPropertyPropagation(accordion, 2);

  // Wait for CSS transition
  const transitionTime = isCI() ? 400 : 300;
  await new Promise((resolve) => setTimeout(resolve, transitionTime));
}

/**
 * Waits for a combo-box to initialize
 *
 * Combo-boxes have complex USWDS initialization:
 * ```typescript
 * const comboBox = await waitForComboBoxInit(element);
 * // Now safe to interact with combo-box
 * ```
 *
 * @param element - The combo-box element
 */
export async function waitForComboBoxInit(element) {
  await waitForPropertyPropagation(element, 3);

  // Extra wait for USWDS combo-box setup
  const extraWait = isCI() ? 300 : 150;
  await new Promise((resolve) => setTimeout(resolve, extraWait));
}

/**
 * Generic wait for element to be in DOM and rendered
 *
 * Use when an element should exist but might not be rendered yet:
 * ```typescript
 * element.appendChild(newChild);
 * await waitForElementRender(newChild);
 * // Now safe to query or measure newChild
 * ```
 *
 * @param element - The element to wait for
 * @param timeout - Maximum time to wait
 */
export async function waitForElementRender(element, timeout = 2000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (element.offsetParent !== null || element.offsetWidth > 0) {
      // Element is rendered
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/**
 * Waits for a date picker to initialize
 *
 * Date pickers have complex USWDS initialization with calendar rendering:
 * ```typescript
 * await waitForDatePickerInit(datePicker);
 * // Now safe to interact with calendar
 * ```
 *
 * @param datePicker - The date picker element
 */
export async function waitForDatePickerInit(datePicker) {
  await waitForPropertyPropagation(datePicker, 3);

  // Extra wait for calendar rendering
  const extraWait = isCI() ? 300 : 150;
  await new Promise((resolve) => setTimeout(resolve, extraWait));
}

/**
 * Gets CI-aware timeout multiplier for performance tests
 *
 * CI environments are slower and need more lenient timeouts:
 * ```typescript
 * const timeout = 1000 * getCITimeoutMultiplier(); // 1s local, 3s CI
 * ```
 *
 * @returns Multiplier for timeouts (3x in CI, 1x locally)
 */
export function getCITimeoutMultiplier() {
  return isCI() ? 3 : 1;
}

/**
 * Asserts that a performance metric is within CI-aware tolerance
 *
 * Use for performance tests that may vary in CI:
 * ```typescript
 * const duration = performance.measure(...);
 * expectPerformanceWithinTolerance(duration, 1000, 0.2); // ±20% local, ±40% CI
 * ```
 *
 * @param actual - Actual measured value
 * @param expected - Expected baseline value
 * @param tolerance - Tolerance as decimal (0.2 = 20%)
 */
export function expectPerformanceWithinTolerance(actual, expected, tolerance = 0.2) {
  const ciTolerance = isCI() ? tolerance * 2 : tolerance;
  const maxAllowed = expected * (1 + ciTolerance);

  if (actual > maxAllowed) {
    throw new Error(
      `Performance assertion failed: ${actual}ms > ${maxAllowed}ms (expected ${expected}ms ±${ciTolerance * 100}% in ${isCI() ? 'CI' : 'local'})`
    );
  }
}

/**
 * Gets CI-aware expected value with tolerance
 *
 * Use when you need the actual threshold value:
 * ```typescript
 * const maxDuration = getCIAwareExpectedValue(1000, 0.2); // 1200ms local, 1400ms CI
 * expect(duration).toBeLessThan(maxDuration);
 * ```
 *
 * @param expected - Expected baseline value
 * @param tolerance - Tolerance as decimal (0.2 = 20%)
 * @returns Maximum allowed value accounting for CI
 */
export function getCIAwareExpectedValue(expected, tolerance = 0.2) {
  const ciTolerance = isCI() ? tolerance * 2 : tolerance;
  return expected * (1 + ciTolerance);
}
