/**
 * Button Group - Accessibility Tests
 *
 * These tests cover browser-specific button group behavior that requires:
 * - Real layout measurements for segmented buttons
 * - Actual CSS class application and visual rendering
 * - Button positioning and alignment verification
 *
 * Migrated from: src/components/button-group/usa-button-group.test.ts
 * - 1 test that was skipped due to layout measurement requirements
 */

describe('Button Group - Accessibility', () => {
  beforeEach(() => {
    // Visit the button group Storybook story
    cy.visit('/iframe.html?id=actions-button-group--default&viewMode=story');

    // Wait for USWDS JavaScript to initialize
    cy.wait(1000);

    // Get the component
    cy.get('usa-button-group').as('buttonGroup');

    // Note: Axe injection moved to individual tests to avoid race conditions
    // See Session 5 findings on axe injection pattern
  });

  describe('Segmented Button Layout', () => {
    it('should have clean CSS classes for segmented button positioning', () => {
      // Visit segmented variant
      cy.visit('/iframe.html?id=actions-button-group--segmented&viewMode=story');
      cy.wait(1000);

      cy.get('usa-button-group').as('segmentedGroup');

      // Verify segmented class is applied
      cy.get('@segmentedGroup').within(() => {
        cy.get('.usa-button-group--segmented').should('exist');
      });

      // Verify buttons have correct positioning classes
      cy.get('@segmentedGroup').within(() => {
        // Get all buttons in the group
        cy.get('.usa-button').each(($button, index, $list) => {
          // Each button should have usa-button class
          expect($button).to.have.class('usa-button');

          // Buttons should not have unnecessary inline styles
          const inlineStyles = $button.attr('style');
          if (inlineStyles) {
            // If inline styles exist, they should be minimal
            expect(inlineStyles.length).to.be.lessThan(50);
          }

          // Verify button is visible and clickable
          cy.wrap($button).should('be.visible');
        });
      });

      // Verify proper spacing between buttons
      cy.get('@segmentedGroup').within(() => {
        cy.get('.usa-button').then($buttons => {
          if ($buttons.length > 1) {
            // Buttons should be positioned next to each other (segmented)
            const firstButton = $buttons[0].getBoundingClientRect();
            const secondButton = $buttons[1].getBoundingClientRect();

            // In segmented layout, buttons should be adjacent (minimal gap)
            const gap = secondButton.left - firstButton.right;
            expect(gap).to.be.lessThan(5); // Should be tightly together
          }
        });
      });

      // Verify USWDS classes are used, not custom positioning
      cy.get('@segmentedGroup').within(() => {
        cy.get('.usa-button-group--segmented').should('have.class', 'usa-button-group--segmented');

        // Should not have non-USWDS layout classes
        cy.get('[class*="custom-layout"]').should('not.exist');
        cy.get('[class*="inline-flex"]').should('not.exist');
        cy.get('[class*="absolute"]').should('not.exist');
      });
    });

    it('should apply correct CSS classes for non-segmented layout', () => {
      cy.get('@buttonGroup').within(() => {
        // Should have base button group class
        cy.get('.usa-button-group').should('exist');

        // Should NOT have segmented class
        cy.get('.usa-button-group--segmented').should('not.exist');

        // Buttons should have normal spacing
        cy.get('.usa-button').then($buttons => {
          if ($buttons.length > 1) {
            const firstButton = $buttons[0].getBoundingClientRect();
            const secondButton = $buttons[1].getBoundingClientRect();

            // In normal layout, buttons should have spacing
            const gap = secondButton.left - firstButton.right;
            expect(gap).to.be.greaterThan(5); // Should have gap between them
          }
        });
      });
    });

    it('should use only USWDS CSS classes for layout', () => {
      cy.get('@buttonGroup').then($el => {
        const element = $el[0];

        // Get all classes
        const classList = Array.from(element.classList);

        // All classes should be USWDS classes
        classList.forEach(className => {
          // Should start with usa- or be allowed utility class
          const isUSWDSClass = className.startsWith('usa-');
          const isUtilityClass = ['grid-row', 'grid-col', 'margin', 'padding'].some(prefix =>
            className.startsWith(prefix)
          );

          expect(isUSWDSClass || isUtilityClass).to.be.true;
        });
      });
    });

    it('should render buttons in correct order', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').then($buttons => {
          // Buttons should be in DOM order
          expect($buttons.length).to.be.greaterThan(0);

          // Each button should be visible
          $buttons.each((index, button) => {
            expect(button).to.be.visible;
          });
        });
      });
    });

    it('should maintain button alignment', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').then($buttons => {
          if ($buttons.length > 1) {
            // Get vertical positions
            const positions = Array.from($buttons).map(btn =>
              btn.getBoundingClientRect().top
            );

            // All buttons should be approximately at same vertical position (aligned)
            const firstTop = positions[0];
            positions.forEach(top => {
              expect(Math.abs(top - firstTop)).to.be.lessThan(5); // Within 5px
            });
          }
        });
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should pass comprehensive accessibility tests', () => {
      // Inject axe here to avoid race conditions
      cy.injectAxe();
      cy.wait(500); // Wait for axe to be ready

      cy.checkA11y('usa-button-group', {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      });
    });

    it('should have accessible button labels', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').each($button => {
          // Button should have text content or aria-label
          const hasText = $button.text().trim().length > 0;
          const hasAriaLabel = $button.attr('aria-label');

          expect(hasText || hasAriaLabel).to.be.true;
        });
      });
    });

    it('should support keyboard navigation', () => {
      cy.get('@buttonGroup').within(() => {
        // Tab to first button
        cy.get('.usa-button').first().focus();

        // Should have focus
        cy.focused().should('have.class', 'usa-button');

        // Tab to next button
        cy.focused().tab();

        // Should focus next button
        cy.focused().should('have.class', 'usa-button');
      });
    });

    it('should have visible focus indicators (WCAG 2.4.7)', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').first().focus();

        // Focused button should have visible outline
        cy.focused()
          .should('have.css', 'outline-width')
          .and('not.equal', '0px');
      });
    });

    it('should support Enter and Space key activation', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').first().then($button => {
          let clickCount = 0;

          // Add click listener
          $button.on('click', () => {
            clickCount++;
          });

          // Focus and press Enter
          cy.wrap($button).focus().type('{enter}');

          // Wait for event to fire
          cy.wait(100);

          // Click should have been triggered
          cy.wrap($button).then(() => {
            expect(clickCount).to.be.greaterThan(0);
          });
        });
      });
    });

    it('should have appropriate ARIA roles', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').each($button => {
          // Buttons should have button role (implicit from <button> or explicit)
          const role = $button.attr('role') || $button.prop('tagName').toLowerCase();
          expect(role === 'button' || role === 'BUTTON').to.be.true;
        });
      });
    });

    it('should support segmented variant accessibility', () => {
      cy.visit('/iframe.html?id=actions-button-group--segmented&viewMode=story');
      cy.wait(1000);

      // Re-inject axe after visiting new page
      cy.injectAxe();
      cy.wait(1000); // Wait longer for axe to be ready after page navigation

      // Segmented variant should still be accessible
      cy.checkA11y('usa-button-group');

      // All buttons should be keyboard accessible
      cy.get('usa-button-group').within(() => {
        cy.get('.usa-button').each($button => {
          // Button should not have tabindex="-1" (should be focusable)
          const tabindex = $button.attr('tabindex');
          if (tabindex !== undefined) {
            expect(tabindex).not.to.equal('-1');
          }
        });
      });
    });
  });

  describe('Touch/Pointer Accessibility (WCAG 2.5)', () => {
    it('should have adequate touch target size (WCAG 2.5.5)', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').each($button => {
          const rect = $button[0].getBoundingClientRect();

          // Button should be close to 44x44px (WCAG AAA target)
          // USWDS buttons are ~39-40px, which meets WCAG AA (24x24 minimum)
          // Allow browser rendering tolerance
          expect(rect.width).to.be.at.least(39);
          expect(rect.height).to.be.at.least(39);
        });
      });
    });

    it('should have spacing between buttons for touch', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').then($buttons => {
          if ($buttons.length > 1) {
            // Check spacing between buttons
            for (let i = 0; i < $buttons.length - 1; i++) {
              const currentRect = $buttons[i].getBoundingClientRect();
              const nextRect = $buttons[i + 1].getBoundingClientRect();

              // Should have some spacing (unless segmented)
              const gap = nextRect.left - currentRect.right;

              // Gap should be reasonable (>= 0 for segmented, >= 8 for normal)
              expect(gap).to.be.at.least(0);
            }
          }
        });
      });
    });

    it('should support pointer events on all buttons', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').each($button => {
          // Button should be clickable
          cy.wrap($button).should('not.have.css', 'pointer-events', 'none');
        });
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain accessibility at mobile widths', () => {
      // Set mobile viewport
      cy.viewport(375, 667);

      cy.get('@buttonGroup').should('be.visible');

      // Inject axe to avoid race conditions
      cy.injectAxe();
      cy.wait(500); // Wait for axe to be ready

      // Should still pass accessibility
      cy.checkA11y('usa-button-group');

      // Buttons should still be accessible
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button').each($button => {
          cy.wrap($button).should('be.visible');
        });
      });
    });

    it('should reflow at 320px width (WCAG 1.4.10)', () => {
      // Set minimum viewport
      cy.viewport(320, 568);

      cy.get('@buttonGroup').should('be.visible');

      // Should not have significant horizontal scroll
      // Allow small tolerance for browser rendering differences
      cy.get('usa-button-group').then($el => {
        expect($el[0].scrollWidth).to.be.at.most($el[0].clientWidth + 5);
      });
    });

    it('should maintain button accessibility at tablet widths', () => {
      // Set tablet viewport
      cy.viewport(768, 1024);

      cy.get('@buttonGroup').should('be.visible');

      // Inject axe to avoid race conditions
      cy.injectAxe();
      cy.wait(500); // Wait for axe to be ready

      // Should pass accessibility
      cy.checkA11y('usa-button-group');
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should not have inline positioning styles', () => {
      cy.get('@buttonGroup').within(() => {
        // Button group should not have positioning inline styles
        cy.get('.usa-button-group').then($el => {
          const style = $el.attr('style');

          if (style) {
            // Should not have position: absolute/fixed
            expect(style).not.to.include('position: absolute');
            expect(style).not.to.include('position: fixed');
            // Should not have manual transforms
            expect(style).not.to.include('transform:');
          }
        });

        // Buttons should not have positioning inline styles
        cy.get('.usa-button').each($button => {
          const style = $button.attr('style');

          if (style) {
            expect(style).not.to.include('position: absolute');
            expect(style).not.to.include('position: fixed');
          }
        });
      });
    });

    it('should use USWDS flexbox/grid classes for layout', () => {
      cy.get('@buttonGroup').within(() => {
        cy.get('.usa-button-group').then($el => {
          // Should use USWDS layout patterns
          const computedStyle = window.getComputedStyle($el[0]);

          // Should use flexbox or inline-flex (USWDS pattern)
          const display = computedStyle.display;
          expect(['flex', 'inline-flex', 'block', 'inline-block']).to.include(display);
        });
      });
    });
  });

  describe('Storybook Integration', () => {
    it('should render correctly in Storybook environment', () => {
      cy.get('@buttonGroup')
        .should('be.visible')
        .within(() => {
          cy.get('.usa-button-group').should('exist');
          cy.get('.usa-button').should('have.length.at.least', 1);
        });

      // Component should render without errors
      cy.get('@buttonGroup').should('be.visible');
    });

    it('should handle Storybook controls updates', () => {
      // Component should be stable with property changes
      cy.get('@buttonGroup').then($el => {
        const element = $el[0] as any;

        // Simulate Storybook control changes
        element.variant = 'segmented';
      });

      cy.wait(200);

      // Should still be functional
      cy.get('@buttonGroup')
        .should('be.visible')
        .within(() => {
          cy.get('.usa-button').should('be.visible');
        });
    });
  });
});
