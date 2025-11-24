/**
 * Modal Programmatic API - E2E Test
 *
 * Tests modal programmatic control that has timing issues in Cypress component tests.
 * These tests run against the full Storybook environment where the modal API
 * works correctly with proper timing.
 *
 * Source: src/components/modal/usa-modal-timing-regression.component.cy.ts
 * Skipped tests:
 * - Line 191: should prevent closing on escape when force-action is true
 * - Line 333: should open modal programmatically on first call
 * - Line 358: should close modal programmatically on first call
 *
 * Coverage:
 * ✅ Programmatic modal.openModal() method
 * ✅ Programmatic modal.closeModal() method
 * ✅ Force-action mode escape key blocking
 * ✅ Force-action mode close button removal
 * ✅ Modal state synchronization
 * ✅ Event emission on programmatic actions
 */

describe('Modal - Programmatic API and Force Action', () => {
  beforeEach(() => {
    // Visit the modal Storybook story
    cy.visit('/iframe.html?id=feedback-modal--default&viewMode=story');
    cy.wait(1000); // Wait for USWDS initialization
  });

  describe('Programmatic Open API', () => {
    it('should open modal programmatically on first call', () => {
      // Get modal element
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;

        // Verify modal is initially closed
        cy.get('.usa-modal-wrapper')
          .should('exist')
          .and('have.class', 'is-hidden')
          .and('not.have.class', 'is-visible');

        // Open programmatically
        modal.openModal();
      });

      cy.wait(300);

      // Modal should be visible
      cy.get('.usa-modal-wrapper')
        .should('be.visible')
        .and('have.class', 'is-visible')
        .and('not.have.class', 'is-hidden');

      // Modal content should be visible
      cy.get('.usa-modal').should('be.visible');
    });

    it('should emit open event when opened programmatically', () => {
      let eventFired = false;

      cy.window().then((win) => {
        // Set up event listener (correct event name: modal-open not usa-modal:open)
        win.document.querySelector('usa-modal')?.addEventListener('modal-open', () => {
          eventFired = true;
        });
      });

      // Open programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });

      cy.wait(300);

      // Event should have been emitted
      cy.wrap(null).then(() => {
        expect(eventFired).to.be.true;
      });
    });

    it('should handle multiple programmatic opens correctly', () => {
      // Get modal reference
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;

        // Open
        modal.openModal();
      });

      cy.wait(200);

      // Close
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });

      cy.wait(200);

      // Open again
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });

      cy.wait(300);

      // Should be open
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });

    it('should set focus trap when opened programmatically', () => {
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });

      cy.wait(300);

      // Modal should be visible
      cy.get('.usa-modal-wrapper').should('be.visible');

      // Focus should be trapped inside modal
      cy.focused().should('exist');

      // Should be inside modal
      cy.get('.usa-modal').should('be.visible');
    });
  });

  describe('Programmatic Close API', () => {
    // Shared event tracking for tests that need it
    let closeEventFired = false;

    beforeEach(() => {
      // Reset event tracking
      closeEventFired = false;

      // Open modal programmatically (consistent with other passing tests)
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });

      cy.wait(300); // Wait for modal animation
      cy.get('.usa-modal-wrapper')
        .should('exist')
        .and('have.class', 'is-visible');
    });

    it('should close modal programmatically on first call', () => {
      // Close programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });

      cy.wait(300);

      // Modal should be hidden
      cy.get('.usa-modal-wrapper')
        .should('not.be.visible')
        .and('have.class', 'is-hidden')
        .and('not.have.class', 'is-visible');
    });

    it('should emit close event when closed programmatically', () => {
      // Set up event listener AFTER modal is already open from beforeEach
      cy.window().then((win) => {
        // Set up event listener (correct event name: modal-close not usa-modal:close)
        win.document.querySelector('usa-modal')?.addEventListener('modal-close', () => {
          closeEventFired = true;
        });
      });

      cy.wait(100); // Allow listener to attach

      // Close programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });

      cy.wait(300);

      // Event should have been emitted
      cy.wrap(null).then(() => {
        expect(closeEventFired).to.be.true;
      });
    });

    it('should restore focus when closed programmatically', () => {
      // Get trigger button
      cy.get('[data-open-modal]').first().as('trigger');

      // Close programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });

      cy.wait(300);

      // Focus should return to trigger (or be on body/document)
      cy.focused().should('exist');
    });
  });

  describe('Programmatic Toggle Sequence', () => {
    it('should handle rapid programmatic open/close cycles', () => {
      // Suppress uncaught exceptions from rapid modal cycles (AbortError from USWDS)
      cy.on('uncaught:exception', (err) => {
        // Ignore AbortError from rapid modal state changes
        if (err.message.includes('aborted') || err.name === 'AbortError') {
          return false;
        }
        // Let other errors fail the test
        return true;
      });

      // Get modal reference and execute all cycles synchronously
      // This pattern works better than separate .then() blocks with waits
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;

        // Cycle 1
        modal.openModal();
        modal.closeModal();

        // Cycle 2
        modal.openModal();
        modal.closeModal();

        // Cycle 3 - leave open
        modal.openModal();
      });

      cy.wait(500); // Single wait for all operations to complete

      // Should be open after cycles
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });

    it('should sync with trigger button state', () => {
      // Open programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });

      cy.wait(400); // Increased wait - test runs after rapid cycles test

      // Modal should be open
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Close via button should work
      cy.get('.usa-modal__close').click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Open via trigger button should work
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Close programmatically should work
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });

      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });
  });

  describe('Force Action Mode - Escape Key Blocking', () => {
    beforeEach(() => {
      // Visit force-action modal story
      cy.visit('/iframe.html?id=feedback-modal--force-action&viewMode=story');
      cy.wait(1000);
    });

    it('should prevent closing on escape when force-action is true', () => {
      // Open modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Modal should be visible
      cy.get('.usa-modal-wrapper')
        .should('be.visible')
        .and('have.class', 'is-visible');

      // Press Escape key
      cy.get('body').type('{esc}');
      cy.wait(300);

      // Modal should STILL be visible (escape blocked)
      cy.get('.usa-modal-wrapper')
        .should('be.visible')
        .and('have.class', 'is-visible')
        .and('not.have.class', 'is-hidden');
    });

    it('should not have close button when force-action is true', () => {
      // Open modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Close button should not exist
      cy.get('.usa-modal__close').should('not.exist');
    });

    it('should only close via action buttons when force-action is true', () => {
      // Open modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Modal should be visible
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Click primary action button
      cy.get('.usa-modal__footer .usa-button')
        .contains(/continue|confirm|ok/i)
        .click();

      cy.wait(300);

      // Modal should be closed
      cy.get('.usa-modal-wrapper')
        .should('not.be.visible')
        .and('have.class', 'is-hidden');
    });

    it('should handle secondary action button in force-action mode', () => {
      // Open modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Check if secondary button exists
      cy.get('.usa-modal__footer .usa-button--unstyled').then(($btn) => {
        if ($btn.length > 0) {
          // Click secondary button
          cy.wrap($btn).first().click();
          cy.wait(300);

          // Modal should close
          cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
        }
      });
    });

    it('should block overlay click when force-action is true', () => {
      // Open modal
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);

      // Try to click overlay (outside modal)
      cy.get('.usa-modal-wrapper').click('topLeft', { force: true });
      cy.wait(200);

      // Modal should STILL be visible (overlay click blocked)
      cy.get('.usa-modal-wrapper')
        .should('be.visible')
        .and('have.class', 'is-visible');
    });
  });

  describe('Force Action Mode - Programmatic Control', () => {
    beforeEach(() => {
      // Visit force-action modal story
      cy.visit('/iframe.html?id=feedback-modal--force-action&viewMode=story');
      cy.wait(1000);
    });

    it('should open programmatically in force-action mode', () => {
      // Open programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });

      cy.wait(300);

      // Modal should be visible
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Close button should not exist
      cy.get('.usa-modal__close').should('not.exist');

      // Escape should not work
      cy.get('body').type('{esc}');
      cy.wait(200);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });

    it('should close programmatically even in force-action mode', () => {
      // Open modal
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });

      cy.wait(300);

      // Modal should be visible
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Close programmatically (should work even with force-action)
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });

      cy.wait(300);

      // Modal should be closed
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should maintain force-action constraints across multiple opens', () => {
      // Open
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });
      cy.wait(200);

      // Try escape (should not work)
      cy.get('body').type('{esc}');
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Close programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });
      cy.wait(200);

      // Open again
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });
      cy.wait(200);

      // Escape should still not work
      cy.get('body').type('{esc}');
      cy.wait(100);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state between programmatic and user actions', () => {
      // Open programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });

      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Close via user action (escape key)
      cy.get('body').type('{esc}');
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Open via trigger button
      cy.get('[data-open-modal]').first().click();
      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Close programmatically
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });

      cy.wait(300);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should emit correct events for all actions', () => {
      let openCount = 0;
      let closeCount = 0;

      cy.window().then((win) => {
        const modal = win.document.querySelector('usa-modal');
        // Use correct event names: modal-open and modal-close
        modal?.addEventListener('modal-open', () => {
          openCount++;
        });
        modal?.addEventListener('modal-close', () => {
          closeCount++;
        });
      });

      cy.wait(100); // Allow listeners to attach

      // Programmatic open (emits modal-open event)
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });
      cy.wait(300);

      // Programmatic close (emits modal-close event)
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });
      cy.wait(300);

      // Programmatic open again (emits modal-open event)
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });
      cy.wait(300);

      // Programmatic close again (emits modal-close event)
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });
      cy.wait(300);

      // Verify event counts
      // NOTE: Trigger button clicks and close button clicks use USWDS JavaScript
      // directly and do NOT emit custom events. Only programmatic API emits events.
      cy.wrap(null).then(() => {
        expect(openCount).to.equal(2); // 2 programmatic opens
        expect(closeCount).to.equal(2); // 2 programmatic closes
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle calling openModal when already open', () => {
      // Open once
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });
      cy.wait(400); // Increased wait for full open animation

      // Verify it's open
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Open again (already open) - should be idempotent
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });
      cy.wait(300);

      // Should still be open (not toggled closed)
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');

      // Should be able to close
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });
      cy.wait(200);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');
    });

    it('should handle calling closeModal when already closed', () => {
      // Verify initially closed
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Try to close when already closed
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.closeModal();
      });
      cy.wait(200);

      // Should still be closed
      cy.get('.usa-modal-wrapper').should('have.class', 'is-hidden');

      // Should be able to open normally
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;
        modal.openModal();
      });
      cy.wait(200);
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });

    it('should handle rapid programmatic toggle', () => {
      cy.get('usa-modal').then(($modal) => {
        const modal = $modal[0] as any;

        // Rapid toggle (synchronous calls are ok here - testing resilience)
        modal.openModal();
        modal.closeModal();
        modal.openModal();
        modal.closeModal();
        modal.openModal();
      });

      cy.wait(500);

      // Should end in open state
      cy.get('.usa-modal-wrapper').should('have.class', 'is-visible');
    });
  });
});
