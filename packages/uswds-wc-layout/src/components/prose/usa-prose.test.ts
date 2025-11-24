import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../prose/usa-prose.ts';
import type { USAProse, ProseDetail } from '../prose/usa-prose.js';
import {
  waitForUpdate,
  testPropertyChanges,
  validateComponentJavaScript,
} from '@uswds-wc/test-utils/test-utils.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { waitForPropertyPropagation } from '@uswds-wc/test-utils';

describe('USAProse', () => {
  let element: USAProse;

  beforeEach(() => {
    element = document.createElement('usa-prose') as USAProse;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(element.variant).toBe('default');
      expect(element.width).toBe('default');
      expect(element.content).toBe('');
    });

    it('should update variant property', async () => {
      await testPropertyChanges(
        element,
        'variant',
        ['condensed', 'expanded', 'default'],
        (el, value) => {
          expect(el.variant).toBe(value);
        }
      );
    });

    it('should update width property', async () => {
      await testPropertyChanges(element, 'width', ['narrow', 'wide', 'default'], (el, value) => {
        expect(el.width).toBe(value);
      });
    });

    it('should update content property', async () => {
      element.content = '<p>Test content</p>';
      await waitForUpdate(element);
      expect(element.content).toBe('<p>Test content</p>');
    });
  });

  describe('Rendering', () => {
    it('should render prose container with correct classes', async () => {
      await waitForUpdate(element);

      const proseDiv = element.querySelector('.usa-prose');
      expect(proseDiv).toBeTruthy();
      expect(proseDiv?.classList.contains('usa-prose')).toBe(true);
    });

    it('should apply variant classes correctly', async () => {
      element.variant = 'condensed';
      await waitForPropertyPropagation(element);

      const proseDiv = element.querySelector('.usa-prose');
      expect(proseDiv?.classList.contains('usa-prose--condensed')).toBe(true);

      element.variant = 'expanded';
      await waitForUpdate(element);
      expect(proseDiv?.classList.contains('usa-prose--expanded')).toBe(true);
    });

    it('should apply width classes correctly', async () => {
      element.width = 'narrow';
      await waitForPropertyPropagation(element);

      const proseDiv = element.querySelector('.usa-prose');
      expect(proseDiv?.classList.contains('usa-prose--narrow')).toBe(true);

      element.width = 'wide';
      await waitForUpdate(element);
      expect(proseDiv?.classList.contains('usa-prose--wide')).toBe(true);
    });

    it('should combine variant and width classes', async () => {
      element.variant = 'condensed';
      element.width = 'narrow';
      await waitForPropertyPropagation(element);

      const proseDiv = element.querySelector('.usa-prose');
      expect(proseDiv?.classList.contains('usa-prose')).toBe(true);
      expect(proseDiv?.classList.contains('usa-prose--condensed')).toBe(true);
      expect(proseDiv?.classList.contains('usa-prose--narrow')).toBe(true);
    });

    it('should render slot content', async () => {
      const slotParagraph = document.createElement('p');
      slotParagraph.textContent = 'Slot content';
      element.appendChild(slotParagraph);
      await waitForUpdate(element);

      expect(element.textContent).toContain('Slot content');
    });

    it('should render HTML content property', async () => {
      element.content = '<p>HTML content</p>';
      await waitForPropertyPropagation(element);

      const contentDiv = element.querySelector('div:last-child');
      expect(contentDiv?.innerHTML).toContain('<p>HTML content</p>');
    });

    it('should render both slot and content property', async () => {
      // Set content first, then add slot content
      element.content = '<p>Property content</p>';
      await waitForUpdate(element);

      // Add slot content using appendChild to avoid innerHTML conflicts
      const slotParagraph = document.createElement('p');
      slotParagraph.textContent = 'Slot content';
      element.appendChild(slotParagraph);
      await waitForUpdate(element);

      expect(element.textContent).toContain('Slot content');
      expect(element.textContent).toContain('Property content');
    });
  });

  describe('CSS Classes', () => {
    it('should generate correct prose classes for default state', () => {
      const classes = (element as any).getProseClasses();
      expect(classes).toBe('usa-prose');
    });

    it('should generate correct classes for variant', () => {
      element.variant = 'condensed';
      const classes = (element as any).getProseClasses();
      expect(classes).toBe('usa-prose usa-prose--condensed');
    });

    it('should generate correct classes for width', () => {
      element.width = 'narrow';
      const classes = (element as any).getProseClasses();
      expect(classes).toBe('usa-prose usa-prose--narrow');
    });

    it('should generate correct classes for both variant and width', () => {
      element.variant = 'expanded';
      element.width = 'wide';
      const classes = (element as any).getProseClasses();
      expect(classes).toBe('usa-prose usa-prose--expanded usa-prose--wide');
    });
  });

  describe('Events', () => {
    it('should dispatch prose-change event when content changes', async () => {
      let eventFired = false;
      let eventDetail: ProseDetail | null = null;

      element.addEventListener('prose-change', (e: Event) => {
        const customEvent = e as CustomEvent<ProseDetail>;
        eventFired = true;
        eventDetail = customEvent.detail;
      });

      element.content = '<p>New content</p>';
      (element as any).handleContentChange();

      expect(eventFired).toBe(true);
      expect((eventDetail as any)?.content).toBe('<p>New content</p>');
      expect((eventDetail as any)?.variant).toBe('default');
    });

    it('should include current variant in event detail', async () => {
      let eventDetail: ProseDetail | null = null;

      element.addEventListener('prose-change', (e: Event) => {
        const customEvent = e as CustomEvent<ProseDetail>;
        eventDetail = customEvent.detail;
      });

      element.variant = 'condensed';
      element.content = '<p>Test</p>';
      (element as any).handleContentChange();

      expect((eventDetail as any)?.variant).toBe('condensed');
    });
  });

  describe('Public API Methods', () => {
    it('should set variant using setVariant method', () => {
      const spy = vi.spyOn(element as any, 'handleContentChange');

      element.setVariant('condensed');
      expect(element.variant).toBe('condensed');
      expect(spy).toHaveBeenCalled();
    });

    it('should set width using setWidth method', () => {
      const spy = vi.spyOn(element as any, 'handleContentChange');

      element.setWidth('narrow');
      expect(element.width).toBe('narrow');
      expect(spy).toHaveBeenCalled();
    });

    it('should set content using setContent method', () => {
      const spy = vi.spyOn(element as any, 'handleContentChange');

      element.setContent('<p>New content</p>');
      expect(element.content).toBe('<p>New content</p>');
      expect(spy).toHaveBeenCalled();
    });

    it('should get content using getContent method', () => {
      element.content = '<p>Test content</p>';
      expect(element.getContent()).toBe('<p>Test content</p>');
    });

    it('should add content using addContent method', () => {
      const spy = vi.spyOn(element as any, 'handleContentChange');

      element.content = '<p>Initial</p>';
      element.addContent('<p>Additional</p>');

      expect(element.content).toBe('<p>Initial</p><p>Additional</p>');
      expect(spy).toHaveBeenCalled();
    });

    it('should clear content using clearContent method', () => {
      const spy = vi.spyOn(element as any, 'handleContentChange');

      element.content = '<p>Some content</p>';
      element.clearContent();

      expect(element.content).toBe('');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Content Handling', () => {
    it('should handle empty content gracefully', async () => {
      element.content = '';
      await waitForPropertyPropagation(element);

      const proseDiv = element.querySelector('.usa-prose');
      expect(proseDiv).toBeTruthy();

      // Should only have slot content, no content div
      const contentDivs = element.querySelectorAll('div');
      expect(contentDivs.length).toBe(1); // Just the prose container
    });

    it('should handle complex HTML content', async () => {
      const complexContent = `
        <h2>Heading</h2>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <blockquote>Quote content</blockquote>
      `;

      element.content = complexContent;
      await waitForPropertyPropagation(element);

      const contentDiv = element.querySelector('div:last-child');
      expect(contentDiv?.innerHTML).toContain('<h2>Heading</h2>');
      expect(contentDiv?.innerHTML).toContain('<ul>');
      expect(contentDiv?.innerHTML).toContain('<blockquote>');
    });

    it('should handle code content', async () => {
      element.content = '<pre><code>const x = 5;</code></pre>';
      await waitForUpdate(element);

      const contentDiv = element.querySelector('div:last-child');
      expect(contentDiv?.innerHTML).toContain('<pre><code>const x = 5;</code></pre>');
    });

    it('should handle table content', async () => {
      const tableContent = `
        <table>
          <thead>
            <tr><th>Header 1</th><th>Header 2</th></tr>
          </thead>
          <tbody>
            <tr><td>Cell 1</td><td>Cell 2</td></tr>
          </tbody>
        </table>
      `;

      element.content = tableContent;
      await waitForPropertyPropagation(element);

      const contentDiv = element.querySelector('div:last-child');
      expect(contentDiv?.innerHTML).toContain('<table>');
      expect(contentDiv?.innerHTML).toContain('<thead>');
      expect(contentDiv?.innerHTML).toContain('<tbody>');
    });
  });

  describe('Light DOM Rendering', () => {
    it('should use light DOM rendering', () => {
      expect(element.shadowRoot).toBe(null);
      expect(element.renderRoot).toBe(element);
    });

    it('should apply USWDS classes directly to light DOM', async () => {
      await waitForUpdate(element);

      const proseDiv = element.querySelector('.usa-prose');
      expect(proseDiv).toBeTruthy();
      expect(proseDiv?.parentElement).toBe(element);
    });
  });

  describe('Variant Behaviors', () => {
    it('should support all variant options', async () => {
      const variants = ['default', 'condensed', 'expanded'] as const;

      for (const variant of variants) {
        element.variant = variant;
        await waitForUpdate(element);
        expect(element.variant).toBe(variant);
      }
    });

    it('should support all width options', async () => {
      const widths = ['default', 'narrow', 'wide'] as const;

      for (const width of widths) {
        element.width = width;
        await waitForUpdate(element);
        expect(element.width).toBe(width);
      }
    });
  });

  describe('Accessibility', () => {
    it('should maintain semantic HTML structure', async () => {
      element.content = '<h2>Heading</h2><p>Content</p>';
      await waitForPropertyPropagation(element);

      const heading = element.querySelector('h2');
      const paragraph = element.querySelector('p');

      expect(heading).toBeTruthy();
      expect(paragraph).toBeTruthy();
      expect(heading?.textContent).toBe('Heading');
    });

    it('should preserve accessibility attributes in content', async () => {
      element.content =
        '<img src="test.jpg" alt="Test image"><a href="#" aria-label="Test link">Link</a>';
      await waitForPropertyPropagation(element);

      const img = element.querySelector('img');
      const link = element.querySelector('a');

      expect(img?.getAttribute('alt')).toBe('Test image');
      expect(link?.getAttribute('aria-label')).toBe('Test link');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in content', async () => {
      const specialContent =
        '<p>&lt;script&gt;alert("test")&lt;/script&gt; &amp; special chars</p>';
      element.content = specialContent;
      await waitForPropertyPropagation(element);

      const contentDiv = element.querySelector('div:last-child');
      expect(contentDiv?.innerHTML).toContain('&lt;script&gt;');
      expect(contentDiv?.innerHTML).toContain('&amp;');
    });

    it('should handle very long content', async () => {
      const longContent = '<p>' + 'Very long content. '.repeat(1000) + '</p>';
      element.content = longContent;
      await waitForUpdate(element);

      expect(element.content.length).toBeGreaterThan(10000);
      expect(element.querySelector('p')).toBeTruthy();
    });

    it('should handle rapid property changes', async () => {
      element.variant = 'condensed';
      element.width = 'narrow';
      element.content = '<p>Test 1</p>';

      element.variant = 'expanded';
      element.width = 'wide';
      element.content = '<p>Test 2</p>';

      await waitForUpdate(element);

      expect(element.variant).toBe('expanded');
      expect(element.width).toBe('wide');
      expect(element.content).toBe('<p>Test 2</p>');
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid updates efficiently', async () => {
      const startTime = performance.now();

      for (let i = 0; i < 50; i++) {
        element.content = `<p>Content ${i}</p>`;
        element.variant = i % 2 === 0 ? 'condensed' : 'expanded';
      }

      await waitForUpdate(element);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/prose/usa-prose.ts`;
        const validation = validateComponentJavaScript(componentPath, 'prose');

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
      // Test default empty prose
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test simple prose content
      element.content = `
        <h2>Federal Program Information</h2>
        <p>This section provides important information about federal programs available to citizens.</p>
        <p>For more information, please contact your local representative.</p>
      `;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test prose with condensed variant
      element.variant = 'condensed';
      element.content = `
        <h3>Application Requirements</h3>
        <p>Please ensure you have the following documents ready:</p>
        <ul>
          <li>Valid identification (passport or driver's license)</li>
          <li>Proof of income (tax returns or pay stubs)</li>
          <li>Social Security card</li>
        </ul>
      `;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test prose with expanded variant and narrow width
      element.variant = 'expanded';
      element.width = 'narrow';
      element.content = `
        <h1>Government Services Portal</h1>
        <p>Welcome to the official government services portal. Here you can access various federal programs and services.</p>
        <h2>Available Services</h2>
        <p>Our services include healthcare enrollment, tax filing assistance, and social security benefits.</p>
        <blockquote>
          <p>"Government exists to serve the people, and we are committed to providing accessible, efficient services to all citizens."</p>
        </blockquote>
      `;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test prose with wide width and rich content
      element.variant = 'default';
      element.width = 'wide';
      element.content = `
        <h2>Federal Benefits Overview</h2>
        <p>The federal government offers a wide range of benefits and services to eligible citizens.</p>
        <table>
          <caption>Common Federal Benefits</caption>
          <thead>
            <tr>
              <th scope="col">Benefit Type</th>
              <th scope="col">Eligibility</th>
              <th scope="col">How to Apply</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Social Security</th>
              <td>Age 62 or older, or disability</td>
              <td>Online at ssa.gov</td>
            </tr>
            <tr>
              <th scope="row">Medicare</th>
              <td>Age 65 or older, or disability</td>
              <td>Online or call 1-800-MEDICARE</td>
            </tr>
          </tbody>
        </table>
      `;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should maintain accessibility during dynamic updates', async () => {
      // Set initial accessible state
      element.content = `
        <h2>Initial Content</h2>
        <p>This is the initial content for accessibility testing.</p>
      `;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update variant
      element.variant = 'condensed';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update width
      element.width = 'narrow';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update content with headings and structure
      element.content = `
        <h1>Updated Document</h1>
        <h2>Section 1</h2>
        <p>Updated content with proper heading structure.</p>
        <h3>Subsection</h3>
        <p>This ensures proper heading hierarchy for screen readers.</p>
        <h2>Section 2</h2>
        <p>Another section with important information.</p>
      `;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Update to wide expanded content
      element.variant = 'expanded';
      element.width = 'wide';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should pass accessibility with complex government content', async () => {
      // Federal agency content with proper structure
      element.variant = 'default';
      element.width = 'default';
      element.content = `
        <h1>Department of Federal Services</h1>
        
        <h2>Mission Statement</h2>
        <p>Our mission is to provide efficient, accessible government services to all citizens of the United States.</p>
        
        <h2>Contact Information</h2>
        <dl>
          <dt>Phone:</dt>
          <dd><a href="tel:+18005551234">1-800-555-1234</a></dd>
          <dt>Email:</dt>
          <dd><a href="mailto:info@federal.gov">info@federal.gov</a></dd>
          <dt>Address:</dt>
          <dd>
            123 Federal Building<br>
            Washington, DC 20001
          </dd>
        </dl>
        
        <h2>Office Hours</h2>
        <p>Monday through Friday: 8:00 AM - 5:00 PM (EST)<br>
        Saturday: 9:00 AM - 1:00 PM (EST)<br>
        Sunday: Closed</p>
        
        <h2>Emergency Services</h2>
        <p>For emergency assistance outside of normal business hours, please call our 24/7 emergency hotline at <a href="tel:+18005559999">1-800-555-9999</a>.</p>
        
        <h2>Accessibility Statement</h2>
        <p>This agency is committed to providing services that are accessible to all individuals. If you need assistance or have accessibility concerns, please contact us using the information above.</p>
      `;
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });
});
