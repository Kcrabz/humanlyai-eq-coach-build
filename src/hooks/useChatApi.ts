
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UsageInfo {
  currentUsage: number;
  limit: number;
  percentage: number;
}

export const useChatApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSentMessage, setLastSentMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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
          message: content
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

      // Check if there's a usage limit error
      if (data.error && data.usageLimit) {
        const errorMessage = "You've reached your monthly message limit";
        setError(errorMessage);
        toast.error(errorMessage, {
          description: "Please upgrade your subscription to continue using the AI coach.",
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing")
          }
        });

        if (data.currentUsage && data.tierLimit) {
          setUsageInfo({
            currentUsage: data.currentUsage,
            limit: data.tierLimit,
            percentage: (data.currentUsage / data.tierLimit) * 100
          });
        }
        
        throw new Error(data.error);
      }
      
      // Check for quota exceeded errors
      if (data.error && data.quotaExceeded) {
        const errorMessage = data.details || "OpenAI API quota exceeded";
        setError(errorMessage);
        toast.error("API service has reached its usage limits", {
          description: "Please check your OpenAI account billing status or contact support.",
        });
        throw new Error(data.error);
      }
      
      // Check for invalid key errors
      if (data.error && data.invalidKey) {
        const errorMessage = data.details || "Invalid API key";
        setError(errorMessage);
        toast.error("Invalid API Key", {
          description: "The API key provided was rejected by OpenAI. Please check your key."
        });
        throw new Error(data.error);
      }
      
      // Check if there's any other error
      if (data.error) {
        setError(data.error);
        toast.error("Error from AI assistant", {
          description: data.error,
        });
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
      
      // If we haven't set a specific error message already, set a generic one
      if (!error.message?.includes("You've reached your monthly message limit") && 
          !error.message?.includes("No response received") &&
          !error.message?.includes("OpenAI API quota exceeded") &&
          !error.message?.includes("Invalid API key")) {
        
        setError("An error occurred while sending your message. Our team has been notified.");
        
        // Generic error
        toast.error("Failed to send message", {
          description: "Please try again or report this issue to our support team.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = async (addUserMessage: Function, addAssistantMessage: Function) => {
    if (!lastSentMessage) return;
    
    setError(null);
    await sendMessage(lastSentMessage, addUserMessage, addAssistantMessage);
  };

  return {
    isLoading,
    usageInfo,
    error,
    lastSentMessage,
    sendMessage,
    retryLastMessage,
    setError
  };
};
