
import { useCallback, useRef } from "react";
import { ChatMessage } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useSessionStorage } from "./useSessionStorage";

/**
 * Hook for handling chat message persistence
 */
export const useChatStorage = (user: any, messages: ChatMessage[], isLoadingHistory: boolean) => {
  const savePendingRef = useRef<NodeJS.Timeout | null>(null);
  const { getSessionId } = useSessionStorage();
  
  /**
   * Save messages to localStorage and database with debounce
   */
  const saveMessages = useCallback(() => {
    if (!user || isLoadingHistory || messages.length === 0) return;
    
    // Clear any pending save operation
    if (savePendingRef.current) {
      clearTimeout(savePendingRef.current);
    }
    
    // Set a timeout to save after 1 second of inactivity
    savePendingRef.current = setTimeout(() => {
      // Always save to localStorage for all users
      const storageKey = user.subscription_tier === 'premium' 
        ? `chat_messages_${user.id}`
        : `chat_messages_${user.id}_${getSessionId(user.id, user.subscription_tier)}`;
        
      localStorage.setItem(storageKey, JSON.stringify(messages));
      
      // For ALL users, sync the latest message to the database
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        
        // Only insert if message doesn't already have a DB ID (UUID format)
        if (!lastMessage.id.includes('-')) {
          supabase
            .from('chat_messages')
            .insert({
              id: lastMessage.id,
              content: lastMessage.content,
              role: lastMessage.role,
              user_id: user.id,
              created_at: lastMessage.created_at
            })
            .then(({ error }) => {
              if (error) {
                console.error("Error saving chat message to database:", error);
              }
            });
        }
      }
    }, 1000);
    
    // Return a cleanup function
    return () => {
      if (savePendingRef.current) {
        clearTimeout(savePendingRef.current);
      }
    };
  }, [messages, user, isLoadingHistory, getSessionId]);
  
  /**
   * Clean up save timer when component unmounts
   */
  const cleanupSaveTimer = useCallback(() => {
    if (savePendingRef.current) {
      clearTimeout(savePendingRef.current);
    }
  }, []);

  return {
    saveMessages,
    cleanupSaveTimer
  };
};
