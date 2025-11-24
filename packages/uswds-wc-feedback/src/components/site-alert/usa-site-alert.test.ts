import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../site-alert/usa-site-alert.ts';
import type { USASiteAlert } from '../site-alert/usa-site-alert.js';
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

describe('USASiteAlert', () => {
  let element: USASiteAlert;

  beforeEach(() => {
    element = document.createElement('usa-site-alert') as USASiteAlert;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Properties', () => {
    it('should have default properties', () => {
      expect(element.type).toBe('info');
      expect(element.heading).toBe('');
      expect(element.content).toBe('');
      expect(element.slim).toBe(false);
      expect(element.noIcon).toBe(false);
      expect(element.closable).toBe(false);
      expect(element.visible).toBe(true);
      expect(element.closeLabel).toBe('Close');
    });

    it('should update type property', async () => {
      await testPropertyChanges(element, 'type', ['info', 'emergency'], (el, value) => {
        expect(el.type).toBe(value);
      });
    });

    it('should update heading property', async () => {
      await testPropertyChanges(
        element,
        'heading',
        ['Alert Heading', 'Emergency Notice', 'System Update'],
        (el, value) => {
          expect(el.heading).toBe(value);
        }
      );
    });

    it('should update content property', async () => {
      element.content = '<p>Alert content</p>';
      await waitForUpdate(element);
      expect(element.content).toBe('<p>Alert content</p>');
    });

    it('should update boolean properties', async () => {
      const booleanProps = ['slim', 'noIcon', 'closable', 'visible'] as const;

      for (const prop of booleanProps) {
        element[prop] = true;
        await waitForUpdate(element);
        expect(element[prop]).toBe(true);

        element[prop] = false;
        await waitForUpdate(element);
        expect(element[prop]).toBe(false);
      }
    });

    it('should update closeLabel property', async () => {
      element.closeLabel = 'Dismiss Alert';
      await waitForUpdate(element);
      expect(element.closeLabel).toBe('Dismiss Alert');
    });
  });

  describe('Rendering', () => {
    it('should render site alert container with correct classes', async () => {
      await waitForUpdate(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert).toBeTruthy();
      expect(siteAlert?.classList.contains('usa-site-alert')).toBe(true);
      expect(siteAlert?.classList.contains('usa-site-alert--info')).toBe(true);

      const alertBody = element.querySelector('.usa-alert__body');
      expect(alertBody).toBeTruthy();
      expect(alertBody?.classList.contains('usa-alert__body')).toBe(true);
    });

    it('should apply type classes correctly', async () => {
      // Test info type (default)
      await waitForUpdate(element);
      let siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--info')).toBe(true);

      // Test emergency type
      element.type = 'emergency';
      await waitForPropertyPropagation(element);
      siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--emergency')).toBe(true);
      expect(siteAlert?.classList.contains('usa-site-alert--info')).toBe(false);
    });

    it('should apply slim modifier class', async () => {
      element.slim = true;
      await waitForPropertyPropagation(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--slim')).toBe(true);
    });

    it('should apply no-icon modifier class', async () => {
      element.noIcon = true;
      await waitForPropertyPropagation(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--no-icon')).toBe(true);
    });

    it('should combine multiple modifier classes', async () => {
      element.type = 'emergency';
      element.slim = true;
      element.noIcon = true;
      await waitForPropertyPropagation(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert')).toBe(true);
      expect(siteAlert?.classList.contains('usa-site-alert--emergency')).toBe(true);
      expect(siteAlert?.classList.contains('usa-site-alert--slim')).toBe(true);
      expect(siteAlert?.classList.contains('usa-site-alert--no-icon')).toBe(true);
    });

    it('should render heading when provided', async () => {
      element.heading = 'Test Alert Heading';
      await waitForPropertyPropagation(element);

      const heading = element.querySelector('.usa-alert__heading');
      expect(heading).toBeTruthy();
      expect(heading?.textContent?.trim()).toBe('Test Alert Heading');
      expect(heading?.tagName.toLowerCase()).toBe('h3');
    });

    it('should render empty heading when not provided', async () => {
      element.heading = '';
      await waitForPropertyPropagation(element);

      const heading = element.querySelector('.usa-alert__heading');
      expect(heading).toBeTruthy();
      expect(heading?.textContent?.trim()).toBe('');
    });

    it('should render content via slot', async () => {
      const slotContent = document.createElement('p');
      slotContent.textContent = 'Alert content from slot';
      element.appendChild(slotContent);
      await waitForUpdate(element);

      const textContainer = element.querySelector('.usa-alert__text');
      expect(textContainer).toBeTruthy();
      expect(element.textContent).toContain('Alert content from slot');
    });

    it('should render slot content', async () => {
      const slotParagraph = document.createElement('p');
      slotParagraph.textContent = 'Slot content';
      element.appendChild(slotParagraph);
      await waitForUpdate(element);

      expect(element.textContent).toContain('Slot content');
    });

    it('should render slot content properly', async () => {
      // Add slot content
      const slotParagraph = document.createElement('p');
      slotParagraph.textContent = 'Slot content';
      element.appendChild(slotParagraph);

      await waitForUpdate(element);

      const textContainer = element.querySelector('.usa-alert__text');
      expect(textContainer).toBeTruthy();
      expect(element.textContent).toContain('Slot content');
    });

    it('should not render close button (closable functionality not implemented)', async () => {
      element.closable = true;
      await waitForUpdate(element);

      // Note: closable functionality is not implemented in the current component
      const closeButton = element.querySelector('.usa-site-alert__close');
      expect(closeButton).toBeFalsy();
    });

    it('should not render close button when not closable', async () => {
      element.closable = false;
      await waitForPropertyPropagation(element);

      const closeButton = element.querySelector('.usa-site-alert__close');
      expect(closeButton).toBeFalsy();
    });

    it('should store custom close label (functionality not implemented)', async () => {
      element.closable = true;
      element.closeLabel = 'Dismiss Alert';
      await waitForUpdate(element);

      // Property is stored but close button is not implemented
      expect(element.closeLabel).toBe('Dismiss Alert');
      const closeButton = element.querySelector('.usa-site-alert__close');
      expect(closeButton).toBeFalsy();
    });

    it('should not render when not visible', async () => {
      element.visible = false;
      await waitForUpdate(element);

      expect(element.querySelector('.usa-site-alert')).toBeNull();
    });
  });

  describe('USWDS HTML Structure', () => {
    it('should match USWDS site alert HTML structure', async () => {
      element.heading = 'Test Alert';
      await waitForUpdate(element);

      // Check section container
      const section = element.querySelector('section.usa-site-alert');
      expect(section).toBeTruthy();
      expect(section?.getAttribute('aria-label')).toBe('Site alert');

      // Check alert body
      const body = section?.querySelector('.usa-alert__body');
      expect(body).toBeTruthy();

      // Check heading
      const heading = body?.querySelector('.usa-alert__heading');
      expect(heading).toBeTruthy();
      expect(heading?.tagName.toLowerCase()).toBe('h3');

      // Check text container
      const text = body?.querySelector('.usa-alert__text');
      expect(text).toBeTruthy();
    });

    it('should maintain proper DOM hierarchy', async () => {
      element.heading = 'Test';
      await waitForPropertyPropagation(element);

      const section = element.querySelector('section.usa-site-alert');
      const body = section?.querySelector('.usa-alert__body');
      const heading = body?.querySelector('.usa-alert__heading');
      const text = body?.querySelector('.usa-alert__text');

      // Verify hierarchy - updated for nested alert structure
      const alertContainer = section?.querySelector('.usa-alert');
      expect(section?.parentElement).toBe(element);
      expect(alertContainer?.parentElement).toBe(section);
      expect(body?.parentElement).toBe(alertContainer);
      expect(heading?.parentElement).toBe(body);
      expect(text?.parentElement).toBe(body);
    });
  });

  describe('Event Handling', () => {
    it('should not dispatch close events (closable functionality not implemented)', async () => {
      element.closable = true;
      element.heading = 'Test Alert';
      await waitForUpdate(element);

      let eventFired = false;
      element.addEventListener('site-alert-close', () => {
        eventFired = true;
      });

      // No close button to click since functionality is not implemented
      const closeButton = element.querySelector('.usa-site-alert__close');
      expect(closeButton).toBeFalsy();
      expect(eventFired).toBe(false);
    });

    it('should not hide alert when close button clicked (not implemented)', async () => {
      element.closable = true;
      await waitForUpdate(element);

      // No close button exists
      const closeButton = element.querySelector('.usa-site-alert__close');
      expect(closeButton).toBeFalsy();
      expect(element.visible).toBe(true);
    });

    it('should not close alert on Escape key (not implemented)', async () => {
      element.closable = true;
      await waitForPropertyPropagation(element);

      const section = element.querySelector('section') as HTMLElement;
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      section.dispatchEvent(escapeEvent);

      expect(element.visible).toBe(true);
    });

    it('should not close on Escape key when not closable', async () => {
      element.closable = false;
      await waitForPropertyPropagation(element);

      const section = element.querySelector('section') as HTMLElement;
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      section.dispatchEvent(escapeEvent);

      expect(element.visible).toBe(true);
    });

    it('should not close on other key presses', async () => {
      element.closable = true;
      await waitForPropertyPropagation(element);

      const section = element.querySelector('section') as HTMLElement;
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      section.dispatchEvent(enterEvent);

      expect(element.visible).toBe(true);
    });
  });

  describe('Public API Methods', () => {
    it('should show alert using show() method', async () => {
      element.visible = false;
      await waitForUpdate(element);
      expect(element.querySelector('.usa-site-alert')).toBeNull();

      element.show();
      await waitForUpdate(element);

      expect(element.visible).toBe(true);
      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert).toBeTruthy();
    });

    it('should hide alert using hide() method', async () => {
      element.visible = true;
      await waitForPropertyPropagation(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert).toBeTruthy();

      element.hide();
      await waitForUpdate(element);

      expect(element.visible).toBe(false);
      expect(element.querySelector('.usa-site-alert')).toBeNull();
    });

    it('should toggle alert visibility using toggle() method', async () => {
      // Start visible
      element.visible = true;
      await waitForUpdate(element);
      expect(element.querySelector('.usa-site-alert')).toBeTruthy();

      // Toggle to hidden
      element.toggle();
      await waitForUpdate(element);
      expect(element.visible).toBe(false);
      expect(element.querySelector('.usa-site-alert')).toBeNull();

      // Toggle back to visible
      element.toggle();
      await waitForUpdate(element);
      expect(element.visible).toBe(true);
      expect(element.querySelector('.usa-site-alert')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      await waitForUpdate(element);

      const section = element.querySelector('section');
      expect(section?.getAttribute('aria-label')).toBe('Site alert');
    });

    it('should not have accessible close button (not implemented)', async () => {
      element.closable = true;
      element.closeLabel = 'Dismiss notification';
      await waitForPropertyPropagation(element);

      const closeButton = element.querySelector('.usa-site-alert__close');
      expect(closeButton).toBeFalsy();
    });

    it('should maintain semantic heading structure', async () => {
      element.heading = 'Emergency Alert';
      await waitForPropertyPropagation(element);

      const heading = element.querySelector('.usa-alert__heading');
      expect(heading?.tagName.toLowerCase()).toBe('h3');
      expect(heading?.textContent?.trim()).toBe('Emergency Alert');
    });

    it('should not have keyboard navigation for close (not implemented)', async () => {
      element.closable = true;
      await waitForPropertyPropagation(element);

      const closeButton = element.querySelector('.usa-site-alert__close');
      expect(closeButton).toBeFalsy();
    });

    it('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      element.heading = 'Test Alert';
      await waitForUpdate(element);
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });
  });

  describe('Light DOM Rendering', () => {
    it('should use light DOM rendering', () => {
      expect(element.shadowRoot).toBe(null);
      expect(element.renderRoot).toBe(element);
    });

    it('should apply USWDS classes directly to light DOM', async () => {
      await waitForUpdate(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert).toBeTruthy();
      expect(siteAlert?.parentElement).toBe(element);
    });
  });

  describe('Content Handling', () => {
    it('should handle empty content gracefully', async () => {
      await waitForUpdate(element);

      const textContainer = element.querySelector('.usa-alert__text');
      expect(textContainer).toBeTruthy();

      // Should render slot
      const slotElement = textContainer?.querySelector('slot');
      expect(slotElement).toBeTruthy();
    });

    it('should handle complex HTML content in slot', async () => {
      const complexContent = document.createElement('div');
      complexContent.innerHTML = `
        <p><strong>Alert:</strong> System maintenance in progress.</p>
        <ul>
          <li>Services may be temporarily unavailable</li>
          <li>Maintenance window: 11 PM - 5 AM EST</li>
        </ul>
        <p><a href="#status">Check system status</a></p>
      `;

      element.appendChild(complexContent);
      await waitForUpdate(element);

      const textContainer = element.querySelector('.usa-alert__text');
      expect(textContainer).toBeTruthy();
      expect(element.innerHTML).toContain('<strong>Alert:</strong>');
      expect(element.innerHTML).toContain('<ul>');
      expect(element.innerHTML).toContain('<a href="#status">');
    });

    it('should handle special characters in slot content', async () => {
      const specialContent = document.createElement('p');
      specialContent.innerHTML = '&lt;script&gt;alert("test")&lt;/script&gt; &amp; special chars';
      element.appendChild(specialContent);
      await waitForUpdate(element);

      expect(element.innerHTML).toContain('&lt;script&gt;');
      expect(element.innerHTML).toContain('&amp;');
    });

    it('should handle slot content changes', async () => {
      // Start with slot content
      const slotParagraph = document.createElement('p');
      slotParagraph.textContent = 'Initial slot content';
      element.appendChild(slotParagraph);
      await waitForUpdate(element);

      expect(element.textContent).toContain('Initial slot content');

      // Change slot content
      slotParagraph.textContent = 'Updated slot content';
      await waitForUpdate(element);

      expect(element.textContent).toContain('Updated slot content');
      expect(element.textContent).not.toContain('Initial slot content');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid property changes', async () => {
      element.type = 'info';
      element.heading = 'First';

      element.type = 'emergency';
      element.heading = 'Second';
      element.slim = true;
      element.closable = true;

      await waitForUpdate(element);

      expect(element.type).toBe('emergency');
      expect(element.heading).toBe('Second');
      expect(element.slim).toBe(true);
      expect(element.closable).toBe(true);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--emergency')).toBe(true);
      expect(siteAlert?.classList.contains('usa-site-alert--slim')).toBe(true);
    });

    it('should handle null and undefined values', async () => {
      element.heading = null as any;
      await waitForUpdate(element);

      // Should handle gracefully without errors
      const heading = element.querySelector('.usa-alert__heading');
      expect(heading).toBeTruthy();

      const textContainer = element.querySelector('.usa-alert__text');
      expect(textContainer).toBeTruthy();
    });

    it('should handle invalid type values', async () => {
      element.type = 'invalid' as any;
      await waitForPropertyPropagation(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--invalid')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid updates efficiently', async () => {
      const startTime = performance.now();

      for (let i = 0; i < 50; i++) {
        element.heading = `Heading ${i}`;
        element.type = i % 2 === 0 ? 'info' : 'emergency';
        element.slim = i % 3 === 0;
      }

      await waitForUpdate(element);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second

      // Verify final state
      expect(element.heading).toBe('Heading 49');
      expect(element.type).toBe('emergency');
    });

    it('should handle show/hide cycles efficiently', async () => {
      const startTime = performance.now();

      for (let i = 0; i < 20; i++) {
        element.hide();
        await waitForUpdate(element);
        element.show();
        await waitForUpdate(element);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds

      expect(element.visible).toBe(true);
    });
  });

  describe('Component Lifecycle', () => {
    // NOTE: DOM manipulation edge case test moved to Cypress
    // Cypress coverage: cypress/e2e/site-alert-dom-manipulation.cy.ts
    // Tests moving Light DOM elements with innerHTML - known Lit limitation
    // Component functions correctly in normal usage scenarios

    it('should maintain state through visibility changes', async () => {
      element.heading = 'Persistent Alert';
      element.type = 'emergency';
      element.closable = true;
      await waitForUpdate(element);

      element.hide();
      await waitForUpdate(element);

      element.show();
      await waitForUpdate(element);

      expect(element.heading).toBe('Persistent Alert');
      expect(element.type).toBe('emergency');
      expect(element.closable).toBe(true);

      const heading = element.querySelector('.usa-alert__heading');
      expect(heading?.textContent?.trim()).toBe('Persistent Alert');
    });
  });

  describe('Application Use Cases', () => {
    it('should handle emergency site alert', async () => {
      element.type = 'emergency';
      element.heading = 'Federal Building Emergency';
      element.closable = true;

      const emergencyContent = document.createElement('div');
      emergencyContent.innerHTML = `
        <p><strong>URGENT:</strong> Federal building evacuated due to security threat.</p>
        <ul>
          <li><strong>All personnel:</strong> Evacuate immediately</li>
          <li><strong>Visitors:</strong> Follow evacuation procedures</li>
          <li><strong>Updates:</strong> Monitor emergency.gov for latest information</li>
        </ul>
        <p><strong>Emergency Contact:</strong> 1-800-FED-EMRG</p>
      `;
      element.appendChild(emergencyContent);

      await waitForUpdate(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--emergency')).toBe(true);

      const heading = element.querySelector('.usa-alert__heading');
      expect(heading?.textContent?.trim()).toBe('Federal Building Emergency');

      expect(element.innerHTML).toContain('URGENT');
      expect(element.innerHTML).toContain('Emergency Contact');
    });

    it('should handle system maintenance alert', async () => {
      element.type = 'info';
      element.heading = 'Scheduled System Maintenance';
      element.slim = true;

      const maintenanceContent = document.createElement('div');
      maintenanceContent.innerHTML = `
        <p>Federal benefits portal will be unavailable for routine maintenance on Saturday, March 30 from 11:00 PM to 5:00 AM EST.</p>
        <p><strong>Alternative:</strong> Call 1-800-555-0123 for urgent matters during maintenance window.</p>
      `;
      element.appendChild(maintenanceContent);

      await waitForUpdate(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--info')).toBe(true);
      expect(siteAlert?.classList.contains('usa-site-alert--slim')).toBe(true);

      expect(element.innerHTML).toContain('benefits portal');
      expect(element.innerHTML).toContain('Alternative');
    });

    it('should handle policy update notification', async () => {
      element.type = 'info';
      element.heading = 'New Federal Policy Effective';
      element.noIcon = true;

      const policyContent = document.createElement('div');
      policyContent.innerHTML = `
        <p>Executive Order 14028 cybersecurity requirements are now in effect for all federal agencies.</p>
        <p><a href="/cybersecurity/guidance">View implementation guidance</a> | <a href="/policy/updates">All policy updates</a></p>
      `;
      element.appendChild(policyContent);

      await waitForUpdate(element);

      const siteAlert = element.querySelector('.usa-site-alert');
      expect(siteAlert?.classList.contains('usa-site-alert--info')).toBe(true);
      expect(siteAlert?.classList.contains('usa-site-alert--no-icon')).toBe(true);

      expect(element.innerHTML).toContain('Executive Order 14028');
      expect(element.innerHTML).toContain('implementation guidance');
    });
  });

  describe('Component Lifecycle Stability (CRITICAL)', () => {
    it('should remain in DOM after property updates (not auto-dismiss)', async () => {
      const originalParent = element.parentElement;

      element.type = 'info';
      element.heading = 'Updated Heading';
      element.noIcon = true;
      element.slim = true;
      element.closable = true;

      await waitForUpdate(element);

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.parentElement).toBe(originalParent);
    });

    it('should handle dismiss action without removal (not implemented)', async () => {
      const originalParent = element.parentElement;

      element.closable = true;
      await waitForUpdate(element);

      // No close button exists since functionality is not implemented
      const closeButton = element.querySelector('.usa-site-alert__close');
      expect(closeButton).toBeFalsy();

      // Change properties
      element.type = 'warning';
      element.heading = 'Alert';
      await waitForUpdate(element);

      expect(element.parentElement).toBe(originalParent);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain DOM presence during variant and state changes', async () => {
      const originalParent = element.parentElement;

      const variants = ['info', 'emergency'];

      for (const variant of variants) {
        element.type = variant as any;
        element.slim = Math.random() > 0.5;
        element.noIcon = Math.random() > 0.5;
        element.closable = Math.random() > 0.5;
        await waitForUpdate(element);
      }

      element.heading = 'Final heading';
      await waitForUpdate(element);

      expect(element.parentElement).toBe(originalParent);
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/site-alert/usa-site-alert.ts`;
        const validation = validateComponentJavaScript(componentPath, 'site-alert');

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

  describe('Storybook Integration Tests (CRITICAL)', () => {
    it('should render in Storybook environment without errors', async () => {
      const storybookContainer = document.createElement('div');
      storybookContainer.id = 'storybook-root';
      document.body.appendChild(storybookContainer);

      const storybookElement = document.createElement('usa-site-alert') as USASiteAlert;
      storybookElement.type = 'info';
      storybookElement.heading = 'Storybook Alert';
      storybookElement.closable = true;
      storybookElement.innerHTML = '<p>Alert content from Storybook</p>';

      storybookContainer.appendChild(storybookElement);

      await waitForUpdate(storybookElement);

      expect(storybookContainer.contains(storybookElement)).toBe(true);
      expect(storybookElement.isConnected).toBe(true);

      const siteAlert = storybookElement.querySelector('.usa-site-alert');
      const heading = storybookElement.querySelector('.usa-alert__heading');
      const content = storybookElement.querySelector('.usa-alert__text');

      expect(siteAlert).toBeTruthy();
      expect(heading).toBeTruthy();
      expect(content).toBeTruthy();

      storybookContainer.remove();
    });

    it('should handle Storybook control updates without component removal', async () => {
      // Simulate Storybook controls panel updates
      element.type = 'emergency';
      element.heading = 'Controls Updated Alert';
      element.noIcon = false;
      element.slim = false;
      element.closable = false;

      await waitForUpdate(element);

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.type).toBe('emergency');
      expect(element.heading).toBe('Controls Updated Alert');

      const siteAlert = element.querySelector('.usa-site-alert');
      const heading = element.querySelector('.usa-alert__heading');
      expect(siteAlert?.classList.contains('usa-site-alert--emergency')).toBe(true);
      expect(heading?.textContent).toContain('Controls Updated Alert');
    });

    it('should maintain component structure during Storybook interactions', async () => {
      element.closable = true;
      await waitForUpdate(element);

      // Update properties during interaction
      element.type = 'success';
      element.heading = 'Updated during interaction';
      await waitForUpdate(element);

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });
  });
});
