
import { useCallback } from "react";
import { ChatMessage } from "@/types";
import { toast } from "sonner";

/**
 * Hook for chat message operations
 */
export const useChatMessages = () => {
  // Helper function to create a unique ID
  const createId = useCallback(() => Math.random().toString(36).substring(2, 11), []);

  /**
   * Add a user message to the chat
   */
  const addUserMessage = useCallback((content: string): string => {
    const userMessage: ChatMessage = {
      id: createId(),
      content,
      role: "user",
      created_at: new Date().toISOString(),
    };

    return userMessage.id;
  }, [createId]);

  /**
   * Add an assistant message to the chat
   */
  const addAssistantMessage = useCallback((content: string): string => {
    const assistantMessage: ChatMessage = {
      id: createId(),
      content,
      role: "assistant",
      created_at: new Date().toISOString(),
    };

    return assistantMessage.id;
  }, [createId]);

  /**
   * Check if user has reached their message limit
   */
  const checkMessageLimits = useCallback((messages: ChatMessage[], userTier: string | undefined) => {
    const tier = userTier || 'free';
    const messagesToday = messages.filter(msg => {
      const msgDate = new Date(msg.created_at);
      const today = new Date();
      return msgDate.toDateString() === today.toDateString() && msg.role === 'user';
    }).length;
    
    const dailyLimits = {
      'free': 20,
      'basic': 50,
      'premium': 200,
      'trial': 30
    };
    
    const limit = dailyLimits[tier as keyof typeof dailyLimits] || dailyLimits.free;
    
    if (messagesToday >= limit) {
      toast.error(`You've reached your daily limit of ${limit} messages for your ${tier} plan.`, {
        description: "Upgrade your plan to send more messages.",
      });
      return true; // Limit reached
    }
    
    return false; // No limit reached
  }, []);

  return {
    addUserMessage,
    addAssistantMessage,
    checkMessageLimits,
    createId
  };
};
