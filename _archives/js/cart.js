    // --- Product Variant IDs ---
    const PRODUCT_VARIANTS = {
        UVO254: 'gid://shopify/ProductVariant/42904402526457',  // UVO254™ - Powered Home Disinfection Tower
        UVO108: 'gid://shopify/ProductVariant/42910843764985',  // UVO108™
        UVO72: 'gid://shopify/ProductVariant/44103628357881'    // UVO72™
    };

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

    // --- Alia Discount Elements (Keep elements from previous answer) ---
    const discountSection = document.getElementById('discount-section');
    const rewardTextElement = document.getElementById('reward-text');
    const discountCodeElement = document.getElementById('discount-code');
    const timerElement = document.getElementById('timer');
    const expiredMessageElement = document.getElementById('expired-message');

    // --- Cart State & Data ---
    let cart = null; // Will hold the entire cart object from Shopify
    let aliaTimerInterval = null;
    let isLoading = false; // Simple loading state flag

    // --- Local Storage Key for Cart ID ---
    const CART_ID_STORAGE_KEY = 'shopify_cart_id';
    const ALIA_CODE_STORAGE_KEY = 'alia_discount_code';
    const ALIA_TEXT_STORAGE_KEY = 'alia_reward_text';
    const ALIA_EXPIRY_STORAGE_KEY = 'alia_expiry_timestamp';

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
                        console.warn(`Skipping attribute due to length limit: Key='${key}' (Length ${key.length}), Value='${value.substring(0, 30)}...' (Length ${value.length})`);
                     }
                }
            });

            console.log("Captured URL Parameters for Attributes:", attributes);
            return attributes;
        }

    // Function to get the A/B test variant attribute from URL
    function getExperimentAttribute() {
        const params = new URLSearchParams(window.location.search);
        const variant = params.get('ab_variant');
        if (variant && variant.length <= 250) { // Check Shopify value length limit
            const attribute = { key: "experiment_branch", value: variant };
            console.log("Captured Experiment Attribute:", attribute);
            return attribute;
        }
        return null; // Return null if parameter not found or too long
    }

    // --- GraphQL Definitions ---
    const CartFragment = `
        fragment CartFragment on Cart {
            id
            checkoutUrl
            totalQuantity
            cost {
                subtotalAmount { amount currencyCode }
                totalAmount { amount currencyCode }
                # You might want totalTaxAmount and totalDutyAmount too
            }
            lines(first: 50) { # Adjust count as needed
                nodes {
                    id # Line item ID, needed for removal
                    quantity
                    cost {
                        totalAmount { amount currencyCode } # Line item total cost
                    }
                    merchandise {
                        ... on ProductVariant {
                            id # Variant ID
                            title
                            product { title }
                            image { url altText } # Removed (width: 150) argument
                            price { amount currencyCode }
                            compareAtPrice { amount currencyCode } # Original price
                        }
                    }
                }
            }
            discountCodes { # Show applied discount codes
                applicable
                code
            }
             buyerIdentity { # Useful for persisted carts
                 email
                 phone
                 # customer { id } # Removed due to missing scope
             }
            attributes {
                 key
                 value
             }
        }
    `;

    const CREATE_CART_MUTATION = `
        mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
                cart { ...CartFragment }
                userErrors { field message }
            }
        }
        ${CartFragment}
    `;

    const FETCH_CART_QUERY = `
        query getCart($cartId: ID!) {
            cart(id: $cartId) { ...CartFragment }
        }
        ${CartFragment}
    `;

    const ADD_TO_CART_MUTATION = `
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart { ...CartFragment }
                userErrors { field message }
            }
        }
        ${CartFragment}
    `;

    const REMOVE_FROM_CART_MUTATION = `
        mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                cart { ...CartFragment }
                userErrors { field message }
            }
        }
        ${CartFragment}
    `;

    const UPDATE_DISCOUNT_CODE_MUTATION = `
        mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
             cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
                 cart { ...CartFragment }
                 userErrors { field message code }
             }
         }
         ${CartFragment}
    `;

    const UPDATE_CART_LINE_MUTATION = `
        mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
                cart { ...CartFragment }
                userErrors { field message }
            }
        }
        ${CartFragment}
    `;

    const CART_BUYER_IDENTITY_UPDATE_MUTATION = `
        mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
            cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
                cart { ...CartFragment }
                userErrors { field message }
            }
        }
        ${CartFragment}
    `;

    const CART_ATTRIBUTES_UPDATE_MUTATION = `
        mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
            cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
                cart { ...CartFragment }
                userErrors { field message }
            }
        }
        ${CartFragment}
    `;

    // --- API Call Helper ---
    async function callShopifyAPI(query, variables = {}) {
        if (isLoading) {
            console.warn("API call blocked, already loading.");
            return;
        }
        setLoading(true);

        try {
            const response = await fetch('https://kathyfox.myshopify.com/api/2023-10/graphql.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': '1f82e769f19c8016e34d580af41cb329'
                },
                body: JSON.stringify({ query, variables }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Shopify API error: ${response.status}`, errorBody);
                throw new Error(`API call failed with status ${response.status}. ${errorBody}`);
            }

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL Errors:', result.errors);
                throw new Error(`GraphQL error: ${result.errors[0].message}`);
            }

            const dataKeys = Object.keys(result.data || {});
            if (dataKeys.length > 0) {
                const mutationKey = dataKeys[0];
                const operationResult = result.data[mutationKey];
                if (operationResult && operationResult.userErrors && operationResult.userErrors.length > 0) {
                    console.error('Shopify User Errors:', operationResult.userErrors);
                    throw new Error(`Shopify error: ${operationResult.userErrors[0].message}`);
                }
            }

            return result.data;

        } catch (error) {
            console.error('Failed during Shopify API call:', error);
            throw error;
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
            console.warn("Cart error elements not found, falling back to alert");
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

    // --- Cart Functions ---

    // Creates a new cart
    async function createCart() {
        try {
            const utmAttributes = getUrlParameters();
            const experimentAttribute = getExperimentAttribute();
            let combinedAttributes = utmAttributes;

            if (experimentAttribute) {
                const existingIndex = combinedAttributes.findIndex(attr => attr.key === experimentAttribute.key);
                if (existingIndex !== -1) {
                    console.warn(`Attribute key "${experimentAttribute.key}" already exists. Overwriting with experiment value.`);
                    combinedAttributes[existingIndex] = experimentAttribute;
                } else {
                    combinedAttributes.push(experimentAttribute);
                }
            }

            console.log("createCart: Creating new cart with attributes:", combinedAttributes);

            const variables = {
                input: {
                    lines: [],
                    attributes: combinedAttributes
                }
            };
            const data = await callShopifyAPI(CREATE_CART_MUTATION, variables);
            if (data && data.cartCreate && data.cartCreate.cart) {
                cart = data.cartCreate.cart;
                console.log("createCart: Successfully created new cart:", cart.id);
                localStorage.setItem(CART_ID_STORAGE_KEY, cart.id);
                return cart;
            } else {
                console.error("createCart: Failed to create new cart. Response data:", data);
                const userErrors = data?.cartCreate?.userErrors;
                if (userErrors && userErrors.length > 0) {
                    showCartError(`Cart Error: ${userErrors[0].message}`);
                    throw new Error(`Shopify User Error: ${userErrors[0].message}`);
                } else {
                    throw new Error("Cart creation failed unexpectedly. Check network logs.");
                }
            }
        } catch (error) {
            console.error("createCart: Error creating new cart:", error);
            if (!error.message.startsWith("Shopify User Error:")) {
                showCartError("Could not create a shopping cart. Please refresh and try again.");
            }
            return null;
        }
    }

    // Fetches cart if ID exists, otherwise creates a new one
    async function getOrCreateCart() {
        let cartId = localStorage.getItem(CART_ID_STORAGE_KEY);
        console.log("getOrCreateCart: Stored cart ID:", cartId); // Log stored ID

        if (cartId) {
            try {
                console.log("getOrCreateCart: Fetching existing cart:", cartId); // Log fetch attempt
                const data = await callShopifyAPI(FETCH_CART_QUERY, { cartId });
                if (data && data.cart) {
                    console.log("getOrCreateCart: Successfully fetched existing cart:", data.cart.id); // Log success
                    cart = data.cart;
                    return cart;
                } else {
                    // Cart ID was invalid or cart was deleted/expired
                    console.warn("getOrCreateCart: Fetch failed for stored cart ID, creating new cart."); // Log failure
                    cartId = null; // Force creation
                    localStorage.removeItem(CART_ID_STORAGE_KEY);
                }
            } catch (error) {
                console.error("getOrCreateCart: Error fetching existing cart:", error); // Log error
                showCartError("Could not retrieve your existing cart. Please try again.");
                cartId = null; // Force creation on error
                localStorage.removeItem(CART_ID_STORAGE_KEY);
            }
        }

        // If no valid cartId, create a new cart
        if (!cartId) {
            try {
                // Combine URL parameters and experiment attribute
                const utmAttributes = getUrlParameters(); // Existing function call
                const experimentAttribute = getExperimentAttribute(); // New function call
                let combinedAttributes = utmAttributes; // Start with UTM attributes

                if (experimentAttribute) {
                     // Check if an attribute with the same key already exists (e.g., if ab_variant was accidentally in utmParams)
                     const existingIndex = combinedAttributes.findIndex(attr => attr.key === experimentAttribute.key);
                     if (existingIndex !== -1) {
                        console.warn(`Attribute key "${experimentAttribute.key}" already exists. Overwriting with experiment value.`);
                        combinedAttributes[existingIndex] = experimentAttribute; // Replace existing
                     } else {
                        combinedAttributes.push(experimentAttribute); // Add new attribute
                     }
                }

                console.log("getOrCreateCart: Creating new cart with attributes:", combinedAttributes); // Log creation and attributes

                const variables = {
                    input: {
                        lines: [], // Start with empty lines
                        attributes: combinedAttributes // Pass the combined array
                    }
                };
                const data = await callShopifyAPI(CREATE_CART_MUTATION, variables);
                if (data && data.cartCreate && data.cartCreate.cart) {
                    cart = data.cartCreate.cart;
                    console.log("getOrCreateCart: Successfully created new cart:", cart.id); // Log success
                    localStorage.setItem(CART_ID_STORAGE_KEY, cart.id);
                    return cart;
                } else {
                    console.error("getOrCreateCart: Failed to create new cart. Response data:", data); // Log failure data
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
                console.error("getOrCreateCart: Error creating new cart:", error); // Log creation error
                // Avoid showing generic error if a specific one was already shown
                if (!error.message.startsWith("Shopify User Error:")) {
                     showCartError("Could not create a shopping cart. Please refresh and try again.");
                }
                return null; // Indicate failure
            }
        }
         // Fallback in case logic above fails to return explicitly
         console.warn("getOrCreateCart: Reached end of function unexpectedly. Returning current cart state:", cart);
         return cart;
    }

    async function addCartLine(cartId, merchandiseId, quantity = 1) {
         if (!merchandiseId) {
             console.error("Cannot add to cart: merchandiseId is missing.");
             return cart; // Return current cart state
         }
         const data = await callShopifyAPI(ADD_TO_CART_MUTATION, {
             cartId,
             lines: [{ merchandiseId, quantity }],
         });
         return data?.cartLinesAdd?.cart;
    }

    async function removeCartLine(cartId, lineId) {
         const data = await callShopifyAPI(REMOVE_FROM_CART_MUTATION, {
             cartId,
             lineIds: [lineId],
         });
         return data?.cartLinesRemove?.cart;
    }

    async function applyDiscountCode(cartId, discountCode) {
         const data = await callShopifyAPI(UPDATE_DISCOUNT_CODE_MUTATION, {
             cartId,
             discountCodes: discountCode ? [discountCode] : [], // Send empty array to remove codes
         });
         // Check for specific 'Discount code couldn't be applied' userError
         const userErrors = data?.cartDiscountCodesUpdate?.userErrors;
         if (userErrors && userErrors.length > 0 && userErrors.some(err => err.code === 'DISCOUNT_NOT_FOUND' || err.code === 'DISCOUNT_EXPIRED' || err.code === 'DISCOUNT_DISABLED' || err.code === 'DISCOUNT_LIMIT_REACHED')) {
            // Throw a specific error that the Alia listener can catch
            throw new Error(`Discount code "${discountCode}" could not be applied: ${userErrors[0].message}`);
         }
         return data?.cartDiscountCodesUpdate?.cart;
    }

    // --- UI Rendering ---

    function renderCartItems() {
        cartItemsContainer.querySelectorAll('.cart-item:not(#cart-item-template)').forEach(el => el.remove());
        const template = document.getElementById('cart-item-template');

        if (!cart || cart.lines.nodes.length === 0) {
            emptyCartMessage.classList.remove('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');
            cart.lines.nodes.forEach(item => {
                const itemElement = template.cloneNode(true);
                itemElement.classList.remove('hidden');
                itemElement.removeAttribute('id');

                 const merchandise = item.merchandise;
                 itemElement.querySelector('[data-cart-item-image]').src = merchandise.image?.url || 'https://placehold.co/64x64/e2e8f0/94a3b8?text=Item';
                 itemElement.querySelector('[data-cart-item-image]').alt = merchandise.image?.altText || merchandise.product.title;
                 itemElement.querySelector('[data-cart-item-name]').textContent = merchandise.product.title; // Using product title
                 // You could add variant title if needed: merchandise.title
                 itemElement.querySelector('[data-cart-item-quantity]').textContent = item.quantity;

                 // Display line item total (price * quantity)
                 itemElement.querySelector('[data-cart-item-price]').textContent = `$${parseFloat(item.cost.totalAmount.amount).toFixed(2)}`;

                 // Show compareAtPrice (Original Price) if available and different from price
                 const originalPriceElem = itemElement.querySelector('[data-cart-item-original-price]');
                const compareAtPrice = merchandise.compareAtPrice ? parseFloat(merchandise.compareAtPrice.amount) : null;
                const currentPrice = parseFloat(merchandise.price.amount); // Price per unit

                 if (compareAtPrice && compareAtPrice > currentPrice) {
                    // Display the original price per unit
                    originalPriceElem.textContent = `$${compareAtPrice.toFixed(2)}`;
                    originalPriceElem.classList.remove('hidden');
                 } else {
                     originalPriceElem.classList.add('hidden'); // Hide if no discount or compareAtPrice is lower
                 }

                 // Quantity Selector Setup
                 const quantityDisplay = itemElement.querySelector('[data-cart-item-quantity]');
                 const minusBtn = itemElement.querySelector('.quantity-minus-btn');
                 const plusBtn = itemElement.querySelector('.quantity-plus-btn');

                 quantityDisplay.textContent = item.quantity;
                 minusBtn.disabled = item.quantity <= 1;
                 minusBtn.setAttribute('data-line-id', item.id);
                 plusBtn.setAttribute('data-line-id', item.id);

                 minusBtn.addEventListener('click', () => handleUpdateItemQuantity(item.id, item.quantity - 1));
                 plusBtn.addEventListener('click', () => handleUpdateItemQuantity(item.id, item.quantity + 1));


                 const removeBtn = itemElement.querySelector('.remove-item-btn');
                 removeBtn.setAttribute('data-item-id', merchandise.id); // Variant ID
                 removeBtn.setAttribute('data-line-id', item.id); // Line ID
                 removeBtn.addEventListener('click', handleRemoveItem);

                 cartItemsContainer.appendChild(itemElement);
             });
        }
         // Ensure Lucide icons are rendered for dynamic items (including +/- buttons)
         if (typeof lucide !== 'undefined' && lucide.icons) { // Check for lucide.icons too
             lucide.createIcons({
                 icons: lucide.icons, // Pass the icon map from the global object
                 nodes: cartItemsContainer.querySelectorAll('[data-lucide]')
              });
         }
    }

     async function handleRemoveItem(event) {
         if (isLoading) return;
         const button = event.currentTarget;
         const lineId = button.getAttribute('data-line-id');
         if (!cart || !lineId) return;

         try {
             const updatedCart = await removeCartLine(cart.id, lineId);
             if (updatedCart) {
                 cart = updatedCart; // Update global state
                 renderCart();
             }
         } catch (error) {
             showCartError("Could not remove item. Please try again."); // Using our new error display
         }
     }

     async function handleUpdateItemQuantity(lineId, newQuantity) {
        if (isLoading || !cart || !lineId || newQuantity < 1) {
            console.log("Update quantity blocked:", {isLoading, cart, lineId, newQuantity});
            return; // Don't allow quantity less than 1, or if already loading
        }
        console.log(`Updating line ${lineId} to quantity ${newQuantity}`);

        try {
            const data = await callShopifyAPI(UPDATE_CART_LINE_MUTATION, {
                cartId: cart.id,
                lines: [{ id: lineId, quantity: newQuantity }],
            });

            // Check for Shopify user errors specifically related to quantity update
            const userErrors = data?.cartLinesUpdate?.userErrors;
            if (userErrors && userErrors.length > 0) {
                // Check if it's an inventory issue
                const inventoryError = userErrors.find(err => err.field && err.field.includes('quantity') && err.message.toLowerCase().includes('not enough stock') || err.message.toLowerCase().includes('inventory'));
                if (inventoryError) {
                    showCartError(`Could not update quantity: ${inventoryError.message}`);
                } else {
                    showCartError(`Error updating cart: ${userErrors[0].message}`);
                }
                // No cart update, re-render to potentially reset loading state if needed
                renderCart();
                return; // Stop processing if there was a user error
            }


            if (data?.cartLinesUpdate?.cart) {
                cart = data.cartLinesUpdate.cart; // Update global state
                renderCart(); // Re-render the entire cart with updated info
            } else {
                 // If cart data didn't come back as expected, log it but might not be fatal
                 console.warn("Cart data not returned as expected after quantity update.", data);
                 renderCart(); // Still try to re-render
            }
        } catch (error) {
            console.error("Failed to update item quantity:", error);
            showCartError("Could not update item quantity. Please try again.");
            renderCart(); // Re-render to reset loading state
         }
     }

    function renderCartSummary() {
        const installmentInfoElement = document.getElementById('installment-info'); // Get the new element

        if (!cart || cart.lines.nodes.length === 0) {
            document.getElementById('cart-original-total').textContent = '$0.00';
            document.getElementById('initial-discount-amount').textContent = '-$0.00';
            document.getElementById('total-savings-amount').textContent = '-$0.00';
            document.getElementById('cart-subtotal').textContent = '$0.00';
            checkoutBtn.setAttribute('data-checkout-url', '#'); // Reset checkout URL
            if (installmentInfoElement) installmentInfoElement.innerHTML = ''; // Clear installment info
            return;
        }

        let totalOriginalPrice = 0;
        let totalRegularPrice = 0;

        cart.lines.nodes.forEach(item => {
            const merchandise = item.merchandise;
            const quantity = item.quantity;
            const compareAtPrice = merchandise.compareAtPrice ? parseFloat(merchandise.compareAtPrice.amount) : parseFloat(merchandise.price.amount); // Fallback to price if no compareAtPrice
            const regularPrice = parseFloat(merchandise.price.amount);

            totalOriginalPrice += compareAtPrice * quantity;
            totalRegularPrice += regularPrice * quantity;
        });

        const finalPrice = parseFloat(cart.cost.totalAmount.amount);
        
        // Calculate discounts based on summed totals
        const initialDiscount = totalOriginalPrice - totalRegularPrice;
        const totalSavings = totalOriginalPrice - finalPrice; // Total amount saved

        // Update all price displays
        document.getElementById('cart-original-total').textContent = `$${totalOriginalPrice.toFixed(2)}`;
        document.getElementById('initial-discount-amount').textContent = `-$${initialDiscount.toFixed(2)}`;
        document.getElementById('total-savings-amount').textContent = `-$${totalSavings.toFixed(2)}`;
        document.getElementById('cart-subtotal').textContent = `$${finalPrice.toFixed(2)}`;

        // Update Checkout Button URL
        checkoutBtn.setAttribute('data-checkout-url', cart.checkoutUrl || '#');

        // Update Installment Info
        if (installmentInfoElement && finalPrice > 0) {
            const installmentAmount = finalPrice / 4;
            // Re-using the ShopPay logo URL from the button
            const shopPayLogoUrl = "https://res.cloudinary.com/dg8ibuag5/image/upload/v1743723089/Shop_Pay_logo_purple_xqxhd1.svg";
            installmentInfoElement.innerHTML = `
                or 4 interest-free payments of <b>$${installmentAmount.toFixed(2)}</b> with 
                <img src="${shopPayLogoUrl}" alt="Shop Pay" class="inline-block h-4 ml-1 align-middle" loading="lazy">
            `;
        } else if (installmentInfoElement) {
            installmentInfoElement.innerHTML = ''; // Clear if price is zero
        }
    }

    function renderAppliedDiscounts() {
        // Add debug logging to see what we're working with
        console.log("[RenderCheck] Cart State:", cart);
        console.log("[RenderCheck] Local Storage:", {
            code: localStorage.getItem(ALIA_CODE_STORAGE_KEY),
            text: localStorage.getItem(ALIA_TEXT_STORAGE_KEY),
            expiry: localStorage.getItem(ALIA_EXPIRY_STORAGE_KEY),
        });
        if (cart?.discountCodes) {
            console.log("[RenderCheck] Shopify Discount Codes:", cart.discountCodes);
        }

        const aliaCode = localStorage.getItem(ALIA_CODE_STORAGE_KEY);
        const storedExpiry = parseInt(localStorage.getItem(ALIA_EXPIRY_STORAGE_KEY));

        // --- Refined Checks ---
        const isLocalStorageValid = aliaCode && storedExpiry && storedExpiry > Date.now();
        const isCodeInShopifyCart = cart?.discountCodes?.some(dc => dc.code === aliaCode);

        console.log("[RenderCheck] Validation:", { isLocalStorageValid, isCodeInShopifyCart });

        if (isLocalStorageValid && isCodeInShopifyCart) {
            // Only show if BOTH localStorage is valid AND the code is actually in the current Shopify cart
            const aliaText = localStorage.getItem(ALIA_TEXT_STORAGE_KEY);
            console.log("[RenderCheck] Showing Alia discount section");
            rewardTextElement.textContent = aliaText || 'Discount Applied';
             discountCodeElement.textContent = aliaCode;
             discountSection.classList.remove('hidden');
            startAliaTimer(Math.floor((storedExpiry - Date.now()) / 1000));
         } else {
            console.log("[RenderCheck] Hiding Alia discount section. Conditions:", {
                hasAliaCode: Boolean(aliaCode),
                isValidExpiry: Boolean(storedExpiry && storedExpiry > Date.now()),
                isAppliedInShopify: isCodeInShopifyCart,
             });
            discountSection.classList.add('hidden');
            if (expiredMessageElement) expiredMessageElement.classList.add('hidden');
            clearInterval(aliaTimerInterval);

            // Clear storage if the reason for hiding is an expired timer in localStorage
            if (aliaCode && storedExpiry && storedExpiry <= Date.now()) {
                console.log("[RenderCheck] Clearing expired Alia data from localStorage.");
                localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
                // No window variables used
            }
         }
    }


    function startAliaTimer(durationSeconds) {
         clearInterval(aliaTimerInterval);
         if (durationSeconds <= 0) { // Already expired when called
             timerElement.textContent = "Expired";
             discountSection.classList.add('opacity-50');
             console.log("[AliaTimer] Timer called with duration <= 0, marking as expired immediately.");
             // Clear storage as it's already expired
             localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
             localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
             localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);
             // Fetch cart to sync state
             fetchCart(cart?.id).then(refreshedCart => {
                 if (refreshedCart) {
                     cart = refreshedCart; // Update global cart state
                     renderCart(); // Re-render with accurate prices/discount state
                 } else {
                     initializeCart(); // Re-initialize if cart became invalid
                 }
             }).catch(error => {
                 console.error("Error fetching cart after immediate timer expiry:", error);
                 renderCart(); // Still re-render UI
             });
             return;
         }
         discountSection.classList.remove('opacity-50');
         let timer = durationSeconds;
         const updateTimerDisplay = () => {
             const minutes = Math.floor(timer / 60);
             const seconds = timer % 60;
             timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
         };
         updateTimerDisplay();
         aliaTimerInterval = setInterval(() => {
             timer--;
             updateTimerDisplay();
             if (timer < 0) {
                 console.log("[AliaTimer] Interval timer expired.");
                 clearInterval(aliaTimerInterval);
                 timerElement.textContent = "Expired";
                 discountSection.classList.add('opacity-50');

                 // Clear Alia keys from localStorage now that UI timer has expired
                 console.log("[AliaTimer] Clearing Alia data from localStorage due to UI timer expiry.");
                 localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                 localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                 localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);

                 // Explicitly remove discount code from Shopify cart
                 if (cart?.id) {
                     console.log("[AliaTimer] Attempting to remove expired discount code from Shopify cart.");
                     // Call applyDiscountCode with empty array to remove codes
                     applyDiscountCode(cart.id, []) 
                         .then(updatedCart => {
                             if (updatedCart) {
                                 cart = updatedCart; // Update global cart state
                                 console.log("[AliaTimer] Discount removed from Shopify cart, updated cart rendered, showing expired message.");
                                 renderCart(); // Re-render with accurate (non-discounted) prices
                                 if (expiredMessageElement) expiredMessageElement.classList.remove('hidden');
                             } else {
                                 // Handle case where cart became invalid or API didn't return cart
                                 console.warn("[AliaTimer] Cart update/discount removal might have failed or cart became invalid. Re-initializing.");
                                 initializeCart(); 
                             }
                         })
                         .catch(error => {
                             console.error("[AliaTimer] Error removing discount code from Shopify cart:", error);
                             // Still render cart to hide the Alia section based on cleared local storage
                             renderCart();
                             if (expiredMessageElement) expiredMessageElement.classList.remove('hidden');
                         });
                 } else {
                     console.warn("[AliaTimer] No cart ID found to remove discount from Shopify after expiry.");
                     renderCart(); // Still re-render UI to hide Alia section
                     if (expiredMessageElement) expiredMessageElement.classList.remove('hidden');
                 }
             }
         }, 1000);
     }

    function renderCart() {
        console.log("Rendering cart with state:", cart);
        renderCartItems();
        renderCartSummary();
        renderAppliedDiscounts();

        // Update cart icon counter and visibility
        const cartIcon = document.getElementById('open-cart-trigger');
        const cartCounter = document.getElementById('cart-item-count');
        const totalQuantity = cart?.totalQuantity || 0;

        if (cartIcon && cartCounter) {
            cartCounter.textContent = totalQuantity;
            if (totalQuantity > 0) {
                cartIcon.classList.remove('hidden');
                cartCounter.classList.remove('hidden');
            } else {
                cartIcon.classList.add('hidden');
                cartCounter.classList.add('hidden');
            }
        }

        setLoading(false); // Ensure loading state is reset after render
    }

    function openDrawer() {
        if (!cartDrawer || !cartOverlay) return;
        console.log("Opening drawer...");
        cartOverlay.classList.remove('hidden');
        setTimeout(() => cartOverlay.classList.add('opacity-100'), 10); // Keep opacity control
        cartDrawer.classList.remove('translate-x-full'); // Remove the class that hides it
        cartDrawer.classList.add('translate-x-0');    // Add the class that shows it
        document.documentElement.classList.add('cart-drawer-open'); // Add class to HTML
        if(cart) {
            renderCart();
        }
    }

    function closeDrawer() {
        if (!cartDrawer || !cartOverlay) return;
        console.log("Closing drawer...");
        cartOverlay.classList.remove('opacity-100');
        setTimeout(() => cartOverlay.classList.add('hidden'), 300); // Keep hide delay
        cartDrawer.classList.remove('translate-x-0'); // Remove the class that shows it
        cartDrawer.classList.add('translate-x-full');   // Add the class that hides it
        document.documentElement.classList.remove('cart-drawer-open'); // Remove class from HTML
        
        // Hide any error message when drawer is closed
        hideCartError();
    }
    // --- Initialize Cart ---
    async function initializeCart() {
        console.log("[Cart Init] Initializing cart...");
        try {
            // Use the consolidated function
            const loadedCart = await getOrCreateCart();

            if (!loadedCart) {
                 console.error("[Cart Init] Failed to load or create cart after getOrCreateCart call.");
                 // Error should have been shown by getOrCreateCart, maybe add a generic fallback?
                 // showCartError("Failed to initialize cart. Please refresh.");
                 setLoading(false); // Ensure loading state is reset
                 return; // Stop initialization if cart failed
            }
            
            // cart variable is already updated globally within getOrCreateCart
            console.log("[Cart Debug] Cart initialized. Now checking/updating experiment attribute...");
            await updateExperimentAttributeIfNeeded(); // Check/update experiment attribute
            console.log("[Cart Debug] Attribute check/update complete.");
            
        } catch (error) {
            // Catch any unexpected errors during the initialization process itself
            console.error("[Cart Init] Unexpected error during cart initialization:", error);
            showCartError("An unexpected error occurred while initializing the cart.");
        } finally {
             console.log("[Cart Init] Rendering cart after initialization attempt.");
             renderCart(); // Always render the cart UI state, even on failure
             setLoading(false); // Ensure loading is always false after init
        }
    }

     // --- Event Handlers ---

     async function handleAddItemClick(variantId) {
         if (isLoading || !variantId) return;

         let targetCartId = cart?.id;

         // Ensure we have a cart ID
         if (!targetCartId) {
            console.log("No cart ID, initializing cart first...");
            await initializeCart(); // Ensure cart is created/fetched
            targetCartId = cart?.id;
             if (!targetCartId) {
                 alert("Could not initialize cart. Please try again.");
                 return;
             }
         }

         try {
             console.log(`Adding item ${variantId} to cart ${targetCartId}`);
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
                     const ga4Item = {
                         item_id: itemId,
                         item_name: itemName,
                         // item_variant: merchandise.title, // Optionally add variant title
                         price: itemPrice,
                         quantity: quantityAdded
                         // Add other GA4 standard fields if available: item_brand, item_category, etc.
                     };

                     // 3. Push GA4 Data Layer event
                     window.dataLayer = window.dataLayer || [];
                     window.dataLayer.push({
                         event: 'add_to_cart', // Standard GA4 event name
                         eventModel: {
                            currency: updatedCart.cost.totalAmount.currencyCode,
                            value: itemPrice * quantityAdded,
                            items: [ga4Item],
                            // Add transaction_id and user_data as expected by DLVs
                            transaction_id: null, // Typically null for add_to_cart, maybe cart ID?
                            user_data: {} // Placeholder - needs data source if required
                         }
                     });
                     console.log('GA4 dataLayer push for add_to_cart:', window.dataLayer[window.dataLayer.length-1]);


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
                             Brand: '', // Add brand if available
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
                     console.log('Klaviyo _learnq push for Added to Cart:', klaviyoCartData);

                 } else {
                     console.warn("Could not find the added line item in the updated cart to send tracking events.");
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
        console.log('[Cart Debug] setupEventListeners START');

        // Add to Cart Buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                const variant = button.getAttribute('data-variant');
                if (variant && PRODUCT_VARIANTS[variant]) {
                    handleAddItemClick(PRODUCT_VARIANTS[variant]);
                } else {
                    console.error('Invalid variant ID for button:', button);
                }
            });
        });

        // Open Cart Trigger
        const openCartTrigger = document.getElementById('open-cart-trigger');
        if (openCartTrigger) {
            openCartTrigger.addEventListener('click', openDrawer);
        } else {
            console.warn("Element with ID 'open-cart-trigger' not found.");
        }

        // Close Drawer
        closeCartBtn.addEventListener('click', closeDrawer);
        cartOverlay.addEventListener('click', closeDrawer);

        // Checkout Button
        checkoutBtn.addEventListener('click', () => {
            const baseUrl = cart?.checkoutUrl; // Get base URL from cart state
            console.log('[Cart Debug] Checkout button clicked. URL:', baseUrl, 'Cart Quantity:', cart?.totalQuantity); // <-- ADDED LOG
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

            } else if (cart && cart.totalQuantity === 0) {
                showCartError("Your cart is empty."); // Using our new error display
                 // Re-enable button if cart is empty
                 checkoutBtn.disabled = false;
                 checkoutBtn.classList.remove('opacity-50');
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

        // Continue Shopping Button
        const continueShoppingBtn = document.getElementById('continue-shopping-btn');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', closeDrawer);
        } else {
            console.warn("Element with ID 'continue-shopping-btn' not found.");
        }

        // NEW Listener for Main CTAs (including 'Start my payments')
        document.querySelectorAll('.js-main-cta').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior

                // Check if product is already in the cart
                const isProductInCart = cart?.lines?.nodes?.some(
                    line => line.merchandise.id === PRODUCT_VARIANTS.UVO254
                );

                if (isProductInCart) {
                    console.log("Product already in cart, opening drawer.");
                    openDrawer();
                } else {
                    console.log("Product not in cart or cart empty, adding product...");
                    handleAddItemClick(PRODUCT_VARIANTS.UVO254);
                    // handleAddItemClick already opens the drawer on success
                }
            });
        });

        // Page Visibility Handler - Reset checkout button when returning to the page
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log("Page became visible again, resetting checkout button state");
                const checkoutBtn = document.getElementById('checkout-btn');
                if (checkoutBtn) {
                    checkoutBtn.disabled = cart && cart.totalQuantity === 0;
                    checkoutBtn.classList.toggle('opacity-50', cart && cart.totalQuantity === 0);
                    checkoutBtn.textContent = 'Proceed to Checkout';
                }
            }
        });

        // Also handle page load/reload to ensure button is reset
        window.addEventListener('pageshow', (event) => {
            // This catches both normal loads and loads from back/forward cache
            console.log("Page shown (including from back/forward navigation)");
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) {
                checkoutBtn.disabled = cart && cart.totalQuantity === 0;
                checkoutBtn.classList.toggle('opacity-50', cart && cart.totalQuantity === 0);
                checkoutBtn.textContent = 'Proceed to Checkout';
            }
        });

        // Alia Event Listener - Reward Claimed
        document.addEventListener("alia:rewardClaimed", async (e) => {
            if (isLoading) return; // Prevent overlapping updates or actions

           console.log("Alia reward claimed:", e.detail);
           const { rewardText, discountCode } = e.detail;

           if (!discountCode) {
               console.warn("Alia event triggered without a discount code.");
               return;
           }

            // Set expiry timestamp (30 minutes from now)
            const expiryTimestamp = Date.now() + 30 * 60 * 1000;

            // If cart doesn't exist yet, initialize it
            if (!cart) {
                console.log("Cart not initialized yet, creating new cart...");
                try {
                    cart = await createCart();
                    if (!cart) throw new Error("Failed to create cart after Alia event.");
                } catch (error) {
                    console.error("Failed to create cart:", error);
                    showCartError("Could not initialize cart to apply discount."); // Using our new error display
                    return;
                }
            }

            try {
                console.log(`Attempting to apply Alia discount code: ${discountCode} to cart ${cart.id}`);
                const updatedCart = await applyDiscountCode(cart.id, discountCode);

                if (updatedCart) {
                    // Check if the code was *actually* applied successfully in the *updated* cart
                    const isCodeApplied = updatedCart.discountCodes?.some(dc => dc.code === discountCode);

                    if (isCodeApplied) {
                        console.log(`Discount code ${discountCode} successfully applied.`);
                        // SUCCESS: Persist the details and update UI
                        localStorage.setItem(ALIA_CODE_STORAGE_KEY, discountCode);
                        localStorage.setItem(ALIA_TEXT_STORAGE_KEY, rewardText);
                        localStorage.setItem(ALIA_EXPIRY_STORAGE_KEY, expiryTimestamp.toString());

                        cart = updatedCart; // IMPORTANT: Update global cart state
                        renderCart(); // This will call renderAppliedDiscounts

                        // Open drawer only if the cart has items after applying discount
                        if (updatedCart.totalQuantity > 0) {
                             console.log("Opening drawer: Discount applied and cart has items.");
                             openDrawer();
                        } else {
                             console.log("Discount applied, but cart is empty. Drawer remains closed.");
                        }
                    } else {
                        // If the code wasn't in the updatedCart.discountCodes
                        console.error(`Discount code '${discountCode}' was NOT found in updated cart discountCodes.`, updatedCart.discountCodes);
                         throw new Error("Discount code was not applied successfully by Shopify.");
                    }
                } else {
                    // If the mutation itself returned no cart data
                    throw new Error("Failed to update cart with discount code.");
                }

            } catch (error) {
                console.error("Error applying Alia discount code:", error); // Log the actual error
                showCartError(`Could not apply discount: ${error.message}`); // Using our new error display

                // Clear potentially stale storage if application failed
                console.log("Clearing Alia data from localStorage due to application error.");
                localStorage.removeItem(ALIA_CODE_STORAGE_KEY);
                localStorage.removeItem(ALIA_TEXT_STORAGE_KEY);
                localStorage.removeItem(ALIA_EXPIRY_STORAGE_KEY);

                renderAppliedDiscounts(); // Update UI to hide any discount messaging
            }
        });

        // Alia Event Listener - Signup
        document.addEventListener("alia:signup", async (e) => {
            if (isLoading) return;
            console.log("Alia signup event received:", e.detail);
            const { email, phone } = e.detail;

            if (!email && !phone) {
                console.warn("Alia signup event received without email or phone.");
                return;
            }

            // Ensure cart exists
            if (!cart) {
                console.log("Signup event: Cart not initialized, creating...");
                try {
                    cart = await createCart();
                    if (!cart) throw new Error("Failed to create cart for signup event.");
                } catch (error) {
                    console.error("Failed to create cart for signup event:", error);
                    showCartError("Could not initialize cart to save contact info."); // Using our new error display
                    return;
                }
            }

            const buyerIdentity = {};
            if (email) buyerIdentity.email = email;
            if (phone) buyerIdentity.phone = phone; // Assuming Shopify accepts phone in buyerIdentity

            try {
                console.log(`Updating buyer identity for cart ${cart.id}:`, buyerIdentity);
                const data = await callShopifyAPI(CART_BUYER_IDENTITY_UPDATE_MUTATION, {
                    cartId: cart.id,
                    buyerIdentity: buyerIdentity
                });

                if (data?.cartBuyerIdentityUpdate?.cart) {
                    console.log("Buyer identity updated successfully.");
                    cart = data.cartBuyerIdentityUpdate.cart; // Update global cart state
                    // Optionally re-render if needed, though buyer identity isn't usually visible in cart
                    // renderCart();
                } else {
                    console.error("Failed to update buyer identity. Response:", data);
                    throw new Error(data?.cartBuyerIdentityUpdate?.userErrors?.[0]?.message || "Unknown error updating buyer identity.");
                }
            } catch (error) {
                console.error("Error updating buyer identity:", error);
                showCartError(`Could not save contact information: ${error.message}`); // Using our new error display
            }
        });

        // Alia Event Listener - Poll Answered
        document.addEventListener("alia:pollAnswered", async (e) => {
            if (isLoading) return;
            console.log("Alia poll answered event received:", e.detail);
            const { answers } = e.detail;

            if (!answers || answers.length === 0) {
                console.warn("Alia poll answered event received without answers.");
                return;
            }

            // Ensure cart exists
            if (!cart) {
                console.log("Poll event: Cart not initialized, creating...");
                try {
                    cart = await createCart();
                    if (!cart) throw new Error("Failed to create cart for poll event.");
                } catch (error) {
                    console.error("Failed to create cart for poll event:", error);
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
                    console.warn(`Skipping poll attribute due to length limit: Key=${attr.key.substring(0,50)}..., Value=${attr.value.substring(0,50)}...`);
                    return false;
                }
                return true;
            });

            if (validNewPollAttributes.length === 0) {
                 console.log("No valid poll attributes to update after length check.");
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
                console.log(`Updating attributes for cart ${cart.id}:`, mergedAttributes);
                const data = await callShopifyAPI(CART_ATTRIBUTES_UPDATE_MUTATION, {
                    cartId: cart.id,
                    attributes: mergedAttributes // Use the merged list
                });

                if (data?.cartAttributesUpdate?.cart) {
                    console.log("Cart attributes updated successfully with poll answers.");
                    cart = data.cartAttributesUpdate.cart; // Update global cart state
                    // Optionally re-render if needed
                    // renderCart();
                } else {
                    console.error("Failed to update cart attributes. Response:", data);
                    throw new Error(data?.cartAttributesUpdate?.userErrors?.[0]?.message || "Unknown error updating cart attributes.");
                }
            } catch (error) {
                console.error("Error updating cart attributes with poll answers:", error);
                showCartError(`Could not save poll answers: ${error.message}`); // Using our new error display
            }
        });

        // ---- START TEMPORARY ALIA TEST ----
        // Removed Test Alia Trigger Event Listener
        // ---- END TEMPORARY ALIA TEST ----
    }

    // --- Function to Update Experiment Attribute on Existing Cart ---
    async function updateExperimentAttributeIfNeeded() {
        console.log("[AttribUpdate] Checking if experiment attribute needs update...");
        const experimentAttribute = getExperimentAttribute(); // { key: 'experiment_branch', value: '...' } or null

        // If no variant in URL, nothing to do
        if (!experimentAttribute) {
            console.log("[AttribUpdate] No ab_variant found in URL. Skipping update.");
            return;
        }

        // If cart doesn't exist or has no ID yet, creation logic will handle it
        if (!cart || !cart.id) {
            console.log("[AttribUpdate] Cart not yet available. Attribute will be set during creation.");
            return;
        }

        // Ensure cart.attributes is an array (it might be missing if fragment wasn't updated yet)
        const currentAttributes = cart.attributes && Array.isArray(cart.attributes) ? cart.attributes : [];
        const existingAttr = currentAttributes.find(attr => attr.key === experimentAttribute.key);

        // Check if the attribute already exists with the *same* value
        if (existingAttr && existingAttr.value === experimentAttribute.value) {
            console.log(`[AttribUpdate] Cart attribute '${experimentAttribute.key}' already set to '${experimentAttribute.value}'. No update needed.`);
            return;
        }

        // If attribute is missing or has a different value, proceed with update
        console.log(`[AttribUpdate] Updating cart attribute '${experimentAttribute.key}' to '${experimentAttribute.value}'.`);

        // Prepare the new list of attributes:
        // Keep all existing attributes *except* the old experiment_branch, then add the new one.
        const newAttributes = currentAttributes.filter(attr => attr.key !== experimentAttribute.key);
        newAttributes.push(experimentAttribute);

        try {
            const data = await callShopifyAPI(CART_ATTRIBUTES_UPDATE_MUTATION, {
                cartId: cart.id,
                attributes: newAttributes,
            });

            if (data?.cartAttributesUpdate?.cart) {
                console.log("[AttribUpdate] Cart attributes updated successfully.");
                cart = data.cartAttributesUpdate.cart; // Update global cart state
                // Optionally re-render if attributes affect the display, though unlikely here
                // renderCart();
            } else {
                // Handle potential user errors returned from the mutation
                const userErrors = data?.cartAttributesUpdate?.userErrors;
                 if (userErrors && userErrors.length > 0) {
                     console.error('[AttribUpdate] Shopify User Errors during attribute update:', userErrors);
                     throw new Error(`Shopify error during attribute update: ${userErrors[0].message}`);
                 } else {
                     console.error("[AttribUpdate] Cart attribute update API call succeeded but returned no cart data.", data);
                     throw new Error("Cart attribute update failed silently.");
                 }
            }
        } catch (error) {
            console.error("[AttribUpdate] Error updating cart attributes:", error);
            // Show error to user? Depends on how critical this is.
            showCartError("Could not update cart details. Please try again later.");
        }
    }

    // --- Initial Load ---
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('[Cart Debug] DOMContentLoaded event'); 
        try {
            await initializeCart(); // Wait for cart initialization to complete
            // Attribute check is now handled within initializeCart
        } catch (error) {
            console.error("Error during initial setup:", error);
            // Handle critical setup errors if needed
        }
        setupEventListeners(); // Setup click/custom event listeners
        // Initial Lucide icons rendered by lucide-bundle.js
    });

