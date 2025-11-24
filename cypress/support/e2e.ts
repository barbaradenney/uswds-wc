// cypress/support/e2e.ts
import 'cypress-axe';
import 'cypress-plugin-tab';

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then((win) => {
    const script = win.document.createElement('script');
    script.src = 'https://unpkg.com/axe-core@4.7.0/axe.min.js';
    script.async = false;
    win.document.head.appendChild(script);
  });
});

// Add custom commands for USWDS components
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('checkAccessibility', (options = {}) => {
  cy.checkA11y(undefined, options);
});

// Custom command to visit Storybook stories
Cypress.Commands.add('visitStory', (component: string, story: string) => {
  const storyPath = `${component}--${story}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  cy.visit(`http://localhost:6006/iframe.html?id=${storyPath}`);
  cy.wait(1000); // Wait for story to load
});

/**
 * Wait for Storybook decorator initialization to complete
 *
 * Storybook's decorator uses double requestAnimationFrame before components are ready.
 * This command waits for that timing to complete (~32ms @ 60fps).
 *
 * See: docs/STORYBOOK_CYPRESS_TIMING_ANALYSIS.md for detailed explanation
 */
Cypress.Commands.add('waitForStorybook', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      // Wait for Storybook decorator's double requestAnimationFrame
      win.requestAnimationFrame(() => {
        win.requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  });
});

/**
 * Click a date picker calendar navigation button without triggering focusout
 *
 * USWDS date picker has a focusout handler that closes the calendar when focus
 * leaves the date picker container. This command temporarily suppresses the
 * focusout event during the click to prevent the calendar from closing.
 *
 * USWDS source: node_modules/@uswds/uswds/packages/usa-date-picker/src/index.js:2244-2248
 */
Cypress.Commands.add('clickDatePickerNav', (selector: string) => {
  cy.get('usa-date-picker').then(($picker) => {
    // Temporarily suppress focusout events
    const preventFocusout = (e: FocusEvent) => {
      e.stopImmediatePropagation();
    };

    // Add capturing event listener to intercept focusout
    // Cleanup: removeEventListener called below after click completes
    $picker[0].addEventListener('focusout', preventFocusout, true);

    // Click the navigation button
    cy.get(selector).click().then(() => {
      // Remove the suppression after a short delay to let USWDS process the click
      cy.wait(100).then(() => {
        // Cleanup: Remove the event listener to restore normal focusout behavior
        $picker[0].removeEventListener('focusout', preventFocusout, true);
      });
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      injectAxe(): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      checkAccessibility(options?: any): Chainable<void>;
      visitStory(component: string, story: string): Chainable<void>;
      /**
       * Wait for Storybook decorator initialization to complete
       *
       * Waits for Storybook's double requestAnimationFrame timing (~32ms)
       * to ensure components are fully initialized before testing.
       */
      waitForStorybook(): Chainable<void>;
      /**
       * Click a date picker calendar navigation button without triggering focusout
       *
       * USWDS date picker closes calendar on focusout when focus leaves the container.
       * This command dispatches mouse events without changing focus.
       */
      clickDatePickerNav(selector: string): Chainable<void>;
    }
  }
}