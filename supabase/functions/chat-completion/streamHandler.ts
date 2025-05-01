
import { streamOpenAI } from "./openaiService.ts";
import { updateUsageTracking, logChatMessages } from "./usageTracking.ts";
import { estimateTokenCount, corsHeaders } from "./utils.ts";

// Handle streaming response creation and processing
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
  
  // Calculate estimated token count for input
  const inputText = messages.map(m => m.content).join(' ');
  const estimatedInputTokens = estimateTokenCount(inputText);
  
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
      await updateUsageTracking(supabaseClient, userId, monthYear, totalTokensUsed);
      
      // Log chat messages for premium users
      if (subscriptionTier === 'premium') {
        await logChatMessages(
          supabaseClient, 
          userId, 
          messages[messages.length - 1].content, 
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
}
