import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-multi-step-form-pattern.js';
import type { USAMultiStepFormPattern, FormStep } from './usa-multi-step-form-pattern.js';

describe('USAMultiStepFormPattern', () => {
  let pattern: USAMultiStepFormPattern;
  let container: HTMLDivElement;

  const mockSteps: FormStep[] = [
    { id: 'personal-info', label: 'Personal Information' },
    { id: 'address', label: 'Address' },
    { id: 'review', label: 'Review' },
  ];

  // Helper to wait for button to appear
  const waitForButton = async (buttonText: string, maxWait = 2000): Promise<HTMLElement | null> => {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      const buttons = pattern.querySelectorAll('usa-button');

      // Wait for all buttons to complete their update cycle (so firstUpdated runs and content is moved)
      await Promise.all(
        Array.from(buttons).map((btn: any) => btn.updateComplete || Promise.resolve())
      );

      const button = Array.from(buttons).find(
        (btn) => btn.textContent?.trim() === buttonText
      ) as HTMLElement;
      if (button) {
        return button;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return null;
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    container?.remove();
    localStorage.clear();
  });

  describe('Pattern Initialization', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
    });

    it('should create pattern element', async () => {
      expect(pattern).toBeInstanceOf(HTMLElement);
      expect(pattern.tagName).toBe('USA-MULTI-STEP-FORM-PATTERN');
    });

    it('should have default properties', async () => {
      expect(pattern.showNavigation).toBe(true);
      expect(pattern.backButtonLabel).toBe('Back');
      expect(pattern.nextButtonLabel).toBe('Next');
      expect(pattern.skipButtonLabel).toBe('Skip');
      expect(pattern.submitButtonLabel).toBe('Submit');
      expect(pattern.persistState).toBe(false);
      expect(pattern.storageKey).toBe('uswds-form-progress');
      expect(pattern.steps).toEqual(mockSteps);
    });

    it('should use Light DOM for USWDS style compatibility', async () => {
      expect(pattern.shadowRoot).toBeNull();
    });

    it('should start on first step', async () => {
      expect(pattern.getCurrentStepIndex()).toBe(0);
      expect(pattern.getCurrentStepData()).toEqual(mockSteps[0]);
    });

    it('should emit pattern-ready event on initialization', async () => {
      const newPattern = document.createElement(
        'usa-multi-step-form-pattern'
      ) as USAMultiStepFormPattern;
      newPattern.steps = mockSteps;

      const readyPromise = new Promise<CustomEvent>((resolve) => {
        newPattern.addEventListener('pattern-ready', (e) => resolve(e as CustomEvent));
      });

      container.appendChild(newPattern);
      await newPattern.updateComplete;

      const event = await readyPromise;
      expect(event.detail.currentStep).toBe(0);
      expect(event.detail.totalSteps).toBe(3);
      expect(event.detail.step).toEqual(mockSteps[0]);

      newPattern.remove();
    });
  });

  describe('Progress Display', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should display current step progress', async () => {
      const progressText = pattern.querySelector('.text-base');
      expect(progressText?.textContent).toContain('Step 1 of 3');
      expect(progressText?.textContent).toContain('Personal Information');
    });

    it('should update progress text when navigating', async () => {
      await pattern.goToStep(1);
      await pattern.updateComplete;

      const progressText = pattern.querySelector('.text-base');
      expect(progressText?.textContent).toContain('Step 2 of 3');
      expect(progressText?.textContent).toContain('Address');
    });
  });

  describe('Navigation Buttons', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should show navigation buttons by default', async () => {
      const buttonGroup = pattern.querySelector('.usa-button-group');
      expect(buttonGroup).toBeTruthy();
    });

    it('should hide navigation buttons when showNavigation is false', async () => {
      pattern.showNavigation = false;
      await pattern.updateComplete;

      const buttonGroup = pattern.querySelector('.usa-button-group');
      expect(buttonGroup).toBeNull();
    });

    it('should not show back button on first step', async () => {
      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find((btn) => btn.textContent?.includes('Back'));
      expect(backButton).toBeFalsy();
    });

    it('should show back button on non-first steps', async () => {
      await pattern.goToStep(1);
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Back');
      expect(backButton).toBeTruthy();
    });

    it('should show Next button on non-final steps', async () => {
      const buttons = pattern.querySelectorAll('usa-button');
      const nextButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Next');
      expect(nextButton).toBeTruthy();
    });

    it('should show Submit button on final step', async () => {
      await pattern.goToStep(2);
      await pattern.updateComplete;
      // Light DOM requires extra time for re-render, especially in full test suite
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Increase timeout for concurrent test execution
      const submitButton = await waitForButton('Submit', 5000);
      expect(submitButton).toBeTruthy();
    });

    it('should not show Skip button for required steps', async () => {
      const buttons = pattern.querySelectorAll('usa-button');
      const skipButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Skip');
      expect(skipButton).toBeFalsy();
    });

    it('should show Skip button for optional steps', async () => {
      pattern.steps = [
        { id: 'step1', label: 'Step 1' },
        { id: 'step2', label: 'Step 2', optional: true },
      ];
      await pattern.goToStep(1);
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const skipButton = Array.from(buttons).find((btn) => btn.textContent?.trim() === 'Skip');
      expect(skipButton).toBeTruthy();
    });

    it('should use custom button labels', async () => {
      // Create new pattern with custom labels set before rendering
      const customPattern = document.createElement(
        'usa-multi-step-form-pattern'
      ) as USAMultiStepFormPattern;
      pattern = customPattern; // Set to outer scope for waitForButton helper
      customPattern.steps = mockSteps;
      customPattern.backButtonLabel = 'Previous';
      customPattern.nextButtonLabel = 'Continue';
      customPattern.submitButtonLabel = 'Finish';
      container.appendChild(customPattern);
      await customPattern.updateComplete;

      await customPattern.goToStep(2);
      await customPattern.updateComplete;
      // Light DOM requires extra time for re-render, especially in full test suite
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Increase timeout for concurrent test execution
      const backButton = await waitForButton('Previous', 5000);
      const submitButton = await waitForButton('Finish', 5000);

      expect(backButton).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });
  });

  describe('Next Navigation', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should navigate to next step when clicking Next', async () => {
      const stepChangePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('step-change', (e) => resolve(e as CustomEvent));
      });

      const buttons = pattern.querySelectorAll('usa-button');
      const nextButton = Array.from(buttons).find(
        (btn) => btn.textContent?.trim() === 'Next'
      ) as HTMLElement;
      nextButton?.click();

      const event = await stepChangePromise;
      expect(event.detail.currentStep).toBe(1);
      expect(event.detail.previousStep).toBe(0);
      expect(event.detail.direction).toBe('forward');
      expect(event.detail.step).toEqual(mockSteps[1]);
    });

    it('should validate step before proceeding', async () => {
      const validate = vi.fn().mockReturnValue(false);
      pattern.steps = [
        { id: 'step1', label: 'Step 1', validate },
        { id: 'step2', label: 'Step 2' },
      ];
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const nextButton = Array.from(buttons).find(
        (btn) => btn.textContent?.trim() === 'Next'
      ) as HTMLElement;
      nextButton?.click();

      await pattern.updateComplete;

      expect(validate).toHaveBeenCalled();
      expect(pattern.getCurrentStepIndex()).toBe(0); // Should not advance
    });

    it('should proceed if validation passes', async () => {
      const validate = vi.fn().mockReturnValue(true);
      // Create new pattern with validation set before rendering
      const validationPattern = document.createElement(
        'usa-multi-step-form-pattern'
      ) as USAMultiStepFormPattern;
      validationPattern.steps = [
        { id: 'step1', label: 'Step 1', validate },
        { id: 'step2', label: 'Step 2' },
      ];
      container.appendChild(validationPattern);
      await validationPattern.updateComplete;
      // Wait for child components to render (increased for concurrent execution)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use helper to ensure button content is rendered (increased timeout)
      pattern = validationPattern; // Update pattern reference for waitForButton helper
      const nextButton = await waitForButton('Next', 5000);
      expect(nextButton).toBeTruthy();
      nextButton?.click();

      await validationPattern.updateComplete;
      // Wait for async navigation to complete (increased for concurrent execution)
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(validate).toHaveBeenCalled();
      expect(validationPattern.getCurrentStepIndex()).toBe(1); // Should advance
    });

    it('should support async validation', async () => {
      const validate = vi.fn().mockResolvedValue(true);
      // Create new pattern with async validation set before rendering
      const asyncPattern = document.createElement(
        'usa-multi-step-form-pattern'
      ) as USAMultiStepFormPattern;
      asyncPattern.steps = [
        { id: 'step1', label: 'Step 1', validate },
        { id: 'step2', label: 'Step 2' },
      ];
      container.appendChild(asyncPattern);
      await asyncPattern.updateComplete;
      // Wait for child components to render (increased for concurrent execution)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use helper to ensure button content is rendered (increased timeout)
      pattern = asyncPattern; // Update pattern reference for waitForButton helper
      const nextButton = await waitForButton('Next', 5000);
      expect(nextButton).toBeTruthy();
      nextButton?.click();

      await asyncPattern.updateComplete;
      // Wait for async validation (increased for concurrent execution)
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(validate).toHaveBeenCalled();
      expect(asyncPattern.getCurrentStepIndex()).toBe(1);
    });
  });

  describe('Back Navigation', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
      // Navigate to second step
      await pattern.goToStep(1);
      await pattern.updateComplete;
    });

    it('should navigate to previous step when clicking Back', async () => {
      const stepChangePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('step-change', (e) => resolve(e as CustomEvent));
      });

      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find(
        (btn) => btn.textContent?.trim() === 'Back'
      ) as HTMLElement;
      backButton?.click();

      const event = await stepChangePromise;
      expect(event.detail.currentStep).toBe(0);
      expect(event.detail.previousStep).toBe(1);
      expect(event.detail.direction).toBe('back');
    });

    it('should not validate when going back', async () => {
      const validate = vi.fn();
      pattern.steps[1].validate = validate;

      const buttons = pattern.querySelectorAll('usa-button');
      const backButton = Array.from(buttons).find(
        (btn) => btn.textContent?.trim() === 'Back'
      ) as HTMLElement;
      backButton?.click();

      await pattern.updateComplete;

      expect(validate).not.toHaveBeenCalled();
      expect(pattern.getCurrentStepIndex()).toBe(0);
    });
  });

  describe('Skip Navigation', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = [
        { id: 'step1', label: 'Step 1' },
        { id: 'step2', label: 'Step 2', optional: true },
        { id: 'step3', label: 'Step 3' },
      ];
      container.appendChild(pattern);
      await pattern.updateComplete;
      // Navigate to optional step
      await pattern.goToStep(1);
      await pattern.updateComplete;
    });

    it('should skip optional step when clicking Skip', async () => {
      const stepChangePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('step-change', (e) => resolve(e as CustomEvent));
      });

      const buttons = pattern.querySelectorAll('usa-button');
      const skipButton = Array.from(buttons).find(
        (btn) => btn.textContent?.trim() === 'Skip'
      ) as HTMLElement;
      skipButton?.click();

      const event = await stepChangePromise;
      expect(event.detail.currentStep).toBe(2);
      expect(event.detail.previousStep).toBe(1);
      expect(event.detail.direction).toBe('skip');
    });

    it('should not validate when skipping', async () => {
      const validate = vi.fn();
      pattern.steps[1].validate = validate;
      await pattern.updateComplete;

      const buttons = pattern.querySelectorAll('usa-button');
      const skipButton = Array.from(buttons).find(
        (btn) => btn.textContent?.trim() === 'Skip'
      ) as HTMLElement;
      skipButton?.click();

      await pattern.updateComplete;

      expect(validate).not.toHaveBeenCalled();
      expect(pattern.getCurrentStepIndex()).toBe(2);
    });
  });

  describe('Form Completion', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
      // Navigate to final step
      await pattern.goToStep(2);
      await pattern.updateComplete;
      // Wait for child components to render after navigation
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    it('should emit form-complete event when submitting final step', async () => {
      const completePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('form-complete', (e) => resolve(e as CustomEvent));
      });

      // Use helper to ensure button content is rendered
      const submitButton = await waitForButton('Submit');
      expect(submitButton).toBeTruthy();
      submitButton?.click();

      const event = await completePromise;
      expect(event.detail.totalSteps).toBe(3);
    });

    it('should validate final step before completion', async () => {
      const validate = vi.fn().mockReturnValue(false);
      // Create new pattern with validation set before rendering
      const validationPattern = document.createElement(
        'usa-multi-step-form-pattern'
      ) as USAMultiStepFormPattern;
      validationPattern.steps = [mockSteps[0], mockSteps[1], { ...mockSteps[2], validate }];
      container.appendChild(validationPattern);
      await validationPattern.updateComplete;

      // Navigate to final step
      await validationPattern.goToStep(2);
      await validationPattern.updateComplete;
      // Wait for child components to render
      await new Promise((resolve) => setTimeout(resolve, 250));

      const completeListener = vi.fn();
      validationPattern.addEventListener('form-complete', completeListener);

      // Use helper to ensure button content is rendered
      pattern = validationPattern; // Update pattern reference for waitForButton helper
      const submitButton = await waitForButton('Submit');
      expect(submitButton).toBeTruthy();
      submitButton?.click();

      await validationPattern.updateComplete;

      expect(validate).toHaveBeenCalled();
      expect(completeListener).not.toHaveBeenCalled();
    });

    it('should clear persisted state on completion', async () => {
      pattern.persistState = true;
      pattern.storageKey = 'test-form-progress';
      localStorage.setItem('test-form-progress', JSON.stringify({ stepIndex: 2 }));

      // Use helper to ensure button content is rendered
      const submitButton = await waitForButton('Submit');
      expect(submitButton).toBeTruthy();
      submitButton?.click();

      await pattern.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 250));

      // localStorage should be cleared after form completion
      expect(localStorage.getItem('test-form-progress')).toBeNull();
    });
  });

  describe('State Persistence', () => {
    it('should not persist state by default', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.storageKey = 'test-form-progress';
      container.appendChild(pattern);
      await pattern.updateComplete;

      await pattern.goToStep(1);
      await pattern.updateComplete;

      expect(localStorage.getItem('test-form-progress')).toBeNull();

      pattern.remove();
    });

    it('should persist state when enabled', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.persistState = true;
      pattern.storageKey = 'test-form-progress';
      container.appendChild(pattern);
      await pattern.updateComplete;

      await pattern.goToStep(1);
      await pattern.updateComplete;

      const stored = localStorage.getItem('test-form-progress');
      expect(stored).toBeTruthy();

      const data = JSON.parse(stored!);
      expect(data.stepIndex).toBe(1);
      expect(data.timestamp).toBeDefined();

      pattern.remove();
    });

    it('should restore state from localStorage on init', async () => {
      localStorage.setItem(
        'uswds-form-progress',
        JSON.stringify({ stepIndex: 1, timestamp: Date.now() })
      );

      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.persistState = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(1);
    });

    it('should ignore invalid persisted state', async () => {
      localStorage.setItem('uswds-form-progress', 'invalid-json');

      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.persistState = true;
      container.appendChild(pattern);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(0); // Should start at beginning
    });

    it('should clear persisted state via clearPersistedState()', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.persistState = true;
      pattern.storageKey = 'test-form-progress';
      container.appendChild(pattern);
      await pattern.updateComplete;

      await pattern.goToStep(1);
      await pattern.updateComplete;

      expect(localStorage.getItem('test-form-progress')).toBeTruthy();

      pattern.clearPersistedState();

      expect(localStorage.getItem('test-form-progress')).toBeNull();
    });
  });

  describe('Public API', () => {
    beforeEach(() => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
    });

    it('should set steps via setSteps()', async () => {
      const newSteps: FormStep[] = [
        { id: 'step-a', label: 'Step A' },
        { id: 'step-b', label: 'Step B' },
      ];

      pattern.setSteps(newSteps);
      await pattern.updateComplete;

      expect(pattern.steps).toEqual(newSteps);
      expect(pattern.getCurrentStepIndex()).toBe(0);
    });

    it('should reset to first step when setSteps makes current index invalid', async () => {
      await pattern.goToStep(2);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(2);

      const newSteps: FormStep[] = [{ id: 'step-a', label: 'Step A' }];

      pattern.setSteps(newSteps);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(0);
    });

    it('should navigate to specific step via goToStep()', async () => {
      const stepChangePromise = new Promise<CustomEvent>((resolve) => {
        pattern.addEventListener('step-change', (e) => resolve(e as CustomEvent));
      });

      await pattern.goToStep(2);

      const event = await stepChangePromise;
      expect(event.detail.currentStep).toBe(2);
      expect(event.detail.previousStep).toBe(0);
      expect(pattern.getCurrentStepIndex()).toBe(2);
    });

    it('should not navigate to invalid step index', async () => {
      await pattern.goToStep(-1);
      expect(pattern.getCurrentStepIndex()).toBe(0);

      await pattern.goToStep(999);
      expect(pattern.getCurrentStepIndex()).toBe(0);
    });

    it('should get current step index via getCurrentStepIndex()', async () => {
      expect(pattern.getCurrentStepIndex()).toBe(0);
      await pattern.goToStep(1);
      expect(pattern.getCurrentStepIndex()).toBe(1);
    });

    it('should get current step data via getCurrentStepData()', async () => {
      expect(pattern.getCurrentStepData()).toEqual(mockSteps[0]);
      await pattern.goToStep(1);
      expect(pattern.getCurrentStepData()).toEqual(mockSteps[1]);
    });

    it('should reset to first step via reset()', async () => {
      await pattern.goToStep(2);
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(2);

      pattern.reset();
      await pattern.updateComplete;

      expect(pattern.getCurrentStepIndex()).toBe(0);
    });
  });

  describe('Slots', () => {
    it('should render step content via slots', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.innerHTML = `
        <div slot="step-personal-info"><h2>Personal Info Content</h2></div>
        <div slot="step-address"><h2>Address Content</h2></div>
        <div slot="step-review"><h2>Review Content</h2></div>
      `;
      container.appendChild(pattern);
      await pattern.updateComplete;

      const stepContent = pattern.querySelector('div[slot="step-personal-info"]');
      expect(stepContent).toBeTruthy();
      expect(stepContent?.querySelector('h2')?.textContent).toBe('Personal Info Content');
    });

    it('should support custom progress slot', async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      pattern.innerHTML = '<div slot="progress"><p>Custom Progress</p></div>';
      container.appendChild(pattern);
      await pattern.updateComplete;

      const customProgress = pattern.querySelector('div[slot="progress"]');
      expect(customProgress).toBeTruthy();
      expect(customProgress?.querySelector('p')?.textContent).toBe('Custom Progress');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      pattern = document.createElement('usa-multi-step-form-pattern') as USAMultiStepFormPattern;
      pattern.steps = mockSteps;
      container.appendChild(pattern);
      await pattern.updateComplete;
    });

    it('should have descriptive button labels', async () => {
      const buttons = pattern.querySelectorAll('usa-button');
      buttons.forEach((button) => {
        expect(button.textContent?.trim().length).toBeGreaterThan(0);
      });
    });

    it('should disable buttons during validation', async () => {
      const validate = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(true), 100)));
      pattern.steps[0].validate = validate;
      await pattern.updateComplete;

      const nextButton = Array.from(pattern.querySelectorAll('usa-button')).find(
        (btn) => btn.textContent?.trim() === 'Next'
      ) as HTMLElement;

      nextButton?.click();

      // Buttons should be disabled during validation
      await pattern.updateComplete;
      const buttons = pattern.querySelectorAll('usa-button');
      buttons.forEach((button) => {
        expect(button.hasAttribute('disabled')).toBe(true);
      });

      // Wait for validation to complete
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
  });
});
