
import { useState } from "react";
import { useChatApi } from "@/hooks/useChatApi";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/types";
import { useAuth } from "@/context/AuthContext";

export const useChatActions = () => {
  const {
    isLoading,
    usageInfo,
    error,
    retryLastMessage: apiRetryLastMessage,
    setError,
    setUsageInfo
  } = useChatApi();
  
  const { user } = useAuth();

  // Send a message to the chat assistant
  const sendMessage = async (
    content: string, 
    addUserMessage: (content: string) => string,
    addAssistantMessage: (content: string) => string,
    updateAssistantMessage: (id: string, content: string) => void,
    currentMessages: ChatMessage[] = []
  ) => {
    if (!content.trim() || isLoading) return;
    
    console.log("ChatContext: Sending message:", content);
    
    try {
      // Create user message in UI
      const userMessageId = addUserMessage(content);
      console.log("Added user message with ID:", userMessageId);
      
      // Create assistant message with empty content and get its ID
      const assistantMessageId = addAssistantMessage("");
      console.log("Created assistant message ID:", assistantMessageId);

      // Prepare context messages for AI
      const contextMessages = prepareContextMessages(content, currentMessages);
      
      console.log("Sending message with context:", contextMessages.length > 1 ? 
        `${contextMessages.length} messages including history` : "single message");
      
      const { data, error } = await supabase.functions.invoke("chat-completion", {
        body: { 
          messages: contextMessages,
          stream: false,
          subscriptionTier: user?.subscription_tier || 'free'
        },
      });

      console.log("Full response data from chat-completion:", data);

      if (error || !data) {
        console.error("Error from chat-completion function:", error);
        throw new Error(error?.message || "No response from assistant");
      }

      // Extract assistant response from different possible formats
      let assistantResponse = "";
      
      if (typeof data === 'string') {
        // Direct string response
        assistantResponse = data;
        console.log("Extracted response from string:", assistantResponse.substring(0, 50) + "...");
      } else {
        // Object response - check various properties where the response might be
        if (data.content) {
          assistantResponse = data.content;
          console.log("Extracted from content property:", assistantResponse.substring(0, 50) + "...");
        } else if (data.response) {
          assistantResponse = data.response;
          console.log("Extracted from response property:", assistantResponse.substring(0, 50) + "...");
        } else if (data.extractedContent) {
          assistantResponse = data.extractedContent;
          console.log("Extracted from extractedContent property:", assistantResponse.substring(0, 50) + "...");
        } else if (data.choices && data.choices[0] && data.choices[0].message) {
          // Direct OpenAI API format
          assistantResponse = data.choices[0].message.content;
          console.log("Extracted from OpenAI format:", assistantResponse.substring(0, 50) + "...");
        } else {
          // Last resort - try to stringity the whole response for debugging
          console.error("Unknown response structure:", JSON.stringify(data));
          assistantResponse = "I apologize, but I couldn't process your request properly. Please try again.";
        }
      }
      
      if (!assistantResponse) {
        console.error("Failed to extract assistant response from data:", data);
        assistantResponse = "I apologize, but there was an issue with my response. Please try again.";
      }
      
      console.log("Final extracted assistant response:", assistantResponse.substring(0, 100) + "...");
      
      // Update the assistant message with the actual response
      updateAssistantMessage(assistantMessageId, assistantResponse);
      
      // Update usage info if available
      if (data.usage) {
        console.log("Updating usage info:", data.usage);
        setUsageInfo(data.usage);
      }
      
      console.log("Message sent and processed successfully");
    } catch (error) {
      console.error("Error in chat message flow:", error);
      toast.error("Failed to send message", {
        description: "Please try again or contact support if the issue persists."
      });
      setError(error.message);
    }
  };

  // Helper function to prepare context messages for the AI
  const prepareContextMessages = (content: string, currentMessages: ChatMessage[]): any[] => {
    // Premium users get full history from database (handled on server)
    if (user?.subscription_tier === 'premium') {
      return [{ role: "user", content }];
    }
    
    // For free/basic users, use local history with limited context
    const maxHistoryMessages = user?.subscription_tier === 'basic' ? 4 : 2;
    
    // Get only the most recent messages as context
    const recentMessages = currentMessages
      .slice(-maxHistoryMessages * 2) // Get pairs of messages (user + assistant)
      .map(msg => ({ role: msg.role, content: msg.content }));
    
    // Add the current message
    return [...recentMessages, { role: "user", content }];
  };

  // Function to retry the last failed message
  const retryLastMessage = async (
    addUserMessage: (message: string) => string,
    addAssistantMessage: (message: string) => string,
    updateAssistantMessage: (id: string, content: string) => void
  ) => {
    console.log("Retrying last message");
    await apiRetryLastMessage(
      addUserMessage, 
      addAssistantMessage, 
      updateAssistantMessage
    );
  };

  // Start a new chat session
  const startNewChat = (clearMessages: () => void) => {
    clearMessages();
    setError(null);
  };

  return {
    sendMessage,
    retryLastMessage,
    startNewChat,
    isLoading,
    usageInfo, 
    error
  };
};
