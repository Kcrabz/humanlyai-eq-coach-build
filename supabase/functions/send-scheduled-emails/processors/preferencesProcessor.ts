
import { EmailPreferences } from "../types.ts";

// Function to fetch user email preferences
export async function fetchUserEmailPreferences(supabase: any, userId: string): Promise<EmailPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.log(`Error fetching email preferences for user ${userId}:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("Error in fetchUserEmailPreferences:", err);
    return null;
  }
}
