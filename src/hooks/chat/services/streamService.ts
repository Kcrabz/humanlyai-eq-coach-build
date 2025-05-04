
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { handleChatStream } from "@/utils/chatStreamHandler";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Service for handling streaming chat responses
export async function sendMessageStream(
  options: {
    content: string;
    userMessageId: string;
    assistantMessageId: string;
    updateAssistantMessage?: (id: string, content: string) => void;
  },
  user: any,
  errorOptions: {
    navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
    setError: (error: string | null) => void;
  }, 
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
    
    // Initialize assistant message with empty content immediately
    if (updateAssistantMessage) {
      updateAssistantMessage(assistantMessageId, "");
    }
    
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: { 
        message: content, 
        stream: true,
        // Include important user context
        subscriptionTier: subscriptionTier,
        archetype: user?.eq_archetype || 'Not set',
        coachingMode: user?.coaching_mode || 'normal'
      }
    });

    toast.dismiss("kai-connecting");

    console.log("Got response from edge function:", { data, error });

    if (error) {
      console.error("Edge function error:", error);
      errorOptions.setError("Failed to connect to AI assistant. Please try again later.");
      throw new Error(error.message || "Failed to send message");
    }

    if (!data) {
      console.error("Invalid response from edge function:", { data, error });
      errorOptions.setError("No response received from AI assistant");
      throw new Error("No response received from AI assistant");
    }

    await processStreamResponse(data, assistantMessageId, updateAssistantMessage, setLastSentMessage, setUsageInfo);
    
  } catch (error: any) {
    console.error("Error in streaming message:", error);
    handleApiErrors(error, errorOptions);
    
    // Provide a fallback message to the user when streaming fails
    if (updateAssistantMessage && assistantMessageId) {
      updateAssistantMessage(assistantMessageId, 
        "I'm Kai, your EQ coach. I'm having trouble processing your message right now. Could you try again? If the issue persists, please try refreshing the page.");
    }
  } finally {
    setIsLoading(false);
    toast.dismiss("kai-connecting");
  }
}

// Helper function to process stream response data
async function processStreamResponse(
  data: any, 
  assistantMessageId: string,
  updateAssistantMessage: ((id: string, content: string) => void) | undefined,
  setLastSentMessage: (content: string | null) => void,
  setUsageInfo: (info: any) => void
) {
  // Process the response as a stream
  if (typeof data === 'string') {
    // Try to handle directly if it's a string of SSE data
    console.log("Response is direct string data, length:", data.length);
    
    const lines = data.split('\n').filter(line => line.trim() !== '');
    let fullResponse = '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.substring(6); // Remove 'data: ' prefix
          const eventData = JSON.parse(jsonStr);
          
          if (eventData.type === 'chunk' && eventData.content) {
            fullResponse += eventData.content;
            if (updateAssistantMessage) {
              updateAssistantMessage(assistantMessageId, fullResponse);
            }
          } else if (eventData.type === 'complete' && eventData.usage) {
            // Update usage info
            setUsageInfo({
              currentUsage: eventData.usage.currentUsage,
              limit: eventData.usage.limit,
              percentage: (eventData.usage.currentUsage / eventData.usage.limit) * 100
            });
          }
        } catch (e) {
          console.error("Error parsing SSE line:", e, "Line:", line);
        }
      }
    }
    
    if (fullResponse) {
      console.log("Successfully extracted response from string data:", fullResponse.substring(0, 50) + "...");
      setLastSentMessage(null);
      return;
    }
  } else if (data.body instanceof ReadableStream) {
    // Handle if it's already a ReadableStream
    console.log("Response is a ReadableStream, processing...");
    const reader = data.body.getReader();
    
    // Handle the streaming process
    await handleChatStream(reader, {
      assistantMessageId,
      updateAssistantMessage: updateAssistantMessage || (() => {}),
      setLastSentMessage,
      setUsageInfo
    });
    
    console.log("Stream processing completed");
    return;
  } else if (typeof data === 'object') {
    console.log("Response is an object:", data);
    
    // If it contains the extracted content directly (as seen in logs)
    if (data.extractedContent && typeof data.extractedContent === 'string') {
      const extractedContent = data.extractedContent;
      console.log("Processing extracted content from object:", extractedContent.substring(0, 50) + "...");
      
      const lines = extractedContent.split('\n').filter(line => line.trim() !== '');
      let fullResponse = '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.substring(6); // Remove 'data: ' prefix
            const eventData = JSON.parse(jsonStr);
            
            if (eventData.type === 'chunk' && eventData.content) {
              fullResponse += eventData.content;
              if (updateAssistantMessage) {
                updateAssistantMessage(assistantMessageId, fullResponse);
              }
            } else if (eventData.type === 'complete' && eventData.usage) {
              // Update usage info
              setUsageInfo({
                currentUsage: eventData.usage.currentUsage,
                limit: eventData.usage.limit,
                percentage: (eventData.usage.currentUsage / eventData.usage.limit) * 100
              });
            }
          } catch (e) {
            console.error("Error parsing SSE line:", e, "Line:", line);
          }
        }
      }
      
      if (fullResponse) {
        console.log("Successfully extracted response from object data:", fullResponse.substring(0, 50) + "...");
        setLastSentMessage(null);
        return;
      }
    }
    
    // Direct content or response field
    if (data.content) {
      console.log("Found direct content in response object");
      if (updateAssistantMessage) {
        updateAssistantMessage(assistantMessageId, data.content);
      }
      setLastSentMessage(null);
      return;
    } else if (data.response) {
      console.log("Found response field in object");
      if (updateAssistantMessage) {
        updateAssistantMessage(assistantMessageId, data.response);
      }
      setLastSentMessage(null);
      return;
    }
  }

  // If we reach here, we couldn't extract the response properly
  console.error("Couldn't properly extract response from:", data);
  
  // Fallback message as last resort
  if (updateAssistantMessage) {
    updateAssistantMessage(assistantMessageId, 
      "I'm Kai, your EQ coach. I'm here to help with your emotional intelligence development. What would you like to work on today?");
    console.log("Using fallback message");
  }
}
