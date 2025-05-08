
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
  const helpRequestPatterns = [
    /how (?:can|could|should|would) (?:i|you)/i,
    /(?:can|could|would) you (?:help|suggest|recommend|advise)/i,
    /(?:what|how) (?:should|can) i do/i,
    /(?:give|provide) me (?:some|a few)? (?:advice|suggestions|tips|help|guidance)/i,
    /i need (?:help|advice|guidance|suggestions|tips)/i,
    /i'm looking for (?:help|advice|guidance|suggestions|tips)/i,
    /i want (?:help|advice|guidance|suggestions|tips|to know)/i,
  ];
  
  return helpRequestPatterns.some(pattern => pattern.test(message));
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
  const isDirectHelpRequest = userMessages.length > 0 && 
    isUserRequestingDirectHelp(userMessages[userMessages.length - 1].content || '');
  
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
  if (conversationContext.isDirectHelpRequest) {
    // User is directly asking for help, provide more guidance even on early turns
    turnInstruction = "The user is explicitly asking for help or guidance. You can provide thoughtful advice and practical suggestions while still asking clarifying questions as needed.";
  } else if (conversationContext.conversationTurnCount === 1) {
    turnInstruction = "This is the user's first message. Focus on open-ended questions to understand their situation. Be curious and explore what they're sharing. No advice or suggestions yet.";
  } else if (conversationContext.conversationTurnCount === 2) {
    turnInstruction = "This is the user's second message. Continue with thoughtful follow-up questions, but you can begin to reflect patterns or insights you notice. Still avoid giving direct advice.";
  } else if (conversationContext.conversationTurnCount === 3) {
    turnInstruction = "This is the user's third message. Now you can balance questions with some initial guidance. Consider asking: 'Would you like some practical suggestions, a reflection exercise, or a different perspective on this?'";
  } else {
    turnInstruction = `This is the user's message #${conversationContext.conversationTurnCount}. At this stage, provide a good balance of insightful questions and practical guidance. Offer concrete suggestions when appropriate while continuing to explore deeper.`;
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
    
    // Add relationship-building suggestions
    contextSection += "\n💡 RESPONSE GUIDANCE:\n";
    contextSection += "• Balance questions with insights - don't just ask questions repeatedly\n";
    contextSection += "• After turn 3, include at least one practical suggestion or action item\n";
    contextSection += "• Use a conversational, friendly tone rather than a clinical approach\n";
    contextSection += "• Refer back to previous topics when relevant to show continuity\n";
    
    // Add guidance based on turn count
    if (conversationContext.conversationTurnCount >= 3) {
      contextSection += "• Provide at least one specific, actionable suggestion\n";
      contextSection += "• Aim for a 60% guidance / 40% questions balance\n";
    }
  }
  
  // Combine with the base system message
  return systemMessage + contextSection;
}
