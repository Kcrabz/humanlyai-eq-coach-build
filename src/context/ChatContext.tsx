
import React, { createContext, useContext, useEffect } from "react";
import { ChatMessage } from "@/types";
import { useChatContextMessages } from "@/hooks/chat/useChatContextMessages";
import { useChatActions } from "@/hooks/chat/useChatActions";
import { useAuth } from "@/context/AuthContext";
import { getIntroductionMessage, shouldShowIntroduction, markIntroductionAsShown } from "@/lib/introductionMessages";

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  startNewChat: () => void;
  usageInfo: {
    currentUsage: number;
    limit: number;
    percentage: number;
  } | null;
  error: string | null;
  retryLastMessage: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    updateAssistantMessage,
    clearMessages,
    checkMessageLimits
  } = useChatContextMessages();
  
  const {
    isLoading,
    usageInfo,
    error,
    sendMessage: sendChatMessage,
    retryLastMessage: retryChatMessage,
    startNewChat: startNewChatSession
  } = useChatActions();

  const { user } = useAuth();

  // Check if we should show the introduction message for first-time users
  useEffect(() => {
    if (!user || isLoading || messages.length > 0) return;
    
    const checkAndSendIntroduction = async () => {
      // Only for first-time visitors to the chat
      if (user.id && shouldShowIntroduction(user.id)) {
        // Get the appropriate introduction message based on coaching mode
        const introMessage = getIntroductionMessage(user.coaching_mode);
        
        // Add the assistant message with the introduction
        addAssistantMessage(introMessage);
        
        // Mark that we've shown the introduction to this user
        markIntroductionAsShown(user.id);
      }
    };
    
    checkAndSendIntroduction();
  }, [user, isLoading, messages.length]);

  // Wrapper for sending messages
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    // Check if user has reached their message limit
    if (checkMessageLimits()) return;
    
    await sendChatMessage(content, addUserMessage, addAssistantMessage, updateAssistantMessage, messages);
  };

  // Wrapper for retrying messages
  const retryLastMessage = async () => {
    await retryChatMessage(addUserMessage, addAssistantMessage, updateAssistantMessage);
  };

  // Wrapper for starting a new chat
  const startNewChat = () => {
    startNewChatSession(clearMessages);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      isLoading, 
      startNewChat, 
      usageInfo, 
      error,
      retryLastMessage 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
