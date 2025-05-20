
export interface EmailPayload {
  userId: string;
  emailType: string;
  templateName: string;
  subject: string;
  to?: string;
  data?: Record<string, any>;
}
