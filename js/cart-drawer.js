// Import dependencies from cart-core
import {
    getCart,
    cartReady,
    callShopifyAPI, // Use the core API caller
    addCartLine, // Use the core adder for Klaviyo
    applyDiscountCode // Use the core discount updater for Alia timer
} from './cart-core.js';

// Import mutations/queries (assuming they might still be needed here, or move to core if only used there)
import {
    REMOVE_FROM_CART_MUTATION,
    UPDATE_CART_LINE_MUTATION
    // UPDATE_DISCOUNT_CODE_MUTATION, // Handled by core
    // CART_ATTRIBUTES_UPDATE_MUTATION, // Handled by core
    // CART_BUYER_IDENTITY_UPDATE_MUTATION // Handled by core
} from './shopifyApi.js';

// --- Cart Drawer Elements (Specific to Drawer UI) ---
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = cartDrawer.querySelector('.cart-items-container');
const emptyCartMessage = document.getElementById('empty-cart-message');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const checkoutBtn = document.getElementById('checkout-btn'); // Still need reference
// const initialDiscountAmountElement = document.getElementById('initial-discount-amount'); // Not used
const cartLoadingOverlay = document.getElementById('cart-loading-overlay'); // Still need reference
const cartErrorContainer = document.getElementById('cart-error'); // Still need reference
const cartErrorMessage = document.getElementById('cart-error-message'); // Still need reference

// --- Alia Discount Elements (Specific to Drawer UI) ---
const aliaDiscountSection = document.getElementById('alia-discount-section');
const aliaRewardTextElement = document.getElementById('alia-reward-text');
const aliaDiscountCodeElement = document.getElementById('alia-discount-code');
const aliaTimerElement = document.getElementById('alia-timer');
const aliaExpiredMessageElement = document.getElementById('alia-expired-message');

// --- Cart State (Local to Drawer) ---
let cart = null; // Will be populated by getCart()
let aliaTimerInterval = null;
let isLoading = false; // Manage loading state locally for drawer actions
let previousActiveElement = null; // For focus trapping

// --- Local Storage Keys (Needed for Alia UI) ---
const UVLIZER_PREFIX = 'lumiclean_';
const ALIA_CODE_STORAGE_KEY = `${UVLIZER_PREFIX}alia_discount_code`;
const ALIA_TEXT_STORAGE_KEY = `${UVLIZER_PREFIX}alia_reward_text`;
const ALIA_EXPIRY_STORAGE_KEY = `${UVLIZER_PREFIX}alia_expiry_timestamp`;

// --- Helper function to get selected variant ID (Only needed if add-to-cart initiated from drawer, unlikely) ---
// function getSelectedVariantId() { ... } // Likely remove

// --- Loading State (Drawer Specific) ---
function setLoading(state) {
    isLoading = state;
    if (cartLoadingOverlay) cartLoadingOverlay.classList.toggle('hidden', !state);
    document.body.style.cursor = state ? 'wait' : 'default';
    if (checkoutBtn) {
        checkoutBtn.disabled = state || (cart && cart.totalQuantity === 0);
        checkoutBtn.classList.toggle('opacity-50', state || (cart && cart.totalQuantity === 0));
    }
    // Disable drawer-specific buttons
    cartItemsContainer?.querySelectorAll('.remove-item-btn, .quantity-btn').forEach(btn => btn.disabled = state);
}

// --- Error Display (Drawer Specific) ---
function showCartError(message, autoHideDelay = 5000) {
    if (window.cartErrorTimeout) clearTimeout(window.cartErrorTimeout);
    if (cartErrorMessage && cartErrorContainer) {
        cartErrorMessage.textContent = message;
        cartErrorContainer.classList.remove('hidden');
        setTimeout(() => {
            cartErrorContainer.classList.add('visible');
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: cartErrorContainer.querySelectorAll('[data-lucide]') });
        }, 10);
        if (autoHideDelay > 0) {
            window.cartErrorTimeout = setTimeout(hideCartError, autoHideDelay);
        }
    } else {
        alert(message);
    }
}

function hideCartError() {
    if (cartErrorContainer) {
        cartErrorContainer.classList.remove('visible');
        setTimeout(() => cartErrorContainer.classList.add('hidden'), 300);
    }
}

// --- Elevar Helper Functions (Drawer Specific - for view_cart, add, remove) ---
// Simplified createElevarProductObj - core version might not have all fields
function createElevarProductObj(item, includeQuantity = true) {
    let priceRaw = item.merchandise?.price?.amount;
    let compareAtPriceRaw = item.merchandise?.compareAtPrice?.amount;
    let priceInCents = 19900; // Default
    let compareAtPriceInCents = 24900; // Default

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
    } catch(e) { compareAtPriceInCents = priceInCents; }

    const product = {
      id: item.merchandise?.product?.handle || "",
      name: item.merchandise?.product?.title || "",
      brand: "Lumiclean",
      category: "Home & Garden",
      variant: item.merchandise?.title || "",
      price: (priceInCents / 100).toFixed(2),
      product_id: item.merchandise?.product?.id?.substring(item.merchandise.product.id.lastIndexOf('/') + 1) || "",
      variant_id: item.merchandise?.id?.substring(item.merchandise.id.lastIndexOf('/') + 1) || "",
      compare_at_price: (compareAtPriceInCents / 100).toFixed(2),
      image: item.merchandise?.image?.url || "",
      list: location.pathname
    };

    if (includeQuantity && typeof item.quantity !== 'undefined') {
      product.quantity = item.quantity.toString();
    } else if (includeQuantity) {
      product.quantity = "1";
    }
    return product;
}

function createElevarImpressionObj(item, index) {
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
    } catch(e) { /* */ }

    try {
         if (typeof compareAtPriceRaw === 'number') compareAtPriceInCents = Number.isInteger(compareAtPriceRaw) ? compareAtPriceRaw : Math.round(compareAtPriceRaw * 100);
         else if (typeof compareAtPriceRaw === 'string') {
            const numericComparePrice = parseFloat(compareAtPriceRaw);
            if (!isNaN(numericComparePrice)) compareAtPriceInCents = compareAtPriceRaw.includes('.') ? Math.round(numericComparePrice * 100) : parseInt(compareAtPriceRaw, 10);
            else compareAtPriceInCents = priceInCents;
         } else compareAtPriceInCents = priceInCents;
    } catch(e) { compareAtPriceInCents = priceInCents; }

    return {
      id: item.merchandise?.product?.handle || "",
      name: item.merchandise?.product?.title || "",
      brand: "Lumiclean",
      category: "Home & Garden",
      variant: item.merchandise?.title || "",
      price: (priceInCents / 100).toFixed(2),
      quantity: item.quantity ? item.quantity.toString() : "1",
      product_id: item.merchandise?.product?.id?.substring(item.merchandise.product.id.lastIndexOf('/') + 1) || "",
      variant_id: item.merchandise?.id?.substring(item.merchandise.id.lastIndexOf('/') + 1) || "",
      compare_at_price: (compareAtPriceInCents / 100).toFixed(2),
      image: item.merchandise?.image?.url || "",
      position: index + 1
    };
}

// --- Cart Actions (Specific to Drawer - Modify, Remove) ---
// Note: addCartLine is imported from core

async function removeCartLineDrawer(cartId, lineId) {
    let productToRemoveForEvent = null;
    if (cart && window.ElevarDataLayer) {
        const lineToRemove = cart.lines.nodes.find(line => line.id === lineId);
        if (lineToRemove) {
            productToRemoveForEvent = createElevarProductObj(lineToRemove, true);
            productToRemoveForEvent.quantity = lineToRemove.quantity.toString();
            productToRemoveForEvent.list = location.pathname;
        }
    }

    try {
        // Use the imported core API caller
        const data = await callShopifyAPI(REMOVE_FROM_CART_MUTATION, {
            cartId,
            lineIds: [lineId],
        });
        const updatedCart = data?.cartLinesRemove?.cart;

        if (productToRemoveForEvent && updatedCart) {
             const removeFromCartEvent = {
                event: "dl_remove_from_cart",
                user_properties: { visitor_type: "guest" },
                ecommerce: {
                    currencyCode: updatedCart.cost?.totalAmount?.currencyCode || "USD",
                    remove: {
                        actionField: { list: location.pathname },
                        products: [productToRemoveForEvent]
                    }
                }
            };
            window.ElevarDataLayer.push(removeFromCartEvent);
        }
        if (updatedCart) cart = updatedCart; // Update local cart state
        return updatedCart;
    } catch (error) {
        console.error(`[Cart Drawer] Error removing line ${lineId}:`, error);
        throw error;
    }
}

async function updateCartLineDrawer(lineId, newQuantity) {
    try {
        // Uses core callShopifyAPI
        const data = await callShopifyAPI(UPDATE_CART_LINE_MUTATION, {
            cartId: cart.id,
            lines: [{ id: lineId, quantity: newQuantity }],
        });
        const updatedCart = data?.cartLinesUpdate?.cart;
        if (updatedCart) cart = updatedCart; // Update local cart state
        return updatedCart;
    } catch (error) {
        console.error(`[Cart Drawer] Error updating line ${lineId} to quantity ${newQuantity}:`, error);
        throw error;
    }
}

// --- UI Rendering (Specific to Drawer) ---
function renderCartItems() {
    const template = document.getElementById('cart-item-template');
    if (!cart || !cart.lines?.nodes.length || !template || !cartItemsContainer) {
        if (emptyCartMessage) {
            emptyCartMessage.classList.remove('hidden');
            emptyCartMessage.innerHTML = 'Your cart is empty.<br><br><a href="#" id="continue-shopping-empty" class="inline-block bg-red-600 text-white text-base font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-red-700 transition duration-300 text-center">Continue Shopping</a>';
            const continueShoppingBtnEmpty = document.getElementById('continue-shopping-empty');
            if (continueShoppingBtnEmpty && !continueShoppingBtnEmpty.getAttribute('data-listener-added')) {
                 continueShoppingBtnEmpty.addEventListener('click', (e) => { e.preventDefault(); closeDrawer(); });
                 continueShoppingBtnEmpty.setAttribute('data-listener-added', 'true');
            }
        }
        if(cartItemsContainer) cartItemsContainer.innerHTML = ''; // Clear if empty
        return;
    }

    if (emptyCartMessage) emptyCartMessage.classList.add('hidden');

    const currentLineIds = new Set(cart.lines.nodes.map(item => item.id));
    const existingDomElements = cartItemsContainer.querySelectorAll('.cart-item[data-line-id]');

    existingDomElements.forEach(el => {
        if (!currentLineIds.has(el.getAttribute('data-line-id'))) el.remove();
    });

    cart.lines.nodes.forEach(item => {
        let itemElement = cartItemsContainer.querySelector(`.cart-item[data-line-id="${item.id}"]`);
        if (itemElement) {
            updateCartItemContent(itemElement, item, false);
        } else {
            const templateContent = template.content?.firstElementChild;
            itemElement = templateContent ? templateContent.cloneNode(true) : template.cloneNode(true);
            itemElement.classList.remove('hidden');
            itemElement.removeAttribute('id');
            itemElement.setAttribute('data-line-id', item.id);
            updateCartItemContent(itemElement, item, true);
            cartItemsContainer.appendChild(itemElement);
            if (window.lucide?.createIcons) {
                try { window.lucide.createIcons({ nodes: [itemElement] }); } catch (e) {/* */} 
            }
        }
    });
}

function updateCartItemContent(itemElement, item, isNew = false) {
    const merchandise = item.merchandise;
    if (isNew) {
        const img = itemElement.querySelector('[data-cart-item-image]');
        if (img) {
            img.src = merchandise.image?.url || '';
            img.alt = merchandise.image?.altText || merchandise.product.title;
        }
        const name = itemElement.querySelector('[data-cart-item-name]');
        if (name) name.textContent = merchandise.product.title;
    }
    const qty = itemElement.querySelector('[data-cart-item-quantity]');
    if (qty) qty.textContent = item.quantity;
    const price = itemElement.querySelector('[data-cart-item-price]');
    if (price) price.textContent = `$${parseFloat(item.cost.totalAmount.amount).toFixed(2)}`;

    const originalPriceElem = itemElement.querySelector('[data-cart-item-original-price]');
    if (originalPriceElem) {
        const compareAtPricePerItem = merchandise.compareAtPrice ? parseFloat(merchandise.compareAtPrice.amount) : null;
        const currentPricePerItem = parseFloat(merchandise.price.amount);
        if (compareAtPricePerItem && compareAtPricePerItem > currentPricePerItem) {
            const totalCompareAtPrice = compareAtPricePerItem * item.quantity;
            originalPriceElem.textContent = `$${totalCompareAtPrice.toFixed(2)}`;
            originalPriceElem.classList.remove('hidden');
        } else {
            originalPriceElem.classList.add('hidden');
        }
    }
    const minusBtn = itemElement.querySelector('.quantity-minus-btn');
    if (minusBtn) minusBtn.disabled = item.quantity <= 0;
}

function updateCartIconCount() {
    const cartCounter = document.getElementById('cart-item-count');
    const cartIcon = document.getElementById('open-cart-trigger');
    const total = cart?.totalQuantity || 0;
    if (cartCounter) cartCounter.textContent = total;
    if (cartIcon) {
        cartIcon.classList.remove('hidden');
        cartCounter?.classList.toggle('hidden', total === 0);
     }
 }

function renderCartSummary() {
    const installmentInfoElement = document.getElementById('installment-info');
    const originalTotalEl = document.getElementById('cart-original-total');
    const savingsEl = document.getElementById('total-savings-amount');
    const subtotalEl = document.getElementById('cart-subtotal');

    if (!cart || !cart.lines?.nodes.length) {
        if(originalTotalEl) originalTotalEl.textContent = '$0.00';
        if(savingsEl) savingsEl.textContent = '-$0.00';
        if(subtotalEl) subtotalEl.textContent = '$0.00';
        if(checkoutBtn) {
            checkoutBtn.setAttribute('data-checkout-url', '#');
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('opacity-50');
        }
        if (installmentInfoElement) installmentInfoElement.innerHTML = '';
        return;
    }

    let totalOriginalPrice = 0;
    let totalRegularPrice = 0;
    cart.lines.nodes.forEach(item => {
        const merchandise = item.merchandise;
        const quantity = item.quantity;
        const compareAtPrice = merchandise.compareAtPrice ? parseFloat(merchandise.compareAtPrice.amount) : null;
        const regularPrice = parseFloat(merchandise.price.amount);
        const effectiveOriginal = compareAtPrice && compareAtPrice > regularPrice ? compareAtPrice : regularPrice;
        totalOriginalPrice += effectiveOriginal * quantity;
        totalRegularPrice += regularPrice * quantity;
    });

    const finalPrice = totalRegularPrice;
    const totalSavings = totalOriginalPrice - finalPrice;

    if(originalTotalEl) originalTotalEl.textContent = `$${totalOriginalPrice.toFixed(2)}`;
    if(savingsEl) savingsEl.textContent = `-$${totalSavings.toFixed(2)}`;
    if(subtotalEl) subtotalEl.textContent = `$${finalPrice.toFixed(2)}`;

    if(checkoutBtn) {
        checkoutBtn.disabled = finalPrice === 0;
        checkoutBtn.classList.toggle('opacity-50', finalPrice === 0);
        checkoutBtn.setAttribute('data-checkout-url', cart.checkoutUrl || '#');
    }

    if (installmentInfoElement) {
        if (finalPrice > 0) {
            const installmentAmountStr = (finalPrice / 4).toFixed(2);
            const amountEl = installmentInfoElement.querySelector('b');
            if (amountEl) {
                if (amountEl.textContent !== `$${installmentAmountStr}`) amountEl.textContent = `$${installmentAmountStr}`;
            } else {
                const shopPayLogoUrl = "https://res.cloudinary.com/dg8ibuag5/image/upload/v1743723089/Shop_Pay_logo_purple_xqxhd1.svg";
                installmentInfoElement.innerHTML = `or 4 interest-free payments of <b>$${installmentAmountStr}</b> with <img src="${shopPayLogoUrl}" alt="Shop Pay" class="inline-block h-4 ml-1 align-middle" loading="lazy">`;
            }
        } else {
            installmentInfoElement.innerHTML = '';
        }
    }
}

function renderAppliedDiscounts() {
    let aliaCode = null, storedExpiry = 0, aliaText = '';
    try {
        aliaCode = localStorage.getItem(ALIA_CODE_STORAGE_KEY);
        const expiryStr = localStorage.getItem(ALIA_EXPIRY_STORAGE_KEY);
        storedExpiry = expiryStr ? parseInt(expiryStr) : 0;
        aliaText = localStorage.getItem(ALIA_TEXT_STORAGE_KEY) || '';
    } catch (e) { /* Silent fail */ }

    const isLocalStorageValid = aliaCode && storedExpiry && storedExpiry > Date.now();
    const isCodeInShopifyCart = cart?.discountCodes?.some(dc => dc.code === aliaCode);

    if (isLocalStorageValid && isCodeInShopifyCart) {
        if(aliaRewardTextElement) aliaRewardTextElement.textContent = aliaText || 'Discount Applied';
        if(aliaDiscountCodeElement) aliaDiscountCodeElement.textContent = aliaCode;
        if(aliaDiscountSection) aliaDiscountSection.classList.remove('hidden');
        startAliaTimer(Math.floor((storedExpiry - Date.now()) / 1000));
    } else {
        if(aliaDiscountSection) aliaDiscountSection.classList.add('hidden');
        if (aliaExpiredMessageElement) aliaExpiredMessageElement.classList.add('hidden');
        clearInterval(aliaTimerInterval);
        if (aliaCode && storedExpiry && storedExpiry <= Date.now()) {
            try {
                localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
            } catch (e) { /* */ }
        }
    }
}

function startAliaTimer(durationSeconds) {
    clearInterval(aliaTimerInterval);
    if (!aliaTimerElement || !aliaDiscountSection) return;

    if (durationSeconds <= 0) {
        aliaTimerElement.textContent = "Expired";
        aliaDiscountSection.classList.add('opacity-50');
        try {
            localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
            localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
            localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
        } catch (e) { /* */ }
        // Re-render needed, potentially refetch cart if discount auto-removed by Shopify
        // For simplicity, just render UI state based on local storage removal
        renderAppliedDiscounts();
        renderCartSummary();
        return;
    }

    aliaDiscountSection.classList.remove('opacity-50');
    let timer = durationSeconds;
    const updateTimerDisplay = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        aliaTimerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    updateTimerDisplay();

    aliaTimerInterval = setInterval(() => {
        timer--;
        updateTimerDisplay();
        if (timer < 0) {
            clearInterval(aliaTimerInterval);
            aliaTimerElement.textContent = "Expired";
            aliaDiscountSection.classList.add('opacity-50');
            try {
                localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
            } catch (e) { /* */ }

            if (cart?.id) {
                applyDiscountCode(cart.id) // Use imported core function
                    .then(updatedCart => {
                        if (updatedCart) {
                            cart = updatedCart; // Update local state
                            renderCart();
                            if (aliaExpiredMessageElement) aliaExpiredMessageElement.classList.remove('hidden');
                        }
                    })
                    .catch(error => {
                        console.error("Error removing discount code from Shopify cart:", error);
                        renderCart(); // Still render UI
                        if (aliaExpiredMessageElement) aliaExpiredMessageElement.classList.remove('hidden');
                    });
            } else {
                 renderCart();
                 if (aliaExpiredMessageElement) aliaExpiredMessageElement.classList.remove('hidden');
            }
        }
    }, 1000);
}

function renderCart() {
    if(!cart) return; // Should be ensured by cartReady
    renderCartItems();
    renderCartSummary();
    renderAppliedDiscounts();
    updateCartIconCount();
    setLoading(false);
}

// --- Drawer Open/Close Logic ---
function openDrawer() {
    if (!cartDrawer || !cartOverlay) return;
    previousActiveElement = document.activeElement;
    cartOverlay.classList.remove('hidden', 'pointer-events-none');
    cartOverlay.classList.add('pointer-events-auto');
    setTimeout(() => cartOverlay.classList.add('opacity-100'), 10);
    cartDrawer.classList.remove('translate-x-full');
    cartDrawer.classList.add('translate-x-0');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('cart-drawer-open');

    setTimeout(() => {
        const focusableElements = cartDrawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) focusableElements[0].focus();
        cartDrawer.addEventListener('keydown', handleFocusTrap);
    }, 10);

    if(cart) {
        renderCart(); // Render content when opening

         // --- Elevar dl_view_cart ---
         if (window.ElevarDataLayer && cart.lines?.nodes.length > 0) {
             const impressions = cart.lines.nodes.map((item, index) => {
                  return createElevarImpressionObj(item, index);
             });
             let cartTotalRaw = cart?.cost?.subtotalAmount?.amount;
             let cartTotalInCents = 0;
             try {
                 if (typeof cartTotalRaw === 'number') cartTotalInCents = Number.isInteger(cartTotalRaw) ? cartTotalRaw : Math.round(cartTotalRaw * 100);
                 else if (typeof cartTotalRaw === 'string') {
                     const numericTotal = parseFloat(cartTotalRaw);
                     if (!isNaN(numericTotal)) cartTotalInCents = cartTotalRaw.includes('.') ? Math.round(numericTotal * 100) : parseInt(cartTotalRaw, 10);
                 }
             } catch(e) { /* */ }

             const viewCartEvent = {
                 event: "dl_view_cart",
                 user_properties: { visitor_type: "guest" },
                 cart_total: (cartTotalInCents / 100).toFixed(2),
                 ecommerce: {
                     currencyCode: cart.cost?.totalAmount?.currencyCode || "USD",
                     actionField: { list: "Shopping Cart" },
                     impressions: impressions
                 }
             };
             window.ElevarDataLayer.push(viewCartEvent);
         }
    }
}

function closeDrawer() {
    if (!cartDrawer || !cartOverlay) return;
    cartOverlay.classList.remove('opacity-100', 'pointer-events-auto');
    cartOverlay.classList.add('pointer-events-none');
    setTimeout(() => cartOverlay.classList.add('hidden'), 300);
    cartDrawer.classList.remove('translate-x-0');
    cartDrawer.classList.add('translate-x-full');
    document.documentElement.classList.remove('cart-drawer-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartDrawer.removeEventListener('keydown', handleFocusTrap);
    if (previousActiveElement) {
        previousActiveElement.focus();
        previousActiveElement = null;
    }
    hideCartError();
}

// --- Event Handlers (Drawer Specific) ---
async function handleRemoveItem(eventOrButton) {
    const button = (eventOrButton instanceof Event) ? eventOrButton.currentTarget : eventOrButton;
     let lineId = button.getAttribute('data-line-id');
     if (!lineId) {
         const lineEl = button.closest('.cart-item');
         lineId = lineEl?.getAttribute('data-line-id');
     }
    if (!cart || !lineId) return;
     try {
         const updatedCart = await removeCartLineDrawer(cart.id, lineId);
         if (updatedCart) {
             renderCart(); // Re-render everything after remove
         }
     } catch (error) {
         showCartError("Could not remove item. Please try again.");
     }
}

async function handleUpdateItemQuantity(lineId, newQuantity) {
   if (!cart || !lineId || newQuantity < 0) return;
   try {
       let updatedCart;
       if (newQuantity === 0) {
           updatedCart = await removeCartLineDrawer(cart.id, lineId);
       } else {
           updatedCart = await updateCartLineDrawer(lineId, newQuantity);
       }
       if (updatedCart) {
           renderCart(); // Re-render everything after update
       }
   } catch (error) {
       showCartError("Could not update item quantity. Please try again.");
   }
}

async function handleAddItemClick(variantId) {
    if (!variantId || !cart?.id) return;
    try {
        const updatedCart = await addCartLine(cart.id, variantId, 1); // Use imported core function
        if (updatedCart) {
            cart = updatedCart; // Update local state
            // Find added line for tracking
            const addedLine = updatedCart.lines.nodes.find(line => line.merchandise.id === variantId);
            if (addedLine) {
                // Prepare Klaviyo Data
                const klaviyoCartItems = updatedCart.lines.nodes.map(line => {
                    const merch = line.merchandise;
                    // Align property names with Klaviyo docs and add SKU if available
                    return {
                        ProductID: merch.id,
                        SKU: merch.sku || "", // Add SKU if available
                        ProductName: merch.product.title, // Use ProductName
                        Quantity: line.quantity,
                        ItemPrice: parseFloat(merch.price.amount),
                        RowTotal: parseFloat(line.cost.totalAmount.amount),
                        ImageURL: merch.image?.url,
                        ProductURL: window.location.origin + merch.product.url, // Use ProductURL and product's relative URL
                        ProductCategories: merch.product.collections?.nodes?.map(c => c.title) || [], // Use ProductCategories, get from collections if possible
                        Brand: 'Lumiclean', // Keep Brand if useful
                        VariantName: merch.title // Keep VariantName if useful
                    };
                });

                // Create top-level properties as per Klaviyo docs
                const allCategories = [...new Set(klaviyoCartItems.flatMap(item => item.ProductCategories))];
                const itemNames = klaviyoCartItems.map(item => item.ProductName);

                const klaviyoCartData = {
                    total_price: parseFloat(updatedCart.cost.totalAmount.amount),
                    $value: parseFloat(updatedCart.cost.totalAmount.amount),
                    original_total_price: parseFloat(updatedCart.cost.subtotalAmount.amount), // Keep if useful
                    ItemNames: itemNames, // Add ItemNames array
                    Categories: allCategories, // Add unified Categories array
                    ItemCount: updatedCart.totalQuantity, // Add ItemCount
                    CheckoutURL: updatedCart.checkoutUrl || "", // Add CheckoutURL
                    items: klaviyoCartItems, // Use the updated items array
                };

                // Push Klaviyo 'Added to Cart' event
                // Ensure Klaviyo.js is loaded globally for this to work
                if (typeof klaviyo !== 'undefined') {
                    klaviyo.push(['track', 'Added to Cart', klaviyoCartData]);
                } else {
                    console.warn('Klaviyo object not found. "Added to Cart" event not tracked.');
                }

                 // --- Elevar dl_add_to_cart ---
                 const cartBeforeAdd = JSON.parse(JSON.stringify(cart)); // Get previous state
                 const productForEvent = createElevarProductObj(addedLine, true);
                 const oldLine = cartBeforeAdd?.lines?.nodes.find(old => old.merchandise.id === addedLine.merchandise.id);
                 const quantityAdded = oldLine ? addedLine.quantity - oldLine.quantity : addedLine.quantity;
                 productForEvent.quantity = quantityAdded > 0 ? quantityAdded.toString() : "1"; // Ensure positive qty
                 productForEvent.list = location.pathname;
                 const addToCartEvent = {
                     event: "dl_add_to_cart",
                     user_properties: { visitor_type: "guest" },
                     ecommerce: {
                         currencyCode: updatedCart.cost?.totalAmount?.currencyCode || "USD",
                         add: {
                             actionField: { list: location.pathname },
                             products: [productForEvent]
                         }
                     }
                 };
                 window.ElevarDataLayer.push(addToCartEvent);
            }
            renderCart();
            openDrawer();
        }
    } catch (error) {
         showCartError(error.message.includes("Inventory") || error.message.includes("stock") ? `Could not add item: ${error.message}` : "Could not add item to cart. Please try again.");
         renderCart();
    }
}

// --- Event Listeners Setup (Drawer Specific) ---
function setupEventListeners() {
    const openCartTrigger = document.getElementById('open-cart-trigger');
    if (openCartTrigger) openCartTrigger.addEventListener('click', openDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeDrawer);

    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeDrawer);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const baseUrl = cart?.checkoutUrl;
            if (window.checkoutResetTimeout) clearTimeout(window.checkoutResetTimeout);

            if (cart && cart.totalQuantity > 0 && baseUrl && baseUrl !== '#') {
                checkoutBtn.disabled = true;
                checkoutBtn.classList.add('opacity-50');
                checkoutBtn.textContent = 'Redirecting...';

                try {
                    // Parse the base checkout URL from Shopify
                    const checkoutUrlObject = new URL(baseUrl);
                    const currentHostname = window.location.hostname;

                    // Determine the target Shopify domain based on the current frontend domain
                    if (currentHostname.endsWith('.trylumiclean.com')) {
                        checkoutUrlObject.hostname = 'trylumiclean.com'; // Or checkout.trylumiclean.com if applicable
                    
                    }
                    // else: Keep the original hostname from Shopify (handles localhost, staging, etc.)

                    // Reconstruct the base URL with the potentially updated hostname
                    const updatedBaseUrl = checkoutUrlObject.toString();

                    // Parameter logic (Keep existing logic for UTMs, etc., if needed)
                    const params = new URLSearchParams(); // Start fresh or use existing logic
                    // Example: If you still need UTMs from cart attributes or URL:
                    // const capturedAttributes = getUrlParameters(); // Assuming this is available/needed
                    // capturedAttributes.forEach(attr => { if (attr.value) params.append(attr.key, attr.value); });

                    const queryString = params.toString();
                    let finalUrl = updatedBaseUrl + (queryString ? (updatedBaseUrl.includes('?') ? '&' : '?') + queryString : '');

                    window.location.href = finalUrl;

                    window.checkoutResetTimeout = setTimeout(() => {
                        checkoutBtn.disabled = false;
                        checkoutBtn.classList.remove('opacity-50');
                        checkoutBtn.textContent = 'Proceed to Checkout';
                        window.checkoutResetTimeout = null;
                    }, 5000); // Reset button after 5s if redirect fails

                } catch (e) {
                    console.error("Error constructing checkout URL:", e);
                    showCartError("Could not determine checkout URL. Please try again.");
                    checkoutBtn.disabled = false;
                    checkoutBtn.classList.remove('opacity-50');
                    checkoutBtn.textContent = 'Proceed to Checkout';
                }

            } else {
                showCartError(cart?.totalQuantity === 0 ? "Your cart is empty." : "Could not proceed to checkout.");
            }
        });
    }

    document.querySelectorAll('.js-main-cta').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // MODIFIED: Get variantId directly from the clicked button
            const selectedVariantId = button.getAttribute('data-variant-id');
            
            if (!selectedVariantId) {
                console.error("Button clicked does not have a data-variant-id attribute!");
                showCartError("Could not determine the product to add. Please try again.");
                return;
            }

            // Check if the product is already in the cart (optional, depends on desired behavior)
            // const isProductInCart = cart?.lines?.nodes?.some(line => line.merchandise.id === selectedVariantId);
            // if (isProductInCart) {
            //    openDrawer(); // Or maybe show a message like "Item already in cart"
            // } else {
            //    handleAddItemClick(selectedVariantId);
            // }

            // Simplified: always attempt to add, let Shopify handle if it's a duplicate or inventory issue
            handleAddItemClick(selectedVariantId);
        });
    });

    // Delegation for quantity/remove buttons
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(event) {
            const minusBtn = event.target.closest('.quantity-minus-btn');
            if (minusBtn) {
                const lineEl = minusBtn.closest('.cart-item');
                const lineId = lineEl?.getAttribute('data-line-id');
                optimisticLineQuantityChange(lineEl, lineId, -1);
                return;
            }
            const plusBtn = event.target.closest('.quantity-plus-btn');
            if (plusBtn) {
                const lineEl = plusBtn.closest('.cart-item');
                const lineId = lineEl?.getAttribute('data-line-id');
                optimisticLineQuantityChange(lineEl, lineId, 1);
                return;
            }
            const removeBtn = event.target.closest('.remove-item-btn');
            if (removeBtn) {
                handleRemoveItem(removeBtn);
            }
        });
    }

    // Clear checkout timeout on page hide
    window.addEventListener('pagehide', () => {
        if (window.checkoutResetTimeout) clearTimeout(window.checkoutResetTimeout);
    });

    // --- Alia Event Listener (Reward Claimed - UI/Drawer Specific) ---
     document.addEventListener("alia:rewardClaimed", async (e) => {
         if (isLoading) return;
         const { rewardText, discountCode } = e.detail;
         if (!discountCode || !cart?.id) return;

         const expiryTimestamp = Date.now() + 30 * 60 * 1000;

         try {
             const updatedCart = await applyDiscountCode(cart.id, discountCode); // Use imported core function
             if (updatedCart) {
                 const isCodeApplied = updatedCart.discountCodes?.some(dc => dc.code === discountCode);
                 if (isCodeApplied) {
                     try {
                         localStorage.setItem(ALIA_CODE_STORAGE_KEY, discountCode);
                         localStorage.setItem(ALIA_TEXT_STORAGE_KEY, rewardText);
                         localStorage.setItem(ALIA_EXPIRY_STORAGE_KEY, expiryTimestamp.toString());
                     } catch (e) { /* */ }
                     cart = updatedCart; // Update local state
                     renderCart();
                     openDrawer(); // Show confirmation
                 } else {
                     throw new Error("Discount code was not applied successfully by Shopify.");
                 }
             } else {
                 throw new Error("Failed to update cart with discount code.");
             }
         } catch (error) {
             showCartError(`Could not apply discount: ${error.message}`);
             try {
                 localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                 localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                 localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
             } catch (e) { /* */ }
             renderAppliedDiscounts(); // Update UI based on cleared storage
         }
     });

    // Note: Alia signup/poll listeners are in cart-core.js
}

// --- Optimistic UI Updates (Drawer Specific) ---
function toggleLineButtons(itemEl, disabled) {
    if (!itemEl) return;
    itemEl.querySelectorAll('.quantity-btn').forEach(btn => btn.disabled = disabled);
}

async function optimisticLineQuantityChange(itemEl, lineId, delta) {
    if (!itemEl || !lineId) return;
    const qtyEl = itemEl.querySelector('[data-cart-item-quantity]');
    if (!qtyEl) return;
    const originalQty = parseInt(qtyEl.textContent) || 0;
    const newQty = originalQty + delta;

    if (newQty < 0) return;

    toggleLineButtons(itemEl, true); // Disable buttons optimistically

    if (newQty === 0) {
        itemEl.style.opacity = '0.5'; // Visually indicate removal
        try {
            await handleUpdateItemQuantity(lineId, 0); // This will call removeCartLineDrawer and re-render
        } catch (error) {
            itemEl.style.opacity = '1'; // Revert visual state
            toggleLineButtons(itemEl, false);
        }
        return;
    }

    qtyEl.textContent = newQty;
    const minusBtn = itemEl.querySelector('.quantity-minus-btn');
    if (minusBtn) minusBtn.disabled = newQty <= 0;

    try {
        await handleUpdateItemQuantity(lineId, newQty); // This calls updateCartLineDrawer and re-renders
    } catch (error) {
        qtyEl.textContent = originalQty; // Revert UI
        toggleLineButtons(itemEl, false);
        if (minusBtn) minusBtn.disabled = originalQty <= 0;
    }
}

// --- Focus Trap (Drawer Specific) ---
function handleFocusTrap(event) {
    if (event.key !== 'Tab' || !cartDrawer) return;
    const focusableElements = cartDrawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (event.shiftKey) {
        if (document.activeElement === firstElement) { lastElement.focus(); event.preventDefault(); }
    } else {
        if (document.activeElement === lastElement) { firstElement.focus(); event.preventDefault(); }
    }
}

// --- Initialize Drawer Module ---
async function initializeDrawer() {
    cart = await getCart(); // Get the cart object from core
    initializeLucideIcons(); // Initialize icons needed for drawer
    setupEventListeners(); // Setup drawer-specific listeners
    renderCart(); // Initial render in case cart has items from core init
    updateCartIconCount(); // Ensure icon count is updated
}

// Safely initialize Lucide icons (needed for drawer icons)
function initializeLucideIcons() {
    if (typeof window.lucide?.createIcons === 'function') {
        try {
            const config = {
                attrs: { 'stroke-width': '1.5', stroke: 'currentColor' }
            };
            if (window.lucide.icons && Object.keys(window.lucide.icons).length) {
                config.icons = window.lucide.icons;
            }
            window.lucide.createIcons(config);
        } catch (error) {
            // console.error('[Cart Drawer Error] Failed to initialize Lucide icons:', error);
        }
    } else {
        // console.warn('[Cart Drawer Debug] window.lucide.createIcons not found.');
    }
}

// Wait for the core module to be ready, then initialize the drawer UI
cartReady.then(initializeDrawer).catch(err => {
    console.error("Drawer initialization failed because cart core failed:", err);
    // Maybe display a permanent error in the drawer location?
}); 