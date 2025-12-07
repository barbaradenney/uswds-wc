#!/usr/bin/env node

/**
 * CSS Tree-Shaking via CSS Extraction (Monorepo Version)
 *
 * This script extracts component-specific CSS rules from the compiled USWDS CSS,
 * creating smaller, tree-shaken CSS files for individual components.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '../..');

// Component to package mapping
const componentPackageMap = {
  // uswds-wc-actions
  button: 'uswds-wc-actions',
  'button-group': 'uswds-wc-actions',
  link: 'uswds-wc-actions',
  search: 'uswds-wc-actions',

  // uswds-wc-data-display
  card: 'uswds-wc-data-display',
  collection: 'uswds-wc-data-display',
  icon: 'uswds-wc-data-display',
  'icon-list': 'uswds-wc-data-display',
  list: 'uswds-wc-data-display',
  'summary-box': 'uswds-wc-data-display',
  table: 'uswds-wc-data-display',
  tag: 'uswds-wc-data-display',

  // uswds-wc-feedback
  alert: 'uswds-wc-feedback',
  banner: 'uswds-wc-feedback',
  modal: 'uswds-wc-feedback',
  'site-alert': 'uswds-wc-feedback',
  tooltip: 'uswds-wc-feedback',

  // uswds-wc-forms
  'character-count': 'uswds-wc-forms',
  checkbox: 'uswds-wc-forms',
  'combo-box': 'uswds-wc-forms',
  'date-picker': 'uswds-wc-forms',
  'date-range-picker': 'uswds-wc-forms',
  'file-input': 'uswds-wc-forms',
  'input-prefix-suffix': 'uswds-wc-forms',
  'memorable-date': 'uswds-wc-forms',
  radio: 'uswds-wc-forms',
  'range-slider': 'uswds-wc-forms',
  select: 'uswds-wc-forms',
  'text-input': 'uswds-wc-forms',
  textarea: 'uswds-wc-forms',
  'time-picker': 'uswds-wc-forms',
  validation: 'uswds-wc-forms',

  // uswds-wc-layout
  identifier: 'uswds-wc-layout',
  'process-list': 'uswds-wc-layout',
  prose: 'uswds-wc-layout',
  'step-indicator': 'uswds-wc-layout',

  // uswds-wc-navigation
  breadcrumb: 'uswds-wc-navigation',
  footer: 'uswds-wc-navigation',
  header: 'uswds-wc-navigation',
  'in-page-navigation': 'uswds-wc-navigation',
  'language-selector': 'uswds-wc-navigation',
  pagination: 'uswds-wc-navigation',
  'side-navigation': 'uswds-wc-navigation',
  'skip-link': 'uswds-wc-navigation',

  // uswds-wc-structure
  accordion: 'uswds-wc-structure',
};

// Component to CSS class mapping (ALL components)
const componentCssMap = {
  accordion: [
    'usa-accordion',
    'usa-accordion__heading',
    'usa-accordion__button',
    'usa-accordion__content',
    'usa-accordion--bordered',
    'usa-accordion--multiselectable',
  ],
  alert: [
    'usa-alert',
    'usa-alert__heading',
    'usa-alert__text',
    'usa-alert__body',
    'usa-alert__icon',
    'usa-alert--info',
    'usa-alert--warning',
    'usa-alert--error',
    'usa-alert--success',
    'usa-alert--emergency',
    'usa-alert--slim',
    'usa-alert--no-icon',
    'usa-alert--validation',
  ],
  banner: [
    'usa-banner',
    'usa-banner__header',
    'usa-banner__inner',
    'usa-banner__header-flag',
    'usa-banner__header-text',
    'usa-banner__header-action',
    'usa-banner__button',
    'usa-banner__content',
    'usa-banner__guidance',
    'usa-banner__icon',
    'usa-banner__lock-image',
    'usa-banner__button-text',
    'usa-banner__header--expanded',
  ],
  breadcrumb: [
    'usa-breadcrumb',
    'usa-breadcrumb__list',
    'usa-breadcrumb__list-item',
    'usa-breadcrumb__link',
    'usa-breadcrumb--wrap',
  ],
  button: [
    'usa-button',
    'usa-button--secondary',
    'usa-button--accent-cool',
    'usa-button--accent-warm',
    'usa-button--base',
    'usa-button--outline',
    'usa-button--inverse',
    'usa-button--big',
    'usa-button--small',
    'usa-button--unstyled',
    'usa-button--noBorder',
  ],
  'button-group': [
    'usa-button-group',
    'usa-button-group__item',
    'usa-button-group--segmented',
  ],
  card: [
    'usa-card',
    'usa-card__container',
    'usa-card__header',
    'usa-card__media',
    'usa-card__img',
    'usa-card__body',
    'usa-card__footer',
    'usa-card--header-first',
    'usa-card--media-right',
    'usa-card--flag',
    'usa-card-group',
  ],
  'character-count': [
    'usa-character-count',
    'usa-character-count__field',
    'usa-character-count__message',
    'usa-character-count__status',
    'usa-character-count__sr-status',
  ],
  checkbox: [
    'usa-checkbox',
    'usa-checkbox__input',
    'usa-checkbox__label',
    'usa-checkbox__label-description',
    'usa-checkbox--tile',
  ],
  collection: [
    'usa-collection',
    'usa-collection__item',
    'usa-collection__heading',
    'usa-collection__description',
    'usa-collection__meta',
    'usa-collection__meta-item',
    'usa-collection__calendar-date',
    'usa-collection__calendar-date-month',
    'usa-collection__calendar-date-day',
    'usa-collection__img',
    'usa-collection__body',
  ],
  'combo-box': [
    'usa-combo-box',
    'usa-combo-box__input',
    'usa-combo-box__toggle-list',
    'usa-combo-box__toggle-list__wrapper',
    'usa-combo-box__clear-input',
    'usa-combo-box__clear-input__wrapper',
    'usa-combo-box__list',
    'usa-combo-box__list-option',
    'usa-combo-box__list-option--focused',
    'usa-combo-box__list-option--selected',
    'usa-combo-box__status',
    'usa-combo-box__input-button-separator',
  ],
  'date-picker': [
    'usa-date-picker',
    'usa-date-picker__wrapper',
    'usa-date-picker__button',
    'usa-date-picker__calendar',
    'usa-date-picker__calendar__table',
    'usa-date-picker__calendar__row',
    'usa-date-picker__calendar__cell',
    'usa-date-picker__calendar__date',
    'usa-date-picker__calendar__date--focused',
    'usa-date-picker__calendar__date--selected',
    'usa-date-picker__calendar__date--range-date',
    'usa-date-picker__calendar__date--range-date-start',
    'usa-date-picker__calendar__date--range-date-end',
    'usa-date-picker__calendar__date--within-range',
    'usa-date-picker__calendar__date--today',
    'usa-date-picker__calendar__date--previous-month',
    'usa-date-picker__calendar__date--next-month',
    'usa-date-picker__external-input',
    'usa-date-picker__status',
  ],
  'date-range-picker': [
    'usa-date-range-picker',
    'usa-date-range-picker__range-start',
    'usa-date-range-picker__range-end',
  ],
  'file-input': [
    'usa-file-input',
    'usa-file-input__target',
    'usa-file-input__instructions',
    'usa-file-input__box',
    'usa-file-input__drag-text',
    'usa-file-input__choose',
    'usa-file-input__accepted-files-message',
    'usa-file-input__preview',
    'usa-file-input__preview-heading',
    'usa-file-input__preview-image',
    'usa-file-input__input',
    'usa-file-input--disabled',
  ],
  footer: [
    'usa-footer',
    'usa-footer__return-to-top',
    'usa-footer__primary-section',
    'usa-footer__secondary-section',
    'usa-footer__primary-container',
    'usa-footer__primary-content',
    'usa-footer__nav',
    'usa-footer__primary-link',
    'usa-footer__secondary-link',
    'usa-footer__address',
    'usa-footer__logo',
    'usa-footer__logo-img',
    'usa-footer__logo-heading',
    'usa-footer__contact-info',
    'usa-footer__contact-links',
    'usa-footer__contact-heading',
    'usa-footer__social-links',
    'usa-footer--big',
    'usa-footer--medium',
    'usa-footer--slim',
  ],
  header: [
    'usa-header',
    'usa-header--basic',
    'usa-header--extended',
    'usa-logo',
    'usa-logo__text',
    'usa-navbar',
    'usa-nav',
    'usa-nav__primary',
    'usa-nav__primary-item',
    'usa-nav__link',
    'usa-nav__link--current',
    'usa-nav__submenu',
    'usa-nav__submenu-item',
    'usa-nav__submenu-list',
    'usa-nav__close',
    'usa-nav__secondary',
    'usa-nav__secondary-links',
    'usa-nav-container',
    'usa-menu-btn',
    'usa-overlay',
  ],
  icon: [
    'usa-icon',
    'usa-icon--size-3',
    'usa-icon--size-4',
    'usa-icon--size-5',
    'usa-icon--size-6',
    'usa-icon--size-7',
    'usa-icon--size-8',
    'usa-icon--size-9',
  ],
  'icon-list': [
    'usa-icon-list',
    'usa-icon-list__item',
    'usa-icon-list__icon',
    'usa-icon-list__content',
    'usa-icon-list__title',
    'usa-icon-list--size-lg',
  ],
  identifier: [
    'usa-identifier',
    'usa-identifier__container',
    'usa-identifier__section',
    'usa-identifier__section--masthead',
    'usa-identifier__section--required-links',
    'usa-identifier__section--usagov',
    'usa-identifier__logos',
    'usa-identifier__logo',
    'usa-identifier__logo-img',
    'usa-identifier__identity',
    'usa-identifier__identity-domain',
    'usa-identifier__identity-disclaimer',
    'usa-identifier__required-links-list',
    'usa-identifier__required-links-item',
    'usa-identifier__required-link',
    'usa-identifier__usagov-description',
  ],
  'in-page-navigation': [
    'usa-in-page-nav',
    'usa-in-page-nav__heading',
    'usa-in-page-nav__list',
    'usa-in-page-nav__item',
    'usa-in-page-nav__link',
    'usa-in-page-nav__link--current',
  ],
  'input-prefix-suffix': [
    'usa-input-prefix',
    'usa-input-suffix',
    'usa-input-group',
    'usa-input-group--error',
    'usa-input-group--success',
  ],
  'language-selector': [
    'usa-language',
    'usa-language__primary',
    'usa-language__primary-content',
    'usa-language__submenu',
    'usa-language__submenu-item',
    'usa-language__submenu-list',
    'usa-language__link',
    'usa-language--small',
  ],
  link: ['usa-link', 'usa-link--external', 'usa-link--alt'],
  list: ['usa-list', 'usa-list--unstyled'],
  'memorable-date': [
    'usa-memorable-date',
    'usa-form-group--day',
    'usa-form-group--month',
    'usa-form-group--year',
  ],
  modal: [
    'usa-modal',
    'usa-modal__content',
    'usa-modal__main',
    'usa-modal__header',
    'usa-modal__heading',
    'usa-modal__footer',
    'usa-modal__close',
    'usa-modal--lg',
    'usa-modal-wrapper',
    'usa-modal-overlay',
    'is-visible',
  ],
  pagination: [
    'usa-pagination',
    'usa-pagination__list',
    'usa-pagination__item',
    'usa-pagination__button',
    'usa-pagination__link',
    'usa-pagination__link--current',
    'usa-pagination__arrow',
    'usa-pagination__overflow',
    'usa-pagination__previous-page',
    'usa-pagination__next-page',
  ],
  'process-list': [
    'usa-process-list',
    'usa-process-list__item',
    'usa-process-list__heading',
  ],
  prose: ['usa-prose'],
  radio: [
    'usa-radio',
    'usa-radio__input',
    'usa-radio__label',
    'usa-radio__label-description',
    'usa-radio--tile',
  ],
  'range-slider': [
    'usa-range',
    'usa-range--success',
    'usa-range--error',
  ],
  search: [
    'usa-search',
    'usa-search__input',
    'usa-search__submit',
    'usa-search__submit-icon',
    'usa-search--small',
    'usa-search--medium',
    'usa-search--big',
  ],
  select: [
    'usa-select',
    'usa-select--success',
    'usa-select--error',
  ],
  'side-navigation': [
    'usa-sidenav',
    'usa-sidenav__item',
    'usa-sidenav__sublist',
    'usa-current',
  ],
  'site-alert': [
    'usa-site-alert',
    'usa-site-alert__content',
    'usa-site-alert__heading',
    'usa-site-alert__text',
    'usa-site-alert--emergency',
    'usa-site-alert--info',
    'usa-site-alert--no-icon',
    'usa-site-alert--no-header',
    'usa-site-alert--slim',
  ],
  'skip-link': ['usa-skipnav', 'usa-skipnav__container'],
  'step-indicator': [
    'usa-step-indicator',
    'usa-step-indicator__segments',
    'usa-step-indicator__segment',
    'usa-step-indicator__segment-label',
    'usa-step-indicator__segment--complete',
    'usa-step-indicator__segment--current',
    'usa-step-indicator__header',
    'usa-step-indicator__heading',
    'usa-step-indicator__current-step',
    'usa-step-indicator__total-steps',
    'usa-step-indicator--counters',
    'usa-step-indicator--counters-sm',
    'usa-step-indicator--center',
    'usa-step-indicator--no-labels',
  ],
  'summary-box': [
    'usa-summary-box',
    'usa-summary-box__body',
    'usa-summary-box__heading',
    'usa-summary-box__text',
    'usa-summary-box__link',
  ],
  table: [
    'usa-table',
    'usa-table__header',
    'usa-table__body',
    'usa-table__row',
    'usa-table__cell',
    'usa-table--borderless',
    'usa-table--compact',
    'usa-table--striped',
    'usa-table--stacked',
    'usa-table--stacked-header',
    'usa-table-container',
    'usa-table-container--scrollable',
  ],
  tag: ['usa-tag', 'usa-tag--big'],
  'text-input': [
    'usa-input',
    'usa-input--small',
    'usa-input--medium',
    'usa-input--xl',
    'usa-input--error',
    'usa-input--success',
  ],
  textarea: [
    'usa-textarea',
    'usa-textarea--error',
    'usa-textarea--success',
  ],
  'time-picker': [
    'usa-time-picker',
    'usa-time-picker__input',
  ],
  tooltip: [
    'usa-tooltip',
    'usa-tooltip__body',
    'usa-tooltip__trigger',
    'usa-tooltip--top',
    'usa-tooltip--bottom',
    'usa-tooltip--left',
    'usa-tooltip--right',
    'is-set',
    'is-visible',
  ],
  validation: [
    'usa-error-message',
    'usa-input--error',
    'usa-select--error',
    'usa-textarea--error',
    'usa-form-group--error',
    'usa-input--success',
    'usa-select--success',
    'usa-textarea--success',
    'usa-form-group--success',
  ],
};

// Minimal core classes - only true essentials
const coreClasses = [
  // Screen reader only - used by many components
  'usa-sr-only',
  // Focus styles
  'usa-focus',
  // Form group and label (used by all form components)
  'usa-form-group',
  'usa-form-group--error',
  'usa-label',
  'usa-label--error',
  'usa-hint',
  'usa-error-message',
  // Typography
  'usa-prose',
];

/**
 * Extract CSS rules that match the given selectors
 */
function extractCssRules(css, classesToInclude) {
  const ast = postcss.parse(css);
  const extractedRules = [];
  const includedSelectors = new Set();

  ast.walkRules((rule) => {
    // Check if any selector in the rule matches our classes
    const shouldInclude = rule.selectors.some((selector) => {
      return classesToInclude.some((cls) => {
        // Match exact class or class with pseudo/attribute selectors
        const patterns = [
          `.${cls}`,           // .usa-button
          `.${cls}:`,          // .usa-button:hover
          `.${cls}[`,          // .usa-button[disabled]
          `.${cls}.`,          // .usa-button.usa-button--secondary
          `.${cls} `,          // .usa-button descendant
          `.${cls}>`,          // .usa-button > child
          `.${cls}+`,          // .usa-button + sibling
          `.${cls}~`,          // .usa-button ~ sibling
          `.${cls},`,          // .usa-button, .other
        ];
        return patterns.some((p) => selector.includes(p)) || selector === `.${cls}`;
      });
    });

    if (shouldInclude) {
      rule.selectors.forEach((sel) => includedSelectors.add(sel));
      extractedRules.push(rule.clone());
    }
  });

  // Include @media and @supports queries containing our classes
  ast.walkAtRules((rule) => {
    if (rule.name === 'media' || rule.name === 'supports') {
      const clonedRule = rule.clone();
      let hasMatchingRules = false;

      clonedRule.walkRules((innerRule) => {
        const shouldKeep = innerRule.selectors.some((selector) => {
          return classesToInclude.some((cls) => selector.includes(`.${cls}`));
        });
        if (shouldKeep) {
          hasMatchingRules = true;
        } else {
          innerRule.remove();
        }
      });

      if (hasMatchingRules) {
        extractedRules.push(clonedRule);
      }
    }
  });

  // Include @font-face rules (needed for typography)
  ast.walkAtRules('font-face', (rule) => {
    extractedRules.push(rule.clone());
  });

  return {
    rules: extractedRules,
    includedSelectors: Array.from(includedSelectors),
    count: extractedRules.length,
  };
}

/**
 * Get component directory path
 */
function getComponentPath(componentName) {
  const packageName = componentPackageMap[componentName];
  if (!packageName) {
    return null;
  }
  return join(ROOT_DIR, 'packages', packageName, 'src', 'components', componentName);
}

/**
 * Process a single component
 */
async function processComponent(componentName, fullCss, verbose = false) {
  const componentClasses = componentCssMap[componentName];
  if (!componentClasses) {
    console.warn(`⚠️  No CSS class mapping found for component: ${componentName}`);
    return { success: false, componentName, reason: 'No class mapping' };
  }

  const componentPath = getComponentPath(componentName);
  if (!componentPath) {
    console.warn(`⚠️  No package mapping found for component: ${componentName}`);
    return { success: false, componentName, reason: 'No package mapping' };
  }

  try {
    // Combine component-specific classes with minimal core classes
    const allClasses = [...new Set([...componentClasses, ...coreClasses])];

    // Extract CSS rules
    const extracted = extractCssRules(fullCss, allClasses);

    // Create new CSS from extracted rules
    const newAst = postcss.root();
    extracted.rules.forEach((rule) => newAst.append(rule));

    const extractedCss = newAst.toString();

    // Ensure directory exists
    await mkdir(componentPath, { recursive: true });

    // Convert component name to CSS filename (e.g., button-group -> button-group.css)
    const cssFilename = `${componentName}.css`;
    const cssPath = join(componentPath, cssFilename);
    const stylesPath = join(componentPath, `${componentName}-styles.ts`);

    await writeFile(cssPath, extractedCss);

    // Create the styles import file
    const stylesContent = `// Tree-shaken CSS for ${componentName}
// Auto-generated - do not edit manually
// Run 'pnpm run css:tree-shake' to regenerate
import './${cssFilename}';
`;
    await writeFile(stylesPath, stylesContent);

    const sizeKB = (extractedCss.length / 1024).toFixed(1);
    if (verbose) {
      console.log(`✅ ${componentName}: ${extracted.count} rules (${sizeKB}KB) → ${componentPackageMap[componentName]}`);
    } else {
      console.log(`✅ ${componentName}: ${sizeKB}KB`);
    }

    return {
      success: true,
      componentName,
      package: componentPackageMap[componentName],
      rulesCount: extracted.count,
      cssSize: extractedCss.length,
      includedSelectors: extracted.includedSelectors.length,
    };
  } catch (error) {
    console.error(`❌ Error processing ${componentName}:`, error.message);
    return { success: false, componentName, reason: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  const verbose = process.argv.includes('--verbose');

  console.log('🎯 CSS Tree-Shaking for Monorepo\n');

  try {
    // Read the compiled USWDS CSS from core package
    const coreCssPath = join(ROOT_DIR, 'packages/uswds-wc-core/src/styles/styles.css');
    console.log('📖 Reading compiled USWDS CSS from @uswds-wc/core...');

    let fullCss;
    try {
      fullCss = await readFile(coreCssPath, 'utf8');
    } catch (e) {
      console.log('📦 Core CSS not found, building first...');
      const { execSync } = await import('child_process');
      execSync('pnpm --filter @uswds-wc/core build:css', {
        cwd: ROOT_DIR,
        stdio: 'inherit'
      });
      fullCss = await readFile(coreCssPath, 'utf8');
    }

    console.log(`📦 Source CSS: ${(fullCss.length / 1024).toFixed(0)}KB\n`);

    // Process all components
    const components = Object.keys(componentCssMap);
    console.log(`🔨 Processing ${components.length} components...\n`);

    const results = [];
    let totalExtractedSize = 0;

    for (const componentName of components) {
      const result = await processComponent(componentName, fullCss, verbose);
      results.push(result);

      if (result.success) {
        totalExtractedSize += result.cssSize;
      }
    }

    // Results summary
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;
    const avgSize = totalExtractedSize / successCount;

    console.log('\n' + '─'.repeat(50));
    console.log('📊 CSS Tree-Shaking Results:');
    console.log('─'.repeat(50));
    console.log(`✅ Processed: ${successCount} components`);
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount} components`);
    }
    console.log(`📦 Total extracted: ${(totalExtractedSize / 1024).toFixed(0)}KB`);
    console.log(`📏 Average per component: ${(avgSize / 1024).toFixed(1)}KB`);
    console.log(`💾 vs full CSS (${(fullCss.length / 1024).toFixed(0)}KB): ${((1 - avgSize / fullCss.length) * 100).toFixed(0)}% smaller per component`);

    if (failCount > 0) {
      console.log('\n❌ Failed components:');
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   • ${r.componentName}: ${r.reason}`);
        });
    }

    // Group by package for summary
    if (verbose) {
      console.log('\n📦 By Package:');
      const byPackage = {};
      results.filter((r) => r.success).forEach((r) => {
        if (!byPackage[r.package]) byPackage[r.package] = [];
        byPackage[r.package].push(r);
      });

      for (const [pkg, comps] of Object.entries(byPackage)) {
        const totalSize = comps.reduce((sum, c) => sum + c.cssSize, 0);
        console.log(`   ${pkg}: ${comps.length} components, ${(totalSize / 1024).toFixed(0)}KB total`);
      }
    }

    console.log('\n🎉 CSS tree-shaking complete!');
    console.log('💡 Components now import tree-shaken CSS via *-styles.ts files');

  } catch (error) {
    console.error('💥 Build failed:', error.message);
    process.exit(1);
  }
}

// Run
main();
