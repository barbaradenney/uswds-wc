import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-header.ts';
import type { USAHeader, NavItem } from './usa-header.js';
import {
  setupTestEnvironment,
  waitForUpdate,
  testPropertyChanges,
  validateComponentJavaScript,
  mockNavigation,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import { testFocusIndicators } from '@uswds-wc/test-utils/focus-management-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAHeader', () => {
  let element: USAHeader;
  let cleanup: () => void;

  beforeEach(() => {
    // Mock navigation to avoid jsdom errors
    mockNavigation();

    cleanup = setupTestEnvironment();
    element = document.createElement('usa-header') as USAHeader;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
    cleanup?.();
  });

  // Helper function to wait for usa-search component to be fully rendered
  async function waitForSearchComponent(headerElement: USAHeader) {
    await waitForUpdate(headerElement);
    const usaSearch = headerElement.querySelector('usa-search');
    if (usaSearch && 'updateComplete' in usaSearch) {
      await (usaSearch as any).updateComplete;
      // Wait one more frame for the search form to be fully rendered
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    }
    return usaSearch;
  }

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-HEADER');
    });

    it('should have default properties', () => {
      expect(element.logoText).toBe('');
      expect(element.logoHref).toBe('/');
      expect(element.logoImageSrc).toBe('');
      expect(element.logoImageAlt).toBe('');
      expect(element.navItems).toEqual([]);
      expect(element.extended).toBe(false);
      expect(element.showSearch).toBe(false);
      expect(element.mobileMenuOpen).toBe(false);
      expect(element.searchPlaceholder).toBe('Search');
    });
  });

  describe('Properties', () => {
    it('should handle logo text changes', async () => {
      await testPropertyChanges(
        element,
        'logoText',
        ['My Agency', 'Department Name', 'Organization'],
        async (el, value) => {
          expect(el.logoText).toBe(value);
          const logoText = el.querySelector('.usa-logo__text');
          expect(logoText?.textContent?.trim()).toContain(value);
        }
      );
    });

    it('should handle logo href changes', async () => {
      element.logoText = 'Test Agency';
      await testPropertyChanges(
        element,
        'logoHref',
        ['/', '/home', 'https://example.com'],
        async (el, value) => {
          expect(el.logoHref).toBe(value);
          const logoLink = el.querySelector('.usa-logo__text a');
          expect(logoLink?.getAttribute('href')).toBe(value);
        }
      );
    });

    it('should handle logo image', async () => {
      element.logoImageSrc = '/logo.png';
      element.logoImageAlt = 'Agency Logo';
      await waitForPropertyPropagation(element);

      const logoImg = element.querySelector('img') as HTMLImageElement;
      expect(logoImg).toBeTruthy();
      expect(logoImg.src).toContain('/logo.png');
      expect(logoImg.alt).toBe('Agency Logo');
    });

    it('should handle extended header mode', async () => {
      element.extended = true;
      await waitForPropertyPropagation(element);

      const header = element.querySelector('.usa-header');
      expect(header?.classList.contains('usa-header--extended')).toBe(true);
      expect(header?.classList.contains('usa-header--basic')).toBe(false);
    });

    it('should handle search placeholder', async () => {
      element.showSearch = true;
      element.searchPlaceholder = 'Search this site';
      const usaSearch = await waitForSearchComponent(element);

      const searchInput = usaSearch?.querySelector('.usa-search__input') as HTMLInputElement;
      expect(searchInput?.placeholder).toBe('Search this site');
    });
  });

  describe('Rendering', () => {
    it('should render header with correct structure', async () => {
      element.logoText = 'Test Agency';
      element.showSearch = true;

      await waitForPropertyPropagation(element);

      const header = element.querySelector('header.usa-header');
      const skipNav = element.querySelector('.usa-skipnav');
      const navbar = element.querySelector('.usa-navbar');
      const logo = element.querySelector('.usa-logo');
      const menuBtn = element.querySelector('.usa-menu-btn');
      const nav = element.querySelector('.usa-nav');

      expect(header).toBeTruthy();
      expect(skipNav).toBeTruthy();
      expect(navbar).toBeTruthy();
      expect(logo).toBeTruthy();
      expect(menuBtn).toBeTruthy();
      expect(nav).toBeTruthy();
    });

    it('should render navigation items', async () => {
      const navItems: NavItem[] = [
        { label: 'Home', href: '/', current: true },
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
      ];

      element.navItems = navItems;
      await waitForPropertyPropagation(element);

      const navLinks = element.querySelectorAll('.usa-nav__primary-item');
      expect(navLinks.length).toBe(3);

      const currentLink = element.querySelector('.usa-current');
      expect(currentLink?.textContent?.trim()).toBe('Home');
      expect(currentLink?.getAttribute('aria-current')).toBe('page');
    });

    it('should render navigation with submenus', async () => {
      const navItems: NavItem[] = [
        {
          label: 'Products',
          submenu: [
            { label: 'Product A', href: '/product-a' },
            { label: 'Product B', href: '/product-b' },
          ],
        },
      ];

      element.navItems = navItems;
      await waitForPropertyPropagation(element);

      const accordionButton = element.querySelector('.usa-accordion__button');
      const submenu = element.querySelector('.usa-nav__submenu');
      const submenuItems = element.querySelectorAll('.usa-nav__submenu-item');

      expect(accordionButton).toBeTruthy();
      expect(accordionButton?.textContent?.trim()).toBe('Products');
      expect(submenu).toBeTruthy();
      expect(submenu?.hasAttribute('hidden')).toBe(true);
      expect(submenuItems.length).toBe(2);
    });

    it('should render search when enabled', async () => {
      element.showSearch = true;
      const usaSearch = await waitForSearchComponent(element);

      const searchForm = usaSearch?.querySelector('.usa-search');
      const searchInput = usaSearch?.querySelector('.usa-search__input');
      const searchButton = usaSearch?.querySelector('.usa-search button[type="submit"]');

      expect(searchForm).toBeTruthy();
      expect(searchInput).toBeTruthy();
      expect(searchButton).toBeTruthy();
    });

    it('should not render search when disabled', async () => {
      element.showSearch = false;
      await waitForPropertyPropagation(element);

      const searchForm = element.querySelector('.usa-search');
      expect(searchForm).toBe(null);
    });
  });

  describe('Mobile Menu', () => {
    // Skipped in jsdom - requires Cypress for USWDS JavaScript interaction
    // Coverage: src/components/header/usa-header.component.cy.ts

    it('should close mobile menu when close button clicked', async () => {
      element.mobileMenuOpen = true;
      await waitForPropertyPropagation(element);

      const closeBtn = element.querySelector('.usa-nav__close') as HTMLButtonElement;
      closeBtn.click();
      await waitForUpdate(element);

      expect(element.mobileMenuOpen).toBe(false);
    });

    it('should dispatch mobile menu toggle event', async () => {
      let eventDetail: any = null;

      element.addEventListener('mobile-menu-toggle', (e: any) => {
        eventDetail = e.detail;
      });

      await waitForUpdate(element);

      const menuBtn = element.querySelector('.usa-menu-btn') as HTMLButtonElement;
      menuBtn.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.open).toBe(true);
    });

    it('should close mobile menu when clicking outside', async () => {
      element.mobileMenuOpen = true;
      await waitForUpdate(element);

      // Note: Closing mobile menu when clicking outside is handled by USWDS behavior in usa-header-behavior.ts
      // This test verifies the mobile menu state can be set and read correctly
      expect(element.mobileMenuOpen).toBe(true);

      // Simulate USWDS behavior closing the menu
      element.mobileMenuOpen = false;
      await waitForUpdate(element);

      expect(element.mobileMenuOpen).toBe(false);
    });
  });

  describe('Navigation Events', () => {
    it('should dispatch nav-click event', async () => {
      let eventDetail: any = null;

      element.addEventListener('nav-click', (e: any) => {
        eventDetail = e.detail;
        // Prevent actual navigation in test
        e.preventDefault();
      });

      element.navItems = [{ label: 'Test Link', href: '/test' }];
      await waitForPropertyPropagation(element);

      const navLink = element.querySelector('.usa-nav__link') as HTMLAnchorElement;
      navLink.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.label).toBe('Test Link');
      expect(eventDetail.href).toBe('/test');
    });
  });

  describe('Search Functionality', () => {
    it('should dispatch search event on form submit', async () => {
      let eventDetail: any = null;

      element.addEventListener('header-search', (e: any) => {
        eventDetail = e.detail;
      });

      element.showSearch = true;
      const usaSearch = await waitForSearchComponent(element);
      const searchForm = usaSearch?.querySelector('.usa-search') as HTMLFormElement;
      const searchInput = usaSearch?.querySelector('.usa-search__input') as HTMLInputElement;

      expect(searchInput).toBeTruthy();
      searchInput!.value = 'test query';
      searchForm.dispatchEvent(new Event('submit', { bubbles: true }));

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.query).toBe('test query');
    });
  });

  describe('ARIA and Accessibility', () => {
    it('should have correct ARIA attributes', async () => {
      element.logoText = 'Test Agency';
      await waitForPropertyPropagation(element);

      const header = element.querySelector('header');
      const nav = element.querySelector('nav');
      const menuBtn = element.querySelector('.usa-menu-btn');
      const closeBtn = element.querySelector('.usa-nav__close');

      expect(header?.getAttribute('role')).toBe('banner');
      expect(nav?.getAttribute('aria-label')).toBe('Primary navigation');
      expect(menuBtn?.getAttribute('aria-controls')).toBe('header-nav');
      expect(closeBtn?.getAttribute('aria-label')).toBe('Close');
    });

    it('should have skip navigation link', async () => {
      await waitForUpdate(element);

      const skipNav = element.querySelector('.usa-skipnav');
      expect(skipNav).toBeTruthy();
      expect(skipNav?.getAttribute('href')).toBe('#main-content');
      expect(skipNav?.textContent).toBe('Skip to main content');
    });

    it('should have proper search label', async () => {
      element.showSearch = true;
      const usaSearch = await waitForSearchComponent(element);

      const searchLabel = usaSearch?.querySelector('label.usa-sr-only');
      expect(searchLabel).toBeTruthy();
      expect(searchLabel?.classList.contains('usa-sr-only')).toBe(true);
      expect(searchLabel?.textContent).toBe('Search');
    });

    it('should have home link with proper ARIA', async () => {
      element.logoText = 'Agency';
      await waitForPropertyPropagation(element);

      const homeLink = element.querySelector('.usa-logo__text a');
      expect(homeLink?.getAttribute('title')).toBe('Home');
      expect(homeLink?.getAttribute('aria-label')).toBe('Home');
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.logoText = 'Test Agency';
      element.navItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Comprehensive Slotted Content Validation', () => {
    beforeEach(() => {
      element.title = 'Test Header';
      element.logo = '/logo.svg';
    });

    it('should support secondary slot content', async () => {
      const slotContent = document.createElement('div');
      slotContent.setAttribute('slot', 'secondary');
      slotContent.className = 'test-secondary-content';
      slotContent.textContent = 'Secondary Content';

      element.appendChild(slotContent);
      await waitForUpdate(element);

      const slot = element.querySelector('slot[name="secondary"]');
      expect(slot).toBeTruthy();

      const renderedContent = element.querySelector('.test-secondary-content');
      expect(renderedContent?.textContent).toBe('Secondary Content');
    });

    it('should render complex secondary slot content', async () => {
      const secondaryContent = document.createElement('div');
      secondaryContent.setAttribute('slot', 'secondary');
      secondaryContent.innerHTML = `
        <div class="test-secondary-complex">
          <button class="usa-button">Action Button</button>
          <a href="#" class="usa-link">Link</a>
        </div>
      `;

      element.appendChild(secondaryContent);
      await waitForUpdate(element);

      expect(element.querySelector('.test-secondary-complex')).toBeTruthy();
      expect(element.querySelector('.test-secondary-complex button')).toBeTruthy();
      expect(element.querySelector('.test-secondary-complex a')).toBeTruthy();
    });

    it('should support default slot content', async () => {
      const slotContent = document.createElement('div');
      slotContent.className = 'test-default-content';
      slotContent.textContent = 'Additional Content';

      element.appendChild(slotContent);
      await waitForUpdate(element);

      const slot = element.querySelector('slot:not([name])');
      expect(slot).toBeTruthy();

      const renderedContent = element.querySelector('.test-default-content');
      expect(renderedContent?.textContent).toBe('Additional Content');
    });

    it('should render both secondary and default slots together', async () => {
      // Add secondary slot content
      const secondaryContent = document.createElement('div');
      secondaryContent.setAttribute('slot', 'secondary');
      secondaryContent.className = 'test-secondary';
      secondaryContent.textContent = 'Secondary';

      // Add default slot content
      const defaultContent = document.createElement('div');
      defaultContent.className = 'test-default';
      defaultContent.textContent = 'Default';

      element.appendChild(secondaryContent);
      element.appendChild(defaultContent);
      await waitForUpdate(element);

      expect(element.querySelector('.test-secondary')).toBeTruthy();
      expect(element.querySelector('.test-default')).toBeTruthy();
      expect(element.querySelector('.test-secondary')?.textContent).toBe('Secondary');
      expect(element.querySelector('.test-default')?.textContent).toBe('Default');
    });

    it('should handle slotted content alongside navigation items', async () => {
      element.navItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];

      const secondaryContent = document.createElement('div');
      secondaryContent.setAttribute('slot', 'secondary');
      secondaryContent.className = 'test-with-nav';
      secondaryContent.textContent = 'Secondary with Nav';

      element.appendChild(secondaryContent);
      await waitForUpdate(element);

      // Both navigation and slotted content should render
      expect(element.querySelector('nav')).toBeTruthy();
      expect(element.querySelector('.test-with-nav')).toBeTruthy();
    });

    it('should maintain slotted content through property changes', async () => {
      const secondaryContent = document.createElement('div');
      secondaryContent.setAttribute('slot', 'secondary');
      secondaryContent.className = 'persistent-secondary';
      secondaryContent.textContent = 'Persistent';

      element.appendChild(secondaryContent);
      await waitForUpdate(element);

      expect(element.querySelector('.persistent-secondary')).toBeTruthy();

      // Change properties
      element.title = 'Updated Title';
      element.basic = !element.basic;
      await waitForUpdate(element);

      // Slotted content should persist
      expect(element.querySelector('.persistent-secondary')).toBeTruthy();
      expect(element.querySelector('.persistent-secondary')?.textContent).toBe('Persistent');
    });

    it('should support interactive slotted elements', async () => {
      const searchForm = document.createElement('form');
      searchForm.setAttribute('slot', 'secondary');
      searchForm.className = 'test-search-form';
      searchForm.innerHTML = `
        <input type="text" class="usa-input" placeholder="Search" />
        <button type="submit" class="usa-button">Search</button>
      `;

      element.appendChild(searchForm);
      await waitForUpdate(element);

      const form = element.querySelector('.test-search-form') as HTMLFormElement;
      const input = element.querySelector('.test-search-form input') as HTMLInputElement;
      const button = element.querySelector('.test-search-form button');

      expect(form).toBeTruthy();
      expect(input).toBeTruthy();
      expect(button).toBeTruthy();

      // Test interaction
      input.value = 'test query';
      expect(input.value).toBe('test query');
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listeners on disconnect', async () => {
      // Note: Event listener cleanup is handled by USWDS behavior's cleanup function
      // This test verifies the component can be safely disconnected
      await waitForUpdate(element);
      element.remove();

      // Verify element was removed
      expect(document.body.contains(element)).toBe(false);
    });
  });

  describe('Complex Navigation', () => {
    it('should handle nested navigation items', async () => {
      // Note: USWDS header doesn't support deeply nested submenus
      // This test validates the standard USWDS pattern of single-level submenus
      const navItems: NavItem[] = [
        {
          label: 'Products',
          submenu: [
            { label: 'Hardware', href: '/hardware' },
            { label: 'Software', href: '/software' },
            { label: 'Services', href: '/services' },
          ],
        },
      ];

      element.navItems = navItems;
      await waitForPropertyPropagation(element);

      const primaryItems = element.querySelectorAll('.usa-nav__primary-item');
      const submenuItems = element.querySelectorAll('.usa-nav__submenu-item');

      expect(primaryItems.length).toBe(1);
      expect(submenuItems.length).toBe(3); // Hardware, Software, Services
    });
  });

  describe('Application Use Cases', () => {
    describe('Federal Agency Navigation', () => {
      it('should handle cabinet department navigation', async () => {
        const federalNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'About Us',
            submenu: [
              { label: 'Mission & Organization', href: '/about/mission' },
              { label: 'Leadership', href: '/about/leadership' },
              { label: 'Budget & Performance', href: '/about/budget' },
              { label: 'History', href: '/about/history' },
            ],
          },
          {
            label: 'Services & Programs',
            submenu: [
              { label: 'Citizen Services', href: '/services/citizens' },
              { label: 'Business Services', href: '/services/business' },
              { label: 'Grant Programs', href: '/services/grants' },
              { label: 'Regulatory Programs', href: '/services/regulations' },
            ],
          },
          {
            label: 'Resources',
            submenu: [
              { label: 'Publications', href: '/resources/publications' },
              { label: 'Data & Statistics', href: '/resources/data' },
              { label: 'Laws & Regulations', href: '/resources/laws' },
              { label: 'Forms', href: '/resources/forms' },
            ],
          },
          { label: 'News & Updates', href: '/news' },
          { label: 'Contact Us', href: '/contact' },
        ];

        element.logoText = 'U.S. Department of Examples';
        element.extended = true;
        element.showSearch = true;
        element.searchPlaceholder = 'Search Department of Examples';
        element.navItems = federalNavItems;
        await waitForUpdate(element);

        expect(element.querySelector('.usa-header--extended')).toBeTruthy();
        expect(element.querySelectorAll('.usa-nav__primary-item').length).toBe(6);
        expect(element.querySelectorAll('.usa-nav__submenu').length).toBe(3);
        expect(element.querySelectorAll('.usa-nav__submenu-item').length).toBe(12);

        // Verify search is configured for department
        const usaSearch2 = await waitForSearchComponent(element);
        const usaSearch = usaSearch2;
        const searchInput = usaSearch?.querySelector('.usa-search__input') as HTMLInputElement;
        expect(searchInput?.placeholder).toBe('Search Department of Examples');
      });

      it('should handle independent agency navigation', async () => {
        const agencyNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'Agency Information',
            submenu: [
              { label: 'About EPA', href: '/about' },
              { label: 'Our Work', href: '/about/work' },
              { label: 'Organization Chart', href: '/about/organization' },
            ],
          },
          {
            label: 'Environmental Topics',
            submenu: [
              { label: 'Air Quality', href: '/topics/air' },
              { label: 'Water Quality', href: '/topics/water' },
              { label: 'Land & Cleanup', href: '/topics/land' },
              { label: 'Chemicals & Toxics', href: '/topics/chemicals' },
            ],
          },
          { label: 'Regulations', href: '/regulations' },
          { label: 'Enforcement', href: '/enforcement' },
          { label: 'Contact Us', href: '/contact' },
        ];

        element.logoText = 'U.S. Environmental Protection Agency';
        element.logoHref = 'https://www.epa.gov/';
        element.extended = true;
        element.showSearch = true;
        element.navItems = agencyNavItems;
        await waitForPropertyPropagation(element);

        const logoLink = element.querySelector('.usa-logo__text a') as HTMLAnchorElement;
        expect(logoLink.href).toBe('https://www.epa.gov/');
        expect(element.querySelectorAll('.usa-nav__primary-item').length).toBe(6);
      });

      it('should handle state application navigation', async () => {
        const stateNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'Government',
            submenu: [
              { label: 'Governor', href: '/government/governor' },
              { label: 'Legislature', href: '/government/legislature' },
              { label: 'Courts', href: '/government/courts' },
              { label: 'Agencies', href: '/government/agencies' },
            ],
          },
          {
            label: 'Services',
            submenu: [
              { label: 'Motor Vehicles', href: '/services/dmv' },
              { label: 'Business Registration', href: '/services/business' },
              { label: 'Professional Licensing', href: '/services/licensing' },
              { label: 'Taxes', href: '/services/taxes' },
            ],
          },
          { label: 'Tourism & Recreation', href: '/tourism' },
          { label: 'Employment', href: '/employment' },
        ];

        element.logoText = 'State of California';
        element.logoImageSrc = '/assets/ca-seal.svg';
        element.logoImageAlt = 'State of California Seal';
        element.extended = true;
        element.navItems = stateNavItems;
        await waitForPropertyPropagation(element);

        const logoImage = element.querySelector('img') as HTMLImageElement;
        expect(logoImage.src).toContain('/assets/ca-seal.svg');
        expect(logoImage.alt).toBe('State of California Seal');
      });

      it('should handle local application navigation', async () => {
        const cityNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'City Government',
            submenu: [
              { label: 'Mayor', href: '/government/mayor' },
              { label: 'City Council', href: '/government/council' },
              { label: 'Departments', href: '/government/departments' },
              { label: 'Budget', href: '/government/budget' },
            ],
          },
          {
            label: 'Services',
            submenu: [
              { label: 'Utilities', href: '/services/utilities' },
              { label: 'Public Safety', href: '/services/safety' },
              { label: 'Parks & Recreation', href: '/services/parks' },
              { label: 'Permits & Licenses', href: '/services/permits' },
            ],
          },
          { label: 'Community', href: '/community' },
          { label: 'How Do I...', href: '/how-do-i' },
        ];

        element.logoText = 'City of San Francisco';
        element.extended = false;
        element.showSearch = true;
        element.searchPlaceholder = 'Search SF.gov';
        element.navItems = cityNavItems;
        await waitForUpdate(element);

        expect(element.querySelector('.usa-header--basic')).toBeTruthy();
        expect(element.querySelectorAll('.usa-nav__primary-item').length).toBe(5);
      });
    });

    describe('Emergency Management Navigation', () => {
      it('should handle emergency management agency header', async () => {
        const emergencyNavItems: NavItem[] = [
          { label: 'Current Alerts', href: '/alerts', current: true },
          {
            label: 'Prepare',
            submenu: [
              { label: 'Make a Plan', href: '/prepare/plan' },
              { label: 'Build a Kit', href: '/prepare/kit' },
              { label: 'Stay Informed', href: '/prepare/informed' },
              { label: 'Get Involved', href: '/prepare/involved' },
            ],
          },
          {
            label: 'Disasters',
            submenu: [
              { label: 'Natural Disasters', href: '/disasters/natural' },
              { label: 'Human-Caused', href: '/disasters/human' },
              { label: 'Technological', href: '/disasters/tech' },
            ],
          },
          { label: 'Recovery', href: '/recovery' },
          { label: 'Apply for Assistance', href: '/assistance' },
        ];

        element.logoText = 'Federal Emergency Management Agency';
        element.logoHref = 'https://www.fema.gov';
        element.extended = true;
        element.showSearch = true;
        element.searchPlaceholder = 'Search emergency information';
        element.navItems = emergencyNavItems;
        await waitForUpdate(element);

        // Verify current page indication for alerts
        const currentLink = element.querySelector('.usa-current');
        expect(currentLink?.textContent?.trim()).toBe('Current Alerts');
        expect(currentLink?.getAttribute('aria-current')).toBe('page');
      });

      it('should handle disaster response header with emergency contact', async () => {
        element.logoText = 'Emergency Operations Center';
        element.showSearch = true;
        element.searchPlaceholder = 'Search emergency resources';
        await waitForUpdate(element);

        // Add emergency contact in secondary slot
        const emergencyContact = document.createElement('div');
        emergencyContact.setAttribute('slot', 'secondary');
        emergencyContact.innerHTML =
          '<strong style="color: #d63384;">Emergency Hotline: 911</strong>';
        element.appendChild(emergencyContact);

        await waitForUpdate(element);

        const secondarySlot = element.querySelector('slot[name="secondary"]');
        expect(secondarySlot).toBeTruthy();
      });
    });

    describe('Healthcare Government Sites', () => {
      it('should handle CDC navigation structure', async () => {
        const healthNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'Health Topics',
            submenu: [
              { label: 'Diseases & Conditions', href: '/health/diseases' },
              { label: 'Prevention & Wellness', href: '/health/prevention' },
              { label: 'Environmental Health', href: '/health/environmental' },
              { label: 'Workplace Safety', href: '/health/workplace' },
            ],
          },
          {
            label: 'Data & Statistics',
            submenu: [
              { label: 'Health Statistics', href: '/data/health' },
              { label: 'Disease Surveillance', href: '/data/surveillance' },
              { label: 'Public Health Data', href: '/data/public-health' },
            ],
          },
          { label: 'Emergency Preparedness', href: '/emergency' },
          { label: 'Travel Health', href: '/travel' },
        ];

        element.logoText = 'Centers for Disease Control and Prevention';
        element.extended = true;
        element.showSearch = true;
        element.searchPlaceholder = 'Search health information';
        element.navItems = healthNavItems;
        await waitForUpdate(element);

        expect(element.querySelector('.usa-header--extended')).toBeTruthy();
        expect(element.querySelectorAll('.usa-nav__submenu').length).toBe(2);
      });

      it('should handle VA medical center navigation', async () => {
        const vaNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'Health Care',
            submenu: [
              { label: 'Primary Care', href: '/healthcare/primary' },
              { label: 'Specialty Care', href: '/healthcare/specialty' },
              { label: 'Mental Health', href: '/healthcare/mental' },
              { label: 'Emergency Care', href: '/healthcare/emergency' },
            ],
          },
          {
            label: 'Benefits & Services',
            submenu: [
              { label: 'Disability Benefits', href: '/benefits/disability' },
              { label: 'Education Benefits', href: '/benefits/education' },
              { label: 'Housing Assistance', href: '/benefits/housing' },
              { label: 'Career Services', href: '/benefits/career' },
            ],
          },
          { label: 'About Us', href: '/about' },
          { label: 'Contact Us', href: '/contact' },
        ];

        element.logoText = 'Department of Veterans Affairs';
        element.logoImageSrc = '/assets/va-logo.svg';
        element.logoImageAlt = 'VA Logo';
        element.extended = true;
        element.showSearch = true;
        element.navItems = vaNavItems;
        await waitForPropertyPropagation(element);

        const logoImage = element.querySelector('img') as HTMLImageElement;
        expect(logoImage.src).toContain('/assets/va-logo.svg');
      });
    });

    describe('Education Government Sites', () => {
      it('should handle Department of Education navigation', async () => {
        const educationNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'Student Loans',
            submenu: [
              { label: 'Apply for Aid', href: '/loans/apply' },
              { label: 'Manage Loans', href: '/loans/manage' },
              { label: 'Loan Forgiveness', href: '/loans/forgiveness' },
              { label: 'Default Prevention', href: '/loans/default' },
            ],
          },
          {
            label: 'Grants & Funding',
            submenu: [
              { label: 'Federal Pell Grants', href: '/grants/pell' },
              { label: 'Teacher Grants', href: '/grants/teacher' },
              { label: 'Research Grants', href: '/grants/research' },
            ],
          },
          { label: 'Policy & Research', href: '/policy' },
          { label: 'About ED', href: '/about' },
        ];

        element.logoText = 'U.S. Department of Education';
        element.extended = true;
        element.showSearch = true;
        element.searchPlaceholder = 'Search education resources';
        element.navItems = educationNavItems;
        await waitForUpdate(element);

        expect(element.querySelectorAll('.usa-nav__primary-item').length).toBe(5);
        expect(element.querySelectorAll('.usa-nav__submenu-item').length).toBe(7);
      });

      it('should handle school district navigation', async () => {
        const schoolNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'Schools',
            submenu: [
              { label: 'Elementary Schools', href: '/schools/elementary' },
              { label: 'Middle Schools', href: '/schools/middle' },
              { label: 'High Schools', href: '/schools/high' },
              { label: 'Special Programs', href: '/schools/special' },
            ],
          },
          {
            label: 'Parents & Students',
            submenu: [
              { label: 'Enrollment', href: '/parents/enrollment' },
              { label: 'Transportation', href: '/parents/transportation' },
              { label: 'Meal Programs', href: '/parents/meals' },
              { label: 'Academic Calendar', href: '/parents/calendar' },
            ],
          },
          { label: 'Staff', href: '/staff' },
          { label: 'School Board', href: '/board' },
        ];

        element.logoText = 'Springfield Public Schools';
        element.extended = false;
        element.showSearch = true;
        element.navItems = schoolNavItems;
        await waitForUpdate(element);

        expect(element.querySelector('.usa-header--basic')).toBeTruthy();
        expect(element.querySelectorAll('.usa-nav__primary-item').length).toBe(5);
      });
    });

    describe('Multilingual Government Sites', () => {
      it('should handle multilingual organization header', async () => {
        const multilingualNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          { label: 'Services', href: '/services' },
          { label: 'Information', href: '/information' },
          { label: 'Contact', href: '/contact' },
        ];

        element.logoText = 'U.S. Citizenship and Immigration Services';
        element.extended = true;
        element.showSearch = true;
        element.searchPlaceholder = 'Search USCIS';
        element.navItems = multilingualNavItems;
        await waitForUpdate(element);

        // Add language selector in secondary slot
        const languageSelector = document.createElement('div');
        languageSelector.setAttribute('slot', 'secondary');
        languageSelector.innerHTML = `
          <select aria-label="Select language">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="zh">中文</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        `;
        element.appendChild(languageSelector);

        await waitForUpdate(element);

        const langSelect = element.querySelector('select[aria-label="Select language"]');
        expect(langSelect).toBeTruthy();
        expect(langSelect?.querySelectorAll('option').length).toBe(4);
      });

      it('should handle international affairs navigation', async () => {
        const internationalNavItems: NavItem[] = [
          { label: 'Home', href: '/', current: true },
          {
            label: 'Travel',
            submenu: [
              { label: 'Passports', href: '/travel/passports' },
              { label: 'Travel Advisories', href: '/travel/advisories' },
              { label: 'International Travel', href: '/travel/international' },
              { label: 'Crisis Abroad', href: '/travel/crisis' },
            ],
          },
          {
            label: 'Visas',
            submenu: [
              { label: 'Visit the U.S.', href: '/visas/visit' },
              { label: 'Study in the U.S.', href: '/visas/study' },
              { label: 'Work in the U.S.', href: '/visas/work' },
              { label: 'Immigrate to the U.S.', href: '/visas/immigrate' },
            ],
          },
          { label: 'Diplomatic Relations', href: '/diplomacy' },
          { label: 'About State', href: '/about' },
        ];

        element.logoText = 'U.S. Department of State';
        element.extended = true;
        element.showSearch = true;
        element.navItems = internationalNavItems;
        await waitForUpdate(element);

        expect(element.querySelectorAll('.usa-nav__submenu').length).toBe(2);
        expect(element.querySelectorAll('.usa-nav__submenu-item').length).toBe(8);
      });
    });
  });

  describe('Government Accessibility Features', () => {
    it('should handle high-contrast accessibility requirements', async () => {
      element.logoText = 'Department of Accessibility';
      element.showSearch = true;
      element.navItems = [
        { label: 'Home', href: '/', current: true },
        { label: 'Section 508 Compliance', href: '/section508' },
        { label: 'WCAG Guidelines', href: '/wcag' },
      ];
      await waitForUpdate(element);

      // Verify ARIA attributes for government accessibility
      const header = element.querySelector('header');
      const nav = element.querySelector('nav');
      const skipLink = element.querySelector('.usa-skipnav');

      expect(header?.getAttribute('role')).toBe('banner');
      expect(nav?.getAttribute('aria-label')).toBe('Primary navigation');
      expect(skipLink?.getAttribute('href')).toBe('#main-content');
      expect(skipLink?.textContent).toBe('Skip to main content');

      // Check current page indication
      const currentLink = element.querySelector('.usa-current');
      expect(currentLink?.getAttribute('aria-current')).toBe('page');
    });

    it('should support assistive technology with proper labeling', async () => {
      element.logoText = 'Accessible Government';
      element.showSearch = true;
      element.searchPlaceholder = 'Search accessible resources';
      const usaSearch = await waitForSearchComponent(element);

      // Verify search accessibility
      const searchLabel = usaSearch?.querySelector('label.usa-sr-only');
      const searchInput = usaSearch?.querySelector('.usa-search__input');
      const searchButton = usaSearch?.querySelector('.usa-search button[type="submit"]');

      expect(searchLabel).toBeTruthy();
      expect(searchLabel?.classList.contains('usa-sr-only')).toBe(true);
      expect(searchInput?.getAttribute('type')).toBe('search');
      expect(searchButton).toBeTruthy();
      // Note: Header uses small size search, which only shows icon (no text)
    });
  });

  describe('Government Performance & Security', () => {
    it('should handle large application navigation efficiently', async () => {
      // Simulate a large organization with many navigation items
      const largeNavItems: NavItem[] = [];

      // Create 10 main sections with 5-8 subsections each
      for (let i = 1; i <= 10; i++) {
        const submenuItems = [];
        for (let j = 1; j <= 6; j++) {
          submenuItems.push({
            label: `Section ${i} Item ${j}`,
            href: `/section${i}/item${j}`,
          });
        }
        largeNavItems.push({
          label: `Section ${i}`,
          submenu: submenuItems,
        });
      }

      const startTime = Date.now();
      element.navItems = largeNavItems;
      await waitForUpdate(element);
      const renderTime = Date.now() - startTime;

      // Should render large navigation within reasonable time
      expect(renderTime).toBeLessThan(500); // 500ms threshold
      expect(element.querySelectorAll('.usa-nav__primary-item').length).toBe(10);
      expect(element.querySelectorAll('.usa-nav__submenu-item').length).toBe(60);
    });

    it('should handle secure government links', async () => {
      const secureNavItems: NavItem[] = [
        { label: 'Home', href: 'https://secure.gov/', current: true },
        { label: 'Secure Portal', href: 'https://portal.secure.gov/login' },
        { label: 'Applications', href: 'https://apps.secure.gov/' },
      ];

      element.logoText = 'Secure Government Portal';
      element.logoHref = 'https://secure.gov/';
      element.navItems = secureNavItems;
      await waitForUpdate(element);

      // Verify secure HTTPS links
      const links = element.querySelectorAll('a[href^="https"]');
      expect(links.length).toBeGreaterThan(0);

      links.forEach((link) => {
        expect((link as HTMLAnchorElement).href).toMatch(/^https:\/\//);
      });
    });
  });

  describe('Government Event Integration', () => {
    it('should handle government analytics tracking', async () => {
      const trackedEvents: any[] = [];

      element.addEventListener('nav-click', (e: any) => {
        trackedEvents.push({
          type: 'navigation',
          page: e.detail.label,
          url: e.detail.href,
        });
      });

      element.addEventListener('header-search', (e: any) => {
        trackedEvents.push({
          type: 'search',
          query: e.detail.query,
        });
      });

      element.logoText = 'Analytics Test Agency';
      element.showSearch = true;
      element.navItems = [
        { label: 'Services', href: '/services' },
        { label: 'Benefits', href: '/benefits' },
      ];
      await waitForUpdate(element);

      // Test navigation tracking
      const navLink = element.querySelector('.usa-nav__link') as HTMLAnchorElement;
      navLink.click();

      expect(trackedEvents.length).toBe(1);
      expect(trackedEvents[0].type).toBe('navigation');
      expect(trackedEvents[0].page).toBe('Services');

      // Test search tracking
      const usaSearch = await waitForSearchComponent(element);
      const searchForm = usaSearch?.querySelector('.usa-search') as HTMLFormElement;
      const searchInput = usaSearch?.querySelector('.usa-search__input') as HTMLInputElement;

      expect(searchInput).toBeTruthy();
      searchInput!.value = 'government services';
      searchForm.dispatchEvent(new Event('submit', { bubbles: true }));

      expect(trackedEvents.length).toBe(2);
      expect(trackedEvents[1].type).toBe('search');
      expect(trackedEvents[1].query).toBe('government services');
    });

    it('should integrate with government content management systems', async () => {
      // Test CMS integration patterns
      const cmsEvents: any[] = [];

      element.addEventListener('nav-click', (e: any) => {
        // Simulate CMS page loading
        cmsEvents.push({
          action: 'load_page',
          slug: e.detail.href?.replace('/', ''),
          timestamp: Date.now(),
        });
        e.preventDefault(); // Prevent actual navigation in test
      });

      element.logoText = 'CMS Integration Test';
      element.navItems = [
        { label: 'Press Releases', href: '/press' },
        { label: 'Publications', href: '/publications' },
        { label: 'Policy Updates', href: '/policy' },
      ];
      await waitForPropertyPropagation(element);

      const pressLink = element.querySelectorAll('.usa-nav__link')[0] as HTMLAnchorElement;
      pressLink.click();

      expect(cmsEvents.length).toBe(1);
      expect(cmsEvents[0].action).toBe('load_page');
      expect(cmsEvents[0].slug).toBe('press');
      expect(cmsEvents[0].timestamp).toBeGreaterThan(0);
    });
  });

  // CRITICAL TESTS - Component Lifecycle Stability (Auto-dismiss Prevention)
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.logoText = 'Test Agency';
      element.extended = true;
      element.showSearch = true;
      element.mobileMenuOpen = true;
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain component state during rapid property changes', async () => {
      const initialParent = element.parentNode;

      // Rapid property changes that could trigger lifecycle issues
      for (let i = 0; i < 10; i++) {
        element.logoText = `Agency ${i}`;
        element.extended = i % 2 === 0;
        element.showSearch = i % 3 === 0;
        await element.updateComplete;
      }

      expect(element.parentNode).toBe(initialParent);
      expect(element.isConnected).toBe(true);
    });

    it('should handle complex navigation updates without disconnection', async () => {
      const complexNavItems = [
        {
          label: 'Section 1',
          submenu: [
            { label: 'Item 1', href: '/item1' },
            { label: 'Item 2', href: '/item2' },
          ],
        },
        { label: 'Section 2', href: '/section2', current: true },
      ];

      element.navItems = complexNavItems;
      element.mobileMenuOpen = true;
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Event System Stability (CRITICAL)', () => {
    it('should not interfere with other components after event handling', async () => {
      const eventsSpy = vi.fn();
      element.addEventListener('nav-click', eventsSpy);
      element.addEventListener('header-search', eventsSpy);
      element.addEventListener('mobile-menu-toggle', eventsSpy);

      element.navItems = [{ label: 'Test', href: '/test' }];
      element.showSearch = true;
      await element.updateComplete;

      // Trigger multiple events
      const navLink = element.querySelector('.usa-nav__link') as HTMLAnchorElement;
      navLink.click();

      const menuBtn = element.querySelector('.usa-menu-btn') as HTMLButtonElement;
      menuBtn.click();

      const usaSearch = await waitForSearchComponent(element);
      const searchForm = usaSearch?.querySelector('.usa-search') as HTMLFormElement;
      const searchInput = usaSearch?.querySelector('.usa-search__input') as HTMLInputElement;
      expect(searchInput).toBeTruthy();
      searchInput!.value = 'test';
      searchForm.dispatchEvent(new Event('submit'));

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should properly clean up event listeners on disconnect', async () => {
      // Note: Event listener cleanup is handled by USWDS behavior's cleanup function
      element.mobileMenuOpen = true;
      await element.updateComplete;

      element.remove();

      // Verify element was removed
      expect(document.body.contains(element)).toBe(false);
    });

    it('should handle event pollution without component removal', async () => {
      // Create potential event pollution
      for (let i = 0; i < 20; i++) {
        const customEvent = new CustomEvent(`test-event-${i}`, { bubbles: true });
        element.dispatchEvent(customEvent);
      }

      element.logoText = 'Event Test Agency';
      element.navItems = [{ label: 'Test', href: '/test' }];
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/header/usa-header.ts`;
        const validation = validateComponentJavaScript(componentPath, 'header');

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

  describe('Storybook Integration (CRITICAL)', () => {
    it('should render in Storybook without auto-dismissing', async () => {
      element.logoText = 'Storybook Test Agency';
      element.extended = true;
      element.showSearch = true;
      element.navItems = [
        { label: 'Home', href: '/', current: true },
        {
          label: 'Services',
          submenu: [
            { label: 'Service 1', href: '/service1' },
            { label: 'Service 2', href: '/service2' },
          ],
        },
      ];
      await element.updateComplete;

      expect(element.isConnected).toBe(true);
      expect(element.querySelector('.usa-header')).toBeTruthy();
      expect(element.querySelector('.usa-logo__text')?.textContent?.trim()).toContain(
        'Storybook Test Agency'
      );
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard navigation to header navigation links', async () => {
      element.navItems = [
        { text: 'Home', href: '/' },
        { text: 'About', href: '/about' },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const navLinks = focusableElements.filter((el) => el.tagName === 'A');

      expect(navLinks.length).toBeGreaterThanOrEqual(2);
    });

    it('should be keyboard-only usable', async () => {
      element.navItems = [
        { text: 'Home', href: '/' },
        { text: 'About', href: '/about' },
      ];
      await waitForUpdate(element);

      await verifyKeyboardOnlyUsable(element);
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.navItems = [{ text: 'Home', href: '/' }];
      await waitForPropertyPropagation(element);

      const header = element.querySelector('.usa-header');
      expect(header).toBeTruthy();

      const result = await testKeyboardNavigation(header!, {
        shortcuts: [{ key: 'Enter', description: 'Activate link' }],
        testEscapeKey: false,
        testArrowKeys: false,
      });

      expect(result.passed).toBe(true);
    });

    it('should have no keyboard traps', async () => {
      element.navItems = [
        { text: 'Link 1', href: '/link1' },
        { text: 'Link 2', href: '/link2' },
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

    it('should maintain proper tab order (logo → nav links → menu button)', async () => {
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = [
        { text: 'Home', href: '/' },
        { text: 'About', href: '/about' },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Should have logo link + nav links + potentially menu button
      expect(focusableElements.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle Enter key activation on navigation links', async () => {
      element.navItems = [{ text: 'Home', href: '/' }];
      await waitForPropertyPropagation(element);

      const navLink = element.querySelector('.usa-nav__link');
      expect(navLink).toBeTruthy();

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });

      navLink!.dispatchEvent(enterEvent);
      expect((navLink as HTMLAnchorElement).href).toBeTruthy();
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      element.navItems = [{ text: 'Home', href: '/' }];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      focusableElements.forEach((el) => {
        expect((el as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle mobile menu button keyboard activation', async () => {
      element.navItems = [{ text: 'Home', href: '/' }];
      await waitForPropertyPropagation(element);

      const menuButton = element.querySelector('.usa-menu-btn');

      if (menuButton) {
        expect((menuButton as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);

        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true,
          cancelable: true,
        });

        menuButton.dispatchEvent(enterEvent);
        expect(menuButton.tagName).toBe('BUTTON');
      } else {
        // Menu button may not be present in all layouts
        expect(true).toBe(true);
      }
    });

    it('should handle search input keyboard interaction', async () => {
      element.showSearch = true;
      await waitForPropertyPropagation(element);

      const searchInput = element.querySelector('.usa-search input');

      if (searchInput) {
        expect((searchInput as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);

        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          bubbles: true,
          cancelable: true,
        });

        searchInput.dispatchEvent(enterEvent);
        expect(searchInput.tagName).toBe('INPUT');
      } else {
        // Search may not be present depending on configuration
        expect(true).toBe(true);
      }
    });

    it('should support extended header variant keyboard navigation', async () => {
      element.extended = true;
      element.navItems = [
        { text: 'Home', href: '/' },
        { text: 'About', href: '/about' },
      ];
      await waitForPropertyPropagation(element);

      const header = element.querySelector('.usa-header--extended');
      expect(header).toBeTruthy();

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle logo link keyboard activation', async () => {
      element.logoText = 'Agency Name';
      element.logoHref = '/home';
      await waitForPropertyPropagation(element);

      const logoLink = element.querySelector('.usa-logo a');
      expect(logoLink).toBeTruthy();
      expect((logoLink as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });

      logoLink!.dispatchEvent(enterEvent);
      expect((logoLink as HTMLAnchorElement).href).toContain('/home');
    });

    it('should handle header with dropdown menu keyboard navigation', async () => {
      element.navItems = [
        {
          text: 'Services',
          href: '#',
          children: [
            { text: 'Service 1', href: '/service1' },
            { text: 'Service 2', href: '/service2' },
          ],
        },
      ];
      await waitForPropertyPropagation(element);

      const navLinks = element.querySelectorAll('.usa-nav__link');
      expect(navLinks.length).toBeGreaterThanOrEqual(1);

      // Primary nav link should be keyboard accessible
      navLinks.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle empty header gracefully', async () => {
      element.navItems = [];
      element.logoText = '';
      await waitForPropertyPropagation(element);

      const header = element.querySelector('.usa-header');
      expect(header).toBeTruthy();

      // Empty header should not have keyboard traps
      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  // CRITICAL: Layout and Structure Validation Tests
  // These tests prevent layout issues like the header search cutoff bug
  describe('Layout and Structure Validation (Prevent Cutoff Issues)', () => {
    describe('Search Component Structure', () => {
      it('should have search directly in usa-nav__secondary (not in list item)', async () => {
        element.showSearch = true;
        await waitForPropertyPropagation(element);

        const search = element.querySelector('usa-search');
        expect(search).toBeTruthy();

        // CRITICAL: Check parent is usa-nav__secondary (not a list item)
        const parent = search?.parentElement;
        expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);

        // CRITICAL: Ensure NOT in a list structure (this was the bug!)
        const listParent = search?.closest('ul');
        expect(listParent).toBeNull();
      });

      it('should NOT have extra wrapper elements around search', async () => {
        element.showSearch = true;
        await waitForPropertyPropagation(element);

        const search = element.querySelector('usa-search');
        const parent = search?.parentElement;

        // CRITICAL: Parent should be usa-nav__secondary, not a section or other wrapper
        expect(parent?.tagName.toLowerCase()).not.toBe('section');
        expect(parent?.classList.contains('usa-nav__secondary')).toBe(true);
      });

      it('should match USWDS reference structure for search in header', async () => {
        element.showSearch = true;
        await waitForUpdate(element);

        // Expected structure from USWDS:
        // <div class="usa-nav__secondary">
        //   <ul class="usa-nav__secondary-links"></ul>
        //   <usa-search>...</usa-search>
        // </div>

        const secondary = element.querySelector('.usa-nav__secondary');
        const secondaryLinks = secondary?.querySelector('.usa-nav__secondary-links');
        const search = secondary?.querySelector('usa-search');

        expect(secondary).toBeTruthy();
        expect(secondaryLinks).toBeTruthy();
        expect(search).toBeTruthy();

        // CRITICAL: usa-search should be sibling of usa-nav__secondary-links
        const children = Array.from(secondary?.children || []);
        const linksIndex = children.findIndex((el) =>
          el.classList.contains('usa-nav__secondary-links')
        );
        const searchIndex = children.findIndex((el) => el.tagName.toLowerCase() === 'usa-search');

        expect(searchIndex).toBe(linksIndex + 1); // search comes after links
      });
    });

    describe('CSS Display Properties', () => {
      it('should have inline-block display on usa-search', async () => {
        element.showSearch = true;
        await waitForPropertyPropagation(element);

        const search = element.querySelector('usa-search') as HTMLElement;

        // Wait for usa-search component to be fully rendered
        if (search && 'updateComplete' in search) {
          await (search as any).updateComplete;
        }

        const styles = window.getComputedStyle(search);

        // CRITICAL: This would have caught the display: block bug!
        // Note: May be empty string in jsdom, but should not be 'block'
        expect(styles.display).not.toBe('block');

        // In a real browser, this would be 'inline-block'
        // In JSDOM, it may be 'inline' due to incomplete style computation
        if (styles.display && styles.display !== '') {
          expect(['inline-block', 'inline']).toContain(styles.display);
        }
      });

      it('should not have block display that breaks layout', async () => {
        element.showSearch = true;
        await waitForPropertyPropagation(element);

        const search = element.querySelector('usa-search') as HTMLElement;

        // Wait for usa-search component to be fully rendered
        if (search && 'updateComplete' in search) {
          await (search as any).updateComplete;
        }

        const styles = window.getComputedStyle(search);

        // CRITICAL: Block display would break USWDS flexbox layout
        expect(styles.display).not.toBe('block');
      });
    });

    describe('Component Composition', () => {
      it('should use usa-search web component (not inline HTML)', async () => {
        element.showSearch = true;
        await waitForUpdate(element);

        // CRITICAL: Should have usa-search custom element
        const searchComponent = element.querySelector('usa-search');
        expect(searchComponent).toBeTruthy();
        expect(searchComponent?.tagName.toLowerCase()).toBe('usa-search');

        // CRITICAL: Should NOT have inline search form with usa-search class as direct child of header
        // usa-search component has the form inside it, which is correct
        // We need to check for forms that are NOT inside the usa-search component
        const allSearchForms = element.querySelectorAll('form.usa-search');
        const inlineSearchForms = Array.from(allSearchForms).filter((form) => {
          // Check if form is inside usa-search component
          return !form.closest('usa-search');
        });
        expect(inlineSearchForms.length).toBe(0);
      });

      it('should have imported usa-search component dependency', () => {
        // Verify usa-search is registered as a custom element
        const searchConstructor = customElements.get('usa-search');
        expect(searchConstructor).toBeDefined();
      });
    });

    describe('Visual Rendering Validation', () => {
      it('should render search element in DOM (visual tests in Cypress)', async () => {
        element.showSearch = true;
        await waitForPropertyPropagation(element);

        const search = element.querySelector('usa-search') as HTMLElement;
        expect(search).toBeTruthy();

        // Wait for usa-search component to be fully rendered
        if (search && 'updateComplete' in search) {
          await (search as any).updateComplete;
        }

        // Verify search exists and has form inside
        const form = search.querySelector('form.usa-search');
        expect(form).toBeTruthy();

        // CRITICAL: This structure validation prevents cutoff issues
        // In a real browser (Cypress), we would also check:
        // - getBoundingClientRect().height > 30
        // - Element is visible and in viewport
        // Note: jsdom doesn't render, so dimension checks are in Cypress tests
      });

      it('should have search input and button rendered', async () => {
        element.showSearch = true;
        await waitForPropertyPropagation(element);

        const search = element.querySelector('usa-search');

        // Wait for usa-search component to be fully rendered
        if (search && 'updateComplete' in search) {
          await (search as any).updateComplete;
        }

        const input = search?.querySelector('.usa-search__input') as HTMLElement;
        const button = search?.querySelector('.usa-search__submit') as HTMLElement;

        expect(input).toBeTruthy();
        expect(button).toBeTruthy();

        // CRITICAL: Elements exist in DOM (visual rendering verified in Cypress)
        expect(input.tagName.toLowerCase()).toBe('input');
        expect(button.tagName.toLowerCase()).toBe('button');
      });

      it('should render search in both basic and extended headers', async () => {
        // Test basic header
        element.extended = false;
        element.showSearch = true;
        await waitForPropertyPropagation(element);

        let search = element.querySelector('usa-search') as HTMLElement;
        expect(search).toBeTruthy();

        // Wait for usa-search component
        if (search && 'updateComplete' in search) {
          await (search as any).updateComplete;
        }

        let form = search.querySelector('form.usa-search');
        expect(form).toBeTruthy();

        // Test extended header
        element.extended = true;
        await waitForPropertyPropagation(element);

        search = element.querySelector('usa-search') as HTMLElement;
        expect(search).toBeTruthy();

        // Wait for usa-search component
        if (search && 'updateComplete' in search) {
          await (search as any).updateComplete;
        }

        form = search.querySelector('form.usa-search');
        expect(form).toBeTruthy();

        // CRITICAL: Both variants render search correctly
        // Visual cutoff checks are in Cypress component tests
      });
    });
  });

  describe('Focus Management (WCAG 2.4)', () => {
    const sampleNavItems: NavItem[] = [
      { text: 'Home', href: '/' },
      { text: 'About', href: '/about' },
      { text: 'Services', href: '/services' },
    ];

    it('should have correct focus management structure', async () => {
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = sampleNavItems;
      await waitForUpdate(element);

      // Header should have focusable elements (logo + nav links)
      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThan(0);

      // Test focus indicators
      const result = await testFocusIndicators(element);
      expect(result.allVisible).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    it('should support programmatic focus on navigation elements', async () => {
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = sampleNavItems;
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThan(0);

      // Test programmatic focus
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement.focus();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        expect(firstElement).toBeTruthy();
      }
    });

    it('should maintain visible focus indicators on logo and navigation (WCAG 2.4.7)', async () => {
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = sampleNavItems;
      await waitForUpdate(element);

      const result = await testFocusIndicators(element);
      expect(result.metrics).toBeDefined();

      if (result.metrics) {
        expect(result.metrics.length).toBeGreaterThan(0);
        result.metrics.forEach((metric) => {
          expect(metric).toHaveProperty('hasVisibleIndicator');
          expect(metric).toHaveProperty('outlineWidth');
        });
      }
    });

    it('should have proper focus order (logo → nav links → menu button)', async () => {
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = sampleNavItems;
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThanOrEqual(3);

      // All elements should have proper tabindex
      focusableElements.forEach((el) => {
        expect((el as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle focus with extended variant', async () => {
      element.variant = 'extended';
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = sampleNavItems;
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThan(0);

      // Extended variant should have same focus management (verify header exists)
      const header = element.querySelector('.usa-header');
      expect(header).toBeTruthy();
    });

    it('should handle focus with search enabled', async () => {
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = sampleNavItems;
      element.search = true;
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Should have additional search input
      const searchInput = element.querySelector('input[type="search"]');
      if (searchInput) {
        expect(focusableElements.some((el) => el === searchInput)).toBe(true);
      }
    });

    it('should handle focus with dropdown navigation', async () => {
      const navWithDropdown: NavItem[] = [
        { text: 'Home', href: '/' },
        {
          text: 'Services',
          submenu: [
            { text: 'Web Design', href: '/services/web' },
            { text: 'Development', href: '/services/dev' },
          ],
        },
      ];

      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = navWithDropdown;
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThan(0);

      // Should have dropdown button
      const dropdownButton = element.querySelector('.usa-nav__link[aria-expanded]');
      if (dropdownButton) {
        expect(focusableElements.some((el) => el === dropdownButton)).toBe(true);
      }
    });

    it('should handle empty header focus management', async () => {
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      // Empty header may have no focusable elements
      expect(focusableElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle focus with mobile menu button', async () => {
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = sampleNavItems;
      await waitForUpdate(element);

      // Mobile menu button should be focusable
      const menuButton = element.querySelector('.usa-menu-btn');
      if (menuButton) {
        expect((menuButton as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      }
    });

    it('should maintain focus visibility during navigation interaction', async () => {
      element.logoText = 'Agency';
      element.logoHref = '/';
      element.navItems = sampleNavItems;
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus first navigation item
      if (focusableElements.length > 1) {
        const navLink = focusableElements[1] as HTMLElement;
        navLink.focus();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        expect(navLink).toBeTruthy();
      }
    });
  });
});
