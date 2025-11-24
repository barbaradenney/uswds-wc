import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './usa-address-pattern.js';

const meta: Meta = {
  title: 'Patterns/User Profile/Address',
  component: 'usa-address-pattern',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Default address pattern for US mailing addresses.
 */
export const Default: Story = {
  render: () => html` <usa-address-pattern></usa-address-pattern> `,
};

/**
 * Required address fields (marked with asterisk).
 */
export const Required: Story = {
  render: () => html` <usa-address-pattern required></usa-address-pattern> `,
};

/**
 * Without optional street line 2 field.
 */
export const WithoutStreetLine2: Story = {
  render: () => html`
    <usa-address-pattern .showStreet2="${false}" label="Shipping Address"></usa-address-pattern>
  `,
};

/**
 * Address pattern with event handling and validation.
 */
export const WithEventHandling: Story = {
  render: () => html`
    <usa-address-pattern id="address" label="Billing Address" required></usa-address-pattern>

    <div class="margin-top-2">
      <button
        class="usa-button"
        onclick="const pattern = document.getElementById('address'); const isValid = pattern.validateAddress(); alert(isValid ? 'Address is valid!' : 'Please fill all required fields.');"
      >
        Validate Address
      </button>
      <button
        class="usa-button usa-button--outline"
        onclick="const pattern = document.getElementById('address'); const data = pattern.getAddressData(); alert(JSON.stringify(data, null, 2));"
      >
        Get Address Data
      </button>
      <button
        class="usa-button usa-button--secondary"
        onclick="document.getElementById('address').clearAddress();"
      >
        Clear
      </button>
    </div>

    <div class="margin-top-4 usa-prose">
      <h3>Event Log:</h3>
      <pre id="event-log" style="background: #f0f0f0; padding: 1rem;">Waiting for events...</pre>
    </div>

    <script>
      (() => {
        const pattern = document.getElementById('address');
        const log = document.getElementById('event-log');

        pattern.addEventListener('address-change', (e) => {
          log.textContent = 'address-change: ' + JSON.stringify(e.detail, null, 2);
        });
      })();
    </script>
  `,
};

/**
 * With Google Plus Code field visible (for addresses without street addresses).
 */
export const WithGooglePlusCode: Story = {
  render: () => html`
    <usa-address-pattern
      .showPlusCode="${true}"
      label="Remote Location Address"
    ></usa-address-pattern>
  `,
};

/**
 * Multiple addresses in a form (e.g., billing and shipping).
 */
export const MultipleAddresses: Story = {
  render: () => html`
    <div class="usa-prose">
      <h2>Shipping and Billing Information</h2>
    </div>

    <usa-address-pattern label="Shipping Address" required></usa-address-pattern>

    <div class="margin-top-4">
      <div class="usa-checkbox">
        <input
          class="usa-checkbox__input"
          id="same-address"
          type="checkbox"
          name="same-address"
          onchange="document.getElementById('billing').style.display = this.checked ? 'none' : 'block';"
        />
        <label class="usa-checkbox__label" for="same-address">
          Billing address is the same as shipping address
        </label>
      </div>
    </div>

    <div id="billing" class="margin-top-4">
      <usa-address-pattern label="Billing Address" required></usa-address-pattern>
    </div>
  `,
};
