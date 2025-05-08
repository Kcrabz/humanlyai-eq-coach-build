
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface HelpPromptProps {
  sendSuggestedMessage: (content: string) => void;
}

export function HelpPrompt({ sendSuggestedMessage }: HelpPromptProps) {
  return (
    <Alert className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30 flex items-center">
      <Info className="h-4 w-4 text-humanly-indigo" />
      <AlertDescription className="text-sm flex-grow">
        What would you like from Kai now?
      </AlertDescription>
      <div className="flex gap-2 ml-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendSuggestedMessage("I'd like some practical advice on this situation.")}
                className="text-xs h-7 px-2"
              >
                Advice
              </Button>
            </TooltipTrigger>
            <TooltipContent>Get practical suggestions</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendSuggestedMessage("Help me reflect more on why I might feel this way.")}
                className="text-xs h-7 px-2"
              >
                Reflection
              </Button>
            </TooltipTrigger>
            <TooltipContent>Explore your feelings deeper</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendSuggestedMessage("Give me a challenge to help with this.")}
                className="text-xs h-7 px-2"
              >
                Challenge
              </Button>
            </TooltipTrigger>
            <TooltipContent>Get an activity to try</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Alert>
  );
}
