
/**
 * Process a string of SSE data
 */
export function processStringSSEData(
  data: string,
  assistantMessageId: string,
  updateAssistantMessage: ((id: string, content: string) => void) | undefined,
  setUsageInfo: (info: any) => void
): string | null {
  try {
    // Handle string format: Parse as SSE or direct content
    const sseLines = data.split('\n');
    let fullContent = '';
    let usageInfo = null;
    
    for (const line of sseLines) {
      if (line.startsWith('data: ')) {
        const eventData = line.replace('data: ', '');
        
        try {
          const parsedData = JSON.parse(eventData);
          
          if (parsedData.content) {
            fullContent += parsedData.content;
            
            // Update the UI with each chunk if update function available
            if (updateAssistantMessage) {
              updateAssistantMessage(assistantMessageId, fullContent);
            }
          }
          
          // Capture usage info if available
          if (parsedData.usage) {
            usageInfo = parsedData.usage;
          }
        } catch (e) {
          // If not valid JSON, use directly as content
          fullContent += eventData;
          
          if (updateAssistantMessage) {
            updateAssistantMessage(assistantMessageId, fullContent);
          }
        }
      }
    }
    
    // Set final usage info if found
    if (usageInfo && setUsageInfo) {
      setUsageInfo(usageInfo);
    }
    
    // Final update with complete content
    if (updateAssistantMessage && fullContent) {
      updateAssistantMessage(assistantMessageId, fullContent);
      return fullContent;
    }
    
    return null;
  } catch (error) {
    console.error("Error processing string SSE data:", error);
    return null;
  }
}

/**
 * Process an object response
 */
export function processObjectResponse(
  data: any,
  assistantMessageId: string,
  updateAssistantMessage: ((id: string, content: string) => void) | undefined,
  setUsageInfo: (info: any) => void
): string | null {
  try {
    // Look for content in standard object response
    if (data.response) {
      const content = data.response;
      
      if (updateAssistantMessage) {
        updateAssistantMessage(assistantMessageId, content);
      }
      
      // Check for usage info
      if (data.usage) {
        setUsageInfo(data.usage);
      }
      
      return content;
    }
    
    return null;
  } catch (error) {
    console.error("Error processing object response:", error);
    return null;
  }
}

/**
 * Create a fallback message when processing fails
 */
export function createFallbackMessage(
  assistantMessageId: string,
  updateAssistantMessage: ((id: string, content: string) => void) | undefined
): void {
  if (updateAssistantMessage) {
    updateAssistantMessage(
      assistantMessageId, 
      "I apologize, but I encountered an issue processing your request. Please try again."
    );
  }
}
