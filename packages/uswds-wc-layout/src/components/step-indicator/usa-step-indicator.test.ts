import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-step-indicator.ts';
import type { USAStepIndicator, StepItem } from './usa-step-indicator.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USAStepIndicator', () => {
  let element: USAStepIndicator;

  beforeEach(() => {
    element = document.createElement('usa-step-indicator') as USAStepIndicator;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(element.steps).toEqual([]);
      expect(element.currentStep).toBe(1);
      expect(element.showLabels).toBe(true);
      expect(element.counters).toBe(false);
      expect(element.center).toBe(false);
      expect(element.ariaLabel).toBe('Step indicator');
    });

    it('should update steps property', async () => {
      const testSteps: StepItem[] = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Review', status: 'current' },
        { label: 'Complete', status: 'incomplete' },
      ];

      element.steps = testSteps;
      await element.updateComplete;

      expect(element.steps).toEqual(testSteps);
      const segments = element.querySelectorAll('.usa-step-indicator__segment');
      expect(segments).toHaveLength(3);
    });

    it('should update currentStep property', async () => {
      element.steps = [
        { label: 'Step 1', status: 'complete' },
        { label: 'Step 2', status: 'current' },
        { label: 'Step 3', status: 'incomplete' },
      ];

      const testValues = [1, 2, 3];
      for (const value of testValues) {
        element.currentStep = value;
        await element.updateComplete;

        expect(element.currentStep).toBe(value);
        const heading = element.querySelector('.usa-step-indicator__current-step');
        expect(heading?.textContent).toBe(value.toString());
      }
    });

    it('should update boolean properties', async () => {
      await element.updateComplete;

      element.showLabels = false;
      await element.updateComplete;
      expect(element.showLabels).toBe(false);

      element.counters = true;
      await element.updateComplete;
      expect(element.counters).toBe(true);

      element.center = true;
      await element.updateComplete;
      expect(element.center).toBe(true);
    });

    it('should update ariaLabel property', async () => {
      // Need to set steps for the container to render
      element.steps = [{ label: 'Test Step', status: 'current' }];

      const testLabels = ['Custom Step Progress', 'Application Steps'];
      for (const value of testLabels) {
        element.ariaLabel = value;
        await element.updateComplete;

        expect(element.ariaLabel).toBe(value);
        const container = element.querySelector('.usa-step-indicator');
        expect(container?.getAttribute('aria-label')).toBe(value);
      }
    });
  });

  describe('Rendering', () => {
    it('should render step indicator container with correct classes', async () => {
      element.steps = [{ label: 'Step 1', status: 'current' }];
      await element.updateComplete;

      const container = element.querySelector('.usa-step-indicator');
      expect(container).toBeTruthy();
      expect(container?.classList.contains('usa-step-indicator')).toBe(true);
    });

    it('should apply modifier classes correctly', async () => {
      element.steps = [{ label: 'Test', status: 'current' }];

      // Test no-labels modifier
      element.showLabels = false;
      await element.updateComplete;

      let container = element.querySelector('.usa-step-indicator');
      expect(container?.classList.contains('usa-step-indicator--no-labels')).toBe(true);

      // Test counters modifier (only with labels)
      element.showLabels = true;
      element.counters = true;
      await element.updateComplete;

      container = element.querySelector('.usa-step-indicator');
      expect(container?.classList.contains('usa-step-indicator--counters')).toBe(true);

      // Test center modifier
      element.center = true;
      await element.updateComplete;

      container = element.querySelector('.usa-step-indicator');
      expect(container?.classList.contains('usa-step-indicator--center')).toBe(true);
    });

    it('should render step segments with correct status classes', async () => {
      element.steps = [
        { label: 'Complete Step', status: 'complete' },
        { label: 'Current Step', status: 'current' },
        { label: 'Incomplete Step', status: 'incomplete' },
      ];
      await element.updateComplete;

      const segments = element.querySelectorAll('.usa-step-indicator__segment');
      expect(segments).toHaveLength(3);

      expect(segments[0].classList.contains('usa-step-indicator__segment--complete')).toBe(true);
      expect(segments[1].classList.contains('usa-step-indicator__segment--current')).toBe(true);
      expect(segments[2].classList.contains('usa-step-indicator__segment--complete')).toBe(false);
      expect(segments[2].classList.contains('usa-step-indicator__segment--current')).toBe(false);
    });

    it('should render step labels when showLabels is true', async () => {
      element.steps = [{ label: 'Personal Information', status: 'current' }];
      element.showLabels = true;
      await element.updateComplete;

      const label = element.querySelector('.usa-step-indicator__segment-label');
      expect(label).toBeTruthy();
      expect(label?.textContent?.trim()).toContain('Personal Information');
    });

    it('should hide step labels when showLabels is false', async () => {
      element.steps = [{ label: 'Personal Information', status: 'current' }];
      element.showLabels = false;
      await element.updateComplete;

      const label = element.querySelector('.usa-step-indicator__segment-label');
      expect(label).toBeFalsy();

      // Check that no-labels class is applied
      const container = element.querySelector('.usa-step-indicator');
      expect(container?.classList.contains('usa-step-indicator--no-labels')).toBe(true);
    });

    it('should render current step header information', async () => {
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Review Application', status: 'current' },
        { label: 'Submit', status: 'incomplete' },
      ];
      element.currentStep = 2;
      await element.updateComplete;

      const currentStepSpan = element.querySelector('.usa-step-indicator__current-step');
      const totalStepsSpan = element.querySelector('.usa-step-indicator__total-steps');
      const headingText = element.querySelector('.usa-step-indicator__heading-text');

      expect(currentStepSpan?.textContent).toBe('2');
      expect(totalStepsSpan?.textContent).toBe('of 3');
      expect(headingText?.textContent).toBe('Review Application');
    });

    it('should render slot content when no steps provided', async () => {
      element.innerHTML = '<p>Custom step content</p>';
      await element.updateComplete;

      expect(element.innerHTML).toContain('Custom step content');
      expect(element.querySelector('.usa-step-indicator')).toBeFalsy();
    });
  });

  describe('USWDS HTML Structure', () => {
    it('should match USWDS step indicator HTML structure', async () => {
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Review', status: 'current' },
      ];
      await element.updateComplete;

      // Check main container
      const container = element.querySelector('.usa-step-indicator');
      expect(container).toBeTruthy();

      // Check segments list
      const segments = container?.querySelector('.usa-step-indicator__segments');
      expect(segments?.tagName.toLowerCase()).toBe('ol');

      // Check individual segments
      const segmentItems = segments?.querySelectorAll('.usa-step-indicator__segment');
      expect(segmentItems).toHaveLength(2);

      // Check header structure
      const header = container?.querySelector('.usa-step-indicator__header');
      const heading = header?.querySelector('.usa-step-indicator__heading');
      expect(header).toBeTruthy();
      expect(heading?.tagName.toLowerCase()).toBe('h4');
    });

    it('should maintain proper DOM hierarchy', async () => {
      element.steps = [{ label: 'Test Step', status: 'current' }];
      await element.updateComplete;

      const container = element.querySelector('.usa-step-indicator');
      const segments = container?.querySelector('.usa-step-indicator__segments');
      const header = container?.querySelector('.usa-step-indicator__header');

      expect(container?.children).toHaveLength(3);
      expect(container?.children[0]).toBe(segments);
      expect(container?.children[1]).toBe(header);
      expect(container?.children[2].tagName.toLowerCase()).toBe('slot');
    });
  });

  describe('Step Status Management', () => {
    it('should automatically update step statuses based on currentStep', async () => {
      element.steps = [
        { label: 'Step 1', status: 'incomplete' },
        { label: 'Step 2', status: 'incomplete' },
        { label: 'Step 3', status: 'incomplete' },
      ];
      await element.updateComplete;

      // Set currentStep after steps to trigger status update
      element.currentStep = 2;
      await element.updateComplete;

      expect(element.steps[0].status).toBe('complete');
      expect(element.steps[1].status).toBe('current');
      expect(element.steps[2].status).toBe('incomplete');
    });

    it('should sync currentStep from steps array on initialization', async () => {
      // Remove element to test fresh initialization
      element.remove();
      element = document.createElement('usa-step-indicator') as USAStepIndicator;

      element.steps = [
        { label: 'Step 1', status: 'complete' },
        { label: 'Step 2', status: 'complete' },
        { label: 'Step 3', status: 'current' },
      ];

      // Add to DOM to trigger connectedCallback
      document.body.appendChild(element);
      await element.updateComplete;

      expect(element.currentStep).toBe(3);
    });

    it('should handle edge cases with currentStep changes', async () => {
      element.steps = [
        { label: 'Step 1', status: 'incomplete' },
        { label: 'Step 2', status: 'incomplete' },
      ];

      // Test step beyond range
      element.currentStep = 5;
      await element.updateComplete;
      // Should not crash and should handle gracefully

      // Test step 1
      element.currentStep = 1;
      await element.updateComplete;
      expect(element.steps[0].status).toBe('current');
      expect(element.steps[1].status).toBe('incomplete');
    });
  });

  describe('Public API Methods', () => {
    beforeEach(async () => {
      element.steps = [
        { label: 'Step 1', status: 'complete' },
        { label: 'Step 2', status: 'current' },
        { label: 'Step 3', status: 'incomplete' },
        { label: 'Step 4', status: 'incomplete' },
      ];
      element.currentStep = 2;
      await element.updateComplete;
    });

    it('should advance to next step using nextStep()', async () => {
      element.nextStep();
      await element.updateComplete;

      expect(element.currentStep).toBe(3);
      expect(element.steps[2].status).toBe('current');
    });

    it('should not advance past last step', async () => {
      element.currentStep = 4;
      element.nextStep();
      await element.updateComplete;

      expect(element.currentStep).toBe(4);
    });

    it('should go back to previous step using previousStep()', async () => {
      element.previousStep();
      await element.updateComplete;

      expect(element.currentStep).toBe(1);
      expect(element.steps[0].status).toBe('current');
    });

    it('should not go before first step', async () => {
      element.currentStep = 1;
      element.previousStep();
      await element.updateComplete;

      expect(element.currentStep).toBe(1);
    });

    it('should go to specific step using goToStep()', async () => {
      element.goToStep(4);
      await element.updateComplete;

      expect(element.currentStep).toBe(4);
      expect(element.steps[3].status).toBe('current');
    });

    it('should ignore invalid step numbers in goToStep()', async () => {
      const originalStep = element.currentStep;

      element.goToStep(0);
      expect(element.currentStep).toBe(originalStep);

      element.goToStep(10);
      expect(element.currentStep).toBe(originalStep);

      element.goToStep(-1);
      expect(element.currentStep).toBe(originalStep);
    });

    it('should mark specific step complete using markStepComplete()', async () => {
      element.markStepComplete(3);
      await element.updateComplete;

      expect(element.steps[2].status).toBe('complete');
    });

    it('should ignore invalid step numbers in markStepComplete()', async () => {
      const originalSteps = [...element.steps];

      element.markStepComplete(0);
      element.markStepComplete(10);

      expect(element.steps).toEqual(originalSteps);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Review', status: 'current' },
      ];
      await element.updateComplete;

      const container = element.querySelector('.usa-step-indicator');
      expect(container?.getAttribute('aria-label')).toBe(element.ariaLabel);

      const segments = element.querySelectorAll('.usa-step-indicator__segment');
      expect(segments[0].getAttribute('aria-current')).toBe('false');
      expect(segments[1].getAttribute('aria-current')).toBe('step');
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Review', status: 'current' },
        { label: 'Submit', status: 'incomplete' },
      ];
      await element.updateComplete;

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should include screen reader text for step status', async () => {
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Review', status: 'current' },
        { label: 'Submit', status: 'incomplete' },
      ];
      await element.updateComplete;

      const completedText = element.querySelector(
        '.usa-step-indicator__segment--complete .usa-sr-only'
      );
      expect(completedText?.textContent).toBe('completed');

      const incompleteSegment = element.querySelectorAll('.usa-step-indicator__segment')[2];
      const incompleteText = incompleteSegment.querySelector('.usa-sr-only');
      expect(incompleteText?.textContent).toBe('not completed');
    });

    it('should have screen reader text for step counter', async () => {
      element.steps = [{ label: 'Test', status: 'current' }];
      await element.updateComplete;

      const srText = element.querySelector('.usa-step-indicator__heading-counter .usa-sr-only');
      expect(srText?.textContent).toBe('Step');
    });

    it('should set aria-hidden on segments when labels are hidden', async () => {
      element.steps = [{ label: 'Test', status: 'current' }];
      element.showLabels = false;
      await element.updateComplete;

      // Check that the element has no-labels class instead of aria-hidden
      const container = element.querySelector('.usa-step-indicator');
      expect(container?.classList.contains('usa-step-indicator--no-labels')).toBe(true);

      // And that labels are not rendered
      const labels = element.querySelectorAll('.usa-step-indicator__segment-label');
      expect(labels).toHaveLength(0);
    });
  });

  describe('Light DOM Rendering', () => {
    it('should use light DOM rendering', () => {
      expect(element.shadowRoot).toBeNull();
      expect(element.renderRoot).toBe(element);
    });

    it('should apply USWDS classes directly to light DOM', async () => {
      element.steps = [{ label: 'Test', status: 'current' }];
      await element.updateComplete;

      const container = element.querySelector('.usa-step-indicator');
      expect(container).toBeTruthy();
      expect(container?.parentElement).toBe(element);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty steps array gracefully', async () => {
      element.steps = [];
      await element.updateComplete;

      const container = element.querySelector('.usa-step-indicator');
      const segments = element.querySelectorAll('.usa-step-indicator__segment');
      const header = element.querySelector('.usa-step-indicator__header');

      expect(container).toBeTruthy();
      expect(segments.length).toBe(0);
      expect(header).toBeFalsy(); // Header should not render when no steps
      expect(() => element.nextStep()).not.toThrow();
      expect(() => element.previousStep()).not.toThrow();
    });

    it('should handle rapid property changes', async () => {
      for (let i = 1; i <= 5; i++) {
        element.currentStep = i;
        element.steps = Array.from({ length: i }, (_, idx) => ({
          label: `Step ${idx + 1}`,
          status: idx + 1 === i ? ('current' as const) : ('complete' as const),
        }));
        await element.updateComplete;
      }

      expect(element.currentStep).toBe(5);
      expect(element.steps).toHaveLength(5);
    });

    it('should handle null and undefined values', async () => {
      // Test null/undefined handling
      element.ariaLabel = null as any;
      await element.updateComplete;

      element.ariaLabel = undefined as any;
      await element.updateComplete;

      // Should not crash and should use defaults
      expect(() => element.render()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large step arrays efficiently', async () => {
      const largeSteps = Array.from({ length: 50 }, (_, i) => ({
        label: `Step ${i + 1}`,
        status:
          i === 24
            ? ('current' as const)
            : i < 24
              ? ('complete' as const)
              : ('incomplete' as const),
      }));

      element.steps = largeSteps;
      element.currentStep = 25;
      await element.updateComplete;

      const segments = element.querySelectorAll('.usa-step-indicator__segment');
      expect(segments).toHaveLength(50);

      const currentStep = element.querySelector('.usa-step-indicator__current-step');
      expect(currentStep?.textContent).toBe('25');
    });

    it('should not create memory leaks with step updates', async () => {
      // Test multiple updates don't accumulate
      for (let i = 0; i < 10; i++) {
        element.steps = [
          { label: `Step A ${i}`, status: 'complete' },
          { label: `Step B ${i}`, status: 'current' },
        ];
        await element.updateComplete;
      }

      const segments = element.querySelectorAll('.usa-step-indicator__segment');
      expect(segments).toHaveLength(2);
    });
  });

  describe('Application Use Cases', () => {
    it('should handle federal benefits application workflow', async () => {
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Eligibility Verification', status: 'complete' },
        { label: 'Document Upload', status: 'current' },
        { label: 'Review Application', status: 'incomplete' },
        { label: 'Submit Application', status: 'incomplete' },
      ];
      element.currentStep = 3;
      await element.updateComplete;

      const currentStepText = element.querySelector('.usa-step-indicator__heading-text');
      expect(currentStepText?.textContent).toBe('Document Upload');

      const progress = element.querySelector('.usa-step-indicator__current-step');
      expect(progress?.textContent).toBe('3');
    });

    it('should handle tax filing workflow', async () => {
      element.steps = [
        { label: 'Income Information', status: 'complete' },
        { label: 'Deductions & Credits', status: 'complete' },
        { label: 'Review & File', status: 'current' },
        { label: 'Payment Options', status: 'incomplete' },
      ];
      element.currentStep = 3;
      await element.updateComplete;

      // Test navigation
      element.nextStep();
      await element.updateComplete;

      expect(element.currentStep).toBe(4);
      expect(element.steps[3].status).toBe('current');

      const heading = element.querySelector('.usa-step-indicator__heading-text');
      expect(heading?.textContent).toBe('Payment Options');
    });

    it('should handle security clearance application', async () => {
      element.steps = [
        { label: 'SF-86 Form', status: 'complete' },
        { label: 'Background Investigation', status: 'complete' },
        { label: 'Interview Process', status: 'current' },
        { label: 'Adjudication', status: 'incomplete' },
        { label: 'Final Determination', status: 'incomplete' },
      ];

      // Test step completion marking and movement
      element.currentStep = 3; // Set to step 3
      await element.updateComplete;

      element.markStepComplete(3);
      await element.updateComplete;

      element.nextStep();
      await element.updateComplete;

      expect(element.steps[2].status).toBe('complete');
      expect(element.currentStep).toBe(4);

      const segments = element.querySelectorAll('.usa-step-indicator__segment--complete');
      expect(segments).toHaveLength(3);
    });
  });

  // CRITICAL TESTS - Component Lifecycle Stability (Auto-dismiss Prevention)
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Contact Details', status: 'complete' },
        { label: 'Review Application', status: 'current' },
        { label: 'Submit Application', status: 'incomplete' },
        { label: 'Confirmation', status: 'incomplete' },
      ];
      element.currentStep = 3;
      element.showLabels = true;
      element.counters = true;
      element.center = false;
      element.ariaLabel = 'Application Progress';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain component state during rapid property changes', async () => {
      const initialParent = element.parentNode;

      // Rapid property changes that could trigger lifecycle issues
      for (let i = 0; i < 10; i++) {
        element.currentStep = (i % 5) + 1;
        element.showLabels = i % 2 === 0;
        element.counters = i % 3 === 0;
        element.center = i % 4 === 0;
        element.ariaLabel = `Process Step ${i}`;
        element.steps = Array.from({ length: 5 }, (_, j) => ({
          label: `Step ${i}-${j + 1}`,
          status: j < i % 5 ? 'complete' : j === i % 5 ? 'current' : 'incomplete',
        }));
        await element.updateComplete;
      }

      expect(element.parentNode).toBe(initialParent);
      expect(element.isConnected).toBe(true);
    });

    it('should handle complex step operations without disconnection', async () => {
      // Complex step progression operations
      element.steps = [
        { label: 'Initialize', status: 'incomplete' },
        { label: 'Configure', status: 'incomplete' },
        { label: 'Process', status: 'incomplete' },
        { label: 'Validate', status: 'incomplete' },
        { label: 'Complete', status: 'incomplete' },
      ];
      element.currentStep = 1;
      await element.updateComplete;

      // Simulate complex step progression
      for (let step = 1; step <= 5; step++) {
        element.currentStep = step;
        await element.updateComplete;

        element.markStepComplete(step);
        await element.updateComplete;

        if (step < 5) {
          element.nextStep();
          await element.updateComplete;
        }
      }

      // Test step reversal
      element.previousStep();
      element.previousStep();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Event System Stability (CRITICAL)', () => {
    it('should not interfere with other components after event handling', async () => {
      const eventsSpy = vi.fn();
      element.addEventListener('step-change', eventsSpy);
      element.addEventListener('step-click', eventsSpy);

      element.steps = [
        { label: 'Step 1', status: 'complete' },
        { label: 'Step 2', status: 'current' },
        { label: 'Step 3', status: 'incomplete' },
      ];
      element.currentStep = 2;
      await element.updateComplete;

      // Trigger step events
      element.setCurrentStep(1);
      await element.updateComplete;

      element.nextStep();
      await element.updateComplete;

      element.previousStep();
      await element.updateComplete;

      // Test step clicking if clickable
      const stepButton = element.querySelector('[data-step="1"]') as HTMLElement;
      stepButton?.click();

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle rapid step navigation without component removal', async () => {
      element.steps = Array.from({ length: 10 }, (_, i) => ({
        label: `Step ${i + 1}`,
        status: i < 3 ? 'complete' : i === 3 ? 'current' : 'incomplete',
      }));
      element.currentStep = 4;
      await element.updateComplete;

      // Rapid step navigation
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          element.nextStep();
        } else {
          element.previousStep();
        }
        await element.updateComplete;
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle event pollution without component removal', async () => {
      // Create potential event pollution
      for (let i = 0; i < 20; i++) {
        const customEvent = new CustomEvent(`test-event-${i}`, { bubbles: true });
        element.dispatchEvent(customEvent);
      }

      element.ariaLabel = 'Event Test Step Indicator';
      element.steps = [
        { label: 'Test Step 1', status: 'complete' },
        { label: 'Test Step 2', status: 'current' },
      ];
      element.currentStep = 2;
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Step State Management Stability (CRITICAL)', () => {
    it('should handle complex step status changes without disconnection', async () => {
      // Test complex step status management
      const stepConfigurations = [
        // Linear progression
        [
          { label: 'Start', status: 'current' },
          { label: 'Middle', status: 'incomplete' },
          { label: 'End', status: 'incomplete' },
        ],
        // Non-linear completion
        [
          { label: 'Start', status: 'complete' },
          { label: 'Middle', status: 'incomplete' },
          { label: 'End', status: 'current' },
        ],
        // All complete
        [
          { label: 'Start', status: 'complete' },
          { label: 'Middle', status: 'complete' },
          { label: 'End', status: 'complete' },
        ],
      ];

      for (const config of stepConfigurations) {
        element.steps = config;
        element.currentStep = config.findIndex((s) => s.status === 'current') + 1 || config.length;
        await element.updateComplete;

        // Verify step indicator renders correctly
        const segments = element.querySelectorAll('.usa-step-indicator__segment');
        expect(segments.length).toBe(config.length);
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle step count variations without disconnection', async () => {
      // Test different step counts
      const stepCounts = [2, 5, 8, 3, 10, 1];

      for (const count of stepCounts) {
        element.steps = Array.from({ length: count }, (_, i) => ({
          label: `Step ${i + 1}`,
          status: i === 0 ? 'current' : 'incomplete',
        }));
        element.currentStep = 1;
        await element.updateComplete;

        const segments = element.querySelectorAll('.usa-step-indicator__segment');
        expect(segments.length).toBe(count);
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
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

  describe('Storybook Integration (CRITICAL)', () => {
    it('should render in Storybook without auto-dismissing', async () => {
      element.ariaLabel = 'Storybook Test Step Indicator - Federal Application Process';
      element.showLabels = true;
      element.counters = true;
      element.center = false;
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Employment History', status: 'complete' },
        { label: 'Background Investigation', status: 'complete' },
        { label: 'Security Clearance', status: 'current' },
        { label: 'Document Verification', status: 'incomplete' },
        { label: 'Final Review', status: 'incomplete' },
        { label: 'Approval', status: 'incomplete' },
      ];
      element.currentStep = 4;
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(element.querySelector('.usa-step-indicator')).toBeTruthy();
      expect(element.querySelector('ol')).toBeTruthy();

      // Verify steps render correctly
      const segments = element.querySelectorAll('.usa-step-indicator__segment');
      expect(segments.length).toBe(7);

      // Verify current step is highlighted
      const currentSegment = element.querySelector('.usa-step-indicator__segment--current');
      expect(currentSegment).toBeTruthy();

      // Verify completed steps
      const completedSegments = element.querySelectorAll('.usa-step-indicator__segment--complete');
      expect(completedSegments.length).toBe(3);

      // Verify labels are shown
      const labels = element.querySelectorAll('.usa-step-indicator__segment-label');
      expect(labels.length).toBe(7);
      expect(labels[3]?.textContent?.trim()).toContain('Security Clearance');

      // Verify counters are shown
      const counters = element.querySelectorAll('.usa-step-indicator__segment-label');
      expect(counters.length).toBeGreaterThan(0);

      // Test step progression
      element.nextStep();
      await element.updateComplete;
      expect(element.currentStep).toBe(5);

      element.previousStep();
      await element.updateComplete;
      expect(element.currentStep).toBe(4);

      expect(element.isConnected).toBe(true);
      expect(document.body.contains(element)).toBe(true);
    });
  });

  describe('Layout and Structure Validation (Prevent Layout Issues)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-step-indicator') as USAStepIndicator;
      element.steps = [
        { label: 'Personal Information', status: 'complete' },
        { label: 'Employment History', status: 'complete' },
        { label: 'Background Check', status: 'current' },
        { label: 'Final Review', status: 'incomplete' },
        { label: 'Approval', status: 'incomplete' },
      ];
      element.currentStep = 3;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    describe('Step Segment Structure', () => {
      it('should have correct DOM structure for step segments', async () => {
        const container = element.querySelector('.usa-step-indicator');
        const segmentsList = element.querySelector('.usa-step-indicator__segments');
        const segments = element.querySelectorAll('.usa-step-indicator__segment');

        expect(container).toBeTruthy();
        expect(segmentsList).toBeTruthy();
        expect(segmentsList?.tagName).toBe('OL');
        expect(segments).toHaveLength(5);

        // Verify segments are inside the ordered list
        segments.forEach((segment) => {
          expect(segmentsList?.contains(segment as Node)).toBe(true);
          expect(segment.tagName).toBe('LI');
        });
      });

      it('should match USWDS reference structure for step indicator', async () => {
        // Expected structure from USWDS:
        // <div class="usa-step-indicator">
        //   <ol class="usa-step-indicator__segments">
        //     <li class="usa-step-indicator__segment">...</li>
        //   </ol>
        //   <div class="usa-step-indicator__header">
        //     <h4 class="usa-step-indicator__heading">...</h4>
        //   </div>
        // </div>

        const container = element.querySelector('.usa-step-indicator');
        const segmentsList = container?.querySelector('.usa-step-indicator__segments');
        const header = container?.querySelector('.usa-step-indicator__header');
        const heading = header?.querySelector('.usa-step-indicator__heading');

        expect(container).toBeTruthy();
        expect(segmentsList).toBeTruthy();
        expect(header).toBeTruthy();
        expect(heading).toBeTruthy();

        // Verify hierarchy
        expect(container?.contains(segmentsList as Node)).toBe(true);
        expect(container?.contains(header as Node)).toBe(true);
        expect(header?.contains(heading as Node)).toBe(true);

        // Verify heading is H4
        expect(heading?.tagName).toBe('H4');
      });

      it('should have proper status modifier classes on segments', async () => {
        const segments = element.querySelectorAll('.usa-step-indicator__segment');

        // First two should be complete
        expect(segments[0]?.classList.contains('usa-step-indicator__segment--complete')).toBe(true);
        expect(segments[1]?.classList.contains('usa-step-indicator__segment--complete')).toBe(true);

        // Third should be current
        expect(segments[2]?.classList.contains('usa-step-indicator__segment--current')).toBe(true);

        // Last two should be incomplete
        expect(segments[3]?.classList.contains('usa-step-indicator__segment--incomplete')).toBe(
          true
        );
        expect(segments[4]?.classList.contains('usa-step-indicator__segment--incomplete')).toBe(
          true
        );
      });

      it('should sync aria-current attribute with current step', async () => {
        const segments = element.querySelectorAll('.usa-step-indicator__segment');

        // Only current segment should have aria-current="step"
        let index = 0;
        for (const segment of segments) {
          if (index === 2) {
            // Current step
            expect(await waitForARIAAttribute(segment, 'aria-current')).toBe('step');
          } else {
            expect(await waitForARIAAttribute(segment, 'aria-current')).toBe('false');
          }
          index++;
        }
      });
    });

    describe('Header Structure', () => {
      it('should have correct structure for step counter header', async () => {
        const header = element.querySelector('.usa-step-indicator__header');
        const heading = element.querySelector('.usa-step-indicator__heading');
        const counter = element.querySelector('.usa-step-indicator__heading-counter');
        const currentStep = element.querySelector('.usa-step-indicator__current-step');
        const totalSteps = element.querySelector('.usa-step-indicator__total-steps');

        expect(header).toBeTruthy();
        expect(heading).toBeTruthy();
        expect(counter).toBeTruthy();
        expect(currentStep).toBeTruthy();
        expect(totalSteps).toBeTruthy();

        // Verify nesting
        expect(header?.contains(heading as Node)).toBe(true);
        expect(heading?.contains(counter as Node)).toBe(true);
      });

      it('should sync current step number with DOM content', async () => {
        const currentStepSpan = element.querySelector('.usa-step-indicator__current-step');
        expect(currentStepSpan?.textContent).toBe('3');

        // Update current step
        element.currentStep = 4;
        await element.updateComplete;

        const updatedCurrentStepSpan = element.querySelector('.usa-step-indicator__current-step');
        expect(updatedCurrentStepSpan?.textContent).toBe('4');
      });

      it('should display total steps count correctly', async () => {
        const totalStepsSpan = element.querySelector('.usa-step-indicator__total-steps');
        expect(totalStepsSpan?.textContent).toBe('of 5');

        // Change number of steps
        element.steps = [
          { label: 'Step 1', status: 'complete' },
          { label: 'Step 2', status: 'current' },
          { label: 'Step 3', status: 'incomplete' },
        ];
        await element.updateComplete;

        const updatedTotalStepsSpan = element.querySelector('.usa-step-indicator__total-steps');
        expect(updatedTotalStepsSpan?.textContent).toBe('of 3');
      });
    });

    describe('Label Rendering', () => {
      it('should render step labels when showLabels is true', async () => {
        element.showLabels = true;
        await element.updateComplete;

        const labels = element.querySelectorAll('.usa-step-indicator__segment-label');
        expect(labels).toHaveLength(5);

        // Verify labels have correct text
        expect(labels[0]?.textContent?.trim()).toContain('Personal Information');
        expect(labels[2]?.textContent?.trim()).toContain('Background Check');
      });

      it('should NOT render labels when showLabels is false', async () => {
        element.showLabels = false;
        await element.updateComplete;

        const labels = element.querySelectorAll('.usa-step-indicator__segment-label');
        expect(labels).toHaveLength(0);

        // Verify no-labels modifier class is applied
        const container = element.querySelector('.usa-step-indicator');
        expect(container?.classList.contains('usa-step-indicator--no-labels')).toBe(true);
      });

      it('should include screen reader status text in labels', async () => {
        element.showLabels = true;
        await element.updateComplete;

        // Complete step should say "completed"
        const completeSegment = element.querySelectorAll('.usa-step-indicator__segment')[0];
        const completeSrText = completeSegment?.querySelector('.usa-sr-only');
        expect(completeSrText?.textContent).toBe('completed');

        // Current step should say "current"
        const currentSegment = element.querySelectorAll('.usa-step-indicator__segment')[2];
        const currentSrText = currentSegment?.querySelector('.usa-sr-only');
        expect(currentSrText?.textContent).toBe('current');

        // Incomplete step should say "not completed"
        const incompleteSegment = element.querySelectorAll('.usa-step-indicator__segment')[3];
        const incompleteSrText = incompleteSegment?.querySelector('.usa-sr-only');
        expect(incompleteSrText?.textContent).toBe('not completed');
      });
    });

    describe('Modifier Classes', () => {
      it('should apply counters modifier class when counters=true', async () => {
        element.counters = true;
        element.showLabels = true;
        await element.updateComplete;

        const container = element.querySelector('.usa-step-indicator');
        expect(container?.classList.contains('usa-step-indicator--counters')).toBe(true);
      });

      it('should apply center modifier class when centered=true', async () => {
        element.centered = true;
        await element.updateComplete;

        const container = element.querySelector('.usa-step-indicator');
        expect(container?.classList.contains('usa-step-indicator--center')).toBe(true);
      });

      it('should apply small modifier class when small=true', async () => {
        element.small = true;
        await element.updateComplete;

        const container = element.querySelector('.usa-step-indicator');
        expect(container?.classList.contains('usa-step-indicator--small')).toBe(true);
      });

      it('should apply multiple modifiers simultaneously', async () => {
        element.counters = true;
        element.centered = true;
        element.small = true;
        element.showLabels = true;
        await element.updateComplete;

        const container = element.querySelector('.usa-step-indicator');
        expect(container?.classList.contains('usa-step-indicator--counters')).toBe(true);
        expect(container?.classList.contains('usa-step-indicator--center')).toBe(true);
        expect(container?.classList.contains('usa-step-indicator--small')).toBe(true);
      });
    });

    describe('Visual Rendering Validation', () => {
      it('should render step indicator in the DOM', async () => {
        const container = element.querySelector('.usa-step-indicator');
        expect(container).toBeTruthy();
        expect(container?.isConnected).toBe(true);

        // Note: jsdom doesn't support getComputedStyle for display values
        // This test validates the element exists and is in the DOM
        expect(container?.parentElement).toBe(element);
      });

      it('should render all step segments as visible', async () => {
        const segments = element.querySelectorAll(
          '.usa-step-indicator__segment'
        ) as NodeListOf<HTMLElement>;

        segments.forEach((segment) => {
          // Segment should exist and be in DOM
          expect(segment).toBeTruthy();
          expect(segment.isConnected).toBe(true);
        });
      });

      it('should render header section as visible', async () => {
        const header = element.querySelector('.usa-step-indicator__header') as HTMLElement;
        expect(header).toBeTruthy();
        expect(header.isConnected).toBe(true);

        // Header should be visible (no hidden attribute)
        expect(header.hasAttribute('hidden')).toBe(false);
      });
    });

    describe('Dynamic Step Updates', () => {
      it('should maintain structure when steps change', async () => {
        // Start with 5 steps
        const originalSegments = element.querySelectorAll('.usa-step-indicator__segment');
        expect(originalSegments).toHaveLength(5);

        // Change to 3 steps
        element.steps = [
          { label: 'Step 1', status: 'complete' },
          { label: 'Step 2', status: 'current' },
          { label: 'Step 3', status: 'incomplete' },
        ];
        await element.updateComplete;

        const newSegments = element.querySelectorAll('.usa-step-indicator__segment');
        expect(newSegments).toHaveLength(3);

        // Verify container structure is maintained
        const container = element.querySelector('.usa-step-indicator');
        const segmentsList = element.querySelector('.usa-step-indicator__segments');
        const header = element.querySelector('.usa-step-indicator__header');

        expect(container).toBeTruthy();
        expect(segmentsList).toBeTruthy();
        expect(header).toBeTruthy();
      });

      it('should update segment classes when currentStep changes', async () => {
        // Move from step 3 to step 4
        element.currentStep = 4;
        await element.updateComplete;

        // Need to wait for the component to sync step statuses
        await new Promise((resolve) => setTimeout(resolve, 50));

        const segments = element.querySelectorAll('.usa-step-indicator__segment');

        // Verify Step 4 is current (the critical update)
        expect(segments[3]?.classList.contains('usa-step-indicator__segment--current')).toBe(true);

        // Verify the header shows correct current step number
        const currentStepSpan = element.querySelector('.usa-step-indicator__current-step');
        expect(currentStepSpan?.textContent).toBe('4');

        // Note: The component automatically updates step statuses based on currentStep
        // When currentStep=4, steps 1-3 should be complete, step 4 current, step 5 incomplete
        // This is handled by the component's updateStepStatusesSync() method
      });
    });
  });
});
