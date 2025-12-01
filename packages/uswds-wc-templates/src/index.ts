/**
 * USWDS Templates - Page-level Web Component Layouts
 *
 * Templates are page-level layouts that compose USWDS components and patterns
 * to create complete, accessible government web pages.
 *
 * Templates vs Patterns vs Components:
 * - Components: Atomic, reusable UI elements (button, input, card)
 * - Patterns: Multi-component user workflows (address, sign-in form)
 * - Templates: Page-level layouts composing patterns and components
 *
 * Official USWDS Templates:
 * - Base: Foundation template with skipnav, banner, header, footer, identifier
 * - Landing: Hero-focused landing page
 * - Sign-in: Authentication page
 * - Create Account: Registration page
 * - Error: Error pages (404, 500, etc.)
 * - Documentation: Content pages with sidenav
 * - Form: Multi-step form pages
 */

// Templates
export * from './templates/base/index.js';
export * from './templates/landing/index.js';
export * from './templates/error/index.js';
export * from './templates/sign-in/index.js';
export * from './templates/create-account/index.js';
export * from './templates/documentation/index.js';
export * from './templates/form/index.js';
