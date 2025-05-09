
import { prepareMessages } from "./openaiService.ts";
import { estimateTokenCount } from "./utils.ts";

// Extract user message from request body
export function extractUserMessage(reqBody: any) {
  const { message, messages } = reqBody;
  let userMessage;
  let clientProvidedHistory = [];
  
  // Determine which message format was used
  if (message) {
    userMessage = message;
    console.log("Using single message format:", userMessage.substring(0, 50) + "...");
  } else if (messages && Array.isArray(messages) && messages.length > 0) {
    // If messages array provided, use it for history and extract the last user message
    clientProvidedHistory = messages;
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    userMessage = lastUserMsg?.content || '';
    console.log("Using messages array format, last user message:", userMessage.substring(0, 50) + "...");
    console.log(`Client provided ${messages.length} messages as context`);
  } else {
    throw new Error("No valid message content found in request");
  }
  
  if (!userMessage || userMessage.trim() === '') {
    throw new Error("Message content is required and cannot be empty");
  }
  
  // Check for important topics in first message (for new conversations)
  if (clientProvidedHistory.length <= 2) {
    const { identifyImportantTopics } = await import("./conversationContext.ts");
    const importantTopics = identifyImportantTopics(userMessage);
    
    if (importantTopics.length > 0) {
      console.log(`Detected important topic in initial message: ${importantTopics[0]}`);
    }
  }
  
  return { userMessage, clientProvidedHistory };
}

// Prepare messages for OpenAI with proper context
export function prepareMessagesForAI(userMessage: string, archetype: string, coachingMode: string, chatHistory: any[], userId: string = "") {
  return prepareMessages(userMessage, archetype, coachingMode, chatHistory, userId);
}

// Calculate token usage from request and response
export function calculateTokenUsage(messages: any[], responseText: string) {
  const inputText = messages.map(m => m.content).join(' ');
  const estimatedInputTokens = estimateTokenCount(inputText);
  const estimatedOutputTokens = estimateTokenCount(responseText);
  
  return {
    inputTokens: estimatedInputTokens,
    outputTokens: estimatedOutputTokens,
    totalTokens: estimatedInputTokens + estimatedOutputTokens
  };
}
