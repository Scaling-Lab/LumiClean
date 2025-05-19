// const TESTOLITE_PRO_VARIANT_ID = 'gid://shopify/ProductVariant/45184215875820';
//
// // --- Cart Drawer Elements ---
// const cartDrawer = document.getElementById('cart-drawer');
// const cartOverlay = document.getElementById('cart-overlay');
// const closeCartBtn = document.getElementById('close-cart-btn');
// const cartItemsContainer = cartDrawer.querySelector('.cart-items-container');
// const emptyCartMessage = document.getElementById('empty-cart-message');
// const cartSubtotalElement = document.getElementById('cart-subtotal');
// const checkoutBtn = document.getElementById('checkout-btn');
// const initialDiscountAmountElement = document.getElementById('initial-discount-amount');
// const cartLoadingOverlay = document.getElementById('cart-loading-overlay');
// const cartErrorContainer = document.getElementById('cart-error');
// const cartErrorMessage = document.getElementById('cart-error-message');
//
// // --- Alia Discount Elements ---
// const aliaDiscountSection = document.getElementById('alia-discount-section');
// const aliaRewardTextElement = document.getElementById('alia-reward-text');
// const aliaDiscountCodeElement = document.getElementById('alia-discount-code');
// const aliaTimerElement = document.getElementById('alia-timer');
// const aliaExpiredMessageElement = document.getElementById('alia-expired-message');
//
// // --- Cart State & Data ---
// let cart = null;
// let aliaTimerInterval = null;
// let isLoading = false;
//
// // --- Local Storage Keys ---
// const CART_ID_STORAGE_KEY = 'shopify_cart_id';
// const ALIA_CODE_STORAGE_KEY = 'alia_discount_code';
// const ALIA_TEXT_STORAGE_KEY = 'alia_reward_text';
// const ALIA_EXPIRY_STORAGE_KEY = 'alia_expiry_timestamp';
//
// // --- GraphQL Definitions ---
// const CartFragment = `
//     fragment CartFragment on Cart {
//         id
//         checkoutUrl
//         totalQuantity
//         cost {
//             subtotalAmount { amount currencyCode }
//             totalAmount { amount currencyCode }
//         }
//         lines(first: 50) {
//             nodes {
//                 id
//                 quantity
//                 cost {
//                     totalAmount { amount currencyCode }
//                 }
//                 merchandise {
//                     ... on ProductVariant {
//                         id
//                         title
//                         product { title }
//                         image { url altText }
//                         price { amount currencyCode }
//                         compareAtPrice { amount currencyCode }
//                     }
//                 }
//             }
//         }
//     }
// `;
//
// // --- API Functions ---
// async function callShopifyAPI(query, variables = {}) {
//     if (isLoading) {
//         console.warn("API call blocked, already loading.");
//         return;
//     }
//     setLoading(true);
//
//     // The path to your Netlify function
//     const netlifyFunctionEndpoint = '/.netlify/functions/shopify-proxy';
//
//     try {
//         const response = await fetch(netlifyFunctionEndpoint, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 // NO Storefront Access Token header needed here!
//             },
//             // Send the query and variables TO the Netlify function
//             body: JSON.stringify({ query, variables }),
//         });
//
//         // Check if the function call itself was successful
//         if (!response.ok) {
//             const errorBody = await response.text();
//             console.error('Netlify function error:', response.status, errorBody);
//             throw new Error(`Netlify function error: ${response.status}`);
//         }
//
//         // Parse the response from the Netlify function
//         const data = await response.json();
//
//         // Check for Shopify API errors in the response
//         if (data.errors) {
//             console.error('Shopify API errors:', data.errors);
//             throw new Error('Shopify API returned errors');
//         }
//
//         return data;
//     } catch (error) {
//         console.error('API Error:', error);
//         throw error;
//     } finally {
//         setLoading(false);
//     }
// }
//
// // --- Cart Management Functions ---
// async function getOrCreateCart() {
//     try {
//         let cartId = localStorage.getItem(CART_ID_STORAGE_KEY);
//
//         if (cartId) {
//             console.log('[Cart Debug] Stored cart ID:', cartId);
//             try {
//                 const query = `
//                     query GetCart($cartId: ID!) {
//                         cart(id: $cartId) {
//                             ...CartFragment
//                         }
//                     }
//                     ${CartFragment}
//                 `;
//
//                 const response = await callShopifyAPI(query, { cartId });
//                 if (response.data?.cart) {
//                     console.log('[Cart Debug] Successfully fetched existing cart:', cartId);
//                     return response.data.cart;
//                 }
//             } catch (error) {
//                 console.warn('[Cart Debug] Failed to fetch existing cart, creating new one');
//             }
//         }
//
//         // Create new cart if none exists or fetch failed
//         const query = `
//             mutation CreateCart {
//                 cartCreate {
//                     cart {
//                         ...CartFragment
//                     }
//                     userErrors {
//                         field
//                         message
//                     }
//                 }
//             }
//             ${CartFragment}
//         `;
//
//         const response = await callShopifyAPI(query);
//         if (response.data?.cartCreate?.cart) {
//             cartId = response.data.cartCreate.cart.id;
//             localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
//             return response.data.cartCreate.cart;
//         }
//
//         throw new Error('Failed to create cart');
//     } catch (error) {
//         console.error('[Cart Debug] Error in getOrCreateCart:', error);
//         throw error;
//     }
// }
//
// // --- UI Functions ---
// function setLoading(state) {
//     isLoading = state;
//     if (cartLoadingOverlay) {
//         cartLoadingOverlay.style.display = state ? 'flex' : 'none';
//     }
// }
//
// function showCartError(message, autoHideDelay = 5000) {
//     if (cartErrorContainer && cartErrorMessage) {
//         cartErrorMessage.textContent = message;
//         cartErrorContainer.style.display = 'block';
//
//         if (autoHideDelay > 0) {
//             setTimeout(hideCartError, autoHideDelay);
//         }
//     }
// }
//
// function hideCartError() {
//     if (cartErrorContainer) {
//         cartErrorContainer.style.display = 'none';
//     }
// }
//
// // --- Cart Operations ---
// async function addCartLine(cartId, merchandiseId, quantity = 1) {
//     const query = `
//         mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
//             cartLinesAdd(cartId: $cartId, lines: $lines) {
//                 cart {
//                     ...CartFragment
//                 }
//                 userErrors {
//                     field
//                     message
//                 }
//             }
//         }
//         ${CartFragment}
//     `;
//
//     const variables = {
//         cartId,
//         lines: [{
//             merchandiseId,
//             quantity
//         }]
//     };
//
//     const response = await callShopifyAPI(query, variables);
//     return response.data?.cartLinesAdd?.cart;
// }
//
// async function removeCartLine(cartId, lineId) {
//     const query = `
//         mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
//             cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
//                 cart {
//                     ...CartFragment
//                 }
//                 userErrors {
//                     field
//                     message
//                 }
//             }
//         }
//         ${CartFragment}
//     `;
//
//     const response = await callShopifyAPI(query, { cartId, lineIds: [lineId] });
//     return response.data?.cartLinesRemove?.cart;
// }
//
// // --- Event Handlers ---
// async function handleAddItemClick(variantId) {
//     try {
//         setLoading(true);
//         const currentCart = await getOrCreateCart();
//         const updatedCart = await addCartLine(currentCart.id, variantId);
//         cart = updatedCart;
//         renderCart();
//         openDrawer();
//     } catch (error) {
//         console.error('Failed to add item:', error);
//         showCartError('Failed to add item to cart. Please try again.');
//     } finally {
//         setLoading(false);
//     }
// }
//
// // --- Initialization ---
// async function initializeCart() {
//     try {
//         console.log('[Cart Init] Initializing cart...');
//         cart = await getOrCreateCart();
//         console.log('[Cart Debug] Cart initialized. Now checking/updating experiment attribute...');
//         await updateExperimentAttributeIfNeeded();
//         console.log('[Cart Debug] Attribute check/update complete.');
//         console.log('[Cart Init] Rendering cart after initialization attempt.');
//         renderCart();
//         setupEventListeners();
//     } catch (error) {
//         console.error('[Cart Init] Error initializing cart:', error);
//         showCartError('Failed to initialize cart. Please refresh the page.');
//     }
// }
//
// // Initialize on DOM load
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('[Cart Debug] DOMContentLoaded event');
//     initializeCart();
// });