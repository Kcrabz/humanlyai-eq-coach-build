
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

interface HelpPromptProps {
  sendSuggestedMessage: (content: string) => void;
}

export function HelpPrompt({ sendSuggestedMessage }: HelpPromptProps) {
  return (
    <Card className="p-4 bg-humanly-pastel-lavender/10 border-humanly-indigo/20 mb-4">
      <div className="flex items-start gap-3">
        <InfoIcon className="h-5 w-5 text-humanly-indigo flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-medium text-sm mb-2">Looking for something specific?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Try asking Kai for practical advice on a specific emotional intelligence challenge.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => sendSuggestedMessage("I'd like some practical tips on managing stress at work.")}
              className="text-xs bg-white/80"
            >
              "I'd like some practical tips on managing stress."
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => sendSuggestedMessage("How can I be more confident in difficult conversations?")}
              className="text-xs bg-white/80"
            >
              "How can I be more confident in difficult conversations?"
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
