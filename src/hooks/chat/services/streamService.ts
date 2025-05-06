
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { processStreamResponse } from "./streamProcessor";

/**
 * Service for handling streaming chat responses
 */
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
    
    // Get user context for the AI
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
    
    // Call the edge function with streaming enabled
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: { 
        message: content, 
        stream: true,
        // Include important user context
        subscriptionTier: subscriptionTier,
        archetype: user?.eq_archetype || 'Not set',
        coachingMode: user?.coaching_mode || 'normal',
        // Make sure userId is included if available
        userId: user?.id
      }
    });

    toast.dismiss("kai-connecting");

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

    // Process the stream response
    await processStreamResponse(
      data, 
      assistantMessageId,
      updateAssistantMessage,
      setLastSentMessage,
      setUsageInfo
    );
    
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
