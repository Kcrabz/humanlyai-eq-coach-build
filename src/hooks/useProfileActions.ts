
import { EQArchetype, CoachingMode } from "@/types";
import { useAuthActions } from "./useAuthActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfileActions = (setUser: React.Dispatch<React.SetStateAction<any>>) => {
  const { updateProfile } = useAuthActions(setUser);

  // Helper to ensure profile exists before updating
  const ensureProfileExists = async (userId: string) => {
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

  const setName = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set name: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const profileExists = await ensureProfileExists(user.id);
      if (!profileExists) return false;
      
      return await updateProfile({ name });
    } catch (error) {
      console.error("Error in setName:", error);
      return false;
    }
  };

  const setArchetype = async (archetype: EQArchetype) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set archetype: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const profileExists = await ensureProfileExists(user.id);
      if (!profileExists) return false;
      
      return await updateProfile({ eq_archetype: archetype });
    } catch (error) {
      console.error("Error in setArchetype:", error);
      return false;
    }
  };

  const setCoachingMode = async (mode: CoachingMode) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set coaching mode: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const profileExists = await ensureProfileExists(user.id);
      if (!profileExists) return false;
      
      return await updateProfile({ coaching_mode: mode });
    } catch (error) {
      console.error("Error in setCoachingMode:", error);
      return false;
    }
  };

  const setOnboarded = async (value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set onboarded: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const profileExists = await ensureProfileExists(user.id);
      if (!profileExists) return false;
      
      return await updateProfile({ onboarded: value });
    } catch (error) {
      console.error("Error in setOnboarded:", error);
      return false;
    }
  };

  // Direct DB update function as a fallback
  const forceUpdateProfile = async (updates: Record<string, any>) => {
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
        const { error } = await supabase
          .from('profiles')
          .insert({ 
            id: user.id,
            subscription_tier: 'free',
            ...updates
          });
          
        if (error) {
          console.error("Error creating profile with updates:", error);
          toast.error("Failed to update profile", { description: error.message });
          return false;
        }
        
        // Update local state
        setUser(prev => prev ? { ...prev, ...updates } : null);
        console.log("Profile created with updates");
        return true;
      }
      
      // Update existing profile
      console.log("Updating profile directly in database:", updates);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) {
        console.error("Error force updating profile:", error);
        toast.error("Failed to update profile", { description: error.message });
        return false;
      }
      
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
    setName,
    setArchetype,
    setCoachingMode,
    setOnboarded,
    forceUpdateProfile // New direct DB update function
  };
};
