
import { createErrorResponse, corsHeaders, estimateTokenCount } from "./utils.ts";
import { createSupabaseClient, getAuthenticatedUser, getOpenAIApiKey, getUserProfileAndUsage } from "./authClient.ts";
import { checkUsageLimit, updateUsageTracking, logChatMessages } from "./usageTracking.ts";
import { prepareMessages, callOpenAI } from "./openaiService.ts";
import { handleCommonErrors, retrieveChatHistory } from "./handlerUtils.ts";
import { createStreamResponse } from "./streamHandler.ts";

// Stream handler for chat completion
export async function handleStreamingChatCompletion(req: Request, reqBody: any) {
  const supabaseClient = createSupabaseClient(req);
  
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(supabaseClient);
    console.log(`Processing streaming chat request for user: ${user.id}`);
    
    // Extract user message from request body
    const { message } = reqBody;
    
    if (!message) {
      throw new Error("Message content is required");
    }
    
    // Get OpenAI API key
    const openAiApiKey = await getOpenAIApiKey(supabaseClient, user.id);
    
    // Get user profile and usage data
    const { 
      archetype, 
      coachingMode, 
      subscriptionTier, 
      currentUsage, 
      monthYear 
    } = await getUserProfileAndUsage(supabaseClient, user.id);
    
    // Check usage limits
    const tierLimit = checkUsageLimit(currentUsage, subscriptionTier);
    
    // Get chat history for premium users
    const chatHistory = await retrieveChatHistory(supabaseClient, user.id, subscriptionTier);
    
    // Prepare messages for OpenAI
    const messages = prepareMessages(message, archetype, coachingMode, chatHistory);
    
    // Create and return streaming response
    return await createStreamResponse(
      openAiApiKey, 
      messages, 
      supabaseClient, 
      user.id, 
      monthYear, 
      subscriptionTier, 
      currentUsage, 
      tierLimit
    );
    
  } catch (error) {
    return handleCommonErrors(error);
  }
}

// Non-streaming handler for chat completion (fallback)
export async function handleChatCompletion(req: Request, reqBody: any) {
  const supabaseClient = createSupabaseClient(req);
  
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(supabaseClient);
    console.log(`Processing chat request for user: ${user.id}`);
    
    // Extract user message from request
    const { message } = reqBody;
    
    if (!message) {
      throw new Error("Message content is required");
    }
    
    // Get OpenAI API key
    const openAiApiKey = await getOpenAIApiKey(supabaseClient, user.id);
    
    // Get user profile and usage data
    const { 
      archetype, 
      coachingMode, 
      subscriptionTier, 
      currentUsage, 
      monthYear 
    } = await getUserProfileAndUsage(supabaseClient, user.id);
    
    // Check usage limits
    const tierLimit = checkUsageLimit(currentUsage, subscriptionTier);
    
    // Get chat history for premium users
    const chatHistory = await retrieveChatHistory(supabaseClient, user.id, subscriptionTier);
    
    // Prepare messages for OpenAI
    const messages = prepareMessages(message, archetype, coachingMode, chatHistory);
    
    // Calculate estimated token count for input
    const inputText = messages.map(m => m.content).join(' ');
    const estimatedInputTokens = estimateTokenCount(inputText);
    
    // Make OpenAI API call
    const assistantResponse = await callOpenAI(openAiApiKey, messages);
    
    // Calculate estimated token count for output
    const estimatedOutputTokens = estimateTokenCount(assistantResponse);
    const totalTokensUsed = estimatedInputTokens + estimatedOutputTokens;
    
    // Update usage tracking
    await updateUsageTracking(supabaseClient, user.id, monthYear, totalTokensUsed);
    
    // Log chat messages for premium users
    if (subscriptionTier === 'premium') {
      await logChatMessages(
        supabaseClient, 
        user.id, 
        message, 
        assistantResponse, 
        estimatedInputTokens, 
        estimatedOutputTokens
      );
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        usage: {
          currentUsage: currentUsage + totalTokensUsed,
          limit: tierLimit,
          tokensUsed: totalTokensUsed
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return handleCommonErrors(error);
  }
}
