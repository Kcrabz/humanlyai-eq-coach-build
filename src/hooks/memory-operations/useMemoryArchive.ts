
import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface ArchivedMemory {
  id: string;
  content: string;
  memory_type: string;
  archived_at: string;
  metadata?: any;
}

export const useMemoryArchive = () => {
  const { user } = useAuth();

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
  const restoreMemory = useCallback(async (archivedMemory: ArchivedMemory): Promise<boolean> => {
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
      
      return true;
    } catch (error) {
      console.error("Exception restoring memory:", error);
      return false;
    }
  }, [user]);

  return {
    archiveMemory,
    getArchivedMemories,
    deleteArchivedMemory,
    restoreMemory
  };
};
