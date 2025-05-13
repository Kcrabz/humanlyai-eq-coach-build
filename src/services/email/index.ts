
import { updatePreferences, optOutAll } from './preferences';
import { getEmailLogs, refreshEmailLogs } from './logs';
import { triggerEmail, resendEmail, generateTestEmailTemplate, sendTestEmail } from './sender';
import { EmailPreference, EmailLog, TriggerEmailOptions } from './types';

// Service for managing email-related operations
export const emailService = {
  // Email preferences
  updatePreferences,
  optOutAll,
  
  // Email logs
  getEmailLogs,
  refreshEmailLogs,
  
  // Email sending
  triggerEmail,
  resendEmail,
  
  // Email testing
  generateTestEmailTemplate,
  sendTestEmail
};

export type {
  EmailPreference,
  EmailLog,
  TriggerEmailOptions
};
