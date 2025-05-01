
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
  let isFirstChunk = true;
  
  // Process the stream
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      
      // Process all lines in the chunk
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        
        try {
          // Extract and parse the JSON data
          const jsonStr = line.substring(6); // Remove 'data: ' prefix
          const data = JSON.parse(jsonStr);
          
          // Handle different message types
          if (data.type === 'init') {
            // Initialize streaming, do nothing special
            console.log("Stream initialized");
          } 
          else if (data.type === 'chunk') {
            // Received a content chunk
            if (isFirstChunk) {
              // Create the assistant message with the first chunk
              updateAssistantMessage(assistantMessageId, data.content);
              isFirstChunk = false;
            } else {
              // Append to the existing assistant message
              assistantResponse += data.content;
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
        } catch (e) {
          console.error("Error parsing stream data:", e, line);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
