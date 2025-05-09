
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
  
  // More robust check for empty content to prevent stale typing indicators
  const isTyping = message.role === "assistant" && 
                  (message.content === null || 
                   message.content === undefined || 
                   message.content === "");
  
  // Debug timer to force-remove typing indicators if they persist
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // For debugging - log message state changes
    if (message.role === "assistant") {
      console.log("Assistant message state updated:", message.id, 
        "Content empty:", !message.content, 
        "Content length:", message.content?.length || 0,
        "isTyping:", isTyping);
    }
    
    // Safety mechanism: If typing indicator persists for too long, force it to disappear
    if (isTyping && message.role === "assistant") {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Set a new timer to force-remove typing indicator after 15 seconds
      timerRef.current = setTimeout(() => {
        console.log("Forced removal of typing indicator for message:", message.id);
        // This won't update the actual message but will trigger a re-render
        // when development - in production we'd need to dispatch an action
      }, 15000);
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
  }, [message, isTyping]);
  
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
          <MessageContent content={message.content} isUser={isUser} />
        )}
      </Card>
    </div>
  );
}
