/**
 * Product API Module
 * Handles fetching and caching product data from the Shopify Storefront API
 */

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const PRODUCT_CACHE = new Map(); // In-memory cache for product data

/**
 * Fetches product data by variant ID with built-in caching
 * @param {string} variantId - The Shopify variant ID
 * @returns {Promise<Object>} - The product data
 */
async function fetchProductData(variantId) {
  // Check cache first
  const cachedData = PRODUCT_CACHE.get(variantId);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`[ProductAPI] Serving cached data for variant ${variantId}`);
    return cachedData.data;
  }

  // If not in cache or expired, fetch from API
  console.log(`[ProductAPI] Fetching fresh data for variant ${variantId}`);
  
  try {
    // Query for product details by variant ID
    const query = `
      query ProductVariantData($variantId: ID!) {
        node(id: $variantId) {
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

    // Call our Netlify function that proxies the Shopify API
    const response = await fetch('/.netlify/functions/shopify-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { variantId }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Check for GraphQL errors
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    // Format the data for consumption
    const productData = result.data.node;
    
    // Save to cache with timestamp
    PRODUCT_CACHE.set(variantId, {
      data: productData,
      timestamp: Date.now()
    });

    return productData;
  } catch (error) {
    console.error(`[ProductAPI] Error fetching product data:`, error);
    
    // Return null or a fallback if available
    return null;
  }
}

/**
 * Formats a price amount with the appropriate currency symbol and decimal places
 * @param {number|string} amount - The price amount
 * @param {string} currencyCode - The ISO currency code (e.g., 'USD')
 * @returns {string} - Formatted price string
 */
function formatPrice(amount, currencyCode = 'USD') {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount);
  }
  
  // Fall back to default if NaN
  if (isNaN(amount)) {
    return '$0.00';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl is not supported
    return `$${amount.toFixed(2)}`;
  }
}

// Export public API
export { fetchProductData, formatPrice }; 