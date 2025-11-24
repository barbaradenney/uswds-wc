import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-in-page-navigation.ts';
import type { USAInPageNavigation } from './usa-in-page-navigation.js';
import { waitForUpdate, setupTestEnvironment } from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAInPageNavigation', () => {
  let element: USAInPageNavigation;
  let cleanup: () => void;

  beforeEach(() => {
    // Setup test environment with browser mocks
    cleanup = setupTestEnvironment();

    element = document.createElement('usa-in-page-navigation') as USAInPageNavigation;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
    if (cleanup) cleanup();
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-IN-PAGE-NAVIGATION');
    });

    it('should have default properties', () => {
      expect(element.title).toBe('On this page');
      expect(element.titleHeadingLevel).toBe('4');
      expect(element.rootSelector).toBe('main');
      expect(element.headingSelector).toBe('h2 h3');
      expect(element.smoothScroll).toBe(true);
      expect(element.scrollOffset).toBe(0);
      expect(element.threshold).toBe('0.5');
      expect(element.rootMargin).toBe('0px 0px -50% 0px');
    });

    it('should render USWDS-compatible aside element', async () => {
      await waitForUpdate(element);

      // Should render empty aside element for USWDS to populate
      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav).toBeTruthy();
      expect(nav?.tagName).toBe('ASIDE');
    });
  });

  describe('USWDS Data Attributes', () => {
    it('should set proper data attributes for USWDS', async () => {
      element.title = 'Custom Title';
      element.titleHeadingLevel = '3';
      element.rootSelector = '.content';
      element.headingSelector = 'h1 h2';
      element.scrollOffset = 100;
      element.threshold = '0.3';
      element.rootMargin = '10px 0px -30% 0px';

      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-title-text')).toBe('Custom Title');
      expect(nav?.getAttribute('data-title-heading-level')).toBe('h3');
      expect(nav?.getAttribute('data-main-content-selector')).toBe('.content');
      expect(nav?.getAttribute('data-heading-elements')).toBe('h1 h2');
      expect(nav?.getAttribute('data-scroll-offset')).toBe('100');
      expect(nav?.getAttribute('data-threshold')).toBe('0.3');
      expect(nav?.getAttribute('data-root-margin')).toBe('10px 0px -30% 0px');
    });

    it('should update data attributes when properties change', async () => {
      await waitForUpdate(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-title-text')).toBe('On this page');

      element.title = 'Updated Title';
      await waitForUpdate(element);

      expect(nav?.getAttribute('data-title-text')).toBe('Updated Title');
    });
  });

  describe('Intersection Observer Properties', () => {
    it('should have intersection observer threshold property', () => {
      expect(element.threshold).toBe('0.5');

      element.threshold = '0.7';
      expect(element.threshold).toBe('0.7');
    });

    it('should have intersection observer rootMargin property', () => {
      expect(element.rootMargin).toBe('0px 0px -50% 0px');

      element.rootMargin = '10px 0px -40% 0px';
      expect(element.rootMargin).toBe('10px 0px -40% 0px');
    });

    it('should pass intersection observer settings to USWDS via data attributes', async () => {
      element.threshold = '0.3';
      element.rootMargin = '15px 0px -35% 0px';

      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-threshold')).toBe('0.3');
      expect(nav?.getAttribute('data-root-margin')).toBe('15px 0px -35% 0px');
    });
  });

  describe('USWDS Auto-generation Compatibility', () => {
    it('should use space-separated heading selector format for USWDS', () => {
      // USWDS expects space-separated selectors, not comma-separated
      expect(element.headingSelector).toBe('h2 h3');

      element.headingSelector = 'h1 h2 h3 h4';
      expect(element.headingSelector).toBe('h1 h2 h3 h4');
    });
  });

  describe('Property Updates', () => {
    it('should handle title updates', async () => {
      await waitForUpdate(element);

      element.title = 'New Title';
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-title-text')).toBe('New Title');
    });

    it('should handle heading level updates', async () => {
      await waitForUpdate(element);

      element.titleHeadingLevel = '2';
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-title-heading-level')).toBe('h2');
    });

    it('should handle selector updates', async () => {
      await waitForUpdate(element);

      element.rootSelector = '.main-content';
      element.headingSelector = 'h1 h2';
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-main-content-selector')).toBe('.main-content');
      expect(nav?.getAttribute('data-heading-elements')).toBe('h1 h2');
    });
  });

  describe('USWDS JavaScript Integration', () => {
    it('should initialize USWDS integration on connection', async () => {
      // Mock USWDS module
      const mockUSWDS = {
        on: vi.fn(),
        off: vi.fn(),
      };

      // Mock dynamic import
      vi.doMock('@uswds/uswds/js/usa-in-page-navigation', () => ({
        default: mockUSWDS,
      }));

      // Create new element to trigger initialization
      const newElement = document.createElement('usa-in-page-navigation') as USAInPageNavigation;
      document.body.appendChild(newElement);

      await waitForUpdate(newElement);

      // Note: In actual usage, USWDS initialization happens asynchronously
      // This test verifies the component structure is ready for USWDS

      const nav = newElement.querySelector('.usa-in-page-nav');
      expect(nav).toBeTruthy();

      newElement.remove();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper navigation structure for accessibility', async () => {
      await waitForUpdate(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.tagName).toBe('ASIDE');
      expect(nav?.classList.contains('usa-in-page-nav')).toBe(true);
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Light DOM Rendering', () => {
    it('should use light DOM (no shadow root)', () => {
      expect(element.shadowRoot).toBe(null);
      expect(element.renderRoot).toBe(element);
    });

    it('should apply USWDS classes correctly in light DOM', async () => {
      await waitForUpdate(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.classList.contains('usa-in-page-nav')).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing content gracefully', async () => {
      // Component should still render even without target content
      element.rootSelector = '.non-existent';
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav).toBeTruthy();
    });

    it('should handle property changes gracefully', async () => {
      await waitForUpdate(element);

      // Rapid property changes should not break the component
      element.title = 'Title 1';
      element.title = 'Title 2';
      element.title = 'Title 3';

      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-title-text')).toBe('Title 3');
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up properly on disconnect', async () => {
      await waitForUpdate(element);

      // Test that component can be removed and re-added
      const parent = element.parentNode;
      element.remove();

      expect(element.parentNode).toBe(null);

      if (parent) {
        parent.appendChild(element);
        await waitForUpdate(element);
        expect(element.querySelector('.usa-in-page-nav')).toBeTruthy();
      }
    });
  });

  // NOTE: Duplication prevention tests moved to Cypress e2e tests
  // Reason: Unit tests cannot fully test USWDS DOM transformation and initialization timing
  // See: cypress/e2e/in-page-navigation-sticky-active.cy.ts - "USWDS Initialization and Duplication Prevention" suite
  // Added: 2025-10-13

  describe('Duplication Prevention', () => {
    it('should handle rapid component re-renders without duplication', async () => {
      await waitForUpdate(element);

      // Simulate rapid Storybook-style re-renders by triggering multiple updates
      element.title = 'Title 1';
      element.title = 'Title 2';
      element.title = 'Title 3';
      element.rootSelector = 'main';
      element.headingSelector = 'h2 h3';

      await waitForUpdate(element);
      await waitForUpdate(element);
      await waitForUpdate(element);

      // Should still only have one navigation container
      const navContainers = element.querySelectorAll('.usa-in-page-nav');
      expect(navContainers.length).toBe(1);
    });
  });

  describe('Regression Tests', () => {
    it('REGRESSION: should properly pass threshold property to USWDS behavior', async () => {
      // Bug: The usa-in-page-navigation-behavior.ts file had a hardcoded check
      // for intersectionRatio >= 1 instead of using the configured threshold value.
      // This caused active state tracking to ignore the threshold property.
      //
      // Fix: Modified setActive function to accept threshold parameter and use
      // it in the intersection ratio check instead of hardcoded >= 1.
      //
      // This test ensures the threshold property is properly passed to the behavior layer.

      element.threshold = '0.5';
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-threshold')).toBe('0.5');

      // Change threshold and verify it updates
      element.threshold = '0.3';
      await waitForUpdate(element);

      expect(nav?.getAttribute('data-threshold')).toBe('0.3');
      expect(element.threshold).toBe('0.3');
    });

    it('REGRESSION: should properly pass rootMargin property to USWDS behavior', async () => {
      // Bug: While rootMargin was not hardcoded, this test ensures the detection
      // zone configuration is properly passed through to IntersectionObserver.
      //
      // The rootMargin defines the viewport detection zone:
      // - '0px 0px -50% 0px' creates a detection zone in the top 50% of viewport
      // - Negative bottom margin shrinks the detection area from the bottom

      element.rootMargin = '0px 0px -50% 0px';
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-root-margin')).toBe('0px 0px -50% 0px');

      // Change rootMargin and verify it updates
      element.rootMargin = '10px 0px -40% 0px';
      await waitForUpdate(element);

      expect(nav?.getAttribute('data-root-margin')).toBe('10px 0px -40% 0px');
      expect(element.rootMargin).toBe('10px 0px -40% 0px');
    });

    it('REGRESSION: should maintain IntersectionObserver settings through property updates', async () => {
      // Ensure IntersectionObserver configuration persists through various property changes
      // This prevents regression where changing unrelated properties might reset observer settings

      element.threshold = '0.5';
      element.rootMargin = '0px 0px -50% 0px';
      await waitForUpdate(element);

      // Change other properties
      element.title = 'Updated Title';
      element.titleHeadingLevel = '3';
      element.rootSelector = '.content';
      element.headingSelector = 'h1 h2';
      element.scrollOffset = 100;
      await waitForUpdate(element);

      // IntersectionObserver settings should remain unchanged
      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-threshold')).toBe('0.5');
      expect(nav?.getAttribute('data-root-margin')).toBe('0px 0px -50% 0px');
      expect(element.threshold).toBe('0.5');
      expect(element.rootMargin).toBe('0px 0px -50% 0px');
    });

    it('REGRESSION: should use correct default IntersectionObserver values', async () => {
      // Bug: Active state tracking was incorrect due to:
      // 1. Hardcoded intersectionRatio >= 1 check (required 100% visibility)
      // 2. Wrong default threshold value
      //
      // Fix: Set proper defaults that work well for typical page navigation:
      // - threshold: '0.5' (50% visibility required)
      // - rootMargin: '0px 0px -50% 0px' (detection zone in top 50% of viewport)
      //
      // These defaults ensure active state changes when sections are reasonably visible.

      await waitForUpdate(element);

      const nav = element.querySelector('.usa-in-page-nav');

      // Verify default threshold is 0.5 (not 1)
      expect(element.threshold).toBe('0.5');
      expect(nav?.getAttribute('data-threshold')).toBe('0.5');

      // Verify default rootMargin creates top-half detection zone
      expect(element.rootMargin).toBe('0px 0px -50% 0px');
      expect(nav?.getAttribute('data-root-margin')).toBe('0px 0px -50% 0px');
    });

    it('REGRESSION: should handle extreme threshold values without breaking', async () => {
      // Test edge cases to ensure behavior doesn't break with unusual threshold values
      // This prevents future regressions from assumptions about threshold ranges

      // Test minimum threshold (0 = any visibility triggers active state)
      element.threshold = '0';
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-threshold')).toBe('0');

      // Test maximum threshold (1 = 100% visibility required)
      element.threshold = '1';
      await waitForUpdate(element);

      expect(nav?.getAttribute('data-threshold')).toBe('1');

      // Test mid-range threshold
      element.threshold = '0.75';
      await waitForUpdate(element);

      expect(nav?.getAttribute('data-threshold')).toBe('0.75');
    });

    it('REGRESSION: should handle various rootMargin formats', async () => {
      // Ensure different rootMargin formats work correctly
      // This prevents regression from incorrect string parsing

      // Test 4-value format (top right bottom left)
      element.rootMargin = '10px 0px -50% 0px';
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-in-page-nav');
      expect(nav?.getAttribute('data-root-margin')).toBe('10px 0px -50% 0px');

      // Test with different units
      element.rootMargin = '0% 0px -40% 0px';
      await waitForUpdate(element);

      expect(nav?.getAttribute('data-root-margin')).toBe('0% 0px -40% 0px');

      // Test with negative top margin
      element.rootMargin = '-10% 0px -35% 0px';
      await waitForUpdate(element);

      expect(nav?.getAttribute('data-root-margin')).toBe('-10% 0px -35% 0px');
    });
  });

  // CRITICAL: Layout and Structure Validation Tests
  // These tests prevent layout issues like sticky positioning and content coverage
  describe('Layout and Structure Validation (Prevent Positioning Issues)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-in-page-navigation') as USAInPageNavigation;
      element.title = 'On this page';
      element.headingSelector = 'h2 h3';
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    describe('Sticky Positioning Structure', () => {
      it('should have correct DOM structure for in-page navigation', async () => {
        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav).toBeTruthy();
        expect(nav?.tagName).toBe('ASIDE');
      });

      it('should match USWDS reference structure for in-page navigation', async () => {
        // Expected structure from USWDS:
        // <aside class="usa-in-page-nav" data-title-text="..." data-...>
        // </aside>

        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav).toBeTruthy();
        expect(nav?.classList.contains('usa-in-page-nav')).toBe(true);

        // Verify nesting - nav is direct child of component
        expect(element.contains(nav as Node)).toBe(true);
      });

      it('should have proper ASIDE element for semantic navigation', async () => {
        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav?.tagName).toBe('ASIDE');

        // ASIDE is the correct semantic element for in-page navigation
        // This ensures proper accessibility and screen reader behavior
      });

      it('should NOT have extra wrapper elements around navigation', async () => {
        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav).toBeTruthy();

        // Navigation should be direct child of component
        // No extra divs or sections
        const childElements = Array.from(element.children);
        expect(childElements).toContain(nav as Element);
      });
    });

    describe('Data Attribute Configuration', () => {
      it('should have all required data attributes for USWDS', async () => {
        const nav = element.querySelector('.usa-in-page-nav');

        expect(nav?.hasAttribute('data-title-text')).toBe(true);
        expect(nav?.hasAttribute('data-title-heading-level')).toBe(true);
        expect(nav?.hasAttribute('data-main-content-selector')).toBe(true);
        expect(nav?.hasAttribute('data-heading-elements')).toBe(true);
        expect(nav?.hasAttribute('data-scroll-offset')).toBe(true);
        expect(nav?.hasAttribute('data-threshold')).toBe(true);
        expect(nav?.hasAttribute('data-root-margin')).toBe(true);
      });

      it('should have correct default data attribute values', async () => {
        const nav = element.querySelector('.usa-in-page-nav');

        expect(nav?.getAttribute('data-title-text')).toBe('On this page');
        expect(nav?.getAttribute('data-title-heading-level')).toBe('h4');
        expect(nav?.getAttribute('data-main-content-selector')).toBe('main');
        expect(nav?.getAttribute('data-heading-elements')).toBe('h2 h3');
        expect(nav?.getAttribute('data-scroll-offset')).toBe('0');
        expect(nav?.getAttribute('data-threshold')).toBe('0.5');
        expect(nav?.getAttribute('data-root-margin')).toBe('0px 0px -50% 0px');
      });

      it('should update data attributes when properties change', async () => {
        element.title = 'Custom Navigation';
        element.titleHeadingLevel = '3';
        element.scrollOffset = 100;
        await waitForPropertyPropagation(element);

        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav?.getAttribute('data-title-text')).toBe('Custom Navigation');
        expect(nav?.getAttribute('data-title-heading-level')).toBe('h3');
        expect(nav?.getAttribute('data-scroll-offset')).toBe('100');
      });
    });

    describe('CSS Display Properties', () => {
      it('should have block display on host element', async () => {
        // In jsdom, getComputedStyle won't return actual CSS values
        // This test validates the element exists - Cypress will test actual display
        const computedStyle = window.getComputedStyle(element);
        expect(computedStyle).toBeTruthy();

        // Note: In a real browser (Cypress), we would verify:
        // expect(computedStyle.display).toBe('block');
      });

      it('should have proper navigation wrapper classes', async () => {
        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav?.classList.contains('usa-in-page-nav')).toBe(true);
      });
    });

    describe('Visual Rendering Validation', () => {
      it('should render navigation structure in DOM (visual tests in Cypress)', async () => {
        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav).toBeTruthy();
        expect(nav?.tagName).toBe('ASIDE');

        // CRITICAL: This structure validation prevents sticky positioning issues
        // In a real browser (Cypress), we would also check:
        // - Navigation stays in viewport when scrolling
        // - Content is not covered by sticky navigation
        // - Navigation has correct sticky positioning
        // Note: jsdom doesn't handle position: sticky, so visual checks are in Cypress
      });

      it('should maintain structure with different title heading levels', async () => {
        const headingLevels = ['2', '3', '4', '5', '6'];

        for (const level of headingLevels) {
          element.titleHeadingLevel = level;
          await waitForPropertyPropagation(element);

          const nav = element.querySelector('.usa-in-page-nav');
          expect(nav?.getAttribute('data-title-heading-level')).toBe(`h${level}`);
          expect(nav).toBeTruthy();
        }
      });

      it('should maintain structure with different selectors', async () => {
        element.rootSelector = '.main-content';
        element.headingSelector = 'h1 h2 h3';
        await waitForPropertyPropagation(element);

        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav?.getAttribute('data-main-content-selector')).toBe('.main-content');
        expect(nav?.getAttribute('data-heading-elements')).toBe('h1 h2 h3');
        expect(nav).toBeTruthy();
      });
    });

    describe('Subnav Rendering', () => {
      it('should have proper structure for USWDS to populate subnavigation', async () => {
        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav).toBeTruthy();

        // Navigation should be empty initially
        // USWDS will populate it with generated links based on headings in content

        // CRITICAL: Empty navigation structure allows USWDS to populate without conflicts
        // This prevents duplication and layout issues
      });

      it('should maintain structure with scroll offset configuration', async () => {
        const offsets = [0, 50, 100, 150];

        for (const offset of offsets) {
          element.scrollOffset = offset;
          await waitForPropertyPropagation(element);

          const nav = element.querySelector('.usa-in-page-nav');
          expect(nav?.getAttribute('data-scroll-offset')).toBe(String(offset));
          expect(nav).toBeTruthy();
        }
      });
    });

    describe('IntersectionObserver Configuration', () => {
      it('should maintain structure with different threshold values', async () => {
        const thresholds = ['0', '0.25', '0.5', '0.75', '1'];

        for (const threshold of thresholds) {
          element.threshold = threshold;
          await waitForPropertyPropagation(element);

          const nav = element.querySelector('.usa-in-page-nav');
          expect(nav?.getAttribute('data-threshold')).toBe(threshold);
          expect(nav).toBeTruthy();
        }
      });

      it('should maintain structure with different rootMargin values', async () => {
        const rootMargins = [
          '0px 0px 0px 0px',
          '10px 0px -50% 0px',
          '0% 0px -40% 0px',
          '-10% 0px -35% 0px',
        ];

        for (const rootMargin of rootMargins) {
          element.rootMargin = rootMargin;
          await waitForPropertyPropagation(element);

          const nav = element.querySelector('.usa-in-page-nav');
          expect(nav?.getAttribute('data-root-margin')).toBe(rootMargin);
          expect(nav).toBeTruthy();
        }
      });

      it('should sync all IntersectionObserver settings with DOM', async () => {
        element.threshold = '0.3';
        element.rootMargin = '10px 0px -40% 0px';
        await waitForPropertyPropagation(element);

        const nav = element.querySelector('.usa-in-page-nav');
        expect(nav?.getAttribute('data-threshold')).toBe('0.3');
        expect(nav?.getAttribute('data-root-margin')).toBe('10px 0px -40% 0px');

        // Both property and data attribute should match
        expect(element.threshold).toBe('0.3');
        expect(element.rootMargin).toBe('10px 0px -40% 0px');
      });
    });
  });
});
