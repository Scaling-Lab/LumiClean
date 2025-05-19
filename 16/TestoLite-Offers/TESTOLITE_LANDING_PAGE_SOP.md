# TestoLite Landing Page Implementation SOP

## Overview

This Standard Operating Procedure (SOP) document outlines the process for implementing new TestoLite landing pages on the Netlify-hosted site that uses Shopify storefront API for cart and checkout functionality. This document is based on the successful implementation of the `/saved-my-marriage/` landing page, following the examples of existing pages (`/manhood-reboot/` and `/young-at-52/`).

## Prerequisites

- Access to the TestoLite Offers Site repository
- Node.js and npm installed
- Basic understanding of HTML, CSS, JavaScript, and Tailwind CSS
- Familiarity with Lucide icons
- Access to Cloudinary for image hosting
- Netlify CLI installed in the root project directory (for testing Shopify API integration)

## Implementation Process

### 1. Project Setup and Analysis

1. **Create a backup of the index.html file**
   ```bash
   mkdir -p /path/to/project/new-landing-page/backup
   cp /path/to/project/new-landing-page/index.html /path/to/project/new-landing-page/backup/index.html.bak
   ```

2. **Analyze existing landing pages**
   - Review the structure, components, and functionality of existing pages (`/manhood-reboot/` and `/young-at-52/`)
   - Note the common elements like cart drawer, third-party integrations, and CTA buttons
   - Identify the unique design elements of each page

### 2. Build Process Setup

1. **Set up Tailwind CSS build process**
   - Create a `src` directory in your landing page folder
   ```bash
   mkdir -p /path/to/project/new-landing-page/src
   ```
   
   - Create an `input.css` file with Tailwind directives
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
   
   - Update the project's `tailwind.config.js` to include your new landing page
   ```javascript
   module.exports = {
     content: [
       // Add your new landing page to the content array
       "./new-landing-page/**/*.{html,js}",
       // Keep existing paths
       "./manhood-reboot/**/*.{html,js}",
       "./young-at-52/**/*.{html,js}",
     ],
     // Rest of the configuration...
   }
   ```
   
   - Add a build script to `package.json` for your new landing page
   ```json
   "scripts": {
     "build:css:new-page": "npx tailwindcss -i ./new-landing-page/src/input.css -o ./new-landing-page/css/output.css --minify",
     // Keep existing scripts
   }
   ```

2. **Set up Lucide icons build process**
   - Create a `lucide.js` file in the `src` directory with the icons you need
   ```javascript
   import { createIcons, icons } from 'lucide';

   // List all icons used in your landing page
   export default () => {
     createIcons({
       icons: {
         'CheckCircle': icons.CheckCircle,
         'ArrowRight': icons.ArrowRight,
         'ShieldCheck': icons.ShieldCheck,
         'Award': icons.Award,
         'Headphones': icons.Headphones,
         // Add all icons used in your page
       }
     });
   };
   ```
   
   - Update the `build-icons.mjs` file to include your new landing page
   ```javascript
   // Add your new landing page to the pages array
   const pages = [
     'manhood-reboot',
     'young-at-52',
     'new-landing-page',
   ];
   ```

3. **Install Netlify CLI for local development**
   ```bash
   # Install in the root project directory, not in the page folder
   cd /path/to/project
   npm install netlify-cli --save-dev
   ```

### 3. Content and Design Implementation

1. **Update the HTML structure**
   - Maintain the same overall structure as existing pages
   - Update content to match the new landing page's theme
   - Ensure all sections (hero, benefits, product details, testimonials, etc.) are included

2. **Implement third-party integrations**
   - Add Google Tag Manager
   ```html
   <!-- Google Tag Manager -->
   <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
   new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
   j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
   'https://s.testolite.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
   })(window,document,'script','dataLayer','GTM-TLDF8DXM');</script>
   <!-- End Google Tag Manager -->
   ```
   
   - Add Alia embed
   ```html
   <!-- Alia Embed -->
   <script src="https://backend.alia-cloudflare.com/public/embed.js?shop=6cd006-a1.myshopify.com" async defer></script>
   ```
   
   - Add Hyros tracking
   ```html
   <!-- Hyros Tracking -->
   <script>
     // Hyros tracking code here
   </script>
   ```
   
   - Add Judge.me review widget
   ```html
   <!-- Judge.me Review Widget -->
   <div id="reviews-widget" class="jdgm-widget jdgm-review-widget jdgm-outside-widget container mx-auto px-4 my-16 md:my-24" data-id="8483688972524" data-product-title="testolite"></div>
   ```

3. **Integrate cart drawer component**
   - Copy the cart drawer HTML from existing pages
   - Reference the shared cart.js script with the correct relative path
   ```html
   <!-- cart JS -->
   <script src="../js/cart.js" defer></script>
   ```
   - Ensure all cart-related HTML elements have the correct IDs and classes
   - Make sure all CTA buttons have the `js-main-cta` class for cart functionality

4. **Add favicon**
   - Use the same favicon as other pages
   ```html
   <!-- Favicon -->
   <link rel="icon" sizes="32x32" href="../manhood-reboot/favicon_x32.png">
   <link rel="apple-touch-icon" sizes="180x180" href="../manhood-reboot/favicon_x180.png">
   ```

5. **Implement Footer with Policy Links**
   - Always include the standard legal footer with policy links
   ```html
   <footer class="bg-gray-900 text-gray-400 py-8">
     <div class="container mx-auto px-4 text-center">
       <p class="text-sm mb-4">TestoLite PRO is a general wellness device designed to support natural body functions and promote overall well-being. Individual results may vary. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</p>
       <hr class="border-gray-700 my-6">
       <div class="flex justify-center flex-wrap gap-x-6 gap-y-2 mb-6">
         <a href="https://testolite.com/pages/privacy-policy" class="text-gray-400 hover:text-white underline text-sm">Privacy Policy</a>
         <a href="https://testolite.com/pages/terms-of-service" class="text-gray-400 hover:text-white underline text-sm">Terms of Service</a>
         <a href="https://testolite.com/pages/shipping-policy" class="text-gray-400 hover:text-white underline text-sm">Shipping Policy</a>
         <a href="https://testolite.com/pages/refund-policy" class="text-gray-400 hover:text-white underline text-sm">Return Policy</a>
       </div>
       <p class="text-sm">&copy; 2025 TESTOLITE LLC ALL RIGHTS RESERVED</p>
     </div>
   </footer>
   ```
   - Ensure all four required policy links are included:
     - Privacy Policy
     - Terms of Service
     - Shipping Policy
     - Return Policy
   - Do not change the URLs of the policy links
   - The policy links must be visually distinct and easy to access

6. **Make CTA buttons functional**
   - Add the `js-main-cta` class to all CTA buttons
   ```html
   <a href="#offer" class="inline-block bg-red-600 text-white text-lg font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-red-700 transition duration-300 cta-pulse js-main-cta">
       GET TESTOLITE PRO NOW
   </a>
   ```

7. **Fix benefit section icons**
   - Use only Lucide icons for consistency
   ```html
   <li class="flex items-start">
     <i data-lucide="check-circle" class="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-1"></i>
     <strong>100% Natural, Non-Invasive Approach</strong> – No pills, no prescriptions, no hormones
   </li>
   ```

### 4. Performance Optimization

1. **Optimize Cloudinary images**
   - Add width parameters to control image size
   - Add format and quality auto parameters
   - Add crop parameters when needed
   - Example:
   ```html
   <img src="https://res.cloudinary.com/dg8ibuag5/image/upload/f_auto,q_auto,w_800,c_limit/v1743631879/image.jpg" alt="Description" class="mx-auto rounded-lg shadow-lg mb-8 max-w-xl w-full">
   ```

2. **Implement image lazy loading**
   - Add `loading="lazy"` to all images below the initial viewport
   - Keep the hero image (LCP - Largest Contentful Paint) with `loading="eager"`
   ```html
   <!-- Hero image (eager loading) -->
   <img src="https://res.cloudinary.com/dg8ibuag5/image/upload/f_auto,q_auto,w_800,c_limit/v1743631879/hero.jpg" alt="Hero image" loading="eager">
   
   <!-- Below-the-fold images (lazy loading) -->
   <img src="https://res.cloudinary.com/dg8ibuag5/image/upload/f_auto,q_auto,w_600,c_limit/v1743613225/below-fold.jpg" alt="Below fold image" loading="lazy">
   ```

3. **Perform speed optimizations**
   - Add meta description for SEO
   ```html
   <meta name="description" content="TestoLite PRO - Support healthy male vitality with revolutionary red light technology in just 12 minutes a day. No pills, no injections, just results.">
   ```
   
   - Preload critical assets
   ```html
   <link rel="preload" href="./css/output.css" as="style">
   <link rel="preload" href="https://res.cloudinary.com/dg8ibuag5/image/upload/f_auto,q_auto,w_800,c_limit/v1743631879/hero.jpg" as="image" fetchpriority="high">
   ```
   
   - Add preconnect links to external domains
   ```html
   <link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```
   
   - Defer non-critical scripts
   ```html
   <script src="./js/inventory-manager.js" defer></script>
   <script src="../js/alia-tracker.js" defer></script>
   <script src="./js/lucide-bundle.js" defer></script>
   ```

### 5. Testing and Debugging

1. **Testing Cart Functionality**
   - Serve the page locally
   ```bash
   npx serve -s /path/to/project/new-landing-page
   ```
   
   - Verify that the cart drawer opens when clicking CTA buttons
   - Check that the cart UI displays correctly
   - Test adding items to cart
   - Verify that the checkout button works
   - Check browser console for any cart-related errors

2. **Debugging JavaScript Errors**
   - Always check the browser console for errors
   - Common issues and solutions:
     - **Script path issues**: Ensure all script paths are correct
       - Use `../js/` for shared files (e.g., `../js/cart.js`, `../js/alia-tracker.js`)
       - Use `./js/` for page-specific files (e.g., `./js/lucide-bundle.js`)
     - **DOM loading issues**: Ensure scripts are loaded in the correct order
     - **Missing elements**: Verify all element IDs referenced in JavaScript exist in the HTML
     - **Undefined variables**: Check for typos or missing script includes
   
   - **IMPORTANT: Cart Functionality Implementation**
     - Do NOT modify the shared cart.js file in the root js directory
     - Do NOT copy cart.js to the landing page's js directory
     - Simply include the shared cart.js file with the correct relative path:
     ```html
     <!-- cart JS -->
     <script src="../js/cart.js" defer></script>
     ```
     - Ensure all CTA buttons have the `js-main-cta` class:
     ```html
     <a href="#offer" class="js-main-cta">GET TESTOLITE PRO NOW</a>
     ```
     - Make sure all cart drawer HTML elements have the correct IDs:
       - `cart-drawer` for the drawer container
       - `cart-overlay` for the background overlay
       - `close-cart-btn` for the close button
     - The shared cart.js file already handles all cart initialization and functionality
     - No additional cart initialization scripts are needed

3. **Visual Testing**
   - Test on multiple screen sizes (mobile, tablet, desktop)
   - Verify that all images load correctly
   - Check that animations and transitions work smoothly
   - Compare with backup for design consistency
   ```bash
   diff -u /path/to/project/new-landing-page/backup/index.html.bak /path/to/project/new-landing-page/index.html
   ```

4. **Performance Testing**
   - Use browser developer tools to check for:
     - JavaScript errors in console
     - Network requests and loading times
     - Memory usage and performance bottlenecks
   - Run Lighthouse tests for performance, accessibility, SEO, and best practices
   - Aim for a Google PageSpeed score of 80+ on mobile

### 6. Finalization

1. **Run build process**
   ```bash
   npm run build:css:new-page
   npm run build
   ```

2. **Create documentation of any changes or issues encountered**

3. **Compress and share the final project files**
   ```bash
   zip -r new-landing-page.zip /path/to/project/new-landing-page
   ```

## Common Pitfalls and Solutions

1. **Missing Lucide icons**
   - Issue: Lucide icons not displaying
   - Solution: 
     - Ensure the icon is included in the lucide.js config file
     - Verify lucide.createIcons() is called after DOM is loaded
     - Check browser console for errors related to missing icons
     - **IMPORTANT**: Update the build-icons.mjs file to include all required icons in the specific landing page's icons object
     - Run `node build-icons.mjs` to rebuild the Lucide icons bundle after making changes

2. **Cart drawer not working**
   - Issue: Cart drawer doesn't open when clicking CTA buttons
   - Solution: 
     - Verify script paths are correct (../js/cart.js, not ./js/cart.js)
     - Check that CTA buttons have the js-main-cta class
     - Verify all cart drawer HTML elements have the correct IDs
     - Check browser console for errors related to missing elements
     - Do NOT create a separate cart initialization script - the shared cart.js already handles this
     - Ensure inventory-manager.js is properly included if referenced by cart.js
     - Use Netlify CLI in dev mode to test cart functionality with Netlify functions

3. **Responsive design issues**
   - Issue: Layout breaks on mobile or desktop
   - Solution:
     - Use Tailwind's responsive classes consistently
     - Test on multiple viewport sizes during development
     - Use browser developer tools to simulate different devices

4. **Slow page load**
   - Issue: Poor PageSpeed score
   - Solution:
     - Optimize images with Cloudinary parameters
     - Implement lazy loading for below-the-fold images
     - Defer non-critical scripts
     - Preload critical assets
     - Minimize inline JavaScript and CSS

5. **Shared files modification**
   - Issue: Temptation to modify shared files like cart.js
   - Solution:
     - NEVER modify shared files
     - NEVER copy shared files to the landing page's js directory
     - Always use proper relative paths to reference shared files (../js/)
     - If page-specific functionality is needed, create separate files that work with (not replace) the shared files

6. **Netlify functions not working locally**
   - Issue: 501 errors when testing cart functionality locally
   - Solution:
     - Install Netlify CLI globally: `npm install -g netlify-cli`
     - Run Netlify in dev mode: `netlify dev`
     - Test the site through the Netlify dev server (typically http://localhost:8888)
     - This allows proper testing of Netlify functions that handle Shopify API calls

7. **Discount application issues**
   - Issue: Discount not applying correctly in cart
   - Solution:
     - Verify the discount code is being properly passed to the cart.js
     - Check that the discount messaging appears in the cart drawer
     - Test the full flow: open popup, enter email, apply discount, check cart
     - Ensure all event listeners for discount application are properly set up

8. **Missing Policy Links**
   - Issue: Policy links missing from footer or linking to incorrect URLs
   - Solution:
     - Always include all four required policy links in the footer:
       - Privacy Policy
       - Terms of Service
       - Shipping Policy
       - Return Policy
     - Verify the links use the correct URLs:
       - https://testolite.com/pages/privacy-policy
       - https://testolite.com/pages/terms-of-service
       - https://testolite.com/pages/shipping-policy
       - https://testolite.com/pages/refund-policy
     - Position the links in a clearly visible area in the footer section
     - This is a legal requirement for all landing pages

## Tips for Faster Implementation

1. **Use existing pages as templates**
   - Copy the structure from existing pages and modify the content
   - Reuse common components like the cart drawer and footer

2. **Optimize image workflow**
   - Prepare all images in advance with appropriate dimensions
   - Use consistent naming conventions for Cloudinary images

3. **Test incrementally**
   - Build and test one section at a time
   - Verify functionality after each major change
   - Always check the browser console for errors

4. **Automate repetitive tasks**
   - Create shell scripts for common operations
   - Use find and replace for updating multiple instances of the same content

## Conclusion

Following this SOP will ensure consistent implementation of TestoLite landing pages with optimal performance and functionality. Each new landing page should maintain the same high standards of design, performance, and user experience while allowing for unique content and messaging.

Remember to always check for JavaScript errors in the browser console and test all functionality thoroughly before finalizing the implementation. Never modify shared files, and always use the existing cart.js file without creating unnecessary additional scripts.
