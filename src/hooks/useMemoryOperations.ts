
import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MemoryStats, defaultMemoryStats } from "./useMemorySettings";
import { toast } from "@/components/ui/use-toast";

export const useMemoryOperations = (
  setMemoryEnabled: (enabled: boolean) => void,
  setSmartInsightsEnabled: (enabled: boolean) => void,
  setMemoryStats: (stats: MemoryStats) => void,
  refreshMemoryStats: () => Promise<void>
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

  // Archive memories instead of permanently deleting
  const archiveMemory = useCallback(async (memoryId: string, content: string, memoryType: string, metadata: any): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('user_archived_memories')
        .insert({
          user_id: user.id,
          content,
          memory_type: memoryType,
          metadata,
          original_memory_id: memoryId
        });
      
      if (error) {
        console.error("Error archiving memory:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Exception archiving memory:", error);
      return false;
    }
  }, [user]);

  // Clear all memories (with option to archive first)
  const clearAllMemories = useCallback(async (shouldArchive: boolean = false): Promise<boolean> => {
    if (!user) return false;
    
    try {
      if (shouldArchive) {
        // First get all memories to archive
        const { data: memories, error: fetchError } = await supabase.functions.invoke('fetch-memories', {
          body: { userId: user.id }
        });
        
        if (fetchError) {
          console.error("Error fetching memories for archiving:", fetchError);
          return false;
        }
        
        // Archive each memory before deletion
        if (memories && memories.length > 0) {
          for (const memory of memories) {
            await archiveMemory(
              memory.id, 
              memory.content, 
              memory.type, 
              memory.metadata
            );
          }
        }
      }
      
      // Now delete all memories
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
  }, [user, setMemoryStats, archiveMemory]);

  // Get archived memories
  const getArchivedMemories = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_archived_memories')
        .select('*')
        .eq('user_id', user.id)
        .order('archived_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching archived memories:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Exception fetching archived memories:", error);
      return [];
    }
  }, [user]);

  // Delete a specific archived memory
  const deleteArchivedMemory = useCallback(async (memoryId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('user_archived_memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error deleting archived memory:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Exception deleting archived memory:", error);
      return false;
    }
  }, [user]);

  // Restore an archived memory
  const restoreMemory = useCallback(async (archivedMemory: any): Promise<boolean> => {
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
    toggleMemory,
    toggleSmartInsights,
    clearAllMemories,
    archiveMemory,
    getArchivedMemories,
    deleteArchivedMemory,
    restoreMemory
  };
};
