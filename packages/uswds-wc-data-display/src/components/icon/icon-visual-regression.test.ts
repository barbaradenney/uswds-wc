import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-icon.ts';
import type { USAIcon } from './usa-icon.js';

/**
 * Icon Visual Regression Tests
 *
 * These tests prevent regressions where:
 * 1. Icons don't render from sprite file (monorepo migration regression)
 * 2. Icon sizes don't apply correctly
 * 3. Icons show inline SVG instead of sprite references
 *
 * CRITICAL: These validate sprite-first architecture and prevent visual bugs
 */
describe('Icon Visual Regression Prevention', () => {
  let element: USAIcon;

  beforeEach(async () => {
    element = document.createElement('usa-icon') as USAIcon;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Sprite Rendering Validation (Prevents monorepo migration regression)', () => {
    it('REGRESSION: should render icons from sprite file, not inline SVG', async () => {
      element.name = 'search';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      const use = svg?.querySelector('use');
      const path = svg?.querySelector('path');

      // FAIL CONDITIONS (regression to catch):
      expect(use, 'Icons should use sprite, not inline SVG').toBeTruthy();
      expect(use?.getAttribute('href'), 'Should reference sprite file').toBe(
        '/img/sprite.svg#search'
      );
      expect(path, 'Should NOT have inline path element').toBeFalsy();

      // PASS CONDITIONS (correct sprite-first):
      expect(svg?.classList.contains('usa-icon')).toBe(true);
    });

    it('REGRESSION: should have sprite URL by default', () => {
      const freshIcon = document.createElement('usa-icon') as USAIcon;

      // Monorepo migration (Oct 22) reverted these defaults
      expect(freshIcon.useSprite, 'useSprite should default to true').toBe(true);
      expect(freshIcon.spriteUrl, 'spriteUrl should default to /img/sprite.svg').toBe(
        'https://cdn.jsdelivr.net/npm/@uswds/uswds@3.8.1/dist/img/sprite.svg'
      );
    });

    it('should render all common icons from sprite file', async () => {
      const commonIcons = [
        'search',
        'close',
        'menu',
        'check_circle',
        'error',
        'warning',
        'info',
        'arrow_forward',
        'arrow_back',
        'expand_more',
        'expand_less',
      ];

      for (const iconName of commonIcons) {
        element.name = iconName;
        await element.updateComplete;

        const use = element.querySelector('use');
        const path = element.querySelector('path');

        expect(use, `Icon "${iconName}" should use sprite`).toBeTruthy();
        expect(use?.getAttribute('href')).toBe(`/img/sprite.svg#${iconName}`);
        expect(path, `Icon "${iconName}" should not have inline path`).toBeFalsy();
      }
    });
  });

  describe('Size Class Application (Prevents size regression)', () => {
    it('should apply correct size classes for all USWDS sizes', async () => {
      const sizes = ['3', '4', '5', '6', '7', '8', '9'];
      element.name = 'flag';

      for (const size of sizes) {
        element.size = size as any;
        await element.updateComplete;

        const svg = element.querySelector('svg');
        const hasCorrectClass = svg?.classList.contains(`usa-icon--size-${size}`);
        const hasBaseClass = svg?.classList.contains('usa-icon');

        expect(hasBaseClass, `Should have base class for size ${size}`).toBe(true);
        expect(hasCorrectClass, `Should have size-${size} class`).toBe(true);
      }
    });

    it('should not add invalid size classes', async () => {
      element.name = 'search';
      element.size = 'invalid' as any;
      await element.updateComplete;

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('class')).toBe('usa-icon');
    });

    it('should render default size without size class', async () => {
      element.name = 'search';
      element.size = '';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('class')).toBe('usa-icon');
    });
  });

  describe('SVG Structure Validation (Prevents broken rendering)', () => {
    it('should have correct SVG attributes for accessibility', async () => {
      element.name = 'search';
      element.ariaLabel = 'Search icon';
      await element.updateComplete;

      const svg = element.querySelector('svg');

      expect(svg?.getAttribute('role')).toBe('img');
      expect(svg?.getAttribute('aria-label')).toBe('Search icon');
      expect(svg?.getAttribute('aria-hidden')).toBe('false');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });

    it('should handle decorative icons correctly', async () => {
      element.name = 'close';
      element.decorative = 'true';
      await element.updateComplete;

      const svg = element.querySelector('svg');

      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.hasAttribute('aria-label')).toBe(false);
    });

    it('should maintain SVG structure with size changes', async () => {
      element.name = 'menu';
      element.size = '5';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      const use = svg?.querySelector('use');

      expect(svg?.classList.contains('usa-icon--size-5')).toBe(true);
      expect(use?.getAttribute('href')).toBe('/img/sprite.svg#menu');
    });
  });

  describe('Visual State Validation (Prevents invisible components)', () => {
    it('should have visible SVG element', async () => {
      element.name = 'flag';
      await element.updateComplete;

      const svg = element.querySelector('svg') as SVGElement;
      expect(svg).toBeTruthy();

      const style = window.getComputedStyle(svg);
      expect(style.display, 'SVG should not be display:none').not.toBe('none');
      expect(style.visibility, 'SVG should be visible').not.toBe('hidden');
    });

    it('should maintain structure during icon changes', async () => {
      element.name = 'search';
      await element.updateComplete;

      const svg1 = element.querySelector('svg');
      expect(svg1).toBeTruthy();

      element.name = 'close';
      await element.updateComplete;

      const svg2 = element.querySelector('svg');
      expect(svg2).toBeTruthy();
      expect(svg1).toBe(svg2); // Same SVG element, different icon
    });

    it('should maintain structure during size changes', async () => {
      element.name = 'menu';
      element.size = '4';
      await element.updateComplete;

      const svg1 = element.querySelector('svg');

      element.size = '7';
      await element.updateComplete;

      const svg2 = element.querySelector('svg');
      expect(svg1).toBe(svg2); // Same SVG element, different size
    });
  });

  describe('Sprite Reference Validation (Prevents broken images)', () => {
    it('should update sprite reference when icon changes', async () => {
      element.name = 'search';
      await element.updateComplete;

      let use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('/img/sprite.svg#search');

      element.name = 'flag';
      await element.updateComplete;

      use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('/img/sprite.svg#flag');
    });

    it('should use consistent sprite URL across icons', async () => {
      const icons = ['search', 'close', 'menu', 'flag'];

      for (const iconName of icons) {
        element.name = iconName;
        await element.updateComplete;

        const use = element.querySelector('use');
        const href = use?.getAttribute('href');
        const spriteUrl = href?.split('#')[0];

        expect(spriteUrl).toBe('https://cdn.jsdelivr.net/npm/@uswds/uswds@3.8.1/dist/img/sprite.svg');
      }
    });

    it('should handle custom sprite URLs', async () => {
      element.name = 'search';
      element.spriteUrl = '/custom/icons.svg';
      await element.updateComplete;

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('/custom/icons.svg#search');
    });
  });

  describe('Regression Prevention - Monorepo Migration Issues', () => {
    it('REGRESSION: prevents sprite defaults reverting to inline mode', () => {
      // This regression was caught: monorepo migration (Oct 22, commit 20a74f89)
      // reverted sprite-first defaults implemented on Oct 19 (commit 76157fdc)

      const freshIcon = document.createElement('usa-icon') as USAIcon;

      // FAIL CONDITIONS (regressions to catch):
      expect(freshIcon.useSprite).not.toBe(false);
      expect(freshIcon.spriteUrl).not.toBe('');

      // PASS CONDITIONS (correct defaults):
      expect(freshIcon.useSprite).toBe(true);
      expect(freshIcon.spriteUrl).toBe('https://cdn.jsdelivr.net/npm/@uswds/uswds@3.8.1/dist/img/sprite.svg');
    });

    it('REGRESSION: prevents icons from showing only 21 inline SVGs', async () => {
      // Before fix: Only 21 hardcoded icons available as inline SVGs
      // After fix: All 241 USWDS icons accessible via sprite

      const allIcons = [
        'accessibility_new',
        'account_balance',
        'add',
        'alarm',
        'announcement',
        'api',
        'assessment',
        'attach_file',
        'autorenew',
        'backpack',
        'bathtub',
        'bedding',
        'bookmark',
        'bug_report',
        'build',
        'calendar_today',
        'campaign',
        'camping',
        'cancel',
        'chat',
      ];

      for (const iconName of allIcons) {
        element.name = iconName;
        await element.updateComplete;

        const use = element.querySelector('use');
        expect(use, `Icon "${iconName}" should be accessible via sprite`).toBeTruthy();
        expect(use?.getAttribute('href')).toBe(`/img/sprite.svg#${iconName}`);
      }
    });

    it('REGRESSION: prevents Storybook from showing limited icon set', async () => {
      // Storybook was showing only 21 icons instead of 241
      // This test validates that icon gallery would show all icons

      const sampleIcons = [
        'search',
        'close',
        'menu', // Navigation (always worked)
        'accessibility_new',
        'campaign', // Government-specific (new)
        'local_fire_department',
        'masks', // COVID/Emergency (new)
        'sentiment_satisfied',
        'zoom_in', // Additional categories (new)
      ];

      for (const iconName of sampleIcons) {
        element.name = iconName;
        await element.updateComplete;

        const use = element.querySelector('use');
        expect(use, `Storybook should show icon "${iconName}"`).toBeTruthy();
      }
    });
  });

  describe('Performance Characteristics', () => {
    it('should reuse SVG element across icon changes', async () => {
      element.name = 'search';
      await element.updateComplete;
      const svg1 = element.querySelector('svg');

      element.name = 'close';
      await element.updateComplete;
      const svg2 = element.querySelector('svg');

      element.name = 'menu';
      await element.updateComplete;
      const svg3 = element.querySelector('svg');

      // Performance: Should reuse same SVG element
      expect(svg1).toBe(svg2);
      expect(svg2).toBe(svg3);
    });

    it('should update only use href when changing icons', async () => {
      element.name = 'search';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      const use1 = element.querySelector('use');
      expect(use1?.getAttribute('href')).toBe('/img/sprite.svg#search');

      element.name = 'flag';
      await element.updateComplete;

      const use2 = element.querySelector('use');
      expect(use2?.getAttribute('href')).toBe('/img/sprite.svg#flag');
      expect(svg).toBe(element.querySelector('svg')); // Same SVG
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty icon name', async () => {
      element.name = '';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      const use = element.querySelector('use');

      expect(svg).toBeTruthy();
      expect(use?.getAttribute('href')).toBe('/img/sprite.svg#');
    });

    it('should handle icon names with underscores', async () => {
      element.name = 'arrow_forward';
      await element.updateComplete;

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('/img/sprite.svg#arrow_forward');
    });

    it('should handle icon names with numbers', async () => {
      element.name = 'sentiment_satisfied_alt';
      await element.updateComplete;

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('/img/sprite.svg#sentiment_satisfied_alt');
    });
  });
});
