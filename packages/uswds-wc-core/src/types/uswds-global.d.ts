/**
 * Global USWDS type declaration
 *
 * Provides type safety for the global `window.USWDS` object
 * loaded via the Script Tag Pattern.
 */

interface USWDSModuleBehavior {
  on: (element: HTMLElement) => void;
  off: (element: HTMLElement) => void;
  init?: (root?: HTMLElement | Document) => void;
  teardown?: (root?: HTMLElement | Document) => void;
}

interface USWDSGlobal {
  [moduleName: string]: USWDSModuleBehavior | undefined;
  banner?: USWDSModuleBehavior;
  accordion?: USWDSModuleBehavior;
  header?: USWDSModuleBehavior;
  modal?: USWDSModuleBehavior;
  tooltip?: USWDSModuleBehavior;
  navigation?: USWDSModuleBehavior;
  search?: USWDSModuleBehavior;
  'combo-box'?: USWDSModuleBehavior;
  'date-picker'?: USWDSModuleBehavior;
  'date-range-picker'?: USWDSModuleBehavior;
  'time-picker'?: USWDSModuleBehavior;
  'file-input'?: USWDSModuleBehavior;
  'in-page-navigation'?: USWDSModuleBehavior;
  'character-count'?: USWDSModuleBehavior;
  'input-prefix-suffix'?: USWDSModuleBehavior;
  'language-selector'?: USWDSModuleBehavior;
  'table'?: USWDSModuleBehavior;
  checkbox?: USWDSModuleBehavior;
  'site-alert'?: USWDSModuleBehavior;
  'summary-box'?: USWDSModuleBehavior;
  'range-slider'?: USWDSModuleBehavior;
  footer?: USWDSModuleBehavior;
  'skip-link'?: USWDSModuleBehavior;
  'memorable-date'?: USWDSModuleBehavior;
  validation?: USWDSModuleBehavior;
  radio?: USWDSModuleBehavior;
  button?: USWDSModuleBehavior;
}

declare global {
  interface Window {
    USWDS?: USWDSGlobal;
  }
}

export {};
