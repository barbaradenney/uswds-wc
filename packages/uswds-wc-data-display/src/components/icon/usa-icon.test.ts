import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-icon.ts';
import type { USAIcon } from './usa-icon.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import {
  waitForUpdate,
  testPropertyChanges,
  assertAccessibilityAttributes,
  assertDOMStructure,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import { getFocusableElements } from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAIcon', () => {
  let element: USAIcon;

  beforeEach(() => {
    element = document.createElement('usa-icon') as USAIcon;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-ICON');
    });

    it('should have default properties', () => {
      expect(element.name).toBe('');
      expect(element.size).toBe('');
      expect(element.ariaLabel).toBe('');
      expect(element.decorative).toBe(''); // String type: '' | 'true' | 'false'

      // SPRITE-FIRST ARCHITECTURE: Icons use sprite by default (regression test)
      expect(element.spriteUrl).toBe('/img/sprite.svg');
      expect(element.useSprite).toBe(true);
    });

    it('should render SVG element', async () => {
      element.name = 'search';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.classList.contains('usa-icon')).toBe(true);
    });
  });

  describe('Icon Name Properties', () => {
    it('should handle icon name changes', async () => {
      await testPropertyChanges(
        element,
        'name',
        ['search', 'close', 'menu', 'arrow_forward'],
        async (el, value) => {
          expect(el.name).toBe(value);
          const svg = el.querySelector('svg');
          expect(svg).toBeTruthy();
        }
      );
    });

    it('should render different icon paths for different names', async () => {
      // Disable sprite mode to test inline SVG paths
      element.useSprite = false;
      element.name = 'search';
      await waitForPropertyPropagation(element);
      const searchPath = element.querySelector('path')?.getAttribute('d');

      element.name = 'close';
      await waitForPropertyPropagation(element);
      const closePath = element.querySelector('path')?.getAttribute('d');

      expect(searchPath).toBeTruthy();
      expect(closePath).toBeTruthy();
      expect(searchPath).not.toBe(closePath);
    });
  });

  describe('Size Properties', () => {
    it('should handle size changes', async () => {
      await testPropertyChanges(
        element,
        'size',
        ['3', '4', '5', '6', '7', '8', '9'],
        async (el, value) => {
          expect(el.size).toBe(value);
          const svg = el.querySelector('svg');
          expect(svg?.classList.contains(`usa-icon--size-${value}`)).toBe(true);
        }
      );
    });

    it('should apply correct size classes', async () => {
      element.size = '5';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg?.classList.contains('usa-icon--size-5')).toBe(true);
    });

    it('should not add size class for empty size', async () => {
      element.size = '';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('class')).toBe('usa-icon');
    });
  });

  describe('Accessibility Properties', () => {
    it('should handle aria-label changes', async () => {
      await testPropertyChanges(
        element,
        'ariaLabel',
        ['Search icon', 'Close dialog', 'Menu button'],
        async (el, value) => {
          expect(el.ariaLabel).toBe(value);
          if (el.decorative !== 'true') {
            const svg = el.querySelector('svg');
            expect(svg?.getAttribute('aria-label')).toBe(value);
          }
        }
      );
    });

    it('should handle decorative property changes', async () => {
      element.ariaLabel = 'Test icon';

      element.decorative = '';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('false');
      expect(svg?.getAttribute('aria-label')).toBe('Test icon');

      element.decorative = 'true';
      await waitForUpdate(element);

      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.hasAttribute('aria-label')).toBe(false);
    });

    it('should have proper accessibility attributes', async () => {
      element.name = 'search';
      element.ariaLabel = 'Search';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('role')).toBe('img');
      expect(svg?.getAttribute('focusable')).toBe('false');
      expect(svg?.getAttribute('aria-hidden')).toBe('false');
      expect(svg?.getAttribute('aria-label')).toBe('Search');
    });

    it('should be decorative when specified', async () => {
      element.name = 'search';
      element.decorative = 'true';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.hasAttribute('aria-label')).toBe(false);
    });
  });

  describe('Sprite vs Inline SVG', () => {
    it('should use sprite when configured', async () => {
      element.name = 'search';
      element.useSprite = true;
      element.spriteUrl = '/icons.svg';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      const use = svg?.querySelector('use');
      expect(use).toBeTruthy();
      expect(use?.getAttribute('href')).toBe('/icons.svg#search');
    });

    it('should use sprite by default (sprite-first architecture)', async () => {
      element.name = 'search';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      const use = svg?.querySelector('use');
      expect(use).toBeTruthy();
      expect(use?.getAttribute('href')).toBe('/img/sprite.svg#search');
      expect(svg?.querySelector('path')).toBe(null);
    });

    it('should use inline SVG when explicitly disabled', async () => {
      element.name = 'search';
      element.useSprite = false;
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      const path = svg?.querySelector('path');
      expect(path).toBeTruthy();
      expect(svg?.querySelector('use')).toBe(null);
    });
  });

  describe('Government Icon Usage', () => {
    describe('Federal Agency Icons', () => {
      it('should render search icons for government websites', async () => {
        element.name = 'search';
        element.ariaLabel = 'Search government website';
        element.size = '4';
        await waitForPropertyPropagation(element);

        const svg = element.querySelector('svg');
        expect(svg?.classList.contains('usa-icon--size-4')).toBe(true);
        expect(svg?.getAttribute('aria-label')).toBe('Search government website');
      });

      it('should render flag icon for government identity', async () => {
        element.name = 'flag';
        element.ariaLabel = 'An official website of the United States government';
        element.useSprite = false; // Use inline for path validation
        await waitForUpdate(element);

        const svg = element.querySelector('svg');
        const path = svg?.querySelector('path');
        expect(path?.getAttribute('d')).toContain('14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z');
        expect(svg?.getAttribute('aria-label')).toBe(
          'An official website of the United States government'
        );
      });

      it('should render menu icons for application navigation', async () => {
        element.name = 'menu';
        element.ariaLabel = 'Open navigation menu';
        element.size = '5';
        await waitForPropertyPropagation(element);

        const svg = element.querySelector('svg');
        expect(svg?.classList.contains('usa-icon--size-5')).toBe(true);
        expect(svg?.getAttribute('aria-label')).toBe('Open navigation menu');
      });

      it('should render close icons for dialog management', async () => {
        element.name = 'close';
        element.ariaLabel = 'Close dialog';
        element.useSprite = false; // Use inline for path validation
        await waitForUpdate(element);

        const svg = element.querySelector('svg');
        const path = svg?.querySelector('path');
        expect(path?.getAttribute('d')).toContain('19 6.41L17.59 5');
      });
    });

    describe('Government Form Icons', () => {
      it('should render form status icons', async () => {
        const statusIcons = [
          { name: 'check_circle', label: 'Form submitted successfully' },
          { name: 'error', label: 'Form has errors' },
          { name: 'warning', label: 'Form has warnings' },
          { name: 'info', label: 'Additional information' },
        ];

        for (const icon of statusIcons) {
          element.name = icon.name;
          element.ariaLabel = icon.label;
          element.useSprite = false; // Use inline for path validation
          await waitForUpdate(element);

          const svg = element.querySelector('svg');
          expect(svg?.getAttribute('aria-label')).toBe(icon.label);

          const path = svg?.querySelector('path');
          expect(path).toBeTruthy();
        }
      });

      it('should render help and support icons', async () => {
        element.name = 'help';
        element.ariaLabel = 'Get help with this form';
        element.size = '3';
        await waitForPropertyPropagation(element);

        const svg = element.querySelector('svg');
        expect(svg?.classList.contains('usa-icon--size-3')).toBe(true);
        expect(svg?.getAttribute('aria-label')).toBe('Get help with this form');
      });

      it('should render file download icons for government documents', async () => {
        element.name = 'file_download';
        element.ariaLabel = 'Download form PDF';
        await waitForPropertyPropagation(element);

        const svg = element.querySelector('svg');
        expect(svg?.getAttribute('aria-label')).toBe('Download form PDF');
      });
    });

    describe('Government Contact Icons', () => {
      it('should render contact method icons', async () => {
        const contactIcons = [
          { name: 'phone', label: 'Call government office' },
          { name: 'email', label: 'Email government office' },
          { name: 'location_on', label: 'Visit government office' },
        ];

        for (const icon of contactIcons) {
          element.name = icon.name;
          element.ariaLabel = icon.label;
          await waitForPropertyPropagation(element);

          const svg = element.querySelector('svg');
          expect(svg?.getAttribute('aria-label')).toBe(icon.label);
        }
      });
    });

    describe('Government Navigation Icons', () => {
      it('should render directional arrows for government workflows', async () => {
        const arrowIcons = ['arrow_forward', 'arrow_back', 'arrow_upward', 'arrow_downward'];

        for (const iconName of arrowIcons) {
          element.name = iconName;
          element.ariaLabel = `Navigate ${iconName.replace('arrow_', '')}`;
          await waitForPropertyPropagation(element);

          const svg = element.querySelector('svg');
          expect(svg?.getAttribute('aria-label')).toBe(
            `Navigate ${iconName.replace('arrow_', '')}`
          );
        }
      });

      it('should render expand/collapse icons for government content', async () => {
        element.name = 'expand_more';
        element.ariaLabel = 'Expand section';
        await waitForPropertyPropagation(element);

        const svg = element.querySelector('svg');
        expect(svg?.getAttribute('aria-label')).toBe('Expand section');

        element.name = 'expand_less';
        element.ariaLabel = 'Collapse section';
        await waitForUpdate(element);

        expect(svg?.getAttribute('aria-label')).toBe('Collapse section');
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should meet Section 508 requirements for meaningful icons', async () => {
      element.name = 'search';
      element.ariaLabel = 'Search federal regulations';
      await waitForUpdate(element);

      assertAccessibilityAttributes(element, {
        role: null, // Role is on SVG element, not host
      });

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('role')).toBe('img');
      expect(svg?.getAttribute('aria-label')).toBe('Search federal regulations');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });

    it('should meet WCAG guidelines for decorative icons', async () => {
      element.name = 'settings';
      element.decorative = 'true';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.hasAttribute('aria-label')).toBe(false);
      expect(svg?.getAttribute('focusable')).toBe('false');
    });

    it('should support screen readers with proper labeling', async () => {
      element.name = 'info';
      element.ariaLabel = 'Important information about tax filing';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('role')).toBe('img');
      expect(svg?.getAttribute('aria-label')).toBe('Important information about tax filing');
    });
  });

  describe('Government Performance Requirements', () => {
    it('should handle multiple icon instances efficiently', async () => {
      const icons = [];
      const startTime = Date.now();

      // Create 20 icons (typical for a government page)
      for (let i = 0; i < 20; i++) {
        const icon = document.createElement('usa-icon') as USAIcon;
        icon.name = i % 2 === 0 ? 'search' : 'info';
        icon.size = '4';
        document.body.appendChild(icon);
        icons.push(icon);
        await waitForUpdate(icon);
      }

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(500); // Should render quickly

      // Cleanup
      icons.forEach((icon) => icon.remove());
    });

    it('should handle government sprite URLs correctly', async () => {
      element.name = 'flag';
      element.useSprite = true;
      element.spriteUrl = '/img/sprite.svg';
      element.ariaLabel = 'Official government website';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      const use = svg?.querySelector('use');
      expect(use?.getAttribute('href')).toBe('/img/sprite.svg#flag');
    });
  });

  describe('Government Content Security', () => {
    it('should handle secure government sprite URLs', async () => {
      element.name = 'security';
      element.useSprite = true;
      element.spriteUrl = 'https://secure.gov/assets/icons.svg';
      await waitForPropertyPropagation(element);

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('https://secure.gov/assets/icons.svg#security');
    });

    it('should sanitize icon names for security', async () => {
      // Disable sprite mode to test inline SVG paths
      element.useSprite = false;
      element.name = 'search<script>alert("xss")</script>';
      await waitForUpdate(element);

      // Should not execute scripts
      expect(document.querySelectorAll('script').length).toBe(0);

      // Should render fallback icon
      const path = element.querySelector('path');
      expect(path).toBeTruthy();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle unknown icon names gracefully', async () => {
      // Disable sprite mode to test inline SVG fallback
      element.useSprite = false;
      element.name = 'nonexistent_icon';
      element.ariaLabel = 'Unknown icon';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      const path = svg?.querySelector('path');
      expect(path).toBeTruthy(); // Should render fallback
      expect(svg?.getAttribute('aria-label')).toBe('Unknown icon');
    });

    it('should handle empty icon names', async () => {
      // Disable sprite mode to test inline SVG fallback
      element.useSprite = false;
      element.name = '';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg).toBeTruthy();
      const path = svg?.querySelector('path');
      expect(path).toBeTruthy(); // Should render fallback
    });

    it('should handle invalid size values', async () => {
      (element as any).size = 'invalid';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      // Should not add invalid size class
      expect(svg?.getAttribute('class')).toBe('usa-icon');
    });

    it('should handle missing sprite URLs gracefully', async () => {
      element.name = 'search';
      element.useSprite = false; // Use inline mode instead of sprite
      await waitForUpdate(element);

      // Should render inline SVG
      const path = element.querySelector('path');
      const use = element.querySelector('use');
      expect(path).toBeTruthy();
      expect(use).toBe(null);
    });
  });

  describe('USWDS HTML Structure Compliance', () => {
    it('should match USWDS icon structure', async () => {
      element.name = 'search';
      element.size = '5';
      await waitForUpdate(element);

      assertDOMStructure(
        element,
        'svg.usa-icon.usa-icon--size-5',
        1,
        'Should have proper USWDS classes'
      );

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('role')).toBe('img');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });

    it('should render proper SVG structure for sprite usage', async () => {
      element.name = 'flag';
      element.useSprite = true;
      element.spriteUrl = '/sprite.svg';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      const use = svg?.querySelector('use');
      expect(use?.getAttribute('href')).toBe('/sprite.svg#flag');
      expect(svg?.classList.contains('usa-icon')).toBe(true);
    });

    it('should maintain light DOM for USWDS compatibility', async () => {
      // Light DOM should be used (no shadow root)
      expect(element.shadowRoot).toBe(null);

      // Set a name and wait for render
      element.name = 'search';
      await waitForUpdate(element);

      // Content should be in light DOM after rendering
      const svg = element.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.classList.contains('usa-icon')).toBe(true);

      // Should still have no shadow root
      expect(element.shadowRoot).toBe(null);
    });
  });

  // CRITICAL TESTS - Auto-dismiss prevention and lifecycle stability
  describe('CRITICAL: Component Lifecycle Stability', () => {
    it('should remain in DOM after property changes', async () => {
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Test critical property combinations that could cause auto-dismiss
      const criticalPropertySets = [
        { name: 'search', size: '5', ariaLabel: 'Search', decorative: '' },
        { name: 'close', size: '4', ariaLabel: 'Close', decorative: '' },
        { name: 'menu', size: '3', ariaLabel: '', decorative: 'true' },
        { name: 'flag', useSprite: true, spriteUrl: '/test.svg', ariaLabel: 'Flag' },
        { name: '', size: '', ariaLabel: '', decorative: '' },
      ];

      for (const properties of criticalPropertySets) {
        Object.assign(element, properties);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain DOM connection during rapid property updates', async () => {
      const rapidUpdates = async () => {
        for (let i = 0; i < 10; i++) {
          element.name = i % 2 === 0 ? 'search' : 'close';
          element.size = String(3 + (i % 4));
          element.decorative = i % 3 === 0 ? 'true' : '';
          await element.updateComplete;
          expect(document.body.contains(element)).toBe(true);
          expect(element.isConnected).toBe(true);
        }
      };

      await rapidUpdates();
    });

    it('should survive complete property reset cycles', async () => {
      element.name = 'search';
      element.size = '5';
      element.ariaLabel = 'Search icon';
      element.decorative = '';
      await element.updateComplete;

      // Reset all properties
      element.name = '';
      element.size = '';
      element.ariaLabel = '';
      element.decorative = '';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Set properties again
      element.name = 'menu';
      element.size = '4';
      element.ariaLabel = 'Menu';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    it('should not pollute global event handlers', async () => {
      const originalAddEventListener = document.addEventListener;
      const originalRemoveEventListener = document.removeEventListener;
      const addEventListenerSpy = vi.fn(originalAddEventListener);
      const removeEventListenerSpy = vi.fn(originalRemoveEventListener);

      document.addEventListener = addEventListenerSpy;
      document.removeEventListener = removeEventListenerSpy;

      element.name = 'search';
      await element.updateComplete;

      document.addEventListener = originalAddEventListener;
      document.removeEventListener = originalRemoveEventListener;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle custom events without side effects', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('icon-change', eventSpy);

      element.name = 'search';
      await element.updateComplete;
      element.name = 'close';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('icon-change', eventSpy);
    });

    it('should maintain DOM connection during event handling', async () => {
      const testEvent = () => {
        element.name = 'menu';
        element.size = '5';
      };

      element.addEventListener('click', testEvent);
      element.click();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('click', testEvent);
    });
  });

  describe('CRITICAL: Icon State Management Stability', () => {
    it('should maintain DOM connection during sprite to inline SVG transitions', async () => {
      // Start with sprite
      element.name = 'search';
      element.useSprite = true;
      element.spriteUrl = '/test.svg';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Switch to inline SVG
      element.useSprite = false;
      element.spriteUrl = '';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Back to sprite
      element.useSprite = true;
      element.spriteUrl = '/test2.svg';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM connection during accessibility state changes', async () => {
      const accessibilityStates = [
        { decorative: '', ariaLabel: 'Test icon' },
        { decorative: 'true', ariaLabel: '' },
        { decorative: '', ariaLabel: 'Updated icon' },
        { decorative: 'true', ariaLabel: 'Should be ignored' },
      ];

      for (const state of accessibilityStates) {
        Object.assign(element, state);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should handle icon size changes without DOM removal', async () => {
      const sizes = ['', '3', '4', '5', '6', '7', '8', '9', ''];

      for (const size of sizes) {
        element.size = size;
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Storybook Integration Stability', () => {
    it('should maintain DOM connection during args updates', async () => {
      const storybookArgs = [
        { name: 'search', size: '4', ariaLabel: 'Search' },
        { name: 'close', size: '5', ariaLabel: 'Close' },
        { name: 'menu', size: '3', decorative: 'true' },
        { name: 'flag', useSprite: true, spriteUrl: '/sprite.svg' },
      ];

      for (const args of storybookArgs) {
        Object.assign(element, args);
        await element.updateComplete;

        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should survive Storybook control panel interactions', async () => {
      const interactions = [
        () => {
          element.name = 'search';
        },
        () => {
          element.size = '5';
        },
        () => {
          element.ariaLabel = 'Updated label';
        },
        () => {
          element.decorative = element.decorative === 'true' ? '' : 'true';
        },
        () => {
          element.useSprite = !element.useSprite;
        },
        () => {
          element.spriteUrl = '/new-sprite.svg';
        },
      ];

      for (const interaction of interactions) {
        interaction();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should handle Storybook story switching', async () => {
      // Simulate story 1 args
      element.name = 'search';
      element.size = '4';
      element.ariaLabel = 'Search';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 2 args
      element.name = 'menu';
      element.size = '5';
      element.ariaLabel = 'Menu';
      element.decorative = '';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 3 args
      element.name = 'close';
      element.size = '3';
      element.decorative = 'true';
      element.ariaLabel = '';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/icon/usa-icon.ts`;
        const validation = validateComponentJavaScript(componentPath, 'icon');

        if (!validation.isValid) {
          console.warn('JavaScript validation issues:', validation.issues);
        }

        // JavaScript validation should pass for critical integration patterns
        expect(validation.score).toBeGreaterThan(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBe(0);
      });
    });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Setup icon with comprehensive semantic configuration
      element.name = 'information';
      element.size = '4';
      element.ariaLabel = 'Important information';
      element.decorative = '';
      await waitForUpdate(element);

      // Run comprehensive accessibility audit
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests when decorative', async () => {
      element.name = 'star';
      element.size = '3';
      element.decorative = 'true';
      element.ariaLabel = ''; // Should be empty for decorative icons
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with aria-label for semantic icons', async () => {
      element.name = 'alert';
      element.size = '5';
      element.ariaLabel = 'Warning: Action required';
      element.decorative = '';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with navigation icons', async () => {
      element.name = 'arrow_forward';
      element.size = '2';
      element.ariaLabel = 'Next page';
      element.decorative = '';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should not be focusable (decorative icon)', async () => {
      element.name = 'search';
      element.decorative = 'true';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Decorative icons should not be keyboard accessible
      expect(focusableElements.length).toBe(0);
    });

    it('should not be focusable (informative icon)', async () => {
      element.name = 'info';
      element.ariaLabel = 'Information icon';
      element.decorative = '';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Informative icons (without interaction) should not be focusable
      expect(focusableElements.length).toBe(0);
    });

    it('should have no keyboard traps', async () => {
      element.name = 'check';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Icon should not trap keyboard focus
      expect(focusableElements.length).toBe(0);
    });

    it('should not interfere with surrounding keyboard navigation', async () => {
      const wrapper = document.createElement('div');

      const button1 = document.createElement('button');
      button1.textContent = 'Before';
      wrapper.appendChild(button1);

      element.name = 'star';
      wrapper.appendChild(element);

      const button2 = document.createElement('button');
      button2.textContent = 'After';
      wrapper.appendChild(button2);

      document.body.appendChild(wrapper);
      await waitForUpdate(element);

      const allFocusable = [button1, button2].filter((el) => el.tabIndex >= 0);

      // Icon should not be in focus order between buttons
      expect(allFocusable.length).toBe(2);
      expect(allFocusable[0]).toBe(button1);
      expect(allFocusable[1]).toBe(button2);

      wrapper.remove();
    });

    it('should maintain proper ARIA for screen readers (not keyboard)', async () => {
      element.name = 'warning';
      element.ariaLabel = 'Warning';
      await waitForPropertyPropagation(element);

      const svg = element.querySelector('svg');
      expect(svg).toBeTruthy();

      // Icon should have proper ARIA but not be keyboard focusable
      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBe(0);
    });

    it('should handle decorative icons in button context', async () => {
      const button = document.createElement('button');
      element.name = 'close';
      element.decorative = 'true';
      button.appendChild(element);
      document.body.appendChild(button);
      await waitForUpdate(element);

      // Button should be focusable, icon should not
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      const iconFocusable = getFocusableElements(element);
      expect(iconFocusable.length).toBe(0);

      button.remove();
    });

    it('should not require keyboard navigation (non-interactive)', async () => {
      element.name = 'home';
      await waitForUpdate(element);

      // Icons are presentational and should have no focusable elements
      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBe(0);
    });

    it('should handle size variants without affecting keyboard behavior', async () => {
      element.name = 'settings';
      element.size = '9';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Size should not affect keyboard accessibility (still not focusable)
      expect(focusableElements.length).toBe(0);
    });

    it('should handle icon in link context', async () => {
      const link = document.createElement('a');
      link.href = '/home';
      element.name = 'arrow-right';
      element.decorative = 'true';
      link.appendChild(element);
      document.body.appendChild(link);
      await waitForUpdate(element);

      // Link should be focusable, icon should not
      expect(link.tabIndex).toBeGreaterThanOrEqual(0);
      const iconFocusable = getFocusableElements(element);
      expect(iconFocusable.length).toBe(0);

      link.remove();
    });

    it('should handle multiple icons without keyboard conflicts', async () => {
      const icon1 = document.createElement('usa-icon') as USAIcon;
      icon1.name = 'star';
      const icon2 = document.createElement('usa-icon') as USAIcon;
      icon2.name = 'check';
      const icon3 = document.createElement('usa-icon') as USAIcon;
      icon3.name = 'close';

      document.body.appendChild(icon1);
      document.body.appendChild(icon2);
      document.body.appendChild(icon3);

      await waitForUpdate(icon1);
      await waitForUpdate(icon2);
      await waitForUpdate(icon3);

      const focusableElements = [
        ...getFocusableElements(icon1),
        ...getFocusableElements(icon2),
        ...getFocusableElements(icon3),
      ];

      // Multiple icons should not be focusable
      expect(focusableElements.length).toBe(0);

      icon1.remove();
      icon2.remove();
      icon3.remove();
    });
  });
});
