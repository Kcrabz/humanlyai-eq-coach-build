
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TriggerEmailOptions } from "./types";

/**
 * Manually trigger an email send (for testing or admin use)
 */
export async function triggerEmail(options: TriggerEmailOptions): Promise<boolean> {
  try {
    const { userId, emailType, templateName, subject, to, data = {} } = options;
    
    toast.info("Sending email...");
    
    // Ensure the appUrl is set in the data
    const emailData = {
      ...data,
      appUrl: 'https://humanly.ai' // Set the correct base URL
    };
    
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        userId,
        emailType,
        templateName,
        subject,
        to, // Optional, if not provided the function will fetch from auth.users
        data: emailData,
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
}

/**
 * Resend a previously sent email
 */
export async function resendEmail(emailLogId: string): Promise<boolean> {
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
    
    // Handle different possible types of email_data properly
    let emailData: Record<string, any> = {};
    
    // Check if email_data exists and determine its type
    if (emailLog.email_data) {
      if (typeof emailLog.email_data === 'object' && !Array.isArray(emailLog.email_data)) {
        // It's an object, we can use it directly
        emailData = emailLog.email_data as Record<string, any>;
      } else if (Array.isArray(emailLog.email_data)) {
        // It's an array, we can't use it directly for properties
        console.warn("email_data is an array, cannot extract subject");
      } else if (typeof emailLog.email_data === 'string') {
        // It's a string, try to parse it as JSON
        try {
          const parsed = JSON.parse(emailLog.email_data);
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            emailData = parsed;
          }
        } catch (e) {
          console.warn("Could not parse email_data as JSON:", e);
        }
      }
    }
    
    // Get subject with safe fallback
    const originalSubject = emailData?.subject || 'Notification from Humanly';
    
    return await triggerEmail({
      userId: emailLog.user_id,
      emailType: emailLog.email_type,
      templateName: emailLog.template_name,
      subject: `RE: ${originalSubject}`,
      data: {
        ...emailData,
        isResend: true,
        originalSentAt: emailLog.sent_at,
        appUrl: 'https://humanly.ai' // Ensure the correct base URL is set
      }
    });
  } catch (err) {
    console.error("Error in resendEmail:", err);
    return false;
  }
}
