
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { RetryOptions } from "./types";
import { sendMessageStream } from "./services/streamService";

// Export the imported sendMessageStream function
export { sendMessageStream };

/**
 * Optimized service for sending messages to the chat API
 */
export const sendMessage = async (
  content: string,
  addUserMessage: (message: string) => string,
  addAssistantMessage: (message: string) => string,
  errorOptions: {
    navigate: any;
    setError: (error: string | null) => void;
  },
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void,
  messages: any[] = []
) => {
  if (!content.trim()) return;

  // Reset any previous errors
  errorOptions.setError(null);
  setLastSentMessage(content);
  setIsLoading(true);

  const toastId = "kai-connecting";
  
  try {
    toast.loading("Connecting to Kai...", { id: toastId });
    
    // Create user message ID
    const userMessageId = addUserMessage(content);
    
    // Create placeholder for assistant response
    const assistantMessageId = addAssistantMessage("");
    
    // Determine if we should use streaming based on message size
    const useStreaming = content.length > 100;
    
    if (useStreaming) {
      // For longer messages, use streaming for better UX
      await sendMessageStream(
        {
          content,
          userMessageId,
          assistantMessageId,
          updateAssistantMessage: (id, content) => {
            // Skip redundant updates to improve performance
            const trimmedContent = content.trim();
            if (trimmedContent) {
              addAssistantMessage(trimmedContent);
            }
          }
        },
        { id: "user-id" }, // Only pass minimal user data needed
        errorOptions,
        setLastSentMessage,
        setIsLoading,
        setUsageInfo
      );
    } else {
      // For shorter messages, use standard request
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { 
          message: content,
          messages: messages.length > 0 ? messages : undefined,
          stream: false
        }
      });

      if (error) {
        errorOptions.setError(error.message || "Failed to connect to AI assistant");
        throw error;
      }

      if (data?.content || data?.response) {
        const responseContent = data.content || data.response;
        addAssistantMessage(responseContent);
        
        if (data.usage) {
          setUsageInfo({
            currentUsage: data.usage.currentUsage,
            limit: data.usage.limit,
            percentage: (data.usage.currentUsage / data.usage.limit) * 100
          });
        }
        
        setLastSentMessage(null);
      } else {
        throw new Error("Empty response from AI assistant");
      }
    }
  } catch (error) {
    console.error("Error in chat:", error);
    handleApiErrors(error, errorOptions);
  } finally {
    setIsLoading(false);
    toast.dismiss(toastId);
  }
};

/**
 * Optimized retry functionality
 */
export const retryLastMessage = async (
  lastSentMessage: string | null,
  options: RetryOptions,
  user: any,
  errorOptions: {
    navigate: any;
    setError: (error: string | null) => void;
  },
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void
) => {
  if (!lastSentMessage) {
    console.warn("No message to retry");
    return;
  }
  
  const { addUserMessage, addAssistantMessage, updateAssistantMessage } = options;
  
  // Add user message
  const userMessageId = addUserMessage(lastSentMessage);
  
  // Add empty assistant message
  const assistantMessageId = addAssistantMessage("");
  
  // Send message with streaming for better UX
  await sendMessageStream(
    {
      content: lastSentMessage,
      userMessageId,
      assistantMessageId,
      updateAssistantMessage
    },
    user,
    errorOptions,
    setLastSentMessage,
    setIsLoading,
    setUsageInfo
  );
};
