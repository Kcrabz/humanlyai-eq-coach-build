
export interface EmailPreference {
  id?: string;
  user_id?: string;
  daily_nudges: boolean;
  weekly_summary: boolean;
  achievement_notifications: boolean;
  challenge_reminders: boolean;
  inactivity_reminders: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailLog {
  id: string;
  user_id: string;
  email_type: string;
  template_name: string;
  sent_at: string;
  opened_at?: string | null;
  clicked_at?: string | null;
  status?: string | null;
  email_data?: Record<string, any> | null;
}

export interface TriggerEmailOptions {
  userId: string;
  emailType: string;
  templateName: string;
  subject: string;
  to?: string;
  data?: Record<string, any>;
}
