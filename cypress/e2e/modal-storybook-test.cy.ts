/**
 * Modal Storybook Test
 *
 * Tests modal functionality in Storybook environment
 */

describe('Modal - Storybook Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--default&viewMode=story');
    cy.wait(2000); // Wait for component initialization and USWDS behavior setup
  });

  it('should render modal trigger button', () => {
    cy.get('usa-modal').should('exist');
    cy.get('button[data-open-modal]').should('exist').and('be.visible');
    cy.get('button[data-open-modal]').should('contain', 'Open Modal');
  });

  it('should open modal when trigger button is clicked', () => {
    // Modal should not be visible initially
    cy.get('.usa-modal-wrapper.is-visible').should('not.exist');

    // Click the trigger button
    cy.get('button[data-open-modal]').click();

    // Wait for modal animation/transition
    cy.wait(100);

    // Modal wrapper should be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Modal should have correct structure
    cy.get('.usa-modal-wrapper .usa-modal__content').should('exist');
    cy.get('.usa-modal__heading').should('contain', 'Modal Heading');
    cy.get('.usa-modal__close').should('exist');
  });

  it('should close modal when close button is clicked', () => {
    // Open modal
    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Click close button
    cy.get('.usa-modal__close').click();

    // Modal should be hidden
    cy.get('.usa-modal-wrapper.is-visible').should('not.exist');
  });

  it('should close modal when primary action button is clicked', () => {
    // Open modal
    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Click primary action button
    cy.get('.usa-modal__footer button[data-close-modal]').first().click();

    // Modal should be hidden
    cy.get('.usa-modal-wrapper.is-visible').should('not.exist');
  });

  it('should close modal when overlay is clicked', () => {
    // Open modal
    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Click overlay
    cy.get('.usa-modal-overlay').click({ force: true });

    // Modal should be hidden
    cy.get('.usa-modal-wrapper.is-visible').should('not.exist');
  });

  it('should close modal when Escape key is pressed', () => {
    // Open modal
    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Press Escape key
    cy.get('body').type('{esc}');

    // Modal should be hidden
    cy.get('.usa-modal-wrapper.is-visible').should('not.exist');
  });

  it('should trap focus within modal when open', () => {
    // Open modal
    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Wait for modal to fully open and focus to settle
    cy.wait(200);

    // Focus should be on an element within the modal
    cy.focused().should('exist');

    // Find all focusable elements within the modal
    cy.get('.usa-modal-wrapper.is-visible').find('button, a, [tabindex]:not([tabindex="-1"])').then($focusable => {
      // Should have at least 2 focusable elements (close button + action button)
      expect($focusable.length).to.be.at.least(2);

      // Get first and last focusable elements
      const $first = $focusable.first();
      const $last = $focusable.last();

      // Focus the first element
      cy.wrap($first).focus();
      cy.focused().should('have.attr', 'class', $first.attr('class'));

      // Tab to second element
      cy.focused().tab();
      cy.wait(100);

      // Should still be within modal
      cy.focused().then($current => {
        const isInModal = $current.closest('.usa-modal-wrapper').length > 0;
        expect(isInModal).to.be.true;
      });

      // Focus last element
      cy.wrap($last).focus();
      cy.wait(100);

      // Tab from last element - should wrap to first (focus trap)
      cy.focused().tab();
      cy.wait(100);

      // Should wrap back to first element or stay within modal
      cy.focused().then($current => {
        const isInModal = $current.closest('.usa-modal-wrapper').length > 0;
        expect(isInModal).to.be.true;
      });

      // Test Shift+Tab from first element
      cy.wrap($first).focus();
      cy.wait(100);
      cy.focused().tab({ shift: true });
      cy.wait(100);

      // Should wrap to last element or stay within modal
      cy.focused().then($current => {
        const isInModal = $current.closest('.usa-modal-wrapper').length > 0;
        expect(isInModal).to.be.true;
      });
    });
  });
});

describe('Modal - Large Variant', () => {
  it('should render large modal correctly', () => {
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--large-modal&viewMode=story');
    cy.wait(2000);

    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible .usa-modal--lg').should('exist');
  });
});

describe('Modal - Force Action Variant', () => {
  it('should not have close button in force action mode', () => {
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--force-action-modal&viewMode=story');
    cy.wait(2000);

    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible').should('exist');
    cy.get('.usa-modal__close').should('not.exist');
  });

  it('should not close when overlay is clicked in force action mode', () => {
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--force-action-modal&viewMode=story');
    cy.wait(2000);

    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Click overlay
    cy.get('.usa-modal-overlay').click({ force: true });

    // Modal should still be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');
  });

  it('should not close when Escape is pressed in force action mode', () => {
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--force-action-modal&viewMode=story');
    cy.wait(2000);

    cy.get('button[data-open-modal]').click();
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Press Escape key
    cy.get('body').type('{esc}');

    // Modal should still be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');
  });
});

describe('Modal - Slot Content After USWDS Transformation', () => {
  beforeEach(() => {
    // Visit a story that uses slot content (FormExample story)
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--form-example&viewMode=story');
    cy.wait(2000); // Wait for component initialization and USWDS behavior setup
  });

  it('should apply slot="body" content after USWDS moves modal', () => {
    // Open the modal
    cy.get('button[data-open-modal]').click();
    cy.wait(100);

    // Modal should be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // The slotted body content should be present (form elements)
    // This story has a form with input fields in the body slot
    cy.get('.usa-modal-wrapper.is-visible').within(() => {
      cy.get('form').should('exist');
      cy.get('.usa-label').should('exist');
      cy.get('.usa-input').should('exist');
    });

    // The <slot name="body"> element should NOT be present (it should be replaced)
    cy.get('.usa-modal-wrapper slot[name="body"]').should('not.exist');
  });

  it('should apply slot="footer" content after USWDS moves modal', () => {
    // Visit story with custom footer slot (MultiStepActions story)
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--multi-step-actions&viewMode=story');
    cy.wait(2000);

    // Open the modal
    cy.get('button[data-open-modal]').click();
    cy.wait(100);

    // Modal should be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Custom footer content should be present
    cy.get('.usa-modal-wrapper.is-visible').within(() => {
      cy.get('.usa-modal__footer').should('exist');
      // The story has custom button group in footer
      cy.get('.usa-button-group').should('exist');
    });

    // The <slot name="footer"> element should NOT be present
    cy.get('.usa-modal-wrapper slot[name="footer"]').should('not.exist');
  });

  it('should apply slot="heading" content after USWDS moves modal', () => {
    // Visit story with custom heading slot (BrandedAnnouncement story)
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--branded-announcement&viewMode=story');
    cy.wait(2000);

    // Open the modal
    cy.get('button[data-open-modal]').click();
    cy.wait(100);

    // Modal should be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Custom heading content should be present (heading with badge)
    cy.get('.usa-modal-wrapper.is-visible').within(() => {
      cy.get('.usa-modal__heading').should('exist');
      // The story has a badge in the heading
      cy.get('.usa-tag').should('exist');
    });

    // The <slot name="heading"> element should NOT be present
    cy.get('.usa-modal-wrapper slot[name="heading"]').should('not.exist');
  });

  it('should apply slot="description" content after USWDS moves modal', () => {
    // Visit story with custom description slot (BrandedAnnouncement story has both)
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--branded-announcement&viewMode=story');
    cy.wait(2000);

    // Open the modal
    cy.get('button[data-open-modal]').click();
    cy.wait(100);

    // Modal should be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Description content should be present with rich formatting
    cy.get('.usa-modal-wrapper.is-visible').within(() => {
      // The BrandedAnnouncement story has custom description with formatted text
      cy.get('.usa-modal__main').within(() => {
        cy.get('p').should('have.length.greaterThan', 1);
        cy.contains('major improvements').should('exist');
      });
    });

    // The <slot name="description"> element should NOT be present
    cy.get('.usa-modal-wrapper slot[name="description"]').should('not.exist');
  });

  it('should handle multiple slots together', () => {
    // Visit a story that uses multiple slots (BrandedAnnouncement has heading, description, and body)
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--branded-announcement&viewMode=story');
    cy.wait(2000);

    // Open the modal
    cy.get('button[data-open-modal]').click();
    cy.wait(100);

    // Modal should be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Check that all slot content is properly applied and rendered
    cy.get('.usa-modal-wrapper.is-visible').within(() => {
      // Custom heading with badge should exist
      cy.get('.usa-modal__heading').should('exist');
      cy.get('.usa-tag').should('exist');

      // Body content with list should exist
      cy.get('.usa-list').should('exist');

      // Footer should exist
      cy.get('.usa-modal__footer').should('exist');
    });

    // Verify slot content is actually visible (content has been applied)
    cy.get('.usa-modal-wrapper.is-visible .usa-tag').should('be.visible');
    cy.get('.usa-modal-wrapper.is-visible .usa-list').should('be.visible');
  });

  it('should maintain functionality after slot content application', () => {
    // Visit story with custom footer buttons (MultiStepActions story)
    cy.visit('http://localhost:6006/iframe.html?id=feedback-modal--multi-step-actions&viewMode=story');
    cy.wait(2000);

    // Open the modal
    cy.get('button[data-open-modal]').click();
    cy.wait(100);

    // Modal should be visible
    cy.get('.usa-modal-wrapper.is-visible').should('exist');

    // Click a button in the custom footer
    cy.get('.usa-modal__footer button[data-close-modal]').first().click();

    // Modal should close properly
    cy.get('.usa-modal-wrapper.is-visible').should('not.exist');
  });
});
