# LumiClean Offer Landing Pages

This repository contains the landing pages for Uvlizer offers, integrating with Shopify for cart and checkout functionality.

## Project Structure

```
LumiClean-offer/
├── dist/                 # Built/minified assets (CSS, JS, HTML) - DO NOT EDIT DIRECTLY
├── js/                   # Source JavaScript files (cart logic, API calls, etc.)
├── src/                  # Source assets (CSS entry point, icons)
├── netlify/              # Netlify functions and edge functions
│   ├── edge-functions/   # Edge functions (e.g., user ID tracking)
│   └── functions/        # Serverless functions (e.g., Shopify proxy)
├── lp-applovin/          # Example Landing Page directory
│   └── index.html        # Specific LP HTML
├── lp-google/            # Example Landing Page directory
│   └── index.html        # Specific LP HTML
├── index.html            # Main/default landing page HTML
├── build.js              # Main build script orchestrator
├── build-*.js            # Individual build tasks (HTML, JS, CSS, etc.)
├── netlify.toml          # Netlify deployment and redirect configuration
├── package.json          # Project dependencies and scripts
└── tailwind.config.js    # Tailwind CSS configuration
```

## Development

1.  **Install Dependencies:** `npm install`
2.  **Run Development Server:** `npm run dev`
    *   This starts a local server (usually on port 3000 or as specified in `netlify.toml`) with live reloading.
    *   It uses `nodemon` to watch for changes in HTML files, `js/`, `src/`, and `tailwind.config.js`, automatically rebuilding assets and reloading the browser.

## Build Process

*   **Main Build:** `npm run build` (or `node build.js`) executes all build steps.
*   **HTML (`build-html.js`):** Finds all `**/index.html` files (excluding `node_modules`, `dist`, etc.), processes them, and outputs them to the `dist/` directory, maintaining the original folder structure (e.g., `lp-google/index.html` -> `dist/lp-google/index.html`).
*   **JavaScript (`build-js.js`):** Minifies all `.js` files found directly in the `js/` directory and outputs them to `dist/js/`.
*   **CSS (`build-tailwind.js`):** Compiles Tailwind CSS based on classes used in HTML/JS files into a main CSS file (likely `dist/styles.css`).
*   **Deployment:** Netlify runs `npm run build` and deploys the root directory (`./`), which means URLs will typically correspond to the structure in `dist/`.

## Creating a New Landing Page

To add a new landing page (e.g., for a new campaign):

1.  **Create a Directory:** Add a new folder in the project root (e.g., `lp-new-campaign/`).
2.  **Create HTML File:** Inside the new directory, create an `index.html` file (e.g., `lp-new-campaign/index.html`). This is the main file for your landing page. The build process will automatically discover this file. **Recommendation:** Copy the overall structure, `<head>`, cart drawer template, and offer section HTML from `index.html` as a starting point.
3.  **Styling:**
    *   Link the main built CSS file in the `<head>` of your new HTML:
        ```html
        <link rel="stylesheet" href="/dist/styles.css">
        ```
    *   Use [Tailwind CSS](https://tailwindcss.com/) utility classes for styling. Refer to `tailwind.config.js` for theme customizations.
    *   Be aware of minor inline styles in `index.html's `<head>` related to scroll behavior and specific component visibility/styling.
4.  **Tracking & Metadata (`<head>`):**
    *   It is **critical** to include all necessary tracking and metadata scripts/tags in the `<head>` as found in `index.html`. This includes:
        *   Meta tags (viewport, charset, title).
        *   Favicon links.
        *   Font loading (e.g., Google Fonts `Inter`).
        *   **User ID Script:** The inline script that defines `window.uvl_userId` and `window.ElevarUserIdFn`. **Crucially, this MUST come *before* the Elevar script.**
        *   **Elevar Analytics:** The script loaded via module import (`/elevar/...`).
        *   **Google Tag Manager (GTM):** The standard GTM snippet (`GTM-KVTMT9D`).
        *   **Other Trackers:** Include snippets for Mida (`cdn.mida.so`), Hyros (`hy.uvlizer.co`), etc., as seen in `index.html`.
        *   **Judge.me:** The setup script defining `jdgm` and the lazy-loaded widget script using `requestIdleCallback`.
        *   **Preloads:** Include relevant `<link rel="modulepreload">` or `<link rel="preload">` tags for important assets (like `cart-drawer.js`).
5.  **JavaScript Loading:**
    *   **Critical JS:** Load these scripts deferred at the end of the `<body>`:
        ```html
        <script type="module" src="/js/cart-core.js" defer></script>
        <script defer src="/dist/lucide.min.js"></script> <!-- For icons -->
        ```
    *   **Non-Critical JS (Deferred Loading):** Replicate the dynamic loading strategy from `index.html` for performance. This uses `PerformanceObserver` (LCP), interaction events, and the `load` event to trigger loading of:
        *   `/js/cart-drawer.js` (module)
        *   `/js/bundle-selection.js` (module)
        *   `/dist/swiper.min.js` (UMD script), which then imports `/js/slider.js` (module).
    *   **Inline/Utility Scripts:** Include necessary inline scripts found at the end of `index.html's `<body>`, such as:
        *   Mobile menu toggle script.
        *   Date updater script (for elements with class `.current-date`).
        *   Discount calculation script (for offer sections).
6.  **Cart Integration:**
    *   **HTML Structure:** You **must** replicate the HTML structure for the cart drawer found in `index.html`. This includes:
        *   The overlay (`#cart-overlay`) and the main drawer element (`#cart-drawer`).
        *   Elements within the drawer: loading overlay (`#cart-loading-overlay`), header (`#cart-drawer-title`, `#close-cart-btn`), error display (`#cart-error`), discount section (`#alia-discount-section`), empty message (`#empty-cart-message`), items container (`.cart-items-container`), summary (`#cart-original-total`, `#total-savings-amount`, `#cart-subtotal`, `#checkout-btn`).
        *   **Crucially:** The hidden cart item template (`#cart-item-template`). This template needs precise `data-cart-item-*` attributes (`image`, `name`, `quantity`, `price`, `original-price`) and button classes (`.quantity-minus-btn`, `.quantity-plus-btn`, `.remove-item-btn`) for `cart-drawer.js` to render items correctly.
    *   **Triggers:** Ensure elements exist to open the cart (e.g., `#open-cart-trigger`) and display the item count (`#cart-item-count`).
    *   **Initialization:** The core logic is handled by the included JS files (`cart-core.js`, `cart-drawer.js`).
7.  **Offer Section Integration (`#offer`, `#offer-mobile`):**
    *   Replicate the HTML structure for the mobile and desktop offer sections from `index.html`.
    *   **Product Slider:** Include the Swiper HTML structure (`.product-slider`, `.swiper-wrapper`, `.swiper-slide`, navigation buttons `.product-prev`/`.product-next`, pagination `.swiper-pagination`).
    *   **Bundle Selection:** Use `<label>` elements containing `<input type="radio" name="bundle">`. Each label **must** have a `data-variant-id` attribute corresponding to a Shopify product variant ID.
    *   **Add to Cart Button:** The main CTA button **must** have the class `js-main-cta`. `bundle-selection.js` uses this class to identify the button and get the selected `data-variant-id`.
    *   **Judge.me Badge:** Include the div for the Judge.me preview badge (`.jdgm-widget.jdgm-preview-badge`).
    *   **Discount Display:** Ensure the structure for compare-at prices (`p.line-through`) and current prices (`p.font-bold`) exists within the bundle labels, and include the inline discount calculation script.
8.  **Other Components:**
    *   **Judge.me Reviews:** Include the div for the main review widget (`.jdgm-widget.jdgm-review-widget`).
    *   **Sliders:** If using testimonial or other sliders, include the relevant Swiper HTML structure and ensure `/js/slider.js` is loaded.
    *   **Icons:** Use `<svg data-lucide="icon-name">` where needed. Lucide icons are initialized by the deferred `lucide.min.js` script.
9.  **Tracking (Runtime):**
    *   The included cart scripts (`cart-drawer.js`, `cart-core.js`) automatically push ecommerce events (add to cart, remove from cart, view cart) to `window.ElevarDataLayer` if it exists (which should be initialized by the Elevar script in the `<head>`).
    *   User ID tracking relies on the edge functions (`create-user-id.ts`, `check-user-id.ts`) defined in `netlify.toml` and the inline script in the `<head>`.

10. **Test:** Run `npm run dev` and navigate to your new page's path (e.g., `/lp-new-campaign/`) to test its appearance, functionality (especially bundle selection, add-to-cart, cart drawer), and tracking integrations. Check the browser's developer console for errors.

## Dependencies

*   **Shopify Storefront API:** Used for cart operations via the Netlify proxy function.
*   **Tailwind CSS:** Utility-first CSS framework.
*   **Lucide Icons:** Icon library.
*   **Swiper:** Slider/carousel library.
*   **Elevar:** Analytics tracking.
*   **Google Tag Manager (GTM):** Tag management system.
*   **Judge.me:** Product reviews.
*   **Mida:** A/B testing / Optimization.
*   **Hyros:** Tracking script.
*   **Netlify:** Hosting, Functions, Edge Functions, redirects.

## Environment Variables

*   `SHOPIFY_STORE_DOMAIN`: Your Shopify store domain (e.g., `your-store.myshopify.com`). Set in `netlify.toml` for build time, potentially needed in Netlify UI for runtime functions.
*   `SHOPIFY_STOREFRONT_API_TOKEN`: Your **public** Storefront API access token. This should be stored securely as a Netlify environment variable, accessible by the `shopify-proxy` function. **Do not commit this token directly.**
*   Other potential variables for tracking IDs etc. might be needed. 