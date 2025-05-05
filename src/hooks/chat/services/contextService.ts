
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
