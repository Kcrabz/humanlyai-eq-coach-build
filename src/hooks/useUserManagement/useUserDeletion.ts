
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserDeletion = (setIsLoading: (isLoading: boolean) => void, setUsers: React.Dispatch<React.SetStateAction<any[]>>) => {
  // Delete a user
  const handleUserDeleted = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Optimistically remove the user from the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // Removed success toast
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user", { 
        description: "There was a problem deleting the user" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setUsers]);

  return {
    handleUserDeleted
  };
};
