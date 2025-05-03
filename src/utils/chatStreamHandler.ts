
export interface StreamingOptions {
  assistantMessageId: string;
  updateAssistantMessage: (id: string, content: string) => void;
  setLastSentMessage: (message: string | null) => void;
  setUsageInfo: (usageInfo: UsageInfo | null) => void;
}

export interface UsageInfo {
  currentUsage: number;
  limit: number;
  percentage: number;
}

export const handleChatStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  options: StreamingOptions
) => {
  const { 
    assistantMessageId, 
    updateAssistantMessage,
    setLastSentMessage, 
    setUsageInfo 
  } = options;
  
  const decoder = new TextDecoder();
  
  // Initialize empty string for the assistant's response
  let assistantResponse = "";
  
  // Process the stream
  try {
    console.log("Starting to process stream chunks");
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("Stream reading complete");
        break;
      }
      
      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      console.log("Received chunk:", chunk);
      
      // Process all lines in the chunk
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          // Check if line starts with "data: "
          if (line.startsWith('data: ')) {
            // Extract and parse the JSON data
            const jsonStr = line.substring(6); // Remove 'data: ' prefix
            
            // Skip [DONE] messages which aren't JSON
            if (jsonStr.trim() === '[DONE]') {
              console.log("Received [DONE] message");
              continue;
            }
            
            try {
              const data = JSON.parse(jsonStr);
              console.log("Parsed data:", data);
              
              // Handle different message types
              if (data.type === 'init') {
                // Initialize streaming, do nothing special
                console.log("Stream initialized");
              } 
              else if (data.type === 'chunk') {
                // Received a content chunk
                if (data.content) {
                  // Append to the existing assistant message
                  assistantResponse += data.content;
                  console.log("Updating assistant message with content:", assistantResponse);
                  updateAssistantMessage(assistantMessageId, assistantResponse);
                }
              }
              else if (data.type === 'complete') {
                // Stream completed successfully
                console.log("Streaming completed");
                
                // Update usage info
                if (data.usage) {
                  setUsageInfo({
                    currentUsage: data.usage.currentUsage,
                    limit: data.usage.limit,
                    percentage: (data.usage.currentUsage / data.usage.limit) * 100
                  });
                }
                
                // Clear last sent message since it was successful
                setLastSentMessage(null);
              }
              else if (data.type === 'error') {
                // Handle error in stream
                console.error("Error in stream:", data.error, data.details);
                throw { 
                  message: data.error || "Error in stream", 
                  details: data.details 
                };
              }
            } catch (parseError) {
              console.error("Error parsing JSON data:", parseError, "Raw data:", jsonStr);
            }
          } else {
            console.log("Received non-data line:", line);
          }
        } catch (e) {
          console.error("Error processing stream line:", e, line);
        }
      }
    }
  } catch (error) {
    console.error("Error in chat stream processing:", error);
    throw error;
  } finally {
    reader.releaseLock();
    console.log("Reader released");
  }
};
