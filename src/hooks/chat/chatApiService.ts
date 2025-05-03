
import { supabase } from "@/integrations/supabase/client";
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { handleChatStream } from "@/utils/chatStreamHandler";
import { SendMessageOptions, ErrorHandlerOptions, RetryOptions } from "./types";
import { toast } from "sonner";

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
    toast.loading("Connecting to Kai...", { id: "kai-connecting" });
    
    // Call the edge function to get a response from OpenAI
    const { data, error: apiError } = await supabase.functions.invoke('chat-completion', {
      body: {
        message: content,
        stream: false
      }
    });

    toast.dismiss("kai-connecting");

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
    toast.dismiss("kai-connecting");
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
    // Show loading toast
    toast.loading("Connecting to Kai...", { id: "kai-connecting" });
    
    // Call the edge function with stream set to true and pass subscription tier
    const subscriptionTier = user?.subscription_tier || 'free';
    
    console.log("Sending message stream with content:", content);
    console.log("User context:", {
      subscriptionTier: subscriptionTier,
      archetype: user?.eq_archetype || 'unknown',
      coachingMode: user?.coaching_mode || 'normal'
    });
    
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

    toast.dismiss("kai-connecting");

    console.log("Got response from edge function:", response);

    if (response.error) {
      console.error("Edge function error:", response.error);
      errorOptions.setError("Failed to connect to AI assistant. Please try again later.");
      throw new Error(response.error.message || "Failed to send message");
    }

    if (!response.data) {
      console.error("Invalid response from edge function:", response);
      errorOptions.setError("No response received from AI assistant");
      throw new Error("No response received from AI assistant");
    }

    // Debug logs to help diagnose response structure
    console.log("Response data type:", typeof response.data);
    
    // Convert the response to a ReadableStream
    const responseBody = response.data;
    
    // Check if response is actually a ReadableStream
    if (!(responseBody instanceof ReadableStream)) {
      // First try parsing it as a stream if it's not a ReadableStream directly
      if (typeof responseBody === 'object' && responseBody !== null) {
        // Handle response that might be an object with streaming data
        if ('content' in responseBody) {
          // Simple case: we got direct content
          console.log("Got direct content response:", responseBody.content);
          updateAssistantMessage(assistantMessageId, responseBody.content);
          setIsLoading(false);
          setLastSentMessage(null);
          return;
        } else if ('response' in responseBody) {
          // Handle regular response from non-streaming endpoint
          console.log("Got regular response:", responseBody.response);
          updateAssistantMessage(assistantMessageId, responseBody.response);
          setIsLoading(false);
          setLastSentMessage(null);
          return;
        } else {
          // Handle non-stream response gracefully
          console.warn("Response is not a readable stream, but got data:", responseBody);
          let content = '';
          
          // Try to extract content from response (if it exists)
          if (typeof responseBody === 'string') {
            content = responseBody;
          } else if (typeof responseBody.response === 'string') {
            content = responseBody.response;
          } else if (typeof responseBody.text === 'function') {
            content = await responseBody.text();
          } else if (responseBody.error) {
            // Handle error in response
            content = `I'm sorry, I encountered an error: ${responseBody.error}`;
            console.error("Error in response:", responseBody.error);
          }
          
          if (content) {
            console.log("Extracted content:", content);
            updateAssistantMessage(assistantMessageId, content);
            setIsLoading(false);
            setLastSentMessage(null);
            return;
          }
          
          // Fallback message when nothing else works
          updateAssistantMessage(assistantMessageId, "I'm sorry, I couldn't generate a response right now. Please try again.");
          setIsLoading(false);
          setLastSentMessage(null);
          throw new Error("Response is not in a usable format");
        }
      } else {
        console.error("Response is not a readable stream:", responseBody);
        // Try one more fallback - see if we can convert the response to string
        try {
          if (typeof responseBody === 'string') {
            updateAssistantMessage(assistantMessageId, responseBody);
            setIsLoading(false);
            setLastSentMessage(null);
            return;
          }
        } catch (error) {
          console.error("Failed to handle non-stream response:", error);
        }
        
        // Last resort fallback message
        updateAssistantMessage(assistantMessageId, "I'm sorry, I couldn't generate a response right now. Please try again.");
        setIsLoading(false);
        setLastSentMessage(null);
        throw new Error("Response is not a readable stream");
      }
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
    
    // Provide a fallback message to the user when streaming fails
    if (updateAssistantMessage && assistantMessageId) {
      updateAssistantMessage(assistantMessageId, 
        "I'm sorry, I encountered an issue while responding. Please try again or visit your profile settings to ensure your account is properly configured.");
    }
  } finally {
    setIsLoading(false);
    toast.dismiss("kai-connecting");
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
