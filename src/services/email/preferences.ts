
import { supabase } from "@/integrations/supabase/client";
import { EmailPreference } from "./types";
import { 
  EmailErrorType, 
  withEmailErrorHandling
} from "./utils/errorHandler";

/**
 * Get email preferences for the current user or specified user
 * @param userId Optional user ID, if not provided uses the current user
 * @returns User's email preferences
 */
export async function getEmailPreferences(userId?: string): Promise<{ data: EmailPreference | null, error: any }> {
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
      .single();
    
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
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error("No authenticated user");
      }
      
      // Check if preferences exist for this user
      const { data: existingPrefs } = await supabase
        .from("email_preferences")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from("email_preferences")
          .update({
            ...preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          throw error;
        }
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from("email_preferences")
          .insert({
            user_id: userId,
            ...preferences,
            updated_at: new Date().toISOString(),
          });

        if (error) {
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
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        throw new Error("No authenticated user");
      }
      
      // Check if preferences exist for this user
      const { data: existingPrefs } = await supabase
        .from("email_preferences")
        .select("id")
        .eq("user_id", userId)
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
          .eq("user_id", userId);

        if (error) {
          throw error;
        }
      } else {
        // Insert new preferences with all options disabled
        const { error } = await supabase
          .from("email_preferences")
          .insert({
            user_id: userId,
            daily_nudges: false,
            weekly_summary: false,
            achievement_notifications: false,
            challenge_reminders: false,
            inactivity_reminders: false,
            updated_at: new Date().toISOString(),
          });

        if (error) {
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
