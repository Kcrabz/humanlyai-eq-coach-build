
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionTier } from "@/types";

export const useTierManagement = () => {
  // Update a user's subscription tier
  const updateUserTier = useCallback(async (userId: string, tier: SubscriptionTier): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      toast.success(`User ${userId} updated to ${tier}`);
    } catch (err) {
      console.error("Error updating user tier:", err);
      toast.error("Failed to update user tier", { 
        description: "There was a problem updating the user's subscription" 
      });
      throw err; // Re-throw to allow proper error handling upstream
    }
  }, []);

  // Upgrade all users to premium
  const upgradeAllUsersToPremium = useCallback(async (): Promise<boolean> => {
    try {
      toast.info("Upgrading all users to premium...");
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .neq('subscription_tier', 'premium')
        .select('id');
        
      if (error) throw error;
      
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
    updateUserTier,
    upgradeAllUsersToPremium
  };
};
