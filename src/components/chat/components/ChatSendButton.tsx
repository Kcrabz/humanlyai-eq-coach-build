
import React from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface ChatSendButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  text?: string;
  className?: string;
  showIcon?: boolean;
  iconOnly?: boolean;
}

export function ChatSendButton({ 
  isLoading, 
  isDisabled, 
  text = "Send", 
  className = "", 
  showIcon = true,
  iconOnly = false
}: ChatSendButtonProps) {
  return (
    <Button 
      type="submit" 
      size="sm"
      className={className}
      disabled={isLoading || isDisabled}
    >
      {isLoading ? <Loading size="small" /> : (
        <>
          {showIcon && <Send className={`h-3.5 w-3.5 ${!iconOnly ? "mr-1" : ""}`} />}
          {!iconOnly && text}
        </>
      )}
    </Button>
  );
}
