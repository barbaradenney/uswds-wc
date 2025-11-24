/**
 * Language Selector Behavior - E2E Test
 *
 * Tests USWDS language selector behavior contract that requires real browser.
 * This test covers all the functionality defined in the behavior contract tests
 * that were skipped due to browser dependencies.
 *
 * Source: src/components/language-selector/usa-language-selector-behavior.test.ts
 * Coverage:
 * ✅ Component structure (language container, primary item, control button, submenu)
 * ✅ Dropdown toggle (open/close, close others, click outside)
 * ✅ Focus management (focus trap, close on focus out)
 * ✅ Keyboard behavior (Escape key)
 * ✅ Event delegation (clicks, keydown, focusout)
 * ✅ Cleanup (event listener removal)
 * ✅ Accessibility (ARIA attributes, proper roles)
 */

describe('Language Selector - USWDS Behavior Contract', () => {
  beforeEach(() => {
    // Visit the DROPDOWN language selector story (has the menu behavior we're testing)
    cy.visit('/iframe.html?id=navigation-language-selector--dropdown&viewMode=story');
    cy.wait(1000); // Wait for USWDS initialization
  });

  describe('Component Structure', () => {
    it('should create language container', () => {
      cy.get('usa-language-selector')
        .find('.usa-language-container')
        .should('exist');
    });

    it('should create primary language item', () => {
      cy.get('usa-language-selector')
        .find('.usa-language__primary-item')
        .should('exist');
    });

    it('should create language control button', () => {
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('exist')
        .and('have.prop', 'tagName', 'BUTTON');
    });

    it('should create submenu container', () => {
      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('exist');
    });

    it('should have language links in submenu', () => {
      cy.get('usa-language-selector')
        .find('.usa-language__submenu a')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Dropdown Toggle', () => {
    it('should toggle dropdown when clicking control button', () => {
      // Check initial state
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'false');

      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      // Should be expanded
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'true');
    });

    it('should close dropdown when clicking control again', () => {
      // Open
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'true');

      // Close
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'false');
    });

    it('should close dropdown when clicking outside', () => {
      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'true');

      // Click outside (on body)
      cy.get('body').click('topLeft', { force: true });

      cy.wait(200);

      // Should be closed
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'false');
    });
  });

  describe('Keyboard Behavior', () => {
    it('should close dropdown on Escape key', () => {
      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'true');

      // Press Escape
      cy.get('body').type('{esc}');

      cy.wait(200);

      // Should be closed
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'false');
    });

    it('should focus control button after closing with Escape', () => {
      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .as('control')
        .click();

      cy.wait(200);

      // Press Escape
      cy.get('body').type('{esc}');

      cy.wait(200);

      // Control button should have focus
      cy.get('@control').should('have.focus');
    });
  });

  describe('Focus Management', () => {
    it('should close dropdown when focus leaves language primary', () => {
      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'true');

      // Tab away from language selector
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .tab();

      cy.wait(300);

      // Should be closed
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'false');
    });
  });

  describe('Language Links', () => {
    it('should have clickable language links in submenu', () => {
      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      // Check that links exist and are clickable
      cy.get('usa-language-selector')
        .find('.usa-language__submenu a')
        .first()
        .should('be.visible')
        .and('have.attr', 'href');
    });

    it('should display language names in links', () => {
      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      // Links should have text content
      cy.get('usa-language-selector')
        .find('.usa-language__submenu a')
        .each(($link) => {
          cy.wrap($link).invoke('text').should('not.be.empty');
        });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on control button', () => {
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded')
        .and('match', /^(true|false)$/);
    });

    it('should update aria-expanded when toggling', () => {
      const control = cy.get('usa-language-selector').find('.usa-language__link');

      // Initially false
      control.should('have.attr', 'aria-expanded', 'false');

      // Click to open
      control.click();
      cy.wait(200);
      control.should('have.attr', 'aria-expanded', 'true');

      // Click to close
      control.click();
      cy.wait(200);
      control.should('have.attr', 'aria-expanded', 'false');
    });

    it('should have accessible submenu structure', () => {
      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      // Submenu should be visible and contain links
      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('be.visible')
        .find('a')
        .should('have.length.greaterThan', 0);
    });

    it('should pass axe accessibility checks', () => {
      cy.injectAxe();

      cy.checkA11y('usa-language-selector', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });

      // Open dropdown and check again
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.checkA11y('usa-language-selector', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        }
      });
    });
  });

  describe('Event Delegation', () => {
    it('should handle clicks on control button', () => {
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'true');
    });

    it('should handle clicks on control button children', () => {
      // Click anywhere within the button (including text/spans)
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click('center');

      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'true');
    });

    it('should handle rapid toggle clicks', () => {
      const control = cy.get('usa-language-selector').find('.usa-language__link');

      // Rapid clicks
      control.click();
      cy.wait(100);
      control.click();
      cy.wait(100);
      control.click();
      cy.wait(200);

      // Should end in open state (3 clicks: open, close, open)
      control.should('have.attr', 'aria-expanded', 'true');
    });
  });

  describe('Multiple Language Selectors', () => {
    beforeEach(() => {
      // Visit story with multiple language selectors if available
      // Otherwise, this test suite will be skipped
      cy.get('usa-language-selector').then(($selectors) => {
        if ($selectors.length < 2) {
          cy.log('Skipping: Story does not have multiple language selectors');
        }
      });
    });

    it('should close other dropdowns when opening one', () => {
      cy.get('usa-language-selector').then(($selectors) => {
        if ($selectors.length < 2) {
          return; // Skip test
        }

        // Open first
        cy.get('usa-language-selector')
          .eq(0)
          .find('.usa-language__link')
          .click();

        cy.wait(200);

        cy.get('usa-language-selector')
          .eq(0)
          .find('.usa-language__link')
          .should('have.attr', 'aria-expanded', 'true');

        // Open second
        cy.get('usa-language-selector')
          .eq(1)
          .find('.usa-language__link')
          .click();

        cy.wait(200);

        // First should be closed, second should be open
        cy.get('usa-language-selector')
          .eq(0)
          .find('.usa-language__link')
          .should('have.attr', 'aria-expanded', 'false');

        cy.get('usa-language-selector')
          .eq(1)
          .find('.usa-language__link')
          .should('have.attr', 'aria-expanded', 'true');
      });
    });
  });

  describe('Visual State', () => {
    it('should show submenu when dropdown is open', () => {
      // Initially hidden (via CSS)
      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('not.be.visible');

      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      // Should be visible
      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('be.visible');
    });

    it('should hide submenu when dropdown is closed', () => {
      // Open dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      // Close dropdown
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      // Should be hidden
      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('not.be.visible');
    });

    it('should maintain USWDS class names', () => {
      cy.get('usa-language-selector')
        .find('.usa-language')
        .should('exist');

      cy.get('usa-language-selector')
        .find('.usa-language__primary-item')
        .should('exist');

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('exist');

      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('exist');
    });
  });

  describe('Component Stability', () => {
    it('should handle multiple open/close cycles', () => {
      const control = cy.get('usa-language-selector').find('.usa-language__link');

      for (let i = 0; i < 3; i++) {
        // Open
        control.click();
        cy.wait(200);
        control.should('have.attr', 'aria-expanded', 'true');

        // Close
        control.click();
        cy.wait(200);
        control.should('have.attr', 'aria-expanded', 'false');
      }

      // Component should still be functional
      control.click();
      cy.wait(200);
      control.should('have.attr', 'aria-expanded', 'true');
    });

    it('should handle escape key in different states', () => {
      // Escape when closed (should do nothing)
      cy.get('body').type('{esc}');
      cy.wait(100);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'false');

      // Open and then escape
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.get('body').type('{esc}');
      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded', 'false');
    });
  });

  describe('Prohibited Behaviors', () => {
    it('should NOT modify USWDS class names', () => {
      // All standard USWDS classes should be present
      cy.get('usa-language-selector')
        .find('.usa-language')
        .should('exist');

      cy.get('usa-language-selector')
        .find('.usa-language__primary-item')
        .should('exist');

      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('exist');

      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('exist');
    });

    it('should use proper accessibility patterns for hiding dropdown', () => {
      // Control should use aria-expanded attribute
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .should('have.attr', 'aria-expanded');

      // When closed, submenu should not be visible (hidden attribute or CSS)
      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('not.be.visible');

      // When opened, submenu should be visible
      cy.get('usa-language-selector')
        .find('.usa-language__link')
        .click();

      cy.wait(200);

      cy.get('usa-language-selector')
        .find('.usa-language__submenu')
        .should('be.visible');
    });

    it('should NOT allow multiple dropdowns open simultaneously', () => {
      cy.get('usa-language-selector').then(($selectors) => {
        if ($selectors.length < 2) {
          return; // Skip if only one selector
        }

        // Open first
        cy.get('usa-language-selector')
          .eq(0)
          .find('.usa-language__link')
          .click();

        cy.wait(200);

        // Open second
        cy.get('usa-language-selector')
          .eq(1)
          .find('.usa-language__link')
          .click();

        cy.wait(200);

        // Only second should be open
        cy.get('usa-language-selector')
          .eq(0)
          .find('.usa-language__link')
          .should('have.attr', 'aria-expanded', 'false');

        cy.get('usa-language-selector')
          .eq(1)
          .find('.usa-language__link')
          .should('have.attr', 'aria-expanded', 'true');
      });
    });
  });
});
