
import { StreamOptions } from './chatStreamTypes';

/**
 * Process a stream of SSE events from the chat API
 * Optimized for performance with better buffer handling
 */
export async function handleChatStream(reader: ReadableStreamDefaultReader<Uint8Array>, options: StreamOptions) {
  const { assistantMessageId, updateAssistantMessage, setLastSentMessage, setUsageInfo } = options;
  
  const decoder = new TextDecoder();
  let buffer = "";
  let fullResponse = "";
  let hasStartedResponse = false;
  let messageUpdatedCount = 0;
  
  // Pre-compile regex patterns for better performance
  const dataLineRegex = /^data: (.+)$/;
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode new chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines in the buffer
      const lines = buffer.split("\n");
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || "";
      
      // Process each complete line
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const match = line.match(dataLineRegex);
        if (!match) continue;
        
        const jsonStr = match[1];
        if (jsonStr === "[DONE]") continue;
        
        try {
          const data = JSON.parse(jsonStr);
          
          // Handle different types of events efficiently
          if (data.type === "chunk" && data.content) {
            fullResponse += data.content;
            updateAssistantMessage(assistantMessageId, fullResponse);
            messageUpdatedCount++;
            hasStartedResponse = true;
          } 
          else if (data.type === "complete" && data.usage) {
            // Update usage info when complete
            setUsageInfo({
              currentUsage: data.usage.currentUsage,
              limit: data.usage.limit,
              percentage: (data.usage.currentUsage / data.usage.limit) * 100
            });
          }
          else if (data.content) {
            fullResponse += data.content;
            updateAssistantMessage(assistantMessageId, fullResponse);
            messageUpdatedCount++;
            hasStartedResponse = true;
          }
          else if (data.choices?.[0]?.delta?.content) {
            fullResponse += data.choices[0].delta.content;
            updateAssistantMessage(assistantMessageId, fullResponse);
            messageUpdatedCount++;
            hasStartedResponse = true;
          }
          else if (data.choices?.[0]?.message?.content) {
            fullResponse = data.choices[0].message.content;
            updateAssistantMessage(assistantMessageId, fullResponse);
            messageUpdatedCount++;
            hasStartedResponse = true;
          }
          
          // Log progress for debugging
          if (hasStartedResponse && fullResponse.length % 100 === 0) {
            console.log(`Stream progress: ${fullResponse.length} chars received for message ${assistantMessageId}`);
          }
        } catch (err) {
          // Just skip invalid JSON rather than logging errors
          continue;
        }
      }
    }
    
    // Final decoder flush for any remaining content
    const remaining = decoder.decode();
    if (remaining) buffer += remaining;
    
    // Process any remaining content in the buffer
    if (buffer.trim()) {
      const match = buffer.match(dataLineRegex);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          if (data.content) {
            fullResponse += data.content;
            updateAssistantMessage(assistantMessageId, fullResponse);
            messageUpdatedCount++;
          }
        } catch (e) {
          // Ignore errors in final buffer processing
        }
      }
    }
    
    console.log(`Stream completed for message ${assistantMessageId}. Updated content ${messageUpdatedCount} times. Content length: ${fullResponse.length}`);
    
    // CRITICAL: Always ensure we have content to force removal of typing indicator
    if (fullResponse === "" || messageUpdatedCount === 0) {
      console.log(`Stream completed with empty response - ensuring typing indicator is removed by setting non-empty content`);
      // Use a visible space character to ensure the typing indicator is removed
      updateAssistantMessage(assistantMessageId, " ");
    }
    
    // Message completed successfully
    setLastSentMessage(null);
    
    // Return the full response
    return fullResponse;
  } catch (error) {
    console.error("Error in stream handler:", error);
    
    // Even on error, ensure we remove the typing indicator by using a space
    console.log(`Error in stream handler, ensuring typing indicator is removed by setting non-empty content`);
    updateAssistantMessage(assistantMessageId, " Error during message processing.");
    
    setLastSentMessage(null);
    
    throw error;
  }
}
