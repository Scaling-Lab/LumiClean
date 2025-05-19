// Shopify API Configuration
const SHOPIFY_STORE_URL = 'https://uvlizer.myshopify.com'; // UVLIZER store URL
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = '6e9a3bedbc59e9683dccedd2bdd92945'; // Replace with your Storefront API access token

// API Endpoint
const API_ENDPOINT = `${SHOPIFY_STORE_URL}/api/2023-10/graphql.json`;

// Function to call Shopify API
async function callShopifyAPI(query, variables = {}) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        return data.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Function to get product by ID
async function getProduct(productId) {
    const query = `
        query getProduct($id: ID!) {
            product(id: $id) {
                id
                title
                description
                handle
                images(first: 10) {
                    edges {
                        node {
                            id
                            url
                            altText
                        }
                    }
                }
                variants(first: 10) {
                    edges {
                        node {
                            id
                            title
                            price {
                                amount
                                currencyCode
                            }
                            availableForSale
                        }
                    }
                }
            }
        }
    `;

    return await callShopifyAPI(query, { id: productId });
}

// Function to get collection by ID
async function getCollection(collectionId) {
    const query = `
        query getCollection($id: ID!) {
            collection(id: $id) {
                id
                title
                description
                handle
                image {
                    url
                    altText
                }
                products(first: 20) {
                    edges {
                        node {
                            id
                            title
                            handle
                            images(first: 1) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                            variants(first: 1) {
                                edges {
                                    node {
                                        id
                                        price {
                                            amount
                                            currencyCode
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    return await callShopifyAPI(query, { id: collectionId });
}

// Export functions
window.ShopifyAPI = {
    callShopifyAPI,
    getProduct,
    getCollection
}; 