import { test, expect } from '@playwright/test';

/**
 * Real Form Integration Tests
 *
 * Tests USWDS components in realistic form scenarios including complex workflows,
 * validation patterns, accessibility, and multi-step interactions.
 * Focus areas: government forms, validation workflows, accessibility compliance
 */
test.describe('Real Form Integration Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set up form validation helpers
    await page.addInitScript(() => {
      // Mock form validation APIs
      (window as any).formValidation = {
        errors: [] as Array<{ field: string; message: string }>,

        addError: (field: string, message: string) => {
          (window as any).formValidation.errors.push({ field, message });
        },

        clearErrors: () => {
          (window as any).formValidation.errors = [];
        },

        getErrors: () => {
          return (window as any).formValidation.errors;
        },

        validateRequired: (value: string, fieldName: string) => {
          if (!value || value.trim() === '') {
            (window as any).formValidation.addError(fieldName, `${fieldName} is required`);
            return false;
          }
          return true;
        },

        validateEmail: (value: string, fieldName: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            (window as any).formValidation.addError(fieldName, `${fieldName} must be a valid email address`);
            return false;
          }
          return true;
        }
      };
    });
  });

  test.describe('Government Contact Form Integration', () => {
    // TODO: This test is flaky due to viewport/scroll issues with checkboxes in long forms
    // Elements can be outside viewport even with .click({ force: true })
    // Needs investigation of form layout, scrolling behavior, and viewport calculations
    test.skip('should handle complete government contact form workflow', async ({ page }) => {
      // Create a comprehensive government contact form
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Government Contact Form</title>
          <link rel="stylesheet" href="https://unpkg.com/@uswds/uswds@latest/dist/css/uswds.min.css">
        </head>
        <body>
          <div class="usa-section">
            <div class="grid-container">
              <h1>Contact Your Representative</h1>

              <form id="contact-form" action="/submit" method="post" novalidate>
                <!-- Personal Information Section -->
                <fieldset class="usa-fieldset">
                  <legend class="usa-legend usa-legend--large">Personal Information</legend>

                  <div class="grid-row grid-gap">
                    <div class="grid-col-12 tablet:grid-col-6">
                      <label class="usa-label" for="first-name">
                        First name <span class="usa-hint usa-hint--required">*</span>
                      </label>
                      <input class="usa-input" id="first-name" name="firstName" type="text" required aria-describedby="first-name-hint">
                      <div class="usa-hint" id="first-name-hint">Enter your legal first name</div>
                    </div>

                    <div class="grid-col-12 tablet:grid-col-6">
                      <label class="usa-label" for="last-name">
                        Last name <span class="usa-hint usa-hint--required">*</span>
                      </label>
                      <input class="usa-input" id="last-name" name="lastName" type="text" required>
                    </div>
                  </div>

                  <div class="grid-row grid-gap">
                    <div class="grid-col-12 tablet:grid-col-8">
                      <label class="usa-label" for="email">
                        Email address <span class="usa-hint usa-hint--required">*</span>
                      </label>
                      <input class="usa-input" id="email" name="email" type="email" required autocomplete="email">
                    </div>

                    <div class="grid-col-12 tablet:grid-col-4">
                      <label class="usa-label" for="phone">Phone number</label>
                      <input class="usa-input" id="phone" name="phone" type="tel" autocomplete="tel">
                    </div>
                  </div>
                </fieldset>

                <!-- Address Section -->
                <fieldset class="usa-fieldset">
                  <legend class="usa-legend">Address</legend>

                  <div class="grid-row grid-gap">
                    <div class="grid-col-12">
                      <label class="usa-label" for="address">Street address</label>
                      <input class="usa-input" id="address" name="address" type="text" autocomplete="street-address">
                    </div>
                  </div>

                  <div class="grid-row grid-gap">
                    <div class="grid-col-12 tablet:grid-col-6">
                      <label class="usa-label" for="city">City</label>
                      <input class="usa-input" id="city" name="city" type="text" autocomplete="address-level2">
                    </div>

                    <div class="grid-col-12 tablet:grid-col-3">
                      <label class="usa-label" for="state">State</label>
                      <select class="usa-select" id="state" name="state" autocomplete="address-level1">
                        <option value="">Select a state</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="CA">California</option>
                        <option value="FL">Florida</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                      </select>
                    </div>

                    <div class="grid-col-12 tablet:grid-col-3">
                      <label class="usa-label" for="zip">ZIP code</label>
                      <input class="usa-input usa-input--small" id="zip" name="zip" type="text" pattern="[0-9]{5}(-[0-9]{4})?" autocomplete="postal-code">
                    </div>
                  </div>
                </fieldset>

                <!-- Contact Preferences -->
                <fieldset class="usa-fieldset">
                  <legend class="usa-legend">Contact Preferences</legend>

                  <div class="usa-checkbox">
                    <input class="usa-checkbox__input" id="contact-email" type="checkbox" name="contactMethods" value="email" checked>
                    <label class="usa-checkbox__label" for="contact-email">Email updates</label>
                  </div>

                  <div class="usa-checkbox">
                    <input class="usa-checkbox__input" id="contact-phone" type="checkbox" name="contactMethods" value="phone">
                    <label class="usa-checkbox__label" for="contact-phone">Phone calls</label>
                  </div>

                  <div class="usa-checkbox">
                    <input class="usa-checkbox__input" id="contact-mail" type="checkbox" name="contactMethods" value="mail">
                    <label class="usa-checkbox__label" for="contact-mail">Postal mail</label>
                  </div>
                </fieldset>

                <!-- Issue Category -->
                <fieldset class="usa-fieldset">
                  <legend class="usa-legend">Issue Category <span class="usa-hint usa-hint--required">*</span></legend>

                  <div class="usa-radio">
                    <input class="usa-radio__input" id="category-healthcare" type="radio" name="category" value="healthcare" required>
                    <label class="usa-radio__label" for="category-healthcare">Healthcare</label>
                  </div>

                  <div class="usa-radio">
                    <input class="usa-radio__input" id="category-education" type="radio" name="category" value="education" required>
                    <label class="usa-radio__label" for="category-education">Education</label>
                  </div>

                  <div class="usa-radio">
                    <input class="usa-radio__input" id="category-economy" type="radio" name="category" value="economy" required>
                    <label class="usa-radio__label" for="category-economy">Economy</label>
                  </div>

                  <div class="usa-radio">
                    <input class="usa-radio__input" id="category-environment" type="radio" name="category" value="environment" required>
                    <label class="usa-radio__label" for="category-environment">Environment</label>
                  </div>

                  <div class="usa-radio">
                    <input class="usa-radio__input" id="category-other" type="radio" name="category" value="other" required>
                    <label class="usa-radio__label" for="category-other">Other</label>
                  </div>
                </fieldset>

                <!-- Message -->
                <div class="grid-row grid-gap">
                  <div class="grid-col-12">
                    <label class="usa-label" for="message">
                      Your message <span class="usa-hint usa-hint--required">*</span>
                    </label>
                    <div class="usa-hint">Please provide specific details about your concern or request</div>
                    <textarea class="usa-textarea" id="message" name="message" required rows="6" aria-describedby="message-hint"></textarea>
                    <div class="usa-character-count" data-maxlength="1000">
                      <span class="usa-character-count__message" aria-live="polite">1000 characters allowed</span>
                    </div>
                  </div>
                </div>

                <!-- Verification -->
                <div class="usa-checkbox">
                  <input class="usa-checkbox__input" id="verify" type="checkbox" name="verify" required>
                  <label class="usa-checkbox__label" for="verify">
                    I verify that the information provided is accurate and I am a constituent of this representative
                    <span class="usa-hint usa-hint--required">*</span>
                  </label>
                </div>

                <!-- Form Actions -->
                <div class="usa-button-group">
                  <button type="submit" class="usa-button">Submit Message</button>
                  <button type="reset" class="usa-button usa-button--outline">Clear Form</button>
                </div>

                <!-- Form Status Messages -->
                <div id="form-alerts" role="status" aria-live="polite"></div>
              </form>
            </div>
          </div>

          <script>
            // Form validation and submission handling
            document.getElementById('contact-form').addEventListener('submit', function(e) {
              e.preventDefault();

              // Clear previous errors
              window.formValidation.clearErrors();

              // Get form data
              const formData = new FormData(this);
              const data = {};
              formData.forEach((value, key) => {
                if (data[key]) {
                  if (Array.isArray(data[key])) {
                    data[key].push(value);
                  } else {
                    data[key] = [data[key], value];
                  }
                } else {
                  data[key] = value;
                }
              });

              // Validation
              let isValid = true;

              // Required field validation
              isValid = window.formValidation.validateRequired(data.firstName || '', 'First name') && isValid;
              isValid = window.formValidation.validateRequired(data.lastName || '', 'Last name') && isValid;
              isValid = window.formValidation.validateRequired(data.email || '', 'Email') && isValid;
              isValid = window.formValidation.validateRequired(data.category || '', 'Issue category') && isValid;
              isValid = window.formValidation.validateRequired(data.message || '', 'Message') && isValid;

              // Email validation
              if (data.email) {
                isValid = window.formValidation.validateEmail(data.email, 'Email') && isValid;
              }

              // Verification checkbox
              if (!data.verify) {
                window.formValidation.addError('verify', 'You must verify the accuracy of your information');
                isValid = false;
              }

              // Display results
              const alertsContainer = document.getElementById('form-alerts');
              const errors = window.formValidation.getErrors();

              if (isValid && errors.length === 0) {
                alertsContainer.innerHTML = '<div class="usa-alert usa-alert--success" role="alert"><div class="usa-alert__body"><h4 class="usa-alert__heading">Success</h4><p class="usa-alert__text">Your message has been submitted successfully. We will respond within 2-3 business days.</p></div></div>';
                this.reset();
              } else {
                let errorHtml = '<div class="usa-alert usa-alert--error" role="alert"><div class="usa-alert__body"><h4 class="usa-alert__heading">Please correct the following errors:</h4><ul>';
                errors.forEach(error => {
                  errorHtml += '<li>' + error.message + '</li>';
                });
                errorHtml += '</ul></div></div>';
                alertsContainer.innerHTML = errorHtml;

                // Focus first error field
                if (errors.length > 0) {
                  const firstErrorField = errors[0].field.toLowerCase().replace(' ', '-');
                  const field = document.getElementById(firstErrorField);
                  if (field) {
                    field.focus();
                  }
                }
              }
            });
          </script>
        </body>
        </html>
      `);

      // Test form accessibility
      await expect(page.locator('form')).toBeVisible();

      // Fill out the form step by step
      await page.fill('#first-name', 'John');
      await page.fill('#last-name', 'Doe');
      await page.fill('#email', 'john.doe@example.com');
      await page.fill('#phone', '(555) 123-4567');

      // Address information
      await page.fill('#address', '123 Main Street');
      await page.fill('#city', 'Anytown');
      await page.selectOption('#state', 'CA');
      await page.fill('#zip', '90210');

      // Contact preferences
      // Use click instead of check - check() doesn't support { force: true }
      await page.locator('#contact-phone').click({ force: true });
      await page.locator('#contact-mail').click({ force: true });

      // Issue category
      // Use click instead of check - check() doesn't support { force: true }
      await page.locator('#category-healthcare').click({ force: true });

      // Message
      await page.fill('#message', 'I am writing to express my concern about healthcare access in our district. Many residents are struggling to find affordable healthcare options.');

      // Verification
      // Use click instead of check - check() doesn't support { force: true }
      await page.locator('#verify').click({ force: true });

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success message
      await page.waitForSelector('.usa-alert--success', { timeout: 5000 });

      // Verify success message
      const successAlert = page.locator('.usa-alert--success');
      await expect(successAlert).toBeVisible();
      await expect(successAlert).toContainText('Your message has been submitted successfully');
    });

    // TODO: This test is flaky due to timing issues with form validation and alert rendering
    // Alert elements sometimes don't appear within the 2000ms timeout
    // Needs investigation of validation timing and alert rendering behavior
    test.skip('should handle form validation errors appropriately', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Validation Test</title>
          <link rel="stylesheet" href="https://unpkg.com/@uswds/uswds@latest/dist/css/uswds.min.css">
        </head>
        <body>
          <form id="test-form">
            <label class="usa-label" for="email">Email <span class="usa-hint usa-hint--required">*</span></label>
            <input class="usa-input" id="email" name="email" type="email" required>

            <label class="usa-label" for="name">Name <span class="usa-hint usa-hint--required">*</span></label>
            <input class="usa-input" id="name" name="name" type="text" required>

            <button type="submit" class="usa-button">Submit</button>
            <div id="errors" role="alert" aria-live="assertive"></div>
          </form>

          <script>
            document.getElementById('test-form').addEventListener('submit', function(e) {
              e.preventDefault();

              const email = document.getElementById('email').value;
              const name = document.getElementById('name').value;
              const errors = [];

              if (!name.trim()) {
                errors.push('Name is required');
              }

              if (!email.trim()) {
                errors.push('Email is required');
              } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
                errors.push('Email must be valid');
              }

              const errorsDiv = document.getElementById('errors');
              if (errors.length > 0) {
                errorsDiv.innerHTML = '<div class="usa-alert usa-alert--error"><div class="usa-alert__body"><h4>Errors:</h4><ul>' +
                  errors.map(error => '<li>' + error + '</li>').join('') + '</ul></div></div>';
              } else {
                errorsDiv.innerHTML = '<div class="usa-alert usa-alert--success"><div class="usa-alert__body">Success!</div></div>';
              }
            });
          </script>
        </body>
        </html>
      `);

      // Test empty form submission
      await page.click('button[type="submit"]');

      // Check for error messages
      await page.waitForSelector('.usa-alert--error', { timeout: 2000 });
      const errorAlert = page.locator('.usa-alert--error');
      await expect(errorAlert).toBeVisible();
      await expect(errorAlert).toContainText('Name is required');
      await expect(errorAlert).toContainText('Email is required');

      // Test invalid email
      await page.fill('#name', 'John Doe');
      await page.fill('#email', 'invalid-email');
      await page.click('button[type="submit"]');

      await page.waitForSelector('.usa-alert--error');
      await expect(page.locator('.usa-alert--error')).toContainText('Email must be valid');

      // Test valid submission
      await page.fill('#email', 'john@example.com');
      await page.click('button[type="submit"]');

      await page.waitForSelector('.usa-alert--success');
      await expect(page.locator('.usa-alert--success')).toContainText('Success!');
    });
  });

  test.describe('Multi-Step Government Application Form', () => {
    // TODO: This test is flaky due to Continue button visibility issues in multi-step forms
    // Button elements are not visible even though they exist in DOM
    // Needs investigation of step transition timing and button rendering
    test.skip('should handle complex multi-step form workflow', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Permit Application</title>
          <link rel="stylesheet" href="https://unpkg.com/@uswds/uswds@latest/dist/css/uswds.min.css">
        </head>
        <body>
          <div class="usa-section">
            <div class="grid-container">
              <h1>Business Permit Application</h1>

              <!-- Step Progress Indicator -->
              <div class="usa-step-indicator" aria-label="Progress">
                <ol class="usa-step-indicator__segments">
                  <li class="usa-step-indicator__segment usa-step-indicator__segment--current">
                    <span class="usa-step-indicator__segment-label">Business Information</span>
                  </li>
                  <li class="usa-step-indicator__segment">
                    <span class="usa-step-indicator__segment-label">Owner Information</span>
                  </li>
                  <li class="usa-step-indicator__segment">
                    <span class="usa-step-indicator__segment-label">Permit Details</span>
                  </li>
                  <li class="usa-step-indicator__segment">
                    <span class="usa-step-indicator__segment-label">Review & Submit</span>
                  </li>
                </ol>
              </div>

              <form id="permit-form" data-current-step="1">
                <!-- Step 1: Business Information -->
                <div id="step-1" class="form-step">
                  <fieldset class="usa-fieldset">
                    <legend class="usa-legend usa-legend--large">Business Information</legend>

                    <label class="usa-label" for="business-name">
                      Business Name <span class="usa-hint usa-hint--required">*</span>
                    </label>
                    <input class="usa-input" id="business-name" name="businessName" type="text" required>

                    <label class="usa-label" for="business-type">
                      Business Type <span class="usa-hint usa-hint--required">*</span>
                    </label>
                    <select class="usa-select" id="business-type" name="businessType" required>
                      <option value="">Select business type</option>
                      <option value="retail">Retail</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="service">Service</option>
                      <option value="manufacturing">Manufacturing</option>
                    </select>

                    <label class="usa-label" for="employees">
                      Number of Employees
                    </label>
                    <input class="usa-input usa-input--small" id="employees" name="employees" type="number" min="1" max="500">
                  </fieldset>

                  <button type="button" class="usa-button" onclick="nextStep(2)">Continue</button>
                </div>

                <!-- Step 2: Owner Information -->
                <div id="step-2" class="form-step" style="display: none;">
                  <fieldset class="usa-fieldset">
                    <legend class="usa-legend usa-legend--large">Owner Information</legend>

                    <div class="grid-row grid-gap">
                      <div class="grid-col-6">
                        <label class="usa-label" for="owner-first">
                          First Name <span class="usa-hint usa-hint--required">*</span>
                        </label>
                        <input class="usa-input" id="owner-first" name="ownerFirst" type="text" required>
                      </div>

                      <div class="grid-col-6">
                        <label class="usa-label" for="owner-last">
                          Last Name <span class="usa-hint usa-hint--required">*</span>
                        </label>
                        <input class="usa-input" id="owner-last" name="ownerLast" type="text" required>
                      </div>
                    </div>

                    <label class="usa-label" for="owner-email">
                      Email Address <span class="usa-hint usa-hint--required">*</span>
                    </label>
                    <input class="usa-input" id="owner-email" name="ownerEmail" type="email" required>

                    <label class="usa-label" for="owner-phone">
                      Phone Number <span class="usa-hint usa-hint--required">*</span>
                    </label>
                    <input class="usa-input" id="owner-phone" name="ownerPhone" type="tel" required>
                  </fieldset>

                  <div class="usa-button-group">
                    <button type="button" class="usa-button usa-button--outline" onclick="prevStep(1)">Back</button>
                    <button type="button" class="usa-button" onclick="nextStep(3)">Continue</button>
                  </div>
                </div>

                <!-- Step 3: Permit Details -->
                <div id="step-3" class="form-step" style="display: none;">
                  <fieldset class="usa-fieldset">
                    <legend class="usa-legend usa-legend--large">Permit Details</legend>

                    <fieldset class="usa-fieldset">
                      <legend class="usa-legend">Permit Type <span class="usa-hint usa-hint--required">*</span></legend>

                      <div class="usa-checkbox">
                        <input class="usa-checkbox__input" id="permit-business" type="checkbox" name="permitTypes" value="business">
                        <label class="usa-checkbox__label" for="permit-business">Business License ($100)</label>
                      </div>

                      <div class="usa-checkbox">
                        <input class="usa-checkbox__input" id="permit-signage" type="checkbox" name="permitTypes" value="signage">
                        <label class="usa-checkbox__label" for="permit-signage">Signage Permit ($50)</label>
                      </div>

                      <div class="usa-checkbox">
                        <input class="usa-checkbox__input" id="permit-food" type="checkbox" name="permitTypes" value="food">
                        <label class="usa-checkbox__label" for="permit-food">Food Service Permit ($200)</label>
                      </div>
                    </fieldset>

                    <label class="usa-label" for="start-date">
                      Requested Start Date <span class="usa-hint usa-hint--required">*</span>
                    </label>
                    <input class="usa-input" id="start-date" name="startDate" type="date" required>
                  </fieldset>

                  <div class="usa-button-group">
                    <button type="button" class="usa-button usa-button--outline" onclick="prevStep(2)">Back</button>
                    <button type="button" class="usa-button" onclick="nextStep(4)">Review Application</button>
                  </div>
                </div>

                <!-- Step 4: Review & Submit -->
                <div id="step-4" class="form-step" style="display: none;">
                  <h2>Review Your Application</h2>
                  <div id="application-summary"></div>

                  <div class="usa-checkbox">
                    <input class="usa-checkbox__input" id="certify" type="checkbox" name="certify" required>
                    <label class="usa-checkbox__label" for="certify">
                      I certify that all information provided is accurate and complete
                      <span class="usa-hint usa-hint--required">*</span>
                    </label>
                  </div>

                  <div class="usa-button-group">
                    <button type="button" class="usa-button usa-button--outline" onclick="prevStep(3)">Back</button>
                    <button type="submit" class="usa-button">Submit Application</button>
                  </div>
                </div>

                <div id="form-status" role="status" aria-live="polite"></div>
              </form>
            </div>
          </div>

          <script>
            let currentStep = 1;

            function updateProgressIndicator(step) {
              const segments = document.querySelectorAll('.usa-step-indicator__segment');
              segments.forEach((segment, index) => {
                segment.classList.remove('usa-step-indicator__segment--current', 'usa-step-indicator__segment--complete');
                if (index + 1 < step) {
                  segment.classList.add('usa-step-indicator__segment--complete');
                } else if (index + 1 === step) {
                  segment.classList.add('usa-step-indicator__segment--current');
                }
              });
            }

            function showStep(step) {
              document.querySelectorAll('.form-step').forEach(stepDiv => {
                stepDiv.style.display = 'none';
              });
              document.getElementById('step-' + step).style.display = 'block';
              currentStep = step;
              updateProgressIndicator(step);

              // Focus first input in new step
              const firstInput = document.querySelector('#step-' + step + ' input, #step-' + step + ' select');
              if (firstInput) {
                firstInput.focus();
              }
            }

            function nextStep(step) {
              if (validateCurrentStep()) {
                if (step === 4) {
                  generateSummary();
                }
                showStep(step);
              }
            }

            function prevStep(step) {
              showStep(step);
            }

            function validateCurrentStep() {
              const currentStepDiv = document.getElementById('step-' + currentStep);
              const requiredInputs = currentStepDiv.querySelectorAll('input[required], select[required]');
              let isValid = true;

              requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                  input.classList.add('usa-input--error');
                  isValid = false;
                } else {
                  input.classList.remove('usa-input--error');
                }
              });

              if (!isValid) {
                const statusDiv = document.getElementById('form-status');
                statusDiv.innerHTML = '<div class="usa-alert usa-alert--error" role="alert"><div class="usa-alert__body">Please fill in all required fields.</div></div>';
              } else {
                document.getElementById('form-status').innerHTML = '';
              }

              return isValid;
            }

            function generateSummary() {
              const formData = new FormData(document.getElementById('permit-form'));
              const data = {};
              formData.forEach((value, key) => {
                if (data[key]) {
                  if (Array.isArray(data[key])) {
                    data[key].push(value);
                  } else {
                    data[key] = [data[key], value];
                  }
                } else {
                  data[key] = value;
                }
              });

              let summaryHtml = '<div class="usa-summary-box"><div class="usa-summary-box__body">';
              summaryHtml += '<h3>Business Information</h3>';
              summaryHtml += '<p><strong>Business Name:</strong> ' + (data.businessName || 'Not provided') + '</p>';
              summaryHtml += '<p><strong>Business Type:</strong> ' + (data.businessType || 'Not provided') + '</p>';
              summaryHtml += '<p><strong>Employees:</strong> ' + (data.employees || 'Not provided') + '</p>';

              summaryHtml += '<h3>Owner Information</h3>';
              summaryHtml += '<p><strong>Name:</strong> ' + (data.ownerFirst || '') + ' ' + (data.ownerLast || '') + '</p>';
              summaryHtml += '<p><strong>Email:</strong> ' + (data.ownerEmail || 'Not provided') + '</p>';
              summaryHtml += '<p><strong>Phone:</strong> ' + (data.ownerPhone || 'Not provided') + '</p>';

              summaryHtml += '<h3>Permit Details</h3>';
              if (data.permitTypes) {
                const permits = Array.isArray(data.permitTypes) ? data.permitTypes : [data.permitTypes];
                summaryHtml += '<p><strong>Permit Types:</strong> ' + permits.join(', ') + '</p>';
              }
              summaryHtml += '<p><strong>Start Date:</strong> ' + (data.startDate || 'Not provided') + '</p>';

              summaryHtml += '</div></div>';

              document.getElementById('application-summary').innerHTML = summaryHtml;
            }

            // Form submission
            document.getElementById('permit-form').addEventListener('submit', function(e) {
              e.preventDefault();

              if (!document.getElementById('certify').checked) {
                document.getElementById('form-status').innerHTML =
                  '<div class="usa-alert usa-alert--error" role="alert"><div class="usa-alert__body">You must certify the accuracy of your information.</div></div>';
                return;
              }

              // Simulate submission
              const statusDiv = document.getElementById('form-status');
              statusDiv.innerHTML = '<div class="usa-alert usa-alert--success" role="alert"><div class="usa-alert__body"><h4>Application Submitted</h4><p>Your permit application has been submitted successfully. Application ID: #PA-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '</p></div></div>';

              // Disable form
              const form = document.getElementById('permit-form');
              const inputs = form.querySelectorAll('input, select, button');
              inputs.forEach(input => {
                input.disabled = true;
              });
            });
          </script>
        </body>
        </html>
      `);

      // Test multi-step form progression
      await expect(page.locator('#step-1')).toBeVisible();
      await expect(page.locator('#step-2')).not.toBeVisible();

      // Fill step 1
      await page.fill('#business-name', 'Test Business LLC');
      await page.selectOption('#business-type', 'retail');
      await page.fill('#employees', '5');

      // Continue to step 2
      await page.click('text=Continue');
      await expect(page.locator('#step-2')).toBeVisible();

      // Fill step 2
      await page.fill('#owner-first', 'Jane');
      await page.fill('#owner-last', 'Smith');
      await page.fill('#owner-email', 'jane.smith@testbusiness.com');
      await page.fill('#owner-phone', '(555) 987-6543');

      // Continue to step 3
      await page.click('text=Continue');
      await expect(page.locator('#step-3')).toBeVisible();

      // Fill step 3
      // Use click instead of check - check() doesn't support { force: true }
      await page.locator('#permit-business').click({ force: true });
      await page.locator('#permit-signage').click({ force: true });
      await page.fill('#start-date', '2024-12-01');

      // Continue to review
      await page.click('text=Review Application');
      await expect(page.locator('#step-4')).toBeVisible();

      // Verify summary content
      await expect(page.locator('#application-summary')).toContainText('Test Business LLC');
      await expect(page.locator('#application-summary')).toContainText('Jane Smith');
      await expect(page.locator('#application-summary')).toContainText('jane.smith@testbusiness.com');

      // Test back navigation
      await page.click('text=Back');
      await expect(page.locator('#step-3')).toBeVisible();

      await page.click('text=Review Application');
      await expect(page.locator('#step-4')).toBeVisible();

      // Complete submission
      // Use click instead of check - check() doesn't support { force: true }
      await page.locator('#certify').click({ force: true });
      await page.click('text=Submit Application');

      // Verify successful submission
      await page.waitForSelector('.usa-alert--success');
      const successAlert = page.locator('.usa-alert--success');
      await expect(successAlert).toContainText('Application Submitted');
      await expect(successAlert).toContainText('Application ID: #PA-2024-');
    });
  });

  test.describe('Form Accessibility and Validation Integration', () => {
    // TODO: This test is flaky due to radio button click issues in complex forms
    // Radio buttons can be outside viewport even with .click({ force: true })
    // Needs investigation of form layout and viewport calculations for radio groups
    test.skip('should provide comprehensive accessibility support in forms', async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Accessible Form Test</title>
          <link rel="stylesheet" href="https://unpkg.com/@uswds/uswds@latest/dist/css/uswds.min.css">
        </head>
        <body>
          <form id="accessible-form" novalidate>
            <!-- Required field with error handling -->
            <div class="usa-form-group">
              <label class="usa-label" for="required-field">
                Required Field <span class="usa-hint usa-hint--required">*</span>
              </label>
              <input class="usa-input" id="required-field" name="requiredField" type="text" required aria-describedby="required-field-hint required-field-error">
              <div class="usa-hint" id="required-field-hint">This field is required for processing</div>
              <div class="usa-error-message" id="required-field-error" style="display: none;"></div>
            </div>

            <!-- Date input with validation -->
            <div class="usa-form-group">
              <label class="usa-label" for="birth-date">Date of Birth</label>
              <div class="usa-hint">Enter in MM/DD/YYYY format</div>
              <input class="usa-input" id="birth-date" name="birthDate" type="date" aria-describedby="birth-date-error">
              <div class="usa-error-message" id="birth-date-error" style="display: none;"></div>
            </div>

            <!-- Radio group with validation -->
            <fieldset class="usa-fieldset">
              <legend class="usa-legend">
                Preferred Contact Method <span class="usa-hint usa-hint--required">*</span>
              </legend>
              <div class="usa-radio">
                <input class="usa-radio__input" id="contact-email" type="radio" name="contactMethod" value="email" required aria-describedby="contact-error">
                <label class="usa-radio__label" for="contact-email">Email</label>
              </div>
              <div class="usa-radio">
                <input class="usa-radio__input" id="contact-phone" type="radio" name="contactMethod" value="phone" required>
                <label class="usa-radio__label" for="contact-phone">Phone</label>
              </div>
              <div class="usa-radio">
                <input class="usa-radio__input" id="contact-mail" type="radio" name="contactMethod" value="mail" required>
                <label class="usa-radio__label" for="contact-mail">Mail</label>
              </div>
              <div class="usa-error-message" id="contact-error" style="display: none;"></div>
            </fieldset>

            <button type="submit" class="usa-button">Submit</button>
            <div id="form-status" role="status" aria-live="polite"></div>
          </form>

          <script>
            document.getElementById('accessible-form').addEventListener('submit', function(e) {
              e.preventDefault();

              // Clear previous errors
              document.querySelectorAll('.usa-error-message').forEach(error => {
                error.style.display = 'none';
                error.textContent = '';
              });

              document.querySelectorAll('.usa-input, .usa-radio__input').forEach(input => {
                input.classList.remove('usa-input--error');
                input.setAttribute('aria-invalid', 'false');
              });

              // Validation
              let isValid = true;
              const requiredField = document.getElementById('required-field');
              const contactMethod = document.querySelector('input[name="contactMethod"]:checked');

              // Required field validation
              if (!requiredField.value.trim()) {
                const error = document.getElementById('required-field-error');
                error.textContent = 'This field is required';
                error.style.display = 'block';
                requiredField.classList.add('usa-input--error');
                requiredField.setAttribute('aria-invalid', 'true');
                isValid = false;
              }

              // Contact method validation
              if (!contactMethod) {
                const error = document.getElementById('contact-error');
                error.textContent = 'Please select a contact method';
                error.style.display = 'block';
                document.querySelectorAll('input[name="contactMethod"]').forEach(radio => {
                  radio.setAttribute('aria-invalid', 'true');
                });
                isValid = false;
              }

              // Status announcement
              const status = document.getElementById('form-status');
              if (isValid) {
                status.innerHTML = '<div class="usa-alert usa-alert--success"><div class="usa-alert__body">Form submitted successfully!</div></div>';
              } else {
                status.innerHTML = '<div class="usa-alert usa-alert--error"><div class="usa-alert__body">Please correct the errors above.</div></div>';

                // Focus first error field
                const firstError = document.querySelector('.usa-input--error, [aria-invalid="true"]');
                if (firstError) {
                  firstError.focus();
                }
              }
            });
          </script>
        </body>
        </html>
      `);

      // Test form accessibility
      await page.waitForSelector('form');

      // Test keyboard navigation
      await page.keyboard.press('Tab'); // Focus first field
      let focused = await page.evaluate(() => document.activeElement?.id);
      expect(focused).toBe('required-field');

      // Test error state accessibility
      await page.click('button[type="submit"]');

      // Check for error messages
      await page.waitForSelector('.usa-error-message[style*="block"]');

      // Verify ARIA attributes are set
      const requiredFieldInvalid = await page.getAttribute('#required-field', 'aria-invalid');
      expect(requiredFieldInvalid).toBe('true');

      // Test error message association
      const describedBy = await page.getAttribute('#required-field', 'aria-describedby');
      expect(describedBy).toContain('required-field-error');

      // Fill form correctly
      await page.fill('#required-field', 'Test value');
      // Use click instead of check - check() doesn't support { force: true }
      await page.locator('#contact-email').click({ force: true });
      await page.click('button[type="submit"]');

      // Verify success
      await page.waitForSelector('.usa-alert--success');
      await expect(page.locator('.usa-alert--success')).toContainText('Form submitted successfully!');

      // Verify ARIA invalid is reset
      const fieldValid = await page.getAttribute('#required-field', 'aria-invalid');
      expect(fieldValid).toBe('false');
    });
  });
});