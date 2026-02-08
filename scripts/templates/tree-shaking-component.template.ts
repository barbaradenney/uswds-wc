import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DebugLogger } from '../../utils/debug-config.js';

// Import global USWDS styles (tree-shaking CSS complex due to SASS dependencies)
import '../../styles/styles.css';

/**
 * {{COMPONENT_NAME}} Web Component - Tree-Shaking Optimized
 *
 * This component uses selective USWDS imports for optimal JavaScript bundle size:
 * - JavaScript: Tree-shaking via @uswds/uswds/js/usa-{{COMPONENT_KEBAB}}
 * - CSS: Global styles (SASS import complexity requires this approach)
 * - Hybrid approach: Web component API with authentic USWDS functionality
 * - Graceful fallback: Falls back to full USWDS library if needed
 *
 * @element usa-{{COMPONENT_KEBAB}}
 * @fires {{COMPONENT_KEBAB}}-change - Dispatched when the component state changes
 */
@customElement('usa-{{COMPONENT_KEBAB}}')
export class {{COMPONENT_CLASS}} extends LitElement {
  private debug = new DebugLogger('{{COMPONENT_ICON}} {{COMPONENT_NAME}}');

  static override styles = css`
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  @property({ type: String })
  value = '';

  @property({ type: Boolean })
  disabled = false;

  // Store USWDS module for cleanup
  private uswdsModule: any = null;

  // Use light DOM for USWDS compatibility
  protected override createRenderRoot(): HTMLElement {
    return this as any;
  }

  override connectedCallback() {
    super.connectedCallback();
    console.log(`🚀 {{COMPONENT_NAME}} ${this.id || 'component'} initializing with tree-shaking optimization`);

    // Ensure component is visible (Light DOM doesn't apply static styles)
    this.style.display = 'block';

    // Initialize USWDS after component renders
    this.updateComplete.then(() => {
      this.initializeUSWDS();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupUSWDS();
  }

  /**
   * Initialize USWDS JavaScript with tree-shaking optimization
   * Primary approach: Direct module import for minimal bundle size
   * Fallback approach: Full USWDS library if direct import fails
   */
  private async initializeUSWDS() {
    console.log(`🎯 {{COMPONENT_NAME}}: Initializing with tree-shaking optimization`);

    try {
      // Tree-shaking: Import only the specific USWDS component module
      const module = await import('@uswds/uswds/js/usa-{{COMPONENT_KEBAB}}');
      this.uswdsModule = module.default;

      // Initialize the USWDS component
      const componentElement = this.querySelector('.usa-{{COMPONENT_KEBAB}}');
      if (componentElement && this.uswdsModule) {
        // Try standard initialization methods
        if (typeof this.uswdsModule.on === 'function') {
          this.uswdsModule.on(componentElement);
          console.log(`✅ Tree-shaken USWDS {{COMPONENT_KEBAB}} initialized successfully`);
        } else if (typeof this.uswdsModule.init === 'function') {
          this.uswdsModule.init(componentElement);
          console.log(`✅ Tree-shaken USWDS {{COMPONENT_KEBAB}} initialized with init method`);
        } else {
          console.warn(`⚠️ {{COMPONENT_NAME}}: Module doesn't have expected initialization methods`);
          console.log(`🔍 Available methods:`, Object.keys(this.uswdsModule || {}));
          await this.setupBasicComponent();
        }

        // Set up event forwarding from USWDS to web component
        this.setupEventForwarding();
      }
    } catch (error) {
      console.warn(`⚠️ Tree-shaking failed for {{COMPONENT_NAME}}, falling back to full USWDS:`, error);
      await this.loadFullUSWDSLibrary();
    }
  }

  /**
   * Fallback: Load full USWDS library if tree-shaking fails
   */
  private async loadFullUSWDSLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if USWDS is already loaded globally
      if (typeof window.USWDS !== 'undefined') {
        console.log(`📦 USWDS already available globally`);
        this.initializeWithGlobalUSWDS();
        resolve();
        return;
      }

      console.log(`📦 Loading full USWDS library as fallback...`);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@uswds/uswds@3.8.0/dist/js/uswds.min.js';
      script.setAttribute('data-uswds-fallback', 'true');

      script.onload = () => {
        console.log(`✅ Full USWDS library loaded (fallback)`);
        setTimeout(() => {
          this.initializeWithGlobalUSWDS();
          resolve();
        }, 100);
      };

      script.onerror = () => {
        console.error(`❌ Failed to load USWDS library`);
        this.setupBasicComponent();
        reject(new Error('Failed to load USWDS'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Initialize using global USWDS object (fallback mode)
   */
  private initializeWithGlobalUSWDS() {
    const componentElement = this.querySelector('.usa-{{COMPONENT_KEBAB}}');
    if (componentElement && typeof window.USWDS !== 'undefined') {
      const USWDS = window.USWDS;
      if (USWDS.{{COMPONENT_CAMEL}} && typeof USWDS.{{COMPONENT_CAMEL}}.on === 'function') {
        USWDS.{{COMPONENT_CAMEL}}.on(componentElement);
        console.log(`🎯 USWDS {{COMPONENT_KEBAB}} initialized (fallback mode)`);
      }
    }
    this.setupEventForwarding();
  }

  /**
   * Basic component setup without USWDS enhancement
   */
  private async setupBasicComponent() {
    console.log(`🔍 Setting up basic {{COMPONENT_KEBAB}} functionality`);
    this.setupEventForwarding();
    console.log(`🎯 {{COMPONENT_NAME}} ready with basic functionality`);
  }

  /**
   * Clean up USWDS module on component destruction
   */
  private cleanupUSWDS() {
    const componentElement = this.querySelector('.usa-{{COMPONENT_KEBAB}}');

    // Try cleanup with direct import module first
    if (this.uswdsModule && typeof this.uswdsModule.off === 'function' && componentElement) {
      try {
        this.uswdsModule.off(componentElement);
        console.log(`🧹 Cleaned up USWDS {{COMPONENT_KEBAB}} (tree-shaking mode)`);
        return;
      } catch (error) {
        console.warn(`⚠️ Error cleaning up tree-shaken USWDS:`, error);
      }
    }

    // Fallback to global USWDS cleanup
    if (typeof window.USWDS !== 'undefined' && componentElement) {
      const USWDS = window.USWDS;
      if (USWDS.{{COMPONENT_CAMEL}}?.off) {
        try {
          USWDS.{{COMPONENT_CAMEL}}.off(componentElement);
          console.log(`🧹 Cleaned up USWDS {{COMPONENT_KEBAB}} (fallback mode)`);
        } catch (error) {
          console.warn(`⚠️ Error cleaning up fallback USWDS:`, error);
        }
      }
    }
  }

  /**
   * Forward USWDS events to web component events
   */
  private setupEventForwarding() {
    // Forward relevant DOM events as web component events
    const componentElement = this.querySelector('.usa-{{COMPONENT_KEBAB}}');
    if (componentElement) {
      // Example: Listen for change events and forward them
      componentElement.addEventListener('change', (e) => {
        this.dispatchEvent(new CustomEvent('{{COMPONENT_KEBAB}}-change', {
          detail: {
            value: (e.target as any)?.value,
            originalEvent: e
          },
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  override render() {
    return html`
      <div class="usa-{{COMPONENT_KEBAB}}">
        <!-- Component-specific USWDS HTML structure -->
        <slot></slot>
      </div>
    `;
  }

  // Public API methods
  override focus() {
    const focusableElement = this.querySelector('input, button, [tabindex]') as HTMLElement;
    if (focusableElement) {
      focusableElement.focus();
    }
  }

  clear() {
    this.value = '';
  }

  isValid(): boolean {
    // Component-specific validation logic
    return true;
  }
}