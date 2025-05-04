
import { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const useChatContextMessages = () => {
  const { 
    messages, 
    addUserMessage, 
    addAssistantMessage,
    updateAssistantMessage, 
    clearMessages 
  } = useChatMessages();
  
  const { user } = useAuth();

  // Check chat limits based on subscription tier
  useEffect(() => {
    // Skip check if no user, or no messages
    if (!user || messages.length === 0) return;

    const userMessages = messages.filter(msg => msg.role === "user").length;
    
    // Check limits based on subscription tier
    if (user?.subscription_tier === 'free' && userMessages >= 25) {
      toast.warning("You've reached your monthly message limit", {
        description: "Upgrade to Basic or Premium for more messages.",
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/pricing"
        }
      });
    } else if (user?.subscription_tier === 'basic' && userMessages >= 150) {
      toast.warning("You've reached your monthly message limit", {
        description: "Upgrade to Premium for unlimited messages.",
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/pricing"
        }
      });
    }
  }, [messages, user]);

  // Check if user has exceeded their message limit
  const checkMessageLimits = () => {
    if (!user) return false;
    
    const userMessages = messages.filter(msg => msg.role === "user").length;
    if ((user.subscription_tier === 'free' && userMessages >= 25) ||
        (user.subscription_tier === 'basic' && userMessages >= 150)) {
      toast.error("Message limit reached", {
        description: "Please upgrade your subscription to continue chatting.",
        action: {
          label: "Upgrade",
          onClick: () => window.location.href = "/pricing"
        }
      });
      return true;
    }
    return false;
  };

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    updateAssistantMessage,
    clearMessages,
    checkMessageLimits
  };
};
