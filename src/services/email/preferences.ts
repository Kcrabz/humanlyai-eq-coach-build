
import { supabase } from "@/integrations/supabase/client";
import { EmailPreference } from "./types";
import { 
  EmailErrorType, 
  withEmailErrorHandling
} from "./utils/errorHandler";

/**
 * Update email preferences for the current user
 * @param preferences Partial preferences to update
 */
export async function updatePreferences(preferences: Record<string, boolean>): Promise<boolean> {
  const [result, error] = await withEmailErrorHandling(
    async () => {
      const { error } = await supabase
        .from("email_preferences")
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "");

      if (error) {
        throw error;
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
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "");

      if (error) {
        throw error;
      }

      return true;
    },
    EmailErrorType.UPDATE_FAILURE,
    "Failed to opt out of all emails"
  );
  
  return result || false;
}
