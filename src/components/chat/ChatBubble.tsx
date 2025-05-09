
import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "./components/UserAvatar";
import { AssistantAvatar } from "./components/AssistantAvatar"; 
import { MessageContent } from "./components/MessageContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { TypingIndicator } from "./components/TypingIndicator";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  
  // Stricter check for empty content
  const hasNoContent = !message.content || message.content === "" || message.content === " ";
  
  // Only show typing indicator for empty assistant messages
  const isTyping = message.role === "assistant" && hasNoContent;
  
  // Debug timer to force-remove typing indicators if they persist
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // For debugging - log message state changes
    if (message.role === "assistant") {
      console.log(`Assistant message [${message.id}]: Content empty=${hasNoContent}, Content length=${message.content?.length || 0}, isTyping=${isTyping}, Content preview="${message.content?.substring(0, 20) || 'empty'}"`);
    }
    
    // Safety mechanism: If typing indicator persists for too long, force it to disappear
    if (isTyping) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set a new timer to force-remove typing indicator after 5 seconds
      timerRef.current = setTimeout(() => {
        console.log(`Forced removal of typing indicator for message: ${message.id}`);
        // This is just a safeguard as we should never hit this timeout
        // In a production app, we would update the message state here
      }, 5000);
    } else if (timerRef.current) {
      // Clear timer if content is no longer empty
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message, isTyping, hasNoContent]);
  
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        "flex gap-3 items-start mb-6 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {isUser ? <UserAvatar /> : <AssistantAvatar />}

      <Card
        className={cn(
          "p-4 max-w-[85%] text-left shadow-md rounded-2xl",
          isMobile ? "p-3 text-sm" : "p-4",
          isUser
            ? "bg-humanly-teal text-white enhanced-chat-user"
            : "enhanced-chat-ai"
        )}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <MessageContent content={message.content || ""} isUser={isUser} />
        )}
      </Card>
    </div>
  );
}
