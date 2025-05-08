
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
          role: message.role,
          created_at: message.created_at
        });
      });

      // Create conversation objects from grouped messages
      const conversationList: ChatConversation[] = Array.from(conversationMap.entries())
        .map(([date, messages]) => {
          // Find first user message for title/preview
          const firstUserMsg = messages.find(m => m.role === 'user');
          const title = firstUserMsg ? 
            firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '') : 
            'Conversation on ' + date;
            
          return {
            id: date,
            title,
            preview: `${messages.length} messages`,
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
