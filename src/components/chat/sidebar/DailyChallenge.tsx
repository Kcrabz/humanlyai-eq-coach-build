
import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { useNavigate } from "react-router-dom";

// Simplified daily challenge
const DAILY_CHALLENGE = {
  title: "Today's Challenge",
  description: "Practice active listening for 10 minutes",
  prompt: "How can I improve my active listening skills?"
};

interface DailyChallengeProps {
  standaloneMode?: boolean;
  onChallengeClick?: () => void;
}

export function DailyChallenge({ standaloneMode = false, onChallengeClick }: DailyChallengeProps) {
  const navigate = useNavigate();
  // Only use the chat context if not in standalone mode
  const chatContext = !standaloneMode ? useChat() : null;
  
  const handleStartChallenge = () => {
    if (standaloneMode) {
      // If in standalone mode, use the provided callback or navigate to chat
      if (onChallengeClick) {
        onChallengeClick();
      } else {
        navigate("/chat");
      }
    } else if (chatContext) {
      // If chat context exists, send the message
      chatContext.sendMessage(DAILY_CHALLENGE.prompt);
    }
  };
  
  return (
    <div className="space-y-1">
      <h3 className="text-xs uppercase font-medium text-muted-foreground">Daily Practice</h3>
      
      <Button
        variant="outline"
        size="sm"
        className="w-full h-auto py-2 px-2 flex flex-col items-start gap-1 border-humanly-pastel-lavender/30 hover:bg-humanly-pastel-lavender/10"
        onClick={handleStartChallenge}
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-humanly-indigo">
          <Sparkles className="h-3 w-3 text-humanly-teal" />
          {DAILY_CHALLENGE.title}
        </div>
        <p className="text-xs text-left text-muted-foreground">
          {DAILY_CHALLENGE.description}
        </p>
      </Button>
    </div>
  );
}
