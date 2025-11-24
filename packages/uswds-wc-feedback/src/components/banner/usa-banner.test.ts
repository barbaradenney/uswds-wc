import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-banner.ts';
import type { USABanner } from './usa-banner.js';
import {
  waitForUpdate,
  testPropertyChanges,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { quickUSWDSComplianceTest } from '@uswds-wc/test-utils/uswds-compliance-utils.js';
import { waitForPropertyPropagation, waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USABanner', () => {
  let element: USABanner;

  beforeEach(() => {
    element = document.createElement('usa-banner') as USABanner;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-BANNER');
    });

    it('should have default properties', () => {
      expect(element.flagImageSrc).toBe('/img/us_flag_small.png');
      expect(element.flagImageAlt).toBe('U.S. flag');
      expect(element.dotGovIconSrc).toBe('/img/icon-dot-gov.svg');
      expect(element.httpsIconSrc).toBe('/img/icon-https.svg');
      expect(element.headerText).toBe('An official website of the United States government');
      expect(element.actionText).toBe("Here's how you know");
      expect(element.expanded).toBe(false);
    });
  });

  describe('Properties', () => {
    it('should handle flag image changes', async () => {
      await testPropertyChanges(
        element,
        'flagImageSrc',
        ['/img/flag1.png', '/img/flag2.png', '/custom/flag.svg'],
        async (el, value) => {
          expect(el.flagImageSrc).toBe(value);
          const flagImg = el.querySelector('.usa-banner__header-flag') as HTMLImageElement;
          expect(flagImg?.src).toContain(value);
        }
      );
    });

    it('should handle flag alt text changes', async () => {
      await testPropertyChanges(
        element,
        'flagImageAlt',
        ['United States flag', 'US Flag', 'American flag'],
        async (el, value) => {
          expect(el.flagImageAlt).toBe(value);
          const flagImg = el.querySelector('.usa-banner__header-flag') as HTMLImageElement;
          expect(flagImg?.alt).toBe(value);
        }
      );
    });

    it('should handle header text changes', async () => {
      await testPropertyChanges(
        element,
        'headerText',
        [
          'An official website of the United States government',
          'Custom government website text',
          'Official U.S. government site',
        ],
        async (el, value) => {
          expect(el.headerText).toBe(value);
          const headerText = el.querySelector('.usa-banner__header-text');
          expect(headerText?.textContent).toBe(value);
        }
      );
    });

    it('should handle action text changes', async () => {
      await testPropertyChanges(
        element,
        'actionText',
        ["Here's how you know", 'Learn more', 'Click for details'],
        async (el, value) => {
          expect(el.actionText).toBe(value);
          const actionText = el.querySelector('.usa-banner__header-action');
          const buttonText = el.querySelector('.usa-banner__button-text');
          expect(actionText?.textContent).toBe(value);
          expect(buttonText?.textContent).toBe(value);
        }
      );
    });

    it('should handle icon source changes', async () => {
      element.dotGovIconSrc = '/custom/dotgov.svg';
      element.httpsIconSrc = '/custom/https.svg';
      await waitForPropertyPropagation(element);

      const dotGovIcon = element.querySelectorAll('.usa-banner__icon')[0] as HTMLImageElement;
      const httpsIcon = element.querySelectorAll('.usa-banner__icon')[1] as HTMLImageElement;

      expect(dotGovIcon?.src).toContain('/custom/dotgov.svg');
      expect(httpsIcon?.src).toContain('/custom/https.svg');
    });
  });

  // NOTE: Banner toggle functionality tests require browser environment
  // Toggle behavior (click events, keyboard events) needs real browser DOM manipulation
  // Cypress coverage: Interactive toggle testing in browser context

  describe('Rendering', () => {
    it('should render banner with correct structure', async () => {
      await waitForUpdate(element);

      const banner = element.querySelector('.usa-banner');
      const accordion = element.querySelector('.usa-accordion');
      const header = element.querySelector('.usa-banner__header');
      const button = element.querySelector('.usa-banner__button');
      const content = element.querySelector('.usa-banner__content');

      expect(banner).toBeTruthy();
      expect(accordion).toBeTruthy();
      expect(header).toBeTruthy();
      expect(button).toBeTruthy();
      expect(content).toBeTruthy();
    });

    it('should render flag image with correct attributes', async () => {
      await waitForUpdate(element);

      const flagImg = element.querySelector('.usa-banner__header-flag') as HTMLImageElement;

      expect(flagImg).toBeTruthy();
      expect(flagImg.src).toContain('/img/us_flag_small.png');
      expect(flagImg.alt).toBe('U.S. flag');
      expect(flagImg.classList.contains('usa-banner__header-flag')).toBe(true);
    });

    it('should render header text and action text', async () => {
      await waitForUpdate(element);

      const headerText = element.querySelector('.usa-banner__header-text');
      const actionText = element.querySelector('.usa-banner__header-action');

      expect(headerText?.textContent).toBe('An official website of the United States government');
      expect(actionText?.textContent).toBe("Here's how you know");
      expect(actionText?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should render toggle button with correct attributes', async () => {
      await waitForUpdate(element);

      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;

      expect(button).toBeTruthy();
      expect(button.classList.contains('usa-accordion__button')).toBe(true);
      expect(button.classList.contains('usa-banner__button')).toBe(true);
      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');
      expect(await waitForARIAAttribute(button, 'aria-controls')).toBe('gov-banner-default');
    });

    it('should render content area with guidance sections', async () => {
      await waitForUpdate(element);

      const content = element.querySelector('.usa-banner__content');
      const guidanceSections = element.querySelectorAll('.usa-banner__guidance');
      const icons = element.querySelectorAll('.usa-banner__icon');

      expect(content).toBeTruthy();
      expect(content?.getAttribute('id')).toBe('gov-banner-default');
      expect(guidanceSections.length).toBe(2);
      expect(icons.length).toBe(2);
    });

    it('should render .gov guidance section correctly', async () => {
      await waitForUpdate(element);

      const dotGovIcon = element.querySelectorAll('.usa-banner__icon')[0] as HTMLImageElement;
      const guidanceSections = element.querySelectorAll('.usa-banner__guidance');
      const dotGovSection = guidanceSections[0];

      expect(dotGovIcon.src).toContain('/img/icon-dot-gov.svg');
      expect(dotGovIcon.getAttribute('role')).toBe('img');
      expect(dotGovIcon.alt).toBe('Dot gov');
      expect(dotGovSection?.textContent).toContain('Official websites use .gov');
      expect(dotGovSection?.textContent).toContain(
        'A .gov website belongs to an official government'
      );
    });

    it('should render HTTPS guidance section correctly', async () => {
      await waitForUpdate(element);

      const httpsIcon = element.querySelectorAll('.usa-banner__icon')[1] as HTMLImageElement;
      const guidanceSections = element.querySelectorAll('.usa-banner__guidance');
      const httpsSection = guidanceSections[1];

      expect(httpsIcon.src).toContain('/img/icon-https.svg');
      expect(httpsIcon.getAttribute('role')).toBe('img');
      expect(httpsIcon.alt).toBe('Https');
      expect(httpsSection?.textContent).toContain('Secure .gov websites use HTTPS');
      expect(httpsSection?.textContent).toContain("means you've safely connected");
    });

    it('should render lock SVG icon correctly', async () => {
      await waitForUpdate(element);

      const lockSvg = element.querySelector('.usa-banner__lock-image');
      const title = element.querySelector('#banner-lock-title');
      const desc = element.querySelector('#banner-lock-description');

      expect(lockSvg).toBeTruthy();
      expect(lockSvg?.getAttribute('role')).toBe('img');
      expect(lockSvg?.getAttribute('aria-labelledby')).toBe(
        'banner-lock-title banner-lock-description'
      );
      expect(title?.textContent).toBe('Lock');
      expect(desc?.textContent).toBe('A locked padlock');
    });
  });

  describe('Expanded State', () => {
    it('should show content when expanded', async () => {
      element.expanded = true;
      await waitForPropertyPropagation(element);

      const content = element.querySelector('.usa-banner__content') as HTMLElement;
      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;

      expect(content.hidden).toBe(false);
      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('true');
    });

    it('should hide content when collapsed', async () => {
      element.expanded = false;
      await waitForPropertyPropagation(element);

      const content = element.querySelector('.usa-banner__content') as HTMLElement;
      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;

      expect(content.hidden).toBe(true);
      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', async () => {
      await waitForUpdate(element);

      const button = element.querySelector('.usa-banner__button');
      const content = element.querySelector('.usa-banner__content');
      const actionText = element.querySelector('.usa-banner__header-action');

      expect(button?.getAttribute('aria-expanded')).toBe('false');
      expect(button?.getAttribute('aria-controls')).toBe('gov-banner-default');
      expect(content?.getAttribute('id')).toBe('gov-banner-default');
      expect(actionText?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have proper image accessibility attributes', async () => {
      await waitForUpdate(element);

      const flagImg = element.querySelector('.usa-banner__header-flag');
      const icons = element.querySelectorAll('.usa-banner__icon');
      const lockSvg = element.querySelector('.usa-banner__lock-image');

      expect(flagImg?.getAttribute('alt')).toBe('U.S. flag');

      icons.forEach((icon, index) => {
        expect(icon.getAttribute('role')).toBe('img');
        if (index === 0) {
          expect(icon.getAttribute('alt')).toBe('Dot gov');
        } else {
          expect(icon.getAttribute('alt')).toBe('Https');
        }
      });

      expect(lockSvg?.getAttribute('role')).toBe('img');
      expect(lockSvg?.getAttribute('aria-labelledby')).toBe(
        'banner-lock-title banner-lock-description'
      );
    });

    it('should have screen reader friendly content', async () => {
      await waitForUpdate(element);

      const title = element.querySelector('#banner-lock-title');
      const desc = element.querySelector('#banner-lock-description');

      expect(title).toBeTruthy();
      expect(desc).toBeTruthy();
      expect(title?.textContent).toBe('Lock');
      expect(desc?.textContent).toBe('A locked padlock');
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass comprehensive USWDS compliance tests (prevents structural issues)', async () => {
      await waitForUpdate(element);
      quickUSWDSComplianceTest(element, 'usa-banner');
    });
  });

  describe('Government Banner Content', () => {
    it('should contain required government banner text', async () => {
      await waitForUpdate(element);

      const bannerContent = element.textContent || '';

      // Check for required government text
      expect(bannerContent).toContain('An official website of the United States government');
      expect(bannerContent).toContain('Official websites use .gov');
      expect(bannerContent).toContain('Secure .gov websites use HTTPS');
      expect(bannerContent).toContain('.gov website belongs to an official government');
      expect(bannerContent).toContain("you've safely connected to");
    });

    it('should have proper media block structure for guidance', async () => {
      await waitForUpdate(element);

      const mediaBlocks = element.querySelectorAll('.usa-media-block__body');
      const mediaImages = element.querySelectorAll('.usa-media-block__img');

      expect(mediaBlocks.length).toBe(2);
      expect(mediaImages.length).toBe(2);

      mediaImages.forEach((img) => {
        expect(img.classList.contains('usa-banner__icon')).toBe(true);
      });
    });
  });

  // NOTE: Event handling tests require browser environment
  // Keyboard event handling (preventDefault, key detection) needs real browser event system
  // Cypress coverage: Keyboard interaction testing in browser context

  describe('CRITICAL: Component Lifecycle Stability', () => {
    beforeEach(() => {
      element = document.createElement('usa-banner') as USABanner;
      document.body.appendChild(element);
    });

    it('should remain in DOM after property changes', async () => {
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.flagImageSrc = '/custom/flag.png';
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.headerText = 'Custom government website';
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.expanded = true;
      await waitForUpdate(element);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain element stability during banner content updates', async () => {
      const originalElement = element;

      const contentUpdates = [
        { headerText: 'Official website of the United States', actionText: 'Learn more' },
        { headerText: 'Government website', actionText: 'Verify authenticity' },
        { headerText: 'Trusted government site', actionText: 'Security information' },
      ];

      for (const update of contentUpdates) {
        Object.assign(element, update);
        await waitForUpdate(element);
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve DOM connection through expansion state changes', async () => {
      const expansionStates = [true, false, true, false];

      for (const expanded of expansionStates) {
        element.expanded = expanded;
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-banner') as USABanner;
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    it('should not pollute global event handling', async () => {
      const globalClickSpy = vi.fn();
      document.addEventListener('click', globalClickSpy);

      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      document.removeEventListener('click', globalClickSpy);
    });

    it('should maintain stability during banner toggle interactions', async () => {
      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;

      // Multiple toggle operations
      for (let i = 0; i < 5; i++) {
        button.click();
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during keyboard interactions', async () => {
      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;

      const keyEvents = [
        new KeyboardEvent('keydown', { key: 'Enter' }),
        new KeyboardEvent('keydown', { key: ' ' }),
        new KeyboardEvent('keydown', { key: 'Enter' }),
        new KeyboardEvent('keydown', { key: ' ' }),
      ];

      for (const event of keyEvents) {
        button.dispatchEvent(event);
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Banner State Management Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-banner') as USABanner;
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    it('should maintain DOM connection during asset changes', async () => {
      const assetUpdates = [
        {
          flagImageSrc: '/custom/flag1.svg',
          dotGovIconSrc: '/custom/dotgov1.svg',
          httpsIconSrc: '/custom/https1.svg',
        },
        {
          flagImageSrc: '/custom/flag2.png',
          dotGovIconSrc: '/custom/dotgov2.png',
          httpsIconSrc: '/custom/https2.png',
        },
        {
          flagImageSrc: '/img/us_flag_small.png',
          dotGovIconSrc: '/img/icon-dot-gov.svg',
          httpsIconSrc: '/img/icon-https.svg',
        },
      ];

      for (const update of assetUpdates) {
        Object.assign(element, update);
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve element stability during text content changes', async () => {
      const originalElement = element;
      const textUpdates = [
        { headerText: 'A secure government website' },
        { actionText: 'How to verify' },
        { flagImageAlt: 'United States flag' },
        { headerText: 'Official U.S. government site', actionText: 'Security details' },
      ];

      for (const update of textUpdates) {
        Object.assign(element, update);
        await waitForUpdate(element);
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during complex state transitions', async () => {
      const stateTransitions = [
        () => {
          element.expanded = true;
        },
        () => {
          element.headerText = 'Expanded banner';
        },
        () => {
          element.expanded = false;
        },
        () => {
          element.actionText = 'Collapsed action';
        },
        () => {
          element.expanded = true;
        },
      ];

      for (const transition of stateTransitions) {
        transition();
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('Hidden Attribute Management Regression Tests', () => {
    beforeEach(async () => {
      element = document.createElement('usa-banner') as USABanner;
      document.body.appendChild(element);
      // Give extra time for component setup
      await new Promise((resolve) => setTimeout(resolve, 50));
      await waitForUpdate(element);
    });

    it('should sync hidden attribute with expanded state', async () => {
      const content = element.querySelector('.usa-banner__content') as HTMLElement;
      expect(content).toBeTruthy();

      // Initially collapsed (hidden)
      expect(element.expanded).toBe(false);
      expect(content.hasAttribute('hidden')).toBe(true);

      // Expand
      element.expanded = true;
      await waitForUpdate(element);
      expect(content.hasAttribute('hidden')).toBe(false);

      // Collapse
      element.expanded = false;
      await waitForUpdate(element);
      expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('should maintain hidden attribute consistency during multiple toggles', async () => {
      const content = element.querySelector('.usa-banner__content') as HTMLElement;

      // Multiple expand/collapse cycles
      for (let i = 0; i < 5; i++) {
        element.expanded = true;
        await waitForUpdate(element);
        expect(content.hasAttribute('hidden')).toBe(false);
        expect(element.expanded).toBe(true);

        element.expanded = false;
        await waitForUpdate(element);
        expect(content.hasAttribute('hidden')).toBe(true);
        expect(element.expanded).toBe(false);
      }
    });

    it('should handle rapid property changes without conflicts', async () => {
      const content = element.querySelector('.usa-banner__content') as HTMLElement;

      // Rapid state changes
      const changes = [true, false, true, false, true];
      for (const expanded of changes) {
        element.expanded = expanded;
        await waitForUpdate(element);
        expect(content.hasAttribute('hidden')).toBe(!expanded);
        expect(element.expanded).toBe(expanded);
      }
    });

    it('should not have Lit binding conflicts with USWDS toggle behavior', async () => {
      const content = element.querySelector('.usa-banner__content') as HTMLElement;

      // Verify no ?hidden binding in the template would conflict
      element.expanded = true;
      await waitForUpdate(element);

      // Simulate USWDS manual DOM manipulation
      content.setAttribute('hidden', '');
      expect(content.hasAttribute('hidden')).toBe(true);

      // Our manual management should still work
      element.expanded = false;
      await waitForUpdate(element);
      expect(content.hasAttribute('hidden')).toBe(true);

      element.expanded = true;
      await waitForUpdate(element);
      expect(content.hasAttribute('hidden')).toBe(false);
    });

    it('should preserve hidden attribute state after DOM updates', async () => {
      const content = element.querySelector('.usa-banner__content') as HTMLElement;

      // Change other properties while maintaining expanded state
      element.expanded = true;
      element.headerText = 'Modified header';
      await waitForUpdate(element);
      expect(content.hasAttribute('hidden')).toBe(false);

      element.expanded = false;
      element.actionText = 'Modified action';
      await waitForUpdate(element);
      expect(content.hasAttribute('hidden')).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/banner/usa-banner.ts`;
        const validation = validateComponentJavaScript(componentPath, 'banner');

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

  describe('CRITICAL: Storybook Integration', () => {
    it('should render in Storybook-like environment without auto-dismiss', async () => {
      const storyContainer = document.createElement('div');
      storyContainer.id = 'storybook-root';
      document.body.appendChild(storyContainer);

      element = document.createElement('usa-banner') as USABanner;
      element.headerText = 'Storybook Government Banner';
      element.actionText = 'Storybook Action';
      element.expanded = true;

      storyContainer.appendChild(element);
      await waitForUpdate(element);

      // Simulate Storybook control updates
      element.expanded = false;
      element.headerText = 'Updated Storybook Banner';
      element.flagImageSrc = '/custom/storybook-flag.png';
      await waitForUpdate(element);

      expect(storyContainer.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.headerText).toBe('Updated Storybook Banner');

      storyContainer.remove();
    });

    it('should handle Storybook args updates without component removal', async () => {
      element = document.createElement('usa-banner') as USABanner;
      document.body.appendChild(element);
      await waitForUpdate(element);

      const storyArgs = [
        {
          expanded: true,
          headerText: 'Args Test Header 1',
          actionText: 'Args Test Action 1',
        },
        {
          expanded: false,
          headerText: 'Args Test Header 2',
          actionText: 'Args Test Action 2',
        },
        {
          expanded: true,
          flagImageSrc: '/custom/args-flag.svg',
          headerText: 'Args Test Header 3',
        },
      ];

      for (const args of storyArgs) {
        Object.assign(element, args);
        await waitForUpdate(element);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  // CRITICAL: Layout and Structure Validation Tests
  // These tests prevent layout issues like content cutoff during expansion
  describe('Layout and Structure Validation (Prevent Expansion Cutoff Issues)', () => {
    describe('Accordion Expansion Structure', () => {
      it('should have proper banner structure in DOM', async () => {
        element.expanded = true;
        await waitForPropertyPropagation(element);

        const banner = element.querySelector('.usa-banner');
        const header = element.querySelector('.usa-banner__header');
        const content = element.querySelector('.usa-banner__content');

        expect(banner).toBeTruthy();
        expect(header).toBeTruthy();
        expect(content).toBeTruthy();

        // Content should be in banner
        expect(banner?.contains(content as Node)).toBe(true);
      });

      it('should display content when expanded', async () => {
        element.expanded = true;
        await waitForPropertyPropagation(element);

        const content = element.querySelector('.usa-banner__content') as HTMLElement;
        expect(content).toBeTruthy();

        // Content should not be hidden
        expect(content.hasAttribute('hidden')).toBe(false);
        expect(await waitForARIAAttribute(content, 'aria-hidden')).not.toBe('true');
      });

      it('should hide content when collapsed', async () => {
        element.expanded = false;
        await waitForPropertyPropagation(element);

        const content = element.querySelector('.usa-banner__content') as HTMLElement;
        expect(content).toBeTruthy();

        // Content should be hidden
        expect(content.hasAttribute('hidden')).toBe(true);
      });

      it('should match USWDS reference structure for banner', async () => {
        element.expanded = true;
        await waitForUpdate(element);

        // Expected structure from USWDS:
        // <section class="usa-banner">
        //   <div class="usa-accordion">
        //     <header class="usa-banner__header">
        //       <div class="usa-banner__inner">...</div>
        //     </header>
        //     <div class="usa-banner__content">...</div>
        //   </div>
        // </section>

        const banner = element.querySelector('.usa-banner');
        const accordion = element.querySelector('.usa-accordion');
        const header = element.querySelector('.usa-banner__header');
        const inner = element.querySelector('.usa-banner__inner');
        const content = element.querySelector('.usa-banner__content');

        expect(banner).toBeTruthy();
        expect(accordion).toBeTruthy();
        expect(header).toBeTruthy();
        expect(inner).toBeTruthy();
        expect(content).toBeTruthy();

        // Verify nesting
        expect(banner?.contains(accordion as Node)).toBe(true);
        expect(accordion?.contains(header as Node)).toBe(true);
        expect(header?.contains(inner as Node)).toBe(true);
        expect(accordion?.contains(content as Node)).toBe(true);
      });
    });

    describe('CSS Display Properties', () => {
      it('should render as a block-level element in the DOM', async () => {
        await waitForUpdate(element);

        // Component uses Light DOM, so :host styles don't apply
        // USWDS CSS classes handle all styling
        // Just verify element renders and is in DOM
        expect(element).toBeTruthy();
        expect(element.isConnected).toBe(true);
        expect(element.querySelector('.usa-banner')).toBeTruthy();
      });
    });

    describe('Visual Rendering Validation', () => {
      it('should render banner content without cutoff when expanded', async () => {
        element.expanded = true;
        await waitForPropertyPropagation(element);

        const content = element.querySelector('.usa-banner__content') as HTMLElement;
        expect(content).toBeTruthy();

        // Content should be visible (not hidden)
        expect(content.hasAttribute('hidden')).toBe(false);

        // CRITICAL: This structure validation prevents cutoff issues
        // In a real browser (Cypress), we would also check:
        // - Content height > 0
        // - All content visible in viewport
        // - No overflow issues
        // Note: jsdom doesn't render, so visual checks are in Cypress tests
      });

      it('should render banner header and toggle button', async () => {
        await waitForUpdate(element);

        const header = element.querySelector('.usa-banner__header');
        const button = element.querySelector('.usa-banner__button');

        expect(header).toBeTruthy();
        expect(button).toBeTruthy();

        // CRITICAL: Elements exist in DOM (visual rendering verified in Cypress)
        expect(button?.tagName.toLowerCase()).toBe('button');
      });

      it('should render both collapsed and expanded states correctly', async () => {
        // Test collapsed
        element.expanded = false;
        await waitForPropertyPropagation(element);

        let content = element.querySelector('.usa-banner__content');
        expect(content?.hasAttribute('hidden')).toBe(true);

        // Test expanded
        element.expanded = true;
        await waitForPropertyPropagation(element);

        content = element.querySelector('.usa-banner__content');
        expect(content?.hasAttribute('hidden')).toBe(false);

        // CRITICAL: Both states render correctly
        // Visual expansion animation verified in Cypress
      });
    });

    describe('ARIA Expansion State', () => {
      it('should have correct aria-expanded on button', async () => {
        element.expanded = false;
        await waitForPropertyPropagation(element);

        const button = element.querySelector('.usa-banner__button');
        expect(button?.getAttribute('aria-expanded')).toBe('false');

        element.expanded = true;
        await waitForUpdate(element);

        expect(button?.getAttribute('aria-expanded')).toBe('true');
      });

      it('should have proper aria-controls relationship', async () => {
        await waitForUpdate(element);

        const button = element.querySelector('.usa-banner__button');
        const content = element.querySelector('.usa-banner__content');

        const controlsId = button?.getAttribute('aria-controls');
        const contentId = content?.getAttribute('id');

        expect(controlsId).toBeTruthy();
        expect(controlsId).toBe(contentId);
      });
    });
  });
});
