
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createErrorResponse, handleOptionsRequest } from "./utils.ts";
import { parseRequestOnce } from "./requestParser.ts";
import { handleStreamingChatCompletion, handleChatCompletion } from "./handlers.ts";

// Main entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // Parse the request body once
    const { body, originalRequest } = await parseRequestOnce(req);
    
    // Check for streaming request - default to non-streaming now
    const wantsStream = body.stream === true;
    
    if (wantsStream) {
      console.log("Processing as streaming request");
      return handleStreamingChatCompletion(originalRequest, body);
    } else {
      console.log("Processing as non-streaming request");
      return handleChatCompletion(originalRequest, body);
    }
  } catch (error) {
    console.error('Unhandled error in chat completion function:', error);
    return createErrorResponse(
      "An unexpected error occurred processing your request.",
      500,
      { details: error.message || "No specific details available" }
    );
  }
});
