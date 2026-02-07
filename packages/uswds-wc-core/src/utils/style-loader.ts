/**
 * Dynamic CSS loader for USWDS components
 *
 * NOTE: Individual component CSS files (e.g., /dist/styles/usa-core.css) are
 * NOT built or deployed. All styles are bundled into the single uswds-wc.css
 * file distributed with @uswds-wc/bundle. These functions are retained for
 * backward API compatibility but are no-ops by default.
 *
 * If you self-host individual CSS files, call loadComponentStyles() explicitly
 * with a custom base path via setStyleBasePath().
 */

const loadedStyles = new Set<string>();
let styleBasePath: string | null = null;

/**
 * Set a custom base path for component CSS files.
 * Must be called before loadComponentStyles() to take effect.
 * Example: setStyleBasePath('/assets/uswds/styles')
 */
export function setStyleBasePath(basePath: string): void {
  styleBasePath = basePath;
}

export function loadComponentStyles(componentName: string): Promise<void> {
  // No-op when no base path is configured (the default).
  // All styles ship in the single uswds-wc.css bundle.
  if (!styleBasePath) {
    return Promise.resolve();
  }

  if (loadedStyles.has(componentName)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${styleBasePath}/usa-${componentName}.css`;

    link.onload = () => {
      loadedStyles.add(componentName);
      resolve();
    };

    link.onerror = () => {
      reject(new Error(`Failed to load styles for ${componentName}`));
    };

    document.head.appendChild(link);
  });
}

// Auto-load styles when component is used
export function autoLoadStyles(componentName: string): void {
  if (typeof window !== 'undefined' && styleBasePath && !loadedStyles.has(componentName)) {
    loadComponentStyles(componentName).catch(console.warn);
  }
}
