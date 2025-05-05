
import { createStreamResponse } from "./streamHandler.ts";
import { prepareUserData, getChatHistory } from "./userService.ts";
import { extractUserMessage, prepareMessagesForAI } from "./messageService.ts";
import { handleCommonErrors } from "./handlerUtils.ts";

// Optimized stream handler for chat completion
export async function handleStreamingChatCompletion(req: Request, reqBody: any) {
  try {
    // Get user data and settings
    const {
      supabaseClient,
      user,
      openAiApiKey,
      effectiveArchetype,
      effectiveCoachingMode,
      effectiveSubscriptionTier,
      currentUsage,
      tierLimit,
      monthYear
    } = await prepareUserData(req, reqBody);
    
    // Extract message and history from request - using cached data if possible
    const { userMessage, clientProvidedHistory } = extractUserMessage(reqBody);
    
    // Get chat history based on subscription tier
    const chatHistory = await getChatHistory(
      supabaseClient, 
      user.id, 
      effectiveSubscriptionTier,
      clientProvidedHistory
    );
    
    // Prepare messages for OpenAI - optimized to reuse cached system messages when possible
    const preparedMessages = prepareMessagesForAI(
      userMessage,
      effectiveArchetype,
      effectiveCoachingMode,
      chatHistory
    );
    
    console.log(`Prepared ${preparedMessages.length} messages for OpenAI streaming`);
    
    // Create and return streaming response
    return await createStreamResponse(
      openAiApiKey, 
      preparedMessages, 
      supabaseClient, 
      user.id, 
      monthYear, 
      effectiveSubscriptionTier, 
      currentUsage, 
      tierLimit
    );
    
  } catch (error) {
    console.error("Error in streaming completion:", error);
    return handleCommonErrors(error);
  }
}
