/**
 * @uswds-wc/core
 *
 * Core utilities and base components for USWDS Web Components
 */

// Base Component
export { USWDSBaseComponent } from './utils/base-component.js';

// Types
export * from './types/index.js';

// Utilities
export * from './utils/accessibility-helpers.js';
export * from './utils/debounce.js';
export * from './utils/design-token-helpers.js';
export * from './utils/event-helpers.js';
export * from './utils/focus-trap.js';
export * from './utils/form-helpers.js';
export * from './utils/iframe-delegation-mixin.js';
export * from './utils/is-in-viewport.js';
export * from './utils/keymap.js';
export * from './utils/lazy-uswds-loader.js';
export * from './utils/partial-hydration.js';
export * from './utils/performance-helpers.js';
export * from './utils/sanitizer.js';
export * from './utils/scrollbar-width.js';
export * from './utils/select-or-matches.js';
export * from './utils/storybook-docs.js';
export * from './utils/style-loader.js';
export * from './utils/uswds-behavior.js';
export * from './utils/uswds-class-builder.js';
export * from './utils/uswds-enhancement.js';
export * from './utils/uswds-initialization-registry.js';
// Export specific items from uswds-loader to avoid interface conflicts
// Note: initializeUSWDSComponent and cleanupUSWDSComponent are exported from uswds-initialization-registry
export {
  loadUSWDSModule,
  loadUSWDSModules,
  loadTypedUSWDSModule,
  loadUSWDS,
  initUSWDS,
  getUSWDSBehavior,
  isCSSOnlyComponent,
  SUPPORTED_USWDS_MODULES,
  CSS_ONLY_USWDS_MODULES,
  type SupportedUSWDSModule,
  type CSSOnlyUSWDSModule,
} from './utils/uswds-loader.js';
export * from './utils/uswds-modules-registry.js';
