
import { updatePreferences, optOutAll } from './preferences';
import { getEmailLogs, refreshEmailLogs } from './logs';
import { triggerEmail, resendEmail, generateTestEmailTemplate, sendTestEmail } from './sender';
import { EmailPreference, EmailLog, TriggerEmailOptions } from './types';
import { 
  EmailErrorType,
  handleEmailError,
  withEmailErrorHandling,
  type EmailError
} from './utils/errorHandler';

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
  sendTestEmail,
  
  // Error handling
  errors: {
    handleEmailError,
    withEmailErrorHandling,
    EmailErrorType
  }
};

export type {
  EmailPreference,
  EmailLog,
  TriggerEmailOptions,
  EmailError
};
