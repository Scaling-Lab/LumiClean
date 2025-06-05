// Import the Shopify Storefront API client
const { createStorefrontApiClient } = require('@shopify/storefront-api-client');

// Define allowed origins (replace with your actual frontend domain(s))
const allowedOrigins = [
    'https://*.trylumiclean.com', 
    'https://staging.offers.trylumiclean.com', // Example: Your staging domain
    // Add 'http://localhost:xxxx' for local development if needed
    'http://localhost:8888', // Example: Netlify Dev default port
    'http://localhost:3000', // Vite/React/Vue default dev server
    'http://127.0.0.1:3000', 
    'https://lumiclean.netlify.app'
];

exports.handler = async function(event, context) {
    const origin = event.headers.origin;

    // Check if the origin is allowed, handling wildcards
    const isAllowedOrigin = allowedOrigins.some(allowed => {
        if (allowed.startsWith('https://*.')) {
            const baseDomain = allowed.substring('https://*.'.length);
            return origin && origin.startsWith('https://') && origin.endsWith('.' + baseDomain);
        }
        // Handle potential http://localhost:* wildcard (optional, but good practice)
        if (allowed.startsWith('http://localhost:')) { // Check if it's a localhost pattern
            const base = 'http://localhost:';
            // Allow any port if allowed is just 'http://localhost:' or similar pattern intended for any port
             if (allowed === 'http://localhost:*' || allowed === 'http://localhost:') { // Or just `allowed.endsWith(':')`
                 return origin && origin.startsWith(base);
             }
            // Otherwise, compare exactly (e.g., http://localhost:8888)
        }
         // Handle potential http://127.0.0.1:* wildcard (optional)
        if (allowed.startsWith('http://127.0.0.1:')) {
            const base = 'http://127.0.0.1:';
             if (allowed === 'http://127.0.0.1:*' || allowed === 'http://127.0.0.1:') {
                 return origin && origin.startsWith(base);
             }
        }
        // Default to exact match for non-wildcard origins
        return origin === allowed;
    });

    // Default headers for CORS
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0] // Use requested origin if allowed, else default
    };

    // Handle OPTIONS preflight request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204, // No Content
            headers: corsHeaders,
            body: ''
        };
    }

    // Check if the origin is allowed for non-OPTIONS requests
    if (!isAllowedOrigin) {
        // console.warn(`[shopify-proxy] Denying request from disallowed origin: ${origin}`);
        return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Forbidden: Invalid origin' }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } // Include CORS headers in error response
        };
    }

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
    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;

    if (!storefrontAccessToken || !storeDomain) {
        // console.error('Missing Shopify environment variables'); // Keep for debugging if needed
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error.' }),
        };
    }

    try {
        // Get the GraphQL query and variables from the client-side request body
        // console.log("[shopify-proxy] Received raw event body:", event.body); // REMOVED - Potential PII leak
        const { query, variables } = JSON.parse(event.body);

        if (!query) {
             return {
                 statusCode: 400,
                 body: JSON.stringify({ error: 'Missing GraphQL query in request body.' }),
             };
        }

        // Initialize the Shopify Storefront client
        const client = createStorefrontApiClient({
            storeDomain: `https://${storeDomain}`,
            apiVersion: '2024-10',
            publicAccessToken: storefrontAccessToken,
        });

        // Log the query and variables being sent to Shopify
        /* // REMOVED - Reduce log noise
        console.log("[shopify-proxy] Sending to Shopify Client:");
        console.log("  Query:", query);
        console.log("  Variables:", JSON.stringify(variables, null, 2));
        */

        // Make the request using the Storefront API client
        // NOTE: The Storefront API client's `request` method expects the GraphQL
        // query *string* as the **first** argument and an optional options
        // object (containing variables, headers, etc.) as the **second**. The
        // previous implementation wrapped both in a single object which
        // resulted in an invalid GraphQL payload and consequently a `400 Bad
        // Request` response from Shopify. Using the documented signature
        // prevents this error.

        const response = await client.request(query, {
            variables,
        });

        // **** CHECK FOR GRAPHQL ERRORS IN THE RESPONSE ****
        if (response.errors) {
            // console.error("[shopify-proxy] GraphQL errors received from Shopify:", response.errors); // Keep for debugging
            // Return a 400 Bad Request status as the query itself was likely malformed or had invalid variables
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'GraphQL Error',
                    details: response.errors // Forward the specific GraphQL errors
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            };
        }

        // Return the data from Shopify back to the client-side JavaScript
        return {
            statusCode: 200,
            body: JSON.stringify(response), // Forward the exact response
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders // Add CORS headers to successful response
            }
        };
    } catch (error) {
        // Log the raw error object from the Shopify client for detailed debugging
        // console.error('[shopify-proxy] Raw error from client.request():', error); // Keep for debugging

        // Construct a more informative error object to return to the frontend
        let statusCode = 500;
        let errorType = 'Function Error';
        let details = 'An unknown error occurred while processing your request.';

        // Handle different types of errors
        if (error.response) {
             // This is an error from the Shopify API with a response
             statusCode = error.response.status || 500;
             errorType = 'Shopify API Error';
             // Attempt to get specific GraphQL errors if available
             if (error.response.data && error.response.data.errors) {
                 details = error.response.data.errors;
             } else {
                 details = error.message || 'Unknown Shopify API error';
             }
             // console.error(`[shopify-proxy] Shopify API error details: Status=${statusCode}`, details); // Keep for debugging
         } else if (error instanceof SyntaxError) {
             // Handle JSON parsing errors
             statusCode = 400;
             errorType = 'Parsing Error';
             details = 'Invalid request body format.';
             // console.error(`[shopify-proxy] JSON parsing error:`, error.message); // Keep for debugging
         } else if (error.message) {
             // Generic error with a message property
             details = error.message;
             // console.error(`[shopify-proxy] Generic function error:`, error.message); // Keep for debugging
         } else {
             // Other unexpected error types
             // console.error('[shopify-proxy] Unknown error structure:', error); // Keep for debugging
         }

        // Return a standardized error response
        return {
            statusCode: statusCode,
            body: JSON.stringify({
                error: errorType,
                details: details
            }),
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } // Add CORS headers to error response
        };
    }
}; 