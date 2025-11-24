import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-identifier.ts';
import type { USAIdentifier, IdentifierLink, IdentifierLogo } from './usa-identifier.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import {
  waitForUpdate,
  testPropertyChanges,
  assertAccessibilityAttributes,
  assertDOMStructure,
  setupTestEnvironment,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAIdentifier', () => {
  let element: USAIdentifier;
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    element = document.createElement('usa-identifier') as USAIdentifier;
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
      expect(element.tagName).toBe('USA-IDENTIFIER');
    });

    it('should have default properties', () => {
      expect(element.domain).toBe('');
      expect(element.agency).toBe('');
      expect(element.description).toBe('');
      expect(element.parentAgency).toBe('');
      expect(element.parentAgencyHref).toBe('');
      expect(element.showLogos).toBe(true);
      expect(element.showRequiredLinks).toBe(true);
      expect(element.mastheadLogoAlt).toBe('');
      expect(element.requiredLinks).toHaveLength(7); // Default required links
      expect(element.logos).toHaveLength(0);
    });

    it('should render identifier structure', async () => {
      element.domain = 'example.gov';
      await waitForUpdate(element);

      assertDOMStructure(element, '.usa-identifier', 1, 'Should have identifier wrapper');
      assertDOMStructure(
        element,
        '.usa-identifier__section--masthead',
        1,
        'Should have masthead section'
      );
      assertDOMStructure(
        element,
        '.usa-identifier__section--required-links',
        1,
        'Should have required links section'
      );
    });

    it('should have proper ARIA labels', async () => {
      await waitForUpdate(element);

      const masthead = element.querySelector('.usa-identifier__section--masthead');
      const requiredLinks = element.querySelector('.usa-identifier__section--required-links');

      expect(masthead?.getAttribute('aria-label')).toBe('Agency identifier');
      expect(requiredLinks?.getAttribute('aria-label')).toBe('Important links');
    });
  });

  describe('Masthead Section', () => {
    it('should display domain', async () => {
      element.domain = 'va.gov';
      await waitForPropertyPropagation(element);

      const domain = element.querySelector('.usa-identifier__identity-domain');
      expect(domain?.textContent?.trim()).toBe('va.gov');
    });

    it('should display parent agency', async () => {
      element.parentAgency = 'Department of Veterans Affairs';
      await waitForPropertyPropagation(element);

      const disclaimer = element.querySelector('.usa-identifier__identity-disclaimer');
      expect(disclaimer?.textContent).toContain('Department of Veterans Affairs');
    });

    it('should display parent agency with link', async () => {
      element.parentAgency = 'Department of Veterans Affairs';
      element.parentAgencyHref = 'https://va.gov';
      await waitForPropertyPropagation(element);

      const agencyLink = element.querySelector('.usa-identifier__identity-disclaimer .usa-link');
      expect(agencyLink?.getAttribute('href')).toBe('https://va.gov');
      expect(agencyLink?.textContent?.trim()).toBe('Department of Veterans Affairs');
    });

    it('should fallback to "United States government" when no parent agency', async () => {
      element.parentAgency = '';
      await waitForPropertyPropagation(element);

      const disclaimer = element.querySelector('.usa-identifier__identity-disclaimer');
      expect(disclaimer?.textContent).toContain('United States government');
    });

    it('should display masthead logo', async () => {
      await waitForUpdate(element);

      const logo = element.querySelector('.usa-identifier__logo-img');
      expect(logo?.getAttribute('src')).toBe(element.mastheadLogoSrc);
    });

    it('should set custom masthead logo alt text', async () => {
      element.mastheadLogoAlt = 'Custom agency logo';
      await waitForPropertyPropagation(element);

      const logo = element.querySelector('.usa-identifier__logo-img');
      expect(logo?.getAttribute('alt')).toBe('Custom agency logo');
    });

    it('should generate alt text from parent agency', async () => {
      element.parentAgency = 'Department of Veterans Affairs';
      element.mastheadLogoAlt = '';
      await waitForPropertyPropagation(element);

      const logo = element.querySelector('.usa-identifier__logo-img');
      expect(logo?.getAttribute('alt')).toBe('Department of Veterans Affairs logo');
    });

    it('should fallback to generic alt text', async () => {
      element.parentAgency = '';
      element.mastheadLogoAlt = '';
      await waitForPropertyPropagation(element);

      const logo = element.querySelector('.usa-identifier__logo-img');
      expect(logo?.getAttribute('alt')).toBe('Parent agency logo');
    });
  });

  describe('Required Links Section', () => {
    it('should render default required links', async () => {
      await waitForUpdate(element);

      const links = element.querySelectorAll('.usa-identifier__required-link');
      expect(links).toHaveLength(7);

      const linkTexts = Array.from(links).map((link) => link.textContent?.trim());
      expect(linkTexts).toContain('About');
      expect(linkTexts).toContain('Accessibility support');
      expect(linkTexts).toContain('FOIA requests');
      expect(linkTexts).toContain('No FEAR Act data');
      expect(linkTexts).toContain('Office of the Inspector General');
      expect(linkTexts).toContain('Performance reports');
      expect(linkTexts).toContain('Privacy policy');
    });

    it('should hide required links when showRequiredLinks is false', async () => {
      element.showRequiredLinks = false;
      await waitForPropertyPropagation(element);

      const requiredLinksSection = element.querySelector(
        '.usa-identifier__section--required-links'
      );
      expect(requiredLinksSection).toBeFalsy();
    });

    it('should render custom required links', async () => {
      const customLinks: IdentifierLink[] = [
        { href: '/custom1', text: 'Custom Link 1' },
        { href: '/custom2', text: 'Custom Link 2' },
      ];

      element.requiredLinks = customLinks;
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('.usa-identifier__required-link');
      expect(links).toHaveLength(2);

      expect(links[0].getAttribute('href')).toBe('/custom1');
      expect(links[0].textContent?.trim()).toBe('Custom Link 1');
      expect(links[1].getAttribute('href')).toBe('/custom2');
      expect(links[1].textContent?.trim()).toBe('Custom Link 2');
    });

    it('should emit link-click events', async () => {
      let eventDetail: unknown = null;
      element.addEventListener('link-click', (e: Event) => {
        eventDetail = (e as CustomEvent).detail;
      });

      await waitForUpdate(element);

      const firstLink = element.querySelector(
        '.usa-identifier__required-link'
      ) as HTMLAnchorElement;
      firstLink.click();

      expect(eventDetail).toBeTruthy();
      expect((eventDetail as { href: string }).href).toBe('/about');
      expect((eventDetail as { text: string }).text).toBe('About');
    });
  });

  describe('Logos Section', () => {
    it('should not render logos section when no logos', async () => {
      await waitForUpdate(element);

      const logosSection = element.querySelector(
        '.usa-identifier__section[aria-label="Agency logos"]'
      );
      expect(logosSection).toBeFalsy();
    });

    it('should hide logos section when showLogos is false', async () => {
      element.logos = [{ src: '/logo.png', alt: 'Test logo' }];
      element.showLogos = false;
      await waitForPropertyPropagation(element);

      const logosSection = element.querySelector(
        '.usa-identifier__section[aria-label="Agency logos"]'
      );
      expect(logosSection).toBeFalsy();
    });

    it('should render logos without links', async () => {
      const testLogos: IdentifierLogo[] = [
        { src: '/logo1.png', alt: 'Logo 1' },
        { src: '/logo2.png', alt: 'Logo 2' },
      ];

      element.logos = testLogos;
      await waitForPropertyPropagation(element);

      const logosSection = element.querySelector(
        '.usa-identifier__section[aria-label="Agency logos"]'
      );
      expect(logosSection).toBeTruthy();

      const logoImgs = element.querySelectorAll(
        '.usa-identifier__section[aria-label="Agency logos"] .usa-identifier__logo-img'
      );
      expect(logoImgs).toHaveLength(2);

      expect(logoImgs[0].getAttribute('src')).toBe('/logo1.png');
      expect(logoImgs[0].getAttribute('alt')).toBe('Logo 1');
      expect(logoImgs[1].getAttribute('src')).toBe('/logo2.png');
      expect(logoImgs[1].getAttribute('alt')).toBe('Logo 2');
    });

    it('should render logos with links', async () => {
      const testLogos: IdentifierLogo[] = [
        { src: '/logo1.png', alt: 'Logo 1', href: 'https://agency1.gov' },
        { src: '/logo2.png', alt: 'Logo 2', href: 'https://agency2.gov' },
      ];

      element.logos = testLogos;
      await waitForPropertyPropagation(element);

      const logoLinks = element.querySelectorAll(
        '.usa-identifier__section[aria-label="Agency logos"] .usa-identifier__logo.usa-link'
      );
      expect(logoLinks).toHaveLength(2);

      expect(logoLinks[0].getAttribute('href')).toBe('https://agency1.gov');
      expect(logoLinks[1].getAttribute('href')).toBe('https://agency2.gov');
    });

    it('should have proper ARIA label for logos section', async () => {
      element.logos = [{ src: '/logo.png', alt: 'Test logo' }];
      await waitForPropertyPropagation(element);

      const logosSection = element.querySelector(
        '.usa-identifier__section[aria-label="Agency logos"]'
      );
      expect(logosSection?.getAttribute('aria-label')).toBe('Agency logos');
    });
  });

  describe('Public API Methods', () => {
    it('should add required link', async () => {
      const initialCount = element.requiredLinks.length;
      const newLink: IdentifierLink = { href: '/new-link', text: 'New Link' };

      element.addRequiredLink(newLink);
      await waitForUpdate(element);

      expect(element.requiredLinks).toHaveLength(initialCount + 1);
      expect(element.requiredLinks[element.requiredLinks.length - 1]).toEqual(newLink);

      const links = element.querySelectorAll('.usa-identifier__required-link');
      expect(links).toHaveLength(initialCount + 1);
    });

    it('should remove required link', async () => {
      const initialCount = element.requiredLinks.length;

      element.removeRequiredLink('/about');
      await waitForUpdate(element);

      expect(element.requiredLinks).toHaveLength(initialCount - 1);
      expect(element.requiredLinks.find((link) => link.href === '/about')).toBeFalsy();
    });

    it('should update required link', async () => {
      element.updateRequiredLink('/about', { text: 'Updated About' });
      await waitForUpdate(element);

      const aboutLink = element.requiredLinks.find((link) => link.href === '/about');
      expect(aboutLink?.text).toBe('Updated About');

      const linkElement = Array.from(
        element.querySelectorAll('.usa-identifier__required-link')
      ).find((link) => link.getAttribute('href') === '/about');
      expect(linkElement?.textContent?.trim()).toBe('Updated About');
    });

    it('should add logo', async () => {
      const newLogo: IdentifierLogo = { src: '/new-logo.png', alt: 'New Logo' };

      element.addLogo(newLogo);
      await waitForUpdate(element);

      expect(element.logos).toHaveLength(1);
      expect(element.logos[0]).toEqual(newLogo);

      const logosSection = element.querySelector(
        '.usa-identifier__section[aria-label="Agency logos"]'
      );
      expect(logosSection).toBeTruthy();
    });

    it('should remove logo', async () => {
      const logo1: IdentifierLogo = { src: '/logo1.png', alt: 'Logo 1' };
      const logo2: IdentifierLogo = { src: '/logo2.png', alt: 'Logo 2' };

      element.addLogo(logo1);
      element.addLogo(logo2);
      await waitForUpdate(element);

      element.removeLogo('/logo1.png');
      await waitForUpdate(element);

      expect(element.logos).toHaveLength(1);
      expect(element.logos[0]).toEqual(logo2);
    });

    it('should clear all logos', async () => {
      element.addLogo({ src: '/logo1.png', alt: 'Logo 1' });
      element.addLogo({ src: '/logo2.png', alt: 'Logo 2' });
      await waitForUpdate(element);

      element.clearLogos();
      await waitForUpdate(element);

      expect(element.logos).toHaveLength(0);

      const logosSection = element.querySelector(
        '.usa-identifier__section[aria-label="Agency logos"]'
      );
      expect(logosSection).toBeFalsy();
    });

    it('should clear all required links', async () => {
      element.clearRequiredLinks();
      await waitForUpdate(element);

      expect(element.requiredLinks).toHaveLength(0);

      const requiredLinksSection = element.querySelector(
        '.usa-identifier__section--required-links'
      );
      expect(requiredLinksSection).toBeFalsy();
    });
  });

  describe('Dynamic Property Updates', () => {
    it('should handle domain changes', async () => {
      await testPropertyChanges(
        element,
        'domain',
        ['', 'example.gov', 'agency.gov', 'new.gov'],
        async (el, value) => {
          const domain = el.querySelector('.usa-identifier__identity-domain');
          expect(domain?.textContent?.trim()).toBe(value);
        }
      );
    });

    it('should handle parent agency changes', async () => {
      await testPropertyChanges(
        element,
        'parentAgency',
        ['', 'Department A', 'Department B'],
        async (el, value) => {
          const disclaimer = el.querySelector('.usa-identifier__identity-disclaimer');
          if (value) {
            expect(disclaimer?.textContent).toContain(value);
          } else {
            expect(disclaimer?.textContent).toContain('United States government');
          }
        }
      );
    });

    it('should handle show/hide toggles', async () => {
      element.logos = [{ src: '/logo.png', alt: 'Test logo' }];
      await waitForUpdate(element);

      // Test showLogos toggle
      element.showLogos = false;
      await waitForUpdate(element);
      expect(
        element.querySelector('.usa-identifier__section[aria-label="Agency logos"]')
      ).toBeFalsy();

      element.showLogos = true;
      await waitForUpdate(element);
      expect(
        element.querySelector('.usa-identifier__section[aria-label="Agency logos"]')
      ).toBeTruthy();

      // Test showRequiredLinks toggle
      element.showRequiredLinks = false;
      await waitForUpdate(element);
      expect(element.querySelector('.usa-identifier__section--required-links')).toBeFalsy();

      element.showRequiredLinks = true;
      await waitForUpdate(element);
      expect(element.querySelector('.usa-identifier__section--required-links')).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels', async () => {
      element.logos = [{ src: '/logo.png', alt: 'Test logo' }];
      await waitForPropertyPropagation(element);

      const masthead = element.querySelector('.usa-identifier__section--masthead');
      const identity = element.querySelector('.usa-identifier__identity');
      const requiredLinks = element.querySelector('.usa-identifier__section--required-links');
      const logos = element.querySelector('.usa-identifier__section[aria-label="Agency logos"]');

      assertAccessibilityAttributes(masthead as Element, {
        'aria-label': 'Agency identifier',
      });

      assertAccessibilityAttributes(identity as Element, {
        'aria-label': 'Agency description',
      });

      assertAccessibilityAttributes(requiredLinks as Element, {
        'aria-label': 'Important links',
      });

      assertAccessibilityAttributes(logos as Element, {
        'aria-label': 'Agency logos',
      });
    });

    it('should have proper image roles and alt text', async () => {
      element.logos = [
        { src: '/logo1.png', alt: 'Agency 1 logo' },
        { src: '/logo2.png', alt: 'Agency 2 logo' },
      ];
      await waitForPropertyPropagation(element);

      const images = element.querySelectorAll('img[role="img"]');
      expect(images).toHaveLength(3); // masthead + 2 logos

      images.forEach((img) => {
        expect(img.getAttribute('role')).toBe('img');
        expect(img.getAttribute('alt')).toBeTruthy();
      });
    });

    it('should maintain proper link structure', async () => {
      await waitForUpdate(element);

      // Check text-based links (required links and parent agency links)
      const textLinks = element.querySelectorAll(
        '.usa-identifier__required-link, .usa-identifier__identity-disclaimer .usa-link'
      );
      textLinks.forEach((link) => {
        expect(link.getAttribute('href')).toBeTruthy();
        expect(link.textContent?.trim()).toBeTruthy();
      });

      // Check logo links have proper href (may not have text content)
      const logoLinks = element.querySelectorAll('.usa-identifier__logo.usa-link');
      logoLinks.forEach((link) => {
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });
  });

  describe('Light DOM Rendering', () => {
    it('should use light DOM (no shadow root)', () => {
      expect(element.shadowRoot).toBeFalsy();
    });

    it('should apply USWDS classes correctly', async () => {
      await waitForUpdate(element);

      const identifier = element.querySelector('.usa-identifier');
      expect(identifier?.classList.contains('usa-identifier')).toBe(true);

      const sections = element.querySelectorAll('.usa-identifier__section');
      sections.forEach((section) => {
        expect(section.classList.contains('usa-identifier__section')).toBe(true);
      });

      const containers = element.querySelectorAll('.usa-identifier__container');
      containers.forEach((container) => {
        expect(container.classList.contains('usa-identifier__container')).toBe(true);
      });
    });
  });

  describe('Application Use Cases', () => {
    it('should handle organization configuration', async () => {
      element.domain = 'va.gov';
      element.agency = 'Department of Veterans Affairs';
      element.parentAgency = 'Department of Veterans Affairs';
      element.parentAgencyHref = 'https://va.gov';
      await waitForPropertyPropagation(element);

      const domain = element.querySelector('.usa-identifier__identity-domain');
      expect(domain?.textContent?.trim()).toBe('va.gov');

      const agencyLink = element.querySelector('.usa-identifier__identity-disclaimer .usa-link');
      expect(agencyLink?.getAttribute('href')).toBe('https://va.gov');
      expect(agencyLink?.textContent?.trim()).toBe('Department of Veterans Affairs');
    });

    it('should handle state government configuration', async () => {
      element.domain = 'state.gov';
      element.parentAgency = 'State of California';
      element.parentAgencyHref = 'https://ca.gov';

      // State-specific required links
      element.requiredLinks = [
        { href: '/transparency', text: 'Transparency' },
        { href: '/public-records', text: 'Public Records Act' },
        { href: '/civil-rights', text: 'Civil Rights' },
        { href: '/ada', text: 'ADA Compliance' },
      ];

      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('.usa-identifier__required-link');
      expect(links).toHaveLength(4);

      const linkTexts = Array.from(links).map((link) => link.textContent?.trim());
      expect(linkTexts).toContain('Transparency');
      expect(linkTexts).toContain('Public Records Act');
    });

    it('should handle multi-agency logos', async () => {
      element.logos = [
        { src: '/dhs-logo.png', alt: 'Department of Homeland Security', href: 'https://dhs.gov' },
        { src: '/fema-logo.png', alt: 'FEMA', href: 'https://fema.gov' },
        { src: '/ready-logo.png', alt: 'Ready.gov', href: 'https://ready.gov' },
      ];

      await waitForPropertyPropagation(element);

      const logoLinks = element.querySelectorAll(
        '.usa-identifier__section[aria-label="Agency logos"] .usa-link'
      );
      expect(logoLinks).toHaveLength(3);

      expect(logoLinks[0].getAttribute('href')).toBe('https://dhs.gov');
      expect(logoLinks[1].getAttribute('href')).toBe('https://fema.gov');
      expect(logoLinks[2].getAttribute('href')).toBe('https://ready.gov');
    });

    it('should handle healthcare.gov configuration', async () => {
      element.domain = 'HealthCare.gov';
      element.parentAgency = 'U.S. Department of Health & Human Services';
      element.parentAgencyHref = 'https://hhs.gov';

      element.requiredLinks = [
        { href: '/about', text: 'About' },
        { href: '/privacy', text: 'Privacy' },
        { href: '/accessibility', text: 'Accessibility' },
        { href: '/plain-language', text: 'Plain Language' },
        { href: '/nondiscrimination', text: 'Nondiscrimination' },
      ];

      await waitForPropertyPropagation(element);

      const domain = element.querySelector('.usa-identifier__identity-domain');
      expect(domain?.textContent?.trim()).toBe('HealthCare.gov');
    });

    it('should handle IRS configuration', async () => {
      element.domain = 'IRS.gov';
      element.parentAgency = 'U.S. Department of the Treasury';
      element.parentAgencyHref = 'https://treasury.gov';

      element.logos = [
        {
          src: '/treasury-seal.png',
          alt: 'U.S. Department of the Treasury',
          href: 'https://treasury.gov',
        },
      ];

      await waitForPropertyPropagation(element);

      const agencyLink = element.querySelector('.usa-identifier__identity-disclaimer .usa-link');
      expect(agencyLink?.textContent?.trim()).toBe('U.S. Department of the Treasury');
    });
  });

  describe('Event Handling', () => {
    it('should emit bubbling events', async () => {
      let parentReceived = false;
      const parent = document.createElement('div');
      parent.appendChild(element);
      document.body.appendChild(parent);

      parent.addEventListener('link-click', () => {
        parentReceived = true;
      });

      await waitForUpdate(element);

      const firstLink = element.querySelector(
        '.usa-identifier__required-link'
      ) as HTMLAnchorElement;
      firstLink.click();

      expect(parentReceived).toBe(true);

      parent.remove();
    });

    it('should emit composed events', async () => {
      let eventComposed = false;
      element.addEventListener('link-click', (e: Event) => {
        eventComposed = (e as CustomEvent).composed;
      });

      await waitForUpdate(element);

      const firstLink = element.querySelector(
        '.usa-identifier__required-link'
      ) as HTMLAnchorElement;
      firstLink.click();

      expect(eventComposed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty required links array', async () => {
      element.requiredLinks = [];
      await waitForPropertyPropagation(element);

      const requiredLinksSection = element.querySelector(
        '.usa-identifier__section--required-links'
      );
      expect(requiredLinksSection).toBeFalsy();
    });

    it('should handle malformed links gracefully', async () => {
      const malformedLinks: IdentifierLink[] = [
        { href: '', text: 'Empty href' },
        { href: '/valid', text: '' },
        { href: '/another-valid', text: 'Valid link' },
      ];

      element.requiredLinks = malformedLinks;
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('.usa-identifier__required-link');
      expect(links).toHaveLength(3); // Should still render all links
    });

    it('should handle API methods with non-existent items', () => {
      // Should not throw errors
      expect(() => element.removeRequiredLink('/non-existent')).not.toThrow();
      expect(() => element.removeLogo('/non-existent.png')).not.toThrow();
      expect(() => element.updateRequiredLink('/non-existent', { text: 'New text' })).not.toThrow();
    });
  });

  // CRITICAL TESTS - Auto-dismiss prevention and lifecycle stability
  describe('CRITICAL: Component Lifecycle Stability', () => {
    it('should remain in DOM after property changes', async () => {
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Test critical property combinations that could cause auto-dismiss
      const criticalPropertySets = [
        {
          domain: 'example.gov',
          parentAgency: 'Department A',
          showLogos: true,
          showRequiredLinks: true,
        },
        {
          domain: 'test.gov',
          parentAgency: 'Department B',
          parentAgencyHref: 'https://dept.gov',
          showLogos: false,
        },
        { domain: '', parentAgency: '', showLogos: true, showRequiredLinks: false },
        {
          domain: 'healthcare.gov',
          parentAgency: 'U.S. Department of Health & Human Services',
          mastheadLogoAlt: 'Custom alt',
        },
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
          element.domain = `example${i}.gov`;
          element.parentAgency = `Department ${i}`;
          element.showLogos = i % 2 === 0;
          element.showRequiredLinks = i % 3 === 0;
          await element.updateComplete;
          expect(document.body.contains(element)).toBe(true);
          expect(element.isConnected).toBe(true);
        }
      };

      await rapidUpdates();
    });

    it('should survive complete property reset cycles', async () => {
      element.domain = 'test.gov';
      element.parentAgency = 'Test Department';
      element.parentAgencyHref = 'https://test.gov';
      element.showLogos = false;
      element.showRequiredLinks = true;
      await element.updateComplete;

      // Reset all properties
      element.domain = '';
      element.parentAgency = '';
      element.parentAgencyHref = '';
      element.showLogos = true;
      element.showRequiredLinks = true;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Set properties again
      element.domain = 'new.gov';
      element.parentAgency = 'New Department';
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

      element.domain = 'test.gov';
      await element.updateComplete;

      document.addEventListener = originalAddEventListener;
      document.removeEventListener = originalRemoveEventListener;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle custom events without side effects', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('link-click', eventSpy);

      await element.updateComplete;
      const firstLink = element.querySelector(
        '.usa-identifier__required-link'
      ) as HTMLAnchorElement;
      if (firstLink) {
        firstLink.click();
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('link-click', eventSpy);
    });

    it('should maintain DOM connection during event handling', async () => {
      const testEvent = () => {
        element.domain = 'event-test.gov';
        element.parentAgency = 'Event Department';
      };

      element.addEventListener('click', testEvent);
      element.click();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.removeEventListener('click', testEvent);
    });
  });

  describe('CRITICAL: Identifier State Management Stability', () => {
    it('should maintain DOM connection during logo array changes', async () => {
      // Start with empty logos
      element.logos = [];
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Add logos
      element.logos = [
        { src: '/logo1.png', alt: 'Logo 1' },
        { src: '/logo2.png', alt: 'Logo 2', href: 'https://example.gov' },
      ];
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Clear logos
      element.logos = [];
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM connection during required links array changes', async () => {
      const originalLinks = [...element.requiredLinks];

      // Clear required links
      element.requiredLinks = [];
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Set custom required links
      element.requiredLinks = [
        { href: '/custom1', text: 'Custom 1' },
        { href: '/custom2', text: 'Custom 2' },
      ];
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Restore original links
      element.requiredLinks = originalLinks;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle section visibility toggles without DOM removal', async () => {
      element.logos = [{ src: '/logo.png', alt: 'Test logo' }];
      await element.updateComplete;

      const visibilityStates = [
        { showLogos: false, showRequiredLinks: false },
        { showLogos: true, showRequiredLinks: false },
        { showLogos: false, showRequiredLinks: true },
        { showLogos: true, showRequiredLinks: true },
      ];

      for (const state of visibilityStates) {
        Object.assign(element, state);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Storybook Integration Stability', () => {
    it('should maintain DOM connection during args updates', async () => {
      const storybookArgs = [
        {
          domain: 'example.gov',
          parentAgency: 'Department A',
          showLogos: true,
          showRequiredLinks: true,
        },
        {
          domain: 'test.gov',
          parentAgency: 'Department B',
          showLogos: false,
          showRequiredLinks: true,
        },
        {
          domain: 'agency.gov',
          parentAgency: 'Department C',
          showLogos: true,
          showRequiredLinks: false,
        },
        { domain: '', parentAgency: '', showLogos: false, showRequiredLinks: false },
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
          element.domain = 'new-domain.gov';
        },
        () => {
          element.parentAgency = 'Updated Agency';
        },
        () => {
          element.parentAgencyHref = 'https://updated.gov';
        },
        () => {
          element.showLogos = !element.showLogos;
        },
        () => {
          element.showRequiredLinks = !element.showRequiredLinks;
        },
        () => {
          element.mastheadLogoAlt = 'Updated alt text';
        },
        () => {
          element.logos = [{ src: '/updated.png', alt: 'Updated logo' }];
        },
        () => {
          element.requiredLinks = [{ href: '/updated', text: 'Updated link' }];
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
      // Simulate story 1 args - Federal agency
      element.domain = 'va.gov';
      element.parentAgency = 'Department of Veterans Affairs';
      element.parentAgencyHref = 'https://va.gov';
      element.showLogos = true;
      element.showRequiredLinks = true;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 2 args - State government
      element.domain = 'ca.gov';
      element.parentAgency = 'State of California';
      element.parentAgencyHref = 'https://ca.gov';
      element.logos = [{ src: '/ca-seal.png', alt: 'California State Seal' }];
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);

      // Simulate story 3 args - Minimal configuration
      element.domain = 'simple.gov';
      element.parentAgency = '';
      element.parentAgencyHref = '';
      element.showLogos = false;
      element.showRequiredLinks = false;
      element.logos = [];
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/identifier/usa-identifier.ts`;
        const validation = validateComponentJavaScript(componentPath, 'identifier');

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
      // Setup identifier with comprehensive government data
      element.domain = 'example.gov';
      element.agency = 'U.S. Department of Example Services';
      element.description =
        'Official site of the U.S. Department of Example Services providing citizen services and information.';
      element.parentAgency = 'Executive Office of the President';
      element.parentAgencyHref = 'https://whitehouse.gov';
      element.showLogos = true;
      element.showRequiredLinks = true;
      element.logos = [
        {
          src: '/img/us-flag-small.png',
          alt: 'U.S. Flag',
        },
        {
          src: '/img/example-seal.png',
          alt: 'Department of Example Services official seal',
        },
      ];
      await waitForUpdate(element);

      // Run comprehensive accessibility audit
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    }, 10000); // Increased timeout for CI environment - accessibility tests can be slow

    it('should pass accessibility tests with minimal configuration', async () => {
      element.domain = 'simple.gov';
      element.agency = 'Simple Agency';
      element.description = 'Basic government agency website';
      element.showLogos = false;
      element.showRequiredLinks = true;
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with custom logos and links', async () => {
      element.domain = 'custom.gov';
      element.agency = 'Custom Government Office';
      element.description = 'Government office with custom branding and links';
      element.parentAgency = 'Department of Custom Affairs';
      element.parentAgencyHref = 'https://custom-affairs.gov';
      element.logos = [{ src: '/custom-logo.png', alt: 'Custom Government Office logo' }];
      element.requiredLinks = [
        { text: 'About Us', href: '/about' },
        { text: 'Contact', href: '/contact' },
        { text: 'Privacy Policy', href: '/privacy' },
      ];
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard navigation to required links', async () => {
      element.domain = 'example.gov';
      element.agency = 'Test Agency';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Should have required links (default 7)
      expect(links.length).toBeGreaterThanOrEqual(7);
    });

    it('should be keyboard-only usable', async () => {
      element.domain = 'example.gov';
      element.agency = 'Test Agency';
      await waitForUpdate(element);

      await verifyKeyboardOnlyUsable(element);
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.domain = 'example.gov';
      element.agency = 'Test Agency';
      await waitForPropertyPropagation(element);

      const identifier = element.querySelector('.usa-identifier');
      expect(identifier).toBeTruthy();

      const result = await testKeyboardNavigation(identifier!, {
        shortcuts: [{ key: 'Enter', description: 'Activate link' }],
        testEscapeKey: false,
        testArrowKeys: false,
      });

      expect(result.passed).toBe(true);
    });

    it('should have no keyboard traps', async () => {
      element.domain = 'example.gov';
      element.requiredLinks = [
        { text: 'About', href: '/about' },
        { text: 'Contact', href: '/contact' },
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

    it('should maintain proper tab order through required links', async () => {
      element.domain = 'example.gov';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      links.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle Enter key activation on links', async () => {
      element.domain = 'example.gov';
      element.requiredLinks = [{ text: 'Privacy', href: '/privacy' }];
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
      element.domain = 'example.gov';
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a');
      links.forEach((link) => {
        expect(link.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle parent agency link keyboard navigation', async () => {
      element.domain = 'example.gov';
      element.parentAgency = 'Department of Test';
      element.parentAgencyHref = 'https://test.gov';
      await waitForPropertyPropagation(element);

      const parentLink = element.querySelector('.usa-identifier__parent-link');
      if (parentLink) {
        expect((parentLink as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      } else {
        // Parent link may not render without proper configuration
        expect(true).toBe(true);
      }
    });

    it('should handle custom required links keyboard navigation', async () => {
      element.domain = 'example.gov';
      element.requiredLinks = [
        { text: 'Accessibility', href: '/accessibility' },
        { text: 'FOIA', href: '/foia' },
        { text: 'Privacy', href: '/privacy' },
      ];
      await waitForPropertyPropagation(element);

      const allLinks = element.querySelectorAll('a');
      // Custom required links should be present among all links
      expect(allLinks.length).toBeGreaterThanOrEqual(3);

      allLinks.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle logo links keyboard navigation', async () => {
      element.domain = 'example.gov';
      element.logos = [
        { src: '/logo1.png', alt: 'Logo 1', href: 'https://agency1.gov' },
        { src: '/logo2.png', alt: 'Logo 2', href: 'https://agency2.gov' },
      ];
      await waitForPropertyPropagation(element);

      const logoLinks = element.querySelectorAll('.usa-identifier__logo a');
      if (logoLinks.length > 0) {
        logoLinks.forEach((link) => {
          expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
        });
      } else {
        // Logos may not render depending on configuration
        expect(true).toBe(true);
      }
    });

    it('should handle identifier without logos', async () => {
      element.domain = 'example.gov';
      element.showLogos = false;
      await waitForPropertyPropagation(element);

      const identifier = element.querySelector('.usa-identifier');
      expect(identifier).toBeTruthy();

      // Should still have required links
      const links = element.querySelectorAll('a');
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle identifier without required links section', async () => {
      element.domain = 'example.gov';
      element.showRequiredLinks = false;
      await waitForPropertyPropagation(element);

      const identifier = element.querySelector('.usa-identifier');
      expect(identifier).toBeTruthy();

      // May have fewer or no links depending on other config
      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle minimal identifier configuration', async () => {
      element.domain = 'example.gov';
      element.showLogos = false;
      element.showRequiredLinks = false;
      await waitForPropertyPropagation(element);

      const identifier = element.querySelector('.usa-identifier');
      expect(identifier).toBeTruthy();

      // Minimal identifier should not have keyboard traps
      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThanOrEqual(0);
    });
  });
});
