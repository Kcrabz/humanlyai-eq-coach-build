
import { User, EmailPreferences } from "../types.ts";
import { fetchDailyChallenge } from "./challengeProcessor.ts";

export async function determineEmailType(
  user: User,
  preferences: EmailPreferences,
  daysSinceLastEmail: number,
  daysSinceLastLogin: number,
  userName: string,
  currentStreak: number,
  supabase: any
) {
  const { engagement_phase: phase } = user;
  let emailType = null;
  let templateName = null;
  let subject = null;
  let emailData: Record<string, any> = {};
  
  // For onboarding users (first 7 days): daily email if they haven't received one today
  if (phase === 'onboarding' && preferences.daily_nudges && daysSinceLastEmail >= 1) {
    // Daily nudge for onboarding users
    emailType = 'daily_nudge';
    templateName = 'daily-nudge';
    subject = "Your Daily EQ Challenge";
    
    // Fetch a challenge for this user
    const challenge = await fetchDailyChallenge(supabase, user.user_id);
    emailData = {
      name: userName,
      currentStreak,
      ...challenge
    };
  }
  // For habit-forming users (weeks 2-4): 3-5 sessions per week
  else if (phase === 'habit-forming' && preferences.challenge_reminders && daysSinceLastLogin >= 2 && daysSinceLastEmail >= 2) {
    emailType = 'challenge';
    templateName = 'daily-nudge';
    subject = "Continue Your EQ Growth Journey";
    
    // Fetch a challenge for this user
    const challenge = await fetchDailyChallenge(supabase, user.user_id);
    emailData = {
      name: userName,
      currentStreak,
      ...challenge
    };
  }
  // For post-habit users (week 5+): weekly summary and re-engagement if inactive
  else if (phase === 'post-habit') {
    // If they haven't logged in for 7+ days and opted into inactivity reminders
    if (daysSinceLastLogin >= 7 && preferences.inactivity_reminders && daysSinceLastEmail >= 7) {
      emailType = 're_engagement';
      templateName = 're-engagement';
      subject = "We Miss You! Continue Your EQ Journey";
      emailData = {
        name: userName,
        daysSinceLastLogin,
        personalisedPrompt: "Your emotional intelligence journey is waiting for you. Take a moment today to reflect and grow."
      };
    }
    // Weekly summary if they haven't received one in the last 6 days
    else if (preferences.weekly_summary && (
      !daysSinceLastEmail || 
      daysSinceLastEmail >= 6
    )) {
      emailType = 'weekly_summary';
      templateName = 'weekly-summary';
      subject = "Your Weekly EQ Progress Report";
      emailData = {
        name: userName,
        sessionsCompleted: 3, // Placeholder
        challengesCompleted: 2, // Placeholder
        breakthroughsCount: 1, // Placeholder
        personalisedInsight: "You're showing great progress in self-awareness! Keep practicing mindfulness."
      };
    }
  }

  return { emailType, templateName, subject, emailData };
}
