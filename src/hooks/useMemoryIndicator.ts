
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Memory {
  id: string;
  content: string;
  type: 'message' | 'insight' | 'breakthrough' | 'topic';
  created_at: string;
  metadata?: {
    topic?: string;
    sentiment?: string;
    importance?: number;
  };
}

export function useMemoryIndicator() {
  const [hasRelevantMemories, setHasRelevantMemories] = useState(false);
  const [memoryStats, setMemoryStats] = useState({
    count: 0,
    topicCount: 0,
    insightCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Check if the current message has relevant memories
  const checkForRelevantMemories = async (messageContent: string) => {
    if (!user || user.subscription_tier === 'free') {
      // Free users don't have RAG memory
      setHasRelevantMemories(false);
      return false;
    }
    
    setIsLoading(true);
    
    try {
      // Call the function to check if there are memories related to this message
      const { data, error } = await supabase.functions.invoke('check-memories', {
        body: {
          query: messageContent,
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error checking memories:", error);
        setHasRelevantMemories(false);
        return false;
      }
      
      if (data && data.hasRelevantMemories) {
        setHasRelevantMemories(true);
        setMemoryStats({
          count: data.count || 0,
          topicCount: data.topicCount || 0,
          insightCount: data.insightCount || 0
        });
        return true;
      } else {
        setHasRelevantMemories(false);
        return false;
      }
    } catch (error) {
      console.error("Exception checking memories:", error);
      setHasRelevantMemories(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get memory statistics for the user
  const fetchMemoryStats = async () => {
    if (!user || user.subscription_tier === 'free') return;
    
    try {
      const { data, error } = await supabase.functions.invoke('memory-stats', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error fetching memory stats:", error);
        return;
      }
      
      if (data) {
        setMemoryStats({
          count: data.totalMemories || 0,
          topicCount: data.topicCount || 0,
          insightCount: data.insightCount || 0
        });
      }
    } catch (error) {
      console.error("Exception fetching memory stats:", error);
    }
  };
  
  // Fetch initial stats when user changes
  useEffect(() => {
    if (user && user.subscription_tier !== 'free') {
      fetchMemoryStats();
    }
  }, [user]);
  
  return {
    hasRelevantMemories,
    memoryStats,
    isLoading,
    checkForRelevantMemories,
    fetchMemoryStats
  };
}
