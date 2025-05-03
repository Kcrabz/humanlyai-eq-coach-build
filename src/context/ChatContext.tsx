
import React, { createContext, useContext, useEffect } from "react";
import { ChatMessage } from "@/types";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatApi } from "@/hooks/useChatApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    setError,
    setUsageInfo
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
    
    console.log("ChatContext: Sending message:", content);
    
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
    
    try {
      // Create user message in UI
      const userMessageId = addUserMessage(content);
      console.log("Added user message with ID:", userMessageId);
      
      // Create placeholder for assistant message
      const assistantMessageId = crypto.randomUUID();
      console.log("Created assistant message ID:", assistantMessageId);
      
      // Initialize with empty content
      addAssistantMessage("");
      
      // Replace streaming with direct invoke
      console.log("Sending message with direct invoke:", content);
      const { data, error } = await supabase.functions.invoke("chat-completion", {
        body: { 
          messages: [...messages, { role: "user", content }],
          stream: false 
        },
      });

      if (error || !data?.response) {
        console.error("Error from chat-completion function:", error);
        throw new Error(error?.message || "No response from assistant");
      }

      console.log("Received response from chat-completion:", data);
      updateAssistantMessage(assistantMessageId, data.response);
      
      // Update usage info if available
      if (data.usage) {
        setUsageInfo(data.usage);
      }
      
      console.log("Message sent and processed successfully");
    } catch (error) {
      console.error("Error in chat message flow:", error);
      toast.error("Failed to send message", {
        description: "Please try again or contact support if the issue persists."
      });
      setError(error.message);
    }
  };

  const retryLastMessage = async () => {
    console.log("Retrying last message");
    await apiRetryLastMessage(
      (msg) => {
        console.log("Retry: Adding user message:", msg);
        return addUserMessage(msg);
      }, 
      (msg) => {
        console.log("Retry: Adding assistant message:", msg);
        addAssistantMessage(msg);
      }, 
      (id, content) => {
        console.log(`Retry: Updating assistant message ${id} with content length: ${content.length}`);
        updateAssistantMessage(id, content);
      }
    );
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
