// Shopify API module: GraphQL definitions and API call

export const CartFragment = `
fragment CartFragment on Cart {
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      cost { totalAmount { amount currencyCode } }
      merchandise { 
        ... on ProductVariant { 
          id 
          title 
          sku
          price { amount currencyCode } 
          compareAtPrice { amount currencyCode } 
          image { url altText } 
          product { 
            id 
            handle 
            title 
            collections(first: 5) {
              nodes { title } 
            } 
          } 
        } 
      }
    }
  }
  discountCodes { applicable code }
  buyerIdentity { email phone }
  attributes { key value }
}`;

// GraphQL mutations and queries
export const CREATE_CART_MUTATION = `mutation cartCreate($cartInput: CartInput!) { cartCreate(input: $cartInput) { cart { ...CartFragment } userErrors { field message } } } ${CartFragment}`;
export const FETCH_CART_QUERY = `query getCart($cartId: ID!) { cart(id: $cartId) { ...CartFragment } } ${CartFragment}`;
export const ADD_TO_CART_MUTATION = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFragment } userErrors { field message } } } ${CartFragment}`;
export const REMOVE_FROM_CART_MUTATION = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFragment } userErrors { field message } } } ${CartFragment}`;
export const UPDATE_CART_LINE_MUTATION = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFragment } userErrors { field message } } } ${CartFragment}`;
export const UPDATE_DISCOUNT_CODE_MUTATION = `mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) { cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { cart { ...CartFragment } userErrors { field message code } } } ${CartFragment}`;
export const CART_ATTRIBUTES_UPDATE_MUTATION = `mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) { cartAttributesUpdate(cartId: $cartId, attributes: $attributes) { cart { ...CartFragment } userErrors { field message } } } ${CartFragment}`;
export const CART_BUYER_IDENTITY_UPDATE_MUTATION = `mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) { cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) { cart { ...CartFragment } userErrors { field message } } } ${CartFragment}`;

// Updated function signature to accept callbacks
export async function callShopifyAPI(query, variables = {}, { onStart, onEnd } = {}) {
  if (typeof onStart === 'function') onStart();
  
  try {
    const response = await fetch('/.netlify/functions/shopify-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
    
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    
    const data = result.data;
    const key = Object.keys(data)[0];
    if (data[key]?.userErrors?.length) throw new Error(data[key].userErrors[0].message);
    
    return data;
  } finally {
    if (typeof onEnd === 'function') onEnd();
  }
}

// Expose API to global for non-module scripts
/* // Remove global exposure if using modules consistently
window.ShopifyApi = {
  callShopifyAPI,
  CREATE_CART_MUTATION,
  FETCH_CART_QUERY,
  ADD_TO_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  UPDATE_CART_LINE_MUTATION,
  UPDATE_DISCOUNT_CODE_MUTATION,
  CART_ATTRIBUTES_UPDATE_MUTATION,
  CART_BUYER_IDENTITY_UPDATE_MUTATION
}; 
*/ 