
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

// Helper function to detect if user is directly asking for help
function isUserRequestingDirectHelp(message: string): boolean {
  // More specific patterns that clearly indicate a direct request for guidance
  const explicitHelpRequestPatterns = [
    /(?:please |can you |could you )?(?:give|provide|share|tell) me (?:some|a few|the|your)? (?:advice|suggestions|tips|steps|guidance) /i,
    /what (?:are|is) (?:some|a few|the) (?:ways|steps|methods|techniques) to /i,
    /how (?:can|should|would|could) I (?:deal with|handle|manage|approach)/i,
    /(?:i need|i want|i'm looking for|looking for) (?:advice|help|guidance|tips|suggestions)/i,
    /what (?:should|would|can) i do/i,
  ];
  
  // Check if any explicit patterns match
  return explicitHelpRequestPatterns.some(pattern => pattern.test(message));
}

// Helper function to extract conversation context from messages
export function extractConversationContext(messages: any[]): {
  recentTopics: string[];
  potentialPersonalDetails: string[];
  userEmotions: string[];
  conversationTurnCount: number;
  isDirectHelpRequest: boolean;
} {
  // Filter only user messages
  const userMessages = messages.filter(m => m.role === 'user');
  
  // Count the number of user turns in the conversation
  const conversationTurnCount = userMessages.length;
  
  // Check if current message is a direct help request
  const isLatestMessageDirectHelp = userMessages.length > 0 && 
    isUserRequestingDirectHelp(userMessages[userMessages.length - 1].content || '');
  
  // Allow direct help detection at any point
  const isDirectHelpRequest = isLatestMessageDirectHelp;
  
  // Simple topic extraction
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
    const content = m.content?.toLowerCase() || '';
    return emotionWords.some(emotion => content.includes(emotion));
  }).map(m => m.content);
  
  return {
    recentTopics,
    potentialPersonalDetails,
    userEmotions,
    conversationTurnCount,
    isDirectHelpRequest
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
    conversationTurnCount: number;
    isDirectHelpRequest: boolean;
  }
): string {
  // Add conversation turn count information
  const turnCountSection = `\n\n🔄 CONVERSATION TURN: ${conversationContext.conversationTurnCount}\n`;
  let turnInstruction = '';
  
  // Add specific instructions based on conversation turn
  if (conversationContext.conversationTurnCount === 1) {
    turnInstruction = "This is the user's first message. Ask 1-2 thoughtful questions to understand their situation better. Be conversational and friendly - like a coach, not a therapist.";
  } else if (conversationContext.isDirectHelpRequest) {
    turnInstruction = "The user is asking for guidance. Ask a brief clarifying question if needed, then provide specific and practical advice. Be direct and helpful.";
  } else if (conversationContext.conversationTurnCount >= 2) {
    turnInstruction = `This is turn #${conversationContext.conversationTurnCount}. Ask 1-2 insightful questions, and consider asking if they want practical advice with phrases like "Would you like a tip on this?" or "Want to explore solutions or dig deeper?"`;
  }
  
  // Add conversation memory section if we have context
  const hasContext = conversationContext.recentTopics.length > 0 || 
      conversationContext.potentialPersonalDetails.length > 0 ||
      conversationContext.userEmotions.length > 0;
  
  let contextSection = turnCountSection + turnInstruction;
  
  if (hasContext) {
    contextSection += "\n\n🧠 CONVERSATION MEMORY:\n";
    
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
    
    // Add response guidance based on turn count
    contextSection += "\n💡 RESPONSE GUIDANCE:\n";
    contextSection += "• Keep your response casual and conversational\n";
    contextSection += "• Ask only 1-3 questions max, preferably just one good question\n";
    contextSection += "• Use natural phrases like 'I'm curious about...' or 'What do you think about...'\n";
    contextSection += "• Keep responses shorter and more direct\n";
    
    if (conversationContext.isDirectHelpRequest) {
      contextSection += "• They're asking for guidance - provide specific, actionable advice after a brief clarifying question\n";
    } else if (conversationContext.conversationTurnCount >= 2) {
      contextSection += "• Consider asking if they want practical advice: 'Would you like a tip on this?' or 'Should we explore solutions?'\n";
    }
  }
  
  // Combine with the base system message
  return systemMessage + contextSection;
}
