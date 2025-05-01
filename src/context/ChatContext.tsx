
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage } from "@/types";
import { toast } from "sonner";
import { SYSTEM_PROMPT } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

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

      if (!data || !data.response) {
        console.error("Invalid response from edge function:", data);
        toast.error("No response received. Please try again.");
        throw new Error("No response received from AI assistant");
      }

      const assistantMessage: ChatMessage = {
        id: createId(),
        content: data.response,
        role: "assistant",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
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
