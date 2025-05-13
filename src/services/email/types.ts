
// Define types for email service
export interface EmailPreference {
  user_id?: string;
  daily_nudges?: boolean;
  weekly_summary?: boolean;
  achievement_notifications?: boolean;
  challenge_reminders?: boolean;
  inactivity_reminders?: boolean;
  updated_at?: string;
}

export interface EmailLog {
  id: string;
  user_id: string;
  email_type: string;
  template_name: string;
  email_data: any;
  sent_at: string;
  status: string;
}

export interface TriggerEmailOptions {
  userId: string; 
  emailType: string; 
  templateName: string;
  subject: string;
  to?: string;
  data?: Record<string, any>;
}
