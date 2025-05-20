// import { Context } from "@netlify/edge-functions"; // Removed unused import

/**
 * Handles CORS headers, including preflight requests.
 * @param request The incoming Request object.
 * @param allowedOrigins Array of allowed origins (can include wildcards like 'https://*.testolite.com').
 * @returns A Response object if it's a preflight request, otherwise an object with CORS headers.
 */
export function handleCors(request: Request, allowedOrigins: string[] = []) {
  const origin = request.headers.get("Origin") || "";

  // Determine if the origin is allowed
  const isAllowed = allowedOrigins.some(allowed => {
    // Handle https://*.domain.com wildcard format (subdomain wildcard)
    if (allowed.startsWith('https://*.')) {
      const baseDomain = allowed.replace('https://*.', '');
      return origin.endsWith('.' + baseDomain) || origin === `https://${baseDomain}`;
    } 
    // Handle http://*.domain.com wildcard format (for development)
    else if (allowed.startsWith('http://*.')) {
      const baseDomain = allowed.replace('http://*.', '');
      return origin.endsWith('.' + baseDomain) || origin === `http://${baseDomain}`;
    }
    // Handle general wildcard patterns (less specific, use with caution)
    else if (allowed.includes("*")) {
      const pattern = allowed.replace(/\./g, "\\.").replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    } 
    // Exact match
    else {
      return allowed === origin;
    }
  });

  // Set appropriate cors headers based on match
  const corsHeaders = {
    "access-control-allow-origin": isAllowed ? origin : "", // Lowercase header names
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, Cookie", // Allow Content-Type and Cookie headers
    "access-control-allow-credentials": "true" // Required for cookies
  };

  // Handle preflight requests (OPTIONS method)
  if (request.method === "OPTIONS") {
    // Preflight requires 204 No Content status
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // For non-preflight requests, return the headers to be added to the main response
  return corsHeaders;
} 