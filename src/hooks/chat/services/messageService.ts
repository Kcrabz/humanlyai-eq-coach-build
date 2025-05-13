
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Send a message without streaming
 */
export async function sendMessage(
  content: string,
  addUserMessage: Function,
  addAssistantMessage: Function,
  errorOptions: {
    navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
    setError: (error: string | null) => void;
  },
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void,
  contextMessages: any[] = [],
  user: any = null // User parameter
) {
  if (!content.trim()) return;

  // Reset any previous errors
  errorOptions.setError(null);
  setLastSentMessage(content);
  setIsLoading(true);

  try {
    toast.loading("Kai is thinking...", { id: "kai-connecting" });
    
    console.log("Sending message to Edge Function:", content);
    
    // Prepare user context for personalization
    const userContext = {
      subscriptionTier: user?.subscription_tier || 'free',
      archetype: user?.eq_archetype || 'Not set',
      coachingMode: user?.coaching_mode || 'normal',
      userId: user?.id // Make sure userId is included
    };
    
    console.log("Including user context:", userContext);
    
    // Call the edge function to get a response from OpenAI
    const { data, error: apiError } = await supabase.functions.invoke('chat-completion', {
      body: {
        message: content,
        messages: contextMessages,
        stream: false,
        // Include user context for personalization
        ...userContext
      }
    });

    toast.dismiss("kai-connecting");

    console.log("Received response from Edge Function:", data);
    
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
      console.error("Error in edge function response:", data.error);
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
      console.log("Adding assistant message from response:", data.response.substring(0, 50) + "...");
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
