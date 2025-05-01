
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to handle OPTIONS requests
export function handleOptionsRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Helper function to create error responses
export function createErrorResponse(message: string, status = 500, additionalData = {}) {
  return new Response(
    JSON.stringify({ 
      error: message,
      ...additionalData 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Token limits per subscription tier
export const TIER_LIMITS = {
  free: 15000,     // Free trial
  basic: 105000,   // Basic tier
  premium: 245000  // Premium tier
};

// Utility to count tokens (simple approximation)
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
