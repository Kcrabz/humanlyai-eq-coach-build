
import { createSystemMessage } from "./promptTemplates.ts";
import { streamOpenAI } from "./streamingService.ts";
import { callOpenAI } from "./regularService.ts";

// Prepare messages for OpenAI API
export function prepareMessages(message: string, archetype: string, coachingMode: string, chatHistory: any[] = []) {
  // Get the system message with personalization
  const systemContent = createSystemMessage(archetype, coachingMode);
  
  // Base messages with system prompt and current user message
  let messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: message }
  ];
  
  // If we have chat history, add it between system message and current user message
  if (chatHistory && chatHistory.length > 0) {
    // Add previous messages to the conversation context (in correct order)
    const previousMessages = chatHistory
      .reverse()
      .map(msg => ({ role: msg.role, content: msg.content }));
    
    // Insert previous messages between system message and current user message
    messages = [
      messages[0], // System message
      ...previousMessages, // Previous conversation
      messages[1]  // Current user message
    ];
    
    console.log(`Added ${previousMessages.length} previous messages as context`);
  }
  
  return messages;
}

// Re-export functions from other modules
export { streamOpenAI, callOpenAI };
