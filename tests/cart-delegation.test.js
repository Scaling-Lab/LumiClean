import { jest } from '@jest/globals';
// Load cart.js (module) via dynamic import after DOM setup
describe('Cart delegation', () => {
  let container;

  beforeAll(async () => {
    // Use Jest's jsdom environment: inject container and cart-item markup into document body
    document.body.innerHTML = `
      <template id="cart-item-template">
        <div class="cart-item" data-line-id="">
          <img data-cart-item-image src="" alt="" />
          <span data-cart-item-name></span>
          <span data-cart-item-price></span>
          <span data-cart-item-original-price class="hidden"></span>
          <button class="quantity-minus-btn quantity-btn" data-line-id="">-</button>
          <span data-cart-item-quantity>1</span>
          <button class="quantity-plus-btn quantity-btn" data-line-id="">+</button>
          <button class="remove-item-btn" data-line-id="">remove</button>
        </div>
      </template>
      <div id="cart-overlay"></div>
      <div id="cart-drawer">
        <button id="close-cart-btn"></button>
        <div class="cart-items-container">
          <div class="cart-item" data-line-id="line1">
            <img data-cart-item-image src="" alt="" />
            <span data-cart-item-name></span>
            <span data-cart-item-price></span>
            <span data-cart-item-original-price class="hidden"></span>
            <button class="quantity-minus-btn quantity-btn" data-line-id="line1">-</button>
            <span data-cart-item-quantity>1</span>
            <button class="quantity-plus-btn quantity-btn" data-line-id="line1">+</button>
            <button class="remove-item-btn" data-line-id="line1">remove</button>
          </div>
        </div>
      </div>
      <span id="empty-cart-message"></span>
      <span id="cart-subtotal"></span>
      <button id="checkout-btn"></button>
      <span id="initial-discount-amount"></span>
      <div id="cart-loading-overlay"></div>
      <div id="cart-error"><span id="cart-error-message"></span></div>
      <span id="cart-original-total"></span>
      <span id="total-savings-amount"></span>
      <div id="installment-info"></div>
      <div id="open-cart-trigger" class="hidden"><span id="cart-item-count" class="hidden"></span></div>
      <label data-variant-id="gid://shopify/ProductVariant/NEWVARIANT">
        <input type="radio" name="bundle" checked />
      </label>
      <button class="js-main-cta">Add To Cart</button>
      <section id="alia-discount-section">
        <span id="alia-reward-text"></span>
        <span id="alia-discount-code"></span>
        <span id="alia-timer"></span>
        <span id="alia-expired-message"></span>
      </section>
    `;
    // minimal setLoading implementation required by shopifyApi
    window.setLoading = () => {};

    // store reference to cart-items-container
    container = document.querySelector('.cart-items-container');

    // mock cart state
    global.cart = {
      id: 'cart123',
      lines: { nodes: [{ id: 'line1', quantity: 1, cost: { totalAmount: { amount: '10' } }, merchandise: { price: { amount: '10' }, product: { title: 'Test Product' }, image: { url: '', altText: '' } } }] },
      cost: { totalAmount: { amount: '10', currencyCode: 'USD' } },
      discountCodes: []
    };

    // Stub global fetch used inside callShopifyAPI
    global.fetch = jest.fn((url, options) => {
      const { query, variables } = JSON.parse(options.body);

      const createResponse = (data) => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data)
      });

      if (query.includes('cartCreate')) {
        return createResponse({ data: { cartCreate: { cart: global.cart, userErrors: [] } } });
      }
      if (query.includes('getCart')) {
        return createResponse({ data: { cart: global.cart } });
      }
      if (query.includes('cartLinesAdd') || query.includes('cartLinesUpdate')) {
        const lineInput = variables.lines?.[0] || {};
        const incomingQty = lineInput.quantity ?? 1;
        const merchId = lineInput.merchandiseId || 'newMerch';

        // Determine if the line already exists
        const existingIndex = global.cart.lines.nodes.findIndex(item => item.id === lineInput.id || item.merchandise?.id === merchId);

        if (existingIndex >= 0) {
          // Update quantity on existing line
          global.cart.lines.nodes[existingIndex].quantity = incomingQty;
        } else {
          // Add a brand-new line if not present
          const newLineId = `line${Date.now()}`;
          global.cart.lines.nodes.push({
            id: newLineId,
            quantity: incomingQty,
            cost: { totalAmount: { amount: (incomingQty * 10).toString() } },
            merchandise: { id: merchId, price: { amount: '10' }, product: { title: 'Test Product' }, image: { url: '', altText: '' } }
          });
        }

        // Recalculate cart totals
        const newTotal = global.cart.lines.nodes.reduce((sum, ln) => sum + ln.quantity * 10, 0);
        global.cart.cost.totalAmount.amount = newTotal.toString();

        const key = query.includes('cartLinesAdd') ? 'cartLinesAdd' : 'cartLinesUpdate';
        return createResponse({ data: { [key]: { cart: global.cart, userErrors: [] } } });
      }
      if (query.includes('cartLinesRemove')) {
        // Remove all items for simplicity
        global.cart = {
          ...global.cart,
          lines: { nodes: [] },
          totalQuantity: 0
        };
        global.cart.cost.totalAmount.amount = '0';
        return createResponse({ data: { cartLinesRemove: { cart: global.cart, userErrors: [] } } });
      }
      return createResponse({ data: {} });
    });

    await import('../js/cart.js');
    // Trigger cart.js DOMContentLoaded listener manually
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
    // wait a microtask for async initializeCart to attach listeners
    await new Promise(res => setTimeout(res, 0));
  });

  test('renders initial subtotal correctly', async () => {
    // wait for potential async render
    await new Promise(res => setTimeout(res, 0));
    const subtotal = document.getElementById('cart-subtotal').textContent;
    expect(subtotal).toBe('$10.00');
  });

  test('click plus updates quantity optimistically and subtotal', async () => {
    const plusBtn = container.querySelector('.quantity-plus-btn');
    plusBtn.click();
    // wait for the API and DOM update
    await new Promise(res => setTimeout(res, 0));

    const qty = container.querySelector('[data-cart-item-quantity]').textContent;
    expect(qty).toBe('2');

    const subtotal = document.getElementById('cart-subtotal').textContent;
    expect(subtotal).toBe('$20.00');
  });

  test('minus button decreases quantity and updates subtotal', async () => {
    const minusBtn = container.querySelector('.quantity-minus-btn');
    minusBtn.click();
    await new Promise(res => setTimeout(res, 0));

    const qty = container.querySelector('[data-cart-item-quantity]').textContent;
    expect(qty).toBe('1');

    const subtotal = document.getElementById('cart-subtotal').textContent;
    expect(subtotal).toBe('$10.00');
  });

  test('second minus press removes line item completely', async () => {
    const minusBtn = container.querySelector('.quantity-minus-btn');
    minusBtn.click();
    await new Promise(res => setTimeout(res, 0));

    // Item element should no longer be in the DOM
    const item = container.querySelector('.cart-item');
    expect(item).toBeNull();

    // Cart state should have no lines
    expect(global.cart.lines.nodes.length).toBe(0);

    // Subtotal should be zero and checkout disabled
    const subtotal = document.getElementById('cart-subtotal').textContent;
    expect(subtotal).toBe('$0.00');

    const checkout = document.getElementById('checkout-btn');
    expect(checkout.disabled).toBe(true);
  });

  test('Add to cart button adds a new line then remove button empties cart', async () => {
    // Click CTA to add a NEW item
    const addBtn = document.querySelector('.js-main-cta');
    addBtn.click();
    await new Promise(res => setTimeout(res, 0));

    expect(global.cart.lines.nodes.length).toBe(1);

    // DOM should now have an item again
    let item = container.querySelector('.cart-item');
    expect(item).not.toBeNull();

    // Click remove button on that item
    const removeBtn = item.querySelector('.remove-item-btn');
    removeBtn.click();
    await new Promise(res => setTimeout(res, 0));

    // Cart empty again
    expect(global.cart.lines.nodes.length).toBe(0);
    expect(container.querySelector('.cart-item')).toBeNull();

    const subtotal = document.getElementById('cart-subtotal').textContent;
    expect(subtotal).toBe('$0.00');
  });
}); 