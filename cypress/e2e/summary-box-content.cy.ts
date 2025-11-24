/**
 * Summary Box - Content Transitions Tests
 *
 * These tests cover browser-specific summary box behavior that requires:
 * - Real slot change detection and transitions
 * - Memory leak detection with real DOM cleanup
 * - Proper content switching between slots and properties
 *
 * Migrated from: src/components/summary-box/usa-summary-box.test.ts
 * - 2 tests that were skipped due to jsdom slot limitations
 */

// SKIPPED: All tests in this file manipulate Lit component DOM directly
// These tests use appendChild(), removeChild(), and innerHTML on Lit components
// This breaks Lit's rendering system causing: "ChildPart has no parentNode"
// Tests were passing intermittently but are fundamentally incompatible with Lit
// TODO: Rewrite tests to use component properties/methods instead of direct DOM manipulation
describe.skip('Summary Box - Content Transitions', () => {
  beforeEach(() => {
    // Visit the summary box Storybook story
    cy.visit('/iframe.html?id=data-display-summary-box--default&viewMode=story');

    // Wait for USWDS JavaScript to initialize
    cy.wait(1000);

    // Get the component
    cy.get('usa-summary-box').as('summaryBox');
  });

  afterEach(() => {
    // Clean up any dynamically added content
    cy.get('@summaryBox').then($el => {
      const element = $el[0];
      // Remove any slotted content
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    });
  });

  describe('Mixed Slot and Property Content Transitions', () => {
    it('should handle mixed slot and property content transitions', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        // Start with slot content
        const slotParagraph = document.createElement('p');
        slotParagraph.textContent = 'Initial slot content';
        slotParagraph.className = 'test-slot-content';
        element.appendChild(slotParagraph);
      });

      // Wait for slot content to render
      cy.wait(300);

      // Verify slot content is visible
      cy.get('@summaryBox')
        .should('contain.text', 'Initial slot content');

      // Switch to property content
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;
        element.content = '<p class="test-property-content">Switched to property content</p>';
      });

      // Wait for property content to render and DOM to update
      cy.wait(300);

      // Verify property content is now displayed
      cy.get('@summaryBox').within(() => {
        cy.get('.usa-summary-box__text')
          .should('contain.html', 'property content')
          .and('not.contain.html', 'slot content');
      });

      // Switch back to slot content by clearing property
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;
        element.content = '';
      });

      // Wait for slot content to be visible again
      cy.wait(300);

      // Verify slot content is back
      cy.get('@summaryBox')
        .should('contain.text', 'Initial slot content');
    });

    it('should prioritize property content over slot content', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        // Add both slot and property content
        const slotParagraph = document.createElement('p');
        slotParagraph.textContent = 'Slot content';
        element.appendChild(slotParagraph);

        element.content = '<p>Property content</p>';
      });

      // Wait for render
      cy.wait(200);

      // Property content should be displayed, not slot
      cy.get('@summaryBox').within(() => {
        cy.get('.usa-summary-box__text')
          .should('contain.html', 'Property content')
          .and('not.contain.html', 'Slot content');
      });
    });

    it('should handle rapid content switching', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        // Rapid switching between slot and property
        [0, 1, 2, 3, 4].forEach((i) => {
          element.content = `<p>Property ${i}</p>`;
          element.content = '';

          const slot = document.createElement('p');
          slot.textContent = `Slot ${i}`;
          element.appendChild(slot);
        });
      });

      // Wait for final render
      cy.wait(300);

      // Component should still be functional
      cy.get('@summaryBox')
        .should('be.visible')
        .within(() => {
          cy.get('.usa-summary-box__text').should('exist');
        });
    });

    it('should maintain slot content when property is empty', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        // Add slot content
        const slotContent = document.createElement('p');
        slotContent.textContent = 'Persistent slot content';
        slotContent.className = 'persistent-slot';
        element.appendChild(slotContent);

        // Explicitly set property to empty
        element.content = '';
      });

      // Wait for render
      cy.wait(200);

      // Slot content should be visible
      cy.get('@summaryBox')
        .should('contain.text', 'Persistent slot content');
    });

    it('should handle complex HTML in both slots and properties', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        // Start with complex slot content
        const complexSlot = document.createElement('div');
        complexSlot.innerHTML = `
          <p><strong>Slot heading</strong></p>
          <ul>
            <li>Slot item 1</li>
            <li>Slot item 2</li>
          </ul>
        `;
        element.appendChild(complexSlot);
      });

      // Wait longer for complex HTML to render
      cy.wait(300);

      // Verify slot content
      cy.get('@summaryBox')
        .should('contain.text', 'Slot heading')
        .and('contain.text', 'Slot item 1');

      // Switch to complex property content
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;
        element.content = `
          <p><strong>Property heading</strong></p>
          <ul>
            <li>Property item 1</li>
            <li>Property item 2</li>
          </ul>
        `;
      });

      // Wait longer for complex HTML transition
      cy.wait(300);

      // Verify property content
      cy.get('@summaryBox')
        .should('contain.text', 'Property heading')
        .and('contain.text', 'Property item 1')
        .and('not.contain.text', 'Slot heading');
    });

    it('should handle slot change events properly', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        // Add initial content
        const initialSlot = document.createElement('p');
        initialSlot.textContent = 'Initial';
        element.appendChild(initialSlot);
      });

      cy.wait(200);

      // Add more content (trigger slot change)
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;
        const additionalSlot = document.createElement('p');
        additionalSlot.textContent = 'Additional';
        element.appendChild(additionalSlot);
      });

      cy.wait(200);

      // Both should be visible
      cy.get('@summaryBox')
        .should('contain.text', 'Initial')
        .and('contain.text', 'Additional');
    });
  });

  describe('Memory Leak Detection', () => {
    it('should not create memory leaks with content changes', () => {
      // Get initial element count
      cy.get('@summaryBox').then($el => {
        const element = $el[0];
        const initialElements = element.querySelectorAll('*').length;

        // Store initial count
        cy.wrap(initialElements).as('initialCount');
      });

      // Change content multiple times
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
          element.content = `<div>Content ${i} <p>Nested ${i}</p></div>`;
        });
      });

      // Wait for all updates to settle
      cy.wait(600);

      // Final content change
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;
        element.content = '<p>Final content</p>';
      });

      // Wait for final render
      cy.wait(400);

      // Check final element count
      cy.get('@summaryBox').then($el => {
        const element = $el[0];
        const finalElements = element.querySelectorAll('*').length;

        cy.get('@initialCount').then((initialCount: any) => {
          // Should not have accumulated excessive elements
          // Allow some growth for structure, but not 10x
          expect(finalElements).to.be.lessThan(initialCount + 15);
        });
      });
    });

    it('should clean up removed content properly', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        // Add content with unique identifiers
        [0, 1, 2, 3, 4].forEach((i) => {
          element.content = `<p class="content-${i}">Content ${i}</p>`;
        });

        // Final content
        element.content = '<p class="final-content">Final</p>';
      });

      cy.wait(300);

      // Only final content should exist
      cy.get('@summaryBox').within(() => {
        cy.get('.final-content').should('exist');
        cy.get('.content-0').should('not.exist');
        cy.get('.content-1').should('not.exist');
        cy.get('.content-2').should('not.exist');
      });
    });

    it.skip('should not leak DOM nodes with rapid updates', () => {
      // TODO: Refine - Cypress doesn't support for loops with cy commands
      // Need to restructure using recursive approach or Array.from().forEach()
    });

    it('should release event listeners on content removal', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        // Add content with event listeners (simulated via buttons)
        // Set final button content directly since we can't use cy commands in loops
        [0, 1, 2, 3].forEach((i) => {
          element.content = `<button class="btn-${i}">Button ${i}</button>`;
          element.content = `<p>Replacing button ${i}</p>`;
        });

        // Set final button
        element.content = `<button class="btn-4">Button 4</button>`;
      });

      cy.wait(200);

      // Old buttons should not exist
      cy.get('@summaryBox').within(() => {
        cy.get('.btn-0').should('not.exist');
        cy.get('.btn-1').should('not.exist');
        cy.get('.btn-2').should('not.exist');
        cy.get('.btn-3').should('not.exist');
      });

      // Only last button should exist
      cy.get('@summaryBox').within(() => {
        cy.get('.btn-4').should('exist');
      });
    });

    it('should handle slot content cleanup', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0];

        // Add multiple slot elements
        Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
          const slot = document.createElement('p');
          slot.className = `slot-${i}`;
          slot.textContent = `Slot ${i}`;
          element.appendChild(slot);
        });
      });

      cy.wait(200);

      // Verify all slots exist
      cy.get('@summaryBox').then($el => {
        expect($el[0].children.length).to.be.at.least(10);
      });

      // Remove all but one
      cy.get('@summaryBox').then($el => {
        const element = $el[0];
        while (element.children.length > 1) {
          element.removeChild(element.lastChild!);
        }
      });

      cy.wait(200);

      // Should have reduced element count
      cy.get('@summaryBox').then($el => {
        expect($el[0].children.length).to.be.at.most(2);
      });
    });
  });

  describe('Performance and Stability', () => {
    it('should handle 100 rapid content updates without breaking', () => {
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;

        Array.from({ length: 100 }, (_, i) => i).forEach((i) => {
          element.content = `<p>Update ${i}</p>`;
        });
      });

      // Wait for all updates to settle
      cy.wait(1000);

      // Component should still be functional
      cy.get('@summaryBox')
        .should('be.visible')
        .within(() => {
          cy.get('.usa-summary-box__text')
            .should('exist')
            .and('contain.text', 'Update 99');
        });
    });

    it.skip('should maintain structure integrity after many transitions', () => {
      // TODO: Refine - Cypress doesn't support for loops with cy commands
      // Need to restructure using recursive approach or Array.from().forEach()
    });
  });

  describe('Accessibility During Transitions', () => {
    it('should maintain accessibility during content transitions', () => {
      // Initial accessibility check
      cy.injectAxe();
      cy.checkA11y('usa-summary-box');

      // Change content
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;
        element.content = '<p>New content</p>';
      });

      cy.wait(300);

      // Should still pass accessibility
      cy.checkA11y('usa-summary-box');

      // Switch to slot
      cy.get('@summaryBox').then($el => {
        const element = $el[0] as any;
        element.content = '';
        const slot = document.createElement('p');
        slot.textContent = 'Slot content';
        element.appendChild(slot);
      });

      cy.wait(300);

      // Should still pass accessibility
      cy.checkA11y('usa-summary-box');
    });
  });
});
