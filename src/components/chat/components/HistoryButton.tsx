
import React from "react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HistoryButtonProps {
  onClick: () => void;
  className?: string;
}

export function HistoryButton({ onClick, className = "" }: HistoryButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className={`rounded-full w-9 h-9 ${className}`}
          >
            <History className="h-4 w-4" />
            <span className="sr-only">View chat history</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View chat history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
