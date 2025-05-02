
import { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { user } = useAuth();

  // Load messages based on user's subscription tier
  useEffect(() => {
    if (!user) return;
    
    const loadChatHistory = async () => {
      // Only fetch chat history from database for premium users
      if (user.subscription_tier === 'premium') {
        setIsLoadingHistory(true);
        try {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(20); // Limit to the most recent 20 messages
            
          if (error) {
            console.error("Error loading chat history:", error);
            toast.error("Failed to load chat history");
            
            // Fallback to local storage if database fetch fails
            const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
            if (savedMessages) {
              setMessages(JSON.parse(savedMessages));
            }
          } else if (data && data.length > 0) {
            setMessages(data);
          } else {
            // If no messages in database, try loading from localStorage
            const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
            if (savedMessages) {
              setMessages(JSON.parse(savedMessages));
            }
          }
        } catch (error) {
          console.error("Error in chat history loading:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        // For non-premium users, just use localStorage
        const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      }
    };
    
    loadChatHistory();
  }, [user]);

  // Save messages to localStorage (all users) and database (premium only)
  useEffect(() => {
    if (!user || isLoadingHistory || messages.length === 0) return;
    
    // Always save to localStorage for all users
    localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(messages));
    
    // For premium users, also sync the latest message to the database
    if (user.subscription_tier === 'premium' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Only insert if message doesn't already have a DB ID
      // This prevents duplicate messages from being created
      if (!lastMessage.id.includes('-')) return;
      
      supabase
        .from('chat_messages')
        .insert({
          id: lastMessage.id,
          content: lastMessage.content,
          role: lastMessage.role,
          user_id: user.id,
          created_at: lastMessage.created_at
        })
        .then(({ error }) => {
          if (error) {
            console.error("Error saving chat message to database:", error);
          }
        });
    }
  }, [messages, user, isLoadingHistory]);

  // Helper function to create a unique ID
  const createId = () => Math.random().toString(36).substring(2, 11);

  const addUserMessage = (content: string): string => {
    const userMessage: ChatMessage = {
      id: createId(),
      content,
      role: "user",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    return userMessage.id;
  };

  const addAssistantMessage = (content: string): string => {
    const assistantMessage: ChatMessage = {
      id: createId(),
      content,
      role: "assistant",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    return assistantMessage.id;
  };

  // Function to update an existing message (for streaming)
  const updateAssistantMessage = (id: string, content: string): void => {
    setMessages((prev) => 
      prev.map((message) => 
        message.id === id 
          ? { ...message, content }
          : message
      )
    );
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoadingHistory,
    addUserMessage,
    addAssistantMessage,
    updateAssistantMessage,
    clearMessages,
  };
};
