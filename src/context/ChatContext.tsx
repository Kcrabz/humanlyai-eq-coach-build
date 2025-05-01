
import React, { createContext, useContext } from "react";
import { ChatMessage } from "@/types";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatApi } from "@/hooks/useChatApi";

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
    clearMessages 
  } = useChatMessages();
  
  const {
    isLoading,
    usageInfo,
    error,
    sendMessage: apiSendMessage,
    retryLastMessage: apiRetryLastMessage,
    setError
  } = useChatApi();

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    // Add user message to the chat first
    addUserMessage(content);
    
    // Then send to API
    await apiSendMessage(content, addUserMessage, addAssistantMessage);
  };

  const retryLastMessage = async () => {
    await apiRetryLastMessage(addUserMessage, addAssistantMessage);
  };

  const startNewChat = () => {
    clearMessages();
    setError(null);
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
