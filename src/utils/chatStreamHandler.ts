
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
    
    // We need to ensure the chat bubble appears first
    updateAssistantMessage(assistantMessageId, "...");
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("Stream reading complete");
        break;
      }
      
      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      console.log("Received chunk of size:", chunk.length);
      
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
                  console.log("Updating assistant message with content:", assistantResponse.substring(0, 50) + "...");
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
                
                // If we didn't get any content through streaming, but have a response in the complete message
                if (assistantResponse.length === 0 && data.response) {
                  console.log("Using response from complete message:", data.response);
                  updateAssistantMessage(assistantMessageId, data.response);
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
              // If we get a direct response without a type (fallback case)
              else if (data.choices && data.choices[0] && data.choices[0].message) {
                // This is a direct OpenAI API response format
                const content = data.choices[0].message.content;
                console.log("Got direct OpenAI API response:", content);
                assistantResponse = content;
                updateAssistantMessage(assistantMessageId, content);
              }
            } catch (parseError) {
              console.error("Error parsing JSON data:", parseError, "Raw data:", jsonStr);
              
              // If it's not valid JSON but has text content, try to use it anyway
              if (jsonStr && typeof jsonStr === 'string' && !jsonStr.includes('[DONE]')) {
                console.log("Using non-JSON data as content:", jsonStr);
                assistantResponse += jsonStr;
                updateAssistantMessage(assistantMessageId, assistantResponse);
              }
            }
          } else if (line.includes('content') || line.includes('response')) {
            // Try to handle non-standard formats that might contain content
            console.log("Received possible content line:", line);
            try {
              const possibleData = JSON.parse(line);
              if (possibleData.content || possibleData.response) {
                const content = possibleData.content || possibleData.response;
                assistantResponse += content;
                updateAssistantMessage(assistantMessageId, assistantResponse);
              }
            } catch (e) {
              // Not JSON, could be just text
              if (!line.includes('{') && !line.includes('}')) {
                assistantResponse += line;
                updateAssistantMessage(assistantMessageId, assistantResponse);
              }
            }
          } else {
            console.log("Received non-data line:", line);
          }
        } catch (e) {
          console.error("Error processing stream line:", e, line);
        }
      }
    }
    
    // Final check - if we got no response at all, add a fallback message
    if (assistantResponse.length === 0) {
      console.warn("No content received from stream, adding fallback message");
      const fallbackMessage = "I'm Kai, your EQ coach. I'm here to help with your emotional intelligence development. What would you like to work on today?";
      updateAssistantMessage(assistantMessageId, fallbackMessage);
    }
  } catch (error) {
    console.error("Error in chat stream processing:", error);
    
    // Add another fallback message
    const fallbackMessage = "I'm Kai, your EQ coach. I'm here to help with your emotional intelligence development. What would you like to work on today?";
    updateAssistantMessage(assistantMessageId, fallbackMessage);
    
    throw error;
  } finally {
    reader.releaseLock();
    console.log("Reader released");
  }
};
