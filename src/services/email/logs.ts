
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
