
import React, { createContext, useContext } from "react";
import { ChatMessage } from "@/types";
import { useChatContextMessages } from "@/hooks/chat/useChatContextMessages";
import { useChatActions } from "@/hooks/chat/useChatActions";

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
