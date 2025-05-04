
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, SubscriptionTier, EQArchetype, CoachingMode } from "@/types";

/**
 * Creates a profile if it doesn't exist for a user
 * @param userId The ID of the user to create a profile for
 * @returns A boolean indicating if the profile exists or was created successfully
 */
export const createProfileIfNeeded = async (userId: string): Promise<boolean> => {
  try {
    console.log("Checking if profile exists for user:", userId);
    
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking profile:", checkError);
    }
      
    if (!existingProfile) {
      console.log("Profile doesn't exist for user, creating a default one");
      
      // Verify we have a valid session before creating profile
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No active session when creating profile");
        return false;
      }
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          subscription_tier: 'free',
          onboarded: false
        });
        
      if (error) {
        console.error("Error creating default profile:", error);
        // Only show error if it's not a duplicate insert (which can happen during race conditions)
        if (!error.message.includes('duplicate key')) {
          toast.error("Failed to create your profile");
        }
        return false;
      }
      
      console.log("Default profile created successfully");
      return true;
    }
    
    console.log("Profile already exists for user:", userId);
    return true;
  } catch (error) {
    console.error("Error in createProfileIfNeeded:", error);
    return false;
  }
};

/**
 * Fetches a user profile from Supabase
 * @param userId The ID of the user to fetch a profile for
 * @returns The user profile or null if not found
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    // Get the user profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }
    
    if (!profile) {
      console.log("No profile found for user:", userId);
      return null;
    }
    
    // Get the user's email from the auth.users table
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      console.error("User email not available");
      return null;
    }
    
    // Convert Supabase profile to our User type
    const userProfile: User = {
      id: userId,
      email: user.email,
      name: profile.name || undefined,
      avatar_url: profile.avatar_url || undefined,
      eq_archetype: profile.eq_archetype as EQArchetype || undefined,
      coaching_mode: profile.coaching_mode as CoachingMode || undefined,
      subscription_tier: profile.subscription_tier as SubscriptionTier || 'free',
      onboarded: profile.onboarded || false
    };
    
    console.log("Profile fetched:", profile);
    return userProfile;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return null;
  }
};

/**
 * Creates a basic user object with minimal information
 * @param userId The user's ID
 * @param email The user's email
 * @returns A basic User object
 */
export const createBasicUserProfile = (userId: string, email: string): User => {
  return {
    id: userId,
    email: email,
    subscription_tier: 'free',
    onboarded: false
  };
};
