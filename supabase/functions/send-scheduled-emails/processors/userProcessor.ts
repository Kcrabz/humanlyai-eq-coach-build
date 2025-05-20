
import { User, ProcessingResults } from "../types.ts";
import { daysBetween } from "../utils.ts";
import { fetchUserEmailPreferences } from "./preferencesProcessor.ts";
import { fetchUserEmail } from "./userDataProcessor.ts";
import { fetchLastEmailSent } from "./emailLogProcessor.ts";
import { determineEmailType } from "./emailTypeProcessor.ts";
import { sendEmail } from "./emailSender.ts";

export async function processUsers(users: User[], supabase: any): Promise<ProcessingResults> {
  const now = new Date();
  const processingResults: ProcessingResults = {
    total: users.length,
    emailsSent: 0,
    emailTypes: {
      daily: 0,
      weekly: 0,
      reengagement: 0
    }
  };
  
  // Process each user to determine what emails to send
  const emailPromises = users.map(async (user) => {
    try {
      const { user_id: userId } = user;
      const userName = user.profiles?.name || "there";
      const currentStreak = user.user_streaks?.current_streak || 0;
      
      // Check when we last sent an email to this user
      const lastEmail = await fetchLastEmailSent(supabase, userId);
      const lastEmailDate = lastEmail ? new Date(lastEmail.sent_at) : null;
      const daysSinceLastEmail = lastEmailDate ? daysBetween(lastEmailDate, now) : 999;
      
      // Check user's email preferences
      const preferences = await fetchUserEmailPreferences(supabase, userId);
      if (!preferences) {
        console.log(`No email preferences found for user ${userId}`);
        return { userId, emailType: null, success: true };
      }
      
      // Get the user's email
      const userEmail = await fetchUserEmail(supabase, userId);
      if (!userEmail) {
        console.log(`No email found for user ${userId}`);
        return { userId, emailType: null, success: true };
      }
      
      // Determine last login date and days since last login
      const lastLoginDate = user.last_login ? new Date(user.last_login) : null;
      const daysSinceLastLogin = lastLoginDate ? daysBetween(lastLoginDate, now) : 999;
      
      // Determine what email to send based on engagement phase and last activity
      const { emailType, templateName, subject, emailData } = await determineEmailType(
        user, 
        preferences, 
        daysSinceLastEmail, 
        daysSinceLastLogin, 
        userName, 
        currentStreak,
        supabase
      );
      
      // If we determined an email should be sent, send it
      if (emailType && templateName && subject) {
        const result = await sendEmail(
          supabase, 
          userId, 
          emailType, 
          templateName, 
          subject, 
          userEmail, 
          emailData
        );
        
        if (result.success) {
          processingResults.emailsSent++;
          
          // Increment the appropriate email type counter
          if (emailType === 'daily_nudge' || emailType === 'challenge') {
            processingResults.emailTypes.daily++;
          } else if (emailType === 'weekly_summary') {
            processingResults.emailTypes.weekly++;
          } else if (emailType === 're_engagement') {
            processingResults.emailTypes.reengagement++;
          }
        }
        
        return { userId, emailType, success: result.success };
      }
      
      return { userId, emailType: null, success: true };
    } catch (err) {
      console.error(`Error processing user ${user.user_id}:`, err);
      return { userId: user.user_id, error: err.message, success: false };
    }
  });
  
  // Wait for all email processing to complete
  const results = await Promise.all(emailPromises);
  processingResults.results = results.filter(r => r.emailType !== null);
  
  return processingResults;
}
