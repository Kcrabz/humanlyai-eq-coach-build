import { StreamOptions } from './chatStreamTypes';

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
