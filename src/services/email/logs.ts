
import { supabase } from "@/integrations/supabase/client";
import { EmailLog } from "./types";

/**
 * Get email logs for the current user or all logs for admins
 */
export async function getEmailLogs(limit = 50, forAllUsers = false): Promise<EmailLog[]> {
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
}

/**
 * Force refresh email logs (useful after sending a new email)
 */
export async function refreshEmailLogs(limit = 50, forAllUsers = false): Promise<EmailLog[]> {
  // Clear any cached data if applicable
  return getEmailLogs(limit, forAllUsers);
}
