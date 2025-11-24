describe('Accordion Click Behavior', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6006/iframe.html?id=structure-accordion--default&viewMode=story');
    cy.wait(1000); // Wait for USWDS initialization
  });

  it('should expand and collapse accordion items on click', () => {
    // Get all accordion buttons
    cy.get('.usa-accordion__button').should('have.length.at.least', 1);

    // Click first button to expand
    cy.get('.usa-accordion__button').first().as('firstButton');

    // Verify initial state (should be collapsed)
    cy.get('@firstButton').should('have.attr', 'aria-expanded', 'false');

    // Click to expand
    cy.get('@firstButton').click();
    cy.wait(300); // Wait for animation

    // Verify expanded
    cy.get('@firstButton').should('have.attr', 'aria-expanded', 'true');

    // Content should be visible
    cy.get('@firstButton').invoke('attr', 'aria-controls').then((contentId) => {
      cy.get(`#${contentId}`).should('not.have.attr', 'hidden');
    });

    // Click to collapse
    cy.get('@firstButton').click();
    cy.wait(300); // Wait for animation

    // Verify collapsed
    cy.get('@firstButton').should('have.attr', 'aria-expanded', 'false');

    // Content should be hidden
    cy.get('@firstButton').invoke('attr', 'aria-controls').then((contentId) => {
      cy.get(`#${contentId}`).should('have.attr', 'hidden');
    });

    // Click to expand again (THIS IS THE CRITICAL TEST)
    cy.get('@firstButton').click();
    cy.wait(300);

    // Verify it expanded again (this is where it was failing)
    cy.get('@firstButton').should('have.attr', 'aria-expanded', 'true');
  });

  it('should allow multiple clicks without breaking', () => {
    cy.get('.usa-accordion__button').first().as('button');

    // Perform multiple click cycles
    for (let i = 0; i < 3; i++) {
      // Expand
      cy.get('@button').click();
      cy.wait(200);
      cy.get('@button').should('have.attr', 'aria-expanded', 'true');

      // Collapse
      cy.get('@button').click();
      cy.wait(200);
      cy.get('@button').should('have.attr', 'aria-expanded', 'false');
    }

    // Final expand to verify it still works
    cy.get('@button').click();
    cy.wait(200);
    cy.get('@button').should('have.attr', 'aria-expanded', 'true');
  });

  it('should handle clicks on different accordion items', () => {
    // Click first item
    cy.get('.usa-accordion__button').eq(0).click();
    cy.wait(200);
    cy.get('.usa-accordion__button').eq(0).should('have.attr', 'aria-expanded', 'true');

    // Click second item
    cy.get('.usa-accordion__button').eq(1).click();
    cy.wait(200);
    cy.get('.usa-accordion__button').eq(1).should('have.attr', 'aria-expanded', 'true');

    // First should be closed (single-select mode)
    cy.get('.usa-accordion__button').eq(0).should('have.attr', 'aria-expanded', 'false');

    // Click second again to close
    cy.get('.usa-accordion__button').eq(1).click();
    cy.wait(200);
    cy.get('.usa-accordion__button').eq(1).should('have.attr', 'aria-expanded', 'false');

    // Click second again to re-open (CRITICAL - was failing here)
    cy.get('.usa-accordion__button').eq(1).click();
    cy.wait(200);
    cy.get('.usa-accordion__button').eq(1).should('have.attr', 'aria-expanded', 'true');
  });
});
