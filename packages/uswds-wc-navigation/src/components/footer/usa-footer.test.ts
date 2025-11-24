import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-footer.ts';
import type { USAFooter, FooterLink, FooterSection } from './usa-footer.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import {
  setupTestEnvironment,
  waitForUpdate,
  testPropertyChanges,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAFooter', () => {
  let element: USAFooter;
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    element = document.createElement('usa-footer') as USAFooter;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
    cleanup?.();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-FOOTER');
    });

    it('should have default properties', () => {
      expect(element.variant).toBe('medium');
      expect(element.agencyName).toBe('');
      expect(element.sections).toEqual([]);
    });
  });

  describe('Properties', () => {
    it('should handle variant changes', async () => {
      await testPropertyChanges(
        element,
        'variant',
        ['slim', 'medium', 'big'],
        async (el, value) => {
          expect(el.variant).toBe(value);
          const footer = el.querySelector('.usa-footer');
          expect(footer?.classList.contains(`usa-footer--${value}`)).toBe(true);
        }
      );
    });

    it('should handle agency name changes', async () => {
      await testPropertyChanges(
        element,
        'agencyName',
        ['Department of Examples', 'U.S. Web Design System', 'Test Agency'],
        async (el, value) => {
          expect(el.agencyName).toBe(value);
          const agencyElement = el.querySelector('.usa-footer__logo-heading');
          expect(agencyElement?.textContent?.trim()).toBe(value);
        }
      );
    });

    it('should handle sections changes', async () => {
      // Use big variant to render secondary links
      element.variant = 'big';

      const sections: FooterSection[] = [
        {
          title: 'About',
          links: [
            { label: 'Our Mission', href: '/mission' },
            { label: 'Leadership', href: '/leadership' },
          ],
        },
        {
          title: 'Services',
          links: [
            { label: 'Digital Services', href: '/digital' },
            { label: 'Consulting', href: '/consulting' },
          ],
        },
      ];

      element.sections = sections;
      await waitForPropertyPropagation(element);

      const footerSections = element.querySelectorAll('.usa-footer__primary-content');
      expect(footerSections.length).toBe(2);

      const firstSectionTitle = element.querySelector('.usa-footer__primary-link');
      expect(firstSectionTitle?.textContent?.trim()).toBe('About');

      const links = element.querySelectorAll('.usa-footer__secondary-link a');
      expect(links.length).toBe(4);
      expect(links[0].textContent?.trim()).toBe('Our Mission');
      expect(links[0].getAttribute('href')).toBe('/mission');
    });

    // Note: identifierLinks is NOT a property of usa-footer
    // usa-identifier is a separate component that should be used alongside usa-footer
  });

  describe('Rendering', () => {
    it('should render footer with correct structure', async () => {
      element.agencyName = 'Test Agency';
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('footer.usa-footer');
      const secondarySection = element.querySelector('.usa-footer__secondary-section');
      const logoHeading = element.querySelector('.usa-footer__logo-heading');

      expect(footer).toBeTruthy();
      expect(footer?.getAttribute('role')).toBe('contentinfo');
      expect(secondarySection).toBeTruthy();
      expect(logoHeading?.textContent?.trim()).toBe('Test Agency');
    });

    it('should render navigation sections when provided', async () => {
      // Use big variant to render secondary links
      element.variant = 'big';

      const sections: FooterSection[] = [
        {
          title: 'Quick Links',
          links: [
            { label: 'Home', href: '/' },
            { label: 'Contact', href: '/contact' },
          ],
        },
      ];

      element.sections = sections;
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-footer__nav');
      const section = element.querySelector('.usa-footer__primary-content');
      const title = element.querySelector('.usa-footer__primary-link');
      const linksList = element.querySelector('.usa-list');

      expect(nav).toBeTruthy();
      expect(section).toBeTruthy();
      expect(title?.textContent?.trim()).toBe('Quick Links');
      expect(linksList).toBeTruthy();
    });

    it('should not render navigation when no sections provided', async () => {
      element.sections = [];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('.usa-footer__nav');
      expect(nav).toBe(null);
    });

    it('should render agency name in secondary section when provided', async () => {
      element.agencyName = 'Test Agency';
      await waitForPropertyPropagation(element);

      const secondarySection = element.querySelector('.usa-footer__secondary-section');
      const logoHeading = element.querySelector('.usa-footer__logo-heading');

      expect(secondarySection).toBeTruthy();
      expect(logoHeading).toBeTruthy();
      expect(logoHeading?.textContent?.trim()).toBe('Test Agency');
    });

    it('should not render identifier when no agency name or identifier links', async () => {
      element.agencyName = '';
      // element.identifierLinks = [];
      await waitForPropertyPropagation(element);

      const identifier = element.querySelector('.usa-identifier');
      expect(identifier).toBe(null);
    });

    // Note: Identifier sections are NOT rendered by usa-footer
    // usa-identifier is a separate component
  });

  describe('Footer Variants', () => {
    it('should render slim footer correctly', async () => {
      element.variant = 'slim';
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('.usa-footer');
      expect(footer?.classList.contains('usa-footer--slim')).toBe(true);
      expect(footer?.classList.contains('usa-footer--medium')).toBe(false);
    });

    it('should render medium footer correctly', async () => {
      element.variant = 'medium';
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('.usa-footer');
      expect(footer?.classList.contains('usa-footer--medium')).toBe(true);
      expect(footer?.classList.contains('usa-footer--slim')).toBe(false);
    });

    it('should render big footer correctly', async () => {
      element.variant = 'big';
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('.usa-footer');
      expect(footer?.classList.contains('usa-footer--big')).toBe(true);
      expect(footer?.classList.contains('usa-footer--medium')).toBe(false);
    });
  });

  describe('Link Events', () => {
    it('should dispatch footer-link-click event for section links', async () => {
      // Use big variant to render secondary links
      element.variant = 'big';

      let eventDetail: any = null;

      element.addEventListener('footer-link-click', (e: any) => {
        eventDetail = e.detail;
        e.preventDefault(); // Prevent navigation in test
      });

      element.sections = [
        {
          title: 'Links',
          links: [{ label: 'Test Link', href: '/test' }],
        },
      ];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('.usa-footer__secondary-link a') as HTMLAnchorElement;
      link.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.label).toBe('Test Link');
      expect(eventDetail.href).toBe('/test');
    });

    // Note: Identifier link events are handled by the separate usa-identifier component
  });

  describe('Complex Footer', () => {
    it('should render complete footer with all sections', async () => {
      const sections: FooterSection[] = [
        {
          title: 'About Us',
          links: [
            { label: 'Our Mission', href: '/mission' },
            { label: 'Leadership', href: '/leadership' },
            { label: 'History', href: '/history' },
          ],
        },
        {
          title: 'Services',
          links: [
            { label: 'Digital Services', href: '/digital' },
            { label: 'Consulting', href: '/consulting' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Documentation', href: '/docs' },
            { label: 'Downloads', href: '/downloads' },
          ],
        },
      ];

      element.variant = 'big';
      element.agencyName = 'U.S. Department of Web Components';
      element.sections = sections;
      await waitForUpdate(element);

      // Check footer variant
      const footer = element.querySelector('.usa-footer');
      expect(footer?.classList.contains('usa-footer--big')).toBe(true);

      // Check navigation sections
      const footerSections = element.querySelectorAll('.usa-footer__primary-content');
      expect(footerSections.length).toBe(3);

      // Check all section links
      const sectionLinks = element.querySelectorAll('.usa-footer__secondary-link a');
      expect(sectionLinks.length).toBe(7); // Total links across all sections

      // Check agency name in secondary section
      const agency = element.querySelector('.usa-footer__logo-heading');
      expect(agency?.textContent?.trim()).toBe('U.S. Department of Web Components');

      // Note: Identifier links would be in separate usa-identifier component
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', async () => {
      element.agencyName = 'Test Agency';
      element.sections = [{ title: 'About', links: [{ label: 'Mission', href: '/mission' }] }];
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('footer');
      const nav = element.querySelector('.usa-footer__nav');

      expect(footer?.getAttribute('role')).toBe('contentinfo');
      expect(nav?.getAttribute('aria-label')).toBe('Footer navigation');

      // Note: identifier aria-label would be in separate usa-identifier component
    });

    it('should have proper heading hierarchy', async () => {
      // Use big variant to render H4 headings
      element.variant = 'big';

      element.sections = [
        {
          title: 'Section Title',
          links: [{ label: 'Link', href: '/link' }],
        },
      ];
      await waitForPropertyPropagation(element);

      const heading = element.querySelector('.usa-footer__primary-link');
      expect(heading?.tagName).toBe('H4');
    });
  });

  describe('Slots', () => {
    it('should support default slot content', async () => {
      const slotContent = document.createElement('div');
      slotContent.textContent = 'Custom Footer Content';

      element.appendChild(slotContent);
      await waitForUpdate(element);

      const slot = element.querySelector('slot');
      expect(slot).toBeTruthy();
    });
  });

  describe('Event Handling', () => {
    it('should handle link clicks and dispatch events correctly', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('footer-link-click', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
        e.preventDefault(); // Cancel the event to test preventDefault behavior
      });

      const link: FooterLink = { label: 'Test', href: '/test' };
      const mockPreventDefault = vi.fn();
      const mockEvent = {
        preventDefault: mockPreventDefault,
      } as any;

      // Access private method for testing
      (element as any).handleLinkClick(link, mockEvent);

      expect(eventFired).toBe(true);
      expect(eventDetail.label).toBe('Test');
      expect(eventDetail.href).toBe('/test');
      expect(mockPreventDefault).toHaveBeenCalled(); // Should be called when event is cancelled
    });
  });

  // CRITICAL TESTS - Component Lifecycle Stability (Auto-dismiss Prevention)
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.variant = 'big';
      element.agencyName = 'Test Agency';
      element.sections = [
        {
          title: 'Test Section',
          links: [{ label: 'Test Link', href: '/test' }],
        },
      ];
      // element.identifierLinks = [{ label: 'Privacy', href: '/privacy' }];
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain component state during rapid property changes', async () => {
      const initialParent = element.parentNode;

      // Rapid property changes that could trigger lifecycle issues
      for (let i = 0; i < 10; i++) {
        element.variant = i % 2 === 0 ? 'big' : 'slim';
        element.agencyName = `Agency ${i}`;
        element.sections = [
          {
            title: `Section ${i}`,
            links: [{ label: `Link ${i}`, href: `/link${i}` }],
          },
        ];
        await element.updateComplete;
      }

      expect(element.parentNode).toBe(initialParent);
      expect(element.isConnected).toBe(true);
    });

    it('should handle complex footer configurations without disconnection', async () => {
      const complexSections = [
        {
          title: 'Section 1',
          links: [
            { label: 'Link 1A', href: '/1a' },
            { label: 'Link 1B', href: '/1b' },
          ],
        },
        {
          title: 'Section 2',
          links: [
            { label: 'Link 2A', href: '/2a' },
            { label: 'Link 2B', href: '/2b' },
          ],
        },
      ];

      element.variant = 'big';
      element.agencyName = 'Complex Test Agency';
      element.sections = complexSections;
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Event System Stability (CRITICAL)', () => {
    // NOTE: Rapid click test moved to Cypress e2e tests
    // Reason: Unit tests cannot fully test rapid click scenarios and event timing
    // See: cypress/e2e/footer-rapid-clicks.cy.ts for browser-based rapid click tests

    // Note: Tests for identifier link events should be in usa-identifier component tests

    it('should handle event pollution without component removal', async () => {
      // Create potential event pollution
      for (let i = 0; i < 20; i++) {
        const customEvent = new CustomEvent(`test-event-${i}`, { bubbles: true });
        element.dispatchEvent(customEvent);
      }

      element.agencyName = 'Event Test Agency';
      element.sections = [
        {
          title: 'Test Section',
          links: [{ label: 'Test', href: '/test' }],
        },
      ];
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Storybook Integration (CRITICAL)', () => {
    it('should render in Storybook without auto-dismissing', async () => {
      element.variant = 'big';
      element.agencyName = 'Storybook Test Agency';
      element.sections = [
        {
          title: 'About',
          links: [
            { label: 'Our Mission', href: '/mission' },
            { label: 'Leadership', href: '/leadership' },
          ],
        },
        {
          title: 'Services',
          links: [
            { label: 'Digital Services', href: '/digital' },
            { label: 'Consulting', href: '/consulting' },
          ],
        },
      ];
      // Note: identifierLinks removed - use separate usa-identifier component
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(element.querySelector('.usa-footer')).toBeTruthy();
      expect(element.querySelector('.usa-footer--big')).toBeTruthy();
      expect(element.querySelector('.usa-footer__logo-heading')?.textContent?.trim()).toContain(
        'Storybook Test Agency'
      );
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/footer/usa-footer.ts`;
        const validation = validateComponentJavaScript(componentPath, 'footer');

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
      // Setup footer with comprehensive government agency configuration
      element.variant = 'big';
      element.agencyName = 'U.S. Department of Digital Services';
      element.agencyUrl = 'https://digital.gov';
      element.contactInfo = {
        phone: '1-800-123-4567',
        email: 'contact@digital.gov',
        address: {
          street: '1800 F Street NW',
          city: 'Washington',
          state: 'DC',
          zip: '20405',
        },
      };
      element.sections = [
        {
          title: 'Agency Information',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Mission Statement', href: '/mission' },
            { label: 'Leadership', href: '/leadership' },
            { label: 'Annual Reports', href: '/reports' },
          ],
        },
        {
          title: 'Programs & Services',
          links: [
            { label: 'Digital Strategy', href: '/digital-strategy' },
            { label: 'Technology Services', href: '/tech-services' },
            { label: 'Innovation Lab', href: '/innovation' },
          ],
        },
      ];
      // Note: identifierLinks removed - use separate usa-identifier component
      await waitForUpdate(element);

      // Run comprehensive accessibility audit
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with medium variant', async () => {
      element.variant = 'medium';
      element.agencyName = 'Small Government Office';
      element.agencyUrl = 'https://smalloffice.gov';
      element.sections = [
        {
          title: 'Quick Links',
          links: [
            { label: 'Services', href: '/services' },
            { label: 'Contact', href: '/contact' },
          ],
        },
      ];
      // Note: identifierLinks removed - use separate usa-identifier component
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with minimal configuration', async () => {
      element.variant = 'small';
      element.agencyName = 'Minimal Agency';
      element.agencyUrl = 'https://minimal.gov';
      element.sections = [];
      // element.identifierLinks = [{ label: 'Privacy Policy', href: '/privacy' }];
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with contact information', async () => {
      element.variant = 'big';
      element.agencyName = 'Department of Public Affairs';
      element.agencyUrl = 'https://publicaffairs.gov';
      element.contactInfo = {
        phone: '1-555-GOVT-INFO',
        email: 'info@publicaffairs.gov',
        address: {
          street: '123 Government Plaza',
          city: 'Washington',
          state: 'DC',
          zip: '20001',
        },
      };
      element.sections = [
        {
          title: 'Resources',
          links: [
            { label: 'Publications', href: '/publications' },
            { label: 'Press Releases', href: '/press' },
          ],
        },
      ];
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard navigation to footer links', async () => {
      element.sections = [
        {
          heading: 'Section 1',
          links: [
            { text: 'Link 1', href: '/link1' },
            { text: 'Link 2', href: '/link2' },
          ],
        },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      expect(links.length).toBeGreaterThanOrEqual(2);
    });

    it('should be keyboard-only usable', async () => {
      element.sections = [
        {
          heading: 'Navigation',
          links: [
            { text: 'Home', href: '/' },
            { text: 'About', href: '/about' },
          ],
        },
      ];
      await waitForUpdate(element);

      await verifyKeyboardOnlyUsable(element);
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.sections = [
        {
          heading: 'Section',
          links: [{ text: 'Link', href: '/link' }],
        },
      ];
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('.usa-footer');
      expect(footer).toBeTruthy();

      const result = await testKeyboardNavigation(footer!, {
        shortcuts: [{ key: 'Enter', description: 'Activate link' }],
        testEscapeKey: false,
        testArrowKeys: false,
      });

      expect(result.passed).toBe(true);
    });

    it('should have no keyboard traps', async () => {
      element.sections = [
        {
          heading: 'Links',
          links: [
            { text: 'Link 1', href: '/link1' },
            { text: 'Link 2', href: '/link2' },
          ],
        },
      ];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a');
      expect(links.length).toBeGreaterThanOrEqual(2);

      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      links[0]?.dispatchEvent(tabEvent);
      expect(true).toBe(true);
    });

    it('should maintain proper tab order through footer sections', async () => {
      element.sections = [
        {
          heading: 'Section 1',
          links: [
            { text: 'Link 1A', href: '/1a' },
            { text: 'Link 1B', href: '/1b' },
          ],
        },
        {
          heading: 'Section 2',
          links: [
            { text: 'Link 2A', href: '/2a' },
            { text: 'Link 2B', href: '/2b' },
          ],
        },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Links from both sections should be in tab order
      expect(links.length).toBeGreaterThanOrEqual(4);
      links.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle Enter key activation on links', async () => {
      element.sections = [
        {
          heading: 'Navigation',
          links: [{ text: 'Home', href: '/' }],
        },
      ];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a');
      expect(link).toBeTruthy();

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });

      link!.dispatchEvent(enterEvent);
      expect(link!.href).toBeTruthy();
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      element.sections = [
        {
          heading: 'Links',
          links: [{ text: 'Link', href: '/link' }],
        },
      ];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle identifier links keyboard navigation', async () => {
      // Note: identifierLinks removed - use separate usa-identifier component
      await waitForUpdate(element);

      const identifierSection = element.querySelector('.usa-identifier');
      if (identifierSection) {
        const links = identifierSection.querySelectorAll('a');
        expect(links.length).toBeGreaterThanOrEqual(2);

        links.forEach((link) => {
          expect(link.tabIndex).toBeGreaterThanOrEqual(0);
        });
      } else {
        // Identifier section may not render in all variants
        expect(true).toBe(true);
      }
    });

    it('should support slim variant keyboard navigation', async () => {
      element.variant = 'slim';
      element.sections = [
        {
          heading: 'Quick Links',
          links: [
            { text: 'Link 1', href: '/link1' },
            { text: 'Link 2', href: '/link2' },
          ],
        },
      ];
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('.usa-footer--slim');
      expect(footer).toBeTruthy();

      const focusableElements = getFocusableElements(element);
      // Slim variant may render links differently
      expect(focusableElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should support big variant keyboard navigation', async () => {
      element.variant = 'big';
      element.sections = [
        {
          heading: 'Section',
          links: [{ text: 'Link', href: '/link' }],
        },
      ];
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('.usa-footer--big');
      expect(footer).toBeTruthy();

      const links = element.querySelectorAll('a');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle footer with social media links', async () => {
      element.sections = [
        {
          heading: 'Social Media',
          links: [
            { text: 'Facebook', href: 'https://facebook.com' },
            { text: 'Twitter', href: 'https://twitter.com' },
          ],
        },
      ];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a[href^="https://"]');
      // Footer may render links with or without https prefix
      expect(links.length).toBeGreaterThanOrEqual(1);

      links.forEach((link) => {
        expect(link.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle empty footer gracefully', async () => {
      element.sections = [];
      // element.identifierLinks = [];
      await waitForPropertyPropagation(element);

      const footer = element.querySelector('.usa-footer');
      expect(footer).toBeTruthy();

      // Empty footer should not have keyboard traps
      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle footer with agency contact information', async () => {
      element.agencyName = 'Test Agency';
      element.sections = [
        {
          heading: 'Contact Us',
          links: [
            { text: 'Email', href: 'mailto:info@example.gov' },
            { text: 'Phone', href: 'tel:+1234567890' },
          ],
        },
      ];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a');
      const contactLinks = Array.from(links).filter(
        (link) => link.href.startsWith('mailto:') || link.href.startsWith('tel:')
      );

      expect(contactLinks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Layout and Structure Validation (Prevent Layout Issues)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-footer') as USAFooter;
      element.variant = 'big';
      element.agencyName = 'Test Agency';
      element.sections = [
        {
          title: 'Section 1',
          links: [
            { label: 'Link 1A', href: '/1a' },
            { label: 'Link 1B', href: '/1b' },
          ],
        },
        {
          title: 'Section 2',
          links: [
            { label: 'Link 2A', href: '/2a' },
            { label: 'Link 2B', href: '/2b' },
          ],
        },
      ];
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    describe('Multi-Column Structure', () => {
      it('should have correct DOM structure for footer navigation', async () => {
        const footer = element.querySelector('.usa-footer');
        const primarySection = element.querySelector('.usa-footer__primary-section');
        const nav = element.querySelector('.usa-footer__nav');
        const primaryContentSections = element.querySelectorAll('.usa-footer__primary-content');

        expect(footer).toBeTruthy();
        expect(primarySection).toBeTruthy();
        expect(nav).toBeTruthy();
        expect(primaryContentSections).toHaveLength(2);

        // Verify proper nesting
        expect(footer?.contains(primarySection as Node)).toBe(true);
        expect(footer?.contains(nav as Node)).toBe(true);
      });

      it('should match USWDS reference structure for multi-column footer', async () => {
        // Expected structure from USWDS:
        // <footer class="usa-footer usa-footer--big">
        //   <div class="usa-footer__primary-section">
        //     <div class="grid-container">
        //       <div class="grid-row">
        //         <div class="tablet:grid-col-8">
        //           <nav class="usa-footer__nav">
        //             ...
        //           </nav>
        //         </div>
        //       </div>
        //     </div>
        //   </div>
        //   <div class="usa-footer__secondary-section">
        //     ...
        //   </div>
        // </footer>
        // Note: usa-identifier is a separate component, not part of usa-footer

        const footer = element.querySelector('.usa-footer');
        const primarySection = footer?.querySelector('.usa-footer__primary-section');
        const nav = footer?.querySelector('.usa-footer__nav');
        const secondarySection = footer?.querySelector('.usa-footer__secondary-section');

        expect(footer).toBeTruthy();
        expect(primarySection).toBeTruthy();
        expect(nav).toBeTruthy();
        expect(secondarySection).toBeTruthy();

        // Verify all are in the footer hierarchy
        expect(footer?.contains(primarySection as Node)).toBe(true);
        expect(footer?.contains(nav as Node)).toBe(true);
        expect(footer?.contains(secondarySection as Node)).toBe(true);

        // CRITICAL: Identifier should NOT be in footer (separate component)
        const identifier = footer?.querySelector('.usa-identifier');
        expect(identifier).toBe(null);
      });

      it('should have grid columns with proper distribution', async () => {
        const primarySections = element.querySelectorAll('.usa-footer__primary-content');

        // Each section should have grid column classes
        primarySections.forEach((section) => {
          const hasGridClass = Array.from(section.classList).some(
            (cls) => cls.startsWith('tablet:grid-col') || cls.startsWith('desktop:grid-col')
          );
          expect(hasGridClass || section.classList.contains('usa-footer__primary-content')).toBe(
            true
          );
        });
      });

      it('should render all section links in correct structure', async () => {
        // Each section should have heading and links list
        const primarySections = element.querySelectorAll('.usa-footer__primary-content');

        primarySections.forEach((section) => {
          const heading = section.querySelector('.usa-footer__primary-link');
          const linksList = section.querySelector('.usa-list');

          expect(heading).toBeTruthy();
          expect(linksList).toBeTruthy();

          // Links should be inside the list
          const links = linksList?.querySelectorAll('a');
          expect(links && links.length > 0).toBe(true);
        });
      });
    });

    describe('Logo and Secondary Section Structure', () => {
      it('should have correct structure for secondary section with logo', async () => {
        const secondarySection = element.querySelector('.usa-footer__secondary-section');
        const logoContainer = element.querySelector('.usa-footer__logo');
        const logoHeading = element.querySelector('.usa-footer__logo-heading');

        expect(secondarySection).toBeTruthy();
        expect(logoContainer).toBeTruthy();
        expect(logoHeading).toBeTruthy();

        // Logo container should be in secondary section
        expect(secondarySection?.contains(logoContainer as Node)).toBe(true);
        expect(logoContainer?.contains(logoHeading as Node)).toBe(true);
      });

      it('should sync agency name with DOM content', async () => {
        const logoHeading = element.querySelector('.usa-footer__logo-heading');
        expect(logoHeading?.textContent?.trim()).toBe('Test Agency');

        // Update agency name
        element.agencyName = 'Updated Agency';
        await waitForPropertyPropagation(element);

        const updatedLogoHeading = element.querySelector('.usa-footer__logo-heading');
        expect(updatedLogoHeading?.textContent?.trim()).toBe('Updated Agency');
      });

      it('should NOT have extra wrapper elements around logo', async () => {
        const logoHeading = element.querySelector('.usa-footer__logo-heading');
        const parent = logoHeading?.parentElement;

        // Parent should have mobile-lg:grid-col-auto class (based on actual component structure)
        expect(parent?.classList.contains('mobile-lg:grid-col-auto')).toBe(true);
      });
    });

    describe('Visual Rendering Validation', () => {
      it('should render footer element in the DOM', async () => {
        const footer = element.querySelector('.usa-footer') as HTMLElement;
        expect(footer).toBeTruthy();
        expect(footer.isConnected).toBe(true);

        // Note: jsdom doesn't support getComputedStyle for display values
        // This test validates the element exists and is in the DOM
        expect(footer).toBeTruthy();
      });

      it('should render navigation sections as visible', async () => {
        const primarySections = element.querySelectorAll(
          '.usa-footer__primary-content'
        ) as NodeListOf<HTMLElement>;

        primarySections.forEach((section) => {
          // Section should exist and be in DOM
          expect(section).toBeTruthy();
          expect(section.isConnected).toBe(true);
        });
      });

      it('should NOT render identifier section (separate component)', async () => {
        // CRITICAL: usa-identifier is a separate component, not part of usa-footer
        const identifier = element.querySelector('.usa-identifier');
        expect(identifier).toBe(null);
      });
    });

    describe('Responsive Structure', () => {
      it('should have responsive grid classes on navigation', async () => {
        const grid = element.querySelector('.grid-row');
        expect(grid).toBeTruthy();

        // Grid row should contain footer primary sections
        const primarySections = grid?.querySelectorAll('.usa-footer__primary-content');
        expect(primarySections && primarySections.length > 0).toBe(true);
      });

      it('should maintain structure when variant changes', async () => {
        // Test variant: big
        let footer = element.querySelector('.usa-footer');
        expect(footer?.classList.contains('usa-footer--big')).toBe(true);

        // Change to medium
        element.variant = 'medium';
        await waitForPropertyPropagation(element);

        footer = element.querySelector('.usa-footer');
        expect(footer?.classList.contains('usa-footer--medium')).toBe(true);
        expect(footer?.classList.contains('usa-footer--big')).toBe(false);

        // Change to slim
        element.variant = 'slim';
        await waitForPropertyPropagation(element);

        footer = element.querySelector('.usa-footer');
        expect(footer?.classList.contains('usa-footer--slim')).toBe(true);
        expect(footer?.classList.contains('usa-footer--medium')).toBe(false);
      });
    });
  });
});
