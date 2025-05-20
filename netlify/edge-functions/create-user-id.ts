// import { Context } from "@netlify/edge-functions"; // Removed unused import
import { handleCors } from "./utils/cors.ts";

export default async (request: Request, context: any) => {
  // Define allowed origins - adjust if needed, e.g., specific subdomains + root
  const allowedOrigins = [  
    "https://*.uvlizer.co",
    "https://*.uvlizer.us",
    "https://uvlizer.co",
    "https://uvlizer.us",
    "http://localhost:8888",     // local Netlify dev
    "https://*.netlify.app"      // Netlify preview domains
  ];

  // Handle CORS checks and preflight requests
  const corsResponseOrHeaders = handleCors(request, allowedOrigins);
  // If it returned a Response object (preflight), return it directly
  if (corsResponseOrHeaders instanceof Response) {
    return corsResponseOrHeaders;
  }

  // Get the CORS headers to add to the actual response
  const corsHeaders = corsResponseOrHeaders;

  // Parse JSON body to get client-provided visitorId
  let userId = '';
  let idSource = '';

  try {
    if (request.method === 'POST') {
      const requestData = await request.json().catch(() => ({}));
      
      // First try to use the visitorId from the client bootstrap (update key)
      if (requestData.uvl_userId) {
        userId = requestData.uvl_userId;
        idSource = 'client_bootstrap';
      } else if (requestData.visitorId) {
        // Support old key temporarily? Or remove? Let's remove for now.
        userId = requestData.visitorId;
        idSource = 'legacy_visitorId';
      } else if (requestData.userId) {
        // Legacy support
        userId = requestData.userId;
        idSource = 'legacy_userId';
      }
    }
  } catch (e) {
    console.warn('Could not parse request body for uvl_userId', e);
  }

  // If no valid ID from client, generate a new one
  if (!userId) {
    userId = crypto.randomUUID();
    idSource = 'uuid_generated_server';
  }

  // Determine the proper domain for the cookie
  // Use either the hostname from the request (for dev/testing) or .testolite.com (for production)
  let domain;
  try {
    const url = new URL(request.url);
    if (url.hostname.includes('uvlizer.co')) {
      // Production domain - set to root domain for subdomain sharing
      domain = '.uvlizer.co';
    } else if (url.hostname.includes('uvlizer.us')) {
      // Production domain - set to root domain for subdomain sharing
      domain = '.uvlizer.us';
    } else if (url.hostname.includes('netlify.app')) {
      // Netlify preview domain - set to specific preview domain
      domain = url.hostname;
    } else {
      // Local development or other - use current hostname
      domain = url.hostname;
    }
  } catch (e) {
    // Fallback to default domain
    domain = '.uvlizer.co';
  }

  // Define cookie attributes
  const oneYearInSeconds = 365 * 24 * 60 * 60;
  const twoYearsInSeconds = 2 * oneYearInSeconds;
  const cookieAttributes = [
    `uvl_userId=${userId}`,
    `Domain=${domain}`, // Dynamic domain
    `Path=/`,
    `Max-Age=${twoYearsInSeconds}`,
    // Remove HttpOnly flag
    `Secure`,
    `SameSite=Lax`
  ].join("; ");

  // Create response with the user ID and set the cookie
  return new Response(
    JSON.stringify({
      success: true,
      uvl_userId: userId,
      isNewUser: idSource === 'uuid_generated_server', // Only truly new if we generated it
      idSource,
      domain  // Include domain in response for debugging
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders, // Include CORS headers
        "Content-Type": "application/json", // Lowercase headers
        "Set-Cookie": cookieAttributes // Lowercase headers
      }
    }
  );
}; 