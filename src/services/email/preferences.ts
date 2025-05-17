
import { supabase } from "@/integrations/supabase/client";
import { EmailPreference } from "./types";
import { 
  EmailErrorType, 
  withEmailErrorHandling
} from "./utils/errorHandler";

/**
 * Default email preferences when a user doesn't have any saved
 */
const DEFAULT_EMAIL_PREFERENCES: Omit<EmailPreference, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  daily_nudges: true,
  weekly_summary: true,
  achievement_notifications: true,
  challenge_reminders: true,
  inactivity_reminders: true
};

/**
 * Get email preferences for the current user or specified user
 * @param userId Optional user ID, if not provided uses the current user
 * @param createIfMissing Whether to create a preferences record if none exists (default: false)
 * @returns User's email preferences
 */
export async function getEmailPreferences(
  userId?: string, 
  createIfMissing = false
): Promise<{ data: EmailPreference | null, error: any }> {
  try {
    const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    if (!currentUserId) {
      return {
        data: null,
        error: new Error("No user ID available")
      };
    }
    
    const { data, error } = await supabase
      .from("email_preferences")
      .select("*")
      .eq("user_id", currentUserId)
      .maybeSingle();
    
    // If no preferences exist and createIfMissing is true, create default preferences
    if (!data && !error && createIfMissing) {
      const { data: newPrefs, error: createError } = await supabase
        .from("email_preferences")
        .insert({
          user_id: currentUserId,
          ...DEFAULT_EMAIL_PREFERENCES,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating default email preferences:", createError);
      }
      
      return { 
        data: newPrefs || {
          user_id: currentUserId,
          ...DEFAULT_EMAIL_PREFERENCES
        } as EmailPreference,
        error: createError
      };
    }
    
    // If no preferences exist but we're not creating them, return defaults
    if (!data && !error) {
      return {
        data: {
          user_id: currentUserId,
          ...DEFAULT_EMAIL_PREFERENCES
        } as EmailPreference,
        error: null
      };
    }
    
    return { data, error };
  } catch (error) {
    console.error("Error fetching email preferences:", error);
    return {
      data: null,
      error
    };
  }
}

/**
 * Update email preferences for the current user
 * @param preferences Partial preferences to update
 */
export async function updatePreferences(preferences: Record<string, boolean>): Promise<boolean> {
  const [result, error] = await withEmailErrorHandling(
    async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      // Check if preferences exist for this user
      const { data: existingPrefs } = await supabase
        .from("email_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from("email_preferences")
          .update({
            ...preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating preferences:", error);
          throw error;
        }
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from("email_preferences")
          .insert({
            user_id: user.id,
            ...preferences,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Error inserting preferences:", error);
          throw error;
        }
      }

      return true;
    },
    EmailErrorType.UPDATE_FAILURE,
    "Failed to update email preferences"
  );
  
  return result || false;
}

/**
 * Opt out of all emails
 */
export async function optOutAll(): Promise<boolean> {
  const [result, error] = await withEmailErrorHandling(
    async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }
      
      // Check if preferences exist for this user
      const { data: existingPrefs } = await supabase
        .from("email_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from("email_preferences")
          .update({
            daily_nudges: false,
            weekly_summary: false,
            achievement_notifications: false,
            challenge_reminders: false,
            inactivity_reminders: false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating preferences for opt-out:", error);
          throw error;
        }
      } else {
        // Insert new preferences with all options disabled
        const { error } = await supabase
          .from("email_preferences")
          .insert({
            user_id: user.id,
            daily_nudges: false,
            weekly_summary: false,
            achievement_notifications: false,
            challenge_reminders: false,
            inactivity_reminders: false,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Error inserting preferences for opt-out:", error);
          throw error;
        }
      }

      return true;
    },
    EmailErrorType.UPDATE_FAILURE,
    "Failed to opt out of all emails"
  );
  
  return result || false;
}
