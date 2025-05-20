
// Check user email preferences before sending
export async function checkEmailPreferences(supabase: any, userId: string, emailType: string): Promise<{ canSend: boolean, reason?: string }> {
  console.log(`Checking email preferences for user: ${userId}`);
  try {
    const { data: preferences, error: prefError } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (prefError && prefError.code !== 'PGRST116') {
      console.error("Error fetching email preferences:", prefError);
      // If we can't fetch preferences, we'll default to sending the email
      return { canSend: true };
    } 
    
    console.log("Found preferences:", preferences);
    
    // If the user has opted out of this type of email, don't send it
    if (preferences) {
      if (emailType === 'daily_nudge' && !preferences.daily_nudges ||
          emailType === 'weekly_summary' && !preferences.weekly_summary ||
          emailType === 'achievement' && !preferences.achievement_notifications ||
          emailType === 'challenge' && !preferences.challenge_reminders ||
          emailType === 're_engagement' && !preferences.inactivity_reminders) {
        
        console.log(`User ${userId} has opted out of ${emailType} emails`);
        return { 
          canSend: false, 
          reason: "User opted out of this email type" 
        };
      }
    }
    
    return { canSend: true };
  } catch (preferencesError) {
    console.error("Error checking email preferences:", preferencesError);
    // Continue with sending the email even if we can't check preferences
    return { canSend: true };
  }
}
