
import React from "react";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { useNavigate } from "react-router-dom";
import { useChallenges } from "@/hooks/useChallenges";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyChallengeProps {
  standaloneMode?: boolean;
  onChallengeClick?: () => void;
}

export function DailyChallenge({ standaloneMode = false, onChallengeClick }: DailyChallengeProps) {
  const navigate = useNavigate();
  // Only use the chat context if not in standalone mode
  const chatContext = !standaloneMode ? useChat() : null;
  const { todaysChallenge, isChallengeCompleted, completeChallenge, isLoading } = useChallenges();
  
  const handleStartChallenge = () => {
    if (standaloneMode) {
      // If in standalone mode, use the provided callback or navigate to chat
      if (onChallengeClick) {
        onChallengeClick();
      } else {
        navigate("/chat");
      }
    } else if (chatContext && todaysChallenge) {
      // If chat context exists, send the message
      chatContext.sendMessage(todaysChallenge.prompt);
      // Mark the challenge as completed when the user engages with it
      completeChallenge();
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-1">
        <h3 className="text-xs uppercase font-medium text-muted-foreground">Daily Practice</h3>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  
  if (!todaysChallenge) {
    return (
      <div className="space-y-1">
        <h3 className="text-xs uppercase font-medium text-muted-foreground">Daily Practice</h3>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-auto py-2 px-2 text-xs text-muted-foreground"
          disabled={true}
        >
          Unable to load challenge
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      <h3 className="text-xs uppercase font-medium text-muted-foreground">Daily Practice</h3>
      
      <Button
        variant="outline"
        size="sm"
        className={`w-full h-auto py-2 px-2 flex flex-col items-start gap-1 ${
          isChallengeCompleted 
            ? 'border-green-200 bg-green-50 hover:bg-green-100' 
            : 'border-humanly-pastel-lavender/30 hover:bg-humanly-pastel-lavender/10'
        }`}
        onClick={handleStartChallenge}
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-humanly-indigo w-full justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-humanly-teal" />
            {todaysChallenge.title}
          </div>
          
          {isChallengeCompleted && (
            <Check className="h-3 w-3 text-green-600" />
          )}
        </div>
        <p className="text-xs text-left text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {todaysChallenge.description}
        </p>
      </Button>
    </div>
  );
}
