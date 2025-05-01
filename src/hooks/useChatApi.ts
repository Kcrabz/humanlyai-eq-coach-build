
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

  // Streaming message send function
  const sendMessageStream = async (content: string, addUserMessage: Function, updateAssistantMessage: Function) => {
    if (!content.trim()) return;

    // Reset any previous errors
    setError(null);
    setLastSentMessage(content);
    setIsLoading(true);

    try {
      // Create a message ID for the streaming assistant response
      const assistantMessageId = await addUserMessage(content);

      // Call the edge function with stream set to true
      const response = await supabase.functions.invokeAsync('chat-completion', {
        body: { message: content, stream: true },
        responseType: 'stream'
      });

      if (!response.data) {
        console.error("Invalid streaming response:", response);
        setError("No response received from AI assistant");
        toast.error("No response received", {
          description: "Please try again or contact support if the issue persists.",
        });
        throw new Error("No response received from AI assistant");
      }

      // Get the EventSource-compatible reader
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      
      // Initialize empty string for the assistant's response
      let assistantResponse = "";
      let isFirstChunk = true;
      
      // Process the stream
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          
          // Process all lines in the chunk
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;
            
            try {
              // Extract and parse the JSON data
              const jsonStr = line.substring(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);
              
              // Handle different message types
              if (data.type === 'init') {
                // Initialize streaming, do nothing special
                console.log("Stream initialized");
              } 
              else if (data.type === 'chunk') {
                // Received a content chunk
                if (isFirstChunk) {
                  // Create the assistant message with the first chunk
                  updateAssistantMessage(assistantMessageId, data.content);
                  isFirstChunk = false;
                } else {
                  // Append to the existing assistant message
                  assistantResponse += data.content;
                  updateAssistantMessage(assistantMessageId, assistantResponse);
                }
              }
              else if (data.type === 'complete') {
                // Stream completed successfully
                console.log("Streaming completed");
                
                // Update usage info
                if (data.usage) {
                  setUsageInfo({
                    currentUsage: data.usage.currentUsage,
                    limit: data.usage.limit,
                    percentage: (data.usage.currentUsage / data.usage.limit) * 100
                  });
                }
                
                // Clear last sent message since it was successful
                setLastSentMessage(null);
              }
              else if (data.type === 'error') {
                // Handle error in stream
                console.error("Error in stream:", data.error, data.details);
                
                // Set appropriate error message based on error type
                if (data.details?.type === 'usage_limit') {
                  const errorMessage = "You've reached your monthly message limit";
                  setError(errorMessage);
                  toast.error(errorMessage, {
                    description: "Please upgrade your subscription to continue using the AI coach.",
                    action: {
                      label: "Upgrade",
                      onClick: () => navigate("/pricing")
                    }
                  });
                }
                else if (data.details?.type === 'quota_exceeded') {
                  const errorMessage = data.details.details || "OpenAI API quota exceeded";
                  setError(errorMessage);
                  toast.error("API service has reached its usage limits", {
                    description: "Please check your OpenAI account billing status or contact support.",
                  });
                }
                else if (data.details?.type === 'invalid_key') {
                  const errorMessage = data.details.details || "Invalid API key";
                  setError(errorMessage);
                  toast.error("Invalid API Key", {
                    description: "The API key provided was rejected by OpenAI. Please check your key."
                  });
                }
                else {
                  setError("An error occurred while streaming the response");
                  toast.error("Failed to receive complete response", {
                    description: data.error || "Please try again or report this issue to our support team.",
                  });
                }
                
                throw new Error(data.error || "Error in stream");
              }
            } catch (e) {
              console.error("Error parsing stream data:", e, line);
            }
          }
        }
      } catch (streamError) {
        console.error("Error reading stream:", streamError);
        throw streamError;
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      console.error("Error in streaming message:", error);
      // If we haven't set a specific error message already, set a generic one
      if (!error.message?.includes("You've reached your monthly message limit") && 
          !error.message?.includes("No response received") &&
          !error.message?.includes("OpenAI API quota exceeded") &&
          !error.message?.includes("Invalid API key")) {
        
        setError("An error occurred while streaming your message. Our team has been notified.");
        
        // Generic error
        toast.error("Failed to stream message", {
          description: "Please try again or report this issue to our support team.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = async (addUserMessage: Function, addAssistantMessage: Function, updateAssistantMessage: Function) => {
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
    sendMessageStream, // New streaming function
    retryLastMessage,
    setError
  };
};
