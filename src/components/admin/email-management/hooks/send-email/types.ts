
export interface User {
  id: string;
  email: string;
}

export interface EmailTemplateData {
  message?: string;
  appUrl?: string;
  challengeText?: string;
  currentStreak?: number;
  sessionsCompleted?: number;
  challengesCompleted?: number;
  breakthroughsCount?: number;
  personalisedInsight?: string;
  daysSinceLastLogin?: number;
  personalisedPrompt?: string;
}
