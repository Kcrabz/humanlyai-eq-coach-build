
import { getEmailPreferences, updatePreferences, optOutAll } from "./preferences";
import { triggerEmail } from "./sender";
import { getEmailLogs } from "./logs";
import type { EmailPreference, EmailLog, TriggerEmailOptions } from "./types";

export const emailService = {
  getEmailPreferences,
  updatePreferences,
  optOutAll,
  triggerEmail,
  getEmailLogs,
};

export type { EmailPreference, EmailLog, TriggerEmailOptions };
