
// Extract context from the conversation to enhance the system message
export function extractConversationContext(chatHistory: any[] = []) {
  // Default context object
  const context = {
    isDirectHelpRequest: false,
    conversationFocus: "",
    userConcerns: [],
    mentionedTopics: [],
    previousAdviceGiven: [],
    turnCount: chatHistory.filter(msg => msg.role === 'user').length
  };
  
  // If no chat history, return default context
  if (!chatHistory || chatHistory.length === 0) {
    return context;
  }
  
  // Simple detection of direct help requests
  const lastUserMessage = [...chatHistory]
    .reverse()
    .find(msg => msg.role === 'user')?.content || '';
    
  // Check for help/advice keywords
  const helpKeywords = ['help', 'advice', 'suggest', 'recommendation', 'tip', 'guide'];
  context.isDirectHelpRequest = helpKeywords.some(keyword => 
    lastUserMessage.toLowerCase().includes(keyword)
  );
  
  return context;
}

// Modified to NOT enrich the system message with additional context
export function enrichSystemMessageWithContext(
  systemContent: string,
  userId: string = "",
  context: any = {}
): string {
  // Simply return the original system content without adding any additional context
  return systemContent;
}
