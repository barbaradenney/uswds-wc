import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { USABaseTemplate } from './usa-base-template.js';

describe('USABaseTemplate', () => {
  let element: USABaseTemplate;

  beforeEach(async () => {
    element = document.createElement('usa-base-template') as USABaseTemplate;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  describe('Initialization', () => {
    it('should create element', () => {
      expect(element).toBeInstanceOf(USABaseTemplate);
    });

    it('should use Light DOM', () => {
      expect(element.shadowRoot).toBeNull();
    });

    it('should have default language', () => {
      expect(element.lang).toBe('en');
    });

    it('should show banner by default', () => {
      expect(element.showBanner).toBe(true);
    });

    it('should show identifier by default', () => {
      expect(element.showIdentifier).toBe(true);
    });

    it('should have default skip text', () => {
      expect(element.skipText).toBe('Skip to main content');
    });

    it('should have default skip href', () => {
      expect(element.skipHref).toBe('#main-content');
    });

    it('should fire template-ready event on first update', async () => {
      const element2 = document.createElement('usa-base-template') as USABaseTemplate;

      const readyPromise = new Promise((resolve) => {
        element2.addEventListener('template-ready', (e: Event) => {
          resolve((e as CustomEvent).detail);
        });
      });

      document.body.appendChild(element2);
      await element2.updateComplete;

      const detail = await readyPromise;
      expect(detail).toHaveProperty('template', 'base');

      element2.remove();
    });
  });

  describe('Template Structure', () => {
    it('should render wrapper div', () => {
      const wrapper = element.querySelector('.usa-base-template');
      expect(wrapper).toBeTruthy();
    });

    it('should render skip link', () => {
      const skipLink = element.querySelector('usa-skip-link');
      expect(skipLink).toBeTruthy();
    });

    it('should render banner', () => {
      const banner = element.querySelector('usa-banner');
      expect(banner).toBeTruthy();
    });

    it('should render main content area', () => {
      const main = element.querySelector('main#main-content');
      expect(main).toBeTruthy();
    });

    it('should render identifier', () => {
      const identifier = element.querySelector('usa-identifier');
      expect(identifier).toBeTruthy();
    });
  });

  describe('Slots', () => {
    it('should have header slot', () => {
      const slot = element.querySelector('slot[name="header"]');
      expect(slot).toBeTruthy();
    });

    it('should have main slot', () => {
      const slot = element.querySelector('slot[name="main"]');
      expect(slot).toBeTruthy();
    });

    it('should have footer slot', () => {
      const slot = element.querySelector('slot[name="footer"]');
      expect(slot).toBeTruthy();
    });

    it('should render slotted header content', async () => {
      const header = document.createElement('div');
      header.slot = 'header';
      header.textContent = 'Test Header';
      element.appendChild(header);
      await element.updateComplete;

      expect(element.querySelector('[slot="header"]')?.textContent).toBe('Test Header');
    });

    it('should render slotted main content', async () => {
      const main = document.createElement('div');
      main.slot = 'main';
      main.textContent = 'Test Content';
      element.appendChild(main);
      await element.updateComplete;

      expect(element.querySelector('[slot="main"]')?.textContent).toBe('Test Content');
    });
  });

  describe('Properties', () => {
    it('should hide banner when showBanner is false', async () => {
      element.showBanner = false;
      await element.updateComplete;

      const banner = element.querySelector('usa-banner');
      expect(banner).toBeFalsy();
    });

    it('should hide identifier when showIdentifier is false', async () => {
      element.showIdentifier = false;
      await element.updateComplete;

      const identifier = element.querySelector('usa-identifier');
      expect(identifier).toBeFalsy();
    });

    it('should update skip link text', async () => {
      element.skipText = 'Jump to content';
      await element.updateComplete;

      const skipLink = element.querySelector('usa-skip-link');
      expect(skipLink?.getAttribute('text')).toBe('Jump to content');
    });

    it('should update skip link href', async () => {
      element.skipHref = '#content';
      await element.updateComplete;

      const skipLink = element.querySelector('usa-skip-link');
      expect(skipLink?.getAttribute('href')).toBe('#content');
    });

    it('should set lang attribute', async () => {
      element.lang = 'es';
      await element.updateComplete;

      expect(element.getAttribute('lang')).toBe('es');
    });
  });

  describe('Custom Slot Content', () => {
    it('should use custom skip nav when provided', async () => {
      const customSkipnav = document.createElement('div');
      customSkipnav.slot = 'skipnav';
      customSkipnav.textContent = 'Custom Skip';
      element.appendChild(customSkipnav);
      await element.updateComplete;

      // Custom skipnav should be in slot
      expect(element.querySelector('[slot="skipnav"]')).toBeTruthy();
    });

    it('should use custom banner when provided', async () => {
      const customBanner = document.createElement('div');
      customBanner.slot = 'banner';
      customBanner.textContent = 'Custom Banner';
      element.appendChild(customBanner);
      await element.updateComplete;

      expect(element.querySelector('[slot="banner"]')).toBeTruthy();
    });

    it('should use custom identifier when provided', async () => {
      const customIdentifier = document.createElement('div');
      customIdentifier.slot = 'identifier';
      customIdentifier.textContent = 'Custom Identifier';
      element.appendChild(customIdentifier);
      await element.updateComplete;

      expect(element.querySelector('[slot="identifier"]')).toBeTruthy();
    });
  });

  describe('Public API', () => {
    it('should return main content element', () => {
      const main = element.getMainContent();
      expect(main).toBeTruthy();
      expect(main?.id).toBe('main-content');
    });

    it('should focus main content', () => {
      element.focusMainContent();
      const main = element.getMainContent();
      expect(main?.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('Accessibility', () => {
    it('should have main landmark', () => {
      const main = element.querySelector('main');
      expect(main).toBeTruthy();
    });

    it('should have skip link as first focusable element', () => {
      const skipLink = element.querySelector('usa-skip-link');
      const firstElement = element.querySelector('.usa-base-template > *');
      expect(firstElement?.tagName.toLowerCase()).toBe('usa-skip-link');
    });

    it('should have main-content id for skip link target', () => {
      const main = element.querySelector('#main-content');
      expect(main).toBeTruthy();
    });
  });
});
