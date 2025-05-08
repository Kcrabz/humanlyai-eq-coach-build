
import { createSystemMessage } from "./promptTemplates.ts";
import { streamOpenAI } from "./streamingService.ts";
import { callOpenAI } from "./regularService.ts";
import { extractConversationContext, enrichSystemMessageWithContext } from "./conversationContext.ts";

// Prepare messages for OpenAI API
export function prepareMessages(message: string, archetype: string, coachingMode: string, chatHistory: any[] = [], userId: string = "") {
  // Log conversation turn count for debugging
  const conversationTurnCount = chatHistory.filter(msg => msg.role === 'user').length + 1;
  console.log(`User turn count: ${conversationTurnCount}`);
  
  // Get the system message with personalization
  const systemContent = createSystemMessage(archetype, coachingMode);
  
  // Extract conversation context from chat history
  const conversationContext = extractConversationContext(chatHistory);
  
  // Log whether this is a direct help request
  if (conversationContext.isDirectHelpRequest) {
    console.log("User is directly asking for help or guidance");
  }
  
  // Enrich system message with conversation context
  const enrichedSystemContent = enrichSystemMessageWithContext(
    systemContent, 
    userId,
    conversationContext
  );
  
  // Base messages with enhanced system prompt and current user message
  let messages = [
    { role: 'system', content: enrichedSystemContent },
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
