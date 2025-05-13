
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
   * Get email logs for the current user or all logs for admins
   */
  async getEmailLogs(limit = 50, forAllUsers = false): Promise<any[]> {
    try {
      let query = supabase
        .from("email_logs")
        .select("*")
        .order("sent_at", { ascending: false });
      
      // If not fetching all users' logs, filter by current user
      if (!forAllUsers) {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) {
          console.error("No user ID available");
          return [];
        }
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query.limit(limit);

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
   * Manually trigger an email send (for testing or admin use)
   */
  async triggerEmail(
    options: {
      userId: string; 
      emailType: string; 
      templateName: string;
      subject: string;
      to?: string;
      data?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      const { userId, emailType, templateName, subject, to, data = {} } = options;
      
      toast.info("Sending email...");
      
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          userId,
          emailType,
          templateName,
          subject,
          to, // Optional, if not provided the function will fetch from auth.users
          data,
        },
      });

      if (error) {
        console.error("Error triggering email:", error);
        toast.error("Failed to send email");
        return false;
      }

      toast.success("Email sent successfully");
      return true;
    } catch (err) {
      console.error("Error in triggerEmail:", err);
      toast.error("Failed to send email");
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

  /**
   * Force refresh email logs (useful after sending a new email)
   */
  async refreshEmailLogs(limit = 50, forAllUsers = false): Promise<any[]> {
    // Clear any cached data if applicable
    return this.getEmailLogs(limit, forAllUsers);
  },
  
  /**
   * Resend a previously sent email
   */
  async resendEmail(emailLogId: string): Promise<boolean> {
    try {
      // First get the original email data
      const { data: emailLog, error: fetchError } = await supabase
        .from("email_logs")
        .select("*")
        .eq("id", emailLogId)
        .single();
        
      if (fetchError || !emailLog) {
        console.error("Error fetching email log for resend:", fetchError);
        return false;
      }
      
      // Now resend with the same data
      return await this.triggerEmail({
        userId: emailLog.user_id,
        emailType: emailLog.email_type,
        templateName: emailLog.template_name,
        subject: `RE: ${emailLog.email_data?.subject || 'Notification from Humanly'}`,
        data: {
          ...emailLog.email_data,
          isResend: true,
          originalSentAt: emailLog.sent_at
        }
      });
    } catch (err) {
      console.error("Error in resendEmail:", err);
      return false;
    }
  }
};
