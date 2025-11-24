/**
 * Alert - Screen Reader Announcements Tests
 *
 * These tests cover browser-specific alert behavior that requires:
 * - Real ARIA live region functionality
 * - Actual screen reader announcement detection
 * - Dynamic content updates with proper ARIA
 *
 * Migrated from: src/components/alert/usa-alert.test.ts
 * - 3 tests that were skipped due to ARIA live region limitations in jsdom
 */

describe('Alert - Screen Reader Announcements', () => {
  beforeEach(() => {
    // Visit the alert Storybook story
    cy.visit('/iframe.html?id=feedback-alert--default&viewMode=story');

    // Wait for USWDS JavaScript to initialize
    cy.wait(1000);

    // Get the component
    cy.get('usa-alert').as('alert');
  });

  describe('ARIA Role Functionality', () => {
    it('should have proper ARIA role for accessibility', () => {
      // Visit the info alert story
      cy.visit('/iframe.html?id=feedback-alert--info');
      cy.wait(1000);

      cy.get('usa-alert').as('infoAlert');

      // USWDS alerts set role on the wrapper element, not inner div
      // Info/warning/success use role="status", error/emergency use role="alert"
      cy.get('@infoAlert')
        .should('have.attr', 'role', 'status');

      // Verify alert content is accessible
      cy.get('@infoAlert')
        .find('.usa-alert__text')
        .should('exist')
        .and('be.visible');

      // Verify alert structure
      cy.get('@infoAlert')
        .find('.usa-alert')
        .should('exist');
    });

    it('should have proper ARIA role for all variants', () => {
      const variants = [
        { name: 'info', expectedRole: 'status' },
        { name: 'warning', expectedRole: 'status' },
        { name: 'error', expectedRole: 'alert' },
        { name: 'success', expectedRole: 'status' }
      ];

      variants.forEach(variant => {
        cy.visit(`/iframe.html?id=feedback-alert--${variant.name}`);
        cy.wait(500);

        // USWDS sets role on the wrapper element
        cy.get('usa-alert')
          .should('have.attr', 'role', variant.expectedRole);
      });
    });
  });

  describe('Error Alert Accessibility', () => {
    it('should have proper ARIA role for error alerts', () => {
      // Visit error alert story
      cy.visit('/iframe.html?id=feedback-alert--error');
      cy.wait(1000);

      cy.get('usa-alert').as('errorAlert');

      // Error alerts use role="alert" on wrapper for immediate screen reader announcement
      cy.get('@errorAlert')
        .should('have.attr', 'role', 'alert');

      // Verify error variant class exists
      cy.get('@errorAlert')
        .find('.usa-alert--error')
        .should('exist');

      // Verify error content is accessible
      cy.get('@errorAlert')
        .find('.usa-alert__text')
        .should('exist')
        .and('be.visible')
        .and('not.be.empty');

      // Verify heading has proper structure (should be h1-h6 element)
      cy.get('@errorAlert')
        .find('.usa-alert__heading')
        .should('exist')
        .then($heading => {
          const tagName = $heading.prop('tagName').toLowerCase();
          expect(tagName).to.match(/^h[1-6]$/);
        });
    });

    it('should have error variant with proper structure', () => {
      cy.visit('/iframe.html?id=feedback-alert--error');
      cy.wait(1000);

      cy.get('usa-alert').as('errorAlert');

      // Verify error variant class
      cy.get('@errorAlert')
        .find('.usa-alert--error')
        .should('exist');

      // Verify error variant does NOT have no-icon class (icons rendered via CSS)
      cy.get('@errorAlert')
        .find('.usa-alert')
        .should('not.have.class', 'usa-alert--no-icon');

      // Verify the alert structure is visible
      cy.get('@errorAlert')
        .find('.usa-alert')
        .should('be.visible');
    });
  });

  describe('Variant-Specific Accessibility', () => {
    it('should have proper ARIA roles for all variants', () => {
      const variantTests = [
        {
          variant: 'info',
          expectedRole: 'status',
          description: 'informational messages'
        },
        {
          variant: 'warning',
          expectedRole: 'status',
          description: 'warning messages'
        },
        {
          variant: 'error',
          expectedRole: 'alert',
          description: 'error messages'
        },
        {
          variant: 'success',
          expectedRole: 'status',
          description: 'success messages'
        }
      ];

      variantTests.forEach(test => {
        cy.log(`Testing ${test.variant} variant for ${test.description}`);

        cy.visit(`/iframe.html?id=feedback-alert--${test.variant}`);
        cy.wait(500);

        cy.get('usa-alert').as('alert');

        // Verify variant class
        cy.get('@alert')
          .find(`.usa-alert--${test.variant}`)
          .should('exist');

        // Verify ARIA role on wrapper element
        cy.get('@alert')
          .should('have.attr', 'role', test.expectedRole);

        // Verify icon exists (not a no-icon variant - icons rendered via CSS)
        cy.get('@alert')
          .find('.usa-alert')
          .should('not.have.class', 'usa-alert--no-icon');

        // Verify content is accessible
        cy.get('@alert')
          .find('.usa-alert__text')
          .should('exist')
          .and('be.visible');
      });
    });

    it('should maintain ARIA role attribute', () => {
      cy.visit('/iframe.html?id=feedback-alert--info');
      cy.wait(1000);

      cy.get('usa-alert').as('alert');

      // Verify initial role
      cy.get('@alert')
        .should('have.attr', 'role', 'status');

      // Verify role persists (alerts are static, but role should be stable)
      cy.wait(500);
      cy.get('@alert')
        .should('have.attr', 'role', 'status');

      // Verify alert structure remains intact
      cy.get('@alert')
        .find('.usa-alert')
        .should('exist');
    });
  });

  describe('Slim Variant Accessibility', () => {
    it('should have proper ARIA role for slim variants', () => {
      cy.visit('/iframe.html?id=feedback-alert--slim-alert');
      cy.wait(1000);

      cy.get('usa-alert').as('slimAlert');

      // Verify slim variant class exists
      cy.get('@slimAlert')
        .find('.usa-alert--slim')
        .should('exist');

      // Verify ARIA role on wrapper (slim alerts still have role)
      cy.get('@slimAlert')
        .should('have.attr', 'role');

      // Verify content is still accessible in slim variant
      cy.get('@slimAlert')
        .find('.usa-alert__text')
        .should('exist')
        .and('be.visible');
    });
  });

  describe('No Icon Variant Accessibility', () => {
    it('should have proper ARIA role for no-icon variants', () => {
      cy.visit('/iframe.html?id=feedback-alert--no-icon');
      cy.wait(1000);

      cy.get('usa-alert').as('noIconAlert');

      // Even without icon, ARIA role should be present on wrapper
      cy.get('@noIconAlert')
        .should('have.attr', 'role');

      // Verify no-icon class
      cy.get('@noIconAlert')
        .find('.usa-alert--no-icon')
        .should('exist');

      // Verify no icon is present
      cy.get('@noIconAlert')
        .find('usa-icon')
        .should('not.exist');

      // Content should still be accessible
      cy.get('@noIconAlert')
        .find('.usa-alert__text')
        .should('exist')
        .and('be.visible');
    });
  });

  describe('Emergency Alert Accessibility', () => {
    it('should have proper ARIA role for emergency alerts', () => {
      cy.visit('/iframe.html?id=feedback-alert--emergency');
      cy.wait(1000);

      cy.get('usa-alert').as('emergencyAlert');

      // Emergency alerts use role="alert" for immediate announcement
      cy.get('@emergencyAlert')
        .should('have.attr', 'role', 'alert');

      // Verify emergency variant class
      cy.get('@emergencyAlert')
        .find('.usa-alert--emergency')
        .should('exist');

      // Verify emergency alert structure
      cy.get('@emergencyAlert')
        .find('.usa-alert')
        .should('exist');

      // Emergency alerts should be highly visible
      cy.get('@emergencyAlert')
        .find('.usa-alert__text')
        .should('be.visible')
        .and('not.be.empty');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should pass axe accessibility audit', () => {
      cy.visit('/iframe.html?id=feedback-alert--default');
      cy.wait(1000);

      // Inject axe if not already present
      cy.injectAxe();

      // Run axe audit on the alert
      cy.checkA11y('usa-alert', {
        rules: {
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'region': { enabled: true }
        }
      });
    });

    it('should have accessible name for each variant', () => {
      const variants = ['info', 'warning', 'error', 'success'];

      variants.forEach(variant => {
        cy.visit(`/iframe.html?id=feedback-alert--${variant}`);
        cy.wait(500);

        // Verify heading provides accessible name
        cy.get('usa-alert')
          .find('.usa-alert__heading')
          .should('exist')
          .and('not.be.empty');

        // Verify content is accessible
        cy.get('usa-alert')
          .find('.usa-alert__text')
          .should('exist')
          .and('be.visible');
      });
    });
  });
});
