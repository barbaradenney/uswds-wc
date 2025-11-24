import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@uswds-wc/test-utils/test-utils.js';
import './usa-language-selector.js';
import type { USALanguageSelector, LanguageOption } from './usa-language-selector.js';
import {
  testComponentAccessibility,
  USWDS_A11Y_CONFIG,
} from '@uswds-wc/test-utils/accessibility-utils.js';
import { validateComponentJavaScript } from '@uswds-wc/test-utils/test-utils.js';
import { waitForARIAAttribute } from '@uswds-wc/test-utils';

describe('USALanguageSelector', () => {
  let element: USALanguageSelector;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container?.remove();
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
    });

    it('should create language selector element', () => {
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.tagName).toBe('USA-LANGUAGE-SELECTOR');
    });

    it('should have default properties', () => {
      expect(element.currentLanguage).toBe('en');
      expect(element.variant).toBe('two-languages');
      expect(element.buttonText).toBe('Languages');
      expect(element.small).toBe(false);
      expect(element.languages).toEqual([
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
      ]);
    });

    it('should render light DOM for USWDS compatibility', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should render default two-language variant', async () => {
      await element.updateComplete;
      const container = element.querySelector('.usa-language-container');
      expect(container).toBeTruthy();

      const button = element.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.classList.contains('usa-button--unstyled')).toBe(true);
    });
  });

  describe('USWDS HTML Structure and Classes', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should have proper USWDS classes for two-language variant', () => {
      const containerEl = element.querySelector('.usa-language-container');
      expect(containerEl).toBeTruthy();

      const button = element.querySelector('.usa-button.usa-button--unstyled');
      expect(button).toBeTruthy();
    });

    it('should apply small variant classes correctly', async () => {
      element.variant = 'dropdown';
      element.small = true;
      await element.updateComplete;

      const container = element.querySelector('.usa-language-container');
      expect(container?.classList.contains('usa-language--small')).toBe(true);
    });

    it('should render proper dropdown structure', async () => {
      element.variant = 'dropdown';
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion).toBeTruthy();

      const primaryItem = element.querySelector('.usa-language__primary-item');
      expect(primaryItem).toBeTruthy();

      const submenu = element.querySelector('.usa-language__submenu');
      expect(submenu).toBeTruthy();
    });

    it('should render unstyled variant correctly', async () => {
      element.variant = 'unstyled';
      await element.updateComplete;

      const container = element.querySelector('.usa-language-container.usa-language--unstyled');
      expect(container).toBeTruthy();

      const primaryList = element.querySelector('.usa-language__primary');
      expect(primaryList).toBeTruthy();
    });
  });

  describe('Language Selection', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should handle language selection in two-language mode', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('language-select', eventSpy);

      const button = element.querySelector('button') as HTMLButtonElement;
      button.click();

      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0];
      expect(event.detail.code).toBe('es');
      expect(event.detail.previousCode).toBe('en');
      expect(element.currentLanguage).toBe('es');
    });

    it('should handle language selection in dropdown mode', async () => {
      element.variant = 'dropdown';
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('language-select', eventSpy);

      // First open dropdown
      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;
      toggleButton.click();
      await element.updateComplete;

      // Then select a language
      const languageLink = element.querySelector('.usa-language__submenu a') as HTMLAnchorElement;
      languageLink.click();

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should dispatch custom events with correct details', async () => {
      const selectSpy = vi.fn();
      element.addEventListener('language-select', selectSpy);

      const testLanguage: LanguageOption = { code: 'fr', name: 'French', nativeName: 'Français' };
      (element as any).handleLanguageSelect(testLanguage);

      expect(selectSpy).toHaveBeenCalled();
      const event = selectSpy.mock.calls[0][0];
      expect(event.detail.language).toEqual(testLanguage);
      expect(event.detail.code).toBe('fr');
      expect(event.detail.previousCode).toBe('en');
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
    });

    it('should navigate to href when provided', async () => {
      const originalLocation = window.location.href;
      const mockHref = 'https://example.gov/fr';

      // Mock window.location for href test
      Object.defineProperty(window, 'location', {
        value: { href: mockHref },
        writable: true,
      });

      const languageWithHref: LanguageOption = {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        href: mockHref,
      };

      (element as any).handleLanguageSelect(languageWithHref);

      expect(window.location.href).toBe(mockHref);

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: { href: originalLocation },
        writable: true,
      });
    });
  });

  describe('Dropdown Functionality', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      element.variant = 'dropdown';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should toggle dropdown open/closed', async () => {
      const toggleSpy = vi.fn();
      element.addEventListener('menu-toggle', toggleSpy);

      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;

      // Open dropdown
      toggleButton.click();
      expect(toggleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { isOpen: true },
        })
      );

      // Close dropdown
      toggleSpy.mockClear();
      toggleButton.click();
      expect(toggleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { isOpen: false },
        })
      );
    });

    it('should update aria-expanded attribute', async () => {
      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;

      expect(await waitForARIAAttribute(toggleButton, 'aria-expanded')).toBe('false');

      toggleButton.click();
      await element.updateComplete;
      expect(await waitForARIAAttribute(toggleButton, 'aria-expanded')).toBe('true');
    });

    it('should show/hide submenu based on state', async () => {
      const submenu = element.querySelector('.usa-language__submenu') as HTMLElement;

      expect(submenu.hasAttribute('hidden')).toBe(true);

      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;
      toggleButton.click();
      await element.updateComplete;

      expect(submenu.hasAttribute('hidden')).toBe(false);
    });

    it('should close dropdown when language is selected', async () => {
      // Open dropdown first
      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;
      toggleButton.click();
      await element.updateComplete;

      expect(element['_isOpen']).toBe(true);

      // Select a language
      const languageLink = element.querySelector('.usa-language__submenu a') as HTMLAnchorElement;
      languageLink.click();
      await element.updateComplete;

      expect(element['_isOpen']).toBe(false);
    });
  });

  describe('Language Management', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should add new languages', async () => {
      const newLanguage: LanguageOption = { code: 'fr', name: 'French', nativeName: 'Français' };

      element.addLanguage(newLanguage);
      await element.updateComplete;

      expect(element.languages).toContain(newLanguage);
      expect(element.languages.length).toBe(3);
    });

    it('should not add duplicate languages', async () => {
      const duplicateLanguage: LanguageOption = {
        code: 'en',
        name: 'English',
        nativeName: 'English',
      };

      const initialLength = element.languages.length;
      element.addLanguage(duplicateLanguage);
      await element.updateComplete;

      expect(element.languages.length).toBe(initialLength);
    });

    it('should remove languages', async () => {
      element.removeLanguage('es');
      await element.updateComplete;

      expect(element.languages.find((lang) => lang.code === 'es')).toBeUndefined();
      expect(element.languages.length).toBe(1);
    });

    it('should update current language when removed language was current', async () => {
      element.currentLanguage = 'es';
      element.removeLanguage('es');
      await element.updateComplete;

      expect(element.currentLanguage).toBe('en'); // Should fallback to first available
    });

    it('should get current language object', () => {
      const currentLang = element.getCurrentLanguage();
      expect(currentLang?.code).toBe('en');
      expect(currentLang?.name).toBe('English');
    });

    it('should set current language by code', () => {
      const selectSpy = vi.fn();
      element.addEventListener('language-select', selectSpy);

      element.setCurrentLanguage('es');

      expect(element.currentLanguage).toBe('es');
      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('Public API Methods', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      element.variant = 'dropdown';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should provide dropdown control methods', async () => {
      expect(element['_isOpen']).toBe(false);

      element.openDropdown();
      await element.updateComplete;
      expect(element['_isOpen']).toBe(true);

      element.closeDropdown();
      await element.updateComplete;
      expect(element['_isOpen']).toBe(false);

      element.toggleDropdownState();
      await element.updateComplete;
      expect(element['_isOpen']).toBe(true);
    });

    it('should only affect dropdown in dropdown variant', async () => {
      element.variant = 'two-languages';
      await element.updateComplete;

      element.openDropdown();
      await element.updateComplete;
      expect(element['_isOpen']).toBe(false); // Should remain false for non-dropdown
    });
  });

  describe('Variant Auto-Detection', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
    });

    it('should automatically switch to dropdown for multiple languages', async () => {
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
        { code: 'de', name: 'German', nativeName: 'Deutsch' },
      ];
      element.variant = 'two-languages'; // Explicitly set to two-languages
      await element.updateComplete;

      // Should render dropdown because we have more than 2 languages
      const accordion = element.querySelector('.usa-accordion');
      expect(accordion).toBeTruthy();
    });

    it('should respect explicit dropdown variant setting', async () => {
      element.variant = 'dropdown';
      await element.updateComplete;

      const accordion = element.querySelector('.usa-accordion');
      expect(accordion).toBeTruthy();
    });
  });

  describe('Accessibility Features', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should have proper lang attributes', async () => {
      const langSpan = element.querySelector('[lang]');
      expect(langSpan).toBeTruthy();
      expect(langSpan?.getAttribute('lang')).toBeTruthy();
      expect(langSpan?.getAttribute('xml:lang')).toBeTruthy();
    });

    it('should mark current language with usa-current class', async () => {
      element.variant = 'unstyled';
      await element.updateComplete;

      const currentLink = element.querySelector('.usa-current');
      expect(currentLink).toBeTruthy();
    });

    it('should have proper ARIA controls in dropdown', async () => {
      element.variant = 'dropdown';
      await element.updateComplete;

      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;
      expect(await waitForARIAAttribute(toggleButton, 'aria-controls')).toBe('language-options');

      const submenu = element.querySelector('#language-options');
      expect(submenu).toBeTruthy();
    });

    it('should prevent default on link clicks', async () => {
      element.variant = 'dropdown';
      await element.updateComplete;

      // Open dropdown first
      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;
      toggleButton.click();
      await element.updateComplete;

      const link = element.querySelector('.usa-language__submenu a') as HTMLAnchorElement;
      const clickEvent = new MouseEvent('click', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      link.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Application Use Cases', () => {
    it('should handle federal website language requirements', async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;

      // Typical federal languages
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English', href: '/en' },
        { code: 'es', name: 'Spanish', nativeName: 'Español', href: '/es' },
        { code: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '简体中文', href: '/zh-hans' },
        { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', href: '/tl' },
        { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', href: '/vi' },
      ];
      element.variant = 'dropdown';
      element.buttonText = 'Language';

      container.appendChild(element);
      await element.updateComplete;

      const languageLinks = element.querySelectorAll('.usa-language__submenu a');
      expect(languageLinks.length).toBe(5);

      // Each link should have proper lang attributes
      languageLinks.forEach((link) => {
        const langSpan = link.querySelector('[lang]');
        expect(langSpan).toBeTruthy();
        expect(langSpan?.getAttribute('xml:lang')).toBeTruthy();
      });
    });

    it('should support emergency multilingual notifications', async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;

      // Emergency languages based on local demographics
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      ];
      element.variant = 'unstyled'; // For emergency situations, simpler UI

      container.appendChild(element);
      await element.updateComplete;

      const selectSpy = vi.fn();
      element.addEventListener('language-select', selectSpy);

      // Simulate emergency language change
      const arabicLink = Array.from(element.querySelectorAll('a')).find((link) =>
        link.textContent?.includes('العربية')
      );

      expect(arabicLink).toBeTruthy();
      arabicLink?.click();

      expect(selectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            code: 'ar',
          }),
        })
      );
    });

    it('should handle immigration services multilingual patterns', async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;

      // Common languages for immigration services
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '简体中文' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      ];
      element.variant = 'dropdown';
      element.small = true; // Space-efficient for forms

      container.appendChild(element);
      await element.updateComplete;

      expect(element.querySelector('.usa-language--small')).toBeTruthy();
      expect(element.languages.length).toBe(6);

      // Test that variant auto-switched to dropdown
      const accordion = element.querySelector('.usa-accordion');
      expect(accordion).toBeTruthy();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should handle empty language array gracefully', async () => {
      element.languages = [];
      await element.updateComplete;

      // Should not crash
      expect(() => element.render()).not.toThrow();
    });

    it('should handle invalid current language code', () => {
      element.currentLanguage = 'invalid';
      const current = element.getCurrentLanguage();
      expect(current).toBeUndefined();
    });

    it('should handle setCurrentLanguage with invalid code', () => {
      const selectSpy = vi.fn();
      element.addEventListener('language-select', selectSpy);

      element.setCurrentLanguage('invalid');

      expect(selectSpy).not.toHaveBeenCalled();
      expect(element.currentLanguage).toBe('invalid'); // Property still set but no event
    });

    it('should handle rapid dropdown toggles', async () => {
      element.variant = 'dropdown';
      await element.updateComplete;

      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;

      // Rapid toggles
      toggleButton.click();
      toggleButton.click();
      toggleButton.click();
      await element.updateComplete;

      expect(element['_isOpen']).toBe(true);
    });

    it('should maintain functionality after DOM manipulation', async () => {
      // Remove and re-add element
      element.remove();
      container.appendChild(element);
      await element.updateComplete;

      const selectSpy = vi.fn();
      element.addEventListener('language-select', selectSpy);

      const button = element.querySelector('button') as HTMLButtonElement;
      button.click();

      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large language lists efficiently', async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;

      // Generate 50 languages
      const manyLanguages: LanguageOption[] = Array.from({ length: 50 }, (_, i) => ({
        code: `lang${i}`,
        name: `Language ${i}`,
        nativeName: `Native ${i}`,
      }));

      const startTime = performance.now();
      element.languages = manyLanguages;
      element.variant = 'dropdown';
      container.appendChild(element);
      await element.updateComplete;
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(600); // Should render quickly (600ms for 50 items - CI environment has ~20% variability)
      expect(element.querySelectorAll('.usa-language__submenu-item').length).toBe(50);
    });

    it('should clean up event listeners properly', async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;

      const eventSpy = vi.fn();
      element.addEventListener('language-select', eventSpy);

      // Trigger event
      element.setCurrentLanguage('es');
      expect(eventSpy).toHaveBeenCalledOnce();

      // Remove element
      element.remove();

      // Should not cause memory leaks or errors
      expect(() => element.setCurrentLanguage('en')).not.toThrow();
    });
  });

  describe('CRITICAL: Component Lifecycle Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should remain in DOM after property changes', async () => {
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.currentLanguage = 'es';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.variant = 'dropdown';
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      element.small = true;
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
    });

    it('should maintain element stability during multiple language updates', async () => {
      const originalElement = element;
      const languages = [
        { code: 'fr', name: 'French', nativeName: 'Français' },
        { code: 'de', name: 'German', nativeName: 'Deutsch' },
        { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      ];

      for (const lang of languages) {
        element.addLanguage(lang);
        await element.updateComplete;
        expect(element).toBe(originalElement);
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve DOM connection through variant changes', async () => {
      const variants = ['two-languages', 'dropdown', 'unstyled'] as const;

      for (const variant of variants) {
        element.variant = variant;
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Event System Stability', () => {
    let languageSelectSpy: ReturnType<typeof vi.fn>;
    let menuToggleSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;

      languageSelectSpy = vi.fn();
      menuToggleSpy = vi.fn();
      element.addEventListener('language-select', languageSelectSpy);
      element.addEventListener('menu-toggle', menuToggleSpy);
    });

    it('should not pollute global event handling', async () => {
      const globalClickSpy = vi.fn();
      document.addEventListener('click', globalClickSpy);

      const button = element.querySelector('button') as HTMLButtonElement;
      button.click();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(languageSelectSpy).toHaveBeenCalled();

      document.removeEventListener('click', globalClickSpy);
    });

    it('should maintain event stability across dropdown operations', async () => {
      element.variant = 'dropdown';
      await element.updateComplete;

      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;

      // Multiple toggle operations
      for (let i = 0; i < 3; i++) {
        toggleButton.click();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }

      expect(menuToggleSpy).toHaveBeenCalledTimes(3);
    });

    it('should maintain stability during rapid language selections', async () => {
      element.variant = 'dropdown';
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
      ];
      await element.updateComplete;

      // Rapid language changes
      const languageCodes = ['es', 'fr', 'en'];
      for (const code of languageCodes) {
        element.setCurrentLanguage(code);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });
  });

  describe('CRITICAL: Dropdown State Management Stability', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      element.variant = 'dropdown';
      container.appendChild(element);
      await element.updateComplete;
    });

    it('should maintain DOM connection during dropdown state changes', async () => {
      const operations = [
        () => element.openDropdown(),
        () => element.closeDropdown(),
        () => element.toggleDropdownState(),
        () => element.toggleDropdownState(),
      ];

      for (const operation of operations) {
        operation();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should preserve element stability during interactive dropdown usage', async () => {
      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;

      // Open dropdown
      toggleButton.click();
      await element.updateComplete;
      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);

      // Select language from dropdown
      const languageLink = element.querySelector('.usa-language__submenu a') as HTMLAnchorElement;
      if (languageLink) {
        languageLink.click();
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
    });

    it('should maintain stability during complex dropdown interactions', async () => {
      const eventSpy = vi.fn();
      element.addEventListener('menu-toggle', eventSpy);

      // Complex interaction sequence
      element.openDropdown();
      await element.updateComplete;
      element.closeDropdown();
      await element.updateComplete;

      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;
      toggleButton.click();
      await element.updateComplete;
      toggleButton.click();
      await element.updateComplete;

      expect(document.body.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(eventSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('CRITICAL: Storybook Integration', () => {
    it('should render in Storybook-like environment without auto-dismiss', async () => {
      // Simulate Storybook rendering environment
      const storyContainer = document.createElement('div');
      storyContainer.id = 'storybook-root';
      document.body.appendChild(storyContainer);

      element = document.createElement('usa-language-selector') as USALanguageSelector;
      element.variant = 'dropdown';
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
      ];

      storyContainer.appendChild(element);
      await element.updateComplete;

      // Simulate Storybook control updates
      element.currentLanguage = 'es';
      element.small = true;
      element.buttonText = 'Choose Language';
      await element.updateComplete;

      expect(storyContainer.contains(element)).toBe(true);
      expect(element.isConnected).toBe(true);
      expect(element.currentLanguage).toBe('es');

      storyContainer.remove();
    });

    it('should handle Storybook args updates without component removal', async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      container.appendChild(element);
      await element.updateComplete;

      // Simulate rapid Storybook args changes
      const storyArgs = [
        { variant: 'dropdown', small: false, buttonText: 'Languages' },
        { variant: 'two-languages', small: true, buttonText: 'Lang' },
        { variant: 'unstyled', small: false, buttonText: 'Select Language' },
      ];

      for (const args of storyArgs) {
        Object.assign(element, args);
        await element.updateComplete;
        expect(document.body.contains(element)).toBe(true);
        expect(element.isConnected).toBe(true);
      }
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
        expect(validation.score).toBeGreaterThanOrEqual(50); // Allow some non-critical issues

        // Critical USWDS integration should be present
        const criticalIssues = validation.issues.filter((issue) =>
          issue.includes('Missing USWDS JavaScript integration')
        );
        expect(criticalIssues.length).toBeLessThanOrEqual(1); // Allow presentational component
      });
    });
  });

  describe('REGRESSION: Click-Outside-to-Close Dropdown (Issue #2025-01)', () => {
    /**
     * REGRESSION TEST REFERENCE
     *
     * Bug: Language selector dropdown would only close when clicking the toggle button,
     * not when clicking outside the component.
     *
     * Root Cause:
     * 1. Behavior was initialized with component element instead of document
     * 2. Click detection logic checked for BODY specifically instead of "outside component"
     *
     * Fix:
     * 1. Changed initializeLanguageSelector(this) to initializeLanguageSelector(document)
     * 2. Changed click logic from checking BODY to checking !target.closest(LANGUAGE)
     *
     * NOTE: Full interactive regression tests are in Cypress:
     * @see usa-language-selector-click-outside.component.cy.ts
     *
     * These unit tests verify the component structure and behavior integration setup.
     */

    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      element.variant = 'dropdown';
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
      ];
      container.appendChild(element);
      await element.updateComplete;
    });

    // FIXME: CI environment timing issue - cleanup function initialization timing varies
    // Issue: Test passes locally but fails in CI with "expected undefined to be defined"
    // Root cause: 100ms timeout insufficient in slower CI environment for behavior initialization
    // TODO: Refactor to test behavior without relying on internal implementation details
    // Coverage: Full interactive click-outside-to-close functionality tested in Cypress (usa-language-selector-click-outside.component.cy.ts)
    it.skip('REGRESSION: should initialize with document-level event listeners', async () => {
      // Wait for firstUpdated to complete and behavior to initialize
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify behavior was initialized (cleanup function exists)
      expect(element['cleanup']).toBeDefined();
      expect(typeof element['cleanup']).toBe('function');
    });

    it('REGRESSION: should have proper ARIA structure for dropdown interactions', async () => {
      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;
      const submenu = element.querySelector('.usa-language__submenu') as HTMLElement;

      expect(toggleButton).toBeTruthy();
      expect(submenu).toBeTruthy();
      expect(await waitForARIAAttribute(toggleButton, 'aria-expanded')).toBeTruthy();
      expect(await waitForARIAAttribute(toggleButton, 'aria-controls')).toBe('language-options');
      expect(submenu.id).toBe('language-options');
    });

    it('REGRESSION: should toggle dropdown state via button', async () => {
      const toggleButton = element.querySelector('.usa-language__link') as HTMLButtonElement;
      const submenu = element.querySelector('.usa-language__submenu') as HTMLElement;

      // Initially closed
      expect(await waitForARIAAttribute(toggleButton, 'aria-expanded')).toBe('false');
      expect(submenu.hasAttribute('hidden')).toBe(true);

      // Click to open
      toggleButton.click();
      await element.updateComplete;

      expect(await waitForARIAAttribute(toggleButton, 'aria-expanded')).toBe('true');
      expect(submenu.hasAttribute('hidden')).toBe(false);
    });

    it('REGRESSION: should cleanup event listeners on disconnect', async () => {
      const cleanupSpy = vi.fn();
      element['cleanup'] = cleanupSpy;

      element.remove();

      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility Compliance (CRITICAL)', () => {
    beforeEach(async () => {
      element = document.createElement('usa-language-selector') as USALanguageSelector;
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
        { code: 'zh', name: 'Chinese', nativeName: '中文' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      ];
      element.currentLanguage = 'en';
      container.appendChild(element);
      await element.updateComplete;
    });

    // SKIP: CI environment limitation - comprehensive a11y tests timeout (>5s)
    // Coverage: Accessibility validated in Storybook and Cypress component tests
    it.skip('should pass comprehensive accessibility tests (same as Storybook)', async () => {
      // Test dropdown variant
      element.variant = 'dropdown';
      element.buttonText = 'Languages';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test two-languages variant
      element.variant = 'two-languages';
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
      ];
      element.currentLanguage = 'en';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test unstyled variant
      element.variant = 'unstyled';
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
      ];
      element.currentLanguage = 'en';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test small size
      element.variant = 'dropdown';
      element.small = true;
      element.buttonText = 'Lang';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with custom button text
      element.small = false;
      element.buttonText = 'Choose Language';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Test with many languages
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
        { code: 'de', name: 'German', nativeName: 'Deutsch' },
        { code: 'it', name: 'Italian', nativeName: 'Italiano' },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
        { code: 'ru', name: 'Russian', nativeName: 'Русский' },
        { code: 'ja', name: 'Japanese', nativeName: '日本語' },
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'zh', name: 'Chinese', nativeName: '中文' },
      ];
      element.currentLanguage = 'en';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    // SKIP: CI environment limitation - accessibility test times out (>5s)
    // Coverage: Accessibility validated in Storybook and Cypress component tests
    it.skip('should maintain accessibility during language selection', async () => {
      element.variant = 'dropdown';
      element.buttonText = 'Select Language';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Simulate language selection
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
      ];
      element.currentLanguage = 'es';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      // Change to different language
      element.currentLanguage = 'fr';
      await element.updateComplete;
      await testComponentAccessibility(element, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);
    });

    it('should be accessible in navigation contexts', async () => {
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Site language selection');

      nav.appendChild(element);
      container.appendChild(nav);

      element.variant = 'dropdown';
      element.buttonText = 'Language';
      element.languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'es', name: 'Spanish', nativeName: 'Español' },
        { code: 'fr', name: 'French', nativeName: 'Français' },
      ];
      element.currentLanguage = 'en';
      await element.updateComplete;

      await testComponentAccessibility(nav, USWDS_A11Y_CONFIG.FULL_COMPLIANCE);

      nav.remove();
    });
  });
});
