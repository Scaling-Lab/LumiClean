// // Track components and stylesheets loading
// let componentsLoaded = 0;
// const totalComponents = document.getElementsByTagName("include").length;
// const stylesheets = {
//   'v3': 'v3/lumiclean-section.css',
//   'v4': 'v4/styles.css',
//   'v5': 'v5/styles.css',
//   'v6': 'v6/styles.css',
//   'v7': 'v7/styles.css',
//   'v8': 'v8/styles.css',
//   'v9': 'v9/styles.css',
//   'v10': 'v10/styles.css',
//   'v11': 'v11/styles.css',
//   'v12': 'v12/styles.css',
//   'footer': 'footer/styles.css'
// };
//
// // Track script loading states
// let scriptsLoaded = {
//   accordion: false
// };
//
// // Load script and return a promise
// function loadScript(src) {
//   return new Promise((resolve, reject) => {
//     const script = document.createElement('script');
//     script.src = src;
//     script.onload = resolve;
//     script.onerror = reject;
//     document.body.appendChild(script);
//   });
// }
//
// // Load stylesheet if not already loaded
// function loadStylesheet(href) {
//   if (!document.querySelector(`link[href="${href}"]`)) {
//     const link = document.createElement('link');
//     link.rel = 'stylesheet';
//     link.href = href;
//     document.head.appendChild(link);
//   }
// }
//
// // Load section 7 (product offer section)
// async function loadSection7() {
//   console.log('Starting to load section 7...');
//   const section7 = document.querySelector('include[data-src*="v7/product-offer-section.html"]');
//   if (!section7) {
//     console.log('Section 7 element not found');
//     return;
//   }
//
//   try {
//     // Load section content
//     console.log('Loading section 7 content...');
//     const response = await fetch(section7.getAttribute('data-src'));
//     const html = await response.text();
//     const div = document.createElement("div");
//     div.innerHTML = html;
//
//     // Load section styles
//     loadStylesheet('v7/styles.css');
//
//     // Replace section placeholder with content
//     section7.parentNode.replaceChild(div.firstChild, section7);
//   } catch (error) {
//     console.error("Error loading section 7:", error);
//     setTimeout(loadSection7, 1000);
//   }
// }
//
// // Load regular sections (non-product sections)
// async function loadSection(include) {
//   const src = include.getAttribute("src") || include.getAttribute("data-src");
//   if (!src) return;
//
//   // Skip section 7 as it needs special handling
//   if (src.includes('v7/product-offer-section.html')) return;
//
//   try {
//     const response = await fetch(src);
//     const html = await response.text();
//     const div = document.createElement("div");
//     div.innerHTML = html;
//     include.parentNode.replaceChild(div.firstChild, include);
//
//     // Load section-specific stylesheet
//     const sectionId = src.includes('footer') ? 'footer' : src.split('/')[0];
//     if (stylesheets[sectionId]) {
//       loadStylesheet(stylesheets[sectionId]);
//     }
//
//     componentsLoaded++;
//
//     // Handle accordion initialization for FAQ section
//     if (src.includes('faq-section.html') && !scriptsLoaded.accordion) {
//       await loadScript('js/accordion.js');
//       scriptsLoaded.accordion = true;
//       initAccordion('.faq-item');
//     }
//   } catch (error) {
//     console.error("Error loading include:", error);
//     componentsLoaded++;
//   }
// }
//
// // Load initial sections (header, hero, footer) on page load
// window.addEventListener('load', function() {
//   // Load footer first to ensure it's always at the bottom
//   const footerInclude = document.querySelector('include[src*="footer.html"]');
//   if (footerInclude) {
//     loadSection(footerInclude);
//   }
//
//   // Then load other initial sections
//   const initialIncludes = document.querySelectorAll('include:not([data-src])');
//   initialIncludes.forEach(include => {
//     if (!include.getAttribute('src').includes('footer.html')) {
//       loadSection(include);
//     }
//   });
// });
//
// // Start loading Shopify and section 7 when user starts scrolling
// let hasLoadedSection7 = false;
// window.addEventListener('scroll', () => {
//   if (!hasLoadedSection7 && window.scrollY > 100) {
//     console.log('Scroll threshold reached, loading section 7...');
//     hasLoadedSection7 = true;
//     // Load section 7
//     setTimeout(loadSection7, 100);
//   }
// }, { passive: true });
//
// // Lazy load remaining sections as they come into view
// const observer = new IntersectionObserver((entries) => {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       const includes = entry.target.querySelectorAll('include[data-src]');
//       includes.forEach(loadSection);
//       observer.unobserve(entry.target);
//     }
//   });
// }, {
//   rootMargin: '50px'
// });
//
// observer.observe(document.getElementById('lazy-sections'));