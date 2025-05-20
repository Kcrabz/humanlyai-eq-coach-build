
import { useState } from "react";

export const useEmailTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");

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

  // Generate email template data based on the selected template
  const generateTemplateData = () => {
    const baseData = { 
      message: customMessage,
      appUrl: 'https://humanly.ai'  // Ensure correct base URL is set
    };
    
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

  return {
    selectedTemplate,
    subject,
    customMessage,
    setSubject,
    setCustomMessage,
    handleTemplateChange,
    generateTemplateData
  };
};
