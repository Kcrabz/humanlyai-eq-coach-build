
import { supabase } from "@/integrations/supabase/client";
import { EmailLog } from "./types";
import { 
  EmailErrorType, 
  withEmailErrorHandling
} from "./utils/errorHandler";

/**
 * Get email logs for the current user or all logs for admins
 */
export async function getEmailLogs(limit = 50, forAllUsers = false): Promise<EmailLog[]> {
  const [logs, error] = await withEmailErrorHandling(
    async () => {
      let query = supabase
        .from("email_logs")
        .select("*")
        .order("sent_at", { ascending: false });
      
      // If not fetching all users' logs, filter by current user
      if (!forAllUsers) {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) {
          throw new Error("No user ID available");
        }
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query.limit(limit);

      if (error) {
        throw error;
      }

      // Transform the data to match our EmailLog type
      return data?.map(log => ({
        ...log,
        email_data: log.email_data as Record<string, any> | null
      })) || [];
    },
    EmailErrorType.FETCH_FAILURE,
    "Failed to fetch email logs"
  );
  
  return logs || [];
}

/**
 * Force refresh email logs (useful after sending a new email)
 */
export async function refreshEmailLogs(limit = 50, forAllUsers = false): Promise<EmailLog[]> {
  // Clear any cached data if applicable
  return getEmailLogs(limit, forAllUsers);
}

/**
 * Log email send attempts, successful sends, and errors
 * @param userId User ID who is receiving the email
 * @param emailType Type of email (notification, marketing, etc.)
 * @param templateName Email template used
 * @param status Status of the email (sending, sent, failed, etc.)
 * @param data Additional email data including subject
 * @param errorMessage Error message if the send failed
 * @returns The inserted log entry ID or null if logging failed
 */
export async function logEmailSend(
  userId: string,
  emailType: string,
  templateName: string,
  status: 'sending' | 'sent' | 'failed' | 'skipped',
  data?: Record<string, any>,
  errorMessage?: string
): Promise<string | null> {
  try {
    const emailData = {
      ...(data || {}),
      ...(errorMessage ? { error: errorMessage } : {})
    };

    const { data: logResult, error } = await supabase
      .from("email_logs")
      .insert({
        user_id: userId,
        email_type: emailType,
        template_name: templateName,
        status: status,
        email_data: emailData,
        // sent_at will default to now() in the database
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Failed to log email:", error);
      return null;
    }
    
    return logResult.id;
  } catch (err) {
    console.error("Exception logging email:", err);
    return null;
  }
}

/**
 * Update an existing email log with new status and data
 * @param logId ID of the log entry to update
 * @param status New status
 * @param data Additional data to update
 * @param errorMessage Error message if applicable
 * @returns Success boolean
 */
export async function updateEmailLog(
  logId: string,
  status: 'sending' | 'sent' | 'failed' | 'skipped',
  data?: Record<string, any>,
  errorMessage?: string
): Promise<boolean> {
  try {
    const updateData: any = { status };
    
    if (data || errorMessage) {
      // First get the existing email_data to preserve it
      const { data: existingLog } = await supabase
        .from("email_logs")
        .select('email_data')
        .eq('id', logId)
        .single();
      
      if (existingLog && existingLog.email_data) {
        // Make sure email_data is an object before spreading
        const existingData = typeof existingLog.email_data === 'object' ? 
          existingLog.email_data : {};
        
        updateData.email_data = {
          ...existingData,
          ...(data || {}),
          ...(errorMessage ? { error: errorMessage } : {})
        };
      } else {
        // If no existing data or it's not an object, create new
        updateData.email_data = {
          ...(data || {}),
          ...(errorMessage ? { error: errorMessage } : {})
        };
      }
    }
    
    const { error } = await supabase
      .from("email_logs")
      .update(updateData)
      .eq('id', logId);
    
    if (error) {
      console.error("Failed to update email log:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Exception updating email log:", err);
    return false;
  }
}
