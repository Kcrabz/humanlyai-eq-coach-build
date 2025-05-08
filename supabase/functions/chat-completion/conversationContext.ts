
// Conversation context tracking for Kai

// Types for conversation memory
interface ConversationTopic {
  topic: string;
  timestamp: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface PersonalDetail {
  detail: string;
  category: 'goal' | 'challenge' | 'preference' | 'achievement' | 'background';
  timestamp: string;
}

interface EmotionalState {
  state: string;
  timestamp: string;
}

interface ConversationMemory {
  recentTopics: ConversationTopic[];
  personalDetails: PersonalDetail[];
  emotionalStates: EmotionalState[];
  lastInteractionDate?: string;
}

// Helper function to extract conversation context from messages
export function extractConversationContext(messages: any[]): {
  recentTopics: string[];
  potentialPersonalDetails: string[];
  userEmotions: string[];
} {
  // Filter only user messages
  const userMessages = messages.filter(m => m.role === 'user');
  
  // Simple topic extraction (this would be more sophisticated in a real implementation)
  const recentTopics = userMessages.slice(-3).map(m => {
    const content = m.content || '';
    // Extract potential topics (simplified)
    return content.substring(0, 50) + (content.length > 50 ? '...' : '');
  });
  
  // Extract potential personal details (simplified)
  const potentialPersonalDetails = userMessages.filter(m => {
    const content = m.content || '';
    return (
      content.includes("I feel") || 
      content.includes("I am") || 
      content.includes("I'm") ||
      content.includes("my") ||
      content.includes("I want") ||
      content.includes("I need") ||
      content.includes("I've been")
    );
  }).map(m => m.content);
  
  // Extract potential emotional states (simplified)
  const emotionWords = [
    'happy', 'sad', 'angry', 'frustrated', 'excited', 'anxious', 
    'overwhelmed', 'confident', 'confused', 'tired', 'grateful', 'hopeful'
  ];
  
  const userEmotions = userMessages.filter(m => {
    const content = m.content.toLowerCase() || '';
    return emotionWords.some(emotion => content.includes(emotion));
  }).map(m => m.content);
  
  return {
    recentTopics,
    potentialPersonalDetails,
    userEmotions
  };
}

// Function to enrich the system message with conversation context
export function enrichSystemMessageWithContext(
  systemMessage: string,
  userId: string,
  conversationContext: {
    recentTopics: string[];
    potentialPersonalDetails: string[];
    userEmotions: string[];
  }
): string {
  // Add conversation memory section if we have context
  if (conversationContext.recentTopics.length === 0 && 
      conversationContext.potentialPersonalDetails.length === 0 &&
      conversationContext.userEmotions.length === 0) {
    return systemMessage; // No context to add
  }
  
  let contextSection = "\n\n🧠 CONVERSATION MEMORY:\n";
  
  // Add recent topics
  if (conversationContext.recentTopics.length > 0) {
    contextSection += "• Recent topics discussed: " + 
      conversationContext.recentTopics.join("; ") + "\n";
  }
  
  // Add personal details
  if (conversationContext.potentialPersonalDetails.length > 0) {
    contextSection += "• Personal details shared: " + 
      conversationContext.potentialPersonalDetails
        .slice(0, 3) // Limit to 3 to avoid making prompt too long
        .join("; ") + "\n";
  }
  
  // Add emotional states
  if (conversationContext.userEmotions.length > 0) {
    contextSection += "• Recent emotional states: " + 
      conversationContext.userEmotions
        .slice(0, 2) // Limit to 2 most recent
        .join("; ") + "\n";
  }
  
  // Add relationship-building suggestions
  contextSection += "\n💡 RELATIONSHIP-BUILDING SUGGESTIONS:\n";
  contextSection += "• Refer back to the topics or emotions mentioned above where relevant\n";
  contextSection += "• Use conversational transitions between topics\n";
  contextSection += "• Match the user's emotional tone when appropriate\n";
  contextSection += "• Share relatable examples or analogies when it might help illustrate a point\n";
  
  // Combine with the base system message
  return systemMessage + contextSection;
}
