
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { handleApiErrors, handleUsageLimitError } from "@/utils/chatErrorHandler";
import { handleChatStream, UsageInfo } from "@/utils/chatStreamHandler";
import { useAuth } from "@/context/AuthContext";

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
  const sendMessage = async (content: string, addUserMessage: Function, addAssistantMessage: Function) => {
    if (!content.trim()) return;

    // Reset any previous errors
    setError(null);
    setLastSentMessage(content);
    setIsLoading(true);

    try {
      // Call the edge function to get a response from OpenAI
      const { data, error: apiError } = await supabase.functions.invoke('chat-completion', {
        body: {
          message: content,
          stream: false
        }
      });

      if (apiError) {
        console.error("Edge function error:", apiError);
        setError("Failed to connect to AI assistant. Please try again later.");
        toast.error("Failed to connect to AI assistant", {
          description: "Our servers are experiencing issues. Please try again later.",
        });
        throw new Error(apiError.message || "Failed to send message");
      }

      if (!data) {
        console.error("Invalid response from edge function:", data);
        setError("No response received from AI assistant");
        toast.error("No response received", {
          description: "Please try again or contact support if the issue persists.",
        });
        throw new Error("No response received from AI assistant");
      }

      // Check for various error conditions
      if (data.error && data.usageLimit) {
        handleUsageLimitError(data, errorOptions);
        
        if (data.currentUsage && data.tierLimit) {
          setUsageInfo({
            currentUsage: data.currentUsage,
            limit: data.tierLimit,
            percentage: (data.currentUsage / data.tierLimit) * 100
          });
        }
        
        throw new Error(data.error);
      }
      
      // Check for other error types (quota, invalid key, etc.)
      if (data.error) {
        handleApiErrors({ message: data.error, details: data.details }, errorOptions);
        throw new Error(data.error);
      }

      // If successful response
      if (data.response) {
        addAssistantMessage(data.response);
        
        // Update usage info if provided
        if (data.usage) {
          setUsageInfo({
            currentUsage: data.usage.currentUsage,
            limit: data.usage.limit,
            percentage: (data.usage.currentUsage / data.usage.limit) * 100
          });
        }
        
        // Clear last sent message since it was successful
        setLastSentMessage(null);
      } else {
        setError("Empty response received from the AI assistant");
        toast.error("Received empty response from the AI assistant");
        throw new Error("Empty response from AI assistant");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      handleApiErrors(error, errorOptions);
    } finally {
      setIsLoading(false);
    }
  };

  // Streaming message send function
  const sendMessageStream = async (
    content: string, 
    addUserMessage: (message: string) => string, 
    updateAssistantMessage: (id: string, content: string) => void
  ) => {
    if (!content.trim()) return;

    // Reset any previous errors
    setError(null);
    setLastSentMessage(content);
    setIsLoading(true);

    try {
      // Create a message ID for the streaming assistant response
      const assistantMessageId = await addUserMessage(content);

      // Call the edge function with stream set to true and pass subscription tier
      const subscriptionTier = user?.subscription_tier || 'free';
      
      const response = await supabase.functions.invoke('chat-completion', {
        body: { 
          message: content, 
          stream: true,
          // Include important user context
          subscriptionTier: subscriptionTier,
          archetype: user?.eq_archetype || 'unknown',
          coachingMode: user?.coaching_mode || 'normal'
        }
      });

      if (!response.data) {
        console.error("Invalid streaming response:", response);
        setError("No response received from AI assistant");
        toast.error("No response received", {
          description: "Please try again or contact support if the issue persists.",
        });
        throw new Error("No response received from AI assistant");
      }

      // Convert the response to a ReadableStream
      const responseBody = await response.data;
      if (!(responseBody instanceof ReadableStream)) {
        throw new Error("Response is not a readable stream");
      }

      // Get the reader and process the stream
      const reader = responseBody.getReader();
      
      // Handle the streaming process
      await handleChatStream(reader, {
        assistantMessageId,
        updateAssistantMessage,
        setLastSentMessage,
        setUsageInfo
      });
    } catch (error: any) {
      console.error("Error in streaming message:", error);
      handleApiErrors(error, errorOptions);
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = async (
    addUserMessage: (message: string) => string, 
    addAssistantMessage: (message: string) => void, 
    updateAssistantMessage: (id: string, content: string) => void
  ) => {
    if (!lastSentMessage) return;
    
    setError(null);
    // Use streaming by default for retries
    await sendMessageStream(lastSentMessage, addUserMessage, updateAssistantMessage);
  };

  return {
    isLoading,
    usageInfo,
    error,
    lastSentMessage,
    sendMessage,
    sendMessageStream,
    retryLastMessage,
    setError
  };
};
