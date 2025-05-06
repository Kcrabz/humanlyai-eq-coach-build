
import { streamOpenAI } from "./streamingService.ts";
import { updateUsageTracking, logChatMessages } from "./usageTracking.ts";
import { estimateTokenCount, corsHeaders, TIER_LIMITS } from "./utils.ts";

// Handle streaming response creation and processing - optimized for performance
export async function createStreamResponse(
  openAiApiKey: string, 
  messages: any[], 
  supabaseClient: any, 
  userId: string, 
  monthYear: string, 
  subscriptionTier: string, 
  currentUsage: number, 
  tierLimit: number
) {
  const encoder = new TextEncoder();
  let fullResponse = "";
  
  // Use token estimation cache map to avoid recalculating
  const tokenEstimationCache = new Map<string, number>();
  
  // Calculate estimated token count for input with caching
  const inputText = messages.map(m => m.content).join(' ');
  let estimatedInputTokens = tokenEstimationCache.get(inputText);
  if (estimatedInputTokens === undefined) {
    estimatedInputTokens = estimateTokenCount(inputText);
    tokenEstimationCache.set(inputText, estimatedInputTokens);
  }
  
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
      
      // Calculate estimated token count for output with caching
      let estimatedOutputTokens = tokenEstimationCache.get(fullResponse);
      if (estimatedOutputTokens === undefined) {
        estimatedOutputTokens = estimateTokenCount(fullResponse);
        tokenEstimationCache.set(fullResponse, estimatedOutputTokens);
      }
      
      const totalTokensUsed = estimatedInputTokens + estimatedOutputTokens;
      
      // Update usage tracking in background for performance
      const trackingPromise = updateUsageTracking(supabaseClient, userId, monthYear, totalTokensUsed);
      
      // Only log chat messages for premium users and do it in background
      let loggingPromise = Promise.resolve();
      if (subscriptionTier === 'premium') {
        loggingPromise = logChatMessages(
          supabaseClient, 
          userId, 
          messages[messages.length - 1].content, 
          fullResponse, 
          estimatedInputTokens, 
          estimatedOutputTokens
        );
      }
      
      // Send completion message with usage info immediately
      const completionData = {
        type: 'complete',
        usage: {
          currentUsage: currentUsage + totalTokensUsed,
          limit: tierLimit,
          tokensUsed: totalTokensUsed
        }
      };
      await writer.write(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
      
      // Wait for background operations to complete before closing
      await Promise.allSettled([trackingPromise, loggingPromise]);
      
    } catch (error) {
      console.error('Error in streaming:', error);
      
      // Send error message to client
      const errorData = {
        type: 'error',
        error: error.message || 'Unknown error'
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
}
