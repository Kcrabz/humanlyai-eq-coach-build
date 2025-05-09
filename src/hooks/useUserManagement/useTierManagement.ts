
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionTier } from "@/types";

export const useTierManagement = (setIsLoading: (isLoading: boolean) => void, setUsers: React.Dispatch<React.SetStateAction<any[]>>) => {
  // Update a user's subscription tier
  const handleUpdateTier = useCallback(async (userId: string, tier: SubscriptionTier) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Optimistically update the user's tier in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, subscription_tier: tier } : user
        )
      );
      
      toast.success(`User ${userId} updated to ${tier}`);
    } catch (err) {
      console.error("Error updating user tier:", err);
      toast.error("Failed to update user tier", { 
        description: "There was a problem updating the user's subscription" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setUsers]);

  // Upgrade all users to premium
  const upgradeAllUsersToPremium = useCallback(async (fetchUsers: (onboardedValue?: string) => Promise<void>, onboardedFilter: string) => {
    try {
      toast.info("Upgrading all users to premium...");
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .neq('subscription_tier', 'premium')
        .select('id');
        
      if (error) throw error;
      
      // Refresh the user list without changing the filters
      await fetchUsers(onboardedFilter);
      
      toast.success(`Upgraded ${data?.length || 0} users to premium`);
      return true;
    } catch (err) {
      console.error("Error upgrading users:", err);
      toast.error("Failed to upgrade users", { 
        description: "There was a problem upgrading users to premium" 
      });
      return false;
    }
  }, []);

  return {
    handleUpdateTier,
    upgradeAllUsersToPremium
  };
};
