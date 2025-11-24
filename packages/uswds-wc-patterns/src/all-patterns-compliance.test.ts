import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';

// Import all patterns
import './patterns/address/usa-address-pattern.js';
import './patterns/name/usa-name-pattern.js';
import './patterns/phone-number/usa-phone-number-pattern.js';
import './patterns/contact-preferences/usa-contact-preferences-pattern.js';
import './patterns/language-selection/usa-language-selector-pattern.js';

// Import reusable validators
import {
  validateFieldsetStructure,
  validateCompactMode,
  validateNoFormGroups,
  validateNoGridWrappers,
  validateFieldsAreDirectChildren,
  validateComboBoxWrapper,
  validateCompactRendering,
} from './test-utils/pattern-compliance-tests.js';

/**
 * All Patterns USWDS Compliance Test Suite
 *
 * This file runs generic USWDS compliance tests against ALL pattern components
 * to ensure consistent HTML structure across the entire pattern library.
 *
 * Tests here validate:
 * - Fieldset/legend structure
 * - Compact mode usage
 * - No form-group wrappers
 * - No grid layout wrappers
 * - Combo-box wrappers (where applicable)
 * - Direct children structure
 * - Compact rendering
 *
 * Pattern-specific tests (like dropdown options, custom validation)
 * should remain in individual pattern test files.
 */

/**
 * Pattern configuration for automated testing
 */
interface PatternTestConfig {
  /** Tag name of the pattern element */
  tagName: string;
  /** Display name for test output */
  displayName: string;
  /** Whether pattern contains select elements */
  hasSelects?: boolean;
  /** Whether this is a wrapper pattern (doesn't follow standard fieldset structure) */
  isWrapperPattern?: boolean;
  /** Whether to skip certain tests (use sparingly) */
  skipTests?: string[];
}

/**
 * All patterns to test
 * Add new patterns here as they're created
 */
const PATTERNS: PatternTestConfig[] = [
  {
    tagName: 'usa-address-pattern',
    displayName: 'Address Pattern',
    hasSelects: true,
  },
  {
    tagName: 'usa-name-pattern',
    displayName: 'Name Pattern',
    hasSelects: true,
  },
  {
    tagName: 'usa-phone-number-pattern',
    displayName: 'Phone Number Pattern',
    hasSelects: true,
  },
  {
    tagName: 'usa-contact-preferences-pattern',
    displayName: 'Contact Preferences Pattern',
    hasSelects: false,
    // Uses usa-checkbox components (not text-input/select/textarea)
  },
  {
    tagName: 'usa-language-selector-pattern',
    displayName: 'Language Selector Pattern',
    hasSelects: false,
    isWrapperPattern: true, // Wrapper around usa-language-selector, no fieldset/legend
  },
];

/**
 * Create test suite for each pattern
 */
PATTERNS.forEach((patternConfig) => {
  describe(`${patternConfig.displayName} - Generic USWDS Compliance`, () => {
    let pattern: Element;
    let container: HTMLDivElement;

    beforeEach(async () => {
      container = document.createElement('div');
      document.body.appendChild(container);
      pattern = document.createElement(patternConfig.tagName);
      container.appendChild(pattern);
      await (pattern as any).updateComplete;
    });

    afterEach(() => {
      container?.remove();
    });

    // Skip fieldset tests for wrapper patterns
    if (!patternConfig.isWrapperPattern) {
      describe('Fieldset Structure', () => {
        it('should have correct USWDS fieldset/legend structure', () => {
          validateFieldsetStructure(pattern);
        });

        it('should use only USWDS classes (usa-fieldset, usa-legend)', () => {
          const fieldset = pattern.querySelector('fieldset');
          const legend = pattern.querySelector('legend');

          expect(fieldset?.className).toBe('usa-fieldset');
          // Pattern legends should use usa-legend--large modifier for proper visual hierarchy
          expect(legend?.className).toBe('usa-legend usa-legend--large');
        });
      });
    }

    describe('Compact Mode', () => {
      it('should use compact mode on all form components', () => {
        validateCompactMode(pattern);
      });

      it('should not have form-group wrappers (compact mode result)', async () => {
        await validateNoFormGroups(pattern);
      });

      it('should render compact components correctly', async () => {
        await validateCompactRendering(pattern);
      });
    });

    describe('Layout Structure', () => {
      it('should not have grid-row wrappers', () => {
        const gridRows = pattern.querySelectorAll('.grid-row');
        expect(gridRows.length).toBe(0);
      });

      it('should not have grid-col wrappers', () => {
        validateNoGridWrappers(pattern);
      });

      it('should have fields as direct children of fieldset', () => {
        validateFieldsAreDirectChildren(pattern);
      });
    });

    // Conditional tests based on pattern features
    if (patternConfig.hasSelects) {
      describe('Combo-Box Wrapper (Select Components)', () => {
        it('should wrap all select elements in usa-combo-box div', async () => {
          await validateComboBoxWrapper(pattern);
        });

        it('should have select as direct child of combo-box', async () => {
          const selects = pattern.querySelectorAll('usa-select');

          for (const selectComponent of Array.from(selects)) {
            await (selectComponent as any)?.updateComplete;

            const comboBox = selectComponent.querySelector('.usa-combo-box');
            const select = comboBox?.querySelector('select.usa-select');

            expect(select).toBeTruthy();
            expect(select?.parentElement).toBe(comboBox);
          }
        });
      });
    }

    describe('Light DOM Pattern', () => {
      it('should use Light DOM (no Shadow DOM)', () => {
        expect((pattern as any).shadowRoot).toBeNull();
      });

      it('should allow USWDS styles to cascade properly', () => {
        // Wrapper patterns might not have fieldsets
        if (!patternConfig.isWrapperPattern) {
          const fieldset = pattern.querySelector('fieldset');
          expect(fieldset).toBeTruthy();
        }

        // In Light DOM, we can query elements directly
        // Check for any USWDS components (form components or wrapper-specific components)
        const formComponents = pattern.querySelectorAll(
          'usa-text-input, usa-select, usa-textarea, usa-checkbox'
        );
        const wrapperComponents = pattern.querySelectorAll('usa-language-selector');
        const totalComponents = formComponents.length + wrapperComponents.length;

        expect(totalComponents).toBeGreaterThan(0);
      });
    });

    // Skip USWDS class tests for wrapper patterns
    if (!patternConfig.isWrapperPattern) {
      describe('USWDS Class Usage', () => {
        it('should only use official USWDS classes', () => {
          const fieldset = pattern.querySelector('fieldset');
          const legend = pattern.querySelector('legend');

          // Only check classes we control (not dynamic USWDS JS classes)
          expect(fieldset?.classList.contains('usa-fieldset')).toBe(true);
          expect(legend?.classList.contains('usa-legend')).toBe(true);

          // Should not have custom classes
          expect(fieldset?.className).toBe('usa-fieldset');
          // Pattern legends should use usa-legend--large modifier for proper visual hierarchy
          expect(legend?.className).toBe('usa-legend usa-legend--large');
        });
      });
    }
  });
});

/**
 * Cross-Pattern Consistency Tests
 *
 * These tests validate consistency across all patterns
 */
describe('All Patterns - Cross-Pattern Consistency', () => {
  let patterns: Element[];
  let container: HTMLDivElement;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create all patterns
    patterns = await Promise.all(
      PATTERNS.map(async (config) => {
        const pattern = document.createElement(config.tagName);
        container.appendChild(pattern);
        await (pattern as any).updateComplete;
        return pattern;
      })
    );
  });

  afterEach(() => {
    container?.remove();
  });

  it('should all use Light DOM consistently', () => {
    patterns.forEach((pattern) => {
      expect((pattern as any).shadowRoot).toBeNull();
    });
  });

  it('should all have fieldset/legend structure (except wrapper patterns)', () => {
    patterns.forEach((pattern, index) => {
      const config = PATTERNS[index];

      // Skip wrapper patterns (they don't follow standard fieldset structure)
      if (config.isWrapperPattern) {
        return;
      }

      const fieldset = pattern.querySelector('fieldset.usa-fieldset');
      const legend = pattern.querySelector('legend.usa-legend');

      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });
  });

  it('should all use compact mode on form components', () => {
    patterns.forEach((pattern) => {
      const textInputs = pattern.querySelectorAll('usa-text-input');
      textInputs.forEach((input) => {
        expect(input.hasAttribute('compact')).toBe(true);
      });

      const selects = pattern.querySelectorAll('usa-select');
      selects.forEach((select) => {
        expect(select.hasAttribute('compact')).toBe(true);
      });

      const textareas = pattern.querySelectorAll('usa-textarea');
      textareas.forEach((textarea) => {
        expect(textarea.hasAttribute('compact')).toBe(true);
      });
    });
  });

  it('should all avoid grid layout wrappers', () => {
    patterns.forEach((pattern) => {
      const gridRows = pattern.querySelectorAll('.grid-row');
      const gridCols = pattern.querySelectorAll('[class*="grid-col"]');

      expect(gridRows.length).toBe(0);
      expect(gridCols.length).toBe(0);
    });
  });

  it('should all have consistent USWDS class naming (except wrapper patterns)', () => {
    patterns.forEach((pattern, index) => {
      const config = PATTERNS[index];

      // Skip wrapper patterns (they don't follow standard fieldset structure)
      if (config.isWrapperPattern) {
        return;
      }

      const fieldset = pattern.querySelector('fieldset');
      const legend = pattern.querySelector('legend');

      // All patterns should use same USWDS classes
      expect(fieldset?.className).toBe('usa-fieldset');
      expect(legend?.className).toBe('usa-legend usa-legend--large');
    });
  });
});

/**
 * Pattern Coverage Report
 *
 * This test provides a summary of pattern test coverage
 */
describe('Pattern Test Coverage Report', () => {
  it('should report all patterns being tested', () => {
    console.log('\n📊 Pattern Compliance Test Coverage Report:\n');
    console.log(`Total Patterns: ${PATTERNS.length}`);
    console.log('\nPatterns Tested:');

    PATTERNS.forEach((config, index) => {
      const features = [];
      if (config.hasSelects) features.push('Combo-box');
      if (config.skipTests?.length) features.push(`Skipped: ${config.skipTests.join(', ')}`);

      console.log(`  ${index + 1}. ${config.displayName} (${config.tagName})`);
      if (features.length) {
        console.log(`     Features: ${features.join(', ')}`);
      }
    });

    console.log('\n✅ All patterns validated for generic USWDS compliance\n');

    // Always pass - this is just for reporting
    expect(PATTERNS.length).toBeGreaterThan(0);
  });
});
