// Use node-fetch if using an older Node.js version on Netlify,
// otherwise Node's global fetch might be available.
// If needed: npm install node-fetch
// const fetch = require('node-fetch'); // Uncomment if needed

exports.handler = async function(event, context) {
    // Only allow POST requests (standard for GraphQL)
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Allow': 'POST' }
        };
    }

    // Retrieve secure environment variables
    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN; // Get domain from env vars

    if (!storefrontAccessToken || !storeDomain) {
        console.error('Missing Shopify environment variables');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error.' }),
        };
    }

    const shopifyApiEndpoint = `https://${storeDomain}/api/2024-04/graphql.json`; // Use appropriate API version

    try {
        // Get the GraphQL query and variables from the client-side request body
        const { query, variables } = JSON.parse(event.body);

        if (!query) {
             return {
                 statusCode: 400,
                 body: JSON.stringify({ error: 'Missing GraphQL query in request body.' }),
             };
        }

        // Make the request *from the serverless function* to Shopify
        const response = await fetch(shopifyApiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Inject the secure token here
                'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
            },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            // Forward Shopify's error status if possible
            const errorBody = await response.text();
            console.error(`Shopify API error: ${response.status}`, errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to fetch from Shopify API.', details: errorBody }),
            };
        }

        // Parse the response from Shopify
        const shopifyData = await response.json();

        // Return the data from Shopify back to the client-side JavaScript
        return {
            statusCode: 200,
            body: JSON.stringify(shopifyData), // Forward the exact response
            headers: {
                'Content-Type': 'application/json',
                // Optional: Add CORS headers if needed, though usually not required
                // when calling from the same Netlify domain.
                // 'Access-Control-Allow-Origin': '*',
                // 'Access-Control-Allow-Headers': 'Content-Type',
                // 'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        let errorMessage = 'An error occurred while processing your request.';
        if (error instanceof SyntaxError) { // Handle JSON parsing errors
            errorMessage = 'Invalid request body.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Function Error', details: errorMessage }),
        };
    }
}; 