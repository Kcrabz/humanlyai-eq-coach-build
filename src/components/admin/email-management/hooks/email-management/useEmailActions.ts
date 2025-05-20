
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailLog, User } from "./types";

export const useEmailActions = (users: User[], loadEmails: () => Promise<void>) => {
  const resendEmail = async (email: EmailLog) => {
    try {
      const recipient = users.find(user => user.id === email.user_id);
      
      if (!recipient) {
        toast.error("Recipient information not found");
        return;
      }

      toast.loading("Resending email...", { id: "resend-email" });

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          userId: email.user_id,
          emailType: email.email_type,
          templateName: email.template_name,
          subject: `Resent: ${email.email_type.replace(/_/g, ' ')}`,
          to: recipient.email,
          data: email.email_data
        }
      });

      if (error) {
        throw error;
      }

      toast.dismiss("resend-email");
      toast.success("Email resent successfully");
      loadEmails(); // Refresh the list
    } catch (error) {
      console.error("Error resending email:", error);
      toast.dismiss("resend-email");
      toast.error("Failed to resend email");
    }
  };

  return {
    resendEmail
  };
};
