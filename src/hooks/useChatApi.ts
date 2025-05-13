
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UsageInfo } from "@/utils/chatStreamHandler";
import { useAuth } from "@/context/AuthContext";
import { 
  sendMessage as apiSendMessage, 
  sendMessageStream as apiSendMessageStream,
  retryLastMessage as apiRetryLastMessage
} from "./chat/chatApiService";
import { RetryOptions } from "./chat/types";

export const useChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSentMessage, setLastSentMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Error handling options
  const errorOptions = {
    navigate,
    setError
  };

  // Non-streaming message send function
  const sendMessage = async (content: string, addUserMessage: (message: string) => string, addAssistantMessage: (message: string) => string) => {
    // Only proceed if we have valid content
    if (!content || !content.trim()) {
      console.log("Skipping empty message");
      return;
    }
    
    await apiSendMessage(
      content, 
      addUserMessage, 
      addAssistantMessage, 
      errorOptions, 
      setLastSentMessage, 
      setIsLoading, 
      setUsageInfo
    );
  };

  // Streaming message send function
  const sendMessageStream = async (
    content: string, 
    userMessageId: string,
    assistantMessageId: string,
    updateAssistantMessage?: (id: string, content: string) => void
  ) => {
    // Only proceed if we have valid content
    if (!content || !content.trim()) {
      console.log("Skipping empty message stream");
      setIsLoading(false);
      return;
    }
    
    try {
      // Set loading state at the beginning
      setIsLoading(true);
      
      await apiSendMessageStream(
        { content, userMessageId, assistantMessageId, updateAssistantMessage },
        user,
        errorOptions,
        setLastSentMessage,
        setIsLoading,
        setUsageInfo
      );
    } catch (error) {
      console.error("Error in sendMessageStream:", error);
      // Make sure loading is set to false
      setIsLoading(false);
      throw error;
    } finally {
      // Always ensure loading state is reset
      setIsLoading(false);
    }
  };

  const retryLastMessage = async (
    addUserMessage: (message: string) => string, 
    addAssistantMessage: (message: string) => string, 
    updateAssistantMessage: (id: string, content: string) => void
  ) => {
    const options: RetryOptions = {
      addUserMessage,
      addAssistantMessage,
      updateAssistantMessage
    };

    await apiRetryLastMessage(
      lastSentMessage,
      options,
      user,
      errorOptions,
      setLastSentMessage,
      setIsLoading,
      setUsageInfo
    );
  };

  return {
    isLoading,
    usageInfo,
    error,
    lastSentMessage,
    sendMessage,
    sendMessageStream,
    retryLastMessage,
    setError,
    setUsageInfo
  };
};
