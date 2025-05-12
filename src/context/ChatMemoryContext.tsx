
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MemoryContextType {
  memoryEnabled: boolean;
  smartInsightsEnabled: boolean;
  memoryStats: {
    totalMemories: number;
    insightCount: number;
    messageCount: number;
    topicCount: number;
  };
  isLoading: boolean;
  toggleMemory: (enabled: boolean) => Promise<boolean>;
  toggleSmartInsights: (enabled: boolean) => Promise<boolean>;
  refreshMemoryStats: () => Promise<void>;
  clearAllMemories: () => Promise<boolean>;
}

const defaultMemoryStats = {
  totalMemories: 0,
  insightCount: 0,
  messageCount: 0,
  topicCount: 0
};

const ChatMemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const ChatMemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(false);
  const [smartInsightsEnabled, setSmartInsightsEnabled] = useState<boolean>(false);
  const [memoryStats, setMemoryStats] = useState(defaultMemoryStats);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load memory settings and stats when user changes
  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      setIsLoading(true);
      
      try {
        // Free users don't have memory features
        if (user.subscription_tier === 'free') {
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
          setSmartInsightsEnabled(
            user.subscription_tier === 'premium' && prefData.smart_insights_enabled !== false
          );
        } else {
          // Default values if no preferences found
          // Fix: Use proper type comparison with subscription_tier
          setMemoryEnabled(user.subscription_tier !== 'free');
          setSmartInsightsEnabled(user.subscription_tier === 'premium');
          
          // Create default preferences in profiles table
          await supabase
            .from('profiles')
            .update({
              memory_enabled: user.subscription_tier !== 'free',
              smart_insights_enabled: user.subscription_tier === 'premium',
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

  // Toggle memory feature
  const toggleMemory = async (enabled: boolean): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Free users can't enable memory
      if (user.subscription_tier === 'free' && enabled) {
        return false;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          memory_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating memory setting:", error);
        return false;
      }
      
      setMemoryEnabled(enabled);
      return true;
    } catch (error) {
      console.error("Exception toggling memory:", error);
      return false;
    }
  };

  // Toggle smart insights feature (premium only)
  const toggleSmartInsights = async (enabled: boolean): Promise<boolean> => {
    if (!user || user.subscription_tier !== 'premium') return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          smart_insights_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating smart insights setting:", error);
        return false;
      }
      
      setSmartInsightsEnabled(enabled);
      return true;
    } catch (error) {
      console.error("Exception toggling smart insights:", error);
      return false;
    }
  };

  // Refresh memory statistics
  const refreshMemoryStats = async (): Promise<void> => {
    if (!user || user.subscription_tier === 'free') {
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

  // Clear all memories
  const clearAllMemories = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase.functions.invoke('delete-memories', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error deleting memories:", error);
        return false;
      }
      
      // Reset stats
      setMemoryStats(defaultMemoryStats);
      return true;
    } catch (error) {
      console.error("Exception deleting memories:", error);
      return false;
    }
  };

  return (
    <ChatMemoryContext.Provider
      value={{
        memoryEnabled,
        smartInsightsEnabled,
        memoryStats,
        isLoading,
        toggleMemory,
        toggleSmartInsights,
        refreshMemoryStats,
        clearAllMemories
      }}
    >
      {children}
    </ChatMemoryContext.Provider>
  );
};

export const useChatMemory = () => {
  const context = useContext(ChatMemoryContext);
  if (!context) {
    throw new Error("useChatMemory must be used within ChatMemoryProvider");
  }
  return context;
};
