
import { createErrorResponse, corsHeaders, estimateTokenCount } from "./utils.ts";
import { createSupabaseClient, getAuthenticatedUser, getOpenAIApiKey, getUserProfileAndUsage } from "./authClient.ts";
import { checkUsageLimit, updateUsageTracking, logChatMessages } from "./usageTracking.ts";
import { prepareMessages, streamOpenAI, callOpenAI } from "./openaiService.ts";

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
    let chatHistory = [];
    if (subscriptionTier === 'premium') {
      // Get the last 10 messages from chat_logs
      const { data: chatHistoryData, error: chatHistoryError } = await supabaseClient
        .from('chat_logs')
        .select('content, role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!chatHistoryError && chatHistoryData) {
        chatHistory = chatHistoryData;
        console.log(`Retrieved ${chatHistory.length} previous messages for premium user`);
      }
    }
    
    // Prepare messages for OpenAI
    const messages = prepareMessages(message, archetype, coachingMode, chatHistory);
    
    // Calculate estimated token count for input
    const inputText = messages.map(m => m.content).join(' ');
    const estimatedInputTokens = estimateTokenCount(inputText);
    
    // Create a transformer to handle the streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";
    
    // Set up streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Process the streaming response
    (async () => {
      try {
        // Send initial data packet with message info
        const initialData = {
          type: 'init',
          message: 'Stream initialized'
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));
        
        // Process streaming responses
        for await (const chunk of streamOpenAI(openAiApiKey, messages)) {
          // Add each chunk to the full response
          fullResponse += chunk;
          
          // Send chunk to client
          const chunkData = {
            type: 'chunk',
            content: chunk
          };
          await writer.write(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
        }
        
        // Calculate estimated token count for output
        const estimatedOutputTokens = estimateTokenCount(fullResponse);
        const totalTokensUsed = estimatedInputTokens + estimatedOutputTokens;
        
        // Update usage tracking
        await updateUsageTracking(supabaseClient, user.id, monthYear, totalTokensUsed);
        
        // Log chat messages for premium users
        if (subscriptionTier === 'premium') {
          await logChatMessages(
            supabaseClient, 
            user.id, 
            message, 
            fullResponse, 
            estimatedInputTokens, 
            estimatedOutputTokens
          );
        }
        
        // Send completion message with usage info
        const completionData = {
          type: 'complete',
          usage: {
            currentUsage: currentUsage + totalTokensUsed,
            limit: tierLimit,
            tokensUsed: totalTokensUsed
          }
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
      } catch (error) {
        console.error('Error in streaming:', error);
        
        // Send error message to client
        const errorData = {
          type: 'error',
          error: error.message || 'Unknown error',
          details: error
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
      } finally {
        await writer.close();
      }
    })();
    
    // Return the stream response
    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in streaming chat completion:', error);
    
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
}

// Non-streaming handler for chat completion (fallback)
export async function handleChatCompletion(req: Request, reqBody: any) {
  const supabaseClient = createSupabaseClient(req);
  
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(supabaseClient);
    console.log(`Processing chat request for user: ${user.id}`);
    
    // Extract user message from request
    const { message, stream } = reqBody;
    
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
    let chatHistory = [];
    if (subscriptionTier === 'premium') {
      // Get the last 10 messages from chat_logs
      const { data: chatHistoryData, error: chatHistoryError } = await supabaseClient
        .from('chat_logs')
        .select('content, role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!chatHistoryError && chatHistoryData) {
        chatHistory = chatHistoryData;
        console.log(`Retrieved ${chatHistory.length} previous messages for premium user`);
      }
    }
    
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
    console.error('Error in chat completion function:', error);
    
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
}
