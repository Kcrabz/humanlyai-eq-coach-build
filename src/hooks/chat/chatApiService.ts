
import { supabase } from "@/integrations/supabase/client";
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { handleChatStream } from "@/utils/chatStreamHandler";
import { SendMessageOptions, ErrorHandlerOptions } from "./types";

/**
 * Send a message without streaming
 */
export async function sendMessage(
  content: string,
  addUserMessage: Function,
  addAssistantMessage: Function,
  errorOptions: ErrorHandlerOptions,
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void
) {
  if (!content.trim()) return;

  // Reset any previous errors
  errorOptions.setError(null);
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
      errorOptions.setError("Failed to connect to AI assistant. Please try again later.");
      throw new Error(apiError.message || "Failed to send message");
    }

    if (!data) {
      console.error("Invalid response from edge function:", data);
      errorOptions.setError("No response received from AI assistant");
      throw new Error("No response received from AI assistant");
    }

    // Check for various error conditions
    if (data.error) {
      if (data.usageLimit) {
        // Handle usage limit error
        if (data.currentUsage && data.tierLimit) {
          setUsageInfo({
            currentUsage: data.currentUsage,
            limit: data.tierLimit,
            percentage: (data.currentUsage / data.tierLimit) * 100
          });
        }
      }
      
      // Let the error handler deal with the specific error type
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
      errorOptions.setError("Empty response received from the AI assistant");
      throw new Error("Empty response from AI assistant");
    }
  } catch (error: any) {
    console.error("Error sending message:", error);
    handleApiErrors(error, errorOptions);
  } finally {
    setIsLoading(false);
  }
}

/**
 * Send a message with streaming response
 */
export async function sendMessageStream(
  options: SendMessageOptions,
  user: any,
  errorOptions: ErrorHandlerOptions, 
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void, 
  setUsageInfo: (info: any) => void
) {
  const { content, userMessageId, assistantMessageId, updateAssistantMessage } = options;
  
  if (!content.trim()) return;

  // Reset any previous errors
  errorOptions.setError(null);
  setLastSentMessage(content);
  setIsLoading(true);

  try {
    // Call the edge function with stream set to true and pass subscription tier
    const subscriptionTier = user?.subscription_tier || 'free';
    
    console.log("Sending message stream with content:", content);
    
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

    console.log("Got response from edge function:", response);

    if (!response.data) {
      console.error("Invalid streaming response:", response);
      errorOptions.setError("No response received from AI assistant");
      throw new Error("No response received from AI assistant");
    }

    // Convert the response to a ReadableStream
    const responseBody = await response.data;
    if (!(responseBody instanceof ReadableStream)) {
      console.error("Response is not a readable stream:", responseBody);
      throw new Error("Response is not a readable stream");
    }

    // Get the reader and process the stream
    const reader = responseBody.getReader();
    console.log("Starting to process stream with reader");
    
    // Handle the streaming process
    await handleChatStream(reader, {
      assistantMessageId,
      updateAssistantMessage: updateAssistantMessage || (() => {}),
      setLastSentMessage,
      setUsageInfo
    });
    
    console.log("Stream processing completed");
  } catch (error: any) {
    console.error("Error in streaming message:", error);
    handleApiErrors(error, errorOptions);
  } finally {
    setIsLoading(false);
  }
}

/**
 * Retry the last message that was sent
 */
export async function retryLastMessage(
  lastSentMessage: string | null,
  options: RetryOptions,
  user: any,
  errorOptions: ErrorHandlerOptions,
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void
) {
  if (!lastSentMessage) return;
  
  errorOptions.setError(null);
  // Use streaming for retries
  const userMessageId = options.addUserMessage(lastSentMessage);
  const assistantMessageId = crypto.randomUUID();
  
  await sendMessageStream(
    {
      content: lastSentMessage,
      userMessageId,
      assistantMessageId,
      updateAssistantMessage: options.updateAssistantMessage
    },
    user,
    errorOptions,
    setLastSentMessage,
    setIsLoading,
    setUsageInfo
  );
}
