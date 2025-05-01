
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage } from "@/types";
import { toast } from "sonner";
import { SYSTEM_PROMPT } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  startNewChat: () => void;
  usageInfo: UsageInfo | null;
  error: string | null;
}

interface UsageInfo {
  currentUsage: number;
  limit: number;
  percentage: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper function to create a unique ID
  const createId = () => Math.random().toString(36).substring(2, 11);

  // Load messages from localStorage on component mount
  useEffect(() => {
    if (!user) return;
    
    const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [user]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (!user) return;
    
    localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(messages));
  }, [messages, user]);

  const startNewChat = () => {
    setMessages([]);
    setError(null);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

    // Reset any previous errors
    setError(null);

    // Add user message to the chat
    const userMessage: ChatMessage = {
      id: createId(),
      content,
      role: "user",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
        const assistantMessage: ChatMessage = {
          id: createId(),
          content: data.response,
          role: "assistant",
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        // Update usage info if provided
        if (data.usage) {
          setUsageInfo({
            currentUsage: data.usage.currentUsage,
            limit: data.usage.limit,
            percentage: (data.usage.currentUsage / data.usage.limit) * 100
          });
        }
      } else {
        setError("Empty response received from the AI assistant");
        toast.error("Received empty response from the AI assistant");
        throw new Error("Empty response from AI assistant");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // If we haven't set a specific error message already, set a generic one
      if (!error.message?.includes("You've reached your monthly message limit") && 
          !error.message?.includes("No response received")) {
        setError("An error occurred while sending your message. Our team has been notified.");
        
        // Check for OpenAI quota errors
        if (error.message?.includes("quota") || error.message?.includes("exceeded")) {
          toast.error("Service temporarily unavailable", {
            description: "Our AI system is currently unavailable. Our team has been notified and is working on it.",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isLoading, startNewChat, usageInfo, error }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
