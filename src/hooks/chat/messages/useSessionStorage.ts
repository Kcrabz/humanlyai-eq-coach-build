
import { useCallback } from "react";
import { CHAT_CLEARED_SESSION, FRESH_CHAT_NEEDED } from "@/constants/storageKeys";

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
    return sessionStorage.getItem(CHAT_CLEARED_SESSION) === 'true';
  }, []);

  /**
   * Checks if a fresh chat experience is needed
   */
  const isFreshChatNeeded = useCallback(() => {
    return sessionStorage.getItem(FRESH_CHAT_NEEDED) === 'true';
  }, []);

  /**
   * Marks that chat has been cleared for this session
   */
  const markChatClearedForSession = useCallback(() => {
    sessionStorage.setItem(CHAT_CLEARED_SESSION, 'true');
    console.log("Chat cleared for session flag set");
  }, []);

  /**
   * Clears chat session flags to force a reload of history
   */
  const clearChatSessionFlags = useCallback(() => {
    sessionStorage.removeItem(CHAT_CLEARED_SESSION);
    sessionStorage.removeItem(FRESH_CHAT_NEEDED);
    console.log("Chat session flags cleared to force history refresh");
  }, []);

  return {
    getSessionId,
    isChatClearedForSession,
    isFreshChatNeeded,
    markChatClearedForSession,
    clearChatSessionFlags
  };
};
