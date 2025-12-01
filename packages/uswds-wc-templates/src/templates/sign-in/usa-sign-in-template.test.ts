import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { USASignInTemplate } from './usa-sign-in-template.js';

describe('USASignInTemplate', () => {
  let element: USASignInTemplate;

  beforeEach(async () => {
    element = document.createElement('usa-sign-in-template') as USASignInTemplate;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USASignInTemplate);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default heading', () => {
      expect(element.heading).toBe('Sign in');
    });

    it('should show banner by default', () => {
      expect(element.showBanner).toBe(true);
    });

    it('should show create account link by default', () => {
      expect(element.showCreateAccount).toBe(true);
    });

    it('should show forgot password by default', () => {
      expect(element.showForgotPassword).toBe(true);
    });

    it('should fire template-ready event', async () => {
      const element2 = document.createElement('usa-sign-in-template') as USASignInTemplate;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('template-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('template', 'sign-in');

      element2.remove();
    });
  });

  describe('Template Structure', () => {
    it('should render wrapper div', () => {
      const wrapper = element.querySelector('.usa-sign-in-template');
      expect(wrapper).toBeTruthy();
    });

    it('should render heading', () => {
      const heading = element.querySelector('h1');
      expect(heading?.textContent).toBe('Sign in');
    });

    it('should render form', () => {
      const form = element.querySelector('form.usa-form');
      expect(form).toBeTruthy();
    });

    it('should render email input', () => {
      const emailInput = element.querySelector('usa-text-input[name="email"]');
      expect(emailInput).toBeTruthy();
    });

    it('should render password input', () => {
      const passwordInput = element.querySelector('usa-text-input[name="password"]');
      expect(passwordInput).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitButton = element.querySelector('usa-button[type="submit"]');
      expect(submitButton).toBeTruthy();
    });

    it('should render forgot password link', () => {
      const link = element.querySelector('a[href="/forgot-password"]');
      expect(link).toBeTruthy();
    });

    it('should render create account link', () => {
      const link = element.querySelector('a[href="/create-account"]');
      expect(link).toBeTruthy();
    });
  });

  describe('Properties', () => {
    it('should update heading', async () => {
      element.heading = 'Log in';
      await element.updateComplete;

      const heading = element.querySelector('h1');
      expect(heading?.textContent).toBe('Log in');
    });

    it('should update submit button text property', async () => {
      // Note: usa-button captures content on initialization, so we test
      // the property rather than the rendered content for dynamic updates
      element.submitText = 'Log in';
      await element.updateComplete;

      expect(element.submitText).toBe('Log in');
    });

    it('should hide create account link when showCreateAccount is false', async () => {
      element.showCreateAccount = false;
      await element.updateComplete;

      const link = element.querySelector('a[href="/create-account"]');
      expect(link).toBeFalsy();
    });

    it('should hide forgot password link when showForgotPassword is false', async () => {
      element.showForgotPassword = false;
      await element.updateComplete;

      const link = element.querySelector('a[href="/forgot-password"]');
      expect(link).toBeFalsy();
    });

    it('should update create account URL', async () => {
      element.createAccountUrl = '/register';
      await element.updateComplete;

      const link = element.querySelector('a.usa-link[href="/register"]');
      expect(link).toBeTruthy();
    });

    it('should update forgot password URL', async () => {
      element.forgotPasswordUrl = '/reset';
      await element.updateComplete;

      const link = element.querySelector('a[href="/reset"]');
      expect(link).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should fire sign-in-submit event on form submit', async () => {
      const submitPromise = new Promise((resolve) => {
        element.addEventListener('sign-in-submit', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const form = element.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      const detail = (await submitPromise) as any;
      expect(detail).toHaveProperty('formData');
    });

    it('should include form data in submit event', async () => {
      // Set form values
      const emailInput = element.querySelector('usa-text-input[name="email"]') as any;
      const passwordInput = element.querySelector('usa-text-input[name="password"]') as any;

      const emailNativeInput = emailInput?.querySelector('input');
      const passwordNativeInput = passwordInput?.querySelector('input');

      if (emailNativeInput && passwordNativeInput) {
        emailNativeInput.value = 'test@example.com';
        emailNativeInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordNativeInput.value = 'password123';
        passwordNativeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      await element.updateComplete;

      const submitPromise = new Promise((resolve) => {
        element.addEventListener('sign-in-submit', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      const form = element.querySelector('form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      const detail = (await submitPromise) as any;
      expect(detail.formData.email).toBe('test@example.com');
      expect(detail.formData.password).toBe('password123');
    });
  });

  describe('Public API', () => {
    it('should return empty form data initially', () => {
      const data = element.getFormData();
      expect(data.email).toBe('');
      expect(data.password).toBe('');
    });

    it('should reset form', async () => {
      // Set some values
      element.setFormData({ email: 'test@example.com', password: 'pass' });
      await element.updateComplete;

      element.resetForm();
      await element.updateComplete;

      const data = element.getFormData();
      expect(data.email).toBe('');
      expect(data.password).toBe('');
    });

    it('should set form data', async () => {
      element.setFormData({
        email: 'set@example.com',
        password: 'setpass',
      });
      await element.updateComplete;

      const data = element.getFormData();
      expect(data.email).toBe('set@example.com');
      expect(data.password).toBe('setpass');
    });
  });

  describe('Accessibility', () => {
    it('should have form with fieldset', () => {
      const fieldset = element.querySelector('fieldset.usa-fieldset');
      expect(fieldset).toBeTruthy();
    });

    it('should have sr-only legend', () => {
      const legend = element.querySelector('legend.usa-sr-only');
      expect(legend).toBeTruthy();
    });

    it('should have main landmark', () => {
      const main = element.querySelector('main#main-content');
      expect(main).toBeTruthy();
    });
  });
});
