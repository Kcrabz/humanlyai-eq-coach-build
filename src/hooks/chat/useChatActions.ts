
import { useState } from "react";
import { useChatApi } from "@/hooks/useChatApi";
import { toast } from "sonner";
import { ChatMessage } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { prepareContextMessages } from "./services/contextService";
import { sendMessage } from "./services/messageService";

export const useChatActions = () => {
  const {
    isLoading,
    usageInfo,
    error,
    retryLastMessage: apiRetryLastMessage,
    setError,
    setUsageInfo
  } = useChatApi();
  
  const { user } = useAuth();

  // Send a message to the chat assistant
  const sendChatMessage = async (
    content: string, 
    addUserMessage: (content: string) => string,
    addAssistantMessage: (content: string) => string,
    updateAssistantMessage: (id: string, content: string) => void,
    currentMessages: ChatMessage[] = []
  ) => {
    if (!content.trim() || isLoading) return;
    
    console.log("ChatContext: Sending message:", content);
    
    try {
      // Create user message in UI
      const userMessageId = addUserMessage(content);
      console.log("Added user message with ID:", userMessageId);
      
      // Create assistant message with empty content and get its ID
      const assistantMessageId = addAssistantMessage("");
      console.log("Created assistant message ID:", assistantMessageId);

      // Prepare context messages for AI
      const contextMessages = prepareContextMessages(content, currentMessages, user?.subscription_tier);
      
      console.log("Sending message with context:", contextMessages.length > 1 ? 
        `${contextMessages.length} messages including history` : "single message");
      
      // Send the message using the refactored service
      await sendMessage(
        content,
        addUserMessage,
        addAssistantMessage,
        {
          navigate: undefined, // No navigation needed in this context
          setError
        },
        () => {}, // setLastSentMessage not needed here
        (loading: boolean) => {}, // setIsLoading not needed here
        setUsageInfo,
        contextMessages,
        user // Pass the user object from auth context
      );
      
      console.log("Message sent and processed successfully");
    } catch (error) {
      console.error("Error in chat message flow:", error);
      toast.error("Failed to send message", {
        description: "Please try again or contact support if the issue persists."
      });
      setError(error.message);
    }
  };

  // Function to retry the last failed message
  const retryLastMessage = async (
    addUserMessage: (message: string) => string,
    addAssistantMessage: (message: string) => string,
    updateAssistantMessage: (id: string, content: string) => void
  ) => {
    console.log("Retrying last message");
    await apiRetryLastMessage(
      addUserMessage, 
      addAssistantMessage, 
      updateAssistantMessage
    );
  };

  // Start a new chat session
  const startNewChat = (clearMessages: () => void) => {
    clearMessages();
    setError(null);
  };

  return {
    sendMessage: sendChatMessage,
    retryLastMessage,
    startNewChat,
    isLoading,
    usageInfo, 
    error
  };
};
