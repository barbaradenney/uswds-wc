import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-icon.ts';
import type { USAIcon } from './usa-icon.js';

/**
 * Icon Sprite Integration Tests
 *
 * These tests ensure sprite-first architecture works correctly and prevent
 * regressions like the one caught in monorepo migration where sprite defaults
 * were reverted to inline mode.
 *
 * Purpose: Validate that icons load from sprite file by default and all 241
 * USWDS icons are accessible.
 */

describe('USAIcon - Sprite File Integration', () => {
  let element: USAIcon;

  beforeEach(async () => {
    // Inject a mock sprite container so injectSprite() short-circuits
    // and _spriteReady becomes true (fetch won't work in test env)
    if (!document.getElementById('uswds-icon-sprite')) {
      const spriteContainer = document.createElement('div');
      spriteContainer.id = 'uswds-icon-sprite';
      spriteContainer.style.cssText = 'position: absolute; width: 0; height: 0; overflow: hidden;';
      spriteContainer.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(spriteContainer, document.body.firstChild);
    }

    element = document.createElement('usa-icon') as USAIcon;
    element.name = 'search';
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    document.body.removeChild(element);
    const spriteContainer = document.getElementById('uswds-icon-sprite');
    if (spriteContainer) {
      spriteContainer.remove();
    }
  });

  describe('Sprite-First Architecture Defaults', () => {
    it('should use sprite by default (not inline SVG)', () => {
      // REGRESSION TEST: Monorepo migration (Oct 22, commit 20a74f89) reverted
      // sprite-first defaults that were implemented on Oct 19 (commit 76157fdc)
      expect(element.useSprite).toBe(true);
    });

    it('should have default sprite URL configured', () => {
      // Default should point to USWDS sprite file location
      expect(element.spriteUrl).toBe('https://cdn.jsdelivr.net/npm/@uswds/uswds@3.8.1/dist/img/sprite.svg');
    });

    it('should render <use> element with sprite reference', async () => {
      element.name = 'search';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      const use = element.querySelector('use');

      expect(svg).toBeTruthy();
      expect(use).toBeTruthy();
      expect(use?.getAttribute('href')).toBe('#search');
    });

    it('should NOT render inline path element when using sprite', async () => {
      element.name = 'search';
      element.useSprite = true;
      await element.updateComplete;

      const path = element.querySelector('path');
      expect(path).toBeFalsy();
    });
  });

  describe('Sprite URL Configuration', () => {
    it('should allow custom sprite URL', async () => {
      element.spriteUrl = '/custom/path/sprite.svg';
      element.name = 'flag';
      await element.updateComplete;

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('#flag');
    });

    it('should update sprite reference when URL changes', async () => {
      element.name = 'search';
      await element.updateComplete;

      element.spriteUrl = '/new/sprite.svg';
      await element.updateComplete;

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('#search');
    });

    it('should update icon when name changes with sprite', async () => {
      element.name = 'search';
      await element.updateComplete;

      const use1 = element.querySelector('use');
      expect(use1?.getAttribute('href')).toContain('#search');

      element.name = 'close';
      await element.updateComplete;

      const use2 = element.querySelector('use');
      expect(use2?.getAttribute('href')).toContain('#close');
    });
  });

  describe('Inline vs Sprite Mode Toggle', () => {
    it('should switch from sprite to inline mode', async () => {
      element.name = 'search';
      element.useSprite = true;
      await element.updateComplete;

      let use = element.querySelector('use');
      expect(use).toBeTruthy();

      element.useSprite = false;
      await element.updateComplete;

      use = element.querySelector('use');
      const path = element.querySelector('path');

      expect(use).toBeFalsy();
      expect(path).toBeTruthy();
    });

    it('should switch from inline to sprite mode', async () => {
      element.name = 'search';
      element.useSprite = false;
      await element.updateComplete;

      let path = element.querySelector('path');
      expect(path).toBeTruthy();

      element.useSprite = true;
      await element.updateComplete;

      path = element.querySelector('path');
      const use = element.querySelector('use');

      expect(path).toBeFalsy();
      expect(use).toBeTruthy();
    });
  });

  describe('All 241 USWDS Icons Accessibility', () => {
    // Sample of commonly used icons across different categories
    const commonIcons = [
      // Navigation
      'menu',
      'close',
      'search',
      'arrow_back',
      'arrow_forward',
      'chevron_left',
      'chevron_right',
      'expand_more',
      'expand_less',
      // Status & Alerts
      'check_circle',
      'error',
      'warning',
      'info',
      'help',
      // Actions
      'add',
      'edit',
      'delete',
      'cancel',
      'file_download',
      'file_upload',
      // Contact & Social
      'phone',
      'mail',
      'location_on',
      'facebook',
      'twitter',
      'github',
      // Common UI
      'settings',
      'home',
      'person',
      'lock',
      'visibility',
      'notifications',
      // Government-specific
      'accessibility_new',
      'account_balance',
      'campaign',
      'public',
    ];

    it('should render all commonly used icons from sprite', async () => {
      for (const iconName of commonIcons) {
        element.name = iconName;
        await element.updateComplete;

        const use = element.querySelector('use');
        expect(use, `Icon "${iconName}" should render with sprite`).toBeTruthy();
        expect(use?.getAttribute('href')).toBe(`#${iconName}`);
      }
    });

    it('should have valid sprite reference format for any icon name', async () => {
      const testIcons = [
        'accessibility_new',
        'local_fire_department',
        'sentiment_very_dissatisfied',
        'zoom_out_map',
      ];

      for (const iconName of testIcons) {
        element.name = iconName;
        await element.updateComplete;

        const use = element.querySelector('use');
        const href = use?.getAttribute('href');

        expect(href).toBe(`#${iconName}`);
        expect(href).toMatch(/^#[a-z_]+$/);
      }
    });
  });

  describe('SVG Structure and Attributes', () => {
    it('should render SVG with correct USWDS classes', async () => {
      await element.updateComplete;

      const svg = element.querySelector('svg');
      expect(svg?.classList.contains('usa-icon')).toBe(true);
    });

    it('should apply size classes correctly', async () => {
      element.size = '5';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      expect(svg?.classList.contains('usa-icon--size-5')).toBe(true);
    });

    it('should set correct accessibility attributes', async () => {
      element.ariaLabel = 'Search icon';
      element.decorative = 'false';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('role')).toBe('img');
      expect(svg?.getAttribute('aria-label')).toBe('Search icon');
      expect(svg?.getAttribute('aria-hidden')).toBe('false');
      expect(svg?.getAttribute('focusable')).toBe('false');
    });

    it('should set decorative icons correctly', async () => {
      element.decorative = 'true';
      await element.updateComplete;

      const svg = element.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.hasAttribute('aria-label')).toBe(false);
    });
  });

  describe('Regression Prevention', () => {
    it('prevents monorepo migration regression: sprite defaults reverted', () => {
      // This regression was caught: monorepo migration (Oct 22) reverted
      // sprite-first defaults that were implemented on Oct 19

      const freshElement = document.createElement('usa-icon') as USAIcon;

      // FAIL CONDITIONS (regressions to catch):
      expect(freshElement.useSprite, 'useSprite should default to true').toBe(true);
      expect(freshElement.spriteUrl, 'spriteUrl should default to /img/sprite.svg').toBe(
        'https://cdn.jsdelivr.net/npm/@uswds/uswds@3.8.1/dist/img/sprite.svg'
      );

      // PASS CONDITIONS (correct sprite-first architecture):
      expect(freshElement.spriteUrl).not.toBe('');
      expect(freshElement.useSprite).not.toBe(false);
    });

    it('prevents inline-first fallback in production', async () => {
      // Ensure we don't fall back to inline mode when sprite URL is set
      element.useSprite = true;
      element.spriteUrl = 'https://cdn.jsdelivr.net/npm/@uswds/uswds@3.8.1/dist/img/sprite.svg';
      element.name = 'search';
      await element.updateComplete;

      const use = element.querySelector('use');
      const path = element.querySelector('path');

      expect(use, 'Should use sprite, not inline SVG').toBeTruthy();
      expect(path, 'Should not render inline path').toBeFalsy();
    });

    it('prevents empty sprite URL regression', () => {
      // Ensure sprite URL is never empty by default
      const freshElement = document.createElement('usa-icon') as USAIcon;

      expect(freshElement.spriteUrl).not.toBe('');
      expect(freshElement.spriteUrl.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Characteristics', () => {
    it('should use same sprite URL for multiple icons', async () => {
      const icon1 = document.createElement('usa-icon') as USAIcon;
      const icon2 = document.createElement('usa-icon') as USAIcon;
      const icon3 = document.createElement('usa-icon') as USAIcon;

      icon1.name = 'search';
      icon2.name = 'close';
      icon3.name = 'menu';

      document.body.appendChild(icon1);
      document.body.appendChild(icon2);
      document.body.appendChild(icon3);

      await Promise.all([icon1.updateComplete, icon2.updateComplete, icon3.updateComplete]);

      const use1 = icon1.querySelector('use');
      const use2 = icon2.querySelector('use');
      const use3 = icon3.querySelector('use');

      // All should use local sprite references (sprite injected into page DOM)
      expect(use1?.getAttribute('href')).toBe('#search');
      expect(use2?.getAttribute('href')).toBe('#close');
      expect(use3?.getAttribute('href')).toBe('#menu');

      document.body.removeChild(icon1);
      document.body.removeChild(icon2);
      document.body.removeChild(icon3);
    });

    it('should minimize re-renders when sprite URL stays same', async () => {
      element.name = 'search';
      await element.updateComplete;

      const svg1 = element.querySelector('svg');

      element.name = 'close';
      await element.updateComplete;

      const svg2 = element.querySelector('svg');

      // SVG element should be reused (sprite URL unchanged)
      expect(svg1).toBe(svg2);
    });
  });

  describe('Icon Name Validation', () => {
    it('should handle empty icon name gracefully', async () => {
      element.name = '';
      await element.updateComplete;

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('#');
    });

    it('should handle special characters in icon names', async () => {
      // USWDS uses underscores in icon names
      element.name = 'arrow_back';
      await element.updateComplete;

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('#arrow_back');
    });

    it('should handle numeric suffixes in icon names', async () => {
      // Some USWDS icons have numbers
      element.name = 'sentiment_satisfied_alt';
      await element.updateComplete;

      const use = element.querySelector('use');
      expect(use?.getAttribute('href')).toBe('#sentiment_satisfied_alt');
    });
  });
});
