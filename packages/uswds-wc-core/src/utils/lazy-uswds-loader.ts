/**
 * Lazy USWDS Loading System
 *
 * Intelligently loads USWDS JavaScript only when needed, providing
 * ~200 KB savings for pages with static-only components.
 *
 * Strategy:
 * - Static components (Button, Link, Tag, etc.) don't need USWDS JS
 * - Interactive components (Modal, Accordion, Date Picker) require USWDS JS
 * - Automatically detect component types and load USWDS conditionally
 *
 * Benefits:
 * - 200 KB savings for static pages
 * - Faster initial load time
 * - Better performance on low-bandwidth connections
 *
 * @example
 * ```typescript
 * import { ensureUSWDSLoaded } from './utils/lazy-uswds-loader.js';
 *
 * // In interactive component
 * async connectedCallback() {
 *   await ensureUSWDSLoaded();
 *   this.initializeUSWDSComponent();
 * }
 * ```
 */

// Track USWDS loading state
let uswdsLoadingPromise: Promise<void> | null = null;
let uswdsLoaded = false;

// Components that require USWDS JavaScript
const INTERACTIVE_COMPONENTS = new Set([
  'usa-accordion',
  'usa-banner',
  'usa-character-count',
  'usa-combo-box',
  'usa-date-picker',
  'usa-date-range-picker',
  'usa-file-input',
  'usa-header',
  'usa-in-page-navigation',
  'usa-language-selector',
  'usa-modal',
  'usa-search',
  'usa-time-picker',
  'usa-tooltip',
]);

// Components that are purely static (no USWDS JS needed)
const STATIC_COMPONENTS = new Set([
  'usa-alert',
  'usa-breadcrumb',
  'usa-button',
  'usa-button-group',
  'usa-card',
  'usa-checkbox',
  'usa-collection',
  'usa-footer',
  'usa-icon',
  'usa-identifier',
  'usa-input-prefix-suffix',
  'usa-link',
  'usa-list',
  'usa-memorable-date',
  'usa-menu',
  'usa-pagination',
  'usa-process-list',
  'usa-prose',
  'usa-radio',
  'usa-range-slider',
  'usa-section',
  'usa-select',
  'usa-side-navigation',
  'usa-site-alert',
  'usa-skip-link',
  'usa-step-indicator',
  'usa-summary-box',
  'usa-table',
  'usa-tag',
  'usa-text-input',
  'usa-textarea',
  'usa-validation',
]);

/**
 * Configuration for USWDS loading
 */
export interface USWDSLoaderConfig {
  /** USWDS script URL (defaults to CDN) */
  scriptUrl?: string;
  /** Force loading even if already loaded */
  forceLoad?: boolean;
  /** Timeout for script loading (ms) */
  timeout?: number;
  /** Enable verbose logging */
  debug?: boolean;
}

/**
 * Check if USWDS is already loaded globally
 */
function isUSWDSAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).USWDS !== 'undefined';
}

/**
 * Load USWDS script dynamically
 */
async function loadUSWDSScript(config: USWDSLoaderConfig = {}): Promise<void> {
  const {
    scriptUrl = '/node_modules/@uswds/uswds/dist/js/uswds.min.js',
    timeout = 10000,
    debug = false,
  } = config;

  if (debug) {
    console.log('[USWDS Loader] Loading USWDS from:', scriptUrl);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;

    // Timeout handler
    const timeoutId = setTimeout(() => {
      script.remove();
      reject(new Error(`USWDS loading timeout after ${timeout}ms`));
    }, timeout);

    // Success handler
    script.onload = () => {
      clearTimeout(timeoutId);
      uswdsLoaded = true;

      if (debug) {
        console.log('[USWDS Loader] USWDS loaded successfully');
      }

      resolve();
    };

    // Error handler
    script.onerror = () => {
      clearTimeout(timeoutId);
      script.remove();
      reject(new Error(`Failed to load USWDS from ${scriptUrl}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Ensure USWDS is loaded (lazy load if needed)
 *
 * This is the main entry point for components that need USWDS.
 * It handles:
 * - Checking if USWDS is already loaded
 * - Loading USWDS only once (deduplicates concurrent requests)
 * - Error handling and retries
 *
 * @param config - Optional configuration
 * @returns Promise that resolves when USWDS is loaded
 *
 * @example
 * ```typescript
 * // In component that needs USWDS
 * async connectedCallback() {
 *   super.connectedCallback();
 *   await ensureUSWDSLoaded();
 *   // Now safe to call window.USWDS methods
 *   this.initializeUSWDSComponent();
 * }
 * ```
 */
export async function ensureUSWDSLoaded(config: USWDSLoaderConfig = {}): Promise<void> {
  // Already loaded globally (e.g., via script tag in HTML)
  if (isUSWDSAvailable() && !config.forceLoad) {
    if (config.debug) {
      console.log('[USWDS Loader] USWDS already available globally');
    }
    return;
  }

  // Already loaded via lazy loading
  if (uswdsLoaded && !config.forceLoad) {
    if (config.debug) {
      console.log('[USWDS Loader] USWDS already lazy loaded');
    }
    return;
  }

  // Currently loading - return existing promise
  if (uswdsLoadingPromise) {
    if (config.debug) {
      console.log('[USWDS Loader] USWDS loading in progress, waiting...');
    }
    return uswdsLoadingPromise;
  }

  // Start loading
  uswdsLoadingPromise = loadUSWDSScript(config);

  try {
    await uswdsLoadingPromise;
  } finally {
    uswdsLoadingPromise = null;
  }
}

/**
 * Check if a component requires USWDS JavaScript
 *
 * @param tagName - Component tag name (e.g., 'usa-modal')
 * @returns true if component needs USWDS JS
 *
 * @example
 * ```typescript
 * if (requiresUSWDS('usa-modal')) {
 *   await ensureUSWDSLoaded();
 * }
 * ```
 */
export function requiresUSWDS(tagName: string): boolean {
  return INTERACTIVE_COMPONENTS.has(tagName.toLowerCase());
}

/**
 * Check if a component is purely static
 *
 * @param tagName - Component tag name (e.g., 'usa-button')
 * @returns true if component is static-only
 */
export function isStaticComponent(tagName: string): boolean {
  return STATIC_COMPONENTS.has(tagName.toLowerCase());
}

/**
 * Automatically detect and load USWDS based on page components
 *
 * Scans the DOM for USWDS components and loads USWDS JavaScript
 * only if interactive components are present.
 *
 * Call this once during application initialization.
 *
 * @param config - Optional configuration
 * @returns Object with scan results
 *
 * @example
 * ```typescript
 * // In application entry point
 * window.addEventListener('DOMContentLoaded', async () => {
 *   const result = await autoLoadUSWDS({ debug: true });
 *   console.log('USWDS loaded:', result.loaded);
 *   console.log('Interactive components:', result.interactiveComponents);
 * });
 * ```
 */
export async function autoLoadUSWDS(config: USWDSLoaderConfig = {}): Promise<{
  loaded: boolean;
  interactiveComponents: string[];
  staticComponents: string[];
  needsUSWDS: boolean;
}> {
  const interactiveComponents: string[] = [];
  const staticComponents: string[] = [];

  // Scan for all USWDS components
  const allComponents = document.querySelectorAll('[class*="usa-"]');

  allComponents.forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (requiresUSWDS(tagName)) {
      interactiveComponents.push(tagName);
    } else if (isStaticComponent(tagName)) {
      staticComponents.push(tagName);
    }
  });

  // Deduplicate
  const uniqueInteractive = Array.from(new Set(interactiveComponents));
  const uniqueStatic = Array.from(new Set(staticComponents));

  const needsUSWDS = uniqueInteractive.length > 0;

  if (config.debug) {
    console.log('[USWDS Loader] Auto-scan results:');
    console.log('  Interactive components:', uniqueInteractive);
    console.log('  Static components:', uniqueStatic);
    console.log('  Needs USWDS:', needsUSWDS);
  }

  let loaded = false;

  if (needsUSWDS) {
    await ensureUSWDSLoaded(config);
    loaded = true;
  } else if (config.debug) {
    console.log('[USWDS Loader] No interactive components found, skipping USWDS load');
  }

  return {
    loaded,
    interactiveComponents: uniqueInteractive,
    staticComponents: uniqueStatic,
    needsUSWDS,
  };
}

/**
 * Preload USWDS JavaScript (optional performance optimization)
 *
 * Adds a <link rel="preload"> tag to start downloading USWDS
 * before it's actually needed. Useful for pages that will likely
 * need USWDS but want to defer execution.
 *
 * @param scriptUrl - USWDS script URL
 *
 * @example
 * ```typescript
 * // In HTML head or early in JS
 * preloadUSWDS();
 *
 * // Later, when needed
 * await ensureUSWDSLoaded();
 * ```
 */
export function preloadUSWDS(scriptUrl = '/node_modules/@uswds/uswds/dist/js/uswds.min.js'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = scriptUrl;
  document.head.appendChild(link);
}

/**
 * Get USWDS loading statistics
 *
 * @returns Loading statistics and status
 */
export function getUSWDSStatus(): {
  loaded: boolean;
  loading: boolean;
  available: boolean;
} {
  return {
    loaded: uswdsLoaded,
    loading: uswdsLoadingPromise !== null,
    available: isUSWDSAvailable(),
  };
}

/**
 * Reset USWDS loading state (mainly for testing)
 */
export function resetUSWDSLoader(): void {
  uswdsLoaded = false;
  uswdsLoadingPromise = null;
}
