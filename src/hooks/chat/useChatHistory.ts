
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
        'work-life balance', 'mindfulness', 'resilience', 'presence',
        'gratitude', 'boundaries', 'vulnerability', 'strengths',
        'purpose', 'values', 'growth', 'reflection', 'patience'
      ];
      
      // Check for EQ topics in any user message
      for (const message of messages) {
        if (message.role === 'user') {
          const lowerContent = message.content.toLowerCase();
          
          for (const topic of eqTopics) {
            if (lowerContent.includes(topic)) {
              // Create a more descriptive title based on the topic
              if (topic === 'anxiety') return 'Managing Anxiety';
              if (topic === 'stress') return 'Stress Reduction';
              if (topic === 'confidence') return 'Building Confidence';
              if (topic === 'imposter syndrome') return 'Overcoming Imposter Syndrome';
              if (topic === 'communication') return 'Effective Communication';
              if (topic === 'conflict') return 'Resolving Conflicts';
              if (topic === 'relationship') return 'Improving Relationships';
              if (topic === 'emotion') return 'Understanding Emotions';
              if (topic === 'self-awareness') return 'Developing Self-Awareness';
              if (topic === 'empathy') return 'Practicing Empathy';
              if (topic === 'leadership') return 'Leadership Skills';
              if (topic === 'burnout') return 'Preventing Burnout';
              if (topic === 'motivation') return 'Finding Motivation';
              if (topic === 'goals') return 'Setting Goals';
              if (topic === 'feedback') return 'Giving & Receiving Feedback';
              if (topic === 'criticism') return 'Handling Criticism';
              if (topic === 'work-life balance') return 'Work-Life Balance';
              if (topic === 'mindfulness') return 'Mindfulness Practice';
              if (topic === 'resilience') return 'Building Resilience';
              if (topic === 'presence') return 'Being Present';
              if (topic === 'gratitude') return 'Practicing Gratitude';
              if (topic === 'boundaries') return 'Setting Boundaries';
              if (topic === 'vulnerability') return 'Embracing Vulnerability';
              if (topic === 'strengths') return 'Leveraging Strengths';
              if (topic === 'purpose') return 'Finding Purpose';
              if (topic === 'values') return 'Living Your Values';
              if (topic === 'growth') return 'Personal Growth';
              if (topic === 'reflection') return 'Self-Reflection';
              if (topic === 'patience') return 'Developing Patience';
              
              // Default to capitalized topic if no specific title is defined
              return topic.charAt(0).toUpperCase() + topic.slice(1);
            }
          }
        }
      }
      
      // For topics not in our list, analyze the first few words of the first user message
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

  // Group messages into conversations based on time gaps
  const groupMessagesIntoConversations = (messages: ChatMessage[]): Map<string, ChatMessage[]> => {
    const conversationMap = new Map<string, ChatMessage[]>();
    
    // Sort messages by time
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    if (sortedMessages.length === 0) return conversationMap;
    
    // Set a time threshold for grouping messages (30 minutes)
    const TIME_GAP_THRESHOLD = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    let currentConvId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    let currentMessages: ChatMessage[] = [];
    let lastMessageTime = new Date(sortedMessages[0].created_at).getTime();
    
    // Group messages into conversations
    sortedMessages.forEach(message => {
      const messageTime = new Date(message.created_at).getTime();
      
      // If time gap is too large, start a new conversation
      if (messageTime - lastMessageTime > TIME_GAP_THRESHOLD && currentMessages.length > 0) {
        conversationMap.set(currentConvId, currentMessages);
        currentConvId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        currentMessages = [];
      }
      
      currentMessages.push(message);
      lastMessageTime = messageTime;
    });
    
    // Add the last conversation if it has messages
    if (currentMessages.length > 0) {
      conversationMap.set(currentConvId, currentMessages);
    }
    
    return conversationMap;
  };

  // Load user's chat conversations
  const loadChatHistory = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch all user messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process messages to create conversation objects
      if (!data || data.length === 0) {
        setConversations([]);
        return;
      }
      
      // Convert DB records to ChatMessage format
      const messages: ChatMessage[] = data.map(item => ({
        id: item.id,
        content: item.content,
        role: item.role === 'user' || item.role === 'assistant' 
          ? item.role 
          : 'user', // Default to user if invalid role
        created_at: item.created_at
      }));
      
      // Group messages into conversations by time gaps
      const conversationMap = groupMessagesIntoConversations(messages);

      // Create conversation objects from grouped messages
      const conversationList: ChatConversation[] = Array.from(conversationMap.entries())
        .map(([convId, messages]) => {
          // Generate a meaningful title
          const title = generateConversationTitle(messages);
          
          // Create a preview that shows the number of messages
          const preview = `${messages.length} messages • ${new Date(messages[0].created_at).toLocaleDateString()}`;
            
          return {
            id: convId,
            title,
            preview,
            last_updated: new Date(messages[messages.length - 1].created_at).toISOString(),
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
