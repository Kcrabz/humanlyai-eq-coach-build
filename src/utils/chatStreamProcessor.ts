
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
  let isCompleted = false;
  
  // Pre-compile regex patterns for better performance
  const dataLineRegex = /^data: (.+)$/;
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      // Check if we've reached the end of the stream
      if (done) {
        console.log("Stream reader reports done, processing completed");
        isCompleted = true;
        break;
      }
      
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
        if (jsonStr === "[DONE]") {
          console.log("Received [DONE] marker in stream");
          isCompleted = true;
          continue;
        }
        
        try {
          const data = JSON.parse(jsonStr);
          
          // Handle different types of events efficiently
          if (data.type === "chunk" && data.content) {
            fullResponse += data.content;
            // Only update if there's actual content
            if (fullResponse.trim()) {
              updateAssistantMessage(assistantMessageId, fullResponse);
              messageUpdatedCount++;
              hasStartedResponse = true;
            }
          } 
          else if (data.type === "complete") {
            isCompleted = true;
            if (data.usage) {
              // Update usage info when complete
              setUsageInfo({
                currentUsage: data.usage.currentUsage,
                limit: data.usage.limit,
                percentage: (data.usage.currentUsage / data.usage.limit) * 100
              });
            }
          }
          else if (data.content) {
            fullResponse += data.content;
            // Only update if there's actual content
            if (fullResponse.trim()) {
              updateAssistantMessage(assistantMessageId, fullResponse);
              messageUpdatedCount++;
              hasStartedResponse = true;
            }
          }
          else if (data.choices?.[0]?.delta?.content) {
            fullResponse += data.choices[0].delta.content;
            // Only update if there's actual content
            if (fullResponse.trim()) {
              updateAssistantMessage(assistantMessageId, fullResponse);
              messageUpdatedCount++;
              hasStartedResponse = true;
            }
          }
          else if (data.choices?.[0]?.message?.content) {
            fullResponse = data.choices[0].message.content;
            // Only update if there's actual content
            if (fullResponse.trim()) {
              updateAssistantMessage(assistantMessageId, fullResponse);
              messageUpdatedCount++;
              hasStartedResponse = true;
            }
            // This is likely a completion message
            isCompleted = true;
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
            // Only update if there's actual content
            if (fullResponse.trim()) {
              updateAssistantMessage(assistantMessageId, fullResponse);
              messageUpdatedCount++;
            }
          }
        } catch (e) {
          // Ignore errors in final buffer processing
        }
      }
    }
    
    console.log(`Stream completed for message ${assistantMessageId}. Updated content ${messageUpdatedCount} times. Content length: ${fullResponse.length}`);
    
    // If after all processing we still have no real content or no updates happened,
    // delete the message by sending null content 
    if (!fullResponse.trim() || messageUpdatedCount === 0) {
      console.log(`Stream completed with empty response or no updates - removing empty bubble`);
      // Use null to signal that the message should be removed completely
      updateAssistantMessage(assistantMessageId, null);
    }
    
    // Message completed successfully - very important to signal completion
    console.log("Setting lastSentMessage to null to indicate completion");
    setLastSentMessage(null);
    
    // Return the full response
    return fullResponse;
  } catch (error) {
    console.error("Error in stream handler:", error);
    
    // On error, remove the bubble completely
    console.log(`Error in stream handler, removing empty bubble`);
    updateAssistantMessage(assistantMessageId, null);
    
    // Still need to signal completion even on error
    console.log("Setting lastSentMessage to null after error");
    setLastSentMessage(null);
    
    throw error;
  }
}
