/**
 * @fileoverview Type definitions for USWDS Web Components core
 */

import './uswds-global.d.ts';

/**
 * Accessibility properties for ARIA attributes
 */
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
  'aria-hidden'?: boolean;
  'aria-atomic'?: boolean;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-disabled'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-controls'?: string;
}

/**
 * USWDS design token types
 */
export type USWDSColorToken = string;
export type USWDSSpacingToken = string;
export type USWDSFontFamilyToken = string;
export type USWDSFontSizeToken = string;
export type USWDSFontWeightToken = string;
export type USWDSBorderRadiusToken = string;
export type USWDSShadowToken = string;
export type USWDSZIndexToken = string;

/**
 * Button component types
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent-cool'
  | 'accent-warm'
  | 'base'
  | 'outline'
  | 'inverse'
  | 'unstyled';

export type ButtonType = 'button' | 'submit' | 'reset';
