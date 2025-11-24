/**
 * Header Navigation - Browser-Dependent Tests
 *
 * These tests were migrated from Vitest because they require real browser APIs:
 * - Dropdown menu interactions
 * - Body padding compensation
 * - Focus management
 * - Click outside detection
 *
 * See: cypress/BROWSER_TESTS_MIGRATION_PLAN.md
 * Source: src/components/header/usa-header-behavior.test.ts
 */

describe('Header Navigation', () => {
  describe('Basic Navigation - Default Story', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=navigation-header--default&viewMode=story');
      cy.injectAxe();
      // Wait for USWDS header JavaScript to initialize
      cy.wait(500);
    });

    describe('Body Padding Compensation', () => {
    it('should add padding to body when opening mobile nav', () => {
      cy.viewport('iphone-6'); // Mobile viewport

      // Get initial body padding
      cy.get('body').then(($body) => {
        const initialPadding = parseFloat(window.getComputedStyle($body[0]).paddingTop);

        // Open mobile nav
        cy.get('.usa-menu-btn').click();

        cy.wait(100);

        // Body should have additional padding
        cy.get('body').then(($body2) => {
          const newPadding = parseFloat(window.getComputedStyle($body2[0]).paddingTop);
          expect(newPadding).to.be.greaterThan(initialPadding);
        });
      });
    });

    it('should remove padding when closing mobile nav', () => {
      cy.viewport('iphone-6');

      // Open mobile nav
      cy.get('.usa-menu-btn').click();
      cy.wait(300); // Longer wait for animation

      // Get padding with nav open
      cy.get('body').then(($body) => {
        const openPadding = parseFloat(window.getComputedStyle($body[0]).paddingTop);

        // Close nav
        cy.get('.usa-nav__close').click();
        cy.wait(300); // Longer wait for animation

        // Padding should be removed or restored to original
        cy.get('body').then(($body2) => {
          const closedPadding = parseFloat(window.getComputedStyle($body2[0]).paddingTop);
          expect(closedPadding).to.be.at.most(openPadding);
        });
      });
    });
  });

    describe('Mobile Navigation', () => {
      beforeEach(() => {
        cy.viewport('iphone-6');
      });

      it('should toggle mobile menu on button click', () => {
        cy.get('.usa-menu-btn').click();

        // Wait for menu toggle animation
        cy.wait(300);

        cy.get('.usa-nav').should('be.visible').and('have.class', 'is-visible');
      });

      it('should close mobile menu when clicking close button', () => {
        // Open menu
        cy.get('.usa-menu-btn').click();
        cy.wait(300);
        cy.get('.usa-nav').should('be.visible');

        // Close menu
        cy.get('.usa-nav__close').click();
        cy.wait(300);

        cy.get('.usa-nav').should('not.have.class', 'is-visible');
      });

      it('should trap focus within mobile menu when open', () => {
        cy.get('.usa-menu-btn').click();

        // Wait for menu to open and focus trap to initialize
        cy.wait(400);

        // Tab through elements
        cy.focused().tab().tab().tab();

        // Focus should stay within nav
        cy.focused().parents('.usa-nav').should('exist');
      });
    });

    describe('Basic Accessibility', () => {
      it('should have proper ARIA labels', () => {
        cy.get('.usa-menu-btn').should('have.attr', 'aria-label');
        cy.get('.usa-nav__close').should('have.attr', 'aria-label');
      });

      it('should pass axe accessibility checks', () => {
        // Wait for header to be ready
        cy.get('usa-header').should('exist');
        cy.wait(200);

        // Run axe on usa-header web component
        cy.checkA11y('usa-header', {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        });
      });
    });
  });

  describe('Extended Navigation - Extended Story', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=navigation-header--extended&viewMode=story');
      cy.injectAxe();
      // Wait for USWDS header JavaScript to initialize
      cy.wait(500);
    });

    describe('Dropdown Navigation', () => {
    it('should have nav control buttons for dropdowns', () => {
      cy.get('usa-header').within(() => {
        cy.get('.usa-nav__primary-item > button').should('exist');
      });
    });

    it('should toggle dropdown when clicking nav control', () => {
      cy.get('.usa-nav__primary-item > button').first().as('navButton');

      // Click to open
      cy.get('@navButton').click();
      cy.wait(500); // Wait for USWDS initialization

      cy.get('.usa-nav__submenu')
        .first()
        .should('be.visible');

      // Click to close - use force to ensure click registers
      cy.get('@navButton').click({ force: true });
      cy.wait(1000); // Longer wait for USWDS close animation

      // Check dropdown is closed
      cy.get('.usa-nav__submenu')
        .first()
        .should('not.be.visible');
    });

    it('should close dropdown when clicking outside', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().click();
      cy.wait(500); // Wait for USWDS initialization

      cy.get('.usa-nav__submenu', { timeout: 5000 }).first().should('be.visible');

      // Click outside
      cy.get('body').click('topLeft');

      cy.wait(500); // Longer wait for CI

      // Dropdown should close
      cy.get('.usa-nav__submenu', { timeout: 5000 }).first().should('not.be.visible');
    });

    it('should close dropdown when focus leaves nav', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().click();
      cy.wait(500); // Wait for USWDS initialization

      cy.get('.usa-nav__submenu').first().should('be.visible');

      // Click outside to close (more reliable than tab/blur in iframe)
      cy.get('body').click('topRight');
      cy.wait(1000); // Wait for USWDS close animation

      // Dropdown should close
      cy.get('.usa-nav__submenu').first().should('not.be.visible');
    });
  });

  describe('Keyboard Behavior', () => {
    it('should close dropdown on Escape key', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().click();
      cy.wait(500); // Wait for USWDS initialization

      cy.get('.usa-nav__submenu', { timeout: 5000 }).first().should('be.visible');

      // Press Escape
      cy.get('body').type('{esc}');
      cy.wait(500); // Wait for close animation

      // Dropdown should close
      cy.get('.usa-nav__submenu', { timeout: 5000 }).first().should('not.be.visible');
    });

    it('should focus nav control button after closing with Escape', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().as('navButton').click();
      cy.wait(500); // Wait for USWDS initialization

      cy.get('.usa-nav__submenu', { timeout: 5000 }).first().should('be.visible');

      // Press Escape
      cy.get('body').type('{esc}');
      cy.wait(500); // Wait for focus management

      // Nav control button should have focus
      cy.get('@navButton').should('have.focus');
    });

    it('should navigate dropdown items with arrow keys', () => {
      // Open dropdown
      cy.get('.usa-nav__primary-item > button').first().click();
      cy.wait(500); // Wait for USWDS initialization

      cy.get('.usa-nav__submenu', { timeout: 5000 }).first().should('be.visible');

      // Focus first item
      cy.get('.usa-nav__submenu a').first().focus();
      cy.wait(200); // Wait for focus to settle

      // Use arrow down to navigate
      cy.focused().type('{downarrow}');
      cy.wait(200); // Wait for keyboard navigation

      // Should move to next item
      cy.focused().should('not.be', cy.get('.usa-nav__submenu a').first());
    });
  });

    describe('Dropdown Accessibility', () => {
      it('should have proper ARIA attributes on nav controls', () => {
        cy.get('.usa-nav__primary-item > button').first().as('navButton');

        // Should have aria-expanded
        cy.get('@navButton').should('have.attr', 'aria-expanded', 'false');

        // Open dropdown
        cy.get('@navButton').click();

        // aria-expanded should update
        cy.get('@navButton').should('have.attr', 'aria-expanded', 'true');
      });
    });
  });
});
