// import { Context } from "@netlify/edge-functions"; // Removed unused import
import { handleCors } from "./utils/cors.ts";

export default async (request: Request, context: any) => {
  // Define allowed origins with expanded list
  const allowedOrigins = [
    "https://*.uvlizer.co",
    "https://*.uvlizer.us",
    "https://uvlizer.co",
    "https://uvlizer.us",
    "http://localhost:3000",
    "https://*.netlify.app"
  ];

  // Handle CORS checks and preflight requests
  const corsResponseOrHeaders = handleCors(request, allowedOrigins);
  // If it returned a Response object (preflight), return it directly
  if (corsResponseOrHeaders instanceof Response) {
    return corsResponseOrHeaders;
  }

  // Get the CORS headers to add to the actual response
  const corsHeaders = corsResponseOrHeaders;

  // Extract the userId cookie from the request headers
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...v] = c.split('=');
      // Handle cases where cookie value might contain '='
      return [key, v.join('=')];
    }).filter(([key]) => key) // Filter out potential empty splits
  );

  const userId = cookies.userId;

  let responseBody;
  let status = 200;

  if (userId) {
    responseBody = JSON.stringify({
      success: true,
      userId,
      isNewUser: false, // User ID exists
      source: 'cookie'
    });
  } else {
    responseBody = JSON.stringify({
      success: false,
      message: "No user ID found in cookies",
      shouldCreate: true // Signal to client that ID should be created
    });
  }

  // Return response with appropriate status and headers
  return new Response(
    responseBody,
    {
      status: status,
      headers: {
        ...corsHeaders, // Include CORS headers
        "content-type": "application/json" // Lowercase header names
        // Note: No Set-Cookie header here as we are only checking
      }
    }
  );
}; 