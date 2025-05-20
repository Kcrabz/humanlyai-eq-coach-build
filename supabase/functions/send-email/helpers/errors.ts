
import { corsHeaders } from './cors.ts';

// Error response helper
export function createErrorResponse(error: any, status = 500): Response {
  console.error("Error in send-email function:", error);
  return new Response(
    JSON.stringify({ error: error.message }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
