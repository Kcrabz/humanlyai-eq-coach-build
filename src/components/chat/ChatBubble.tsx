
import React from "react";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "./components/UserAvatar";
import { AssistantAvatar } from "./components/AssistantAvatar"; 
import { LoadingIndicator } from "./components/LoadingIndicator";
import { MessageContent } from "./components/MessageContent";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isEmpty = !message.content || message.content.trim() === "";
  const isLoading = isEmpty && !isUser && !message.content;
  const isMobile = useIsMobile();
  
  // For debugging - log incomplete messages
  if (isLoading) {
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
        {isLoading ? (
          <TypingIndicator />
        ) : (
          <MessageContent content={message.content} isUser={isUser} />
        )}
      </Card>
    </div>
  );
}

// Import and use the TypingIndicator component directly
import { TypingIndicator } from "./components/TypingIndicator";
