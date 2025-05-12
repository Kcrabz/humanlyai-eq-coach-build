
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface MemoryStats {
  totalMemories: number;
  insightCount: number;
  messageCount: number;
  topicCount: number;
}

export const defaultMemoryStats: MemoryStats = {
  totalMemories: 0,
  insightCount: 0,
  messageCount: 0,
  topicCount: 0
};

export const useMemorySettings = () => {
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(false);
  const [smartInsightsEnabled, setSmartInsightsEnabled] = useState<boolean>(false);
  const [memoryStats, setMemoryStats] = useState<MemoryStats>(defaultMemoryStats);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Load memory settings when user changes
  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      setIsLoading(true);
      
      try {
        // Free users don't have memory features
        const isFree = user.subscription_tier === "free";
        if (isFree) {
          setMemoryEnabled(false);
          setSmartInsightsEnabled(false);
          setMemoryStats(defaultMemoryStats);
          setIsLoading(false);
          return;
        }
        
        // Get user preferences from profiles table
        const { data: prefData, error: prefError } = await supabase
          .from('profiles')
          .select('memory_enabled, smart_insights_enabled')
          .eq('id', user.id)
          .single();
          
        if (!prefError && prefData) {
          // Enable memory by default for paid tiers if not explicitly disabled
          setMemoryEnabled(prefData.memory_enabled !== false);
          
          // Enable smart insights by default for premium users if not explicitly disabled
          const isPremium = user.subscription_tier === "premium";
          setSmartInsightsEnabled(
            isPremium && prefData.smart_insights_enabled !== false
          );
        } else {
          // Default values if no preferences found
          const isFree = user.subscription_tier === "free";
          const isPremium = user.subscription_tier === "premium";
          
          setMemoryEnabled(!isFree);
          setSmartInsightsEnabled(isPremium);
          
          // Create default preferences in profiles table
          await supabase
            .from('profiles')
            .update({
              memory_enabled: !isFree,
              smart_insights_enabled: isPremium,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }
        
        // Fetch memory stats
        await refreshMemoryStats();
      } catch (error) {
        console.error("Error loading memory settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);

  // Refresh memory statistics
  const refreshMemoryStats = async (): Promise<void> => {
    if (!user) {
      setMemoryStats(defaultMemoryStats);
      return;
    }
    
    const isFree = user.subscription_tier === "free";
    if (isFree) {
      setMemoryStats(defaultMemoryStats);
      return;
    }
    
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
          totalMemories: data.totalMemories || 0,
          insightCount: data.insightCount || 0,
          messageCount: data.messageCount || 0,
          topicCount: data.topicCount || 0
        });
      }
    } catch (error) {
      console.error("Exception fetching memory stats:", error);
    }
  };

  return {
    memoryEnabled,
    setMemoryEnabled,
    smartInsightsEnabled, 
    setSmartInsightsEnabled,
    memoryStats,
    setMemoryStats,
    isLoading,
    refreshMemoryStats
  };
};
