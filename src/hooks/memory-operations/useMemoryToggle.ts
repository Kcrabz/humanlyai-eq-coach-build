
import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useMemoryToggle = (
  setMemoryEnabled: (enabled: boolean) => void,
  setSmartInsightsEnabled: (enabled: boolean) => void
) => {
  const { user } = useAuth();

  // Toggle memory feature
  const toggleMemory = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Free users can't enable memory
      const isFree = user.subscription_tier === "free";
      if (isFree && enabled) {
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
  }, [user, setMemoryEnabled]);

  // Toggle smart insights feature (premium only)
  const toggleSmartInsights = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!user) return false;
    
    const isPremium = user.subscription_tier === "premium";
    if (!isPremium) return false;
    
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
  }, [user, setSmartInsightsEnabled]);

  return {
    toggleMemory,
    toggleSmartInsights
  };
};
