
import { useCallback } from "react";

/**
 * Hook with utilities for chat session management in storage
 */
export const useSessionStorage = () => {
  /**
   * Generates a session ID for non-premium users
   */
  const getSessionId = useCallback((userId: string | undefined, subscriptionTier: string | undefined) => {
    // For free users, create a session ID if it doesn't exist
    if (subscriptionTier !== 'premium' && userId) {
      let sessionId = sessionStorage.getItem(`chat_session_${userId}`);
      if (!sessionId) {
        sessionId = `session_${Date.now()}`;
        sessionStorage.setItem(`chat_session_${userId}`, sessionId);
      }
      return sessionId;
    }
    return null; // Premium users don't need a session ID
  }, []);

  /**
   * Checks if chat has been cleared for current session
   */
  const isChatClearedForSession = useCallback(() => {
    return sessionStorage.getItem('chat_cleared_for_session') === 'true';
  }, []);

  /**
   * Checks if a fresh chat experience is needed
   */
  const isFreshChatNeeded = useCallback(() => {
    return sessionStorage.getItem('fresh_chat_needed') === 'true';
  }, []);

  /**
   * Marks that chat has been cleared for this session
   */
  const markChatClearedForSession = useCallback(() => {
    sessionStorage.setItem('chat_cleared_for_session', 'true');
    console.log("Chat cleared for session flag set");
  }, []);

  return {
    getSessionId,
    isChatClearedForSession,
    isFreshChatNeeded,
    markChatClearedForSession
  };
};
