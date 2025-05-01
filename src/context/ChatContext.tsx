
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChatMessage } from "@/types";
import { toast } from "sonner";
import { SYSTEM_PROMPT } from "@/lib/constants";

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
      // In a real implementation, this would make a call to your Supabase Edge Function
      // For now, we'll simulate a response with a timeout
      
      // Determine message history based on subscription tier
      let messageHistory = [];
      if (user.subscription_tier === "premium") {
        // Get the last 5 messages for context
        messageHistory = messages.slice(-5);
      }

      // Prepare the system prompt with user customization
      const customizedPrompt = `${SYSTEM_PROMPT}\n\nUser's EQ Archetype: ${user.eq_archetype || 'Not set'}\nCoaching Mode: ${user.coaching_mode || 'normal'}`;
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate a coaching response based on the user's message and archetype
      let responseContent = "";
      
      if (content.toLowerCase().includes("hello") || content.toLowerCase().includes("hi")) {
        responseContent = "Welcome back to your coaching session! I'm here to help you grow your emotional intelligence. What's on your mind today that you'd like to work on?\n\nAction step: Take a minute to reflect on one EQ-related challenge you're facing currently.\n\nWhat specific aspect of emotional intelligence are you most interested in developing right now?";
      } else if (content.toLowerCase().includes("stress") || content.toLowerCase().includes("anxious")) {
        if (user.eq_archetype === "reflector") {
          responseContent = "I notice you're experiencing stress. As a Reflector, you might be overthinking this situation. Instead of just analyzing, try this breathing technique: breathe in for 4 counts, hold for 7, exhale for 8. Do this 5 times right now.\n\nAction step: Schedule one 10-minute physical activity today to shift from reflection to action.\n\nWhat's one small step you could take today to address the root cause of this stress?";
        } else if (user.eq_archetype === "activator") {
          responseContent = "I hear you're feeling stressed. As an Activator, you might be rushing to solve everything at once. Let's slow down. Take 5 minutes to sit quietly and just observe your thoughts without acting on them.\n\nAction step: Write down your thoughts for 3 minutes without planning any actions.\n\nWhat might you notice if you gave yourself permission to pause before responding to this situation?";
        } else {
          responseContent = "I understand you're dealing with stress right now. Let's approach this with intention. First, acknowledge what you're feeling without judgment. Then, consider what's within your control right now.\n\nAction step: Identify one small element of this situation you can influence today.\n\nWhat would success look like for you in handling this challenge?";
        }
      } else {
        responseContent = "Thank you for sharing that with me. I'm here to support your emotional intelligence growth through practical coaching.\n\nBased on what you've shared, I'd suggest taking a moment to reflect on how this situation connects to your broader patterns of thinking and feeling.\n\nAction step: Journal for 5 minutes about a similar past experience and what you learned from it.\n\nHow might developing greater awareness in this area benefit your relationships or work?";
      }
      
      // Adjust tone based on coaching mode
      if (user.coaching_mode === "tough love") {
        responseContent = responseContent.replace("I understand", "Let's be honest about").replace("Thank you for sharing", "Alright, I hear you, but").replace("I notice", "It's clear that").replace("I hear you're", "You're");
      }

      const assistantMessage: ChatMessage = {
        id: createId(),
        content: responseContent,
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
