
import React, { createContext, useContext, useEffect } from "react";
import { ChatMessage } from "@/types";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatApi } from "@/hooks/useChatApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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

  const { user } = useAuth();

  // Check chat limits based on subscription tier
  useEffect(() => {
    // Skip check if loading, no user, or no messages
    if (!user || messages.length === 0) return;

    const userMessages = messages.filter(msg => msg.role === "user").length;
    
    // Check limits based on subscription tier
    if (user?.subscription_tier === 'free' && userMessages >= 25) {
      toast.warning("You've reached your monthly message limit", {
        description: "Upgrade to Basic or Premium for more messages.",
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/pricing"
        }
      });
    } else if (user?.subscription_tier === 'basic' && userMessages >= 150) {
      toast.warning("You've reached your monthly message limit", {
        description: "Upgrade to Premium for unlimited messages.",
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/pricing"
        }
      });
    }
  }, [messages, user]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    // Check if user has exceeded their message limit
    if (user) {
      const userMessages = messages.filter(msg => msg.role === "user").length;
      if ((user.subscription_tier === 'free' && userMessages >= 25) ||
          (user.subscription_tier === 'basic' && userMessages >= 150)) {
        toast.error("Message limit reached", {
          description: "Please upgrade your subscription to continue chatting.",
          action: {
            label: "Upgrade",
            onClick: () => window.location.href = "/pricing"
          }
        });
        return;
      }
    }
    
    // Use streaming by default for better user experience
    const userMessageId = addUserMessage(content);
    const assistantMessageId = crypto.randomUUID();
    updateAssistantMessage(assistantMessageId, "");
    
    try {
      await sendMessageStream(content, userMessageId, assistantMessageId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
