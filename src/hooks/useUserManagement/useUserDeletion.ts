
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserDeletion = (setIsLoading: (isLoading: boolean) => void, setUsers: React.Dispatch<React.SetStateAction<any[]>>) => {
  // Delete a user via the edge function
  const handleUserDeleted = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      console.log("Deleting user with ID:", userId);
      
      // Call the edge function instead of directly deleting from profiles
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId }
      });
      
      if (error) {
        throw error;
      }
      
      console.log("User deletion response:", data);
      
      // Optimistically remove the user from the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast.success(`User deleted successfully`);
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
