
import { ChatMessage } from "@/types";

/**
 * Prepare context messages for the AI based on user's subscription tier
 */
export function prepareContextMessages(content: string, currentMessages: ChatMessage[], subscriptionTier: string | undefined): any[] {
  // Premium users get full history from database (handled on server)
  if (subscriptionTier === 'premium') {
    return [{ role: "user", content }];
  }
  
  // For free/basic users, use local history with limited context
  const maxHistoryMessages = subscriptionTier === 'basic' ? 4 : 2;
  
  // Get only the most recent messages as context
  const recentMessages = currentMessages
    .slice(-maxHistoryMessages * 2) // Get pairs of messages (user + assistant)
    .map(msg => ({ role: msg.role, content: msg.content }));
  
  // Add the current message
  return [...recentMessages, { role: "user", content }];
}

/**
 * Detect and extract important topics from messages
 */
export function detectPrimaryTopic(messages: ChatMessage[]): string | undefined {
  // List of important topics to detect
  const significantTopics = [
    'imposter syndrome', 'impostor syndrome', 'self-doubt', 'anxiety', 'depression',
    'burnout', 'stress', 'confidence', 'relationships', 'communication',
    'conflict', 'leadership', 'motivation', 'procrastination', 'fear', 
    'perfectionism', 'work-life balance', 'boundaries', 'decision making'
  ];
  
  // Start with the first user message and work forward
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  if (userMessages.length === 0) return undefined;
  
  // Check early messages first to find the primary topic
  for (const msg of userMessages.slice(0, 3)) {
    const content = msg.content.toLowerCase();
    for (const topic of significantTopics) {
      if (content.includes(topic.toLowerCase())) {
        return topic;
      }
    }
  }
  
  return undefined;
}
