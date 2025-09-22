
(function() {
  // Check if the cart-specific Elevar initialization has already run
  if (window.elevarIsCartPage) {
    return; // Exit if cart-core.js is present
  }

  // Fallback for Mida for pages without cart
  window.mfunc = window.mfunc || [];
  function onMidaReady(callback) {
    if (window.mida) callback();
    else window.mfunc.push(callback);
  }

  // Function to initialize Elevar for non-cart pages
  const initializeElevarNonCart = () => {
    // Skip if Mida indicates a redirect is in progress
    if (window.mida && window.mida.isRedirect) return;

    window.ElevarDataLayer = window.ElevarDataLayer || [];

    // Push a baseline dl_user_data event with empty cart info
    const userDataEvent = {
      event: 'dl_user_data',
      cart_total: '0.00',
      user_properties: {
        visitor_type: 'guest'
      },
      ecommerce: {
        currencyCode: 'USD',
        cart_contents: {
          products: []
        }
      }
    };
    window.ElevarDataLayer.push(userDataEvent);

  };
  
  // If Mida is not on the page, run immediately. Otherwise, wait for Mida.
  if (typeof window.mida === 'undefined') {
    initializeElevarNonCart();
  } else {
    onMidaReady(initializeElevarNonCart);
  }

})(); 