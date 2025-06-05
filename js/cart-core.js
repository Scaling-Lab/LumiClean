import {
    CREATE_CART_MUTATION,
    FETCH_CART_QUERY,
    ADD_TO_CART_MUTATION, // Keep ADD for Klaviyo
    UPDATE_DISCOUNT_CODE_MUTATION, // Keep UPDATE_DISCOUNT for Alia timer
    CART_ATTRIBUTES_UPDATE_MUTATION, // Keep ATTRIBUTES for Alia poll
    CART_BUYER_IDENTITY_UPDATE_MUTATION // Keep BUYER_IDENTITY for Alia signup
} from './shopifyApi.js';

// --- Cart State & Data (Minimal for Core) ---
let cart = null; // Holds the cart object
let isLoading = false; // Simple loading state flag
let elevarCartInitialized = false; // Flag to track if core initialized Elevar

// --- Local Storage Keys (Namespaced) ---
const UVLIZER_PREFIX = 'trylumiclean_';
const CART_ID_STORAGE_KEY = `${UVLIZER_PREFIX}cart_id`;
// Keep Alia keys only if timer logic stays in core (it shouldn't)
// const ALIA_CODE_STORAGE_KEY = `${UVLIZER_PREFIX}alia_discount_code`;
// const ALIA_TEXT_STORAGE_KEY = `${UVLIZER_PREFIX}alia_reward_text`;
// const ALIA_EXPIRY_STORAGE_KEY = `${UVLIZER_PREFIX}alia_expiry_timestamp`;

// --- Minimal DOM elements needed by Core ---
const cartLoadingOverlay = document.getElementById('cart-loading-overlay'); // For global loading state
const cartErrorContainer = document.getElementById('cart-error');
const cartErrorMessage = document.getElementById('cart-error-message');
const checkoutBtn = document.getElementById('checkout-btn'); // Needed for loading state

// --- Helper function to get selected variant ID (needed for view_item) ---
function getSelectedVariantId() {
    const selectedBundle = document.querySelector('input[name="bundle"]:checked');
    if (selectedBundle) {
        const variantId = selectedBundle.closest('label').getAttribute('data-variant-id');
        if (variantId) return variantId;
    }
    const firstBundleLabel = document.querySelector('label[data-variant-id]');
    if (firstBundleLabel) {
        const firstVariantId = firstBundleLabel.getAttribute('data-variant-id');
        if (firstVariantId) return firstVariantId;
    }
    console.error("Could not find any variant ID in bundle options.");
    return null;
}

function getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const allowedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'gclid', 'fbclid'];
    const attributes = [];
    const piiParams = ['email', 'phone', 'firstname', 'lastname', 'address', 'zip', 'postcode', 'ssn', 'password'];
    params.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (allowedParams.includes(lowerKey) && !piiParams.includes(lowerKey) && value) {
             if (key.length <= 50 && value.length <= 250) {
                attributes.push({ key: key, value: value });
             }
        }
    });
    return attributes;
}

// --- API Call Helper (Simplified for Core) ---
async function callShopifyAPI(query, variables = {}) {
    // Only toggle global loading state if the elements exist
    if (cartLoadingOverlay && checkoutBtn) {
        isLoading = true;
        document.body.style.cursor = 'wait';
        cartLoadingOverlay.classList.remove('hidden');
        // Keep checkout button disabled during core API calls
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('opacity-50');
    }

    const netlifyFunctionEndpoint = '/.netlify/functions/shopify-proxy';
    try {
        const response = await fetch(netlifyFunctionEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Function call failed with status ${response.status}. ${errorBody}`);
        }
        const result = await response.json();
        if (result.errors) throw new Error(`GraphQL error: ${result.errors[0].message}`);
        if (!result || typeof result.data === 'undefined') throw new Error('Invalid response from API proxy');

        const dataKeys = Object.keys(result.data || {});
        if (dataKeys.length > 0) {
            const operationResult = result.data[dataKeys[0]];
            if (operationResult?.userErrors?.length > 0) {
                throw new Error(`Shopify error: ${operationResult.userErrors[0].message}`);
            }
        }
        return result.data;
    } catch (error) {
        console.error('Error in callShopifyAPI:', error);
        // Show error using core elements if available
        if (cartErrorMessage && cartErrorContainer) {
            cartErrorMessage.textContent = error.message || "An API error occurred.";
            cartErrorContainer.classList.remove('hidden');
            setTimeout(() => cartErrorContainer.classList.add('visible'), 10);
            // No auto-hide in core
        } else {
            alert(error.message || "An API error occurred."); // Fallback
        }
        throw error; // Re-throw so calling functions know it failed
    } finally {
        // Only toggle global loading state if the elements exist
        if (cartLoadingOverlay && checkoutBtn) {
            isLoading = false;
            document.body.style.cursor = 'default';
            cartLoadingOverlay.classList.add('hidden');
            // Re-enable checkout ONLY if cart has items (drawer module will handle this better)
            // We leave it disabled here for simplicity in core.
            // checkoutBtn.disabled = !(cart && cart.totalQuantity > 0);
            // checkoutBtn.classList.toggle('opacity-50', !(cart && cart.totalQuantity > 0));
        }
    }
}

// --- Minimal Elevar Helpers (Only for dl_user_data, dl_view_item) ---
function createElevarProductObjCore(item) {
    let priceRaw = item.merchandise?.price?.amount;
    let compareAtPriceRaw = item.merchandise?.compareAtPrice?.amount;
    let priceInCents = 19900;
    let compareAtPriceInCents = 24900;

    try {
        if (typeof priceRaw === 'number') priceInCents = Number.isInteger(priceRaw) ? priceRaw : Math.round(priceRaw * 100);
        else if (typeof priceRaw === 'string') {
            const numericPrice = parseFloat(priceRaw);
            if (!isNaN(numericPrice)) priceInCents = priceRaw.includes('.') ? Math.round(numericPrice * 100) : parseInt(priceRaw, 10);
        }
    } catch(e) { /* Silent fail */ }

    try {
        if (typeof compareAtPriceRaw === 'number') compareAtPriceInCents = Number.isInteger(compareAtPriceRaw) ? compareAtPriceRaw : Math.round(compareAtPriceRaw * 100);
        else if (typeof compareAtPriceRaw === 'string') {
            const numericComparePrice = parseFloat(compareAtPriceRaw);
            if (!isNaN(numericComparePrice)) compareAtPriceInCents = compareAtPriceRaw.includes('.') ? Math.round(numericComparePrice * 100) : parseInt(compareAtPriceRaw, 10);
            else compareAtPriceInCents = priceInCents;
        } else compareAtPriceInCents = priceInCents;
    } catch(e) { compareAtPriceInCents = priceInCents; } // Fallback compare to price on error

    // Now includes all fields from cart-drawer version
    return {
        id: item.merchandise?.product?.handle || "", // Product Handle
        name: item.merchandise?.product?.title || "",
        brand: "TryLumiClean", // Hardcoded brand
        category: "Home & Garden", // Hardcoded category
        variant: item.merchandise?.title || "", // Variant Title
        price: (priceInCents / 100).toFixed(2),
        quantity: item.quantity?.toString() || "1",
        product_id: item.merchandise?.product?.id?.substring(item.merchandise.product.id.lastIndexOf('/') + 1) || "", // Numeric Product ID
        variant_id: item.merchandise?.id?.substring(item.merchandise.id.lastIndexOf('/') + 1) || "", // Numeric Variant ID
        compare_at_price: (compareAtPriceInCents / 100).toFixed(2),
        image: item.merchandise?.image?.url || "",
        list: location.pathname // Use current path as list context
    };
}

function createElevarViewItemObj() {
    // Use hardcoded or minimal data for view_item in core
    return {
        id: "uvo-powered-home-disinfection-tower-new",
        name: "UVO254™ -  Powered Home Disinfection Tower",
        brand: "TryLumiClean",
        category: "Home & Garden",
        variant: "Default Title",
        price: "79.95", // Use default or fetch if critical
        product_id: "8000627572985",
        variant_id: "44103628357881", // Default variant ID
        compare_at_price: "99.95", // Use default
        list: location.pathname,
        image: "https://www.uvlizer.us/cdn/shop/files/Uv1_d65306eb-669a-4b43-9fc9-ad8f3a15c0ba_900x.png?v=1713433283"
    };
}

// --- MIDA REDIRECT HELPER ---
window.mfunc = window.mfunc || [];
function onMidaReady(callback) {
  if (window.mida) callback();
  else window.mfunc.push(callback);
}

// --- Elevar Initialization (Core Version) ---
function initializeElevarCore() {
  if (elevarCartInitialized) return;

  // Helper to perform actual Elevar initialization
  const runInit = () => {
    // Skip if Mida indicates a redirect is in progress
    if (window.mida && window.mida.isRedirect) return;

    window.ElevarDataLayer = window.ElevarDataLayer || [];
    const cartItems = cart?.lines?.nodes.map(createElevarProductObjCore) || [];
    let cartTotalRaw = cart?.cost?.totalAmount?.amount;
    let cartTotalInCents = 0;
    try {
        if (typeof cartTotalRaw === 'number') cartTotalInCents = Number.isInteger(cartTotalRaw) ? cartTotalRaw : Math.round(cartTotalRaw * 100);
        else if (typeof cartTotalRaw === 'string') {
            const numericTotal = parseFloat(cartTotalRaw);
            if (!isNaN(numericTotal)) cartTotalInCents = cartTotalRaw.includes('.') ? Math.round(numericTotal * 100) : parseInt(cartTotalRaw, 10);
        }
    } catch(e) { /* Silent fail */ }

    const userDataEvent = {
      event: 'dl_user_data',
      cart_total: (cartTotalInCents / 100).toFixed(2),
      user_properties: { visitor_type: 'guest' },
      ecommerce: {
        currencyCode: cart?.cost?.totalAmount?.currencyCode || 'USD',
        cart_contents: { products: cartItems }
      }
    };
    window.ElevarDataLayer.push(userDataEvent);
    elevarCartInitialized = true;

    triggerViewItemEventCore();
  };

  // If Mida is not present on the page, execute immediately. Otherwise, defer to onMidaReady.
  if (typeof window.mida === 'undefined') {
    runInit();
  } else {
    onMidaReady(runInit);
  }
}

function triggerViewItemEventCore() {
  if (!window.ElevarDataLayer) return;

  const product = createElevarViewItemObj();
  const viewItemEvent = {
    event: "dl_view_item",
    user_properties: { visitor_type: "guest" },
    ecommerce: {
      currencyCode: "USD",
      detail: {
        actionField: { list: location.pathname, action: "detail" },
        products: [product]
      }
    }
  };
  window.ElevarDataLayer.push(viewItemEvent);
}

// --- Cart Creation / Fetching (Core Version) ---
async function getOrCreateCartInternal() {
    let cartId = null;
    try { cartId = localStorage.getItem(CART_ID_STORAGE_KEY); } catch (e) {/* Silent fail */} 

    if (cartId) {
        try {
            const data = await callShopifyAPI(FETCH_CART_QUERY, { cartId });
            if (data?.cart) return data.cart;
            // Cart ID was invalid, clear it
            try { localStorage.removeItem(CART_ID_STORAGE_KEY); } catch (e) {/* Silent fail */} 
        } catch (error) {
            console.error("Error fetching existing cart:", error);
            try { localStorage.removeItem(CART_ID_STORAGE_KEY); } catch (e) {/* Silent fail */} 
            // Fall through to create new cart on fetch error
        }
    }

    // Create a new cart
    try {
        const utmAttributes = getUrlParameters();
        const MAX_ATTRIBUTES = 30;
        let combinedAttributes = utmAttributes.slice(0, MAX_ATTRIBUTES);
        const variables = { cartInput: { lines: [], attributes: combinedAttributes } };
        const data = await callShopifyAPI(CREATE_CART_MUTATION, variables);
        if (data?.cartCreate?.cart) {
            const newCart = data.cartCreate.cart;
            try { localStorage.setItem(CART_ID_STORAGE_KEY, newCart.id); } catch (e) {/* Silent fail */} 
            return newCart;
        } else {
            throw new Error(data?.cartCreate?.userErrors?.[0]?.message || "Cart creation failed unexpectedly.");
        }
    } catch (error) {
        console.error("Error creating new cart:", error);
        // Optionally show error via core mechanism
        // showCartError("Could not create a shopping cart. Please refresh and try again.");
        throw error; // Propagate error
    }
}

// --- Product API Integration (Core Version - needed for bundles) ---
/* // Bundle price update logic is now commented out as data is hardcoded in HTML
const productCache = {};

async function fetchProductData(variantId) {
    if (productCache[variantId]) return productCache[variantId];

    const VARIANT_QUERY = `
        query getVariantById($id: ID!) {
            node(id: $id) {
                ... on ProductVariant {
                    id title price { amount currencyCode } compareAtPrice { amount currencyCode }
                    image { url altText } product { id title }
                }
            }
        }
    `;
    try {
        const data = await callShopifyAPI(VARIANT_QUERY, { id: variantId });
        if (data?.node) {
            productCache[variantId] = data.node;
            return data.node;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching product data for ${variantId}:`, error);
        return null;
    }
}

function formatPrice(amount, currencyCode = 'USD') {
    try {
      return new Intl.NumberFormat(currencyCode === 'AED' ? 'en-AE' : 'en-US', {
        style: 'currency', currency: currencyCode,
      }).format(amount);
    } catch (e) {
      return `$${Number(amount).toFixed(2)}`; // Fallback
    }
}

// Function to update bundle UI (RUNS FROM CORE)
async function updateBundlePrices() {
    const bundleLabels = document.querySelectorAll('label[data-variant-id]');
    for (const label of bundleLabels) {
        const variantId = label.getAttribute('data-variant-id');
        if (!variantId) continue;

        const priceElement = label.querySelector('p.font-bold');
        const originalPriceElement = label.querySelector('p.line-through');
        const imageElement = label.querySelector('img');

        // Show loading state only if elements exist
        if (priceElement) priceElement.innerHTML = '<span class="inline-block animate-pulse h-4 w-16 bg-slate-200 rounded"></span>';
        if (originalPriceElement) originalPriceElement.innerHTML = '<span class="inline-block animate-pulse h-3 w-12 bg-slate-200 rounded"></span>';

        try {
            const productData = await fetchProductData(variantId);
            if (productData) {
                if (priceElement && productData.price) {
                    priceElement.textContent = formatPrice(productData.price.amount, productData.price.currencyCode);
                }
                if (originalPriceElement && productData.compareAtPrice) {
                    originalPriceElement.textContent = formatPrice(productData.compareAtPrice.amount, productData.compareAtPrice.currencyCode);
                } else if (originalPriceElement) {
                    originalPriceElement.innerHTML = ''; // Clear if no compare price
                }
                if (imageElement && productData.image?.url) {
                    const originalSrc = imageElement.src;
                    imageElement.onerror = () => { imageElement.src = originalSrc; }; // Restore on error
                    imageElement.src = productData.image.url;
                    imageElement.alt = productData.image.altText || productData.product?.title || 'TryLumiClean Bundle Option';
                }
            }
        } catch (error) {
            console.error(`Error updating bundle for ${variantId}:`, error);
            // Restore original text on error?
            if (priceElement) priceElement.textContent = 'Error';
            if (originalPriceElement) originalPriceElement.innerHTML = '';
        }
    }
}
*/

// --- Alia Event Listeners (Core Version - Only for data capture) ---
function setupCoreAliaListeners() {
    // Alia Event Listener - Signup
    document.addEventListener("alia:signup", async (e) => {
        if (isLoading) return;
        const { email, phone } = e.detail;
        if (!email && !phone) return;

        if (!cart) {
            try { await cartPromise; } // Ensure cart is created/fetched
            catch(err) { console.error("Cart needed for signup but failed to init:", err); return; }
        }
        if (!cart) return; // Should not happen if await succeeded

        const buyerIdentity = {};
        if (email) buyerIdentity.email = email;
        if (phone) buyerIdentity.phone = phone;

        try {
            const data = await callShopifyAPI(CART_BUYER_IDENTITY_UPDATE_MUTATION, {
                cartId: cart.id, buyerIdentity: buyerIdentity
            });
            if (data?.cartBuyerIdentityUpdate?.cart) {
                cart = data.cartBuyerIdentityUpdate.cart; // Update core cart state
            } else {
                 throw new Error(data?.cartBuyerIdentityUpdate?.userErrors?.[0]?.message || "Unknown error updating buyer identity.");
            }
        } catch (error) {
            console.error("Error updating buyer identity:", error);
            // Maybe show error using core mechanism?
        }
    });

    // Alia Event Listener - Poll Answered
    document.addEventListener("alia:pollAnswered", async (e) => {
        if (isLoading) return;
        const { answers } = e.detail;
        if (!answers || answers.length === 0) return;

        if (!cart) {
            try { await cartPromise; } // Ensure cart is created/fetched
            catch(err) { console.error("Cart needed for poll but failed to init:", err); return; }
        }
         if (!cart) return;

        const newPollAttributes = answers.map(answer => ({
            key: `poll_${answer.questionID || 'question'}`,
            value: `${answer.questionText}: ${answer.answerText}`
        })).filter(attr => attr.key.length <= 100 && attr.value.length <= 255);

        if (newPollAttributes.length === 0) return;

        const existingAttributes = (cart && Array.isArray(cart.attributes)) ? cart.attributes : [];
        const nonPollExistingAttributes = existingAttributes.filter(attr => !attr.key.startsWith('poll_'));
        const mergedAttributes = [...nonPollExistingAttributes, ...validNewPollAttributes];

        try {
            const data = await callShopifyAPI(CART_ATTRIBUTES_UPDATE_MUTATION, {
                cartId: cart.id, attributes: mergedAttributes
            });
            if (data?.cartAttributesUpdate?.cart) {
                cart = data.cartAttributesUpdate.cart; // Update core cart state
            } else {
                 throw new Error(data?.cartAttributesUpdate?.userErrors?.[0]?.message || "Unknown error updating cart attributes.");
            }
        } catch (error) {
            console.error("Error updating cart attributes with poll answers:", error);
        }
    });

    // DO NOT include Alia:rewardClaimed listener here, as it needs UI updates from drawer module
}

// --- Global Initialization (Core) ---
const cartPromise = (async () => {
    try {
        cart = await getOrCreateCartInternal();
        if (!cart) throw new Error("Cart initialization failed");
        initializeElevarCore(); // Fire Elevar events
        // await updateBundlePrices(); // Commented out as requested
        setupCoreAliaListeners(); // Attach listeners for data capture
        return cart;
    } catch (error) {
        console.error("Critical Cart Initialization Error:", error);
        // Potentially show a persistent error message here
        throw error; // Ensure promise rejects
    }
})();

// --- Exports for other modules ---
export const getCart = () => cartPromise; // Returns the promise that resolves with the cart object
export const cartReady = cartPromise.then(() => {}); // A promise that resolves when core setup (cart + Elevar + bundles) is done

// Also export API call helper if needed by drawer module (likely)
export { callShopifyAPI };
// Export addCartLine/updateDiscountCode if needed for Alia logic
export { addCartLine, applyDiscountCode };

// Helper: Needed by drawer module for Alia timer expiry logic
async function applyDiscountCode(cartId, discountCode = null) {
    if (!cartId) throw new Error("Cart ID is missing.");
    const codesToApply = discountCode ? (Array.isArray(discountCode) ? discountCode : [discountCode]) : [];
    try {
        const data = await callShopifyAPI(UPDATE_DISCOUNT_CODE_MUTATION, {
            cartId, discountCodes: codesToApply,
        });
        const updatedCart = data?.cartDiscountCodesUpdate?.cart;
        const userErrors = data?.cartDiscountCodesUpdate?.userErrors;
        if (userErrors && userErrors.length > 0) throw new Error(userErrors[0].message);
        if (!updatedCart) throw new Error("Failed to update cart with discount code.");
        cart = updatedCart; // Update core cart state
        return updatedCart;
    } catch (error) {
        console.error("Error applying/removing discount code:", error);
        throw error;
    }
}

// Helper: Needed by drawer module for Klaviyo tracking
async function addCartLine(cartId, merchandiseId, quantity = 1) {
     if (!merchandiseId) return cart;
     const cartBeforeAdd = JSON.parse(JSON.stringify(cart)); // Needs cart state
     const data = await callShopifyAPI(ADD_TO_CART_MUTATION, { cartId, lines: [{ merchandiseId, quantity }] });
     const updatedCart = data?.cartLinesAdd?.cart;
     if (updatedCart) cart = updatedCart; // Update core cart state
     // Elevar push for add_to_cart will happen in the drawer module which calls this
     return updatedCart;
}

// --- Minimal error display function for core ---
function showCartError(message) {
     if (cartErrorMessage && cartErrorContainer) {
         cartErrorMessage.textContent = message;
         cartErrorContainer.classList.remove('hidden');
         setTimeout(() => cartErrorContainer.classList.add('visible'), 10);
         // No auto-hide in core
     } else {
         console.warn("Cart error elements not found for core error display, falling back to console");
         console.error("Cart Core Error:", message);
     }
} 