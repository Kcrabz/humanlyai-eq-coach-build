
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Ensures a profile exists for the given user ID
 * @param userId - The user's ID
 * @returns A boolean indicating if the profile exists or was created successfully
 */
export const ensureProfileExists = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Cannot ensure profile exists: No user ID provided");
      return false;
    }
    
    console.log("Ensuring profile exists for user:", userId);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking if profile exists:", error);
      return false;
    }
    
    if (!profile) {
      console.log("Profile doesn't exist, creating it");
      
      // Get current session to ensure we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No active session found when trying to create profile");
        toast.error("Authentication error", { description: "Please try logging in again" });
        return false;
      }
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          subscription_tier: 'free',
          onboarded: false
        });
        
      if (createError) {
        console.error("Error creating profile:", createError);
        return false;
      }
      
      console.log("Profile created successfully");
      return true;
    }
    
    console.log("Profile exists for user:", userId);
    return true;
  } catch (err) {
    console.error("Error in ensureProfileExists:", err);
    return false;
  }
};

/**
 * Updates a user's profile directly in the database
 * @param userId - The user's ID
 * @param updates - Object containing the updates to apply
 * @returns A boolean indicating if the update was successful
 */
export const updateProfileInDatabase = async (
  userId: string,
  updates: Record<string, any>
): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Cannot update profile: No user ID provided");
      return false;
    }

    // Try to get the profile first
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile", { description: error.message });
        return false;
      }
    } else {
      // Create new profile with updates
      const { error } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          subscription_tier: 'free',
          ...updates
        });
        
      if (error) {
        console.error("Error creating profile with updates:", error);
        toast.error("Failed to create profile", { description: error.message });
        return false;
      }
    }
    
    console.log("Profile updated successfully via database");
    return true;
  } catch (error) {
    console.error("Error in updateProfileInDatabase:", error);
    return false;
  }
};
