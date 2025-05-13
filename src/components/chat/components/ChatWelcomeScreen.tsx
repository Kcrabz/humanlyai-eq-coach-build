
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWelcomeMessage } from "@/lib/welcomeMessages";
import { useEffect, useState } from "react";

interface ChatWelcomeScreenProps {
  sendSuggestedMessage: (content: string) => void;
}

export function ChatWelcomeScreen({ sendSuggestedMessage }: ChatWelcomeScreenProps) {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  
  // Generate a welcome message when component mounts
  useEffect(() => {
    setWelcomeMessage(getWelcomeMessage());
  }, []);
  
  // Handler for sending a message - directly calls the passed function
  const handleSendMessage = (content: string) => {
    // Only send non-empty messages
    if (content.trim()) {
      sendSuggestedMessage(content);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="mb-4">
        <span className="inline-block p-4 rounded-full bg-humanly-teal-light/10">
          <MessageSquare className="text-humanly-teal h-6 w-6" />
        </span>
      </div>
      <h3 className="text-xl font-medium">Start a conversation</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        {welcomeMessage || "Send a message to begin your conversation with Kai, your EQ coach."}
      </p>
      <p className="text-muted-foreground mt-1 max-w-md">
        Kai will ask questions to understand your situation before offering guidance.
      </p>
      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Try starting with:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSendMessage("I've been feeling overwhelmed at work lately.")}
            className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30"
          >
            "I've been feeling overwhelmed at work lately."
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSendMessage("I struggle with communicating my needs to others.")}
            className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30"
          >
            "I struggle with communicating my needs to others."
          </Button>
        </div>
      </div>
    </div>
  );
}
