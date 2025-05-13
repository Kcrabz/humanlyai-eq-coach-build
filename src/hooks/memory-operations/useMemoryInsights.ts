
import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useMemoryInsights = (refreshMemoryStats: () => Promise<void>) => {
  const { user } = useAuth();

  // Restore an archived memory with refreshing stats
  const restoreMemoryWithRefresh = useCallback(async (archivedMemory: any): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // We need to call a function to restore the memory properly with vector embeddings
      const { error } = await supabase.functions.invoke('restore-memory', {
        body: { 
          userId: user.id,
          content: archivedMemory.content,
          memoryType: archivedMemory.memory_type,
          metadata: archivedMemory.metadata
        }
      });
      
      if (error) {
        console.error("Error restoring memory:", error);
        return false;
      }
      
      // Refresh memory stats after restoration
      await refreshMemoryStats();
      return true;
    } catch (error) {
      console.error("Exception restoring memory:", error);
      return false;
    }
  }, [user, refreshMemoryStats]);

  return {
    restoreMemoryWithRefresh
  };
};
