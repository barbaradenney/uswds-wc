/**
 * USWDS Enhancement System
 *
 * A systematic approach to progressive enhancement with USWDS JavaScript behaviors.
 * This provides a consistent way for web components to integrate with USWDS.
 */

import { loadUSWDS } from './uswds-loader.js';

/**
 * USWDS behavior names that map to component types
 */
export const USWDS_BEHAVIORS = {
  accordion: 'accordion',
  banner: 'banner',
  button: 'button',
  characterCount: 'characterCount',
  comboBox: 'comboBox',
  datePicker: 'datePicker',
  dateRangePicker: 'dateRangePicker',
  fileInput: 'fileInput',
  footer: 'footer',
  header: 'header',
  inPageNavigation: 'inPageNavigation',
  modal: 'modal',
  navigation: 'navigation',
  search: 'search',
  skipNav: 'skipNav',
  table: 'table',
  timePicker: 'timePicker',
  tooltip: 'tooltip',
  validation: 'validation',
} as const;

export type USWDSBehaviorName = keyof typeof USWDS_BEHAVIORS;

/**
 * Enhanced web component that can integrate with USWDS JavaScript behaviors
 */
export interface USWDSEnhanceable {
  /** The element to enhance */
  element: Element;
  /** Debug logging method */
  debug?: {
    logUSWDS?: (message: string) => void;
    warn?: (message: string, ...args: any[]) => void;
  };
}

/**
 * Result of USWDS enhancement attempt
 */
export interface USWDSEnhancementResult {
  success: boolean;
  behaviorName: string;
  usingFallback: boolean;
  behavior?: any;
  error?: Error;
}

export interface USWDSModule {
  init?: (element?: HTMLElement | Document) => void;
  on?: (element: HTMLElement) => void;
  off?: (element: HTMLElement) => void;
  [key: string]: any;
}

/**
 * Enhance a web component with USWDS JavaScript behavior
 */
export async function enhanceWithUSWDS(
  component: USWDSEnhanceable,
  behaviorName: USWDSBehaviorName
): Promise<USWDSEnhancementResult> {
  try {
    // Wait for the component to be ready
    if ('updateComplete' in component.element) {
      await (component.element as any).updateComplete;
    }

    // Additional DOM readiness check
    await new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(void 0);
      } else {
        const handler = () => {
          document.removeEventListener('DOMContentLoaded', handler);
          resolve(void 0);
        };
        document.addEventListener('DOMContentLoaded', handler);
      }
    });

    // Load USWDS with enhanced timing
    const USWDS = await loadUSWDS();
    const uswdsBehaviorName = USWDS_BEHAVIORS[behaviorName];

    console.log(
      '🔍 Enhancement debug - USWDS:',
      !!USWDS,
      '_isFallback:',
      (USWDS as any)?._isFallback
    );

    // Check if USWDS is a fallback before proceeding
    if (USWDS && (USWDS as any)._isFallback) {
      component.debug?.logUSWDS?.(
        `⚠️ Detected fallback USWDS, using component behavior for ${behaviorName}`
      );
      return {
        success: true,
        behaviorName,
        usingFallback: true,
        behavior: USWDS[uswdsBehaviorName],
      };
    }

    // Verify USWDS behavior exists and element is ready
    if (USWDS && USWDS[uswdsBehaviorName] && typeof USWDS[uswdsBehaviorName].on === 'function') {
      // Additional safety check - ensure element is in the DOM
      if (!document.contains(component.element)) {
        component.debug?.warn?.(`Element not in DOM, deferring ${behaviorName} enhancement`);

        return {
          success: true,
          behaviorName,
          usingFallback: true,
          behavior: USWDS[uswdsBehaviorName],
        };
      }

      // Apply USWDS behavior with error handling
      try {
        USWDS[uswdsBehaviorName].on(component.element);
        component.debug?.logUSWDS?.(`✅ Enhanced with real USWDS ${behaviorName} behavior`);

        return {
          success: true,
          behaviorName,
          usingFallback: false,
          behavior: USWDS[uswdsBehaviorName],
        };
      } catch (enhancementError) {
        component.debug?.warn?.(`USWDS ${behaviorName} enhancement failed:`, enhancementError);

        return {
          success: true,
          behaviorName,
          usingFallback: true,
          behavior: USWDS[uswdsBehaviorName],
          error: enhancementError as Error,
        };
      }
    }

    // Fallback behavior was used by the loader
    component.debug?.logUSWDS?.(`⚠️ Using fallback ${behaviorName} behavior`);

    return {
      success: true,
      behaviorName,
      usingFallback: true,
      behavior: USWDS?.[uswdsBehaviorName],
    };
  } catch (error) {
    component.debug?.warn?.(`❌ Failed to enhance ${behaviorName}:`, error);

    return {
      success: false,
      behaviorName,
      usingFallback: true,
      error: error as Error,
    };
  }
}

/**
 * Remove USWDS enhancement from a component
 */
export async function removeUSWDSEnhancement(
  component: USWDSEnhanceable,
  behaviorName: USWDSBehaviorName,
  behavior?: any
): Promise<void> {
  try {
    if (behavior && typeof behavior.off === 'function') {
      behavior.off(component.element);
      component.debug?.logUSWDS?.(`🧹 Removed USWDS ${behaviorName} enhancement`);
    } else {
      // Try to get the behavior from the global USWDS object
      const USWDS = await loadUSWDS();
      const uswdsBehaviorName = USWDS_BEHAVIORS[behaviorName];

      if (USWDS?.[uswdsBehaviorName]?.off) {
        USWDS[uswdsBehaviorName].off(component.element);
        component.debug?.logUSWDS?.(`🧹 Removed global USWDS ${behaviorName} enhancement`);
      }
    }
  } catch (error) {
    component.debug?.warn?.(`❌ Failed to remove ${behaviorName} enhancement:`, error);
  }
}

/**
 * Check if a specific USWDS behavior is available
 */
export async function isUSWDSBehaviorAvailable(behaviorName: USWDSBehaviorName): Promise<boolean> {
  try {
    const USWDS = await loadUSWDS();
    const uswdsBehaviorName = USWDS_BEHAVIORS[behaviorName];
    return !!USWDS?.[uswdsBehaviorName]?.on;
  } catch {
    return false;
  }
}

export class USWDSEnhancer {
  private static scriptLoaded = false;
  private static loadingPromise: Promise<void> | null = null;

  /**
   * Enhance a component with USWDS JavaScript
   * @param element - The component element to enhance
   * @param moduleName - The USWDS module name (e.g., 'accordion', 'modal')
   * @param componentName - Human readable name for logging
   * @returns The USWDS module instance or null if enhancement failed
   */
  static async enhance(
    element: HTMLElement,
    moduleName: string,
    componentName: string
  ): Promise<USWDSModule | null> {
    try {
      // Check if USWDS is available globally (from uswds.min.js)
      if (typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS[moduleName] && typeof USWDS[moduleName].init === 'function') {
          // Initialize USWDS module on this element
          USWDS[moduleName].init(element);
          console.log(`✨ ${componentName}: Enhanced with global USWDS JavaScript`);
          return USWDS[moduleName];
        }
      }

      // Fallback: try to dynamically load USWDS
      await this.loadUSWDSScript();

      // Try again after loading
      if (typeof (window as any).USWDS !== 'undefined') {
        const USWDS = (window as any).USWDS;
        if (USWDS[moduleName] && typeof USWDS[moduleName].init === 'function') {
          USWDS[moduleName].init(element);
          console.log(`✨ ${componentName}: Enhanced with dynamically loaded USWDS JavaScript`);
          return USWDS[moduleName];
        }
      }

      console.warn(
        `⚠️ ${componentName}: USWDS ${moduleName} module not available, using basic functionality`
      );
      return null;
    } catch (error) {
      console.warn(
        `⚠️ ${componentName}: Could not load USWDS JavaScript, using basic functionality:`,
        error
      );
      return null;
    }
  }

  /**
   * Clean up USWDS enhancement
   * @param uswdsModule - The USWDS module instance
   * @param element - The element to clean up
   * @param componentName - Human readable name for logging
   */
  static cleanup(
    uswdsModule: USWDSModule | null,
    element: HTMLElement,
    componentName: string
  ): void {
    if (uswdsModule && typeof uswdsModule.off === 'function') {
      try {
        uswdsModule.off(element);
        console.log(`🧹 ${componentName}: Cleaned up USWDS enhancement`);
      } catch (error) {
        console.warn(`⚠️ ${componentName}: Error cleaning up USWDS enhancement:`, error);
      }
    }
  }

  private static async loadUSWDSScript(): Promise<void> {
    // Return existing promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Return immediately if already loaded
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    // Check if script is already in DOM
    if (document.querySelector('script[src*="uswds"]')) {
      this.scriptLoaded = true;
      return Promise.resolve();
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@uswds/uswds@latest/dist/js/uswds.min.js';
      script.onload = () => {
        this.scriptLoaded = true;
        this.loadingPromise = null;
        console.log('📦 USWDS JavaScript loaded successfully');
        resolve();
      };
      script.onerror = () => {
        this.loadingPromise = null;
        reject(new Error('Failed to load USWDS script'));
      };
      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }
}
