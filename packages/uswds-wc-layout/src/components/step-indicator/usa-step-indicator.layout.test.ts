/**
 * Step Indicator Layout Tests
 * Prevents regression of step alignment, progress indicators, and responsive layout issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../step-indicator/index.ts';
import type { USAStepIndicator } from './usa-step-indicator.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USAStepIndicator Layout Tests', () => {
  let element: USAStepIndicator;

  beforeEach(() => {
    element = document.createElement('usa-step-indicator') as USAStepIndicator;
    element.steps = [
      { label: 'Step 1', status: 'complete' },
      { label: 'Step 2', status: 'current' },
      { label: 'Step 3', status: 'incomplete' },
    ];
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS step indicator structure', async () => {
    await element.updateComplete;

    const stepIndicator = element.querySelector('.usa-step-indicator');
    const stepList = element.querySelector('.usa-step-indicator__segments');
    const steps = element.querySelectorAll('.usa-step-indicator__segment');

    expect(stepIndicator, 'Step indicator container should exist').toBeTruthy();
    expect(stepList, 'Step list should exist').toBeTruthy();
    expect(steps.length, 'Should have correct number of steps').toBe(3);

    // Verify USWDS structure hierarchy
    expect(stepIndicator.contains(stepList)).toBe(true);
    steps.forEach((step, index) => {
      expect(stepList.contains(step), `Step ${index} should be in step list`).toBe(true);
    });
  });

  it('should position steps correctly within segments', async () => {
    await element.updateComplete;

    const stepList = element.querySelector('.usa-step-indicator__segments');
    const steps = element.querySelectorAll('.usa-step-indicator__segment');

    expect(stepList, 'Step list should exist').toBeTruthy();
    expect(steps.length, 'Should have steps').toBeGreaterThan(0);

    // Steps should be in correct order
    steps.forEach((step, index) => {
      const stepLabel = step.querySelector('.usa-step-indicator__segment-label');
      expect(stepLabel, `Step ${index} should have label`).toBeTruthy();
      expect(stepLabel.textContent.trim()).toBe(`Step ${index + 1}`);
    });
  });

  it('should position step markers correctly within segments', async () => {
    await element.updateComplete;

    const steps = element.querySelectorAll('.usa-step-indicator__segment');

    steps.forEach((step, index) => {
      // The marker is the first <span> element without a class (USWDS pattern)
      const marker = step.querySelector('span:not([class])');
      const label = step.querySelector('.usa-step-indicator__segment-label');

      expect(marker, `Step ${index} should have marker`).toBeTruthy();
      expect(label, `Step ${index} should have label`).toBeTruthy();

      // Marker should appear before label in step
      const stepChildren = Array.from(step.children);
      const markerIndex = stepChildren.indexOf(marker);
      const labelIndex = stepChildren.indexOf(label);

      expect(markerIndex, `Marker should appear before label in step ${index}`).toBeLessThan(
        labelIndex
      );
    });
  });

  it('should handle different step statuses correctly', async () => {
    await element.updateComplete;

    const steps = element.querySelectorAll('.usa-step-indicator__segment');

    // First step should be complete
    expect(steps[0].classList.contains('usa-step-indicator__segment--complete')).toBe(true);

    // Second step should be current
    expect(steps[1].classList.contains('usa-step-indicator__segment--current')).toBe(true);

    // Third step should be incomplete (no special class)
    expect(steps[2].classList.contains('usa-step-indicator__segment--complete')).toBe(false);
    expect(steps[2].classList.contains('usa-step-indicator__segment--current')).toBe(false);
  });

  it('should handle counters variant correctly', async () => {
    element.counters = true;
    await element.updateComplete;

    const stepIndicator = element.querySelector('.usa-step-indicator');

    expect(stepIndicator, 'Step indicator should exist').toBeTruthy();

    if (stepIndicator) {
      expect(
        stepIndicator.classList.contains('usa-step-indicator--counters'),
        'Counters variant should have correct CSS class'
      ).toBe(true);
    }
  });

  it('should handle center variant correctly', async () => {
    element.center = true;
    await element.updateComplete;

    const stepIndicator = element.querySelector('.usa-step-indicator');

    expect(stepIndicator, 'Step indicator should exist').toBeTruthy();

    if (stepIndicator) {
      expect(
        stepIndicator.classList.contains('usa-step-indicator--center'),
        'Center variant should have correct CSS class'
      ).toBe(true);
    }
  });

  it('should handle small variant correctly', async () => {
    element.small = true;
    await element.updateComplete;

    const stepIndicator = element.querySelector('.usa-step-indicator');

    expect(stepIndicator, 'Step indicator should exist').toBeTruthy();

    if (stepIndicator) {
      expect(
        stepIndicator.classList.contains('usa-step-indicator--small'),
        'Small variant should have correct CSS class'
      ).toBe(true);
    }
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/step-indicator/usa-step-indicator.ts`;
        const validation = validateComponentJavaScript(componentPath, 'step-indicator');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for step indicator structure', async () => {
      await element.updateComplete;

      const stepIndicator = element.querySelector('.usa-step-indicator');
      const stepList = element.querySelector('.usa-step-indicator__segments');

      expect(stepIndicator, 'Step indicator should render').toBeTruthy();
      expect(stepList, 'Step list should render').toBeTruthy();

      // Verify essential USWDS classes are present
      expect(stepIndicator.classList.contains('usa-step-indicator')).toBe(true);
      expect(stepList.classList.contains('usa-step-indicator__segments')).toBe(true);
    });

    it('should maintain step indicator structure integrity', async () => {
      await element.updateComplete;

      const steps = element.querySelectorAll('.usa-step-indicator__segment');
      const markers = element.querySelectorAll('.usa-step-indicator__segment span:not([class])');
      const labels = element.querySelectorAll('.usa-step-indicator__segment-label');

      expect(steps.length, 'Should have steps').toBeGreaterThan(0);
      expect(markers.length, 'Should have markers').toBe(steps.length);
      expect(labels.length, 'Should have labels').toBe(steps.length);
    });

    it('should handle dynamic step updates correctly', async () => {
      await element.updateComplete;

      // Add a new step
      element.steps = [...element.steps, { label: 'Step 4', status: 'incomplete' }];
      await element.updateComplete;

      const steps = element.querySelectorAll('.usa-step-indicator__segment');
      expect(steps.length, 'Should have updated number of steps').toBe(4);

      const newStep = steps[3];
      const newLabel = newStep.querySelector('.usa-step-indicator__segment-label');
      expect(newLabel.textContent.trim()).toBe('Step 4');
    });

    it('should handle step status changes correctly', async () => {
      await element.updateComplete;

      // Update step status
      element.steps = [
        { label: 'Step 1', status: 'complete' },
        { label: 'Step 2', status: 'complete' },
        { label: 'Step 3', status: 'current' },
      ];
      await element.updateComplete;

      const steps = element.querySelectorAll('.usa-step-indicator__segment');

      // Both first two steps should now be complete
      expect(steps[0].classList.contains('usa-step-indicator__segment--complete')).toBe(true);
      expect(steps[1].classList.contains('usa-step-indicator__segment--complete')).toBe(true);

      // Third step should now be current
      expect(steps[2].classList.contains('usa-step-indicator__segment--current')).toBe(true);
    });

    it('should handle multiple variants correctly', async () => {
      element.counters = true;
      element.center = true;
      element.small = true;
      await element.updateComplete;

      const stepIndicator = element.querySelector('.usa-step-indicator');

      if (stepIndicator) {
        expect(stepIndicator.classList.contains('usa-step-indicator--counters')).toBe(true);
        expect(stepIndicator.classList.contains('usa-step-indicator--center')).toBe(true);
        expect(stepIndicator.classList.contains('usa-step-indicator--small')).toBe(true);
      }
    });

    it('should handle empty steps correctly', async () => {
      element.steps = [];
      await element.updateComplete;

      const stepList = element.querySelector('.usa-step-indicator__segments');
      const steps = element.querySelectorAll('.usa-step-indicator__segment');

      expect(stepList, 'Step list should exist even when empty').toBeTruthy();
      expect(steps.length, 'Should have no steps when empty').toBe(0);
    });

    it('should handle single step correctly', async () => {
      element.steps = [{ label: 'Only Step', status: 'current' }];
      await element.updateComplete;

      const steps = element.querySelectorAll('.usa-step-indicator__segment');
      expect(steps.length, 'Should handle single step').toBe(1);

      const step = steps[0];
      expect(step.classList.contains('usa-step-indicator__segment--current')).toBe(true);
    });

    it('should handle long step labels correctly', async () => {
      element.steps = [
        { label: 'Very Long Step Label That Might Cause Layout Issues', status: 'current' },
      ];
      await element.updateComplete;

      const step = element.querySelector('.usa-step-indicator__segment');
      const label = element.querySelector('.usa-step-indicator__segment-label');

      expect(step, 'Step should exist with long label').toBeTruthy();
      expect(label, 'Label should exist').toBeTruthy();
      expect(label.textContent.trim()).toBe('Very Long Step Label That Might Cause Layout Issues');
    });

    it('should maintain proper accessibility attributes', async () => {
      await element.updateComplete;

      const stepIndicator = element.querySelector('.usa-step-indicator');
      const stepList = element.querySelector('.usa-step-indicator__segments');

      if (stepIndicator) {
        expect(await waitForARIAAttribute(stepIndicator, 'aria-label')).toBeTruthy();
      }

      if (stepList) {
        expect(stepList.getAttribute('role')).toBe('list');
      }

      const steps = element.querySelectorAll('.usa-step-indicator__segment');
      steps.forEach((step) => {
        expect(step.getAttribute('role')).toBe('listitem');
      });
    });

    it('should handle responsive behavior correctly', async () => {
      await element.updateComplete;

      // Test with many steps that might cause wrapping
      element.steps = Array.from({ length: 10 }, (_, i) => ({
        label: `Step ${i + 1}`,
        status: i < 5 ? 'complete' : i === 5 ? 'current' : 'incomplete',
      }));
      await element.updateComplete;

      const steps = element.querySelectorAll('.usa-step-indicator__segment');
      expect(steps.length, 'Should handle many steps').toBe(10);

      // Structure should remain intact with many steps
      const stepIndicator = element.querySelector('.usa-step-indicator');
      expect(stepIndicator, 'Should maintain structure with many steps').toBeTruthy();
    });
  });
});
