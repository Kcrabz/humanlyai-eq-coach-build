
import { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { user } = useAuth();
  
  // Generate a session ID for free users
  const getSessionId = () => {
    // For free users, create a session ID if it doesn't exist
    if (user?.subscription_tier !== 'premium') {
      let sessionId = sessionStorage.getItem(`chat_session_${user?.id}`);
      if (!sessionId) {
        sessionId = `session_${Date.now()}`;
        sessionStorage.setItem(`chat_session_${user?.id}`, sessionId);
      }
      return sessionId;
    }
    return null; // Premium users don't need a session ID
  };

  // Load messages based on user's subscription tier
  useEffect(() => {
    if (!user) return;
    
    const loadChatHistory = async () => {
      // Only fetch chat history from database for premium users
      if (user.subscription_tier === 'premium') {
        setIsLoadingHistory(true);
        try {
          // Use chat_logs table for now to maintain backward compatibility
          // We'll fetch from chat_messages in the future once we have data there
          const { data, error } = await supabase
            .from('chat_logs')
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
            // Convert database format to ChatMessage format
            const formattedMessages: ChatMessage[] = data.map(item => ({
              id: item.id,
              content: item.content,
              role: item.role === 'user' || item.role === 'assistant' 
                ? item.role 
                : 'user', // Default to user if invalid role
              created_at: item.created_at
            }));
            setMessages(formattedMessages);
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
        // For non-premium users, load from session-specific localStorage key
        const sessionId = getSessionId();
        const sessionKey = `chat_messages_${user.id}_${sessionId}`;
        const savedMessages = localStorage.getItem(sessionKey);
        
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
    
    // For non-premium users, use session-specific storage key
    const storageKey = user.subscription_tier === 'premium' 
      ? `chat_messages_${user.id}`
      : `chat_messages_${user.id}_${getSessionId()}`;
      
    // Always save to localStorage for all users
    localStorage.setItem(storageKey, JSON.stringify(messages));
    
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
