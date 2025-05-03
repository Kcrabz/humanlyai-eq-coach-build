
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChatMessage } from "@/types";

interface UseChatCompletionOptions {
  onSuccess?: (response: string) => void;
  onError?: (error: string) => void;
}

export function useChatCompletion(options?: UseChatCompletionOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChatHistory, setLastChatHistory] = useState<ChatMessage[]>([]);

  // Determine if there's a quota or API key error
  const isQuotaError = error && 
    (error.includes("quota") || 
     error.includes("exceeded") || 
     error.includes("limit") ||
     error.includes("billing"));

  const isInvalidKeyError = error &&
    error.includes("Invalid API key");

  const sendChatMessage = async (chatHistory: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);
    setLastChatHistory(chatHistory);
    
    try {
      // Show loading toast
      toast.loading("Processing your message...", { id: "chat-processing" });
      
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: chatHistory,
        }
      });

      // Dismiss loading toast
      toast.dismiss("chat-processing");

      if (error) {
        console.error('Chat error:', error.message);
        setError(error.message);
        toast.error("Failed to get response", {
          description: "There was a problem with the AI assistant. Please try again."
        });
        options?.onError?.(error.message);
        return null;
      }

      if (!data || !data.content) {
        const errorMsg = "No response content received from the assistant";
        setError(errorMsg);
        toast.error("Empty response", {
          description: "The AI assistant returned an empty response. Please try again."
        });
        options?.onError?.(errorMsg);
        return null;
      }

      // Call success callback if provided
      options?.onSuccess?.(data.content);
      return data.content;
    } catch (err: any) {
      // Dismiss loading toast
      toast.dismiss("chat-processing");
      
      console.error("Error in chat completion:", err);
      setError(err.message || "An unexpected error occurred");
      toast.error("Error", {
        description: err.message || "Something went wrong. Please try again."
      });
      options?.onError?.(err.message || "An unexpected error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const retry = async () => {
    if (lastChatHistory.length > 0) {
      return sendChatMessage(lastChatHistory);
    }
    return null;
  };

  return {
    sendChatMessage,
    retry,
    isLoading,
    error,
    isQuotaError,
    isInvalidKeyError,
    clearError: () => setError(null)
  };
}
