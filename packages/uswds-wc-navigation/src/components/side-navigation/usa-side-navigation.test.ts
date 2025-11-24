import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './usa-side-navigation.ts';
import type { USASideNavigation, SideNavItem } from './usa-side-navigation.js';
import {
  setupTestEnvironment,
  waitForUpdate,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USASideNavigation', () => {
  let element: USASideNavigation;
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupTestEnvironment();
    element = document.createElement('usa-side-navigation') as USASideNavigation;
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
      expect(element.tagName).toBe('USA-SIDE-NAVIGATION');
    });

    it('should have default properties', () => {
      expect(element.items).toEqual([]);
      expect(element.ariaLabel).toBe('Secondary navigation');
    });
  });

  describe('Properties', () => {
    it('should handle items changes', async () => {
      const items: SideNavItem[] = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Current Page', href: '/current', current: true },
      ];

      element.items = items;
      await waitForPropertyPropagation(element);

      const listItems = element.querySelectorAll('.usa-sidenav__item');
      expect(listItems.length).toBe(3);

      const links = element.querySelectorAll('a');
      expect(links.length).toBe(3);

      const currentItem = element.querySelector('.usa-current');
      expect(currentItem).toBeTruthy();
    });

    it('should handle ariaLabel changes', async () => {
      element.ariaLabel = 'Main navigation';
      element.items = [{ label: 'Test', href: '/' }];
      await waitForPropertyPropagation(element);

      let nav = element.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBe('Main navigation');

      element.ariaLabel = 'Primary menu';
      await waitForPropertyPropagation(element);

      nav = element.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBe('Primary menu');

      element.ariaLabel = 'Site navigation';
      await waitForPropertyPropagation(element);

      nav = element.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBe('Site navigation');
    });
  });

  describe('Rendering', () => {
    it('should render side navigation with correct structure', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('nav');
      const list = element.querySelector('.usa-sidenav');
      const listItems = element.querySelectorAll('.usa-sidenav__item');

      expect(nav).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('Secondary navigation');
      expect(list).toBeTruthy();
      expect(list?.tagName).toBe('UL');
      expect(listItems.length).toBe(2);
    });

    it('should render navigation items as links', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a');
      expect(links.length).toBe(3);

      const homeLink = links[0] as HTMLAnchorElement;
      const aboutLink = links[1] as HTMLAnchorElement;

      expect(homeLink.href).toContain('/');
      expect(homeLink.textContent?.trim()).toBe('Home');
      expect(aboutLink.href).toContain('/about');
      expect(aboutLink.textContent?.trim()).toBe('About');
    });

    it('should render current item with correct attributes', async () => {
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Current Page', href: '/current', current: true },
      ];
      await waitForPropertyPropagation(element);

      const currentLink = element.querySelector('.usa-current');
      const currentItem = currentLink?.closest('.usa-sidenav__item');

      expect(currentLink).toBeTruthy();
      expect(currentItem).toBeTruthy();
      expect(currentItem?.classList.contains('usa-sidenav__item')).toBe(true);
      expect(currentLink?.classList.contains('usa-current')).toBe(true);
      expect(currentLink?.getAttribute('aria-current')).toBe('page');
      expect(currentLink?.textContent?.trim()).toBe('Current Page');
    });

    it('should handle items without href', async () => {
      element.items = [{ label: 'No Href Item' }, { label: 'With Href', href: '/with-href' }];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a');
      expect(links.length).toBe(2);

      const noHrefLink = links[0] as HTMLAnchorElement;
      const withHrefLink = links[1] as HTMLAnchorElement;

      // Should have some href (component uses javascript:void(0); as fallback)
      expect(noHrefLink.href).toBeTruthy();
      expect(withHrefLink.href).toContain('/with-href');
    });

    it('should render with subnav items', async () => {
      element.items = [
        {
          label: 'Main Section',
          href: '/main',
          subnav: [
            { label: 'Sub Item 1', href: '/main/sub1' },
            { label: 'Sub Item 2', href: '/main/sub2' },
          ],
        },
      ];
      await waitForPropertyPropagation(element);

      const mainItem = element.querySelector('.usa-sidenav__item');
      const sublist = element.querySelector('.usa-sidenav__sublist');
      const subItems = element.querySelectorAll('.usa-sidenav__sublist .usa-sidenav__item');

      expect(mainItem).toBeTruthy();
      expect(sublist).toBeTruthy();
      expect(sublist?.tagName).toBe('UL');
      expect(subItems.length).toBe(2);
    });

    it('should render nested subnav correctly', async () => {
      element.items = [
        {
          label: 'Parent',
          href: '/parent',
          subnav: [
            {
              label: 'Child',
              href: '/parent/child',
              subnav: [{ label: 'Grandchild', href: '/parent/child/grandchild' }],
            },
          ],
        },
      ];
      await waitForPropertyPropagation(element);

      const sublists = element.querySelectorAll('.usa-sidenav__sublist');
      const allItems = element.querySelectorAll('.usa-sidenav__item');

      expect(sublists.length).toBe(2); // One for child, one for grandchild
      expect(allItems.length).toBe(3); // Parent, Child, Grandchild
    });

    it('should render slot content when no items provided', async () => {
      element.items = [];
      await waitForPropertyPropagation(element);

      const slot = element.querySelector('slot');
      expect(slot).toBeTruthy();

      // Should not render nav structure
      const nav = element.querySelector('nav');
      expect(nav).toBe(null);
    });
  });

  describe('Item Click Events', () => {
    it('should dispatch sidenav-click event', async () => {
      let eventDetail: any = null;

      element.addEventListener('sidenav-click', (e: any) => {
        eventDetail = e.detail;
      });

      element.items = [{ label: 'Test Item', href: '/test' }];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      link.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.label).toBe('Test Item');
      expect(eventDetail.href).toBe('/test');
      expect(eventDetail.item).toBeTruthy();
      expect(eventDetail.item.label).toBe('Test Item');
    });

    it('should dispatch event for subnav items', async () => {
      let eventDetail: any = null;

      element.addEventListener('sidenav-click', (e: any) => {
        eventDetail = e.detail;
      });

      element.items = [
        {
          label: 'Parent',
          href: '/parent',
          subnav: [{ label: 'Child Item', href: '/parent/child' }],
        },
      ];
      await waitForPropertyPropagation(element);

      const childLink = element.querySelectorAll('a')[1] as HTMLAnchorElement;
      childLink.click();

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.label).toBe('Child Item');
      expect(eventDetail.href).toBe('/parent/child');
    });

    it('should handle clicks for items without href', async () => {
      let eventDetail: any = null;
      let preventDefaultCalled = false;

      element.addEventListener('sidenav-click', (e: any) => {
        eventDetail = e.detail;
      });

      element.items = [{ label: 'No Href Item' }];
      await waitForUpdate(element);

      // Mock preventDefault to test it's called
      const mockEvent = {
        preventDefault: () => {
          preventDefaultCalled = true;
        },
      } as Event;

      // Call handleItemClick directly with mock event
      (element as any).handleItemClick(element.items[0], mockEvent);

      expect(eventDetail).toBeTruthy();
      expect(eventDetail.label).toBe('No Href Item');
      expect(eventDetail.href).toBeUndefined();
      expect(preventDefaultCalled).toBe(true);
    });
  });

  describe('Complex Navigation Structure', () => {
    it('should handle deep nested navigation', async () => {
      const complexItems: SideNavItem[] = [
        {
          label: 'Level 1A',
          href: '/level1a',
          subnav: [
            {
              label: 'Level 2A',
              href: '/level1a/level2a',
              subnav: [
                { label: 'Level 3A', href: '/level1a/level2a/level3a' },
                { label: 'Level 3B', href: '/level1a/level2a/level3b' },
              ],
            },
            { label: 'Level 2B', href: '/level1a/level2b' },
          ],
        },
        {
          label: 'Level 1B',
          href: '/level1b',
          current: true,
        },
      ];

      element.items = complexItems;
      await waitForPropertyPropagation(element);

      const allItems = element.querySelectorAll('.usa-sidenav__item');
      const sublists = element.querySelectorAll('.usa-sidenav__sublist');
      const allLinks = element.querySelectorAll('a');
      const currentItems = element.querySelectorAll('.usa-current');

      expect(allItems.length).toBe(6); // Total items across all levels
      expect(sublists.length).toBe(2); // Two sublists
      expect(allLinks.length).toBe(6); // All items have links
      expect(currentItems.length).toBe(1); // One current item
    });

    it('should handle multiple current items in different levels', async () => {
      element.items = [
        {
          label: 'Section A',
          href: '/a',
          current: true,
          subnav: [
            { label: 'Sub A1', href: '/a/1' },
            { label: 'Sub A2', href: '/a/2', current: true },
          ],
        },
      ];
      await waitForPropertyPropagation(element);

      const currentItems = element.querySelectorAll('.usa-current');
      expect(currentItems.length).toBe(2); // Both parent and child marked as current
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty items array', async () => {
      element.items = [];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('nav');
      const slot = element.querySelector('slot');

      expect(nav).toBe(null);
      expect(slot).toBeTruthy();
    });

    it('should handle items with empty subnav arrays', async () => {
      element.items = [{ label: 'Item with Empty Subnav', href: '/item', subnav: [] }];
      await waitForPropertyPropagation(element);

      const sublists = element.querySelectorAll('.usa-sidenav__sublist');
      expect(sublists.length).toBe(0); // Empty subnav should not render sublist
    });

    it('should handle mixed items with and without subnav', async () => {
      element.items = [
        { label: 'Simple Item', href: '/simple' },
        {
          label: 'Item with Subnav',
          href: '/with-subnav',
          subnav: [{ label: 'Sub Item', href: '/with-subnav/sub' }],
        },
        { label: 'Another Simple', href: '/simple2' },
      ];
      await waitForUpdate(element);
      await element.updateComplete; // Additional wait

      const topLevelItems = element.querySelectorAll('nav > .usa-sidenav > .usa-sidenav__item');
      const sublists = element.querySelectorAll('.usa-sidenav__sublist');
      const allItems = element.querySelectorAll('.usa-sidenav__item');

      expect(topLevelItems.length).toBe(3);
      expect(sublists.length).toBe(1);
      expect(allItems.length).toBe(4); // 3 top level + 1 sub item
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', async () => {
      element.ariaLabel = 'Test Navigation';
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'Current', href: '/current', current: true },
      ];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('nav');
      const currentLink = element.querySelector('.usa-current');

      expect(nav?.getAttribute('aria-label')).toBe('Test Navigation');
      expect(currentLink?.getAttribute('aria-current')).toBe('page');
    });

    it('should have proper semantic structure', async () => {
      element.items = [
        {
          label: 'Section',
          href: '/section',
          subnav: [{ label: 'Sub Item', href: '/section/sub' }],
        },
      ];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('nav');
      const mainList = nav?.querySelector('.usa-sidenav');
      const subList = element.querySelector('.usa-sidenav__sublist');

      expect(nav).toBeTruthy();
      expect(mainList?.tagName).toBe('UL');
      expect(subList?.tagName).toBe('UL');

      // Check nested list structure
      const mainItems = mainList?.querySelectorAll(':scope > .usa-sidenav__item');
      expect(mainItems?.length).toBe(1);
    });

    it('should support screen reader navigation', async () => {
      element.ariaLabel = 'Site sections';
      element.items = [{ label: 'Accessible Section', href: '/accessible', current: true }];
      await waitForPropertyPropagation(element);

      const nav = element.querySelector('nav[aria-label="Site sections"]');
      const currentItem = element.querySelector('a[aria-current="page"]');

      expect(nav).toBeTruthy();
      expect(currentItem).toBeTruthy();
      expect(currentItem?.textContent?.trim()).toBe('Accessible Section');
    });
  });

  describe('Event Handling Details', () => {
    it('should provide complete event information', async () => {
      let capturedEvent: any = null;

      element.addEventListener('sidenav-click', (e: any) => {
        capturedEvent = e;
      });

      const testItem = { label: 'Test Item', href: '/test-path' };
      element.items = [testItem];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      link.click();

      expect(capturedEvent).toBeTruthy();
      expect(capturedEvent.type).toBe('sidenav-click');
      expect(capturedEvent.bubbles).toBe(true);
      expect(capturedEvent.composed).toBe(true);
      expect(capturedEvent.detail.item).toEqual(testItem);
      expect(capturedEvent.detail.label).toBe('Test Item');
      expect(capturedEvent.detail.href).toBe('/test-path');
    });
  });

  // CRITICAL TESTS - Component Lifecycle Stability (Auto-dismiss Prevention)
  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      element.items = [
        { label: 'Home', href: '/', current: true },
        { label: 'About', href: '/about' },
        {
          label: 'Services',
          href: '/services',
          subnav: [
            { label: 'Web Design', href: '/services/web' },
            { label: 'Consulting', href: '/services/consulting' },
          ],
        },
        { label: 'Contact', href: '/contact' },
      ];
      element.ariaLabel = 'Test Side Navigation';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain component state during rapid property changes', async () => {
      const initialParent = element.parentNode;

      // Rapid property changes that could trigger lifecycle issues
      for (let i = 0; i < 10; i++) {
        element.ariaLabel = `Navigation ${i}`;
        element.items = [
          {
            label: `Section ${i}`,
            href: `/section${i}`,
            current: i === 3,
            subnav:
              i % 2 === 0
                ? [
                    { label: `Sub ${i}A`, href: `/section${i}/a` },
                    { label: `Sub ${i}B`, href: `/section${i}/b` },
                  ]
                : undefined,
          },
          { label: `Page ${i}`, href: `/page${i}` },
        ];
        await element.updateComplete;
      }

      expect(element.parentNode).toBe(initialParent);
      expect(element.isConnected).toBe(true);
    });

    it('should handle complex navigation structures without disconnection', async () => {
      // Complex nested navigation structure
      const complexItems: SideNavItem[] = [
        {
          label: 'Main Section',
          href: '/main',
          subnav: [
            { label: 'Sub 1', href: '/main/sub1', current: true },
            { label: 'Sub 2', href: '/main/sub2' },
            {
              label: 'Sub 3',
              href: '/main/sub3',
              subnav: [
                { label: 'Deep 1', href: '/main/sub3/deep1' },
                { label: 'Deep 2', href: '/main/sub3/deep2' },
              ],
            },
          ],
        },
        { label: 'Another Section', href: '/another' },
      ];

      element.items = complexItems;
      element.ariaLabel = 'Complex Navigation';
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Event System Stability (CRITICAL)', () => {
    it('should not interfere with other components after event handling', async () => {
      const eventsSpy = vi.fn();
      element.addEventListener('sidenav-click', eventsSpy);

      element.items = [
        { label: 'Home', href: '/' },
        {
          label: 'Products',
          href: '/products',
          subnav: [
            { label: 'Software', href: '/products/software' },
            { label: 'Hardware', href: '/products/hardware' },
          ],
        },
      ];
      await element.updateComplete;

      // Trigger multiple navigation events
      const homeLink = element.querySelector('a[href="/"]') as HTMLAnchorElement;
      homeLink.click();

      const productLink = element.querySelector('a[href="/products"]') as HTMLAnchorElement;
      productLink?.click();

      const subnavLink = element.querySelector('a[href="/products/software"]') as HTMLAnchorElement;
      subnavLink?.click();

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle rapid navigation clicks without component removal', async () => {
      element.items = [
        { label: 'Link 1', href: '/link1' },
        { label: 'Link 2', href: '/link2' },
        { label: 'Link 3', href: '/link3' },
      ];
      await element.updateComplete;

      const links = element.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;

      // Rapid clicking simulation
      for (let i = 0; i < 20; i++) {
        links[i % links.length].click();
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle event pollution without component removal', async () => {
      // Create potential event pollution
      for (let i = 0; i < 20; i++) {
        const customEvent = new CustomEvent(`test-event-${i}`, { bubbles: true });
        element.dispatchEvent(customEvent);
      }

      element.ariaLabel = 'Event Test Side Navigation';
      element.items = [
        { label: 'Test Section', href: '/test' },
        { label: 'Another Section', href: '/another' },
      ];
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Navigation Structure Stability (CRITICAL)', () => {
    it('should handle complex subnav operations without disconnection', async () => {
      // Test complex subnav structures and operations
      const navStructures = [
        [
          {
            label: 'Single Level',
            href: '/single',
            subnav: [
              { label: 'Item A', href: '/single/a' },
              { label: 'Item B', href: '/single/b' },
            ],
          },
        ],
        [
          {
            label: 'Multi Level',
            href: '/multi',
            subnav: [
              {
                label: 'Level 2A',
                href: '/multi/2a',
                subnav: [
                  { label: 'Level 3A', href: '/multi/2a/3a' },
                  { label: 'Level 3B', href: '/multi/2a/3b' },
                ],
              },
              { label: 'Level 2B', href: '/multi/2b' },
            ],
          },
        ],
        [
          { label: 'Flat 1', href: '/flat1' },
          { label: 'Flat 2', href: '/flat2' },
          { label: 'Flat 3', href: '/flat3' },
        ],
      ];

      for (const structure of navStructures) {
        element.items = structure;
        await element.updateComplete;

        // Verify structure renders correctly
        const nav = element.querySelector('nav');
        expect(nav).toBeTruthy();
      }

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should handle current item changes across navigation levels', async () => {
      element.items = [
        {
          label: 'Main',
          href: '/main',
          subnav: [
            { label: 'Sub 1', href: '/main/sub1', current: true },
            { label: 'Sub 2', href: '/main/sub2' },
          ],
        },
        { label: 'Other', href: '/other' },
      ];
      await element.updateComplete;

      // Update current item at different levels
      element.items = [
        {
          label: 'Main',
          href: '/main',
          current: true,
          subnav: [
            { label: 'Sub 1', href: '/main/sub1' },
            { label: 'Sub 2', href: '/main/sub2' },
          ],
        },
        { label: 'Other', href: '/other' },
      ];
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });

  describe('Storybook Integration (CRITICAL)', () => {
    it('should render in Storybook without auto-dismissing', async () => {
      element.ariaLabel = 'Storybook Test Side Navigation';
      element.items = [
        {
          label: 'Getting Started',
          href: '/getting-started',
          current: true,
          subnav: [
            { label: 'Installation', href: '/getting-started/installation' },
            { label: 'Quick Start', href: '/getting-started/quick-start' },
            { label: 'Configuration', href: '/getting-started/configuration' },
          ],
        },
        {
          label: 'Components',
          href: '/components',
          subnav: [
            { label: 'Forms', href: '/components/forms' },
            { label: 'Navigation', href: '/components/navigation' },
            { label: 'Layout', href: '/components/layout' },
          ],
        },
        {
          label: 'Design Patterns',
          href: '/patterns',
          subnav: [
            { label: 'Page Templates', href: '/patterns/templates' },
            { label: 'User Flows', href: '/patterns/flows' },
          ],
        },
        { label: 'Resources', href: '/resources' },
        { label: 'Support', href: '/support' },
      ];
      await element.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50)); // Additional wait for rendering

      expect(element.isConnected).toBe(true);
      expect(element.querySelector('nav')).toBeTruthy();
      expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe(
        'Storybook Test Side Navigation'
      );
      expect(element.querySelector('.usa-sidenav')).toBeTruthy();

      // Verify current item is rendered
      const currentItem = element.querySelector('.usa-current');
      expect(currentItem?.textContent?.trim()).toBe('Getting Started');
      expect(currentItem?.getAttribute('aria-current')).toBe('page');

      // Verify subnav structure
      const subnavItems = element.querySelectorAll('.usa-sidenav__sublist .usa-sidenav__item');
      expect(subnavItems.length).toBeGreaterThan(0);

      // Verify main navigation items
      const mainItems = element.querySelectorAll('nav > .usa-sidenav > .usa-sidenav__item');
      expect(mainItems.length).toBe(5);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/side-navigation/usa-side-navigation.ts`;
        const validation = validateComponentJavaScript(componentPath, 'side-navigation');

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
      // Test default empty side navigation
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test simple navigation structure
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Services', href: '/services', current: true },
        { label: 'Contact', href: '/contact' },
      ];
      element.ariaLabel = 'Main Navigation';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test navigation with subnav
      element.items = [
        {
          label: 'Government Services',
          href: '/services',
          current: true,
          subnav: [
            { label: 'Apply for Benefits', href: '/services/benefits' },
            { label: 'Pay Taxes', href: '/services/taxes' },
            { label: 'Register to Vote', href: '/services/voting' },
          ],
        },
        { label: 'About This Agency', href: '/about' },
        { label: 'Contact Us', href: '/contact' },
      ];
      element.ariaLabel = 'Government Services Navigation';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test complex nested structure
      element.items = [
        {
          label: 'Federal Programs',
          href: '/programs',
          subnav: [
            { label: 'Healthcare', href: '/programs/healthcare' },
            { label: 'Education', href: '/programs/education' },
            { label: 'Employment', href: '/programs/employment' },
          ],
        },
        {
          label: 'Resources',
          href: '/resources',
          current: true,
          subnav: [
            { label: 'Forms & Documents', href: '/resources/forms' },
            { label: 'FAQs', href: '/resources/faq' },
            { label: 'Help Center', href: '/resources/help' },
          ],
        },
      ];
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should maintain accessibility during dynamic updates', async () => {
      // Set initial accessible state
      element.items = [
        { label: 'Home', href: '/', current: true },
        { label: 'About', href: '/about' },
      ];
      element.ariaLabel = 'Site Navigation';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update current page
      element.items = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about', current: true },
      ];
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Add subnav to current item
      element.items = [
        { label: 'Home', href: '/' },
        {
          label: 'About',
          href: '/about',
          current: true,
          subnav: [
            { label: 'Our Mission', href: '/about/mission' },
            { label: 'Leadership Team', href: '/about/leadership' },
            { label: 'Contact Information', href: '/about/contact' },
          ],
        },
      ];
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update aria label
      element.ariaLabel = 'Updated Site Navigation';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility with government use cases', async () => {
      // Federal agency navigation
      element.items = [
        {
          label: 'Citizen Services',
          href: '/services',
          current: true,
          subnav: [
            { label: 'Apply for Passport', href: '/services/passport' },
            { label: 'File Tax Return', href: '/services/taxes' },
            { label: 'Social Security Benefits', href: '/services/social-security' },
            { label: 'Medicare Enrollment', href: '/services/medicare' },
          ],
        },
        {
          label: 'Business Resources',
          href: '/business',
          subnav: [
            { label: 'Register a Business', href: '/business/register' },
            { label: 'Small Business Loans', href: '/business/loans' },
            { label: 'Government Contracts', href: '/business/contracts' },
          ],
        },
        {
          label: 'Agency Information',
          href: '/agency',
          subnav: [
            { label: 'Leadership', href: '/agency/leadership' },
            { label: 'Budget & Performance', href: '/agency/budget' },
            { label: 'Freedom of Information Act', href: '/agency/foia' },
          ],
        },
        { label: 'News & Updates', href: '/news' },
        { label: 'Contact Us', href: '/contact' },
      ];
      element.ariaLabel = 'Federal Agency Navigation';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });
});
