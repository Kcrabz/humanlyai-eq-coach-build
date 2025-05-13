
import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MemoryStats, defaultMemoryStats } from "@/hooks/useMemorySettings";

export const useMemoryClear = (
  setMemoryStats: (stats: MemoryStats) => void,
  archiveMemory: (memoryId: string, content: string, memoryType: string, metadata: any) => Promise<boolean>
) => {
  const { user } = useAuth();

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

  return {
    clearAllMemories
  };
};
