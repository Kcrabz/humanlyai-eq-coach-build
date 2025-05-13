
import { supabase } from "@/integrations/supabase/client";
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { toast } from "sonner";
import { processStreamResponse } from "./streamProcessor";
import { prepareContextMessages, detectPrimaryTopic } from "./contextService";
import { SendMessageOptions } from "../types";

/**
 * Send a message with streaming response
 */
export async function sendMessageStream(
  options: SendMessageOptions,
  user: any,
  errorOptions: {
    navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
    setError: (error: string | null) => void;
  },
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void,
  currentMessages: any[] = []
) {
  const { content, assistantMessageId, updateAssistantMessage } = options;
  
  if (!content.trim()) return;
  
  // Reset errors and set loading state
  errorOptions.setError(null);
  setLastSentMessage(content);
  setIsLoading(true);
  
  try {
    toast.loading("Kai is thinking", { id: "kai-connecting" });
    
    // Prepare context messages for AI based on subscription tier
    const contextMessages = prepareContextMessages(content, currentMessages, user?.subscription_tier);
    console.log(`Sending stream with ${contextMessages.length} context messages`);
    
    // Detect primary topic from conversation
    const primaryTopic = detectPrimaryTopic([...currentMessages, { id: 'temp', content, role: 'user', created_at: new Date().toISOString() }]);
    if (primaryTopic) {
      console.log(`Detected primary topic: ${primaryTopic}`);
    }
    
    // Prepare user context for personalization
    const userContext = {
      subscriptionTier: user?.subscription_tier || 'free',
      archetype: user?.eq_archetype || 'Not set',
      coachingMode: user?.coaching_mode || 'normal',
      userId: user?.id,
      primaryTopic: primaryTopic, // Pass the primary topic to the edge function
      forceTokenTracking: true    // Ensure tokens are tracked regardless of subscription tier
    };
    
    // Call the edge function with streaming enabled
    const { data, error: apiError } = await supabase.functions.invoke('chat-completion', {
      body: {
        message: content,
        messages: contextMessages,
        stream: true,
        ...userContext
      }
    });
    
    toast.dismiss("kai-connecting");
    
    if (apiError) {
      console.error("Stream API error:", apiError);
      errorOptions.setError("Failed to connect to AI assistant. Please try again later.");
      throw new Error(apiError.message || "Failed to send message");
    }
    
    // Process the streaming response
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
  } finally {
    setIsLoading(false);
    toast.dismiss("kai-connecting");
  }
}
