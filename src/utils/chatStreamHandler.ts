
export interface UsageInfo {
  currentUsage: number;
  limit: number;
  percentage: number;
}

interface StreamOptions {
  assistantMessageId: string;
  updateAssistantMessage: (id: string, content: string) => void;
  setLastSentMessage: (content: string | null) => void;
  setUsageInfo: (info: UsageInfo | null) => void;
}

/**
 * Process a stream of SSE events from the chat API
 */
export async function handleChatStream(reader: ReadableStreamDefaultReader<Uint8Array>, options: StreamOptions) {
  const { assistantMessageId, updateAssistantMessage, setLastSentMessage, setUsageInfo } = options;
  
  const decoder = new TextDecoder();
  let buffer = "";
  let fullResponse = "";
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode new chunk and add to buffer
      const chunk = decoder.decode(value);
      buffer += chunk;
      
      console.log("Received stream chunk of length:", chunk.length);
      
      // Process any complete events in buffer
      let lines = buffer.split("\n");
      
      // Keep last incomplete line in buffer
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        if (!line.trim() || !line.startsWith("data: ")) continue;
        if (line === "data: [DONE]") continue;
        
        try {
          // Extract the JSON payload after "data: "
          const jsonStr = line.substring(6); // length of "data: "
          const data = JSON.parse(jsonStr);
          
          // Handle different types of events
          if (data.type === "chunk" && data.content) {
            fullResponse += data.content;
            updateAssistantMessage(assistantMessageId, fullResponse);
          } 
          else if (data.type === "complete" && data.usage) {
            // Update usage info when complete
            setUsageInfo({
              currentUsage: data.usage.currentUsage,
              limit: data.usage.limit,
              percentage: (data.usage.currentUsage / data.usage.limit) * 100
            });
          }
          else if (data.type === "error") {
            console.error("Stream error:", data.error);
          }
          else if (data.content) {
            // Direct content in some implementations
            fullResponse += data.content;
            updateAssistantMessage(assistantMessageId, fullResponse);
          }
          // Try to extract content from other formats
          else if (data.choices && data.choices[0]?.delta?.content) {
            fullResponse += data.choices[0].delta.content;
            updateAssistantMessage(assistantMessageId, fullResponse);
          }
          else if (data.choices && data.choices[0]?.message?.content) {
            const content = data.choices[0].message.content;
            if (!fullResponse.includes(content)) {
              fullResponse = content; // Replace with full message
              updateAssistantMessage(assistantMessageId, fullResponse);
            }
          }
        } catch (err) {
          console.error("Error parsing stream data:", err, "Line:", line);
        }
      }
    }
    
    // Message completed successfully
    setLastSentMessage(null);
    
    // Return the full response
    return fullResponse;
  } catch (error) {
    console.error("Error in stream handler:", error);
    throw error;
  }
}

/**
 * Alternative function if we're getting direct SSE text content instead of a stream
 */
export function processSseText(text: string, options: StreamOptions) {
  const { assistantMessageId, updateAssistantMessage, setUsageInfo } = options;
  
  let fullResponse = "";
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const jsonStr = line.substring(6); // Remove 'data: ' prefix
        const data = JSON.parse(jsonStr);
        
        if (data.type === 'chunk' && data.content) {
          fullResponse += data.content;
          updateAssistantMessage(assistantMessageId, fullResponse);
        } else if (data.type === 'complete' && data.usage) {
          setUsageInfo({
            currentUsage: data.usage.currentUsage,
            limit: data.usage.limit,
            percentage: (data.usage.currentUsage / data.usage.limit) * 100
          });
        } else if (data.content) {
          fullResponse += data.content;
          updateAssistantMessage(assistantMessageId, fullResponse);
        } else if (data.choices && data.choices[0]?.delta?.content) {
          fullResponse += data.choices[0].delta.content;
          updateAssistantMessage(assistantMessageId, fullResponse);
        } else if (data.choices && data.choices[0]?.message?.content) {
          fullResponse = data.choices[0].message.content; // Replace with full message
          updateAssistantMessage(assistantMessageId, fullResponse);
        }
      } catch (e) {
        console.error("Error parsing SSE line:", e, "Line:", line);
      }
    }
  }
  
  return fullResponse;
}

/**
 * Utility to estimate token count in a text string
 * This is a simple approximation; actual token count depends on the tokenization algorithm used by the model
 */
export function estimateTokenCount(text: string): number {
  // A simple approximation: roughly 4 characters per token for English text
  return Math.ceil(text.length / 4);
}
