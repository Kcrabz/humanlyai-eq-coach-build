
import { supabase } from "@/integrations/supabase/client";

// Service for managing email-related operations
export const emailService = {
  /**
   * Update email preferences for the current user
   * @param preferences Partial preferences to update
   */
  async updatePreferences(preferences: Record<string, boolean>): Promise<boolean> {
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
  },

  /**
   * Get email logs for the current user
   */
  async getEmailLogs(limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching email logs:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error in getEmailLogs:", err);
      return [];
    }
  },

  /**
   * Manually trigger an email send (for testing)
   * @param emailType The type of email to send
   * @param additionalData Any additional data to include
   */
  async triggerEmail(emailType: string, additionalData = {}): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: JSON.stringify({
          emailType,
          templateName: emailType.includes("_") ? emailType.replace("_", "-") : emailType,
          subject: "Test Email",
          data: additionalData,
        }),
      });

      if (error) {
        console.error("Error triggering email:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in triggerEmail:", err);
      return false;
    }
  },

  /**
   * Opt out of all emails
   */
  async optOutAll(): Promise<boolean> {
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
  },
};
