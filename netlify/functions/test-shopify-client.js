const { createStorefrontClient } = require('@shopify/storefront-api-client');

exports.handler = async function(event, context) {
  // Simple test endpoint to verify the Shopify client is working
  
  // Retrieve secure environment variables
  const storefrontAccessToken = process.env.LUMI_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const storeDomain = process.env.LUMI_SHOPIFY_STORE_DOMAIN;

  if (!storefrontAccessToken || !storeDomain) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Shopify environment variables' }),
    };
  }

  try {
    // Initialize the Shopify Storefront client
    const client = createStorefrontClient({
      storeDomain: `https://${storeDomain}`,
      apiVersion: '2024-04',
      publicAccessToken: storefrontAccessToken,
    });

    // Simple query to get shop information
    const query = `
      query {
        shop {
          name
          primaryDomain {
            url
          }
        }
      }
    `;

    // Make the request using the Storefront API client
    const response = await client.request({
      query
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Shopify Storefront API client is working!',
        shopInfo: response,
      }),
    };
  } catch (error) {
    console.error('Test failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Test failed',
        details: error.message || 'Unknown error'
      }),
    };
  }
}; 