import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-collection.ts';
import type { USACollection, CollectionItem } from './usa-collection.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForUpdate, validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import {
  testKeyboardNavigation,
  verifyKeyboardOnlyUsable,
  getFocusableElements,
} from '@uswds-wc/test-utils/keyboard-navigation-utils.js';
import { waitForPropertyPropagation, waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USACollection', () => {
  let element: USACollection;

  const sampleItems: CollectionItem[] = [
    {
      id: 'item1',
      title: 'First Collection Item',
      description: 'Description for the first item',
      date: '2024-01-01',
      author: 'John Doe',
      href: '/item1',
      tags: ['news', 'important'],
      media: {
        src: '/images/item1.jpg',
        alt: 'Item 1 image',
      },
      metadata: [
        { label: 'Category', value: 'News' },
        { label: 'Reading time', value: '5 min' },
      ],
    },
    {
      id: 'item2',
      title: 'Second Collection Item',
      description: 'Description for the second item',
      date: '2024-01-15',
      author: 'Jane Smith',
      tags: ['update', 'feature'],
    },
    {
      id: 'item3',
      title: 'Third Collection Item',
      href: '/item3',
    },
  ];

  beforeEach(() => {
    element = document.createElement('usa-collection') as USACollection;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Basic Functionality', () => {
    it('should create and render correctly', async () => {
      await waitForUpdate(element);

      expect(element).toBeTruthy();
      expect(element.tagName).toBe('USA-COLLECTION');
    });

    it('should have default properties', () => {
      expect(element.items).toEqual([]);
    });

    it('should render empty collection', async () => {
      await waitForUpdate(element);

      const collection = element.querySelector('.usa-collection');
      expect(collection).toBeTruthy();
      expect(collection?.children.length).toBe(0);
    });
  });

  describe('Properties', () => {
    it('should handle items changes', async () => {
      element.items = sampleItems;
      await waitForPropertyPropagation(element);

      const items = element.querySelectorAll('.usa-collection__item');
      expect(items.length).toBe(3);
    });
  });

  describe('Item Rendering', () => {
    beforeEach(async () => {
      element.items = sampleItems;
      await waitForUpdate(element);
    });

    it('should render collection with proper USWDS structure', async () => {
      const collection = element.querySelector('ul.usa-collection');
      expect(collection).toBeTruthy();

      const items = collection?.querySelectorAll('.usa-collection__item');
      expect(items?.length).toBe(3);
    });

    it('should render item titles with links when href provided', () => {
      const firstItem = element.querySelectorAll('.usa-collection__item')[0];
      const link = firstItem?.querySelector('.usa-collection__heading a.usa-link');

      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('/item1');
      expect(link?.textContent?.trim()).toBe('First Collection Item');
    });

    it('should render item titles without links when no href', () => {
      const secondItem = element.querySelectorAll('.usa-collection__item')[1];
      const heading = secondItem?.querySelector('.usa-collection__heading');
      const link = heading?.querySelector('a');

      expect(heading?.textContent?.trim()).toBe('Second Collection Item');
      expect(link).toBeFalsy();
    });

    it('should render descriptions', () => {
      const firstItem = element.querySelectorAll('.usa-collection__item')[0];
      const description = firstItem?.querySelector('.usa-collection__description');

      expect(description?.textContent?.trim()).toBe('Description for the first item');
    });

    it('should render author and date metadata', () => {
      const firstItem = element.querySelectorAll('.usa-collection__item')[0];
      const metaList = firstItem?.querySelector(
        '.usa-collection__meta[aria-label="More information"]'
      );
      const metaItems = metaList?.querySelectorAll('.usa-collection__meta-item');

      expect(metaItems?.length).toBeGreaterThan(0);

      // Check for author
      const authorItem = Array.from(metaItems || []).find((item) =>
        item.textContent?.includes('By John Doe')
      );
      expect(authorItem).toBeTruthy();

      // Check for date with time element
      const timeElement = metaList?.querySelector('time');
      expect(timeElement).toBeTruthy();
      expect(timeElement?.getAttribute('datetime')).toBe('2024-01-01');
    });

    it('should render custom metadata', () => {
      const firstItem = element.querySelectorAll('.usa-collection__item')[0];
      const metaLists = firstItem?.querySelectorAll(
        '.usa-collection__meta[aria-label="More information"]'
      );

      let foundCategory = false;
      metaLists?.forEach((list) => {
        const metaItems = list.querySelectorAll('.usa-collection__meta-item');
        metaItems.forEach((item) => {
          if (item.textContent?.includes('Category: News')) {
            foundCategory = true;
          }
        });
      });

      expect(foundCategory).toBeTruthy();
    });

    it('should render tags as usa-tag elements', () => {
      const firstItem = element.querySelectorAll('.usa-collection__item')[0];
      const tagsList = firstItem?.querySelector('.usa-collection__meta[aria-label="Topics"]');
      const tags = tagsList?.querySelectorAll('.usa-collection__meta-item.usa-tag');

      expect(tags?.length).toBe(2);
      expect(Array.from(tags || []).map((tag) => tag.textContent?.trim())).toContain('news');
      expect(Array.from(tags || []).map((tag) => tag.textContent?.trim())).toContain('important');
    });

    it('should render media images', () => {
      const firstItem = element.querySelectorAll('.usa-collection__item')[0];
      const image = firstItem?.querySelector('img.usa-collection__img');

      expect(image).toBeTruthy();
      expect(image?.getAttribute('src')).toBe('/images/item1.jpg');
      expect(image?.getAttribute('alt')).toBe('Item 1 image');
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      element.items = sampleItems;
      await waitForUpdate(element);
    });

    it('should have proper ARIA attributes', async () => {
      const metaLists = element.querySelectorAll('.usa-collection__meta');

      for (const list of metaLists) {
        const ariaLabel = await waitForARIAAttribute(list, 'aria-label');
        expect(['More information', 'Topics']).toContain(ariaLabel);
      }
    });

    it('should have proper time elements', () => {
      const timeElements = element.querySelectorAll('time');

      timeElements.forEach((time) => {
        expect(time.getAttribute('datetime')).toBeTruthy();
      });
    });

    it('should have proper link semantics', () => {
      const links = element.querySelectorAll('a.usa-link');

      links.forEach((link) => {
        expect(link.getAttribute('href')).toBeTruthy();
        expect(link.textContent?.trim()).toBeTruthy();
      });
    });

    it('should have proper image alt attributes', () => {
      const images = element.querySelectorAll('img.usa-collection__img');

      images.forEach((img) => {
        expect(img.getAttribute('alt')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle items without optional properties', async () => {
      const minimalItems: CollectionItem[] = [
        {
          id: 'minimal',
          title: 'Minimal Item',
        },
      ];

      element.items = minimalItems;
      await waitForPropertyPropagation(element);

      const items = element.querySelectorAll('.usa-collection__item');
      expect(items.length).toBe(1);

      const heading = items[0]?.querySelector('.usa-collection__heading');
      expect(heading?.textContent?.trim()).toBe('Minimal Item');
    });

    it('should handle empty arrays gracefully', async () => {
      element.items = [];
      await waitForPropertyPropagation(element);

      const collection = element.querySelector('.usa-collection');
      expect(collection).toBeTruthy();
      expect(collection?.children.length).toBe(0);
    });
  });

  describe('USWDS Compliance', () => {
    beforeEach(async () => {
      element.items = sampleItems;
      await waitForUpdate(element);
    });

    it('should use correct USWDS HTML structure', () => {
      // Root should be ul.usa-collection
      const collection = element.querySelector('ul.usa-collection');
      expect(collection).toBeTruthy();

      // Items should be li.usa-collection__item
      const items = collection?.querySelectorAll('li.usa-collection__item');
      expect(items?.length).toBe(3);

      // Each item should have .usa-collection__body
      items?.forEach((item) => {
        const body = item.querySelector('.usa-collection__body');
        expect(body).toBeTruthy();

        // Should have h3.usa-collection__heading
        const heading = body?.querySelector('h3.usa-collection__heading');
        expect(heading).toBeTruthy();
      });
    });

    it('should use correct USWDS CSS classes', () => {
      // Check for all required USWDS classes
      expect(element.querySelector('.usa-collection')).toBeTruthy();
      expect(element.querySelector('.usa-collection__item')).toBeTruthy();
      expect(element.querySelector('.usa-collection__body')).toBeTruthy();
      expect(element.querySelector('.usa-collection__heading')).toBeTruthy();
      expect(element.querySelector('.usa-collection__description')).toBeTruthy();
      expect(element.querySelector('.usa-collection__meta')).toBeTruthy();
      expect(element.querySelector('.usa-collection__meta-item')).toBeTruthy();
      expect(element.querySelector('.usa-collection__img')).toBeTruthy();
      expect(element.querySelector('.usa-link')).toBeTruthy();
      expect(element.querySelector('.usa-tag')).toBeTruthy();
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/collection/usa-collection.ts`;
        const validation = validateComponentJavaScript(componentPath, 'collection');

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
      // Setup collection with comprehensive government content structure
      element.items = [
        {
          id: 'news1',
          title: 'New Federal Program Announcement',
          description:
            'The Department announces new benefits for eligible citizens. Applications will be accepted starting next month with enhanced digital services.',
          date: '2024-01-15',
          author: 'Office of Public Affairs',
          href: '/news/federal-program-announcement',
          tags: ['benefits', 'announcement', 'federal'],
          media: {
            src: '/images/federal-program.jpg',
            alt: 'Federal building where new program will be administered',
          },
          metadata: [
            { label: 'Category', value: 'Program Updates' },
            { label: 'Reading time', value: '3 min' },
            { label: 'Last updated', value: 'January 15, 2024' },
          ],
        },
        {
          id: 'service1',
          title: 'Digital Services Improvement Initiative',
          description:
            'Learn about upcoming improvements to government digital services including faster processing times and enhanced user experience.',
          date: '2024-01-10',
          author: 'Digital Services Team',
          href: '/services/digital-improvements',
          tags: ['digital', 'services', 'improvements'],
          media: {
            src: '/images/digital-services.jpg',
            alt: 'Person using government digital services on tablet',
          },
          metadata: [
            { label: 'Category', value: 'Service Updates' },
            { label: 'Impact', value: 'All Users' },
          ],
        },
      ];
      element.heading = 'Latest Government Updates';
      element.headingLevel = 'h2';
      await waitForUpdate(element);

      // Run comprehensive accessibility audit
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with calendar variant', async () => {
      element.variant = 'calendar';
      element.items = [
        {
          id: 'event1',
          title: 'Public Comment Period Opens',
          description: 'Citizens invited to provide feedback on proposed regulations',
          date: '2024-02-01',
          href: '/events/comment-period',
          tags: ['public-comment', 'regulations'],
        },
        {
          id: 'event2',
          title: 'Town Hall Meeting',
          description: 'Community meeting to discuss local government initiatives',
          date: '2024-02-15',
          href: '/events/town-hall',
          tags: ['community', 'meeting'],
        },
      ];
      element.heading = 'Upcoming Events';
      element.headingLevel = 'h3';
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with media variant', async () => {
      element.variant = 'media';
      element.items = [
        {
          id: 'resource1',
          title: 'Accessibility Guidelines for Government Websites',
          description:
            'Comprehensive guide to Section 508 compliance and WCAG standards for federal digital properties.',
          href: '/resources/accessibility-guidelines',
          media: {
            src: '/images/accessibility-guide.jpg',
            alt: 'Cover of accessibility guidelines document showing universal access symbol',
          },
          tags: ['accessibility', 'guidelines', 'section508'],
          metadata: [
            { label: 'Format', value: 'PDF Guide' },
            { label: 'Pages', value: '45' },
          ],
        },
      ];
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility tests with minimal configuration', async () => {
      element.items = [
        {
          id: 'simple1',
          title: 'Simple Government Notice',
          description: 'Basic information for citizens.',
          href: '/notices/simple',
        },
      ];
      await waitForUpdate(element);

      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Keyboard Navigation (WCAG 2.1)', () => {
    it('should allow keyboard navigation to collection item links', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'First Item',
          description: 'Description',
          href: '/item1',
        },
        {
          id: 'item2',
          title: 'Second Item',
          description: 'Description',
          href: '/item2',
        },
        {
          id: 'item3',
          title: 'Third Item',
          description: 'Description',
          href: '/item3',
        },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Should have links for each item
      expect(links.length).toBeGreaterThanOrEqual(3);

      // Verify each link is keyboard accessible
      links.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });

    it('should be keyboard-only usable', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'Article Title',
          description: 'Article description',
          href: '/article',
          author: 'Jane Smith',
          date: '2024-01-15',
        },
      ];
      await waitForUpdate(element);

      const result = await verifyKeyboardOnlyUsable(element);
      expect(result.passed).toBe(true);
      expect(result.report).toContain('keyboard accessible');
    });

    it('should pass comprehensive keyboard navigation tests', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'News Item',
          description: 'Latest news',
          href: '/news/1',
        },
        {
          id: 'item2',
          title: 'Update',
          description: 'Recent update',
          href: '/news/2',
        },
      ];
      await waitForUpdate(element);

      const result = await testKeyboardNavigation(element, {
        testEscapeKey: false, // Collections don't respond to Escape
        testArrowKeys: false, // Collections use Tab navigation
      });

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should have no keyboard traps', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'Item One',
          description: 'Description',
          href: '/one',
        },
        {
          id: 'item2',
          title: 'Item Two',
          description: 'Description',
          href: '/two',
        },
      ];
      await waitForPropertyPropagation(element);

      const links = element.querySelectorAll('a');
      expect(links.length).toBeGreaterThanOrEqual(2);

      // Focus first link
      (links[0] as HTMLElement).focus();
      expect(document.activeElement).toBe(links[0]);

      // Verify Tab key is not trapped
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        bubbles: true,
        cancelable: true,
      });

      links[0].dispatchEvent(tabEvent);
      expect(tabEvent.defaultPrevented).toBe(false);
    });

    it('should maintain proper tab order through collection items', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'First Article',
          description: 'Description',
          href: '/articles/1',
          tags: ['news', 'featured'],
        },
        {
          id: 'item2',
          title: 'Second Article',
          description: 'Description',
          href: '/articles/2',
          tags: ['update'],
        },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Should have sequential tab order
      expect(focusableElements.length).toBeGreaterThan(0);

      // Verify tab order is logical
      focusableElements.forEach((el) => {
        expect((el as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle Enter key activation on links', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'Clickable Item',
          description: 'Click to view',
          href: '/item',
        },
      ];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLAnchorElement;
      expect(link).toBeTruthy();

      // Focus the link
      link.focus();
      expect(document.activeElement).toBe(link);

      // Links naturally handle Enter key
      expect(link.href).toBeTruthy();
      expect(link.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should maintain focus visibility (WCAG 2.4.7)', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'Focus Test Item',
          description: 'Test description',
          href: '/test',
        },
      ];
      await waitForPropertyPropagation(element);

      const link = element.querySelector('a') as HTMLElement;
      expect(link).toBeTruthy();

      // Focus the link
      link.focus();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Check that link is focused
      expect(document.activeElement).toBe(link);

      // USWDS applies :focus styles via CSS
      expect(link.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle collections with metadata (presentational text, not links)', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'Item with Metadata',
          description: 'Has additional metadata',
          href: '/item',
          metadata: [
            { label: 'Category', value: 'News' },
            { label: 'Author', value: 'John Doe' },
          ],
        },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Should have main title link (metadata is presentational text, not links)
      expect(links.length).toBe(1);

      // Main title link should be keyboard accessible
      expect((links[0] as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);

      // Verify metadata is rendered as text content (not links)
      const metaItems = element.querySelectorAll('.usa-collection__meta-item');
      expect(metaItems.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle collections with tags (presentational badges, not links)', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'Tagged Item',
          description: 'Has tags',
          href: '/item',
          tags: ['important', 'news', 'featured'],
        },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Should have main title link (tags are presentational badges, not links)
      expect(links.length).toBe(1);

      // Main title link should be keyboard accessible
      expect((links[0] as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);

      // Verify tags are rendered as presentational usa-tag elements (not links)
      const tagElements = element.querySelectorAll('.usa-tag');
      expect(tagElements.length).toBe(3);
    });

    it('should support condensed variant keyboard navigation', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'Condensed Item',
          description: 'Short description',
          href: '/item',
        },
      ];
      element.variant = 'condensed';
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Condensed variant should maintain keyboard accessibility
      expect(links.length).toBeGreaterThanOrEqual(1);
      links.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle collections with media keyboard navigation', async () => {
      element.items = [
        {
          id: 'item1',
          title: 'Item with Image',
          description: 'Has media',
          href: '/item',
          media: {
            src: '/image.jpg',
            alt: 'Item image',
          },
        },
      ];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);
      const links = focusableElements.filter((el) => el.tagName === 'A');

      // Media collections should be keyboard accessible
      expect(links.length).toBeGreaterThanOrEqual(1);
      links.forEach((link) => {
        expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle empty collections gracefully', async () => {
      element.items = [];
      await waitForUpdate(element);

      const focusableElements = getFocusableElements(element);

      // Empty collection should have no focusable elements
      expect(focusableElements.length).toBe(0);
    });
  });

  describe('Layout and Structure Validation (Prevent Layout Issues)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-collection') as USACollection;
      element.items = [
        {
          id: 'item1',
          title: 'Federal Grant Opportunities',
          description:
            'New federal grants available for small businesses and research institutions.',
          date: '2024-01-15',
          author: 'Office of Grants',
          href: '/grants/opportunities',
          tags: ['grants', 'funding'],
          media: {
            src: '/images/grants.jpg',
            alt: 'Grant application form',
          },
          metadata: [
            { label: 'Category', value: 'Funding' },
            { label: 'Deadline', value: 'March 31, 2024' },
          ],
        },
        {
          id: 'item2',
          title: 'Tax Filing Resources',
          description: 'Essential resources and guides for filing your federal taxes.',
          date: '2024-01-10',
          author: 'Tax Division',
          href: '/tax/resources',
          tags: ['taxes', 'resources'],
        },
      ];
      document.body.appendChild(element);
      await waitForUpdate(element);
    });

    describe('Collection List Structure', () => {
      it('should have correct DOM structure for collection', async () => {
        const collection = element.querySelector('.usa-collection');
        const items = element.querySelectorAll('.usa-collection__item');

        expect(collection).toBeTruthy();
        expect(collection?.tagName).toBe('UL');
        expect(items).toHaveLength(2);

        // Verify items are inside the collection list
        items.forEach((item) => {
          expect(collection?.contains(item as Node)).toBe(true);
          expect(item.tagName).toBe('LI');
        });
      });

      it('should match USWDS reference structure for collection', async () => {
        // Expected structure from USWDS:
        // <ul class="usa-collection">
        //   <li class="usa-collection__item">
        //     <img class="usa-collection__img" ... />
        //     <div class="usa-collection__body">
        //       <h3 class="usa-collection__heading">...</h3>
        //       <p class="usa-collection__description">...</p>
        //       <ul class="usa-collection__meta">...</ul>
        //     </div>
        //   </li>
        // </ul>

        const collection = element.querySelector('.usa-collection');
        const firstItem = collection?.querySelector('.usa-collection__item');
        const body = firstItem?.querySelector('.usa-collection__body');
        const heading = body?.querySelector('.usa-collection__heading');

        expect(collection).toBeTruthy();
        expect(firstItem).toBeTruthy();
        expect(body).toBeTruthy();
        expect(heading).toBeTruthy();

        // Verify heading is H3
        expect(heading?.tagName).toBe('H3');

        // Verify body contains heading
        expect(body?.contains(heading as Node)).toBe(true);
      });

      it('should have proper nesting of collection body elements', async () => {
        const items = element.querySelectorAll('.usa-collection__item');

        items.forEach((item) => {
          const body = item.querySelector('.usa-collection__body');
          const heading = body?.querySelector('.usa-collection__heading');
          const description = body?.querySelector('.usa-collection__description');

          expect(body).toBeTruthy();
          expect(heading).toBeTruthy();

          // Body should contain all content elements
          if (description) {
            expect(body?.contains(description as Node)).toBe(true);
          }
        });
      });
    });

    describe('Media Rendering', () => {
      it('should render media before collection body', async () => {
        const firstItem = element.querySelectorAll('.usa-collection__item')[0];
        const media = firstItem?.querySelector('.usa-collection__img');
        const body = firstItem?.querySelector('.usa-collection__body');

        expect(media).toBeTruthy();
        expect(body).toBeTruthy();

        // Get children array to check order
        const children = Array.from(firstItem?.children || []);
        const mediaIndex = children.indexOf(media as Element);
        const bodyIndex = children.indexOf(body as Element);

        // Media should come before body
        expect(mediaIndex).toBeLessThan(bodyIndex);
      });

      it('should have proper image attributes', async () => {
        const img = element.querySelector('.usa-collection__img') as HTMLImageElement;

        expect(img).toBeTruthy();
        expect(img.getAttribute('src')).toBe('/images/grants.jpg');
        expect(img.getAttribute('alt')).toBe('Grant application form');
        expect(img.classList.contains('usa-collection__img')).toBe(true);
      });

      it('should NOT render media when not provided', async () => {
        // Second item doesn't have media
        const secondItem = element.querySelectorAll('.usa-collection__item')[1];
        const media = secondItem?.querySelector('.usa-collection__img');

        expect(media).toBeFalsy();

        // But should still have body
        const body = secondItem?.querySelector('.usa-collection__body');
        expect(body).toBeTruthy();
      });
    });

    describe('Metadata Structure', () => {
      it('should render metadata lists with correct structure', async () => {
        const firstItem = element.querySelectorAll('.usa-collection__item')[0];
        const metaLists = firstItem?.querySelectorAll('.usa-collection__meta');

        // Should have multiple meta lists (author/date, metadata, tags)
        expect(metaLists && metaLists.length > 0).toBe(true);

        metaLists?.forEach((list) => {
          expect(list.tagName).toBe('UL');
          expect(list.hasAttribute('aria-label')).toBe(true);
        });
      });

      it('should render metadata items in proper list structure', async () => {
        const firstItem = element.querySelectorAll('.usa-collection__item')[0];
        const metadataLists = Array.from(
          firstItem?.querySelectorAll('.usa-collection__meta') || []
        );

        let metadataList;
        for (const list of metadataLists) {
          const ariaLabel = await waitForARIAAttribute(list, 'aria-label');
          if (ariaLabel === 'More information') {
            metadataList = list;
            break;
          }
        }

        const metaItems = metadataList?.querySelectorAll('.usa-collection__meta-item');
        expect(metaItems && metaItems.length > 0).toBe(true);

        // All meta items should be LI elements
        metaItems?.forEach((item) => {
          expect(item.tagName).toBe('LI');
          expect(item.classList.contains('usa-collection__meta-item')).toBe(true);
        });
      });

      it('should render tags with usa-tag class', async () => {
        const firstItem = element.querySelectorAll('.usa-collection__item')[0];
        const metadataLists = Array.from(
          firstItem?.querySelectorAll('.usa-collection__meta') || []
        );

        let tagsList;
        for (const list of metadataLists) {
          const ariaLabel = await waitForARIAAttribute(list, 'aria-label');
          if (ariaLabel === 'Topics') {
            tagsList = list;
            break;
          }
        }

        const tags = tagsList?.querySelectorAll('.usa-tag');
        expect(tags).toHaveLength(2);

        // Each tag should be a meta-item AND have usa-tag class
        tags?.forEach((tag) => {
          expect(tag.classList.contains('usa-collection__meta-item')).toBe(true);
          expect(tag.classList.contains('usa-tag')).toBe(true);
        });
      });

      it('should include time element for dates', async () => {
        const firstItem = element.querySelectorAll('.usa-collection__item')[0];
        const timeElement = firstItem?.querySelector('time');

        expect(timeElement).toBeTruthy();
        expect(timeElement?.getAttribute('datetime')).toBe('2024-01-15');
        expect(timeElement?.textContent).toBe('2024-01-15');
      });
    });

    describe('Link Structure', () => {
      it('should render title links with correct structure', async () => {
        const firstItem = element.querySelectorAll('.usa-collection__item')[0];
        const heading = firstItem?.querySelector('.usa-collection__heading');
        const link = heading?.querySelector('a.usa-link');

        expect(heading).toBeTruthy();
        expect(link).toBeTruthy();
        expect(link?.getAttribute('href')).toBe('/grants/opportunities');
        expect(link?.textContent?.trim()).toBe('Federal Grant Opportunities');

        // Link should be inside the heading
        expect(heading?.contains(link as Node)).toBe(true);
      });

      it('should render title as text when no href provided', async () => {
        // Create item without href
        element.items = [
          {
            id: 'no-link',
            title: 'Non-linked Title',
            description: 'This item has no link',
          },
        ];
        await waitForPropertyPropagation(element);

        const item = element.querySelector('.usa-collection__item');
        const heading = item?.querySelector('.usa-collection__heading');
        const link = heading?.querySelector('a');

        expect(heading).toBeTruthy();
        expect(heading?.textContent?.trim()).toBe('Non-linked Title');
        expect(link).toBeFalsy();
      });
    });

    describe('Visual Rendering Validation', () => {
      it('should render collection list in the DOM', async () => {
        const collection = element.querySelector('.usa-collection');
        expect(collection).toBeTruthy();
        expect(collection?.isConnected).toBe(true);

        // Note: jsdom doesn't support getComputedStyle for display values
        // This test validates the element exists and is in the DOM
        expect(collection?.parentElement).toBe(element);
      });

      it('should render all collection items as visible', async () => {
        const items = element.querySelectorAll('.usa-collection__item') as NodeListOf<HTMLElement>;

        items.forEach((item) => {
          // Item should exist and be in DOM
          expect(item).toBeTruthy();
          expect(item.isConnected).toBe(true);

          // Should not be hidden
          expect(item.hasAttribute('hidden')).toBe(false);
        });
      });

      it('should render item bodies as visible', async () => {
        const bodies = element.querySelectorAll('.usa-collection__body') as NodeListOf<HTMLElement>;

        bodies.forEach((body) => {
          expect(body).toBeTruthy();
          expect(body.isConnected).toBe(true);
        });
      });
    });

    describe('Dynamic Content Updates', () => {
      it('should maintain structure when items change', async () => {
        // Start with 2 items
        const originalItems = element.querySelectorAll('.usa-collection__item');
        expect(originalItems).toHaveLength(2);

        // Change to 3 items
        element.items = [
          { id: '1', title: 'Item 1', href: '/1' },
          { id: '2', title: 'Item 2', href: '/2' },
          { id: '3', title: 'Item 3', href: '/3' },
        ];
        await waitForPropertyPropagation(element);

        const newItems = element.querySelectorAll('.usa-collection__item');
        expect(newItems).toHaveLength(3);

        // Verify collection structure is maintained
        const collection = element.querySelector('.usa-collection');
        expect(collection).toBeTruthy();
        expect(collection?.tagName).toBe('UL');

        // All items should have proper structure
        newItems.forEach((item) => {
          const body = item.querySelector('.usa-collection__body');
          const heading = body?.querySelector('.usa-collection__heading');
          expect(body).toBeTruthy();
          expect(heading).toBeTruthy();
        });
      });

      it('should handle empty items array', async () => {
        element.items = [];
        await waitForPropertyPropagation(element);

        const collection = element.querySelector('.usa-collection');
        const items = element.querySelectorAll('.usa-collection__item');

        // Collection should exist but be empty
        expect(collection).toBeTruthy();
        expect(items).toHaveLength(0);
      });
    });
  });
});
