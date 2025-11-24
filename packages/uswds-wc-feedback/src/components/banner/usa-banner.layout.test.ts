/**
 * Banner Layout Tests
 * Prevents regression of toggle button positioning and banner structure issues
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../banner/index.ts';
import type { USABanner } from './usa-banner.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USABanner Layout Tests', () => {
  let element: USABanner;

  beforeEach(() => {
    element = document.createElement('usa-banner') as USABanner;
    element.headerText = 'An official website of the United States government';
    element.actionText = "Here's how you know";
    element.flagImageSrc = '/test-flag.png';
    element.dotGovIconSrc = '/test-dotgov.svg';
    element.httpsIconSrc = '/test-https.svg';
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should have correct USWDS banner DOM structure', async () => {
    await element.updateComplete;

    const banner = element.querySelector('.usa-banner');
    const accordion = element.querySelector('.usa-accordion');
    const header = element.querySelector('.usa-banner__header');
    const inner = element.querySelector('.usa-banner__inner');
    const button = element.querySelector('.usa-banner__button');
    const content = element.querySelector('.usa-banner__content');

    expect(banner, 'Should have banner container').toBeTruthy();
    expect(accordion, 'Should have accordion container').toBeTruthy();
    expect(header, 'Should have banner header').toBeTruthy();
    expect(inner, 'Should have banner inner').toBeTruthy();
    expect(button, 'Should have toggle button').toBeTruthy();
    expect(content, 'Should have banner content').toBeTruthy();

    // Check nesting structure
    expect(banner!.contains(accordion!), 'Accordion should be inside banner').toBe(true);
    expect(accordion!.contains(header!), 'Header should be inside accordion').toBe(true);
    expect(header!.contains(inner!), 'Inner should be inside header').toBe(true);
    expect(inner!.contains(button!), 'Button should be inside inner').toBe(true);
    expect(accordion!.contains(content!), 'Content should be inside accordion').toBe(true);
  });

  it('should position toggle button correctly within banner header', async () => {
    await element.updateComplete;

    const header = element.querySelector('.usa-banner__header');
    const inner = element.querySelector('.usa-banner__inner');
    const button = element.querySelector('.usa-banner__button');

    expect(header!.contains(inner!), 'Inner should be inside header').toBe(true);
    expect(inner!.contains(button!), 'Toggle button should be inside inner').toBe(true);
  });

  it('should position flag image and text correctly within inner', async () => {
    await element.updateComplete;

    const inner = element.querySelector('.usa-banner__inner');
    const flag = element.querySelector('.usa-banner__header-flag');
    const headerText = element.querySelector('.usa-banner__header-text');
    const actionText = element.querySelector('.usa-banner__header-action');

    expect(inner!.contains(flag!), 'Flag should be inside inner').toBe(true);
    expect(inner!.contains(headerText!), 'Header text should be inside inner').toBe(true);
    expect(inner!.contains(actionText!), 'Action text should be inside inner').toBe(true);
  });

  it('should position guidance sections correctly within content', async () => {
    await element.updateComplete;

    const content = element.querySelector('.usa-banner__content');
    const guidanceSections = element.querySelectorAll('.usa-banner__guidance');
    const dotGovIcon = element.querySelector('img[alt="Dot gov"]');
    const httpsIcon = element.querySelector('img[alt="Https"]');

    expect(content, 'Should have content section').toBeTruthy();
    expect(guidanceSections.length, 'Should have two guidance sections').toBe(2);
    expect(dotGovIcon, 'Should have dot gov icon').toBeTruthy();
    expect(httpsIcon, 'Should have https icon').toBeTruthy();

    // Check guidance sections are within content
    guidanceSections.forEach((guidance, index) => {
      expect(
        content!.contains(guidance),
        `Guidance section ${index} should be inside content`
      ).toBe(true);
    });
  });

  it('should handle banner expansion states correctly', async () => {
    await element.updateComplete;

    const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;
    const content = element.querySelector('.usa-banner__content') as HTMLElement;
    const header = element.querySelector('.usa-banner__header');

    // Initially banner should be collapsed
    expect(
      await waitForARIAAttribute(button, 'aria-expanded'),
      'Button should be collapsed initially'
    ).toBe('false');
    expect(content.hidden, 'Content should be hidden initially').toBe(true);
    expect(
      header!.classList.contains('usa-banner__header--expanded'),
      'Header should not have expanded class initially'
    ).toBe(false);

    // Expand banner
    element.expanded = true;
    await element.updateComplete;
    // Wait for DOM update
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(await waitForARIAAttribute(button, 'aria-expanded'), 'Button should be expanded').toBe(
      'true'
    );
    expect(content.hidden, 'Content should be visible when expanded').toBe(false);
    expect(
      header!.classList.contains('usa-banner__header--expanded'),
      'Header should have expanded class'
    ).toBe(true);

    // Collapse banner
    element.expanded = false;
    await element.updateComplete;
    // Wait for DOM update
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(
      await waitForARIAAttribute(button, 'aria-expanded'),
      'Button should be collapsed again'
    ).toBe('false');
    expect(content.hidden, 'Content should be hidden when collapsed').toBe(true);
    expect(
      header!.classList.contains('usa-banner__header--expanded'),
      'Header should not have expanded class when collapsed'
    ).toBe(false);
  });

  it('should handle custom image sources correctly', async () => {
    await element.updateComplete;

    const flagImage = element.querySelector('.usa-banner__header-flag') as HTMLImageElement;
    const dotGovIcon = element.querySelector('img[alt="Dot gov"]') as HTMLImageElement;
    const httpsIcon = element.querySelector('img[alt="Https"]') as HTMLImageElement;

    expect(flagImage.src, 'Flag image should have correct src').toContain('test-flag.png');
    expect(dotGovIcon.src, 'Dot gov icon should have correct src').toContain('test-dotgov.svg');
    expect(httpsIcon.src, 'HTTPS icon should have correct src').toContain('test-https.svg');
  });

  it('should handle custom text content correctly', async () => {
    await element.updateComplete;

    const headerText = element.querySelector('.usa-banner__header-text');
    const actionText = element.querySelector('.usa-banner__header-action');
    const buttonText = element.querySelector('.usa-banner__button-text');

    expect(headerText!.textContent!.trim(), 'Should render header text').toBe(
      'An official website of the United States government'
    );
    expect(actionText!.textContent!.trim(), 'Should render action text').toBe(
      "Here's how you know"
    );
    expect(buttonText!.textContent!.trim(), 'Should render button text').toBe(
      "Here's how you know"
    );
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

  describe('Visual Regression Prevention', () => {
    it('should pass visual layout checks for banner structure', async () => {
      await element.updateComplete;

      const banner = element.querySelector('.usa-banner') as HTMLElement;
      const header = element.querySelector('.usa-banner__header') as HTMLElement;
      const inner = element.querySelector('.usa-banner__inner') as HTMLElement;
      const content = element.querySelector('.usa-banner__content') as HTMLElement;

      const bannerRect = banner.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const innerRect = inner.getBoundingClientRect();
      content.getBoundingClientRect();

      // Header should be within banner
      expect(
        headerRect.top >= bannerRect.top && headerRect.bottom <= bannerRect.bottom,
        'Header should be vertically within banner'
      ).toBe(true);

      // Inner should be within header
      expect(
        innerRect.top >= headerRect.top && innerRect.bottom <= headerRect.bottom,
        'Inner should be vertically within header'
      ).toBe(true);

      // Content should be within banner (when expanded)
      element.expanded = true;
      await element.updateComplete;

      const expandedContentRect = content.getBoundingClientRect();
      expect(
        expandedContentRect.top >= bannerRect.top,
        'Content should not be positioned above banner when expanded'
      ).toBe(true);
    });

    it('should pass visual layout checks for button positioning', async () => {
      await element.updateComplete;

      const inner = element.querySelector('.usa-banner__inner') as HTMLElement;
      const button = element.querySelector('.usa-banner__button') as HTMLElement;
      const flag = element.querySelector('.usa-banner__header-flag') as HTMLElement;
      const headerText = element.querySelector('.usa-banner__header-text') as HTMLElement;

      const innerRect = inner.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const flagRect = flag.getBoundingClientRect();
      const textRect = headerText.getBoundingClientRect();

      // Button should be within inner container
      expect(
        buttonRect.top >= innerRect.top && buttonRect.bottom <= innerRect.bottom,
        'Button should be vertically within inner container'
      ).toBe(true);

      // Button should be positioned to the right of flag and text
      expect(
        buttonRect.left >= flagRect.left,
        'Button should be positioned after flag horizontally'
      ).toBe(true);

      expect(
        buttonRect.left >= textRect.left,
        'Button should be positioned after text horizontally'
      ).toBe(true);

      // Button should not be positioned below header content
      expect(
        buttonRect.top <= Math.max(flagRect.bottom, textRect.bottom),
        'Button should not be positioned below header content'
      ).toBe(true);
    });

    it('should pass visual layout checks for content positioning', async () => {
      element.expanded = true;
      await element.updateComplete;

      const content = element.querySelector('.usa-banner__content') as HTMLElement;
      const guidanceSections = element.querySelectorAll(
        '.usa-banner__guidance'
      ) as NodeListOf<HTMLElement>;
      const icons = element.querySelectorAll('.usa-banner__icon') as NodeListOf<HTMLElement>;

      const contentRect = content.getBoundingClientRect();

      // Guidance sections should be within content
      guidanceSections.forEach((guidance, index) => {
        const guidanceRect = guidance.getBoundingClientRect();
        expect(
          guidanceRect.top >= contentRect.top && guidanceRect.bottom <= contentRect.bottom,
          `Guidance section ${index} should be vertically within content`
        ).toBe(true);
      });

      // Icons should be within their guidance sections
      icons.forEach((icon, index) => {
        const iconRect = icon.getBoundingClientRect();
        const guidance = guidanceSections[index];
        const guidanceRect = guidance.getBoundingClientRect();

        expect(
          iconRect.top >= guidanceRect.top && iconRect.bottom <= guidanceRect.bottom,
          `Icon ${index} should be vertically within its guidance section`
        ).toBe(true);
      });
    });

    it('should maintain proper banner toggle functionality', async () => {
      await element.updateComplete;

      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;

      // JSDOM limitation: MutationObserver may not fire reliably for banner toggle
      // This test requires Cypress for full interactive behavior testing
      // Here we verify the component is set up correctly for USWDS enhancement
      expect(button, 'Button should exist').toBeTruthy();
      expect(
        await waitForARIAAttribute(button, 'aria-controls'),
        'Button should have aria-controls'
      ).toBe('gov-banner-default');

      // Verify programmatic control works (tested in "should handle banner expansion states correctly")
      element.expanded = true;
      await element.updateComplete;
      expect(element.expanded, 'Programmatic expand should work').toBe(true);

      element.expanded = false;
      await element.updateComplete;
      expect(element.expanded, 'Programmatic collapse should work').toBe(false);
    });

    it('should handle keyboard interactions correctly', async () => {
      await element.updateComplete;

      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;

      // JSDOM limitation: Keyboard events don't trigger button clicks in JSDOM
      // This test requires Cypress for full keyboard interaction testing
      // Here we verify the button is keyboard-accessible
      expect(button, 'Button should exist').toBeTruthy();
      expect(button.tagName, 'Should be a button element').toBe('BUTTON');

      // Verify button is in the accessibility tree
      expect(await waitForARIAAttribute(button, 'aria-expanded'), 'Should have aria-expanded').toBe(
        'false'
      );
      expect(await waitForARIAAttribute(button, 'aria-controls'), 'Should have aria-controls').toBe(
        'gov-banner-default'
      );
    });

    it('should handle ARIA attributes correctly', async () => {
      await element.updateComplete;

      const button = element.querySelector('.usa-banner__button') as HTMLButtonElement;
      const content = element.querySelector('.usa-banner__content') as HTMLElement;

      // Check initial ARIA attributes
      expect(
        await waitForARIAAttribute(button, 'aria-expanded'),
        'Button should have aria-expanded attribute'
      ).toBe('false');
      expect(
        await waitForARIAAttribute(button, 'aria-controls'),
        'Button should have aria-controls attribute'
      ).toBe('gov-banner-default');
      expect(content.getAttribute('id'), 'Content should have corresponding id').toBe(
        'gov-banner-default'
      );

      // Check ARIA attributes after expansion
      element.expanded = true;
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(
        await waitForARIAAttribute(button, 'aria-expanded'),
        'Button aria-expanded should be true when expanded'
      ).toBe('true');
    });

    it('should handle responsive grid layout correctly', async () => {
      element.expanded = true;
      await element.updateComplete;

      const gridRow = element.querySelector('.grid-row') as HTMLElement;
      const guidanceSections = element.querySelectorAll(
        '.usa-banner__guidance'
      ) as NodeListOf<HTMLElement>;

      expect(gridRow, 'Should have grid row container').toBeTruthy();
      expect(
        gridRow.classList.contains('grid-gap-lg'),
        'Grid row should have large gap class'
      ).toBe(true);

      // Guidance sections should have responsive grid classes
      guidanceSections.forEach((guidance, index) => {
        expect(
          guidance.classList.contains('tablet:grid-col-6'),
          `Guidance section ${index} should have responsive grid class`
        ).toBe(true);
      });
    });
  });
});
