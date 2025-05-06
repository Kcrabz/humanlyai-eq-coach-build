
// Common utility functions and constants for chat completion edge function

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Usage tier limits
export const TIER_LIMITS = {
  free: 500,
  premium: 10000
};

// Create standardized error response
export function createErrorResponse(message: string, status = 400, details = {}) {
  return new Response(
    JSON.stringify({
      error: message,
      details
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

// Handle OPTIONS requests for CORS
export function handleOptionsRequest() {
  return new Response(null, {
    headers: {
      ...corsHeaders,
    }
  });
}

// Estimate token count for OpenAI (rough approximation)
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // OpenAI tokens are roughly 4 characters on average
  return Math.ceil(text.length / 4);
}
