import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../textarea/usa-textarea.ts';
import type { USATextarea } from '../textarea/usa-textarea.js';
import {
  waitForUpdate,
  testPropertyChanges,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USATextarea', () => {
  let element: USATextarea;

  beforeEach(() => {
    element = document.createElement('usa-textarea') as USATextarea;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(element.name).toBe('');
      expect(element.value).toBe('');
      expect(element.placeholder).toBe('');
      expect(element.label).toBe('');
      expect(element.hint).toBe('');
      expect(element.error).toBe('');
      expect(element.success).toBe('');
      expect(element.disabled).toBe(false);
      expect(element.required).toBe(false);
      expect(element.readonly).toBe(false);
      expect(element.rows).toBe(4);
      expect(element.cols).toBe(null);
      expect(element.maxlength).toBe(null);
      expect(element.minlength).toBe(null);
      expect(element.autocomplete).toBe('');
    });

    it('should update textarea element when properties change', async () => {
      element.name = 'test-textarea';
      element.value = 'test value';
      element.placeholder = 'test placeholder';
      element.disabled = true;
      element.required = true;
      element.readonly = true;
      element.rows = 6;
      element.cols = 80;
      element.maxlength = 100;
      element.minlength = 10;
      element.autocomplete = 'on';

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.name).toBe('test-textarea');
      expect(textarea.value).toBe('test value');
      expect(textarea.placeholder).toBe('test placeholder');
      expect(textarea.disabled).toBe(true);
      expect(textarea.required).toBe(true);
      expect(textarea.readOnly).toBe(true);
      expect(textarea.rows).toBe(6);
      expect(textarea.cols).toBe(80);
      expect(textarea.maxLength).toBe(100);
      expect(textarea.minLength).toBe(10);
      expect(textarea.getAttribute('autocomplete')).toBe('on');
    });

    it('should handle nullable properties correctly', async () => {
      element.cols = null;
      element.maxlength = null;
      element.minlength = null;

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.cols).toBe(20); // Browser default
      expect(textarea.maxLength).toBe(-1); // Browser default for no limit
      expect(textarea.minLength).toBe(-1); // Browser default for no limit
    });
  });

  describe('Rendering', () => {
    it('should render textarea with correct structure', async () => {
      element.label = 'Test Label';

      await waitForPropertyPropagation(element);

      const label = element.querySelector('label');
      const textarea = element.querySelector('textarea');

      expect(label).toBeTruthy();
      expect(textarea).toBeTruthy();
      expect(label?.textContent?.trim()).toBe('Test Label');
      expect(textarea?.className).toContain('usa-textarea');
    });

    it('should render label with required indicator', async () => {
      element.label = 'Required Field';
      element.required = true;

      await waitForPropertyPropagation(element);

      const label = element.querySelector('label');
      const requiredSpan = label?.querySelector('.usa-hint--required');

      expect(requiredSpan).toBeTruthy();
      expect(requiredSpan?.textContent?.trim()).toBe('*');
    });

    it('should render hint text when provided', async () => {
      element.hint = 'This is helper text';

      await waitForPropertyPropagation(element);

      const hint = element.querySelector('.usa-hint');
      expect(hint).toBeTruthy();
      expect(hint?.textContent?.trim()).toBe('This is helper text');
    });

    it('should render error message when in error state', async () => {
      element.error = 'This field is required';

      await waitForPropertyPropagation(element);

      const errorMsg = element.querySelector('.usa-error-message');
      expect(errorMsg).toBeTruthy();
      expect(errorMsg?.getAttribute('role')).toBe('alert');
      expect(errorMsg?.textContent?.includes('This field is required')).toBe(true);

      const textarea = element.querySelector('textarea');
      expect(textarea?.className).toContain('usa-textarea--error');
    });

    it('should render success message when in success state', async () => {
      element.success = 'Good job!';

      await waitForPropertyPropagation(element);

      const successMsg = element.querySelector('.usa-alert--success');
      expect(successMsg).toBeTruthy();
      expect(successMsg?.getAttribute('role')).toBe('status');
      expect(successMsg?.textContent?.includes('Good job!')).toBe(true);

      const textarea = element.querySelector('textarea');
      expect(textarea?.className).toContain('usa-textarea--success');
    });

    it('should render without label when not provided', async () => {
      await waitForUpdate(element);

      const label = element.querySelector('label');
      expect(label).toBeFalsy();
    });
  });

  describe('ARIA and Accessibility', () => {
    it('should have correct ID management', async () => {
      await waitForUpdate(element);

      const textarea = element.querySelector('textarea');
      expect(textarea?.id).toBeTruthy();
      expect(textarea?.id).toMatch(/^textarea-[a-z0-9]+$/);
    });

    it('should use element ID when provided', async () => {
      element.id = 'custom-textarea';
      await element.updateComplete;

      const textarea = element.querySelector('textarea');
      expect(textarea?.id).toBe('custom-textarea');
    });

    it('should connect label to textarea', async () => {
      element.id = 'test-textarea';
      element.label = 'Test Label';

      await waitForPropertyPropagation(element);

      const label = element.querySelector('label');
      const textarea = element.querySelector('textarea');

      expect(label?.getAttribute('for')).toBe('test-textarea');
      expect(textarea?.id).toBe('test-textarea');
    });

    it('should connect hint via aria-describedby', async () => {
      element.id = 'test-textarea';
      element.hint = 'Helper text';

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea');
      const describedBy = textarea?.getAttribute('aria-describedby');

      expect(describedBy).toBe('test-textarea-hint');
    });

    it('should connect error via aria-describedby and set aria-invalid', async () => {
      element.id = 'test-textarea';
      element.error = 'Error message';

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea');
      const describedBy = textarea?.getAttribute('aria-describedby');
      const ariaInvalid = textarea?.getAttribute('aria-invalid');

      expect(describedBy).toBe('test-textarea-error');
      expect(ariaInvalid).toBe('true');
    });

    it('should handle multiple aria-describedby values', async () => {
      element.id = 'test-textarea';
      element.hint = 'Helper text';
      element.error = 'Error message';
      element.success = 'Success message';

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea');
      const describedBy = textarea?.getAttribute('aria-describedby');

      expect(describedBy).toContain('test-textarea-hint');
      expect(describedBy).toContain('test-textarea-error');
      expect(describedBy).toContain('test-textarea-success');
    });

    it('should clear aria-invalid when not in error state', async () => {
      element.error = 'Error message';
      await waitForUpdate(element);

      element.error = '';
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea');
      expect(textarea?.hasAttribute('aria-invalid')).toBe(false);
    });

    it('should remove aria-describedby when no descriptive text', async () => {
      element.hint = 'Helper text';
      await waitForUpdate(element);

      element.hint = '';
      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea');
      expect(textarea?.hasAttribute('aria-describedby')).toBe(false);
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.label = 'Test Textarea';
      element.hint = 'Please enter your comments';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Events', () => {
    it('should dispatch input event when text changes', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('input', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      await element.updateComplete;

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;

      // Update value and create a proper input event with target
      textarea.value = 'test input';
      const inputEvent = new Event('input', { bubbles: true });
      // Simulate the event having the textarea as target
      Object.defineProperty(inputEvent, 'target', {
        value: textarea,
        writable: false,
        configurable: true,
      });

      // Call the handleInput method directly to simulate Lit's event handling
      (element as any).handleInput(inputEvent);

      expect(eventFired).toBe(true);
      expect(eventDetail?.value).toBe('test input');
      expect(element.value).toBe('test input');
    });

    it('should dispatch change event when textarea loses focus', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('change', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      await element.updateComplete;

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'test change';

      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        value: textarea,
        writable: false,
        configurable: true,
      });

      // Call the handleChange method directly
      (element as any).handleChange(changeEvent);

      expect(eventFired).toBe(true);
      expect(eventDetail?.value).toBe('test change');
      expect(element.value).toBe('test change');
    });

    it('should include name in event detail when provided', async () => {
      element.name = 'test-textarea';
      let eventDetail: any = null;

      element.addEventListener('input', (e: any) => {
        eventDetail = e.detail;
      });

      await element.updateComplete;

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'test';

      const inputEvent = new Event('input', { bubbles: true });
      Object.defineProperty(inputEvent, 'target', {
        value: textarea,
        writable: false,
        configurable: true,
      });

      // Call the handleInput method directly
      (element as any).handleInput(inputEvent);

      expect(eventDetail?.name).toBe('test-textarea');
    });
  });

  describe('Form Integration', () => {
    it('should integrate with forms', async () => {
      const form = document.createElement('form');
      element.name = 'comment';
      element.value = 'Test comment';
      form.appendChild(element);
      document.body.appendChild(form);

      await waitForUpdate(element);

      const formData = new FormData(form);
      expect(formData.get('comment')).toBe('Test comment');

      form.remove();
    });

    it('should update form data when value changes', async () => {
      const form = document.createElement('form');
      element.name = 'message';
      form.appendChild(element);
      document.body.appendChild(form);

      await waitForUpdate(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'Updated message';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));

      const formData = new FormData(form);
      expect(formData.get('message')).toBe('Updated message');

      form.remove();
    });
  });

  describe('Character Limits', () => {
    it('should enforce maxlength', async () => {
      element.maxlength = 10;

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(10);
    });

    it('should enforce minlength', async () => {
      element.minlength = 5;

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.minLength).toBe(5);
    });
  });

  describe('Property Changes', () => {
    it('should handle disabled state changes', async () => {
      await testPropertyChanges(element, 'disabled', [false, true, false], async (el, value) => {
        const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
        expect(textarea.disabled).toBe(value);
      });
    });

    it('should handle readonly state changes', async () => {
      await testPropertyChanges(element, 'readonly', [false, true, false], async (el, value) => {
        const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
        expect(textarea.readOnly).toBe(value);
      });
    });

    it('should handle row changes', async () => {
      await testPropertyChanges(element, 'rows', [4, 6, 8], async (el, value) => {
        const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
        expect(textarea.rows).toBe(value);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty values gracefully', async () => {
      element.value = '';
      element.label = '';
      element.hint = '';
      element.error = '';
      element.success = '';

      await waitForUpdate(element);

      expect(element.querySelector('label')).toBeFalsy();
      expect(element.querySelector('.usa-hint')).toBeFalsy();
      expect(element.querySelector('.usa-error-message')).toBeFalsy();
      expect(element.querySelector('.usa-success-message')).toBeFalsy();
    });

    it('should handle very large text content', async () => {
      const largeText = 'A'.repeat(10000);
      element.value = largeText;

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(largeText);
      expect(element.value).toBe(largeText);
    });

    it('should handle special characters in text content', async () => {
      const specialText = '<script>alert("xss")</script>\n\t"quotes"\n&amp;';
      element.value = specialText;

      await waitForPropertyPropagation(element);

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialText);
    });
  });

  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.value = 'test value';
      element.placeholder = 'test placeholder';
      element.disabled = true;
      element.required = true;
      element.readonly = true;
      element.rows = 6;
      element.cols = 80;
      element.maxlength = 100;
      element.minlength = 10;

      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle validation state changes without removal', async () => {
      element.error = 'This field is required';
      await element.updateComplete;

      element.success = 'Good job!';
      await element.updateComplete;

      element.error = '';
      element.success = '';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM presence during rapid property changes', async () => {
      const originalParent = element.parentElement;

      for (let i = 0; i < 5; i++) {
        element.value = `iteration ${i}`;
        element.rows = 4 + i;
        element.disabled = i % 2 === 0;
        element.label = i % 2 === 0 ? `Label ${i}` : '';
        element.hint = i % 3 === 0 ? `Hint ${i}` : '';
        await element.updateComplete;
      }

      expect(element.parentElement).toBe(originalParent);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/textarea/usa-textarea.ts`;
        const validation = validateComponentJavaScript(componentPath, 'textarea');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThanOrEqual(50); // Allow some non-critical issues

        // Textarea is a presentational component, may not require full JavaScript integration
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBeLessThanOrEqual(1); // Allow presentational component
      });
    });
  });

  describe('Storybook Integration Tests (CRITICAL)', () => {
    it('should render in Storybook environment without errors', async () => {
      const storybookContainer = document.createElement('div');
      storybookContainer.id = 'storybook-root';
      document.body.appendChild(storybookContainer);

      const storybookElement = document.createElement('usa-textarea') as USATextarea;
      storybookElement.label = 'Storybook Textarea';
      storybookElement.value = 'Test content';
      storybookElement.hint = 'This is a hint';
      storybookContainer.appendChild(storybookElement);

      await waitForUpdate(storybookElement);

      expect(storybookContainer.contains(storybookElement)).toBe(true);
      expect(storybookElement.isConnected).toBe(true);

      const textarea = storybookElement.querySelector('textarea');
      expect(textarea).toBeTruthy();
      expect(textarea?.value).toBe('Test content');

      storybookContainer.remove();
    });

    it('should handle Storybook control updates without component removal', async () => {
      const mockStorybookUpdate = vi.fn();

      element.addEventListener('input', mockStorybookUpdate);
      element.addEventListener('change', mockStorybookUpdate);

      element.value = 'Updated from controls';
      element.placeholder = 'Updated placeholder';
      element.rows = 8;
      element.cols = 60;
      element.disabled = false;
      element.required = true;

      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.value).toBe('Updated from controls');
      expect(element.rows).toBe(8);
      expect(element.cols).toBe(60);
    });

    it('should maintain event listeners during Storybook interactions', async () => {
      const inputSpy = vi.fn();
      const changeSpy = vi.fn();

      element.addEventListener('input', inputSpy);
      element.addEventListener('change', changeSpy);

      await element.updateComplete;

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;

      textarea.value = 'test input';
      const inputEvent = new Event('input', { bubbles: true });
      Object.defineProperty(inputEvent, 'target', {
        value: textarea,
        writable: false,
        configurable: true,
      });

      (element as any).handleInput(inputEvent);

      textarea.value = 'test change';
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        value: textarea,
        writable: false,
        configurable: true,
      });

      (element as any).handleChange(changeEvent);

      expect(inputSpy).toHaveBeenCalled();
      expect(changeSpy).toHaveBeenCalled();
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  /**
   * USWDS Integration Requirements Tests
   *
   * Form input validation for textarea component.
   */
  describe('USWDS Integration Requirements', () => {
    it('should render placeholder attribute', async () => {
      element.placeholder = 'Enter text';
      await element.updateComplete;

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea?.getAttribute('placeholder')).toBe('Enter text');
    });

    it('should render value property', async () => {
      element.value = 'test content';
      await element.updateComplete;

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea?.value).toBe('test content');
    });

    it('should update value when changed', async () => {
      element.value = 'initial';
      await element.updateComplete;

      element.value = 'updated';
      await element.updateComplete;

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea?.value).toBe('updated');
    });

    it('should display placeholder when no value', async () => {
      element.placeholder = 'Type here';
      element.value = '';
      await element.updateComplete;

      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea?.placeholder).toBe('Type here');
      expect(textarea?.value).toBe('');
    });
  });
});
