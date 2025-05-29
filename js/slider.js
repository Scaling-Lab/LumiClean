// slider.js – simplified & robust Swiper initialization
// This script auto-initializes every .swiper container it finds on the page.
// You can pass per-slider overrides via the configMap below.
// If a slider has navigation or pagination elements in or near its container,
// they are detected automatically, so you rarely need to specify them.

document.addEventListener('DOMContentLoaded', function() {
  console.log('slider.js: DOMContentLoaded event fired.');
  console.log('slider.js: typeof Swiper is:', typeof Swiper);

  (function () {
    /* --------------------------------------------------
     * 1.  CONFIGURATION MAP – declare per-slider overrides
     * -------------------------------------------------- */
    const configMap = {
      '.testimonial-swiper': {
        centeredSlides: true,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        navigation: {
          nextEl: '.testimonial-next',
          prevEl: '.testimonial-prev',
        },
        breakpoints: {
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        },
      },

      '.product-slider': {
        effect: 'slide',
        speed: 500,
        loop: true,
        autoplay: false,
        centeredSlides: false,
        slidesPerView: 1,
        spaceBetween: 0,
        navigation: {
          nextEl: '.product-next',
          prevEl: '.product-prev',
        },
        pagination: {
          el: '.product-slider .swiper-pagination',
          clickable: true,
          type: 'bullets',
        },
      },

      // Configuration specifically for the credibility logos swiper
      '.credibility-logos-swiper': {
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        spaceBetween: 20,
        grabCursor: true,
        navigation: false, // Explicitly disable navigation
        pagination: {
          el: '.credibility-logos-swiper .swiper-pagination',
          clickable: true,
        },
        // navigation: { // Закоментовуємо, оскільки елементи відсутні в HTML
        //   nextEl: '.credibility-logos-swiper .swiper-button-next',
        //   prevEl: '.credibility-logos-swiper .swiper-button-prev',
        // },
        breakpoints: {
          320: {
            slidesPerView: 1,
            centeredSlides: true,
          },
          640: {
            slidesPerView: 1,
            centeredSlides: true,
          },
          768: {
            slidesPerView: 2,
            centeredSlides: true,
          },
          1024: {
            slidesPerView: 3,
            centeredSlides: true,
          },
          1400: {
            slidesPerView: 4,
            centeredSlides: false,
          },
          1600: {
            slidesPerView: 5,
            centeredSlides: false,
          }
        },
      },

      // Configuration specifically for the mobile-only credibility slider
      '.credibility-swiper-mobile': {
        init: false, // Initialize manually based on screen size
        loop: true,
        autoplay: {
          delay: 3500, // Adjust delay as needed (e.g., 3500ms)
          disableOnInteraction: false, // Keep playing after user interacts
          pauseOnMouseEnter: true, // Pause when mouse hovers (good practice, though less relevant for pure mobile)
        },
        // Navigation and pagination will be auto-detected by default
        // Add specific selectors here if auto-detection fails
        // navigation: {
        //   nextEl: '.credibility-swiper-mobile .swiper-button-next', 
        //   prevEl: '.credibility-swiper-mobile .swiper-button-prev',
        // },
        // pagination: {
        //   el: '.credibility-swiper-mobile .swiper-pagination',
        //   clickable: true,
        // }
      },
    };

    /* --------------------------------------------------
     * 2.  DEFAULT OPTIONS (shared by all sliders)
     * -------------------------------------------------- */
    const DEFAULTS = {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      centeredSlides: false,
      autoplay: false,
      pagination: {
        el: null, // will be auto-detected
        clickable: true,
      },
      navigation: null, // will be auto-detected
    };

    /* --------------------------------------------------
     * 3.  UTILS
     * -------------------------------------------------- */
    // Simple deep merge for plain objects (sufficient for Swiper options)
    function deepMerge(target, source = {}) {
      const merged = { ...target };
      for (const key in source) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          merged[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          merged[key] = source[key];
        }
      }
      return merged;
    }

    // Auto-detect nav & pagination elements if not explicitly provided
    function autoDetectControls(container, opts) {
      // Pagination
      if (!opts.pagination || !opts.pagination.el) {
        const pagEl = container.querySelector('.swiper-pagination');
        if (pagEl) {
          opts.pagination = { ...opts.pagination, el: pagEl, clickable: true };
        }
      }

      // Navigation – search inside container first, then its parent wrapper
      if (!opts.navigation) {
        const prev =
          container.querySelector('.swiper-button-prev, .swiper-prev, .testimonial-prev, .product-prev') ||
          container.parentElement?.querySelector(
            '.swiper-button-prev, .swiper-prev, .testimonial-prev, .product-prev'
          );
        const next =
          container.querySelector('.swiper-button-next, .swiper-next, .testimonial-next, .product-next') ||
          container.parentElement?.querySelector(
            '.swiper-button-next, .swiper-next, .testimonial-next, .product-next'
          );
        if (prev && next) {
          opts.navigation = { prevEl: prev, nextEl: next };
        }
      }
    }

    // Helper to add pause-on-hover if autoplay is enabled
    function attachHoverHandlers(container, swiperInstance, opts) {
      if (opts.autoplay && opts.autoplay.pauseOnMouseEnter) {
        container.addEventListener('mouseenter', () => {
          if (swiperInstance.autoplay?.running) swiperInstance.autoplay.stop();
        });
        container.addEventListener('mouseleave', () => {
          if (swiperInstance.autoplay) swiperInstance.autoplay.start();
        });
      }
    }

    // Debounce function
    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    /* --------------------------------------------------
     * 4.  INITIALIZATION
     * -------------------------------------------------- */
    // Store swiper instances
    const swiperInstances = {};

    function initSingleSlider(container, customOpts = {}) {
      const selector = container.classList.contains('credibility-swiper-mobile') 
                       ? '.credibility-swiper-mobile' 
                       : (container.classList.contains('product-slider') 
                         ? '.product-slider' 
                         : (container.classList.contains('testimonial-swiper') ? '.testimonial-swiper' : null));

      // Build final options: DEFAULTS → custom config map → inline dataset overrides (optional)
      let opts = deepMerge(DEFAULTS, customOpts);

      // Auto-detect navigation & pagination if needed
      // Ensure auto-detection uses the container passed to this function
      autoDetectControls(container, opts);

      // Finally initialize Swiper
      const swiper = new Swiper(container, opts);

      // Store instance if it has a selector we identified
      if (selector) {
        swiperInstances[selector] = swiper;
      }

      // Hover pause support (only if init is true or becomes true)
      if (opts.init !== false) { // Check initial config
        attachHoverHandlers(container, swiper, opts);
      } else {
          // If init is false, attach handlers after manual init
          swiper.on('init', () => {
              attachHoverHandlers(container, swiper, swiper.params); // Use swiper.params after init
          });
      }

      return swiper; // Return instance for potential direct use
    }

    // Function to manage the state of the mobile-only slider
    function handleCredibilitySliderState() {
      // Get the slider instance and the container element
      const container = document.querySelector('.credibility-swiper-mobile');
      const mobileSliderInstance = swiperInstances['.credibility-swiper-mobile'];
      if (!container || !mobileSliderInstance) return;

      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        // Show container and init if not already
        container.style.display = '';
        if (!mobileSliderInstance.initialized) {
          mobileSliderInstance.init();
        }
      } else {
        // Destroy slider and hide container
        if (mobileSliderInstance.initialized) {
          mobileSliderInstance.destroy(true, true);
        }
        container.style.display = 'none';
      }
    }

    // Initialize all sliders on the page
    document.querySelectorAll('.swiper').forEach((sliderElement) => {
      // Find the matching config key (if any)
      const matchingKey = Object.keys(configMap).find((key) =>
        sliderElement.matches(key)
      );
      const sliderConfig = matchingKey ? configMap[matchingKey] : {};

      // Special handling for credibility-swiper-mobile to pass its specific config
      if (sliderElement.classList.contains('credibility-swiper-mobile')) {
          //This slider is initialized via handleCredibilitySliderState, so we pass its config directly
          //No need to call initSingleSlider here as it would duplicate
      } else {
          initSingleSlider(sliderElement, sliderConfig);
      }
    });

    // Handle credibility slider responsive initialization
    handleCredibilitySliderState(); // Initial check
    window.addEventListener('resize', debounce(handleCredibilitySliderState, 250)); // Check on resize
  })();
});