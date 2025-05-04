
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ensureProfileExists, updateProfileInDatabase } from "@/services/profileService";

/**
 * Core hook for profile-related actions
 */
export const useProfileCore = (setUser: React.Dispatch<React.SetStateAction<any>>) => {
  /**
   * Updates a user's profile and the local user state
   */
  const updateProfile = async (userId: string, updates: Record<string, any>): Promise<boolean> => {
    try {
      // Create or update the profile in the database
      const success = await updateProfileInDatabase(userId, updates);
      
      if (!success) {
        return false;
      }
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      console.log("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      return false;
    }
  };

  /**
   * Force updates a profile directly in the database and updates local state
   */
  const forceUpdateProfile = async (updates: Record<string, any>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot force update profile: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      // Create the profile if it doesn't exist
      const profileExists = await ensureProfileExists(user.id);
      if (!profileExists) {
        console.log("Profile doesn't exist, creating it with updates");
        const success = await updateProfileInDatabase(user.id, updates);
        if (!success) return false;
        
        // Update local state
        setUser(prev => prev ? { ...prev, ...updates } : null);
        console.log("Profile created with updates");
        return true;
      }
      
      // Update existing profile
      const success = await updateProfileInDatabase(user.id, updates);
      if (!success) return false;
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      console.log("Profile updated successfully via direct DB update");
      return true;
    } catch (error) {
      console.error("Error in forceUpdateProfile:", error);
      return false;
    }
  };

  return {
    updateProfile,
    forceUpdateProfile,
    ensureProfileExists
  };
};
