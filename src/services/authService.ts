import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types";

/**
 * Creates or updates a user profile in the database
 */
export const updateUserProfileInDatabase = async (
  userId: string,
  updates: Partial<User>
): Promise<boolean> => {
  console.log("Profile update attempt started");
  
  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking profile:", checkError);
    }

    if (!existingProfile) {
      // Create profile if it doesn't exist
      console.log("Profile doesn't exist, creating it now");
      const { error: createError } = await supabase
        .from('profiles')
        .insert({ 
          id: userId,
          ...updates,
          subscription_tier: 'free'
        });
      
      if (createError) {
        console.error("Failed to create profile:", createError.message);
        toast.error("Failed to create profile", { description: createError.message });
        return false;
      }
    } else {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        console.error("Profile update error:", error.message);
        toast.error("Failed to update profile", { description: error.message });
        return false;
      }
    }
    
    console.log("Profile update successful");
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Unexpected profile update error:", errorMessage);
    toast.error("Failed to update profile", { description: errorMessage });
    return false;
  }
};

/**
 * Gets the current authenticated user from Supabase
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Error getting current user:", error.message);
    return null;
  }
  
  return data?.user;
};

/**
 * Validates if an email domain is allowed for signup
 */
export const validateEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) return false;
  
  // List of commonly used disposable email domains
  const blockedDomains = [
    'tempmail.com',
    'throwawaymail.com',
    'mailinator.com',
    'guerrillamail.com',
    'yopmail.com',
    'fakeinbox.com',
    '10minutemail.com',
    'dispostable.com',
    'tempinbox.com',
    'trashmail.com'
  ];
  
  return !blockedDomains.includes(domain);
};
