
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ChatMessage } from "@/types";

export interface ChatConversation {
  id: string;
  title: string;
  preview: string;
  last_updated: string;
  messages: ChatMessage[];
}

export const useChatHistory = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Generate a descriptive title from conversation content
  const generateConversationTitle = (messages: ChatMessage[]): string => {
    // Find first user message as the potential title
    const firstUserMsg = messages.find(m => m.role === 'user');
    
    if (firstUserMsg) {
      // Extract key topics or the first sentence
      const content = firstUserMsg.content;
      
      // Look for common EQ topics in the first message
      const eqTopics = [
        'anxiety', 'stress', 'confidence', 'imposter syndrome', 
        'communication', 'conflict', 'relationship', 'emotion',
        'self-awareness', 'empathy', 'leadership', 'burnout',
        'motivation', 'goals', 'feedback', 'criticism',
        'work-life balance', 'mindfulness', 'resilience'
      ];
      
      // Check if any EQ topics are in the content
      for (const topic of eqTopics) {
        if (content.toLowerCase().includes(topic)) {
          // Capitalize the first letter of the topic
          return topic.charAt(0).toUpperCase() + topic.slice(1);
        }
      }
      
      // If no specific topic found, use first part of message
      // Take the first 3-5 words or up to 30 characters
      const words = content.split(' ');
      const titleWords = words.slice(0, Math.min(5, words.length));
      let title = titleWords.join(' ');
      
      // Trim and add ellipsis if needed
      if (title.length > 30) {
        title = title.substring(0, 30) + '...';
      } else if (content.length > title.length) {
        title += '...';
      }
      
      return title;
    }
    
    // Fallback to date if no user message found
    return 'Conversation on ' + new Date(messages[0].created_at).toLocaleDateString();
  };

  // Load user's chat conversations
  const loadChatHistory = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Group messages by conversation ID
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process messages to create conversation objects
      const conversationMap = new Map<string, ChatMessage[]>();
      
      // Group messages by the day they were created (simple conversation separation)
      data?.forEach(message => {
        const date = new Date(message.created_at).toLocaleDateString();
        if (!conversationMap.has(date)) {
          conversationMap.set(date, []);
        }
        conversationMap.get(date)?.push({
          id: message.id,
          content: message.content,
          role: message.role === 'user' || message.role === 'assistant' 
            ? message.role 
            : 'user', // Default to user if invalid role
          created_at: message.created_at
        });
      });

      // Create conversation objects from grouped messages
      const conversationList: ChatConversation[] = Array.from(conversationMap.entries())
        .map(([date, messages]) => {
          // Generate a meaningful title
          const title = generateConversationTitle(messages);
          
          // Create a preview that shows the number of messages
          const preview = `${messages.length} messages • ${new Date(messages[0].created_at).toLocaleDateString()}`;
            
          return {
            id: date,
            title,
            preview,
            last_updated: new Date(messages[0].created_at).toISOString(),
            messages: [...messages].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          };
        })
        .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());

      setConversations(conversationList);
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      loadChatHistory();
    } else {
      setConversations([]);
    }
  }, [user, loadChatHistory]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;
    try {
      // Find the conversation to get its message IDs
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      const messageIds = conversation.messages.map(m => m.id);
      
      // Delete all messages in this conversation
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .in('id', messageIds);
        
      if (error) throw error;
      
      // Update local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  }, [user, conversations]);

  return {
    conversations,
    isLoading,
    refreshHistory: loadChatHistory,
    deleteConversation
  };
};
