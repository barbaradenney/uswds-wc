import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './usa-language-selector.ts';
import type { USALanguageSelector, LanguageOption } from './usa-language-selector.js';
import { waitForUpdate, validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForPropertyPropagation, waitForARIAAttribute } from '@uswds-wc/test-utils';

/**
 * Regression Tests for Language Selector Component Interactive Functionality
 *
 * These tests ensure that language selector dropdown functionality, language switching,
 * and variant behaviors continue to work correctly after component transformations.
 * They prevent regressions in critical language selector behavior.
 */
describe('USALanguageSelector Interactive Regression Tests', () => {
  let element: USALanguageSelector;
  let testLanguages: LanguageOption[];

  beforeEach(async () => {
    element = document.createElement('usa-language-selector') as USALanguageSelector;
    testLanguages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
    ];
    element.languages = testLanguages;
    element.currentLanguage = 'en';
    document.body.appendChild(element);
    await waitForUpdate(element);
  });

  afterEach(() => {
    element.remove();
  });

  describe('Dropdown Functionality', () => {
    it('should open dropdown when button is clicked in dropdown variant', async () => {
      element.variant = 'dropdown';
      await waitForPropertyPropagation(element);

      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      expect(button).toBeTruthy();
      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');

      button.click();
      await waitForUpdate(element);

      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('true');
      expect((element as any)._isOpen).toBe(true);

      const submenu = element.querySelector('.usa-language__submenu') as HTMLElement;
      expect(submenu.hasAttribute('hidden')).toBe(false);
    });

    it('should close dropdown when button is clicked again', async () => {
      element.variant = 'dropdown';
      await waitForPropertyPropagation(element);

      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;

      // Open first
      button.click();
      await waitForUpdate(element);
      expect((element as any)._isOpen).toBe(true);

      // Close
      button.click();
      await waitForUpdate(element);

      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');
      expect((element as any)._isOpen).toBe(false);

      const submenu = element.querySelector('.usa-language__submenu') as HTMLElement;
      expect(submenu.hasAttribute('hidden')).toBe(true);
    });

    it('should close dropdown when language is selected', async () => {
      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Open dropdown
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);
      expect((element as any)._isOpen).toBe(true);

      // Select a language
      const languageLink = element.querySelector('a[href="#"]') as HTMLAnchorElement;
      languageLink.click();
      await waitForUpdate(element);

      // Should be closed
      expect((element as any)._isOpen).toBe(false);
    });
  });

  describe('Language Selection', () => {
    it('should change current language when language is selected', async () => {
      element.variant = 'dropdown';
      await waitForUpdate(element);

      expect(element.currentLanguage).toBe('en');

      // Open dropdown and select Spanish
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      const links = element.querySelectorAll('.usa-language__submenu a');
      const spanishLink = Array.from(links).find((link) =>
        link.textContent?.includes('Español')
      ) as HTMLAnchorElement;

      expect(spanishLink).toBeTruthy();
      spanishLink.click();
      await waitForUpdate(element);

      expect(element.currentLanguage).toBe('es');
    });

    it('should handle language selection in two-languages variant', async () => {
      element.variant = 'two-languages';
      element.languages = [testLanguages[0], testLanguages[1]]; // English and Spanish only
      await waitForUpdate(element);

      expect(element.currentLanguage).toBe('en');

      const button = element.querySelector('.usa-button--unstyled') as HTMLButtonElement;
      expect(button).toBeTruthy();
      expect(button.textContent?.trim()).toBe('Español');

      button.click();
      await waitForUpdate(element);

      expect(element.currentLanguage).toBe('es');
    });

    it('should handle language selection in unstyled variant', async () => {
      element.variant = 'unstyled';
      await waitForUpdate(element);

      expect(element.currentLanguage).toBe('en');

      const links = element.querySelectorAll('.usa-language__primary a');
      const frenchLink = Array.from(links).find((link) =>
        link.textContent?.includes('Français')
      ) as HTMLAnchorElement;

      expect(frenchLink).toBeTruthy();
      frenchLink.click();
      await waitForUpdate(element);

      expect(element.currentLanguage).toBe('fr');
    });

    it('should update current language classes correctly', async () => {
      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Open dropdown
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      // Initially English should be current
      let currentLink = element.querySelector('a.usa-current');
      expect(currentLink).toBeTruthy();
      expect(currentLink?.textContent).toContain('English');

      // Select Spanish
      const links = element.querySelectorAll('.usa-language__submenu a');
      const spanishLink = Array.from(links).find((link) =>
        link.textContent?.includes('Español')
      ) as HTMLAnchorElement;

      spanishLink.click();
      await waitForUpdate(element);

      // Re-open dropdown to check current class
      button.click();
      await waitForUpdate(element);

      currentLink = element.querySelector('a.usa-current');
      expect(currentLink).toBeTruthy();
      expect(currentLink?.textContent).toContain('Español');
    });
  });

  describe('Variant Switching', () => {
    it('should automatically switch to dropdown variant when more than 2 languages', async () => {
      element.variant = 'two-languages';
      element.languages = testLanguages; // 4 languages
      await waitForUpdate(element);

      // Should render dropdown instead of two-languages
      const dropdownButton = element.querySelector('.usa-language__link');
      expect(dropdownButton).toBeTruthy();

      const simpleButton = element.querySelector('.usa-button--unstyled');
      expect(simpleButton).toBeNull(); // Should not have two-languages button
    });

    it('should handle empty languages array gracefully', async () => {
      element.variant = 'two-languages';
      element.languages = [];
      await waitForUpdate(element);

      // Should render container without errors
      const container = element.querySelector('.usa-language-container');
      expect(container).toBeTruthy();
    });

    it('should render correct variant when explicitly set', async () => {
      element.variant = 'dropdown';
      element.languages = [testLanguages[0], testLanguages[1]]; // Only 2 languages
      await waitForUpdate(element);

      // Should still render dropdown even with 2 languages
      const dropdownButton = element.querySelector('.usa-language__link');
      expect(dropdownButton).toBeTruthy();
    });
  });

  describe('Event Dispatching', () => {
    it('should dispatch language-select event when language changes', async () => {
      let eventFired = false;
      let eventDetail: any = null;

      element.addEventListener('language-select', (e: Event) => {
        eventFired = true;
        eventDetail = (e as CustomEvent).detail;
      });

      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Open dropdown and select language
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      const links = element.querySelectorAll('.usa-language__submenu a');
      const spanishLink = Array.from(links).find((link) =>
        link.textContent?.includes('Español')
      ) as HTMLAnchorElement;

      spanishLink.click();
      await waitForUpdate(element);

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeTruthy();
      expect(eventDetail.code).toBe('es');
      expect(eventDetail.previousCode).toBe('en');
      expect(eventDetail.language.nativeName).toBe('Español');
    });

    it('should dispatch menu-toggle event when dropdown is toggled', async () => {
      let toggleEventFired = false;
      let toggleEventDetail: any = null;

      element.addEventListener('menu-toggle', (e: Event) => {
        toggleEventFired = true;
        toggleEventDetail = (e as CustomEvent).detail;
      });

      element.variant = 'dropdown';
      await waitForPropertyPropagation(element);

      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      expect(toggleEventFired).toBe(true);
      expect(toggleEventDetail).toBeTruthy();
      expect(toggleEventDetail.isOpen).toBe(true);
    });

    it('should not navigate when event is prevented', async () => {
      // Mock window.location.href
      const originalHref = window.location.href;

      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          href: originalHref,
        },
        writable: true,
      });

      // Add language with href
      element.languages = [
        ...testLanguages,
        { code: 'it', name: 'Italian', nativeName: 'Italiano', href: '/italian' },
      ];

      element.addEventListener('language-select', (e: Event) => {
        e.preventDefault(); // Prevent default navigation
      });

      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Open and select Italian (which has href)
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      const links = element.querySelectorAll('.usa-language__submenu a');
      const italianLink = Array.from(links).find((link) =>
        link.textContent?.includes('Italiano')
      ) as HTMLAnchorElement;

      expect(italianLink).toBeTruthy();
      italianLink.click();
      await waitForUpdate(element);

      // Should not navigate because event was prevented
      expect(window.location.href).toBe(originalHref);
      expect(element.currentLanguage).toBe('it'); // But should still change language
    });
  });

  describe('Public API Methods', () => {
    it('should set current language via setCurrentLanguage method', async () => {
      expect(element.currentLanguage).toBe('en');

      element.setCurrentLanguage('es');
      await waitForUpdate(element);

      expect(element.currentLanguage).toBe('es');
    });

    it('should get current language via getCurrentLanguage method', async () => {
      element.currentLanguage = 'fr';

      const currentLang = element.getCurrentLanguage();
      expect(currentLang).toBeTruthy();
      expect(currentLang?.code).toBe('fr');
      expect(currentLang?.nativeName).toBe('Français');
    });

    it('should add language via addLanguage method', async () => {
      const initialCount = element.languages.length;
      const newLanguage: LanguageOption = {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
      };

      element.addLanguage(newLanguage);
      await waitForUpdate(element);

      expect(element.languages.length).toBe(initialCount + 1);
      expect(element.languages.find((lang) => lang.code === 'ja')).toBeTruthy();
    });

    it('should not add duplicate languages', async () => {
      const initialCount = element.languages.length;
      const duplicateLanguage: LanguageOption = {
        code: 'en', // Already exists
        name: 'English',
        nativeName: 'English',
      };

      element.addLanguage(duplicateLanguage);
      await waitForUpdate(element);

      expect(element.languages.length).toBe(initialCount); // Should not increase
    });

    it('should remove language via removeLanguage method', async () => {
      const initialCount = element.languages.length;

      element.removeLanguage('fr');
      await waitForUpdate(element);

      expect(element.languages.length).toBe(initialCount - 1);
      expect(element.languages.find((lang) => lang.code === 'fr')).toBeFalsy();
    });

    it('should switch to first language when current language is removed', async () => {
      element.currentLanguage = 'es';

      element.removeLanguage('es');
      await waitForUpdate(element);

      expect(element.currentLanguage).toBe('en'); // Should fallback to first language
    });

    it('should control dropdown state via public methods', async () => {
      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Open via API
      element.openDropdown();
      await waitForUpdate(element);

      expect((element as any)._isOpen).toBe(true);

      // Close via API
      element.closeDropdown();
      await waitForUpdate(element);

      expect((element as any)._isOpen).toBe(false);

      // Toggle via API
      element.toggleDropdownState();
      await waitForUpdate(element);

      expect((element as any)._isOpen).toBe(true);
    });

    it('should only open dropdown in dropdown variant', async () => {
      element.variant = 'two-languages';
      await waitForUpdate(element);

      element.openDropdown();
      await waitForUpdate(element);

      // Should not open because not in dropdown variant
      expect((element as any)._isOpen).toBe(false);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have correct ARIA attributes for dropdown variant', async () => {
      element.variant = 'dropdown';
      await waitForPropertyPropagation(element);

      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      const submenu = element.querySelector('.usa-language__submenu') as HTMLElement;

      expect(button.getAttribute('type')).toBe('button');
      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');
      expect(await waitForARIAAttribute(button, 'aria-controls')).toBe('language-options');
      expect(submenu.getAttribute('id')).toBe('language-options');
    });

    // NOTE: ARIA attribute toggling test moved to Cypress (usa-language-selector.component.cy.ts:83-120)
    // Tests require USWDS JavaScript interaction which doesn't work reliably in jsdom

    it('should have correct language attributes', async () => {
      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Open dropdown to access language links
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      const spans = element.querySelectorAll('.usa-language__submenu span[lang]');

      expect(spans.length).toBeGreaterThan(0);

      const spanishSpan = Array.from(spans).find((span) => span.getAttribute('lang') === 'es');
      expect(spanishSpan).toBeTruthy();
      expect(spanishSpan?.getAttribute('xml:lang')).toBe('es');
    });

    it('should have correct button text in dropdown variant', async () => {
      element.variant = 'dropdown';
      element.buttonText = 'Select Language';
      await waitForPropertyPropagation(element);

      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      expect(button.textContent?.trim()).toBe('Select Language');
    });
    describe('JavaScript Implementation Validation', () => {
      it('should pass JavaScript implementation validation', async () => {
        // Validate USWDS JavaScript implementation patterns
        const componentPath = `${process.cwd()}/src/components/language-selector/usa-language-selector.ts`;
        const validation = validateComponentJavaScript(componentPath, 'language-selector');

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

  describe('Edge Cases and Regression Prevention', () => {
    it('should handle rapid dropdown toggling without breaking state', async () => {
      element.variant = 'dropdown';
      await waitForPropertyPropagation(element);

      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;

      // Rapidly toggle multiple times
      button.click();
      button.click();
      button.click();
      button.click();
      await waitForUpdate(element);

      // Should end up closed (even number of clicks)
      expect(await waitForARIAAttribute(button, 'aria-expanded')).toBe('false');
      expect((element as any)._isOpen).toBe(false);
    });

    it('should handle setting invalid language code', async () => {
      element.setCurrentLanguage('invalid-code');
      await waitForUpdate(element);

      // Should update property even if language doesn't exist
      expect(element.currentLanguage).toBe('invalid-code');
      expect(element.getCurrentLanguage()).toBeFalsy();
    });

    it('should handle empty language name gracefully', async () => {
      element.languages = [{ code: 'empty', name: '', nativeName: '' }, ...testLanguages];
      await waitForUpdate(element);

      // Should render without errors
      const container = element.querySelector('.usa-language-container');
      expect(container).toBeTruthy();
    });

    it('should handle single language correctly', async () => {
      element.languages = [testLanguages[0]]; // Only English
      element.variant = 'two-languages';
      await waitForUpdate(element);

      // In two-languages mode with single language, should render button but show current language
      const button = element.querySelector('.usa-button--unstyled');
      expect(button).toBeTruthy();
      expect(button?.textContent?.trim()).toBe('English'); // Shows current language when no "other" language
    });

    it('should handle language with same name and nativeName', async () => {
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' }, // Same name and native
        { code: 'es', name: 'Spanish', nativeName: 'Español' }, // Different names
      ];
      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Open dropdown
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      const links = element.querySelectorAll('.usa-language__submenu a');
      const englishLink = Array.from(links).find((link) => link.textContent?.includes('English'));

      // Should show just "English" not "English English"
      expect(englishLink?.textContent?.trim()).toBe('English');
    });

    it('should handle small variant correctly', async () => {
      element.variant = 'dropdown';
      element.small = true;
      await waitForPropertyPropagation(element);

      const container = element.querySelector('.usa-language-container');
      expect(container?.classList.contains('usa-language--small')).toBe(true);
    });

    it('should prevent default navigation when language is selected', async () => {
      // Mock window.location to test preventDefault
      // Add a language with href
      element.languages = [
        ...testLanguages,
        { code: 'it', name: 'Italian', nativeName: 'Italiano', href: '/italian-page' },
      ];

      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Test that preventDefault works by checking if language changes but navigation doesn't happen
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      const links = element.querySelectorAll('.usa-language__submenu a');
      const italianLink = Array.from(links).find((link) =>
        link.textContent?.includes('Italiano')
      ) as HTMLAnchorElement;

      expect(italianLink).toBeTruthy();
      italianLink.click();
      await waitForUpdate(element);

      // Should change language but not navigate (because of preventDefault in handleLanguageSelect)
      expect(element.currentLanguage).toBe('it');
      // Navigation prevention is tested in the "should not navigate when event is prevented" test
    });

    it('should handle component disconnection gracefully', async () => {
      element.variant = 'dropdown';
      await waitForUpdate(element);

      // Open dropdown
      const button = element.querySelector('.usa-language__link') as HTMLButtonElement;
      button.click();
      await waitForUpdate(element);

      // Should not throw errors during cleanup
      expect(() => {
        element.disconnectedCallback();
      }).not.toThrow();
    });
  });
});
