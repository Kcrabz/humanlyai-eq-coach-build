
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

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
      // First check if the user has an API key configured
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('user_api_keys')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (apiKeyError) {
        console.error("Error checking API key:", apiKeyError);
        throw new Error("Failed to check if API key is configured");
      }
      
      if (!apiKeyData?.openai_api_key) {
        toast.error("OpenAI API key not configured", {
          action: {
            label: "Add API Key",
            onClick: () => navigate("/settings")
          }
        });
        throw new Error("OpenAI API key not configured. Please add your API key in settings.");
      }

      // Call the edge function to get a response from OpenAI
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          message: content,
          systemPrompt: SYSTEM_PROMPT
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Failed to send message. Please try again.");
        throw new Error(error.message || "Failed to send message");
      }

      if (!data) {
        console.error("Invalid response from edge function:", data);
        toast.error("No response received. Please try again.");
        throw new Error("No response received from AI assistant");
      }

      // Check if there's an error suggesting to use another API key
      if (data.error && data.useAnotherKey) {
        toast.error(data.error, {
          action: {
            label: "Update API Key",
            onClick: () => navigate("/settings")
          }
        });
        throw new Error(data.error);
      }

      // Check for general error
      if (data.error) {
        toast.error(data.error);
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
      } else {
        toast.error("Received empty response from the AI assistant");
        throw new Error("Empty response from AI assistant");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Toast is already shown in the error handlers above
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isLoading, startNewChat }}>
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
