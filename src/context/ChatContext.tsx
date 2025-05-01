
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
    updateAssistantMessage, 
    clearMessages 
  } = useChatMessages();
  
  const {
    isLoading,
    usageInfo,
    error,
    sendMessage: apiSendMessage,
    sendMessageStream,
    retryLastMessage: apiRetryLastMessage,
    setError
  } = useChatApi();

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    // Use streaming by default for better user experience
    await sendMessageStream(content, addUserMessage, updateAssistantMessage);
  };

  const retryLastMessage = async () => {
    await apiRetryLastMessage(addUserMessage, addAssistantMessage, updateAssistantMessage);
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
