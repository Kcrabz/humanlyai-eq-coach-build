
import { useState, useCallback } from "react";
import { ChatMessage } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useSessionStorage } from "./useSessionStorage";

/**
 * Hook for loading chat history
 */
export const useHistoryLoader = () => {
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { isChatClearedForSession, isFreshChatNeeded, markChatClearedForSession } = useSessionStorage();

  /**
   * Load chat history from database or local storage
   */
  const loadChatHistory = useCallback(async (user: any, messageLimit: number) => {
    if (!user) return [];
    
    // Check if we've already cleared the chat for this session - if so, don't load history
    if (isChatClearedForSession() || isFreshChatNeeded()) {
      console.log("Chat will be fresh for this session, skipping history load");
      // If fresh chat is needed, let's set the cleared flag for consistency
      if (isFreshChatNeeded()) {
        markChatClearedForSession();
      }
      return [];
    }
    
    setIsLoadingHistory(true);
    try {
      // Use chat_messages table for chat history - for all users
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(messageLimit);
        
      if (error) {
        console.error("Error loading chat history:", error);
        
        // Fallback to local storage if database fetch fails
        const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
        if (savedMessages) {
          return JSON.parse(savedMessages);
        }
        return [];
      } else if (data && data.length > 0) {
        // Convert database format to ChatMessage format
        return data.map(item => ({
          id: item.id,
          content: item.content,
          role: item.role === 'user' || item.role === 'assistant' 
            ? item.role 
            : 'user', // Default to user if invalid role
          created_at: item.created_at
        }));
      } else {
        // If no messages in database, try loading from localStorage
        const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
        if (savedMessages) {
          return JSON.parse(savedMessages);
        }
        return [];
      }
    } catch (error) {
      console.error("Error in chat history loading:", error);
      return [];
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isChatClearedForSession, isFreshChatNeeded, markChatClearedForSession]);

  return {
    isLoadingHistory,
    loadChatHistory
  };
};
