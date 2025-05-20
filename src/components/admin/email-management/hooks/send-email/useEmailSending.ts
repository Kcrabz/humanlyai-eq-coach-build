
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";

export const useEmailSending = (
  selectedTemplate: string,
  selectedUsers: string[],
  subject: string,
  generateTemplateData: () => any,
  users: User[]
) => {
  const [sending, setSending] = useState(false);

  const validateEmailData = () => {
    if (!selectedTemplate) {
      toast.error("Please select an email template");
      return false;
    }
    
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one recipient");
      return false;
    }
    
    if (!subject.trim()) {
      toast.error("Please enter an email subject");
      return false;
    }
    
    return true;
  };

  const sendEmails = async (onSendSuccess: () => void, onClose: () => void) => {
    if (!validateEmailData()) {
      return;
    }

    try {
      setSending(true);
      toast.loading("Sending emails...", { id: "sending-emails" });

      const emailType = selectedTemplate.replace(/-/g, '_');
      const results = [];
      
      // Generate template-specific data
      const templateData = generateTemplateData();

      console.log("Sending emails with template data:", templateData);

      // Send emails to each selected user
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        if (!user) {
          console.error(`User ${userId} not found in users list`);
          results.push({ userId, email: "unknown", success: false, error: "User not found" });
          continue;
        }

        console.log(`Attempting to send email to user ${userId} (${user.email})`);

        const payload = {
          userId: userId,
          emailType: emailType,
          templateName: selectedTemplate,
          subject: subject,
          to: user.email,
          data: {
            ...templateData
            // The firstName will be fetched by the edge function
          }
        };

        console.log("Email payload:", JSON.stringify(payload, null, 2));

        try {
          const { data, error } = await supabase.functions.invoke('send-email', {
            body: payload
          });

          if (error) {
            console.error(`Error sending email to ${user.email}:`, error);
            results.push({ userId, email: user.email, success: false, error });
          } else {
            // Check for nested error in the response 
            if (data && data.error) {
              console.error(`API error sending email to ${user.email}:`, data.error);
              results.push({ userId, email: user.email, success: false, error: data.error });
            } else {
              console.log(`Email sent successfully to ${user.email}:`, data);
              results.push({ userId, email: user.email, success: true });
            }
          }
        } catch (invocationError) {
          console.error(`Exception during email function invocation for ${user.email}:`, invocationError);
          results.push({ userId, email: user.email, success: false, error: invocationError });
        }
      }

      toast.dismiss("sending-emails");
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount === 0) {
        toast.success(`Successfully sent ${successCount} email${successCount !== 1 ? 's' : ''}`);
      } else if (successCount === 0) {
        toast.error(`Failed to send all ${failCount} email${failCount !== 1 ? 's' : ''}`);
      } else {
        toast.warning(`Sent ${successCount} email${successCount !== 1 ? 's' : ''}, ${failCount} failed`);
      }

      if (successCount > 0) {
        onSendSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error in sending emails:", error);
      toast.dismiss("sending-emails");
      toast.error("An error occurred while sending emails");
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    sendEmails
  };
};
