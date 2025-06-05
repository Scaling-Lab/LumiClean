import {
    CREATE_CART_MUTATION,
    FETCH_CART_QUERY,
    ADD_TO_CART_MUTATION,
    REMOVE_FROM_CART_MUTATION,
    UPDATE_CART_LINE_MUTATION,
    UPDATE_DISCOUNT_CODE_MUTATION,
    CART_ATTRIBUTES_UPDATE_MUTATION,
    CART_BUYER_IDENTITY_UPDATE_MUTATION
} from './shopifyApi.js';

    // --- Cart Drawer Elements (Keep elements from previous answer) ---
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = cartDrawer.querySelector('.cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const initialDiscountAmountElement = document.getElementById('initial-discount-amount'); // Static discount display (will be removed/adjusted as API controls price)
    const cartLoadingOverlay = document.getElementById('cart-loading-overlay'); // Added loading overlay
    const cartErrorContainer = document.getElementById('cart-error'); // Added error container
    const cartErrorMessage = document.getElementById('cart-error-message'); // Added error message element

    // --- Alia Discount Elements ---
    const aliaDiscountSection = document.getElementById('alia-discount-section');
    const aliaRewardTextElement = document.getElementById('alia-reward-text');
    const aliaDiscountCodeElement = document.getElementById('alia-discount-code');
    const aliaTimerElement = document.getElementById('alia-timer');
    const aliaExpiredMessageElement = document.getElementById('alia-expired-message');

    // --- Cart State & Data ---
    let cart = null; // Will hold the entire cart object from Shopify
    let aliaTimerInterval = null;
    let isLoading = false; // Simple loading state flag
    let elevarCartInitialized = false; // Flag to track if cart.js initialized Elevar
    let previousActiveElement = null; // For focus trapping

    // --- Helper function to get selected variant ID ---
    function getSelectedVariantId() {
        // Find the checked radio button in the bundle selection
        const selectedBundle = document.querySelector('input[name="bundle"]:checked');

        if (selectedBundle) {
            // Get the data-variant-id attribute from the parent label
            const variantId = selectedBundle.closest('label').getAttribute('data-variant-id');
            if (variantId) {
                return variantId;
            }
        }

        // Fallback: Find the first bundle option label with a variant ID
        const firstBundleLabel = document.querySelector('label[data-variant-id]');
        if (firstBundleLabel) {
            const firstVariantId = firstBundleLabel.getAttribute('data-variant-id');
            if (firstVariantId) {
                return firstVariantId;
            }
        }

        // Absolute fallback if no labels with variant IDs are found
        console.error("Could not find any variant ID in bundle options.");
        return null;
    }

    // --- Local Storage Keys (Namespaced) ---
    const UVLIZER_PREFIX = 'trylumiclean_';
    const CART_ID_STORAGE_KEY = `${UVLIZER_PREFIX}cart_id`;
    const ALIA_CODE_STORAGE_KEY = `${UVLIZER_PREFIX}alia_discount_code`;
    const ALIA_TEXT_STORAGE_KEY = `${UVLIZER_PREFIX}alia_reward_text`;
    const ALIA_EXPIRY_STORAGE_KEY = `${UVLIZER_PREFIX}alia_expiry_timestamp`;

    function getUrlParameters() {
            const params = new URLSearchParams(window.location.search);
            const allowedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'gclid', 'fbclid'];
            const attributes = [];

            // Hardcoded list of potential PII parameters to exclude
            const piiParams = ['email', 'phone', 'firstname', 'lastname', 'address', 'zip', 'postcode', 'ssn', 'password'];

            params.forEach((value, key) => {
                const lowerKey = key.toLowerCase();
                // Only include allowed marketing params and exclude potential PII
                if (allowedParams.includes(lowerKey) && !piiParams.includes(lowerKey) && value) {
                     // Shopify has length limits for key (max 50) and value (max 250)
                     if (key.length <= 50 && value.length <= 250) {
                        attributes.push({ key: key, value: value });
                     } else {
                        // console.warn(`Skipping attribute due to length limit: Key='${key}' (Length ${key.length}), Value='${value.substring(0, 30)}...' (Length ${value.length})`);
                     }
                }
            });

            // console.log("Captured URL Parameters for Attributes:", attributes);
            return attributes;
        }

    // --- API Call Helper ---
    // --- API Call Helper (Updated for Netlify Function) ---
async function callShopifyAPI(query, variables = {}) {
    setLoading(true);

    // The path to your Netlify function
    const netlifyFunctionEndpoint = '/.netlify/functions/shopify-proxy';

    try {
        const response = await fetch(netlifyFunctionEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // NO Storefront Access Token header needed here!
            },
            // Send the query and variables TO the Netlify function
            body: JSON.stringify({ query, variables }),
        });

        // Check if the function call itself was successful
        if (!response.ok) {
            const errorBody = await response.text();
            // console.error(`Netlify Function error: ${response.status}`, errorBody);
            throw new Error(`Function call failed with status ${response.status}. ${errorBody}`);
        }

        const result = await response.json();

        // Now, check for GraphQL errors *returned by Shopify* via the function
        if (result.errors) {
            // console.error('GraphQL Errors (via Netlify Function):', result.errors);
            throw new Error(`GraphQL error: ${result.errors[0].message}`);
        }

             // Check if the top-level object has a `data` property, as expected from the storefront client response structure
             if (!result || typeof result.data === 'undefined') {
                 // console.error('Invalid response structure from Netlify function:', result);
                 // Attempt to extract details if the structure looks like the function's error response
                 const errorDetails = result && result.details ? JSON.stringify(result.details) : 'Unknown error structure';
                 throw new Error(`Invalid or unexpected response from API proxy: ${errorDetails}`);
             }

             // Handle GraphQL errors returned *within* the `errors` key of the client response
             if (result.errors) {
                 // console.error('GraphQL Errors (via Netlify Function):', result.errors);
                 // Try to get a meaningful message from the first GraphQL error
                 const firstErrorMsg = result.errors[0]?.message || 'Unknown GraphQL error';
                 throw new Error(`GraphQL error: ${firstErrorMsg}`);
        }

         // Check for userErrors passed through by the function
             // Assuming the function forwards the structure { data: { mutationName: { userErrors: [...] } } }
         const dataKeys = Object.keys(result.data || {});
         if (dataKeys.length > 0) {
             const mutationKey = dataKeys[0];
             const operationResult = result.data[mutationKey];
             if (operationResult && operationResult.userErrors && operationResult.userErrors.length > 0) {
                 // console.error('Shopify User Errors (via Netlify Function):', operationResult.userErrors);
                 throw new Error(`Shopify error: ${operationResult.userErrors[0].message}`);
             }
         }

        return result.data; // Return the 'data' part of the Shopify response

    } catch (error) {
            // Log the raw error for debugging
            // console.error('Raw error from Netlify function/fetch:', error);

            // Attempt to extract a more specific message
            let errorMessage = "An unknown error occurred during the API call.";
            if (error instanceof Error) {
                // Standard JS Error object
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                // Sometimes errors might be simple strings
                errorMessage = error;
            }

            // Log the extracted/default message
            // console.error('Processed error message:', errorMessage);

            // Throw a new error with the best message we could find
            // This ensures the calling function gets a standard Error object
            throw new Error(errorMessage);

    } finally {
        setLoading(false);
    }
}

    function setLoading(state) {
        isLoading = state;

        // Show/hide the loading spinner overlay
        if (cartLoadingOverlay) {
            if (state) {
                cartLoadingOverlay.classList.remove('hidden');
            } else {
                cartLoadingOverlay.classList.add('hidden');
            }
        }

        // Additional loading states
         document.body.style.cursor = state ? 'wait' : 'default';
         checkoutBtn.disabled = state || (cart && cart.totalQuantity === 0);
         checkoutBtn.classList.toggle('opacity-50', state || (cart && cart.totalQuantity === 0));

        // Disable remove and quantity buttons too
        cartItemsContainer.querySelectorAll('.remove-item-btn, .quantity-btn').forEach(btn => btn.disabled = state);
    }

    // New function for displaying errors in the cart
    function showCartError(message, autoHideDelay = 5000) {
        // Clear any existing timeouts
        if (window.cartErrorTimeout) {
            clearTimeout(window.cartErrorTimeout);
            window.cartErrorTimeout = null;
        }

        if (cartErrorMessage && cartErrorContainer) {
            // Update error message text
            cartErrorMessage.textContent = message;

            // Show the error container
            cartErrorContainer.classList.remove('hidden');

            // Use a separate timeout to let the DOM update before adding the visible class
            setTimeout(() => {
                cartErrorContainer.classList.add('visible');

                // Ensure the error icon is rendered
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons({
                        nodes: cartErrorContainer.querySelectorAll('[data-lucide]')
                    });
                }
            }, 10);

            // Auto-hide after delay if requested
            if (autoHideDelay > 0) {
                window.cartErrorTimeout = setTimeout(() => {
                    hideCartError();
                }, autoHideDelay);
            }
        } else {
            // Fallback to alert if DOM elements not found
            // console.warn("Cart error elements not found, falling back to alert");
            alert(message);
        }
    }

    function hideCartError() {
        if (cartErrorContainer) {
            cartErrorContainer.classList.remove('visible');

            // Wait for transition to complete before hiding fully
            setTimeout(() => {
                cartErrorContainer.classList.add('hidden');
            }, 300);
        }
    }

    // --- Elevar Helper Functions (NEW) ---

    // Helper to create product objects for Elevar events
    function createElevarProductObj(item, includeQuantity = true) {
      let priceRaw = item.merchandise?.price?.amount;
      let compareAtPriceRaw = item.merchandise?.compareAtPrice?.amount;
      let priceInCents = 19900; // Default
      let compareAtPriceInCents = 24900; // Default

      // Pre-process price to ensure it's in cents
      try {
          if (typeof priceRaw === 'number') {
              priceInCents = Number.isInteger(priceRaw) ? priceRaw : Math.round(priceRaw * 100);
          } else if (typeof priceRaw === 'string') {
              const numericPrice = parseFloat(priceRaw);
              if (!isNaN(numericPrice)) {
                  priceInCents = priceRaw.includes('.') ? Math.round(numericPrice * 100) : parseInt(priceRaw, 10);
              }
          }
      } catch(e) { } // Keep Elevar warnings

      // Pre-process compareAtPrice to ensure it's in cents
      try {
          if (typeof compareAtPriceRaw === 'number') {
              compareAtPriceInCents = Number.isInteger(compareAtPriceRaw) ? compareAtPriceRaw : Math.round(compareAtPriceRaw * 100);
          } else if (typeof compareAtPriceRaw === 'string') {
              const numericComparePrice = parseFloat(compareAtPriceRaw);
              if (!isNaN(numericComparePrice)) {
                  compareAtPriceInCents = compareAtPriceRaw.includes('.') ? Math.round(numericComparePrice * 100) : parseInt(compareAtPriceRaw, 10);
              } else {
                 compareAtPriceInCents = priceInCents; // Fallback compare to price if invalid
              }
          } else {
             compareAtPriceInCents = priceInCents; // Fallback compare to price if null/undefined
          }
      } catch(e) { 
          console.warn("[Elevar Helper] Error processing compareAtPrice:", compareAtPriceRaw, e); // Keep Elevar warnings
          compareAtPriceInCents = priceInCents; // Fallback compare to price on error
      }

      const product = {
        id: item.merchandise?.product?.handle || "",
        name: item.merchandise?.product?.title || "",
        brand: "TryLumiClean",
        category: "Home & Garden",
        variant: item.merchandise?.title || "", // User changed this
        price: (priceInCents / 100).toFixed(2), // Final division
        product_id: item.merchandise?.product?.id?.substring(item.merchandise.product.id.lastIndexOf('/') + 1) || "",
        variant_id: item.merchandise?.id?.substring(item.merchandise.id.lastIndexOf('/') + 1) || "",
        compare_at_price: (compareAtPriceInCents / 100).toFixed(2), // Final division
        image: item.merchandise?.image?.url || "",
        list: location.pathname // Added list property here
      };

      if (includeQuantity && typeof item.quantity !== 'undefined') {
        product.quantity = item.quantity.toString();
      } else if (includeQuantity) {
        product.quantity = "1";
      }

      return product;
    }

    // Helper to create impression objects for view_cart
    function createElevarImpressionObj(item, index) {
      let priceRaw = item.merchandise?.price?.amount;
      let compareAtPriceRaw = item.merchandise?.compareAtPrice?.amount;
      let priceInCents = 19900;
      let compareAtPriceInCents = 24900;

      // Pre-process price
      try {
          if (typeof priceRaw === 'number') {
              priceInCents = Number.isInteger(priceRaw) ? priceRaw : Math.round(priceRaw * 100);
          } else if (typeof priceRaw === 'string') {
              const numericPrice = parseFloat(priceRaw);
              if (!isNaN(numericPrice)) {
                  priceInCents = priceRaw.includes('.') ? Math.round(numericPrice * 100) : parseInt(priceRaw, 10);
              }
          }
      } catch(e) { } // Keep Elevar warnings

      // Pre-process compareAtPrice
      try {
           if (typeof compareAtPriceRaw === 'number') {
              compareAtPriceInCents = Number.isInteger(compareAtPriceRaw) ? compareAtPriceRaw : Math.round(compareAtPriceRaw * 100);
          } else if (typeof compareAtPriceRaw === 'string') {
              const numericComparePrice = parseFloat(compareAtPriceRaw);
              if (!isNaN(numericComparePrice)) {
                  compareAtPriceInCents = compareAtPriceRaw.includes('.') ? Math.round(numericComparePrice * 100) : parseInt(compareAtPriceRaw, 10);
              } else {
                 compareAtPriceInCents = priceInCents;
              }
          } else {
             compareAtPriceInCents = priceInCents;
          }
      } catch(e) { 
          console.warn("[Elevar Helper] Error processing impression compareAtPrice:", compareAtPriceRaw, e); // Keep Elevar warnings
          compareAtPriceInCents = priceInCents;
      }

      return {
        id: item.merchandise?.product?.handle || "",
        name: item.merchandise?.product?.title || "",
        brand: "TryLumiClean",
        category: "Home & Garden",
        variant: item.merchandise?.title || "",
        price: (priceInCents / 100).toFixed(2),
        quantity: item.quantity ? item.quantity.toString() : "1",
        product_id: item.merchandise?.product?.id?.substring(item.merchandise.product.id.lastIndexOf('/') + 1) || "",
        variant_id: item.merchandise?.id?.substring(item.merchandise.id.lastIndexOf('/') + 1) || "",
        compare_at_price: (compareAtPriceInCents / 100).toFixed(2),
        image: item.merchandise?.image?.url || "",
        position: index + 1 // Corrected: Send as number
      };
    }

    // --- Elevar Initialization and Event Triggering (NEW) ---

    // --- MIDA REDIRECT HELPER ---
    window.mfunc = window.mfunc || [];
    function onMidaReady(callback) {
      if (window.mida) {
        callback();
      } else {
        window.mfunc.push(callback);
      }
    }
    // --- End MIDA REDIRECT HELPER ---

    // Override initializeElevar to respect Mida redirects
    function initializeElevar() {
      if (elevarCartInitialized) {
        // console.log('[Elevar] Data Layer already initialized.');
        return;
      }

      onMidaReady(() => {
        if (window.mida && window.mida.isRedirect) {
          // console.log('[Elevar] Mida redirect detected, skipping Elevar initialization.');
          return;
        }

        // console.log('[Elevar] Initializing Elevar Data Layer via cart.js...');
        window.ElevarDataLayer = window.ElevarDataLayer || [];

        // Create product objects for cart contents (if any)
        const cartItems = cart?.lines?.nodes.map(item => createElevarProductObj(item, true)) || [];
        
        // Pre-process cart total amount
        let cartTotalRaw = cart?.cost?.totalAmount?.amount;
        let cartTotalInCents = 0;
        try {
            if (typeof cartTotalRaw === 'number') {
                cartTotalInCents = Number.isInteger(cartTotalRaw) ? cartTotalRaw : Math.round(cartTotalRaw * 100);
            } else if (typeof cartTotalRaw === 'string') {
                const numericTotal = parseFloat(cartTotalRaw);
                if (!isNaN(numericTotal)) {
                    cartTotalInCents = cartTotalRaw.includes('.') ? Math.round(numericTotal * 100) : parseInt(cartTotalRaw, 10);
                }
            }
        } catch(e) { } // Keep Elevar warnings

        // Send single dl_user_data event with accurate cart state
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
        // console.log('[Elevar] Pushed dl_user_data:', userDataEvent);
        elevarCartInitialized = true;

        // After initializing, trigger view_item
        triggerViewItemEvent();
      });
    }

    function triggerViewItemEvent() {
      // Only trigger if Elevar is initialized
      if (!window.ElevarDataLayer) {
          // console.warn('[Elevar] Cannot trigger dl_view_item, Elevar not initialized.');
          return;
      }

      // Attempt to get prices from the page, fallback to defaults
      const currentPriceEl = document.querySelector('[data-current-price]');
      const comparePriceEl = document.querySelector('[data-compare-price]');

      const currentPrice = currentPriceEl?.innerText.match(/\d+(\.\d+)?/)?.[0] || '199.00';
      const comparePriceValue = comparePriceEl?.innerText.match(/\d+(\.\d+)?/)?.[0] || '249.00';

      // Create product object (no quantity for view_item)
      // Using dynamic prices from the page, and Uvlizer details
      const product = {
          id: "uvo-powered-home-disinfection-tower-new", // Product Handle
          name: "UVO254™ -  Powered Home Disinfection Tower", // Product Name
          brand: "TryLumiClean",
          category: "Home & Garden",
          variant: "Default Title", // Assuming base product view, align with 1x variant
          price: currentPrice, // Dynamically read from page
          product_id: "8000627572985", // Shopify Product ID (numeric) - Leave blank if unavailable
          variant_id: "44103628357881", // Numeric part of the 1x Variant GID
          compare_at_price: comparePriceValue, // Dynamically read from page
          image: "https://www.uvlizer.us/cdn/shop/files/Uv1_d65306eb-669a-4b43-9fc9-ad8f3a15c0ba_900x.png?v=1713433283", // Leave blank as it's hard to determine contextually
          list: location.pathname // Added list property to the product object
      };

      // Send the view_item event
      const viewItemEvent = {
        event: "dl_view_item",
        user_properties: { visitor_type: "guest" },
        ecommerce: {
          currencyCode: "USD",
          detail: {
            actionField: {
              list: location.pathname,
              action: "detail"
            },
            products: [product]
          }
        }
      };
      window.ElevarDataLayer.push(viewItemEvent);
      // console.log('[Elevar] Pushed dl_view_item:', viewItemEvent);
    }

    // MODIFIED: Fetches cart if ID exists, otherwise creates a new one
    async function getOrCreateCart() {
        let cartId = null;
        try {
            cartId = localStorage.getItem(CART_ID_STORAGE_KEY);
        } catch (error) {
            console.warn("LocalStorage access error when getting cart ID:", error);
        }
        // console.log("getOrCreateCart: Stored cart ID:", cartId); // Log stored ID

        if (cartId) {
            try {
                // console.log("getOrCreateCart: Fetching existing cart:", cartId); // Log fetch attempt
                const data = await callShopifyAPI(FETCH_CART_QUERY, { cartId });
                if (data && data.cart) {
                    // console.log("getOrCreateCart: Successfully fetched existing cart:", data.cart.id); // Log success
                    cart = data.cart;
                    return cart;
                } else {
                    // Cart ID was invalid or cart was deleted/expired
                    // console.warn("getOrCreateCart: Fetch failed for stored cart ID, creating new cart."); // Log failure
                    cartId = null; // Force creation
                    try {
                        localStorage.removeItem(CART_ID_STORAGE_KEY);
                    } catch (error) {
                        console.warn("LocalStorage access error when removing cart ID:", error);
                    }
                }
            } catch (error) {
                // console.error("getOrCreateCart: Error fetching existing cart:", error); // Log error
                showCartError("Could not retrieve your existing cart. Please try again.");
                cartId = null; // Force creation on error
                try {
                    localStorage.removeItem(CART_ID_STORAGE_KEY);
                } catch (storageError) {
                    console.warn("LocalStorage access error when removing cart ID after fetch error:", storageError);
                }
            }
        }

        // If no valid cartId, create a new cart
        if (!cartId) {
            try {
                // Get URL parameters for cart attributes
                const utmAttributes = getUrlParameters(); // Existing function call
                
                // --- FIX: Limit the number of attributes ---
                const MAX_ATTRIBUTES = 30; // Set a reasonable limit
                let combinedAttributes = utmAttributes.slice(0, MAX_ATTRIBUTES); 
                if (utmAttributes.length > MAX_ATTRIBUTES) {
                     // Keep this warning as it indicates potential data loss
                     console.warn(`[Cart Init] Too many URL parameters (${utmAttributes.length}). Truncated to first ${MAX_ATTRIBUTES}.`);
                }
                // --- END FIX ---

                // console.log("getOrCreateCart: Creating new cart with attributes:", combinedAttributes); // Log creation and attributes

                const variables = {
                    cartInput: {
                        lines: [], // Start with empty lines
                        attributes: combinedAttributes // Pass the potentially truncated attributes
                    }
                };
                const data = await callShopifyAPI(CREATE_CART_MUTATION, variables);
                if (data && data.cartCreate && data.cartCreate.cart) {
                    cart = data.cartCreate.cart;
                    // console.log("getOrCreateCart: Successfully created new cart:", cart.id); // Log success
                    try {
                        localStorage.setItem(CART_ID_STORAGE_KEY, cart.id);
                    } catch (error) {
                        console.warn("LocalStorage access error when saving new cart ID:", error);
                    }
                    return cart;
                } else {
                    // console.error("getOrCreateCart: Failed to create new cart. Response data:", data); // Log failure data
                    // Check for specific user errors if possible
                     const userErrors = data?.cartCreate?.userErrors;
                     if (userErrors && userErrors.length > 0) {
                         showCartError(`Cart Error: ${userErrors[0].message}`);
                         throw new Error(`Shopify User Error: ${userErrors[0].message}`);
                     } else {
                        throw new Error("Cart creation failed unexpectedly. Check network logs.");
                     }
                }
            } catch (error) {
                // console.error("getOrCreateCart: Error creating new cart:", error); // Log creation error
                // Avoid showing generic error if a specific one was already shown
                if (!error.message.startsWith("Shopify User Error:")) {
                     showCartError("Could not create a shopping cart. Please refresh and try again.");
                }
                return null; // Indicate failure
            }
        }
         // Fallback in case logic above fails to return explicitly
         // console.warn("getOrCreateCart: Reached end of function unexpectedly. Returning current cart state:", cart);
         return cart;
    }

    // MODIFIED: addCartLine includes Elevar dl_add_to_cart push
    async function addCartLine(cartId, merchandiseId, quantity = 1) {
         if (!merchandiseId) {
             // console.error("Cannot add to cart: merchandiseId is missing.");
             return cart; // Return current cart state
         }
         // Store the cart state *before* adding the line for comparison
         const cartBeforeAdd = JSON.parse(JSON.stringify(cart));

         const data = await callShopifyAPI(ADD_TO_CART_MUTATION, {
             cartId,
             lines: [{ merchandiseId, quantity }],
         });

         const updatedCart = data?.cartLinesAdd?.cart;

         // --- Elevar dl_add_to_cart (NEW) ---
         if (updatedCart && window.ElevarDataLayer) {
             // Find the *specific* line that was added or had quantity increased.
             // This is crucial if the item was already in the cart.
             const addedLine = updatedCart.lines.nodes.find(newLine => {
                 const oldLine = cartBeforeAdd?.lines?.nodes.find(old => old.merchandise.id === newLine.merchandise.id);
                 return !oldLine || newLine.quantity > oldLine.quantity; // New item OR increased quantity
             });

             if (addedLine) {
                 const productForEvent = createElevarProductObj(addedLine, true);
                 // Adjust quantity for the event to reflect the amount *added* in this action
                 const oldLine = cartBeforeAdd?.lines?.nodes.find(old => old.merchandise.id === addedLine.merchandise.id);
                 const quantityAdded = oldLine ? addedLine.quantity - oldLine.quantity : addedLine.quantity;
                 productForEvent.quantity = quantityAdded.toString();
                 productForEvent.list = location.pathname; // Added list property here

                 const addToCartEvent = {
                     event: "dl_add_to_cart",
                     user_properties: { visitor_type: "guest" },
                     ecommerce: {
                         currencyCode: updatedCart.cost?.totalAmount?.currencyCode || "USD",
                         add: {
                             actionField: {
                                 list: location.pathname // Use current page as list
                             },
                             products: [productForEvent]
                         }
                     }
                 };
                 window.ElevarDataLayer.push(addToCartEvent);
                 // console.log('[Elevar] Pushed dl_add_to_cart:', addToCartEvent);
             } else {
                 // console.warn('[Elevar] Could not identify the added line item for dl_add_to_cart event.');
             }
         }
         // --- End Elevar dl_add_to_cart ---

         return updatedCart;
    }

    // MODIFIED: removeCartLine includes Elevar dl_remove_from_cart push
    async function removeCartLine(cartId, lineId) {
         // --- Elevar dl_remove_from_cart (NEW) ---
         let productToRemoveForEvent = null;
         if (cart && window.ElevarDataLayer) {
             const lineToRemove = cart.lines.nodes.find(line => line.id === lineId);
             if (lineToRemove) {
                 productToRemoveForEvent = createElevarProductObj(lineToRemove, true);
                 // Quantity in the event should be the quantity *being removed*
                 productToRemoveForEvent.quantity = lineToRemove.quantity.toString();
                 productToRemoveForEvent.list = location.pathname; // Added list property here
             } else {
                 // console.warn('[Elevar] Could not find line item to remove for dl_remove_from_cart event.');
             }
         }
         // --- End Elevar dl_remove_from_cart Prep ---

         const data = await callShopifyAPI(REMOVE_FROM_CART_MUTATION, {
             cartId,
             lineIds: [lineId],
         });
         const updatedCart = data?.cartLinesRemove?.cart;

         // --- Elevar dl_remove_from_cart (Push Event) ---
         if (productToRemoveForEvent && updatedCart) { // Ensure product was found and API call was successful
              const removeFromCartEvent = {
                 event: "dl_remove_from_cart",
                 user_properties: { visitor_type: "guest" },
                 ecommerce: {
                     currencyCode: updatedCart.cost?.totalAmount?.currencyCode || "USD",
                     remove: {
                         actionField: {
                             list: location.pathname // Use current page as list
                         },
                         products: [productToRemoveForEvent]
                     }
                 }
             };
             window.ElevarDataLayer.push(removeFromCartEvent);
             // console.log('[Elevar] Pushed dl_remove_from_cart:', removeFromCartEvent);
         }
         // --- End Elevar dl_remove_from_cart ---

         return updatedCart;
    }

    // --- UI Rendering ---

    function renderCartItems() {
        // console.log("[renderCartItems] Starting render...");
        const template = document.getElementById('cart-item-template');

        if (!cart || !cart.lines || !cart.lines.nodes || cart.lines.nodes.length === 0 || !template) {
            // console.warn("[renderCartItems] Cart is empty or template missing, displaying empty message.");
            // Handle empty cart display
            emptyCartMessage.classList.remove('hidden');
            // cartItemsContainer.innerHTML = ''; // Removed to prevent full re-render and image flicker
            // Add standard empty message with shopping link
            emptyCartMessage.innerHTML = 'Your cart is empty.<br><br>' +
                '<a href="#" id="continue-shopping-empty" class="inline-block bg-red-600 text-white text-base font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-red-700 transition duration-300 text-center">Continue Shopping</a>';
            const continueShoppingBtn = document.getElementById('continue-shopping-empty');
            if (continueShoppingBtn) {
                // Ensure listener is only added once
                const existingListener = continueShoppingBtn.getAttribute('data-listener-added');
                if (!existingListener) {
                    continueShoppingBtn.addEventListener('click', (e) => { e.preventDefault(); closeDrawer(); });
                    continueShoppingBtn.setAttribute('data-listener-added', 'true');
                }
            }
            return;
        }

        // Cart is not empty, hide empty message and render items
        emptyCartMessage.classList.add('hidden');
        // Note: We intentionally keep existing DOM elements so that images/logos are not re-rendered unnecessarily.
        // Do not force clear here.
        // cartItemsContainer.innerHTML = ''; // Removed to prevent full re-render and image flicker

        // Get current line IDs from cart data
        const currentLineIds = new Set(cart.lines.nodes.map(item => item.id));
        
        // Get line IDs currently in the DOM
        const existingDomElements = cartItemsContainer.querySelectorAll('.cart-item[data-line-id]');
        const existingDomIds = new Set(Array.from(existingDomElements).map(el => el.getAttribute('data-line-id')));

        // console.log("[renderCartItems] Current IDs:", [...currentLineIds]);
        // console.log("[renderCartItems] Existing DOM IDs:", [...existingDomIds]);

        // Remove items from DOM that are no longer in the cart
        existingDomElements.forEach(el => {
            const lineId = el.getAttribute('data-line-id');
            if (!currentLineIds.has(lineId)) {
                // console.log(`[renderCartItems] Removing DOM element for line ID: ${lineId}`);
                el.remove();
            }
        });

        // Update existing items and add new items
            cart.lines.nodes.forEach(item => {
            let itemElement = cartItemsContainer.querySelector(`.cart-item[data-line-id="${item.id}"]`);

            if (itemElement) {
                // Item exists in DOM, update its content (don't update image)
                // console.log(`[renderCartItems] Updating existing DOM element for line ID: ${item.id}`);
                updateCartItemContent(itemElement, item, false); // isNew = false
                // No per-item listeners needed; delegation handles interactions
            } else {
                // Item is new, clone template and add to DOM
                // console.log(`[renderCartItems] Creating new DOM element for line ID: ${item.id}`);
                const templateContent = template.content?.firstElementChild;
                itemElement = templateContent ? templateContent.cloneNode(true) : template.cloneNode(true);
                itemElement.classList.remove('hidden');
                itemElement.removeAttribute('id');
                itemElement.setAttribute('data-line-id', item.id);
                
                // Set all content, including image src
                updateCartItemContent(itemElement, item, true); // isNew = true
                
                // Delegation handles interactions; just ensure data attributes are set in updateCartItemContent
                
                cartItemsContainer.appendChild(itemElement);
                
                // Optimize Lucide: Call ONLY on the newly added element
                if (window.lucide && window.lucide.createIcons) {
                    try {
                        window.lucide.createIcons({ nodes: [itemElement] });
                    } catch (error) {
                        console.error("Error creating Lucide icons for new cart item:", error);
                    }
                }
            }
        });

        // Removed redundant Lucide call that processed the whole container
        // console.log("[renderCartItems] Render complete.");
    }

    // Helper function to update content of a single cart item element
    function updateCartItemContent(itemElement, item, isNew = false) {
                 const merchandise = item.merchandise;

        // Only set image src and name if it's a new element
        if (isNew) {
                 itemElement.querySelector('[data-cart-item-image]').src = merchandise.image?.url || 'https://placehold.co/64x64/e2e8f0/94a3b8?text=Item';
                 itemElement.querySelector('[data-cart-item-image]').alt = merchandise.image?.altText || merchandise.product.title;
            itemElement.querySelector('[data-cart-item-name]').textContent = merchandise.product.title;
        }

        // Always update quantity and total line price
        itemElement.querySelector('[data-cart-item-quantity]').textContent = item.quantity;
                 itemElement.querySelector('[data-cart-item-price]').textContent = `$${parseFloat(item.cost.totalAmount.amount).toFixed(2)}`;

        // Always update compareAtPrice visibility and value based on current quantity
        const originalPriceElem = itemElement.querySelector('[data-cart-item-original-price]');
        const compareAtPricePerItem = merchandise.compareAtPrice ? parseFloat(merchandise.compareAtPrice.amount) : null;
        const currentPricePerItem = parseFloat(merchandise.price.amount); // Price per single item

        if (originalPriceElem) { // Check if element exists
            if (compareAtPricePerItem && compareAtPricePerItem > currentPricePerItem) {
                // Calculate total compare-at price for the current quantity
                const totalCompareAtPrice = compareAtPricePerItem * item.quantity;
                originalPriceElem.textContent = `$${totalCompareAtPrice.toFixed(2)}`;
                originalPriceElem.classList.remove('hidden');
            } else {
                originalPriceElem.classList.add('hidden');
            }
        }

        // Update minus button state
        const minusBtn = itemElement.querySelector('.quantity-minus-btn');
        if (minusBtn) minusBtn.disabled = item.quantity <= 0;
    }

    // Helper function to attach event listeners (only needed for new items)
    function attachCartItemListeners(itemElement, item) {
        const lineId = item.id;
        const minusBtn = itemElement.querySelector('.quantity-minus-btn');
        const plusBtn = itemElement.querySelector('.quantity-plus-btn');
                 const removeBtn = itemElement.querySelector('.remove-item-btn');

        if (minusBtn) {
            minusBtn.setAttribute('data-line-id', lineId);
            const newMinusBtn = minusBtn.cloneNode(true);
            minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
            newMinusBtn.addEventListener('click', () => {
                const currentQty = parseInt(itemElement.querySelector('[data-cart-item-quantity]').textContent) || item.quantity;
                handleUpdateItemQuantity(lineId, currentQty - 1);
             });
            // Disable if quantity is 1
            newMinusBtn.disabled = item.quantity <= 1;
        }

        if (plusBtn) {
            plusBtn.setAttribute('data-line-id', lineId);
            const newPlusBtn = plusBtn.cloneNode(true);
            plusBtn.parentNode.replaceChild(newPlusBtn, plusBtn);
            newPlusBtn.addEventListener('click', () => {
                const currentQty = parseInt(itemElement.querySelector('[data-cart-item-quantity]').textContent) || item.quantity;
                handleUpdateItemQuantity(lineId, currentQty + 1);
            });
        }

        if (removeBtn) {
            removeBtn.setAttribute('data-line-id', lineId);
            const newRemoveBtn = removeBtn.cloneNode(true);
            removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
            newRemoveBtn.addEventListener('click', handleRemoveItem);
         }
    }

     async function handleRemoveItem(eventOrButton) {
         // Support being called either with a click Event or directly with the button element.
         const button = (eventOrButton instanceof Event) ? eventOrButton.currentTarget : eventOrButton;
          let lineId = button.getAttribute('data-line-id');
          if (!lineId) {
              const lineEl = button.closest('.cart-item');
              lineId = lineEl?.getAttribute('data-line-id');
          }
         if (!cart || !lineId) return;
          const itemEl = cartItemsContainer.querySelector(`[data-line-id="${lineId}"]`);
         try {
             const updatedCart = await removeCartLine(cart.id, lineId);
             if (updatedCart) {
                  cart = updatedCart;
                  if (itemEl) itemEl.remove();
                  renderCartSummary();
                  renderAppliedDiscounts();
                  updateCartIconCount();
             }
         } catch (error) {
              showCartError("Could not remove item. Please try again.");
         }
     }

     async function handleUpdateItemQuantity(lineId, newQuantity) {
        if (!cart || !lineId) return;
        const itemEl = cartItemsContainer.querySelector(`[data-line-id="${lineId}"]`);
        if (newQuantity < 0) {
            return; // Prevent negative quantities
        }

        try {
            let updatedCart;
            if (newQuantity === 0) {
                // Removing the line entirely
                updatedCart = await removeCartLine(cart.id, lineId);
            } else {
                const data = await callShopifyAPI(UPDATE_CART_LINE_MUTATION, {
                    cartId: cart.id,
                    lines: [{ id: lineId, quantity: newQuantity }],
                });
                updatedCart = data?.cartLinesUpdate?.cart;
            }

            if (updatedCart) {
                cart = updatedCart;
                renderCartItems(); // Re-render entire items list for consistency
                renderCartSummary();
                renderAppliedDiscounts();
                updateCartIconCount();
            }
        } catch (error) {
            showCartError("Could not update item quantity. Please try again.");
            throw error;
        }
    }

    // Helper: update the cart icon badge count and visibility
    function updateCartIconCount() {
        const cartCounter = document.getElementById('cart-item-count');
        const cartIcon = document.getElementById('open-cart-trigger');
        const total = cart?.totalQuantity || 0;
        if (cartCounter) cartCounter.textContent = total;
        if (cartIcon) {
            cartIcon.classList.remove('hidden'); // Ensure icon is always visible
            cartCounter.classList.toggle('hidden', total === 0); // Hide counter if 0
         }
     }

    function renderCartSummary() {
        const installmentInfoElement = document.getElementById('installment-info'); // Get the new element

        if (!cart || !cart.lines.nodes.length) {
            // Empty cart summary
            document.getElementById('cart-original-total').textContent = '$0.00';
            document.getElementById('total-savings-amount').textContent = '-$0.00';
            document.getElementById('cart-subtotal').textContent = '$0.00';
            checkoutBtn.setAttribute('data-checkout-url', '#'); // Reset checkout URL
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('opacity-50');
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

            // If compareAtPrice missing, fallback to regular
            const effectiveOriginal = compareAtPrice && compareAtPrice > regularPrice ? compareAtPrice : regularPrice;

            totalOriginalPrice += effectiveOriginal * quantity;
            totalRegularPrice += regularPrice * quantity;
        });

        const finalPrice = totalRegularPrice; // Use computed regular price total to avoid relying on stale cart.cost

        const totalSavings = totalOriginalPrice - finalPrice;

        // Update price displays
        document.getElementById('cart-original-total').textContent = `$${totalOriginalPrice.toFixed(2)}`;
        document.getElementById('total-savings-amount').textContent = `-$${totalSavings.toFixed(2)}`;
        document.getElementById('cart-subtotal').textContent = `$${finalPrice.toFixed(2)}`;

        // Checkout button state
        checkoutBtn.disabled = finalPrice === 0;
        checkoutBtn.classList.toggle('opacity-50', finalPrice === 0);

        // Update Checkout Button URL
        checkoutBtn.setAttribute('data-checkout-url', cart.checkoutUrl || '#');

        // Update Installment Info without reloading the logo image each time
        if (installmentInfoElement) {
            if (finalPrice > 0) {
                const installmentAmountStr = (finalPrice / 4).toFixed(2);

                // If markup already exists, just update the amount text
                const amountEl = installmentInfoElement.querySelector('b');
                if (amountEl) {
                    if (amountEl.textContent !== `$${installmentAmountStr}`) {
                        amountEl.textContent = `$${installmentAmountStr}`;
                    }
                } else {
                    // First-time creation: build markup once
                    const shopPayLogoUrl = "https://res.cloudinary.com/dg8ibuag5/image/upload/v1743723089/Shop_Pay_logo_purple_xqxhd1.svg";
                    installmentInfoElement.innerHTML = `
                        or 4 interest-free payments of <b>$${installmentAmountStr}</b> with
                        <img src="${shopPayLogoUrl}" alt="Shop Pay" class="inline-block h-4 ml-1 align-middle" loading="lazy">
                    `;
                }
            } else {
                // No price → clear element
                installmentInfoElement.innerHTML = '';
            }
        }
    }

    function renderAppliedDiscounts() {
        // Add debug logging to see what we're working with
        // console.log("[RenderCheck] Cart State:", cart);
        // console.log("[RenderCheck] Local Storage:", {
            // code: localStorage.getItem(ALIA_CODE_STORAGE_KEY),
            // text: localStorage.getItem(ALIA_TEXT_STORAGE_KEY),
            // expiry: localStorage.getItem(ALIA_EXPIRY_STORAGE_KEY),
        // });
        if (cart?.discountCodes) {
            // console.log("[RenderCheck] Shopify Discount Codes:", cart.discountCodes);
        }

        let aliaCode = null;
        let storedExpiry = 0;
        let aliaText = '';
        
        try {
            aliaCode = localStorage.getItem(ALIA_CODE_STORAGE_KEY);
            const expiryStr = localStorage.getItem(ALIA_EXPIRY_STORAGE_KEY);
            storedExpiry = expiryStr ? parseInt(expiryStr) : 0;
            aliaText = localStorage.getItem(ALIA_TEXT_STORAGE_KEY) || '';
        } catch (error) {
            console.warn("LocalStorage access error when getting Alia discount data:", error);
        }

        // --- Refined Checks ---
        const isLocalStorageValid = aliaCode && storedExpiry && storedExpiry > Date.now();
        const isCodeInShopifyCart = cart?.discountCodes?.some(dc => dc.code === aliaCode);

        // console.log("[RenderCheck] Validation:", { isLocalStorageValid, isCodeInShopifyCart });

        if (isLocalStorageValid && isCodeInShopifyCart) {
            // Only show if BOTH localStorage is valid AND the code is actually in the current Shopify cart
            // console.log("[RenderCheck] Showing Alia discount section");
            aliaRewardTextElement.textContent = aliaText || 'Discount Applied';
             aliaDiscountCodeElement.textContent = aliaCode;
             aliaDiscountSection.classList.remove('hidden');
            startAliaTimer(Math.floor((storedExpiry - Date.now()) / 1000));
         } else {
            // console.log("[RenderCheck] Hiding Alia discount section. Conditions:", {
                // hasAliaCode: Boolean(aliaCode),
                // isValidExpiry: Boolean(storedExpiry && storedExpiry > Date.now()),
                // isAppliedInShopify: isCodeInShopifyCart,
             // });
            aliaDiscountSection.classList.add('hidden');
            if (aliaExpiredMessageElement) aliaExpiredMessageElement.classList.add('hidden');
            clearInterval(aliaTimerInterval);
            // Clear storage if the reason for hiding is an expired timer in localStorage
            if (aliaCode && storedExpiry && storedExpiry <= Date.now()) {
                // console.log("[RenderCheck] Clearing expired Alia data from localStorage.");
                try {
                    localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                    localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                    localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
                } catch (error) {
                    console.warn("LocalStorage access error when removing expired Alia data:", error);
                }
                // No window variables used
            }
         }
    }


    function startAliaTimer(durationSeconds) {
         clearInterval(aliaTimerInterval);
         if (durationSeconds <= 0) { // Already expired when called
             aliaTimerElement.textContent = "Expired";
             aliaDiscountSection.classList.add('opacity-50');
             // console.log("[AliaTimer] Timer called with duration <= 0, marking as expired immediately.");
             // Clear storage as it's already expired
             try {
                 localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                 localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                 localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
             } catch (error) {
                 console.warn("LocalStorage access error when removing expired Alia data in timer:", error);
             }
             // Fetch cart to sync state
             fetchCart(cart?.id).then(refreshedCart => {
                 if (refreshedCart) {
                     cart = refreshedCart; // Update global cart state
                     renderCart(); // Re-render with accurate prices/discount state
                 } else {
                     initializeCart(); // Re-initialize if cart became invalid
                 }
             }).catch(error => {
                 // console.error("Error fetching cart after immediate timer expiry:", error);
                 renderCart(); // Still re-render UI
             });
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
                 // console.log("[AliaTimer] Interval timer expired.");
                 clearInterval(aliaTimerInterval);
                 aliaTimerElement.textContent = "Expired";
                 aliaDiscountSection.classList.add('opacity-50');

                 // Clear Alia keys from localStorage now that UI timer has expired
                 // console.log("[AliaTimer] Clearing Alia data from localStorage due to UI timer expiry.");
                 try {
                     localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                     localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                     localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
                 } catch (error) {
                     console.warn("LocalStorage access error when removing expired Alia data after timer expiry:", error);
                 }

                 // Explicitly remove discount code from Shopify cart
                 if (cart?.id) {
                     // console.log("[AliaTimer] Attempting to remove expired discount code from Shopify cart.");
                     // Call applyDiscountCode with empty array to remove codes
                     applyDiscountCode(cart.id) // Call with no code to remove discounts
                         .then(updatedCart => {
                             if (updatedCart) {
                                 cart = updatedCart; // Update global cart state
                                 // console.log("[AliaTimer] Discount removed from Shopify cart, updated cart rendered, showing expired message.");
                                 renderCart(); // Re-render with accurate (non-discounted) prices
                                 if (aliaExpiredMessageElement) aliaExpiredMessageElement.classList.remove('hidden');
                             } else {
                                 // Handle case where cart became invalid or API didn't return cart
                                 // console.warn("[AliaTimer] Cart update/discount removal might have failed or cart became invalid. Re-initializing.");
                                 initializeCart();
                             }
                         })
                         .catch(error => {
                             // console.error("[AliaTimer] Error removing discount code from Shopify cart:", error);
                             // Still render cart to hide the Alia section based on cleared local storage
                             renderCart();
                             if (aliaExpiredMessageElement) aliaExpiredMessageElement.classList.remove('hidden');
                         });
                 } else {
                     // console.warn("[AliaTimer] No cart ID found to remove discount from Shopify after expiry.");
                     renderCart(); // Still re-render UI to hide Alia section
                     if (aliaExpiredMessageElement) aliaExpiredMessageElement.classList.remove('hidden');
                 }
             }
         }, 1000);
     }

    function renderCart() {
        // console.log("Rendering cart with state:", cart);
        renderCartItems();
        renderCartSummary();
        renderAppliedDiscounts();

        // Update cart icon counter and visibility
        const cartIcon = document.getElementById('open-cart-trigger');
        const cartCounter = document.getElementById('cart-item-count');
        const totalQuantity = cart?.totalQuantity || 0;

        if (cartIcon && cartCounter) {
            cartCounter.textContent = totalQuantity;
            cartIcon.classList.remove('hidden'); // Ensure icon is always visible
            cartCounter.classList.toggle('hidden', totalQuantity === 0); // Hide counter if 0
        }

        setLoading(false); // Ensure loading state is reset after render
    }

    // MODIFIED: openDrawer includes Elevar dl_view_cart push
    function openDrawer() {
        if (!cartDrawer || !cartOverlay) return;
        // console.log("Opening drawer...");

        // --- Focus Trap: Save current active element ---
        previousActiveElement = document.activeElement;

        cartOverlay.classList.remove('hidden', 'pointer-events-none');
        cartOverlay.classList.add('pointer-events-auto');
        setTimeout(() => cartOverlay.classList.add('opacity-100'), 10); // Fade in
        cartDrawer.classList.remove('translate-x-full');
        cartDrawer.classList.add('translate-x-0');
        // Assuming #cart-drawer has aria-modal="true" and aria-labelledby="cart-drawer-title" in HTML
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('cart-drawer-open');

        // --- Focus Trap: Focus first focusable element --- 
        // Small delay to allow drawer transition
        setTimeout(() => {
            const focusableElements = cartDrawer.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
            // Add keydown listener for trapping focus
            cartDrawer.addEventListener('keydown', handleFocusTrap);
        }, 10);

        if(cart) {
            renderCart();

             // --- Elevar dl_view_cart (NEW) ---
             if (window.ElevarDataLayer && cart.lines && cart.lines.nodes.length > 0) {
                 // console.log('[Elevar] Cart has items, triggering dl_view_cart...');
                 const impressions = cart.lines.nodes.map((item, index) => createElevarImpressionObj(item, index));
                 
                 // Pre-process cart total amount
                 let cartTotalRaw = cart?.cost?.totalAmount?.amount;
                 let cartTotalInCents = 0;
                 try {
                     if (typeof cartTotalRaw === 'number') {
                         cartTotalInCents = Number.isInteger(cartTotalRaw) ? cartTotalRaw : Math.round(cartTotalRaw * 100);
                     } else if (typeof cartTotalRaw === 'string') {
                         const numericTotal = parseFloat(cartTotalRaw);
                         if (!isNaN(numericTotal)) {
                             cartTotalInCents = cartTotalRaw.includes('.') ? Math.round(numericTotal * 100) : parseInt(cartTotalRaw, 10);
                         }
                     }
                 } catch(e) { console.warn("[Elevar ViewCart] Error processing cart total:", cartTotalRaw, e); } // Keep Elevar warning

                 const viewCartEvent = {
                     event: "dl_view_cart",
                     user_properties: { visitor_type: "guest" },
                     cart_total: (cartTotalInCents / 100).toFixed(2), // Use pre-processed value
                     ecommerce: {
                         currencyCode: cart.cost?.totalAmount?.currencyCode || "USD",
                         actionField: {
                             list: location.pathname // Use current page path for consistency
                         },
                         impressions: impressions
                     }
                 };
                 window.ElevarDataLayer.push(viewCartEvent);
                 // console.log('[Elevar] Pushed dl_view_cart:', viewCartEvent);
             } else {
                 // console.log('[Elevar] Cart empty or Elevar not ready, skipping dl_view_cart.');
             }
            // --- End Elevar dl_view_cart ---
        } else {
             // console.warn('Attempted to open drawer but cart data is missing.');
        }
    }

    function closeDrawer() {
        if (!cartDrawer || !cartOverlay) return;
        // console.log("Closing drawer...");
        cartOverlay.classList.remove('opacity-100'); // Start fade out
        cartOverlay.classList.remove('pointer-events-auto');
        cartOverlay.classList.add('pointer-events-none');

        setTimeout(() => cartOverlay.classList.add('hidden'), 300); // Hide after transition
        cartDrawer.classList.remove('translate-x-0'); // Remove the class that shows it
        cartDrawer.classList.add('translate-x-full');   // Add the class that hides it
        document.documentElement.classList.remove('cart-drawer-open'); // Remove class from HTML
        cartDrawer.setAttribute('aria-hidden', 'true');

        // --- Focus Trap: Remove listener and restore focus --- 
        cartDrawer.removeEventListener('keydown', handleFocusTrap);
        if (previousActiveElement) {
            previousActiveElement.focus();
            previousActiveElement = null;
        }

        // Hide any error message when drawer is closed
        hideCartError();
    }
    // --- Initialize Cart ---
    // MODIFIED: Initializes cart first, then Elevar
    async function initializeCart() {
        // console.log("[Cart Init] Initializing cart...");
        try {
            const loadedCart = await getOrCreateCart(); // Fetch or create the cart first

            if (!loadedCart) {
                 // console.error("[Cart Init] Failed to load or create cart after getOrCreateCart call.");
                 setLoading(false);
                 return;
            }

            // cart variable is now updated globally
            // console.log("[Cart Debug] Cart initialized/loaded. Now initializing Elevar...");
            initializeElevar(); // Initialize Elevar AFTER cart is loaded

            // Fetch and update real product data
            // console.log("[Cart Debug] Updating bundle prices from API...");
            await updateBundlePrices();
            // console.log("[Cart Debug] Bundle prices updated.");

        } catch (error) {
            // console.error("[Cart Init] Unexpected error during cart initialization sequence:", error);
            showCartError("An unexpected error occurred while initializing the cart.");
        } finally {
             // console.log("[Cart Init] Rendering cart after initialization attempt.");
             renderCart();
             setLoading(false);
        }
    }

     // --- Event Handlers ---

     async function handleAddItemClick(variantId) {
         if (!variantId) return;

         let targetCartId = cart?.id;

         // Ensure we have a cart ID
         if (!targetCartId) {
            // console.log("No cart ID, initializing cart first...");
            await initializeCart(); // Ensure cart is created/fetched
            targetCartId = cart?.id;
             if (!targetCartId) {
                 alert("Could not initialize cart. Please try again.");
                 return;
             }
         }

         try {
             // console.log(`Adding item ${variantId} to cart ${targetCartId}`);
             const updatedCart = await addCartLine(targetCartId, variantId, 1);
             if (updatedCart) {
                 // 1. Find the added line item in the updated cart
                 // Use the variantId passed into the function to find the specific line added
                 const addedLine = updatedCart.lines.nodes.find(line => line.merchandise.id === variantId);

                 if (addedLine) {
                     const merchandise = addedLine.merchandise;
                     const quantityAdded = 1; // Assuming add button always adds 1
                     const itemPrice = parseFloat(merchandise.price.amount);
                     const itemName = merchandise.product.title;
                     const itemId = merchandise.id; // Variant ID

                     // 2. Prepare GA4 Ecommerce Data
                     // REMOVED block for GA4 dataLayer push
                     // const ga4Item = { ... };
                     // window.dataLayer = window.dataLayer || [];
                     // window.dataLayer.push({ ... });
                     // console.log('GA4 dataLayer push for add_to_cart:', ...);


                     // 4. Prepare Klaviyo Data (Structure based on Klaviyo's Added to Cart spec)
                     const klaviyoCartItems = updatedCart.lines.nodes.map(line => {
                         const merch = line.merchandise;
                         return {
                             ProductID: merch.id, // Variant ID
                             Name: merch.product.title, // Product Title
                             Quantity: line.quantity,
                             ItemPrice: parseFloat(merch.price.amount),
                             RowTotal: parseFloat(line.cost.totalAmount.amount),
                             ImageURL: merch.image?.url,
                             URL: window.location.origin + window.location.pathname, // Product URL (use current page URL as placeholder)
                             Categories: [], // Add categories if available
                             Brand: 'TryLumiClean', // Brand name
                             VariantName: merch.title // Variant Title
                         };
                     });

                     const klaviyoCartData = {
                         total_price: parseFloat(updatedCart.cost.totalAmount.amount),
                         $value: parseFloat(updatedCart.cost.totalAmount.amount),
                         original_total_price: parseFloat(updatedCart.cost.subtotalAmount.amount), // Subtotal before discounts/taxes
                         items: klaviyoCartItems,
                         // Optionally add other cart-level info if needed by Klaviyo
                     };

                     // 5. Push Klaviyo 'Added to Cart' event
                     // Ensure _learnq is initialized (Klaviyo base script should do this)
                     var _learnq = window._learnq || [];
                     _learnq.push(['track', 'Added to Cart', klaviyoCartData]);
                     // console.log('Klaviyo _learnq push for Added to Cart:', klaviyoCartData);

                 } else {
                     // console.warn("Could not find the added line item in the updated cart to send tracking events.");
                 }

                 cart = updatedCart; // Update global state
                 renderCart();
                 openDrawer(); // Open cart after adding
             }
         } catch (error) {
             // Handle specific errors, e.g., out of stock
             if (error.message.includes("Inventory") || error.message.includes("stock")) {
                 // Use the specific error message from Shopify if available
                 showCartError(`Could not add item: ${error.message}`);
             } else {
                  showCartError("Could not add item to cart. Please try again.");
             }
             renderCart(); // Re-render to reset loading state
         }
     }

     // --- Event Listeners Setup ---
     function setupEventListeners() {
        // console.log('[Cart Debug] setupEventListeners START'); // <-- ADDED LOG

         // Open Cart Trigger
         const openCartTrigger = document.getElementById('open-cart-trigger');
         if (openCartTrigger) {
             openCartTrigger.addEventListener('click', openDrawer);
         } else {
             // console.warn("Element with ID 'open-cart-trigger' not found.");
         }

         // Close Drawer
         closeCartBtn.addEventListener('click', closeDrawer);
         cartOverlay.addEventListener('click', closeDrawer);

         // Continue Shopping Button
         const continueShoppingBtn = document.getElementById('continue-shopping-btn');
         if (continueShoppingBtn) {
             continueShoppingBtn.addEventListener('click', closeDrawer);
         }

         // Checkout Button
         checkoutBtn.addEventListener('click', () => {
             const baseUrl = cart?.checkoutUrl; // Get base URL from cart state
             // console.log('[Cart Debug] Checkout button clicked. URL:', baseUrl, 'Cart Quantity:', cart?.totalQuantity); // <-- ADDED LOG
             
             // Clear any existing reset timeout
             if (window.checkoutResetTimeout) {
                 clearTimeout(window.checkoutResetTimeout);
                 window.checkoutResetTimeout = null;
             }
             
             if (cart && cart.totalQuantity > 0 && baseUrl && baseUrl !== '#') {
                 // Disable button immediately
                 checkoutBtn.disabled = true;
                 checkoutBtn.classList.add('opacity-50');
                 checkoutBtn.textContent = 'Redirecting...';

                 // 1. Get the parameters captured on initial page load
                 const capturedAttributes = getUrlParameters(); // Use the helper function

                 // 2. Convert attributes back into a query string
                 const params = new URLSearchParams();
                 capturedAttributes.forEach(attr => {
                     // Ensure we don't append empty values if somehow captured
                     if (attr.value) {
                          params.append(attr.key, attr.value);
                     }
                 });
                 const queryString = params.toString();

                 // 3. Construct the final URL
                 let finalUrl = baseUrl;
                 if (queryString) {
                     // Check if the base URL already has query parameters
                     if (baseUrl.includes('?')) {
                         finalUrl += '&' + queryString;
                     } else {
                         finalUrl += '?' + queryString;
                     }
                 }

                 console.log("Redirecting to checkout with params:", finalUrl); // Log the final URL

                 // 4. Redirect the user
                 window.location.href = finalUrl;
                 
                 // 5. Set a timeout to reset the button if navigation fails
                 window.checkoutResetTimeout = setTimeout(() => {
                     // console.warn("Checkout navigation likely failed, resetting button.");
                     checkoutBtn.disabled = false;
                     checkoutBtn.classList.remove('opacity-50');
                     checkoutBtn.textContent = 'Proceed to Checkout';
                     window.checkoutResetTimeout = null; // Clear the timeout ID
                 }, 5000); // Reset after 5 seconds if still on the page

             } else if (cart && cart.totalQuantity === 0) {
                 // Check if a discount is applied
                 const hasDiscount = cart?.discountCodes && cart.discountCodes.length > 0;

                 if (hasDiscount) {
                     // Show a more helpful message if there's a discount but cart is empty
                     showCartError("Please add products to your cart to use your discount.");
                 } else {
                     // Standard empty cart message
                     showCartError("Your cart is empty.");
                 }

                 // Keep the button disabled when cart is empty
                 checkoutBtn.disabled = true;
                 checkoutBtn.classList.add('opacity-50');
                 checkoutBtn.textContent = 'Proceed to Checkout';
             } else {
                 console.error("Checkout URL not available or cart invalid.");
                 showCartError("Could not proceed to checkout. Please try again later.");
                  // Re-enable button on error
                  checkoutBtn.disabled = false;
                  checkoutBtn.classList.remove('opacity-50');
                  checkoutBtn.textContent = 'Proceed to Checkout';
             }
         });

         // NEW Listener for Main CTAs (including 'ADD TO CART' buttons)
         document.querySelectorAll('.js-main-cta').forEach(button => {
             button.addEventListener('click', (e) => {
                 e.preventDefault(); // Prevent default link behavior

                 // Get the selected variant ID
                 const selectedVariantId = getSelectedVariantId();

                 // Check if the selected product is already in the cart
                 const isProductInCart = cart?.lines?.nodes?.some(
                     line => line.merchandise.id === selectedVariantId
                 );

                 if (isProductInCart) {
                     console.log("Product already in cart, opening drawer.");
                     openDrawer();
                 } else {
                     console.log(`Product not in cart, adding variant ${selectedVariantId}...`);
                     handleAddItemClick(selectedVariantId);
                     // handleAddItemClick already opens the drawer on success
                 }
             });
         });

         // Also add listeners to the bundle selection radios to make sure the peer-checked styling works
         document.querySelectorAll('input[name="bundle"]').forEach(radio => {
             radio.addEventListener('change', () => {
                 // When a radio is selected, add styling to its parent label
                 const labels = document.querySelectorAll('label[data-variant-id]');
                 labels.forEach(label => {
                     label.classList.remove('border-[#1f7bcc]');
                     if (label.querySelector('input[name="bundle"]:checked')) {
                         label.classList.add('border-[#1f7bcc]');
                     }
                 });
                 console.log(`Bundle selection changed to: ${getSelectedVariantId()}`);
             });
         });

         // Container-level delegation for quantity and remove buttons
         cartItemsContainer.addEventListener('click', function(event) {
             const minusBtn = event.target.closest('.quantity-minus-btn');
             if (minusBtn) {
                 const lineEl = minusBtn.closest('.cart-item');
                 const lineId = lineEl?.getAttribute('data-line-id');
                 optimisticLineQuantityChange(lineEl, lineId, -1); // Call optimistic handler
                 return;
             }
             const plusBtn = event.target.closest('.quantity-plus-btn');
             if (plusBtn) {
                 const lineEl = plusBtn.closest('.cart-item');
                 const lineId = lineEl?.getAttribute('data-line-id');
                 optimisticLineQuantityChange(lineEl, lineId, 1); // Call optimistic handler
                 return;
             }
             const removeBtn = event.target.closest('.remove-item-btn');
             if (removeBtn) {
                 // Pass the actual remove button element so handleRemoveItem can extract the line ID
                 handleRemoveItem(removeBtn);
             }
         });

         // Clear checkout timeout if user navigates away before redirect happens
         window.addEventListener('pagehide', () => {
             if (window.checkoutResetTimeout) {
                 clearTimeout(window.checkoutResetTimeout);
                 window.checkoutResetTimeout = null;
                 // console.log("Page hidden, clearing checkout reset timeout.");
             }
         });

         // Alia Event Listener - Reward Claimed
         document.addEventListener("alia:rewardClaimed", async (e) => {
             if (isLoading) return;

             // console.log("Alia reward claimed:", e.detail);
             const { rewardText, discountCode } = e.detail;

             if (!discountCode) {
                 // console.warn("Alia event triggered without a discount code.");
                 return;
             }

             // Set expiry timestamp (30 minutes from now)
             const expiryTimestamp = Date.now() + 30 * 60 * 1000;

             // If cart doesn't exist yet, initialize it
             if (!cart) {
                 // console.log("Cart not initialized yet, creating new cart...");
                 try {
                     await initializeCart(); // Ensure cart is created/fetched AND rendered
                     if (!cart) throw new Error("Failed to create cart after Alia event.");
                 } catch (error) {
                     // console.error("Failed to create cart:", error);
                     showCartError("Could not initialize cart to apply discount.");
                     return;
                 }
             }

             try {
                 // console.log(`Attempting to apply Alia discount code: ${discountCode} to cart ${cart.id}`);
                 const updatedCart = await applyDiscountCode(cart.id, discountCode);

                 if (updatedCart) {
                     const isCodeApplied = updatedCart.discountCodes?.some(dc => dc.code === discountCode);

                     if (isCodeApplied) {
                         // console.log(`Discount code ${discountCode} successfully applied.`);
                         // SUCCESS: Persist the details and update UI
                         try {
                             localStorage.setItem(ALIA_CODE_STORAGE_KEY, discountCode);
                             localStorage.setItem(ALIA_TEXT_STORAGE_KEY, rewardText);
                             localStorage.setItem(ALIA_EXPIRY_STORAGE_KEY, expiryTimestamp.toString());
                         } catch (error) {
                             console.warn("LocalStorage access error when saving Alia discount data:", error);
                         }

                         cart = updatedCart;
                         renderCart();

                         // Always open drawer to show discount confirmation, even if cart is empty
                         // console.log("Opening drawer to show applied discount. Cart is empty: ", cart.totalQuantity === 0);
                         openDrawer();
                     } else {
                         // console.error(`Discount code '${discountCode}' was NOT found in updated cart discountCodes.`, updatedCart.discountCodes);
                         throw new Error("Discount code was not applied successfully by Shopify.");
                     }
                 } else {
                     throw new Error("Failed to update cart with discount code.");
                 }

             } catch (error) {
                 // console.error("Error applying Alia discount code:", error);
                 showCartError(`Could not apply discount: ${error.message}`);

                 // Clear potentially stale storage if application failed
                 // console.log("Clearing Alia data from localStorage due to application error.");
                 try {
                     localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                     localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                     localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
                 } catch (storageError) {
                     console.warn("LocalStorage access error when removing Alia data after application error:", storageError);
                 }

                 renderAppliedDiscounts();
             }
         });

         // Alia Event Listener - Signup
         document.addEventListener("alia:signup", async (e) => {
             if (isLoading) return;
             // console.log("Alia signup event received:", e.detail);
             const { email, phone } = e.detail;

             if (!email && !phone) {
                 // console.warn("Alia signup event received without email or phone.");
                 return;
             }

             // Ensure cart exists
             if (!cart) {
                 // console.log("Signup event: Cart not initialized, creating...");
                 try {
                     cart = await getOrCreateCart();
                     if (!cart) throw new Error("Failed to create cart for signup event.");
                 } catch (error) {
                     // console.error("Failed to create cart for signup event:", error);
                     showCartError("Could not initialize cart to save contact info."); // Using our new error display
                     return;
                 }
             }

             const buyerIdentity = {};
             if (email) buyerIdentity.email = email;
             if (phone) buyerIdentity.phone = phone; // Assuming Shopify accepts phone in buyerIdentity

             try {
                 // console.log(`Updating buyer identity for cart ${cart.id}:`, buyerIdentity);
                 const data = await callShopifyAPI(CART_BUYER_IDENTITY_UPDATE_MUTATION, {
                     cartId: cart.id,
                     buyerIdentity: buyerIdentity
                 });

                 if (data?.cartBuyerIdentityUpdate?.cart) {
                     // console.log("Buyer identity updated successfully.");
                     cart = data.cartBuyerIdentityUpdate.cart; // Update global cart state
                     // Optionally re-render if needed, though buyer identity isn't usually visible in cart
                     // renderCart();
                 } else {
                     // console.error("Failed to update buyer identity. Response:", data);
                     throw new Error(data?.cartBuyerIdentityUpdate?.userErrors?.[0]?.message || "Unknown error updating buyer identity.");
                 }
             } catch (error) {
                 // console.error("Error updating buyer identity:", error);
                 showCartError(`Could not save contact information: ${error.message}`); // Using our new error display
             }
         });

         // Alia Event Listener - Poll Answered
         document.addEventListener("alia:pollAnswered", async (e) => {
             if (isLoading) return;
             // console.log("Alia poll answered event received:", e.detail);
             const { answers } = e.detail;

             if (!answers || answers.length === 0) {
                 // console.warn("Alia poll answered event received without answers.");
                 return;
             }

             // Ensure cart exists
             if (!cart) {
                 // console.log("Poll event: Cart not initialized, creating...");
                 try {
                     cart = await getOrCreateCart();
                     if (!cart) throw new Error("Failed to create cart for poll event.");
                 } catch (error) {
                     // console.error("Failed to create cart for poll event:", error);
                     showCartError("Could not initialize cart to save poll answers."); // Using our new error display
                     return;
                 }
             }

             // Format answers into Shopify attributes
             // Prefix keys to avoid conflicts with UTM attributes
             const newPollAttributes = answers.map(answer => ({
                 key: `poll_${answer.questionID || 'question'}`, // Use questionID or a generic prefix
                 value: `${answer.questionText}: ${answer.answerText}` // Combine question and answer text
             }));

             // Simple check for attribute length limits
             const validNewPollAttributes = newPollAttributes.filter(attr => {
                 if (attr.key.length > 100 || attr.value.length > 255) { // Shopify limits: key 100, value 255
                     // console.warn(`Skipping poll attribute due to length limit: Key=${attr.key.substring(0,50)}..., Value=${attr.value.substring(0,50)}...`);
                     return false;
                 }
                 return true;
             });

             if (validNewPollAttributes.length === 0) {
                  // console.log("No valid poll attributes to update after length check.");
                  return;
             }

             // --- MERGE LOGIC START ---
             // Get existing attributes (UTMs, etc.) - check if cart.attributes exists and is an array
             const existingAttributes = (cart && Array.isArray(cart.attributes)) ? cart.attributes : [];

             // Filter out any *old* poll attributes to prevent duplicates if answered again
             const nonPollExistingAttributes = existingAttributes.filter(attr => !attr.key.startsWith('poll_'));

             // Combine non-poll existing attributes with the new valid poll attributes
             const mergedAttributes = [...nonPollExistingAttributes, ...validNewPollAttributes];
             // --- MERGE LOGIC END ---

             try {
                 // console.log(`Updating attributes for cart ${cart.id}:`, mergedAttributes);
                 const data = await callShopifyAPI(CART_ATTRIBUTES_UPDATE_MUTATION, {
                     cartId: cart.id,
                     attributes: mergedAttributes // Use the merged list
                 });

                 if (data?.cartAttributesUpdate?.cart) {
                     // console.log("Cart attributes updated successfully with poll answers.");
                     cart = data.cartAttributesUpdate.cart; // Update global cart state
                     // Optionally re-render if needed
                     // renderCart();
                 } else {
                     // console.error("Failed to update cart attributes. Response:", data);
                     throw new Error(data?.cartAttributesUpdate?.userErrors?.[0]?.message || "Unknown error updating cart attributes.");
                 }
             } catch (error) {
                 // console.error("Error updating cart attributes with poll answers:", error);
                 showCartError(`Could not save poll answers: ${error.message}`); // Using our new error display
             }
         });

         // ---- START TEMPORARY ALIA TEST ----
         // Removed Test Alia Trigger Event Listener
         // ---- END TEMPORARY ALIA TEST ----
     }

    // --- Initial Load (supports late module imports) ---
    async function bootstrapCart() {
        // console.log('[Cart Debug] bootstrapCart start');
        
        // Initialize Lucide icons if not already done
        initializeLucideIcons();
        
        try {
            await initializeCart(); // Wait for cart and Elevar initialization
        } catch (error) {
            // console.error("Error during initial setup:", error);
            // Handle critical setup errors if needed
        }
        setupEventListeners(); // Setup click/custom event listeners
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrapCart, { once: true });
    } else {
        // DOMContentLoaded already fired – run immediately (important for lazy-loader)
        bootstrapCart();
    }

    // Function to safely initialize Lucide icons
    function initializeLucideIcons() {
        if (typeof window.lucide === 'undefined' || !window.lucide.icons) {
            // console.warn('[Cart Debug] window.lucide.icons not found. Skipping icon initialization.');
            return;
        }
        try {
            const config = {
                attrs: { 'stroke-width': '1.5', stroke: 'currentColor' }
            };
            if (window.lucide.icons && Object.keys(window.lucide.icons).length) {
                config.icons = window.lucide.icons;
            }
            window.lucide.createIcons(config);
            // console.log('[Cart Debug] Lucide icons initialized successfully');
        } catch (error) {
            // console.error('[Cart Error] Failed to initialize Lucide icons:', error);
        }
    }

    // --- Product API Integration ---
    
    // Cache for product data to avoid repeated API calls
    const productCache = {};
    
    // Function to fetch product data from Shopify API
    async function fetchProductData(variantId) {
        // Check cache first
        if (productCache[variantId]) {
            // console.log(`[Product API] Using cached data for variant ${variantId}`);
            return productCache[variantId];
        }
        
        // console.log(`[Product API] Fetching data for variant ${variantId}`);
        
        // GraphQL query to get product and variant details
        const VARIANT_QUERY = `
            query getVariantById($id: ID!) {
                node(id: $id) {
                    ... on ProductVariant {
                        id
                        title
                        price {
                            amount
                            currencyCode
                        }
                        compareAtPrice {
                            amount
                            currencyCode
                        }
                        image {
                            url
                            altText
                        }
                        product {
                            id
                            title
                            description
                            images(first: 1) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;
        
        try {
            const data = await callShopifyAPI(VARIANT_QUERY, { id: variantId });
            
            if (data && data.node) {
                // Cache the data
                productCache[variantId] = data.node;
                return data.node;
            } else {
                // console.error(`[Product API] No data returned for variant ${variantId}`);
                return null;
            }
        } catch (error) {
            // console.error(`[Product API] Error fetching product data for ${variantId}:`, error);
            return null;
        }
    }
    
    // Function to update bundle UI with actual product data
    async function updateBundlePrices() {
        // console.log('[Product API] Updating bundle prices from API');
        
        const bundleLabels = document.querySelectorAll('label[data-variant-id]');
        
        // Process each bundle option
        for (const label of bundleLabels) {
            const variantId = label.getAttribute('data-variant-id');
            if (!variantId) continue;
            
            try {
                // Show loading state
                const priceElement = label.querySelector('p.font-bold');
                const originalPriceElement = label.querySelector('p.line-through');
                
                if (priceElement) {
                    priceElement.innerHTML = '<span class="inline-block animate-pulse">Loading...</span>';
                }
                
                // Fetch product data
                const productData = await fetchProductData(variantId);
                
                if (productData) {
                    // Update price
                    if (priceElement && productData.price) {
                        const price = parseFloat(productData.price.amount);
                        const currency = productData.price.currencyCode || 'USD';
                        priceElement.textContent = formatPrice(price, currency);
                    }
                    
                    // Update compare-at price if available
                    if (originalPriceElement && productData.compareAtPrice) {
                        const comparePrice = parseFloat(productData.compareAtPrice.amount);
                        const currency = productData.compareAtPrice.currencyCode || 'USD';
                        originalPriceElement.textContent = formatPrice(comparePrice, currency);
                    }
                    
                    // Update image if available
                    const imageElement = label.querySelector('img');
                    if (imageElement && productData.image && productData.image.url) {
                        // Keep the original image as fallback
                        const originalSrc = imageElement.src;
                        
                        // Set new image with error handler
                        imageElement.onerror = () => {
                            // console.warn(`[Product API] Failed to load image from API, falling back to original`);
                            imageElement.src = originalSrc; // Restore original on error
                        };
                        
                        imageElement.src = productData.image.url;
                        
                        // Use API alt text if available, otherwise fallback to product title
                        imageElement.alt = productData.image.altText || productData.product?.title || 'TryLumiClean Bundle Option';
                    }
                }
            } catch (error) {
                // console.error(`[Product API] Error updating bundle for ${variantId}:`, error);
            }
        }
    }
    
    // Helper function to format price consistently
    function formatPrice(amount, currencyCode = 'USD') {
        // Default formatter for USD
        let formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        
        // Handle different currencies
        if (currencyCode === 'AED') {
            formatter = new Intl.NumberFormat('en-AE', {
                style: 'currency',
                currency: 'AED',
            });
        }
        
        return formatter.format(amount);
    }

    // Add helper to enable/disable buttons per line
    function toggleLineButtons(itemEl, disabled) {
        if (!itemEl) return;
        itemEl.querySelectorAll('.quantity-btn').forEach(btn => btn.disabled = disabled);
    }

    // Function for optimistic quantity updates
    async function optimisticLineQuantityChange(itemEl, lineId, delta) {
        if (!itemEl || !lineId) return;
        const qtyEl = itemEl.querySelector('[data-cart-item-quantity]');
        const originalQty = parseInt(qtyEl.textContent) || 0;
        const newQty = originalQty + delta;

        // If the new qty would be negative, do nothing. If qty is 0, remove the line optimistically.
        if (newQty < 0) {
            return; // Prevent negative quantities
        }

        if (newQty === 0) {
            // Optimistically remove from DOM
            const parentEl = itemEl.closest('.cart-item');
            if (parentEl) parentEl.remove();
            toggleLineButtons(itemEl, true);

            try {
                await handleUpdateItemQuantity(lineId, 0);
            } catch (error) {
                // Revert on error – because element removed, re-render full cart
                renderCart();
            }
            return;
        }
         
         // Optimistically update DOM and disable buttons
         qtyEl.textContent = newQty;
         const minusBtn = itemEl.querySelector('.quantity-minus-btn');
         if (minusBtn) minusBtn.disabled = newQty <= 0;
         toggleLineButtons(itemEl, true); // Disable buttons optimistically
         
         try {
             // Send API update using the non-optimistic handler
             // handleUpdateItemQuantity will update the cart state and re-render on success
             await handleUpdateItemQuantity(lineId, newQty);
             // If successful, re-rendering will set the correct final button states
         } catch (error) {
             // API call failed, revert UI changes
             // console.error("Optimistic quantity update failed, reverting UI:", error);
             // Revert quantity display
             qtyEl.textContent = originalQty;
             // Re-enable buttons based on original state
             toggleLineButtons(itemEl, false);
             if (minusBtn) minusBtn.disabled = originalQty <= 0;
             // Error message is already shown by handleUpdateItemQuantity
         }
     }

    // NEW function to apply or remove discount codes
    async function applyDiscountCode(cartId, discountCode = null) {
        if (!cartId) {
            console.error("Cannot apply discount: Cart ID is missing.");
            throw new Error("Cart ID is missing.");
        }

        // If discountCode is null or empty array/string, we intend to remove codes
        const codesToApply = discountCode ? (Array.isArray(discountCode) ? discountCode : [discountCode]) : [];
        console.log(`Applying discount codes: ${codesToApply.join(', ') || 'REMOVING ALL'} to cart ${cartId}`);

        try {
            const data = await callShopifyAPI(UPDATE_DISCOUNT_CODE_MUTATION, {
                cartId,
                discountCodes: codesToApply, // Send array (can be empty)
            });

            const updatedCart = data?.cartDiscountCodesUpdate?.cart;
            const userErrors = data?.cartDiscountCodesUpdate?.userErrors;

            if (userErrors && userErrors.length > 0) {
                // Throw the specific error message from Shopify
                console.error('Shopify Discount Error:', userErrors);
                throw new Error(userErrors[0].message);
            }

            if (!updatedCart) {
                console.error('Failed to update cart with discount code, no updated cart returned.');
                throw new Error("Failed to update cart with discount code.");
            }

            // Successfully updated (or removed) discount
            console.log(`Discount update successful for cart ${cartId}. Applied codes:`, updatedCart.discountCodes.map(dc => dc.code));
            return updatedCart;

        } catch (error) {
            console.error("Error applying/removing discount code:", error);
            // Re-throw the error (could be the specific Shopify error or a fetch error)
            throw error;
        }
    }

    // --- Focus Trap: Keydown Handler ---
    function handleFocusTrap(event) {
        if (event.key !== 'Tab') return;

        const focusableElements = cartDrawer.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            // If Shift + Tab are pressed
            if (document.activeElement === firstElement) {
                lastElement.focus(); // Move focus to the last element
                event.preventDefault();
            }
        } else {
            // If Tab is pressed
            if (document.activeElement === lastElement) {
                firstElement.focus(); // Move focus to the first element
                event.preventDefault();
            }
        }
    }



