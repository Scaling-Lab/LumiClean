// Configuration for multiple products
const PRODUCTS_CONFIG = [
  {
    id: '8767650365689',
    elementId: 'product-component-1743511404924'
  },
  {
    id: '8767649022201',
    elementId: 'product-component-1743514509506'
  },
  {
    id: '8767650660601',
    elementId: 'product-component-1743516118498'
  }

];

function initShopify() {
  if (document.querySelector('.shopify-buy__btn')) {
    return;
  }

  var client = ShopifyBuy.buildClient({
    domain: 'kathyfox.myshopify.com',
    storefrontAccessToken: '92a24ae00c5c9058d5fea2581c5b7289',
  });

  ShopifyBuy.UI.onReady(client).then(function (ui) {
    // Create components for all configured products
    PRODUCTS_CONFIG.forEach(product => {
      const element = document.getElementById(product.elementId);
      if (element) {
        ui.createComponent('product', {
          id: product.id,
          node: element,
          moneyFormat: '%24%7B%7Bamount%7D%7D',
          options: {
            "product": {
              "styles": {
                "product": {
                  "@media (min-width: 601px)": {
                    "max-width": "calc(25% - 20px)",
                    "margin-left": "20px",
                    "margin-bottom": "50px"
                  }
                },
                "button": {
                  "width": "100%",
                  "margin-top": "-10px !important",
                  "font-size": "18px",
                  "padding-top": "17px",
                  "padding-bottom": "17px",
                  ":hover": {
                    "background-color": "#b70c1d"
                  },
                  "background-color": "#cb0d20",
                  ":focus": {
                    "background-color": "#b70c1d"
                  },
                  "border-radius": "40px"
                },
                "quantityInput": {
                  "font-size": "18px",
                  "padding-top": "17px",
                  "padding-bottom": "17px"
                }
              },
              "contents": {
                "img": false,
                "title": false,
                "price": false
              },
              "text": {
                "button": "Add to cart"
              }
            },
            "productSet": {
              "styles": {
                "products": {
                  "@media (min-width: 601px)": {
                    "margin-left": "-20px"
                  }
                }
              }
            },
            "modalProduct": {
              "contents": {
                "img": false,
                "imgWithCarousel": true,
                "button": false,
                "buttonWithQuantity": true
              },
              "styles": {
                "product": {
                  "@media (min-width: 601px)": {
                    "max-width": "100%",
                    "margin-left": "0px",
                    "margin-bottom": "0px"
                  }
                },
                "button": {
                  "font-size": "18px",
                  "padding-top": "17px",
                  "padding-bottom": "17px",
                  ":hover": {
                    "background-color": "#b70c1d"
                  },
                  "background-color": "#cb0d20",
                  ":focus": {
                    "background-color": "#b70c1d"
                  },
                  "border-radius": "40px"
                },
                "quantityInput": {
                  "font-size": "18px",
                  "padding-top": "17px",
                  "padding-bottom": "17px"
                }
              },
              "text": {
                "button": "Add to cart"
              }
            },
            "option": {},
            "cart": {
              "styles": {
                "button": {
                  "font-size": "18px",
                  "padding-top": "17px",
                  "padding-bottom": "17px",
                  ":hover": {
                    "background-color": "#b70c1d"
                  },
                  "background-color": "#cb0d20",
                  ":focus": {
                    "background-color": "#b70c1d"
                  },
                  "border-radius": "40px"
                }
              },
              "text": {
                "total": "Subtotal",
                "button": "Checkout"
              },
              "popup": false
            },
            "toggle": {
              "styles": {
                "toggle": {
                  "background-color": "#cb0d20",
                  ":hover": {
                    "background-color": "#b70c1d"
                  },
                  ":focus": {
                    "background-color": "#b70c1d"
                  }
                },
                "count": {
                  "font-size": "18px"
                }
              }
            }
          }
        });
      }
    });
  });
}

// Load buy-button script synchronously
var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
var script = document.createElement('script');
script.src = scriptURL;
script.async = false;
script.onload = function() {
  window.shopifyButtonInitialized = false;
  initShopify(); // Initialize after script loads
};
document.head.appendChild(script);