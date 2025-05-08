
import { useState, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSessionStorage } from "./messages/useSessionStorage";
import { useChatMessages } from "./messages/useChatMessages";
import { useChatStorage } from "./messages/useChatStorage";
import { useHistoryLoader } from "./messages/useHistoryLoader";

/**
 * Main hook for managing chat context messages
 */
export const useChatContextMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageLimit, setMessageLimit] = useState(30); // Default limit
  const { user } = useAuth();
  
  // Initialize sub-hooks
  const { markChatClearedForSession } = useSessionStorage();
  const { isLoadingHistory, loadChatHistory } = useHistoryLoader();
  const { addUserMessage: createUserMessage, addAssistantMessage: createAssistantMessage, checkMessageLimits } = useChatMessages();
  const { saveMessages } = useChatStorage(user, messages, isLoadingHistory);

  // Set message limit based on user subscription tier
  useEffect(() => {
    if (!user) return;
    
    switch (user.subscription_tier) {
      case 'premium':
        setMessageLimit(100); // Premium users get longer history
        break;
      case 'basic':
        setMessageLimit(50); // Basic users get medium history
        break;
      default:
        setMessageLimit(30); // Free users get standard history
    }
  }, [user?.subscription_tier]);

  // Load chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      const history = await loadChatHistory(user, messageLimit);
      if (history.length > 0) {
        setMessages(history);
      }
    };
    
    fetchHistory();
  }, [user, messageLimit, loadChatHistory]);

  // Save messages when they change
  useEffect(() => {
    saveMessages();
  }, [messages, saveMessages]);

  // Add user message wrapper
  const addUserMessage = useCallback((content: string): string => {
    const userMessage = createUserMessage(content);
    setMessages((prev) => [...prev, userMessage]);
    return userMessage.id;
  }, [createUserMessage]);

  // Add assistant message wrapper
  const addAssistantMessage = useCallback((content: string): string => {
    const assistantMessage = createAssistantMessage(content);
    setMessages((prev) => [...prev, assistantMessage]);
    return assistantMessage.id;
  }, [createAssistantMessage]);

  // Update assistant message wrapper
  const updateAssistantMessage = useCallback((id: string, content: string): void => {
    setMessages((prev) => 
      prev.map((message) => 
        message.id === id 
          ? { ...message, content }
          : message
      )
    );
  }, []);

  // Clear messages wrapper
  const clearMessages = useCallback(() => {
    setMessages([]);
    
    // When clearing messages, mark in session storage
    markChatClearedForSession();
    console.log("Messages cleared, set chat_cleared_for_session flag");
  }, [markChatClearedForSession]);

  // Check message limits wrapper
  const checkUserMessageLimits = useCallback(() => {
    return checkMessageLimits(messages, user?.subscription_tier);
  }, [messages, user?.subscription_tier, checkMessageLimits]);

  return {
    messages,
    isLoadingHistory,
    addUserMessage,
    addAssistantMessage,
    updateAssistantMessage,
    clearMessages,
    checkMessageLimits: checkUserMessageLimits,
    setMessages
  };
};
