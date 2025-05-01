
import { createErrorResponse, corsHeaders } from "./utils.ts";

// Helper function to handle common error responses
export function handleCommonErrors(error: any) {
  console.error('Error in chat completion:', error);
  
  // Handle specific error types
  if (error.type === 'usage_limit') {
    return createErrorResponse(
      error.message,
      402,
      { 
        usageLimit: true,
        currentUsage: error.currentUsage,
        tierLimit: error.tierLimit
      }
    );
  }
  
  if (error.type === 'quota_exceeded') {
    return createErrorResponse(
      error.message,
      429,
      { 
        quotaExceeded: true,
        details: error.details
      }
    );
  }
  
  if (error.type === 'invalid_key') {
    return createErrorResponse(
      error.message,
      401,
      { 
        invalidKey: true,
        details: error.details
      }
    );
  }
  
  if (error.message === 'Unauthorized') {
    return createErrorResponse('Unauthorized', 401);
  }
  
  // Generic error response
  return createErrorResponse(
    "An unexpected error occurred processing your request.",
    500,
    { details: error.message || "No specific details available" }
  );
}

// Handler for premium user chat history retrieval
export async function retrieveChatHistory(supabaseClient: any, userId: string, subscriptionTier: string) {
  let chatHistory = [];
  
  if (subscriptionTier === 'premium') {
    // Get the last 10 messages from chat_logs
    const { data: chatHistoryData, error: chatHistoryError } = await supabaseClient
      .from('chat_logs')
      .select('content, role')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!chatHistoryError && chatHistoryData) {
      chatHistory = chatHistoryData;
      console.log(`Retrieved ${chatHistory.length} previous messages for premium user`);
    }
  }
  
  return chatHistory;
}
