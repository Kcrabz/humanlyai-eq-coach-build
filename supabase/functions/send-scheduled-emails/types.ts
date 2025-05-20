
// Type definitions for the function

export interface User {
  user_id: string;
  engagement_phase: string;
  last_login?: string;
  profiles?: {
    name?: string;
    eq_archetype?: string;
    coaching_mode?: string;
  };
  user_streaks?: {
    current_streak?: number;
    last_active_date?: string;
  };
}

export interface EmailPreferences {
  daily_nudges: boolean;
  challenge_reminders: boolean;
  inactivity_reminders: boolean;
  weekly_summary: boolean;
  achievement_notifications: boolean;
}

export interface ProcessingResults {
  total: number;
  emailsSent: number;
  emailTypes: {
    daily: number;
    weekly: number;
    reengagement: number;
  };
  results?: Array<{
    userId: string;
    emailType: string | null;
    success: boolean;
    error?: string;
  }>;
}

export interface ChallengeData {
  challengeText: string;
}
