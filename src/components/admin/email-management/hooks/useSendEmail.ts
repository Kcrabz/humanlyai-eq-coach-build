
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
}

export const useSendEmail = (users: User[], onSendSuccess: () => void, onClose: () => void) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Generate email template data based on the selected template
  const generateTemplateData = () => {
    const baseData = { message: customMessage };
    
    switch(selectedTemplate) {
      case 'daily-nudge':
        return {
          ...baseData,
          challengeText: "Practice active listening in your next conversation. Focus entirely on understanding the speaker without planning your response while they're talking.",
          currentStreak: 5,
        };
      case 'weekly-summary':
        return {
          ...baseData,
          sessionsCompleted: 8,
          challengesCompleted: 5,
          breakthroughsCount: 2,
          personalisedInsight: "You're showing great progress in self-awareness. Try focusing on recognizing emotions in others this week.",
        };
      case 're-engagement':
        return {
          ...baseData,
          daysSinceLastLogin: 12,
          personalisedPrompt: "Emotional intelligence is like a muscle - regular practice leads to meaningful growth. Even a few minutes each day can make a significant difference.",
        };
      default:
        return baseData;
    }
  };

  // Generate a subject line based on the selected template
  const generateSubject = (template: string) => {
    switch(template) {
      case 'daily-nudge':
        return "Your Daily EQ Challenge";
      case 'weekly-summary':
        return "Your Weekly EQ Progress Report";
      case 're-engagement':
        return "We Miss You! Continue Your EQ Journey";
      default:
        return "Message from Humanly AI";
    }
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (subject === "" || subject === generateSubject(selectedTemplate)) {
      setSubject(generateSubject(template));
    }
  };

  const sendEmails = async () => {
    if (!selectedTemplate || selectedUsers.length === 0 || !subject) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setSending(true);
      toast.loading("Sending emails...", { id: "sending-emails" });

      const emailType = selectedTemplate.replace(/-/g, '_');
      const results = [];
      
      // Generate template-specific data
      const templateData = generateTemplateData();

      // Send emails to each selected user
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        if (!user) continue;

        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            userId: userId,
            emailType: emailType,
            templateName: selectedTemplate,
            subject: subject,
            to: user.email,
            data: {
              ...templateData,
              name: "User" // Default name if we don't have it
            }
          }
        });

        if (error) {
          console.error(`Error sending email to ${user.email}:`, error);
          results.push({ userId, email: user.email, success: false, error });
        } else {
          results.push({ userId, email: user.email, success: true });
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

      onSendSuccess();
      onClose();
    } catch (error) {
      console.error("Error in sending emails:", error);
      toast.dismiss("sending-emails");
      toast.error("An error occurred while sending emails");
    } finally {
      setSending(false);
    }
  };

  return {
    selectedTemplate,
    selectedUsers,
    subject,
    customMessage,
    sending,
    searchTerm,
    filteredUsers,
    handleUserToggle,
    handleSelectAll,
    handleTemplateChange,
    setSubject,
    setCustomMessage,
    setSearchTerm,
    sendEmails
  };
};
