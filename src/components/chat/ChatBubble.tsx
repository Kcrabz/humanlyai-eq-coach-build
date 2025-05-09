
import React from "react";
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
  
  // Only show typing indicator when message is completely empty
  // This is specifically for initial loading state before any content arrives
  const isTyping = message.role === "assistant" && message.content === "";
  
  const isMobile = useIsMobile();
  
  // For debugging - log incomplete messages
  if (isTyping) {
    console.log("Rendering loading bubble for assistant message", message.id);
  }
  
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
