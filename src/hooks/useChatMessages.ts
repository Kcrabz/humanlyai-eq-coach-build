
import { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { useAuth } from "@/context/AuthContext";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user } = useAuth();

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

  // Helper function to create a unique ID
  const createId = () => Math.random().toString(36).substring(2, 11);

  const addUserMessage = (content: string): ChatMessage => {
    const userMessage: ChatMessage = {
      id: createId(),
      content,
      role: "user",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    return userMessage;
  };

  const addAssistantMessage = (content: string) => {
    const assistantMessage: ChatMessage = {
      id: createId(),
      content,
      role: "assistant",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    clearMessages,
  };
};
