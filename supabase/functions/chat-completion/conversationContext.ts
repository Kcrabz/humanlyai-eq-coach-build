
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
// Made more stringent to avoid false positives in early turns
function isUserRequestingDirectHelp(message: string): boolean {
  // More specific patterns that clearly indicate a direct request for guidance
  const explicitHelpRequestPatterns = [
    /^(?:please |can you |could you )?(?:give|provide|share|tell) me (?:some|a few|the|your)? (?:advice|suggestions|tips|steps|guidance) /i,
    /^what (?:are|is) (?:some|a few|the) (?:ways|steps|methods|techniques) to /i,
    /^how (?:exactly|specifically) (?:can|should|would|could) I (?:deal with|handle|manage|approach)/i,
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
  
  // Check if current message is a direct help request, but only consider it
  // for turns 3+ to ensure early messages still focus on exploration
  const isLatestMessageDirectHelp = userMessages.length > 0 && 
    isUserRequestingDirectHelp(userMessages[userMessages.length - 1].content || '');
  
  // Only allow direct help detection after turn 2 to ensure early exploration
  const isDirectHelpRequest = conversationTurnCount >= 3 && isLatestMessageDirectHelp;
  
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
  if (conversationContext.conversationTurnCount === 1) {
    turnInstruction = "IMPORTANT: This is the user's first message. ONLY ask thoughtful, exploratory questions to understand their situation. DO NOT provide any suggestions, bullet points, or advice yet. Focus exclusively on curious exploration. Ask at least 1-2 meaningful questions.";
  } else if (conversationContext.conversationTurnCount === 2) {
    turnInstruction = "This is the user's second message. Continue with thoughtful follow-up questions. You may reflect patterns or insights you notice, but DO NOT give direct advice or suggestions yet. Still focus primarily on exploration with questions.";
  } else if (conversationContext.conversationTurnCount === 3) {
    turnInstruction = "This is the user's third message. Begin with a thoughtful question, then explicitly ask: 'Would you like some practical suggestions, or should we explore this further?' If they've already indicated they want advice, you may offer ONE specific suggestion after asking at least one question.";
  } else if (conversationContext.isDirectHelpRequest) {
    turnInstruction = "The user is explicitly asking for guidance. Still start with at least one thoughtful question to ensure proper understanding, then provide specific guidance that's tailored to their situation. Avoid generic advice.";
  } else {
    turnInstruction = `This is the user's message #${conversationContext.conversationTurnCount}. At this stage, begin with a thoughtful question, then provide a good balance of insightful questions and practical guidance. Offer concrete suggestions after appropriate exploration.`;
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
    
    if (conversationContext.conversationTurnCount === 1) {
      contextSection += "• FIRST TURN: Ask 1-2 thoughtful questions ONLY. NO advice, bullet points, or suggestions yet.\n";
      contextSection += "• AVOID premature problem-solving. Focus entirely on exploration.\n";
      contextSection += "• DO NOT use bullet points or numbered lists in your response.\n";
    } else if (conversationContext.conversationTurnCount === 2) {
      contextSection += "• SECOND TURN: Continue exploration through questions. No advice yet.\n";
      contextSection += "• You may reflect what you're noticing but AVOID problem-solving still.\n";
      contextSection += "• Ask questions that build on what they've shared so far.\n";
    } else {
      contextSection += "• Balance questions with insights - but always start with a question\n";
      contextSection += "• After 3+ turns, you can include specific, thoughtful guidance\n";
      contextSection += "• Use a conversational, friendly tone rather than a clinical approach\n";
      
      // For turn 3+, encourage asking about guidance preferences
      if (conversationContext.conversationTurnCount === 3) {
        contextSection += "• Ask if they want practical suggestions or want to explore further\n";
      }
      
      // If they've directly asked for help after turn 2, provide guidance
      if (conversationContext.isDirectHelpRequest && conversationContext.conversationTurnCount > 2) {
        contextSection += "• They're asking for guidance - provide specific, tailored advice AFTER asking at least one question\n";
      }
    }
  }
  
  // Combine with the base system message
  return systemMessage + contextSection;
}
