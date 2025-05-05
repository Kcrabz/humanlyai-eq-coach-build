
import { toast } from "sonner";

/**
 * Utility functions for handling different types of stream responses
 */

// Process a raw string of SSE data
export function processStringSSEData(
  data: string,
  assistantMessageId: string,
  updateAssistantMessage: ((id: string, content: string) => void) | undefined,
  setUsageInfo: (info: any) => void
): string {
  console.log("Processing string SSE data, length:", data.length);
  
  const lines = data.split('\n').filter(line => line.trim() !== '');
  let fullResponse = '';
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const jsonStr = line.substring(6); // Remove 'data: ' prefix
        const eventData = JSON.parse(jsonStr);
        
        if (eventData.type === 'chunk' && eventData.content) {
          fullResponse += eventData.content;
          if (updateAssistantMessage) {
            updateAssistantMessage(assistantMessageId, fullResponse);
          }
        } else if (eventData.type === 'complete' && eventData.usage) {
          // Update usage info
          setUsageInfo({
            currentUsage: eventData.usage.currentUsage,
            limit: eventData.usage.limit,
            percentage: (eventData.usage.currentUsage / eventData.usage.limit) * 100
          });
        }
      } catch (e) {
        console.error("Error parsing SSE line:", e, "Line:", line);
      }
    }
  }
  
  return fullResponse;
}

// Handle object response formats
export function processObjectResponse(
  data: any,
  assistantMessageId: string,
  updateAssistantMessage: ((id: string, content: string) => void) | undefined,
  setUsageInfo: (info: any) => void
): string | null {
  console.log("Processing object response:", data);
  
  // Handle extracted content format
  if (data.extractedContent && typeof data.extractedContent === 'string') {
    return processStringSSEData(
      data.extractedContent,
      assistantMessageId,
      updateAssistantMessage,
      setUsageInfo
    );
  }
  
  // Handle direct content or response field
  if (data.content) {
    console.log("Found direct content in response object");
    if (updateAssistantMessage) {
      updateAssistantMessage(assistantMessageId, data.content);
    }
    return data.content;
  } else if (data.response) {
    console.log("Found response field in object");
    if (updateAssistantMessage) {
      updateAssistantMessage(assistantMessageId, data.response);
    }
    return data.response;
  }
  
  return null; // Couldn't extract content
}

// Create a fallback message when we can't properly extract content
export function createFallbackMessage(
  assistantMessageId: string | undefined,
  updateAssistantMessage: ((id: string, content: string) => void) | undefined
): string {
  const fallbackMessage = "I'm Kai, your EQ coach. I'm here to help with your emotional intelligence development. What would you like to work on today?";
  
  if (assistantMessageId && updateAssistantMessage) {
    updateAssistantMessage(assistantMessageId, fallbackMessage);
    console.log("Using fallback message");
  }
  
  return fallbackMessage;
}
