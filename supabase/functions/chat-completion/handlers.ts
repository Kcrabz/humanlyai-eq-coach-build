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
    
    // Extract user message and optional context from request body
    // Handle both formats: {message: string} or {messages: Array}
    let userMessage;
    let clientProvidedHistory = [];
    const { 
      message, 
      messages,
      subscriptionTier: clientSubscriptionTier,
      archetype: clientArchetype,
      coachingMode: clientCoachingMode 
    } = reqBody;
    
    // Determine which message format was used
    if (message) {
      userMessage = message;
      console.log("Using single message format:", userMessage.substring(0, 50) + "...");
    } else if (messages && Array.isArray(messages) && messages.length > 0) {
      // If messages array provided, use it for history and extract the last user message
      clientProvidedHistory = messages;
      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      userMessage = lastUserMsg?.content || '';
      console.log("Using messages array format, last user message:", userMessage.substring(0, 50) + "...");
      console.log(`Client provided ${messages.length} messages as context`);
    } else {
      throw new Error("No valid message content found in request");
    }
    
    if (!userMessage || userMessage.trim() === '') {
      throw new Error("Message content is required and cannot be empty");
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
    
    // Use client-provided values as fallbacks if available
    const effectiveArchetype = archetype || clientArchetype || 'unknown';
    const effectiveCoachingMode = coachingMode || clientCoachingMode || 'normal';
    const effectiveSubscriptionTier = subscriptionTier || clientSubscriptionTier || 'free';
    
    console.log(`User settings: archetype=${effectiveArchetype}, coachingMode=${effectiveCoachingMode}, tier=${effectiveSubscriptionTier}`);
    
    // Check usage limits
    const tierLimit = checkUsageLimit(currentUsage, effectiveSubscriptionTier);
    
    // Get chat history based on subscription tier
    let chatHistory = [];
    
    if (effectiveSubscriptionTier === 'premium') {
      // For premium users, get history from database
      chatHistory = await retrieveChatHistory(supabaseClient, user.id, 5);
    } else if (clientProvidedHistory.length > 0) {
      // For non-premium users, use the client-provided history
      // Filter out system messages and keep only recent history
      chatHistory = clientProvidedHistory
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .slice(0, effectiveSubscriptionTier === 'basic' ? 8 : 4); // Basic: 4 exchanges, Free: 2 exchanges
      
      console.log(`Using ${chatHistory.length} messages from client-provided history for ${effectiveSubscriptionTier} user`);
    }
    
    // Prepare messages for OpenAI
    const preparedMessages = prepareMessages(userMessage, effectiveArchetype, effectiveCoachingMode, chatHistory);
    
    console.log(`Prepared ${preparedMessages.length} messages for OpenAI`);
    
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

// Non-streaming handler for chat completion (fallback)
export async function handleChatCompletion(req: Request, reqBody: any) {
  const supabaseClient = createSupabaseClient(req);
  
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(supabaseClient);
    console.log(`Processing chat request for user: ${user.id}`);
    
    // Extract user message and optional context from request
    // Handle both formats: {message: string} or {messages: Array}
    let userMessage;
    let clientProvidedHistory = [];
    const { 
      message,
      messages,
      subscriptionTier: clientSubscriptionTier,
      archetype: clientArchetype,
      coachingMode: clientCoachingMode 
    } = reqBody;
    
    // Determine which message format was used
    if (message) {
      userMessage = message;
      console.log("Using single message format:", userMessage.substring(0, 50) + "...");
    } else if (messages && Array.isArray(messages) && messages.length > 0) {
      // If messages array provided, use it for history and the last user message
      clientProvidedHistory = messages;
      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      userMessage = lastUserMsg?.content || '';
      console.log("Using messages array format, last user message:", userMessage.substring(0, 50) + "...");
      console.log(`Client provided ${messages.length} messages as context`);
    } else {
      throw new Error("No valid message content found in request");
    }
    
    if (!userMessage || userMessage.trim() === '') {
      throw new Error("Message content is required and cannot be empty");
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
    
    // Use client-provided values as fallbacks if available
    const effectiveArchetype = archetype || clientArchetype || 'unknown';
    const effectiveCoachingMode = coachingMode || clientCoachingMode || 'normal';
    const effectiveSubscriptionTier = subscriptionTier || clientSubscriptionTier || 'free';
    
    console.log(`User settings: archetype=${effectiveArchetype}, coachingMode=${effectiveCoachingMode}, tier=${effectiveSubscriptionTier}`);
    
    // Check usage limits
    const tierLimit = checkUsageLimit(currentUsage, effectiveSubscriptionTier);
    
    // Get chat history based on subscription tier
    let chatHistory = [];
    
    if (effectiveSubscriptionTier === 'premium') {
      // For premium users, get history from database
      chatHistory = await retrieveChatHistory(supabaseClient, user.id, 5);
    } else if (clientProvidedHistory.length > 0) {
      // For non-premium users, use the client-provided history
      // Filter out system messages and keep only recent history
      chatHistory = clientProvidedHistory
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .slice(0, effectiveSubscriptionTier === 'basic' ? 8 : 4); // Basic: 4 exchanges, Free: 2 exchanges
      
      console.log(`Using ${chatHistory.length} messages from client-provided history for ${effectiveSubscriptionTier} user`);
    }
    
    // Prepare messages for OpenAI
    const preparedMessages = prepareMessages(userMessage, effectiveArchetype, effectiveCoachingMode, chatHistory);
    
    // Calculate estimated token count for input
    const inputText = preparedMessages.map(m => m.content).join(' ');
    const estimatedInputTokens = estimateTokenCount(inputText);
    
    // Make OpenAI API call
    const assistantResponse = await callOpenAI(openAiApiKey, preparedMessages);
    
    // Calculate estimated token count for output
    const estimatedOutputTokens = estimateTokenCount(assistantResponse);
    const totalTokensUsed = estimatedInputTokens + estimatedOutputTokens;
    
    // Update usage tracking
    await updateUsageTracking(supabaseClient, user.id, monthYear, totalTokensUsed);
    
    // Log chat messages for premium users
    if (effectiveSubscriptionTier === 'premium') {
      await logChatMessages(
        supabaseClient, 
        user.id, 
        userMessage, 
        assistantResponse, 
        estimatedInputTokens, 
        estimatedOutputTokens
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
          currentUsage: currentUsage + totalTokensUsed,
          limit: tierLimit,
          tokensUsed: totalTokensUsed
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in chat completion:", error);
    return handleCommonErrors(error);
  }
}
