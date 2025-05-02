
import { corsHeaders, createErrorResponse } from "./utils.ts";

// Retrieve chat history for a user
export async function retrieveChatHistory(supabaseClient: any, userId: string, messageLimit: number = 10) {
  try {
    // For premium users, fetch recent chat history
    const { data, error } = await supabaseClient
      .from('chat_logs')
      .select('content, role')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(messageLimit * 2); // Fetch both user and assistant messages (2 messages per exchange)
    
    if (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
    
    // Return chat history in chronological order (oldest first)
    return data?.reverse() || [];
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    return []; // Return empty array on error
  }
}

// Common error handler for chat completion functions
export function handleCommonErrors(error: any) {
  console.error("Error in chat completion:", error);
  
  // Handle OpenAI-specific errors
  if (error.type === 'openai_error') {
    return createErrorResponse(
      error.message || "OpenAI API error",
      400,
      { details: error.details || "No details provided" }
    );
  }
  
  // Handle usage limit errors
  if (error.type === 'usage_limit') {
    return new Response(
      JSON.stringify({
        error: error.message,
        usageLimit: true,
        currentUsage: error.currentUsage,
        tierLimit: error.tierLimit
      }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Handle other types of errors
  return createErrorResponse(
    error.message || "An error occurred during chat completion",
    500,
    { details: error.stack || "No stack trace available" }
  );
}
