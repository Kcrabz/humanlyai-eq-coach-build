
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatWelcomeScreenProps {
  sendSuggestedMessage: (content: string) => void;
}

export function ChatWelcomeScreen({ sendSuggestedMessage }: ChatWelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="mb-4">
        <span className="inline-block p-4 rounded-full bg-humanly-teal-light/10">
          <MessageSquare className="text-humanly-teal h-6 w-6" />
        </span>
      </div>
      <h3 className="text-xl font-medium">Chat with Kai, your EQ Coach</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Kai can help you develop emotional intelligence skills through 
        thoughtful questions and practical guidance. What would you like to talk about?
      </p>
      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Try starting with:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => sendSuggestedMessage("I want to be better at handling difficult conversations with my team.")}
            className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30"
          >
            "I want to be better at handling difficult conversations."
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => sendSuggestedMessage("I get stressed when speaking in front of groups. Any tips?")}
            className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30"
          >
            "I get stressed when speaking in front of groups. Any tips?"
          </Button>
        </div>
      </div>
    </div>
  );
}
