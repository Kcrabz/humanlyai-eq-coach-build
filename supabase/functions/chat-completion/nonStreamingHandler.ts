
import { corsHeaders } from "./utils.ts";
import { prepareUserData, getChatHistory } from "./userService.ts";
import { extractUserMessage, prepareMessagesForAI, calculateTokenUsage } from "./messageService.ts";
import { callOpenAI } from "./openaiService.ts";
import { updateUsageTracking, logChatMessages } from "./usageTracking.ts";
import { handleCommonErrors } from "./handlerUtils.ts";

// Non-streaming handler for chat completion
export async function handleChatCompletion(req: Request, reqBody: any) {
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
    
    // Extract message and history from request
    const { userMessage, clientProvidedHistory } = extractUserMessage(reqBody);
    
    // Get chat history based on subscription tier
    const chatHistory = await getChatHistory(
      supabaseClient, 
      user.id, 
      effectiveSubscriptionTier,
      clientProvidedHistory
    );
    
    // Prepare messages for OpenAI
    const preparedMessages = prepareMessagesForAI(
      userMessage,
      effectiveArchetype,
      effectiveCoachingMode,
      chatHistory
    );
    
    console.log(`Prepared ${preparedMessages.length} messages for OpenAI`);
    
    // Make OpenAI API call
    const assistantResponse = await callOpenAI(openAiApiKey, preparedMessages);
    
    // Calculate token usage
    const { inputTokens, outputTokens, totalTokens } = calculateTokenUsage(preparedMessages, assistantResponse);
    
    // Update usage tracking
    await updateUsageTracking(supabaseClient, user.id, monthYear, totalTokens);
    
    // Log chat messages for premium users
    if (effectiveSubscriptionTier === 'premium') {
      await logChatMessages(
        supabaseClient, 
        user.id, 
        userMessage, 
        assistantResponse, 
        inputTokens, 
        outputTokens
      );
      
      console.log("Logged chat messages for premium user");
    } else {
      console.log(`Chat messages not logged for ${effectiveSubscriptionTier} tier user`);
    }
    
    // Return successful response with both response and content fields to ensure compatibility
    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        content: assistantResponse,  // Add content field for compatibility
        usage: {
          currentUsage: currentUsage + totalTokens,
          limit: tierLimit,
          tokensUsed: totalTokens
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in chat completion:", error);
    return handleCommonErrors(error);
  }
}
