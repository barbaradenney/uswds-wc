import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { USWDSBaseComponent } from '../utils/base-component.js';

// Import official USWDS compiled CSS
import '../styles/styles.css';

/**
 * USA {{ComponentName}} Web Component
 *
 * USWDS-aligned implementation with built-in initialization safety.
 *
 * @element usa-{{component-name}}
 * @fires {{component-name}}-change - Dispatched when component state changes
 *
 * @see README.mdx - Complete API documentation
 * @uswds-js-reference https://github.com/uswds/uswds/tree/develop/packages/usa-{{component-name}}/src/index.js
 * @uswds-css-reference https://github.com/uswds/uswds/tree/develop/packages/usa-{{component-name}}/src/styles/_usa-{{component-name}}.scss
 * @uswds-docs https://designsystem.digital.gov/components/{{component-name}}/
 */
@customElement('usa-{{component-name}}')
export class USA{{ComponentName}} extends USWDSBaseComponent {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  // Component properties
  @property({ type: String })
  value = '';

  @property({ type: Boolean })
  disabled = false;

  // CRITICAL: Initialization guard to prevent duplicate USWDS calls
  private usingUSWDSEnhancement = false;

  // Store USWDS module for cleanup
  private uswdsModule: any = null;

  override connectedCallback() {
    super.connectedCallback();
    console.log('🎯 {{ComponentName}}: Initializing with USWDS pattern');
    this.initializeUSWDS{{ComponentName}}();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  private async initializeUSWDS{{ComponentName}}() {
    // CRITICAL: Always check for duplicate initialization first
    if (this.usingUSWDSEnhancement) {
      console.log(`⚠️ {{ComponentName}}: Already initialized, skipping duplicate initialization`);
      return;
    }

    console.log(`🎯 {{ComponentName}}: Initializing with tree-shaking optimization`);

    try {
      // Import specific USWDS module (not full bundle)
      const {{componentName}}Module = await import('@uswds/uswds/js/usa-{{component-name}}');
      this.uswdsModule = {{componentName}}Module.default;

      // Initialize the USWDS component
      if (this.uswdsModule && typeof this.uswdsModule.on === 'function') {
        this.uswdsModule.on(this);
        this.usingUSWDSEnhancement = true; // CRITICAL: Set flag after success
        console.log(`✅ USWDS {{component-name}} initialized successfully`);
        return;
      } else {
        console.warn(`⚠️ {{ComponentName}}: Module doesn't have expected initialization methods`);
        console.log(`🔍 Available methods:`, Object.keys(this.uswdsModule || {}));
        this.setupFallbackBehavior();
      }
    } catch (error) {
      console.warn(`⚠️ USWDS {{component-name}} initialization failed:`, error);
      await this.loadFullUSWDSLibrary();
    }
  }

  private async loadFullUSWDSLibrary() {
    try {
      if (typeof window.USWDS === 'undefined') {
        console.warn('⚠️ Full USWDS library not available, using fallback behavior');
        this.setupFallbackBehavior();
        return;
      }
      await this.initializeWithGlobalUSWDS();
    } catch (error) {
      console.warn('⚠️ Full USWDS initialization failed:', error);
      this.setupFallbackBehavior();
    }
  }

  private async initializeWithGlobalUSWDS() {
    const USWDS = window.USWDS;
    if (USWDS && USWDS.{{componentName}} && typeof USWDS.{{componentName}}.on === 'function') {
      USWDS.{{componentName}}.on(this);
      this.usingUSWDSEnhancement = true; // CRITICAL: Set flag after success
      console.log('✅ Global USWDS {{component-name}} initialized successfully');
    } else {
      console.warn('⚠️ Global USWDS {{component-name}} not available');
      this.setupFallbackBehavior();
    }
  }

  private setupFallbackBehavior() {
    console.log('🚀 Setting up fallback {{component-name}} behavior');
    // Component functionality without USWDS enhancement
  }

  private cleanupUSWDS() {
    try {
      if (this.uswdsModule && typeof this.uswdsModule.off === 'function') {
        this.uswdsModule.off(this);
        console.log('✅ USWDS {{component-name}} cleaned up');
      } else if (typeof window !== 'undefined' && typeof window.USWDS !== 'undefined') {
        const USWDS = window.USWDS;
        if (USWDS.{{componentName}} && typeof USWDS.{{componentName}}.off === 'function') {
          USWDS.{{componentName}}.off(this);
          console.log('✅ Global USWDS {{component-name}} cleaned up');
        }
      }
    } catch (error) {
      console.warn('⚠️ USWDS cleanup failed:', error);
    }

    // CRITICAL: Reset enhancement flag to allow reinitialization
    this.usingUSWDSEnhancement = false;
    this.uswdsModule = null;
  }

  override render() {
    return html`
      <div class="usa-{{component-name}}">
        <slot></slot>
      </div>
    `;
  }

  // Public API methods
  override focus() {
    // Component-specific focus implementation
  }

  public setValue(value: string) {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }
}
