
import { StreamOptions } from './chatStreamTypes';

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
