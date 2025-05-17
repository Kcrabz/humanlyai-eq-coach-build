
import { getEmailPreferences, updatePreferences, optOutAll } from "./preferences";
import { triggerEmail, resendEmail, sendTestEmail } from "./sender";
import { getEmailLogs } from "./logs";
import type { EmailPreference, EmailLog, TriggerEmailOptions } from "./types";

export const emailService = {
  getEmailPreferences,
  updatePreferences,
  optOutAll,
  triggerEmail,
  resendEmail,
  sendTestEmail,
  getEmailLogs,
};

export type { EmailPreference, EmailLog, TriggerEmailOptions };
