# LumiClean Landing Pages

This repository contains the landing pages for LumiClean offers, integrating with Shopify for cart and checkout functionality.

## Project Structure

```
LumiClean/
├── dist/                 # Built/minified assets (CSS, JS, HTML) - DO NOT EDIT DIRECTLY
├── js/                   # Source JavaScript files (cart logic, sliders, etc.)
├── src/                  # Source assets (CSS entry point, icons)
├── netlify/              # Netlify functions and edge functions
│   ├── edge-functions/   # Edge functions (e.g., user ID tracking)
│   └── functions/        # Serverless functions (e.g., Shopify proxy)
├── lp/                   # Main landing page source
│   └── index.html
├── lp-adv/               # Landing pages for advertising campaigns
│   ├── v1/
│   │   └── index.html
│   └── v2/
│       └── index.html
├── build.js              # Main build script orchestrator
├── build-*.js            # Individual build tasks (HTML, JS, CSS, etc.)
├── netlify.toml          # Netlify deployment and redirect configuration
├── package.json          # Project dependencies and scripts
└── tailwind.config.js    # Tailwind CSS configuration
```

## Development

1.  **Install Dependencies:** `npm install`
2.  **Run Development Server:** `npm run dev`
    *   This starts a local server (usually configured in `netlify.toml`) with live reloading.
    *   It uses `nodemon` to watch for changes in HTML files, `js/`, `src/`, and `tailwind.config.js`, automatically rebuilding assets and reloading the browser.

## Build Process

*   **Main Build:** `npm run build` (or `node build.js`) executes all build steps.
*   **HTML (`build-html.js`):** Finds all `**/index.html` files (excluding `node_modules`, `dist`, etc.), processes them, and outputs them to the `dist/` directory, maintaining the original folder structure (e.g., `lp/index.html` -> `dist/lp/index.html`).
*   **JavaScript (`build-js.js`):** Minifies all `.js` files found directly in the `js/` directory and outputs them to `dist/js/`.
*   **CSS (`build-tailwind.js`):** Compiles Tailwind CSS based on classes used in HTML/JS files into a main CSS file (`dist/styles.css`).
*   **Deployment:** Netlify typically runs `npm run build` and deploys the `dist/` directory or the root. Check `netlify.toml` for the exact `publish` directory configuration.

## Creating a New Landing Page

To add a new landing page (e.g., for a new campaign):

1.  **Create a Directory:** Add a new folder in the project root (e.g., `lp-new-campaign/`).
2.  **Create HTML File:** Inside the new directory, create an `index.html` file. The build process will automatically discover it. **Recommendation:** Copy the overall structure from an existing page like `lp/index.html` as a starting point.
3.  **Styling:**
    *   Link the main built CSS file in the `<head>` of your new HTML:
        ```html
        <link rel="stylesheet" href="/dist/styles.css">
        ```
    *   Use [Tailwind CSS](https://tailwindcss.com/) utility classes for all styling. Refer to `tailwind.config.js` for theme customizations.

4.  **Tracking & Metadata (`<head>`):**
    *   It is **critical** to replicate the `<head>` section from an existing landing page. This includes:
        *   Meta tags (viewport, charset, title, etc.).
        *   Favicon links.
        *   Font loading (e.g., Google Fonts).
        *   **User ID Script:** An inline script that defines `window.lumi_userId` and works with Netlify edge functions (`create-user-id`, `check-user-id`).
        *   **Elevar Analytics:** The core analytics script.
        *   **Google Tag Manager (GTM):** The standard GTM snippet.
        *   **Other Trackers:** Include any other tracking snippets for services like Mida, Hyros, etc., as found on existing pages.
        *   **Judge.me:** The setup script for product reviews.
        *   **Preloads:** Include `<link rel="preload">` or `<link rel="modulepreload">` tags for critical assets to improve performance.

5.  **JavaScript Loading:**
    *   Follow the script loading strategy at the end of the `<body>` from an existing page. This typically involves:
    *   **Core Logic:** Loading essential scripts like `cart-core.js` and `lucide.min.js`.
        ```html
        <script type="module" src="/js/cart-core.js" defer></script>
        <script defer src="/dist/lucide.min.js"></script>
        ```
    *   **Deferred/Dynamic Loading:** Other non-critical scripts like `cart-drawer.js`, `bundle-selection.js`, and `slider.js` (with `swiper.min.js`) are often loaded dynamically based on user interaction or page load events to improve initial page speed. Replicate this loading mechanism.

6.  **Cart Integration:**
    *   **HTML Structure:** You **must** replicate the HTML structure for the cart drawer from an existing page. The cart scripts rely on specific IDs and classes. Key elements include:
        *   The main drawer (`#cart-drawer`) and overlay (`#cart-overlay`).
        *   Header elements: `#cart-drawer-title`, `#close-cart-btn`.
        *   Content areas: `.cart-items-container`, `#empty-cart-message`.
        *   Loading/Error states: `#cart-loading-overlay`, `#cart-error`.
        *   Summary elements: `#cart-original-total`, `#total-savings-amount`, `#cart-subtotal`, `#checkout-btn`.
        *   Alia discount section: `#alia-discount-section` and its children.
        *   **Item Template:** A hidden template element (`#cart-item-template`) is crucial. It must contain elements with `data-cart-item-*` attributes and buttons with specific classes (`.quantity-minus-btn`, `.quantity-plus-btn`, `.remove-item-btn`) for the cart to render items correctly.
    *   **Triggers:** Ensure elements exist to open the cart (`#open-cart-trigger`) and display the item count (`#cart-item-count`).
    *   **Functionality:** The logic is handled by `js/cart-core.js` and `js/cart-drawer.js`.

7.  **Offer Section Integration:**
    *   Replicate the HTML structure for the offer/bundle selection area.
    *   **Product Slider:** If using a slider, include the Swiper HTML structure (`.swiper`, `.swiper-wrapper`, etc.).
    *   **Bundle Selection:** Use `<label>` elements containing `<input type="radio" name="bundle">`. Each label **must** have a `data-variant-id` attribute corresponding to a Shopify product variant ID.
    *   **Add to Cart Button:** The main "Add to Cart" button **must** have the class `js-main-cta`. The `bundle-selection.js` and `cart-drawer.js` scripts use this to identify the button and get the selected variant.

8.  **Other Components:**
    *   **Reviews:** Include the `div` for the Judge.me review widget (`.jdgm-widget.jdgm-review-widget`).
    *   **Sliders:** For any other sliders (e.g., testimonials), include the required Swiper HTML structure and ensure `slider.js` is loaded.
    *   **Icons:** Use the `<i data-lucide="icon-name"></i>` or similar tag as defined in your project. Icons are rendered by `lucide.min.js`.

9.  **Test:** Run `npm run dev` and navigate to your new page's path (e.g., `/lp-new-campaign/`) to test its appearance, functionality (especially bundle selection and cart), and check the browser's developer console for errors.

## Dependencies

*   **Shopify Storefront API:** Used for all cart and product operations, proxied through a Netlify function.
*   **Tailwind CSS:** Utility-first CSS framework.
*   **Lucide Icons:** Icon library.
*   **Swiper:** Library for sliders and carousels.
*   **Elevar:** Analytics tracking.
*   **Klaviyo:** Email marketing and tracking.
*   **Google Tag Manager (GTM):** Tag management system.
*   **Judge.me:** Product reviews.
*   **Netlify:** Hosting, Serverless Functions, and Edge Functions.

## Environment Variables

The following environment variables need to be set in the Netlify UI for deployment and functions to work correctly.

*   `SHOPIFY_STORE_DOMAIN`: Your Shopify store domain (e.g., `your-store.myshopify.com`).
*   `SHOPIFY_STOREFRONT_API_TOKEN`: Your **public** Storefront API access token. This is used by the `shopify-proxy` function. **Do not commit this token to the repository.**
