# TestoLite PRO Landing Page

This repository contains the landing page for TestoLite PRO.

## Directory Structure

The project is organized with the following structure:

```
TestoLite-Offers/
├── manhood-reboot/         # Main landing page directory
│   ├── index.html         # Main landing page
│   ├── css/               # Compiled CSS files
│   │   └── output.css     # Generated CSS file
│   ├── js/                # Compiled JavaScript files
│   │   └── lucide-bundle.js # Tree-shaken Lucide icons bundle (6KB)
│   └── src/               # Source files
│       ├── input.css      # Tailwind source CSS
│       └── lucide.js      # Lucide icons entry point with tree-shaking
├── young-at-52/           # Secondary landing page directory
│   ├── index.html         # Young-at-52 landing page
│   ├── css/               # Page-specific CSS
│   ├── js/                # Page-specific JavaScript
│   │   └── inventory-manager.js # Inventory management script
│   └── src/               # Source files
├── js/                    # Shared JavaScript files for all landing pages
│   ├── cart.js            # Shared cart functionality for all pages
│   └── alia-tracker.js    # Shared Alia event tracking for all pages
├── tailwind.config.js     # Tailwind configuration
├── webpack.config.js      # Webpack configuration with tree-shaking
├── package.json           # NPM package configuration
└── netlify.toml           # Netlify deployment configuration
```

## Technologies Used

- **Tailwind CSS** for styling
- **Lucide Icons** for SVG icons (optimized with tree-shaking)
- **Webpack** for JavaScript bundling and optimization
- **Babel** for JavaScript transpilation
- **Alia** for lead generation and discounts
- **Shopify** for e-commerce functionality

## Performance Optimizations

- **Tree-shaking for Lucide icons**: Only includes the specific icons used in the project (reduced from 319KB to 6KB)
- **CSS optimization**: Tailwind's purge feature removes unused CSS
- **Minification**: Both CSS and JavaScript are minified for production
- **Shared components**: Core functionality like cart and Alia tracking is shared across all landing pages

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server with live CSS rebuilding:
   ```bash
   npm run watch:css
   ```

3. Build JavaScript when you make changes:
   ```bash
   npm run build:js
   ```

4. Open `manhood-reboot/index.html` or `young-at-52/index.html` in your browser.

## Build for Production

To build both CSS and JavaScript for production:

```bash
npm run build
```

This will:
1. Generate a minified CSS file for each landing page
2. Bundle and tree-shake Lucide icons for each landing page
3. Compile shared scripts used across landing pages

## Tailwind CLI Commands

If you need to run Tailwind commands directly:

1. For production build:
   ```bash
   npx @tailwindcss/cli -i ./manhood-reboot/src/input.css -o ./manhood-reboot/css/output.css --minify
   ```

2. For watch mode during development:
   ```bash
   npx @tailwindcss/cli -i ./manhood-reboot/src/input.css -o ./manhood-reboot/css/output.css --watch
   ```

## Adding New Icons

If you need to add new Lucide icons to the project:

1. Identify the icon name from the [Lucide icon list](https://lucide.dev/icons)
2. Import the icon in `manhood-reboot/src/lucide.js`:
   ```javascript
   import { NewIcon } from 'lucide';
   ```
3. Add it to the `iconMap` object:
   ```javascript
   const iconMap = {
     // existing icons...
     'new-icon': NewIcon
   };
   ```
4. Rebuild the JavaScript bundle:
   ```bash
   npm run build:js
   ```

## Netlify Deployment

This project is configured for automatic deployment on Netlify. The `netlify.toml` file sets up the build process to generate all assets.

When you push changes to the repository, Netlify will:
1. Install dependencies
2. Run the build command (npm run build)
3. Deploy the site with all landing pages

## Shared Components

### Alia Event Tracker (`js/alia-tracker.js`)

The `alia-tracker.js` script provides standardized event tracking for Alia promotional popups across all landing pages.

#### Features

- Tracks all five Alia events:
  - `alia:popupView` - When a popup is viewed
  - `alia:popupClose` - When a popup is closed
  - `alia:signup` - When a user submits a form with email/phone
  - `alia:pollAnswered` - When a user answers a survey question
  - `alia:rewardClaimed` - When a user claims a reward/discount
- Sends events to the dataLayer for Google Tag Manager
- Uses the DOM custom event pattern (document.addEventListener) as recommended by Alia documentation
- Provides robust error handling and debugging

#### Implementation

1. To implement in a new landing page:
   ```html
   <!-- Include at the end of the body -->
   <script src="../js/alia-tracker.js"></script>
   ```

2. Ensure the Alia embed script is also included in the page head:
   ```html
   <script src="https://backend.alia-cloudflare.com/public/embed.js?shop=6cd006-a1.myshopify.com" async></script>
   ```

3. Required HTML elements for Alia discount display (within the cart drawer):
   ```html
   <!-- Alia Discount Section -->
   <div id="alia-discount-section" class="hidden bg-blue-50 p-3 rounded border border-blue-200 mb-2 transition-all duration-300 ease-in-out">
       <p class="text-base font-semibold text-blue-700 mb-1">Signup Offer Applied!</p>
       <div class="flex justify-between items-center text-base mb-1 text-blue-600">
           <span id="alia-reward-text">Reward Text</span>
           <span id="alia-discount-code" class="font-mono bg-blue-100 px-2 py-0.5 rounded text-sm">CODE</span>
       </div>
       <div class="flex justify-between items-center text-sm text-red-600 font-medium">
           <span>Offer ends in:</span>
           <span id="alia-timer" class="font-semibold tabular-nums">30:00</span>
       </div>
   </div>

   <!-- Alia Expired Message -->
   <div id="alia-expired-message" class="hidden bg-yellow-50 p-2 rounded border border-yellow-300 mb-2 text-center">
       <p class="text-sm font-medium text-yellow-700">Discount code expired.</p>
   </div>
   ```

#### Debugging

The script provides extensive console logging for debugging:
- Event reception: `[Alia Tracker] Event received: alia:popupView`
- DataLayer pushes: `[Alia Tracker] Successfully pushed to dataLayer: alia_popupview`
- Initialization: `[Alia Tracker] Initializing Alia event tracking`

### Shopping Cart (`js/cart.js`)

This shared script provides a dynamic, asynchronous shopping cart experience using Shopify's Storefront API (AJAX).

#### Features

- Adding items to the cart
- Removing items from the cart
- Updating item quantities
- Displaying cart contents in a slide-out drawer
- Applying discount codes (including handling Alia integration)
- Persisting cart state across sessions (using `localStorage`)
- Tracking events (GA4, Klaviyo, Alia)
- Displaying loading states and error messages

#### HTML Structure Requirements

The following HTML elements and structure **must** be present on the page for `cart.js` to function correctly. IDs are crucial for the script to find elements.

1.  **Cart Trigger Button (Optional but Recommended):**
    - A button to manually open the cart drawer.
    - Must have `id="open-cart-trigger"`.
    - Should contain an element with `id="cart-item-count"` to display the number of items.
    ```html
    <button id="open-cart-trigger" class="...">
        <i data-lucide="shopping-cart" class="..."></i>
        <span id="cart-item-count" class="...">0</span>
    </button>
    ```

2.  **Cart Overlay:**
    - A `div` to cover the page content when the drawer is open.
    - Must have `id="cart-overlay"`.
    ```html
    <div id="cart-overlay" class="fixed inset-0 bg-black/50 z-[9999] hidden ..."></div>
    ```

3.  **Cart Drawer Container:**
    - The main container for the slide-out drawer.
    - Must have `id="cart-drawer"`.
    - Must contain the Header, Content Wrapper (which includes Items Container and Footer), and Loading Overlay.
    ```html
    <div id="cart-drawer" class="fixed ... z-[10000] flex flex-col ...">
        <!-- Header -->
        <div class="...">
            <h2 class="...">Your Cart</h2>
            <button id="close-cart-btn" class="...">
                <i data-lucide="x" class="..."></i>
            </button>
        </div>

        <!-- Loading Overlay -->
        <div id="cart-loading-overlay" class="absolute inset-0 ... hidden">
            <!-- Spinner icon -->
            <i data-lucide="loader-2" class="... animate-spin"></i>
        </div>

        <!-- Content Wrapper -->
        <div id="cart-content-wrapper" class="...">
            <!-- Items Container -->
            <div class="... cart-items-container ...">
                <!-- Empty cart Message -->
                <div id="empty-cart-message" class="... hidden">
                    <i data-lucide="shopping-cart" class="..."></i>
                    <p class="...">Your cart is currently empty.</p>
                    <button id="continue-shopping-btn" class="...">Continue Shopping</button>
                 </div>
                <!-- cart Item Template (Hidden by default) -->
                <div class="cart-item hidden" id="cart-item-template">
                    <img data-cart-item-image src="..." alt="..." class="...">
                    <div>
                        <h3 data-cart-item-name class="...">Product Name</h3>
                        <!-- Quantity Controls -->
                        <div class="...">
                            <button class="quantity-btn quantity-minus-btn ..." data-line-id="">
                                <i data-lucide="minus" class="..."></i>
                            </button>
                            <span data-cart-item-quantity class="...">1</span>
                            <button class="quantity-btn quantity-plus-btn ..." data-line-id="">
                                <i data-lucide="plus" class="..."></i>
                            </button>
                        </div>
                        <!-- Price -->
                        <div>
                            <span data-cart-item-price class="...">$0.00</span>
                            <span data-cart-item-original-price class="...">$0.00</span>
                        </div>
                    </div>
                    <button class="remove-item-btn ..." data-item-id="">
                        <i data-lucide="trash-2" class="..."></i>
                    </button>
                </div>
                <!-- Dynamically added cart items appear here -->
            </div>

            <!-- Footer -->
            <div class="p-4 border-t ... bg-gray-50 flex-shrink-0">
                <!-- Price Breakdowns -->
                <div class="..."><span>Original Price:</span><span id="cart-original-total">$0.00</span></div>
                <div class="..."><span>Limited Introductory Discount:</span><span id="initial-discount-amount">-$0.00</span></div>
                
                <!-- Alia Discount Sections -->
                <div id="alia-discount-section" class="hidden bg-blue-50 p-3 rounded border border-blue-200 mb-2 transition-all duration-300 ease-in-out">
                    <p class="text-base font-semibold text-blue-700 mb-1">Signup Offer Applied!</p>
                    <div class="flex justify-between items-center text-base mb-1 text-blue-600">
                        <span id="alia-reward-text">Reward Text</span>
                        <span id="alia-discount-code" class="font-mono bg-blue-100 px-2 py-0.5 rounded text-sm">CODE</span>
                    </div>
                    <div class="flex justify-between items-center text-sm text-red-600 font-medium">
                        <span>Offer ends in:</span>
                        <span id="alia-timer" class="font-semibold tabular-nums">30:00</span>
                    </div>
                </div>

                <!-- Alia Expired Message -->
                <div id="alia-expired-message" class="hidden bg-yellow-50 p-2 rounded border border-yellow-300 mb-2 text-center">
                    <p class="text-sm font-medium text-yellow-700">Discount code expired.</p>
                </div>
                
                <!-- Savings & Subtotal -->
                <div class="..."><span>Total Savings:</span><span id="total-savings-amount">-$0.00</span></div>
                <div class="..."><span>Final Price:</span><span id="cart-subtotal">$0.00</span></div>
                <div id="installment-info" class="..."></div>
                <!-- Shipping & Trust -->
                <div class="..."> <!-- Shipping Notice --> </div>
                <div class="..."> <!-- Trust Badges --> </div>
                <!-- Checkout Button -->
                <button id="checkout-btn" data-checkout-url="" class="...">
                    Proceed to Checkout
                </button>
                <p class="...">Taxes calculated at checkout.</p>
            </div>

            <!-- Error Message Container -->
            <div id="cart-error" class="hidden p-3 m-4 bg-red-100 ... flex-shrink-0">
                <p class="flex items-center">
                    <i data-lucide="alert-circle" class="..."></i>
                    <span id="cart-error-message">Error message will appear here</span>
                </p>
            </div>
        </div> <!-- End Content Wrapper -->
    </div> <!-- End cart Drawer -->
    ```

4.  **Add-to-Cart Buttons:**
    - Any button/link meant to add the main product must have the class `js-main-cta`.
    - `cart.js` specifically looks for `TESTOLITE_PRO_VARIANT_ID` (defined internally) when these buttons are clicked.

## Creating New Landing Pages

When creating a new landing page, follow these steps to ensure compatibility with the shared components:

1. **Copy an existing landing page structure** (e.g., young-at-52)
2. **Include the shared scripts**:
   ```html
   <script src="../js/cart.js" defer></script>
   <script src="../js/alia-tracker.js"></script>
   ```
3. **Ensure all required HTML elements exist**, especially:
   - Alia discount section elements with proper IDs
   - Cart drawer elements with proper IDs
   - CTAs with the proper classes (js-main-cta)
4. **Customize the content** while maintaining the structure of shared elements
5. **Test all integrations** to ensure everything works:
   - Cart functionality (add, remove, update)
   - Alia discounts (applied, displayed, persisted)
   - Analytics tracking (GA4, Klaviyo)

## Troubleshooting Common Issues

### Alia Discounts Not Showing

If Alia discounts aren't showing in the cart:

1. Ensure the HTML structure includes all required Alia elements:
   - `alia-discount-section`
   - `alia-reward-text`
   - `alia-discount-code`
   - `alia-timer`
   - `alia-expired-message`

2. Check the browser console for errors like:
   ```
   TypeError: Cannot set properties of null (getting 'textContent')
   ```
   This typically means a required element is missing.

3. Ensure you're using the shared alia-tracker.js script and not a local implementation.

### Cart Issues

For cart-related issues:

1. Check that the cart drawer HTML structure matches exactly what cart.js expects.
2. Verify the cart.js script is properly loaded.
3. Ensure all item buttons have the correct class (js-main-cta).
4. Check the browser console for AJAX errors that might indicate Shopify API issues.

## Tips for Development

- Add custom styles to `landing-page/src/input.css` instead of using inline styles or a separate stylesheet
- The Tailwind configuration includes forms, typography, and aspect-ratio plugins
- When adding new HTML files, make sure to include links to the compiled assets:
  ```html
  <link href="./css/output.css" rel="stylesheet">
  <script src="./js/lucide-bundle.js"></script>
  ```
- Always test thoroughly on both desktop and mobile devices
- Ensure all shared components are properly integrated before deployment

## JavaScript Best Practices

### Script Loading Order

To ensure proper functionality, scripts should be loaded in the following order:

1. **Lucide Icons**: Load first since other scripts depend on these icons
   ```html
   <script src="./js/lucide-bundle.js" defer></script>
   ```

2. **Shared Core Functionality**: Load shared scripts next
   ```html
   <script src="../js/alia-tracker.js" defer></script>
   <script src="../js/cart.js" defer></script>
   ```

3. **Page-Specific Scripts**: Load page-specific scripts last
   ```html
   <script src="./js/inventory-manager.js" defer></script>
   ```

4. **Initialization**: Initialize page-specific functionality when the DOM is ready
   ```html
   <script>
     document.addEventListener('DOMContentLoaded', function() {
       // Initialize inventory manager
       if (typeof InventoryManager === 'function') {
         // Initialize inventory functionality
       }
       
       // Other page-specific initialization...
     });
   </script>
   ```

### Lucide Icons Initialization

The `lucide-bundle.js` script automatically initializes itself by attaching a DOMContentLoaded event listener that calls `lucide.createIcons()`. You don't need to manually initialize it:

1. **Best Practice**: Simply include the script with the defer attribute
   ```html
   <script src="./js/lucide-bundle.js" defer></script>
   ```

2. **Common Mistakes to Avoid**:
   - **Duplicate Initialization**: Don't call `lucide.createIcons()` manually as this will initialize icons twice
   - **Incorrect Script Order**: Still ensure `lucide-bundle.js` is loaded early in the script order as other scripts may depend on the icons being initialized

### Judge.me Review Widget

For proper display of the Judge.me reviews:

1. **Script Initialization**: Add the Judge.me script in the head section of your HTML file
   ```html
   <!-- Judge.me Reviews Widget Script -->
   <script>jdgm = window.jdgm || {};jdgm.SHOP_DOMAIN = '6cd006-a1.myshopify.com';jdgm.PLATFORM = 'shopify';jdgm.PUBLIC_TOKEN = 'vS_m7hgYQ5_GTO2IZE5lODZxM3w';</script>
   <script data-cfasync='false' type='text/javascript' async src='https://cdn.judge.me/widget_preloader.js'></script>
   ```

2. **Widget Placement**: Place the widget within the main content area, not at the end of the body
   ```html
   <!-- Inside your main content, typically before the footer -->
   <div id="reviews-widget" class="jdgm-widget jdgm-review-widget jdgm-outside-widget container mx-auto px-4 my-16 md:my-24" data-id="8483688972524" data-product-title="testolite"></div>
   ```

3. **Common Mistakes to Avoid**:
   - Missing script initialization in the head section (most common reason for widgets not displaying)
   - Duplicate widget instances in the page
   - Incorrect data-id attribute that doesn't match your product ID
   - Placing the widget div outside the visible content area

### Centralizing JavaScript

For maintainability, consider centralizing initialization code into a single script block:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize inventory manager
    if (typeof InventoryManager === 'function') {
      // Initialize inventory functionality
    }
    
    // Other page-specific initialization...
  });
</script>
```

This approach:
- Prevents race conditions between scripts
- Makes debugging easier
- Reduces the risk of duplicate initializations