
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TriggerEmailOptions } from "./types";
import { 
  EmailErrorType, 
  handleEmailError, 
  withEmailErrorHandling 
} from "./utils/errorHandler";

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
      handleEmailError(
        error, 
        EmailErrorType.SEND_FAILURE, 
        "Failed to send email"
      );
      return false;
    }

    toast.success("Email sent successfully");
    return true;
  } catch (err) {
    handleEmailError(
      err, 
      EmailErrorType.SEND_FAILURE, 
      "Failed to send email"
    );
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
      handleEmailError(
        fetchError || new Error("Email log not found"), 
        EmailErrorType.FETCH_FAILURE, 
        "Failed to retrieve original email data"
      );
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
          handleEmailError(
            e, 
            EmailErrorType.INVALID_DATA, 
            "Could not parse email data"
          );
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
    handleEmailError(
      err, 
      EmailErrorType.SEND_FAILURE, 
      "Failed to resend email"
    );
    return false;
  }
}

/**
 * Generate a simple test email template for delivery testing
 */
export function generateTestEmailTemplate(recipientName: string = 'User'): {
  subject: string;
  templateName: string;
  emailData: Record<string, any>;
} {
  const currentTime = new Date().toLocaleString();
  
  return {
    subject: `Email Test - ${currentTime}`,
    templateName: 'generic', // Use the generic template for testing
    emailData: {
      name: recipientName,
      message: `This is a test email sent at ${currentTime}. If you're reading this, email delivery is working correctly!`,
      testInfo: {
        timestamp: Date.now(),
        environment: window.location.hostname,
        testId: `test-${Math.random().toString(36).substring(2, 10)}`
      }
    }
  };
}

/**
 * Send a test email for verifying email delivery
 */
export async function sendTestEmail(userId: string, recipientEmail?: string): Promise<boolean> {
  const { subject, templateName, emailData } = generateTestEmailTemplate();
  
  toast.info("Sending test email...");
  
  const [result, error] = await withEmailErrorHandling(
    async () => {
      return await triggerEmail({
        userId,
        emailType: 'test_email',
        templateName,
        subject,
        to: recipientEmail,
        data: emailData
      });
    },
    EmailErrorType.SEND_FAILURE,
    "Failed to send test email"
  );
  
  if (error) {
    return false;
  }
  
  if (result) {
    toast.success("Test email sent successfully");
  }
  
  return !!result;
}
