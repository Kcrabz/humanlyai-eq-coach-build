
import { supabase } from "@/integrations/supabase/client";
import { EmailPreference } from "./types";

/**
 * Update email preferences for the current user
 * @param preferences Partial preferences to update
 */
export async function updatePreferences(preferences: Record<string, boolean>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("email_preferences")
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id || "");

    if (error) {
      console.error("Error updating email preferences:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in updatePreferences:", err);
    return false;
  }
}

/**
 * Opt out of all emails
 */
export async function optOutAll(): Promise<boolean> {
  try {
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
      console.error("Error opting out of all emails:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in optOutAll:", err);
    return false;
  }
}
