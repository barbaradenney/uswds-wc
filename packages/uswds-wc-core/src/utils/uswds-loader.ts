/**
 * USWDS Module Loader Utility
 *
 * ⚠️ CRITICAL: This is the ONLY way to load USWDS JavaScript modules in this project.
 * All components MUST use this utility to ensure consistent Vite-based imports.
 *
 * DO NOT import USWDS modules directly - always use this loader.
 * DO NOT try alternative import methods - this prevents recurring import issues.
 */

export interface USWDSModule {
  on?: (element: Element) => void;
  off?: (element: Element) => void;
  init?: (element?: Element) => void;
  // USWDS behavior objects have these methods
  [key: string]: any;
}

/**
 * Module cache to prevent re-importing USWDS modules on story navigation
 * This fixes Vite dynamic import failures in Storybook iframe environment
 */
const moduleCache = new Map<string, USWDSModule | null>();

/**
 * Clear the module cache (useful for development/debugging)
 * Exposed on window for manual cache clearing if needed
 */
if (typeof window !== 'undefined') {
  (window as any).__clearUSWDSCache__ = () => {
    moduleCache.clear();
    console.log('🧹 Cleared USWDS module cache');
  };
}

/**
 * Loads a USWDS JavaScript module using Vite's pre-bundling system.
 * This ensures CommonJS modules are properly converted to ESM.
 *
 * ⚠️ MANDATORY PATTERN: Use this exact pattern in all components
 *
 * @param moduleName - The USWDS module name (e.g., 'accordion', 'modal', 'date-picker')
 * @returns Promise<USWDSModule | null> - The loaded module or null if failed
 *
 * @example
 * ```typescript
 * // ✅ CORRECT - Use this in all components
 * const accordionModule = await loadUSWDSModule('accordion');
 * if (accordionModule?.on) {
 *   accordionModule.on(this);
 * }
 *
 * // ❌ WRONG - Never import directly
 * const module = await import('@uswds/uswds/js/usa-accordion'); // Don't do this
 * const bundle = await import('@uswds/uswds/dist/js/uswds.js'); // Don't do this
 * const pkg = await import('@uswds/uswds/packages/...'); // Don't do this
 * ```
 */
export async function loadUSWDSModule(moduleName: string): Promise<USWDSModule | null> {
  // Check if this is a CSS-only component that doesn't need JavaScript
  if (isCSSOnlyComponent(moduleName)) {
    console.log(`ℹ️ USWDS ${moduleName} is a CSS-only component (no JavaScript needed)`);
    return null;
  }

  // Check module cache first (prevents Vite import failures on Storybook navigation)
  if (moduleCache.has(moduleName)) {
    const cachedModule = moduleCache.get(moduleName) ?? null;
    console.log(`✅ Using cached USWDS ${moduleName} module`);
    return cachedModule;
  }

  // First, check if module is pre-loaded globally (for Storybook compatibility)
  if (typeof window !== 'undefined' && (window as any).__USWDS_MODULES__) {
    const normalizedName = moduleName.replace('-', '');

    // Try both normalized and original name
    const preloadedModule =
      (window as any).__USWDS_MODULES__[normalizedName] ||
      (window as any).__USWDS_MODULES__[moduleName];
    if (preloadedModule) {
      console.log(`✅ Using pre-loaded USWDS ${moduleName} module from Storybook`);
      moduleCache.set(moduleName, preloadedModule); // Cache it
      return preloadedModule;
    }
  }

  try {
    // Use static import registry instead of dynamic imports
    // Dynamic imports with template literals fail in Vite (can't resolve aliases)
    const { getUSWDSModule } = await import('./uswds-modules-registry.js');
    const uswdsModule = getUSWDSModule(moduleName);

    if (
      uswdsModule &&
      (typeof uswdsModule.on === 'function' ||
        typeof uswdsModule.init === 'function' ||
        typeof uswdsModule === 'function')
    ) {
      console.log(`✅ Loaded '${moduleName}' from USWDS static registry`);
      moduleCache.set(moduleName, uswdsModule); // Cache successful load
      return uswdsModule;
    }

    console.warn(`⚠️ USWDS Module '${moduleName}' loaded but missing expected methods`);
    moduleCache.set(moduleName, null); // Cache failure to prevent retries
    return null;
  } catch (error) {
    // Log the actual import error for debugging
    console.error(`❌ Failed to import @uswds/uswds/js/usa-${moduleName}:`, error);

    // Fallback: Try to load from main USWDS bundle for bundled components
    try {
      console.log(`ℹ️ Individual module '${moduleName}' not found, trying main USWDS bundle...`);

      // Import the main USWDS bundle (uses package.json exports)
      const uswdsBundle = await import('@uswds/uswds');

      // For components like combo-box and modal that are bundled into the main USWDS file,
      // we need to create a compatible module object that can initialize the component
      // using the global USWDS behavior system
      //
      // CRITICAL: Modal requires window.USWDS.modal.init() to properly create wrapper elements
      // with .is-hidden class for visibility control. This is set up via script tag in
      // .storybook/preview-head.html (not ES module imports).
      // See docs/guides/STORYBOOK_GUIDE.md#uswds-integration for details.
      if (moduleName === 'combo-box' || moduleName === 'modal') {
        console.log(`ℹ️ Creating ${moduleName} module wrapper for global USWDS behavior`);

        // Check if the module was exported from the bundle
        const bundleModule =
          (uswdsBundle as any)[moduleName] || (uswdsBundle as any).default?.[moduleName];

        if (bundleModule && typeof bundleModule.init === 'function') {
          console.log(`✅ Found ${moduleName} in USWDS bundle exports`);
          moduleCache.set(moduleName, bundleModule); // Cache bundle module
          return bundleModule;
        }

        // Return a module-like object that can work with USWDS global initialization
        const wrapperModule = {
          // Provide both init and on methods for flexibility
          init: (element?: Element) => {
            if (!element) return;

            // Check if global USWDS is available
            if (typeof window !== 'undefined' && window.USWDS) {
              const USWDS = window.USWDS;

              console.log(`🔍 USWDS object inspection for ${moduleName}:`, {
                hasUSWDS: !!USWDS,
                hasModal: !!USWDS.modal,
                hasModalInit: !!(USWDS.modal && USWDS.modal.init),
                modalType: USWDS.modal ? typeof USWDS.modal.init : 'N/A',
                allUSWDSKeys: Object.keys(USWDS).slice(0, 20), // First 20 keys
              });

              // For modal, try to access the modal behavior directly
              if (moduleName === 'modal' && USWDS.modal && typeof USWDS.modal.init === 'function') {
                console.log(`✅ Using USWDS.modal.init() for modal initialization`);
                USWDS.modal.init(element);
                return;
              }

              // For other components, use global init
              if (typeof USWDS.init === 'function') {
                USWDS.init(element);
                console.log(`✅ Initialized ${moduleName} using USWDS.init() via global bundle`);
                return;
              }
            } else {
              console.warn(`⚠️ USWDS global object not found for ${moduleName}`);
            }

            // Fallback: Try to manually trigger USWDS initialization
            if (moduleName === 'combo-box') {
              const selectElement = element.querySelector('select');
              if (selectElement && typeof (window as any).CustomEvent !== 'undefined') {
                selectElement.dispatchEvent(new CustomEvent('uswds:init', { bubbles: true }));
                console.log(`✅ Triggered manual combo-box initialization via init()`);
              }
            } else if (moduleName === 'modal') {
              // For modals, trigger initialization event as last resort
              if (typeof (window as any).CustomEvent !== 'undefined') {
                element.dispatchEvent(new CustomEvent('uswds:init', { bubbles: true }));
                console.log(`✅ Triggered manual modal initialization via init()`);
              }
            }
          },
          on: (element: Element) => {
            // Check if global USWDS is available
            if (typeof window !== 'undefined' && window.USWDS) {
              const USWDS = window.USWDS;

              // For modal, try to access the modal behavior directly
              if (moduleName === 'modal' && USWDS.modal && typeof USWDS.modal.init === 'function') {
                console.log(`✅ Using USWDS.modal.init() for modal initialization`);
                USWDS.modal.init(element);
                return;
              }

              // For other components, use global init
              if (typeof USWDS.init === 'function') {
                USWDS.init(element);
                console.log(`✅ Initialized ${moduleName} using USWDS.init() via on() method`);
                return;
              }
            }

            // Fallback: Try to manually trigger USWDS initialization
            if (moduleName === 'combo-box') {
              const selectElement = element.querySelector('select');
              if (selectElement && typeof (window as any).CustomEvent !== 'undefined') {
                selectElement.dispatchEvent(new CustomEvent('uswds:init', { bubbles: true }));
                console.log(`✅ Triggered manual combo-box initialization`);
              }
            } else if (moduleName === 'modal') {
              // For modals, trigger initialization event as last resort
              if (typeof (window as any).CustomEvent !== 'undefined') {
                element.dispatchEvent(new CustomEvent('uswds:init', { bubbles: true }));
                console.log(`✅ Triggered manual modal initialization`);
              }
            }
          },
        };
        moduleCache.set(moduleName, wrapperModule); // Cache wrapper module
        return wrapperModule;
      }

      // REALITY CHECK: There is no global USWDS bundle
      // USWDS components are loaded individually via ES module imports
      // The "Script Tag Pattern" is not how USWDS actually works
      console.log(`ℹ️  USWDS '${moduleName}' will be loaded via individual module import`);
      moduleCache.set(moduleName, null); // Cache failure
      return null;
    } catch (bundleError) {
      console.warn(
        `🚫 USWDS Module '${moduleName}' not available (tried both individual and bundle):`,
        error,
        bundleError
      );
      moduleCache.set(moduleName, null); // Cache failure
      return null;
    }
  }
}

/**
 * Pre-loads multiple USWDS modules for better performance.
 * Use this in components that might need multiple USWDS modules.
 *
 * @param moduleNames - Array of USWDS module names
 * @returns Promise<Record<string, USWDSModule | null>>
 */
export async function loadUSWDSModules(
  moduleNames: string[]
): Promise<Record<string, USWDSModule | null>> {
  const results: Record<string, USWDSModule | null> = {};

  await Promise.all(
    moduleNames.map(async (moduleName) => {
      results[moduleName] = await loadUSWDSModule(moduleName);
    })
  );

  return results;
}

/**
 * Standard component initialization pattern.
 * Use this in all USWDS components to ensure consistent initialization.
 *
 * @example
 * ```typescript
 * // In your component's connectedCallback:
 * private async initializeUSWDS() {
 *   const module = await initializeUSWDSComponent(this, 'accordion');
 *   if (module) {
 *     this.uswdsModule = module;
 *     this.uswdsInitialized = true;
 *   }
 * }
 * ```
 */
export async function initializeUSWDSComponent(
  element: Element,
  moduleName: string
): Promise<USWDSModule | null> {
  const module = await loadUSWDSModule(moduleName);

  if (module) {
    await (element as any).updateComplete; // Wait for Lit component to render

    // USWDS behavior objects have different patterns:
    // - Modal, combo-box, file-input, time-picker, tooltip, table, character-count, header, search, banner use 'init' method (creates wrapper elements/transforms DOM)
    // - Accordion, date-picker, etc. use 'on' method (enhances existing structure)
    // - Some need to be called with the element as context
    // CRITICAL: Time-picker uses behavior() with init() method to transform input into combo-box
    // CRITICAL: Date-picker uses behavior() pattern and requires .on() method, not .init()
    // CRITICAL: Tooltip uses behavior() with init() method to create trigger/body structure
    // CRITICAL: Table uses behavior() with init() method to create sortable header buttons
    // CRITICAL: Character-count uses behavior() with init() method to create status message elements
    // CRITICAL: Header uses behavior() with init() method to set up focus trap and resize handlers
    // CRITICAL: Search uses behavior() with init() method to initialize button toggle state
    // CRITICAL: Banner uses behavior() with init() method to initialize button expanded state
    // CRITICAL: Accordion uses behavior() with init() method to set initial expanded/collapsed state
    if (
      moduleName === 'modal' ||
      moduleName === 'combo-box' ||
      moduleName === 'file-input' ||
      moduleName === 'time-picker' ||
      moduleName === 'tooltip' ||
      moduleName === 'table' ||
      moduleName === 'character-count' ||
      moduleName === 'header' ||
      moduleName === 'search' ||
      moduleName === 'banner' ||
      moduleName === 'accordion'
    ) {
      // These components require init() method to create proper DOM structure
      if (typeof module.init === 'function') {
        // Add debug logging for combo-box specifically
        if (moduleName === 'combo-box') {
          console.log(`🔍 USWDS combo-box init debug:`, {
            element,
            tagName: element.tagName,
            classList: Array.from(element.classList || []),
            comboBoxElements: element.querySelectorAll('.usa-combo-box'),
            innerHTML: element.innerHTML.substring(0, 300),
          });
        }
        module.init(element);
        console.log(`✅ USWDS ${moduleName} initialized with .init() method`);

        // CRITICAL: Time picker transforms into a combo-box but doesn't activate combo-box events
        // After time-picker's init() creates the combo-box DOM, we need to activate combo-box behavior
        if (moduleName === 'time-picker') {
          const comboBoxElement = element.classList.contains('usa-combo-box')
            ? element
            : element.querySelector('.usa-combo-box');

          if (comboBoxElement) {
            console.log(
              `🔍 USWDS time-picker created combo-box, now activating combo-box behavior`
            );
            try {
              const comboBoxModule = await import('@uswds/uswds/js/usa-combo-box');
              if (typeof comboBoxModule.default?.on === 'function') {
                comboBoxModule.default.on(comboBoxElement);
                console.log(`✅ USWDS combo-box behavior activated for time-picker`);
              }
            } catch (err) {
              console.warn(`⚠️ Failed to activate combo-box behavior for time-picker:`, err);
            }
          }
        }
      } else if (typeof module.on === 'function') {
        module.on(element);
        console.log(`✅ USWDS ${moduleName} initialized with .on() method (fallback)`);
      } else {
        console.warn(
          `⚠️ USWDS ${moduleName} module loaded but no suitable initialization method found`,
          module
        );
      }
    } else {
      // Other components prefer on() method
      if (typeof module.on === 'function') {
        module.on(element);
        console.log(`✅ USWDS ${moduleName} initialized with .on() method`);
      } else if (typeof module.init === 'function') {
        module.init(element);
        console.log(`✅ USWDS ${moduleName} initialized with .init() method`);
      } else if (typeof module === 'function') {
        // Some modules export the behavior function directly
        (module as any)(element);
        console.log(`✅ USWDS ${moduleName} initialized as function`);
      } else {
        console.warn(
          `⚠️ USWDS ${moduleName} module loaded but no suitable initialization method found`,
          module
        );
      }
    }
  } else {
    console.warn(`⚠️ USWDS ${moduleName} module not available`);
  }

  return module;
}

/**
 * Standard component cleanup pattern.
 * Use this in all USWDS components' disconnectedCallback.
 */
export function cleanupUSWDSComponent(element: Element, module: USWDSModule | null): void {
  if (module?.off) {
    try {
      module.off(element);
      console.log(`🧹 USWDS module cleaned up`);
    } catch (error) {
      console.warn('⚠️ Error cleaning up USWDS module:', error);
    }
  }
}

/**
 * All USWDS modules that have JavaScript and should be pre-bundled by Vite.
 * When adding a new module, ensure it's also added to vite.config.ts optimizeDeps.include
 */
export const SUPPORTED_USWDS_MODULES = [
  'accordion',
  'banner',
  'date-picker',
  'in-page-navigation',
  'modal',
  'header',
  'combo-box',
  'time-picker',
  'search',
  'tooltip',
  'file-input',
  'character-count',
  'footer',
  'skipnav',
  'date-range-picker',
  'language-selector',
  'menu',
  'step-indicator',
  'table',
  'pagination',
] as const;

/**
 * USWDS components that are CSS-only and don't need JavaScript initialization
 */
export const CSS_ONLY_USWDS_MODULES = [
  'button',
  'alert',
  'card',
  'breadcrumb',
  'tag',
  'link',
  'prose',
  'section',
  'summary-box',
  // Note: 'select' removed - combo boxes require JavaScript for search/filter functionality
] as const;

export type SupportedUSWDSModule = (typeof SUPPORTED_USWDS_MODULES)[number];
export type CSSOnlyUSWDSModule = (typeof CSS_ONLY_USWDS_MODULES)[number];

/**
 * Check if a USWDS component is CSS-only (doesn't need JavaScript initialization)
 */
export function isCSSOnlyComponent(moduleName: string): boolean {
  return CSS_ONLY_USWDS_MODULES.includes(moduleName as CSSOnlyUSWDSModule);
}

/**
 * Type-safe USWDS module loader with compile-time module name validation.
 */
export async function loadTypedUSWDSModule<T extends SupportedUSWDSModule>(
  moduleName: T
): Promise<USWDSModule | null> {
  return loadUSWDSModule(moduleName);
}

/**
 * Legacy compatibility - maintains existing API
 * @deprecated Use loadUSWDSModule instead
 */
export async function loadUSWDS(): Promise<any> {
  console.warn('loadUSWDS() is deprecated. Use loadUSWDSModule(moduleName) instead.');
  return null;
}

/**
 * Legacy compatibility - maintains existing API
 * @deprecated Use initializeUSWDSComponent instead
 */
export async function initUSWDS(_root?: Element): Promise<void> {
  console.warn('initUSWDS() is deprecated. Use initializeUSWDSComponent() instead.');
}

/**
 * Legacy compatibility - maintains existing API
 * @deprecated Use loadUSWDSModule instead
 */
export async function getUSWDSBehavior(behaviorName: string): Promise<any> {
  console.warn('getUSWDSBehavior() is deprecated. Use loadUSWDSModule() instead.');
  return loadUSWDSModule(behaviorName.replace(/([A-Z])/g, '-$1').toLowerCase());
}
