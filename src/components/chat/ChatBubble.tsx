
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isEmpty = !message.content || message.content.trim() === "";
  const isLoading = isEmpty && !isUser;
  
  // For debugging - log incomplete messages
  if (isLoading) {
    console.log("Rendering loading bubble for assistant message", message.id);
  }
  
  return (
    <div
      className={cn(
        "flex gap-3 items-start",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {isUser ? (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-humanly-teal text-white">
            You
          </AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/images/kai-avatar.png" alt="Kai" />
          <AvatarFallback className="bg-humanly-green text-white">
            Kai
          </AvatarFallback>
        </Avatar>
      )}

      <Card
        className={cn(
          "p-4 max-w-[85%] text-left",
          isUser
            ? "bg-humanly-teal text-white"
            : "bg-gray-100 text-gray-900"
        )}
      >
        {isLoading ? (
          <div className="animate-pulse flex space-x-1 justify-center">
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
          </div>
        )}
      </Card>
    </div>
  );
}
