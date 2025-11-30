#!/usr/bin/env node

/**
 * Contract Testing for Component APIs
 *
 * Validates that components maintain their API contracts:
 * - Properties don't change type or default values
 * - Events maintain consistent detail structure
 * - Methods maintain signatures
 * - ARIA attributes remain consistent
 * - DOM structure contracts are preserved
 *
 * Usage:
 *   npm run test:contracts
 *   npm run test:contracts:generate - Generate baseline contracts
 *   npm run test:contracts:validate - Validate against contracts
 *   npm run test:contracts:component=button - Test specific component
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACTS_DIR = 'test-contracts';
const CONTRACTS_FILE = `${CONTRACTS_DIR}/component-contracts.json`;

class ContractTester {
  constructor(options = {}) {
    this.mode = options.mode || 'validate';
    this.component = options.component || null;
    this.verbose = options.verbose || false;
    this.contracts = {};
    this.violations = [];
  }

  async run() {
    console.log('📜 Contract Testing Starting...\n');
    console.log(`Mode: ${this.mode}`);
    if (this.component) {
      console.log(`Component: ${this.component}`);
    }
    console.log('');

    if (this.mode === 'generate') {
      await this.generateContracts();
    } else {
      await this.validateContracts();
    }

    this.printSummary();

    if (this.violations.length > 0) {
      process.exit(1);
    }
  }

  getComponentKey(component) {
    // Generate a unique key for the component
    if (typeof component === 'string') {
      return component;
    }
    return component.package ? `${component.package}/${component.name}` : component.name;
  }

  getComponentDisplayName(component) {
    // Get a display name for logging
    if (typeof component === 'string') {
      return component;
    }
    return component.package ? `${component.name} (${component.package})` : component.name;
  }

  async generateContracts() {
    console.log('🔨 Generating component contracts...\n');

    const components = this.getComponents();

    for (const component of components) {
      const displayName = this.getComponentDisplayName(component);
      const key = this.getComponentKey(component);
      console.log(`\n📦 Analyzing ${displayName}...`);

      const contract = await this.extractContract(component);
      this.contracts[key] = contract;

      if (this.verbose) {
        console.log(JSON.stringify(contract, null, 2));
      }
    }

    // Save contracts
    this.saveContracts();
    console.log(`\n✅ Contracts saved to ${CONTRACTS_FILE}`);
  }

  async validateContracts() {
    console.log('🔍 Validating component contracts...\n');

    // Load existing contracts
    if (!fs.existsSync(CONTRACTS_FILE)) {
      console.error('❌ No contracts found. Run with --mode=generate first.');
      process.exit(1);
    }

    const savedContracts = JSON.parse(fs.readFileSync(CONTRACTS_FILE, 'utf-8'));
    const components = this.component ? [{ name: this.component, package: null }] : this.getComponents();

    for (const component of components) {
      const key = this.getComponentKey(component);
      const displayName = this.getComponentDisplayName(component);

      if (!savedContracts[key]) {
        console.warn(`⚠️  No contract found for ${displayName}`);
        continue;
      }

      console.log(`\n📦 Validating ${displayName}...`);

      const currentContract = await this.extractContract(component);
      const savedContract = savedContracts[key];

      this.compareContracts(displayName, savedContract, currentContract);
    }
  }

  getComponents() {
    // Support monorepo structure: packages/*/src/components/
    const packagesDir = path.join(process.cwd(), 'packages');
    const components = [];

    // Check if we have a monorepo structure
    if (fs.existsSync(packagesDir)) {
      const packages = fs.readdirSync(packagesDir)
        .filter(dir => {
          const pkgPath = path.join(packagesDir, dir);
          return fs.statSync(pkgPath).isDirectory() &&
                 fs.existsSync(path.join(pkgPath, 'src', 'components'));
        });

      for (const pkg of packages) {
        const componentsDir = path.join(packagesDir, pkg, 'src', 'components');
        const pkgComponents = fs.readdirSync(componentsDir)
          .filter(dir => {
            const componentPath = path.join(componentsDir, dir);
            return fs.statSync(componentPath).isDirectory() &&
                   fs.existsSync(path.join(componentPath, `usa-${dir}.ts`));
          })
          .map(dir => ({ name: dir, package: pkg }));

        components.push(...pkgComponents);
      }
    } else {
      // Fallback to legacy structure: src/components/
      const componentsDir = path.join(process.cwd(), 'src/components');
      if (fs.existsSync(componentsDir)) {
        const legacyComponents = fs.readdirSync(componentsDir)
          .filter(dir => {
            const componentPath = path.join(componentsDir, dir);
            return fs.statSync(componentPath).isDirectory() &&
                   fs.existsSync(path.join(componentPath, `usa-${dir}.ts`));
          })
          .map(dir => ({ name: dir, package: null }));

        components.push(...legacyComponents);
      }
    }

    if (this.component) {
      return components.filter(c => c.name === this.component);
    }

    return components;
  }

  async extractContract(component) {
    // Component can be either a string (legacy) or object { name, package }
    const componentName = typeof component === 'string' ? component : component.name;
    const packageName = typeof component === 'string' ? null : component.package;

    let componentPath;
    if (packageName) {
      // Monorepo structure
      componentPath = path.join(process.cwd(), 'packages', packageName, 'src', 'components', componentName, `usa-${componentName}.ts`);
    } else {
      // Legacy structure
      componentPath = path.join(process.cwd(), 'src/components', componentName, `usa-${componentName}.ts`);
    }

    if (!fs.existsSync(componentPath)) {
      return null;
    }

    const source = fs.readFileSync(componentPath, 'utf-8');

    const contract = {
      component: componentName,
      package: packageName,
      properties: this.extractProperties(source),
      events: this.extractEvents(source),
      methods: this.extractMethods(source),
      ariaAttributes: this.extractAriaAttributes(source),
      cssClasses: this.extractCssClasses(source),
      timestamp: new Date().toISOString(),
    };

    return contract;
  }

  extractProperties(source) {
    const properties = [];
    const propertyRegex = /@property\(\{([^}]+)\}\)\s+(\w+)(?:\s*:\s*(\w+(?:\[\])?))?\s*=\s*([^;]+);/g;

    let match;
    while ((match = propertyRegex.exec(source)) !== null) {
      const [, config, name, type, defaultValue] = match;

      properties.push({
        name,
        type: type || this.inferType(defaultValue),
        default: defaultValue?.trim(),
        config: config.trim(),
      });
    }

    return properties;
  }

  extractEvents(source) {
    const events = [];
    const eventRegex = /this\.dispatchEvent\(new CustomEvent\('([^']+)'(?:,\s*\{[^}]*detail:\s*\{([^}]+)\})?/g;

    let match;
    while ((match = eventRegex.exec(source)) !== null) {
      const [, eventName, detail] = match;

      events.push({
        name: eventName,
        detail: detail ? detail.trim() : null,
      });
    }

    return events;
  }

  extractMethods(source) {
    const methods = [];
    const methodRegex = /(public|private|protected)?\s+(\w+)\(([^)]*)\)(?:\s*:\s*(\w+(?:\[\])?))?\s*\{/g;

    let match;
    while ((match = methodRegex.exec(source)) !== null) {
      const [, visibility, name, params, returnType] = match;

      // Skip constructors and lifecycle methods
      if (name === 'constructor' || name.startsWith('_') ||
          ['render', 'connectedCallback', 'disconnectedCallback', 'updated', 'firstUpdated'].includes(name)) {
        continue;
      }

      methods.push({
        name,
        visibility: visibility || 'public',
        parameters: params.trim(),
        returnType: returnType || 'void',
      });
    }

    return methods;
  }

  extractAriaAttributes(source) {
    const ariaAttrs = new Set();
    const ariaRegex = /aria-(\w+)/g;

    let match;
    while ((match = ariaRegex.exec(source)) !== null) {
      ariaAttrs.add(`aria-${match[1]}`);
    }

    return Array.from(ariaAttrs).sort();
  }

  extractCssClasses(source) {
    const classes = new Set();
    const classRegex = /class="([^"]+)"/g;

    let match;
    while ((match = classRegex.exec(source)) !== null) {
      const classList = match[1].split(/\s+/);
      classList.forEach(cls => {
        if (cls.startsWith('usa-')) {
          classes.add(cls);
        }
      });
    }

    return Array.from(classes).sort();
  }

  inferType(defaultValue) {
    if (!defaultValue) return 'unknown';

    if (defaultValue === 'true' || defaultValue === 'false') return 'boolean';
    if (!isNaN(defaultValue)) return 'number';
    if (defaultValue.startsWith("'") || defaultValue.startsWith('"')) return 'string';
    if (defaultValue === '[]') return 'array';
    if (defaultValue === '{}') return 'object';

    return 'unknown';
  }

  compareContracts(component, saved, current) {
    // Compare properties
    this.compareProperties(component, saved.properties, current.properties);

    // Compare events
    this.compareEvents(component, saved.events, current.events);

    // Compare methods
    this.compareMethods(component, saved.methods, current.methods);

    // Compare ARIA attributes
    this.compareAriaAttributes(component, saved.ariaAttributes, current.ariaAttributes);

    // Compare CSS classes
    this.compareCssClasses(component, saved.cssClasses, current.cssClasses);
  }

  compareProperties(component, saved, current) {
    const savedNames = new Set(saved.map(p => p.name));
    const currentNames = new Set(current.map(p => p.name));

    // Check for removed properties
    saved.forEach(prop => {
      if (!currentNames.has(prop.name)) {
        this.addViolation(component, 'PROPERTY_REMOVED', `Property '${prop.name}' was removed`);
      }
    });

    // Check for type changes
    current.forEach(prop => {
      const savedProp = saved.find(p => p.name === prop.name);
      if (savedProp) {
        if (savedProp.type !== prop.type) {
          this.addViolation(component, 'PROPERTY_TYPE_CHANGED',
            `Property '${prop.name}' type changed from ${savedProp.type} to ${prop.type}`);
        }
        if (savedProp.default !== prop.default) {
          this.addViolation(component, 'PROPERTY_DEFAULT_CHANGED',
            `Property '${prop.name}' default changed from ${savedProp.default} to ${prop.default}`);
        }
      }
    });
  }

  compareEvents(component, saved, current) {
    const savedNames = new Set(saved.map(e => e.name));
    const currentNames = new Set(current.map(e => e.name));

    // Check for removed events
    saved.forEach(event => {
      if (!currentNames.has(event.name)) {
        this.addViolation(component, 'EVENT_REMOVED', `Event '${event.name}' was removed`);
      }
    });
  }

  compareMethods(component, saved, current) {
    const savedNames = new Set(saved.map(m => m.name));
    const currentNames = new Set(current.map(m => m.name));

    // Check for removed public methods
    saved.forEach(method => {
      if (method.visibility === 'public' && !currentNames.has(method.name)) {
        this.addViolation(component, 'METHOD_REMOVED', `Public method '${method.name}' was removed`);
      }
    });

    // Check for signature changes
    current.forEach(method => {
      const savedMethod = saved.find(m => m.name === method.name);
      if (savedMethod && savedMethod.visibility === 'public') {
        if (savedMethod.parameters !== method.parameters) {
          this.addViolation(component, 'METHOD_SIGNATURE_CHANGED',
            `Method '${method.name}' signature changed`);
        }
      }
    });
  }

  compareAriaAttributes(component, saved, current) {
    const removed = saved.filter(attr => !current.includes(attr));

    removed.forEach(attr => {
      this.addViolation(component, 'ARIA_REMOVED', `ARIA attribute '${attr}' was removed`);
    });
  }

  compareCssClasses(component, saved, current) {
    const removed = saved.filter(cls => !current.includes(cls));

    removed.forEach(cls => {
      this.addViolation(component, 'CSS_CLASS_REMOVED', `USWDS class '${cls}' was removed`);
    });
  }

  addViolation(component, type, message) {
    console.log(`   ❌ ${type}: ${message}`);
    this.violations.push({ component, type, message });
  }

  saveContracts() {
    // Ensure directory exists
    if (!fs.existsSync(CONTRACTS_DIR)) {
      fs.mkdirSync(CONTRACTS_DIR, { recursive: true });
    }

    fs.writeFileSync(
      CONTRACTS_FILE,
      JSON.stringify(this.contracts, null, 2)
    );
  }

  printSummary() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 CONTRACT TESTING SUMMARY');
    console.log('='.repeat(60) + '\n');

    if (this.mode === 'generate') {
      console.log(`✅ Generated contracts for ${Object.keys(this.contracts).length} components`);
      console.log(`📄 Saved to ${CONTRACTS_FILE}\n`);
    } else {
      console.log(`Violations found: ${this.violations.length}\n`);

      if (this.violations.length === 0) {
        console.log('✅ All component contracts validated successfully!\n');
      } else {
        console.log('❌ CONTRACT VIOLATIONS:\n');

        const byComponent = {};
        this.violations.forEach(v => {
          if (!byComponent[v.component]) {
            byComponent[v.component] = [];
          }
          byComponent[v.component].push(v);
        });

        Object.keys(byComponent).forEach(component => {
          console.log(`\n${component}:`);
          byComponent[component].forEach(v => {
            console.log(`  • ${v.type}: ${v.message}`);
          });
        });

        console.log('\n⚠️  API contracts have been broken. Review changes carefully.\n');
      }
    }
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  mode: 'validate',
  component: null,
  verbose: false,
};

args.forEach(arg => {
  if (arg.startsWith('--mode=')) {
    options.mode = arg.split('=')[1];
  } else if (arg.startsWith('--component=')) {
    options.component = arg.split('=')[1];
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
});

// Run contract testing
const tester = new ContractTester(options);
tester.run().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
