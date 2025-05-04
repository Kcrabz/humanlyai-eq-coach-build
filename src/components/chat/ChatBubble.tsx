
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/context/AuthContext";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { user } = useAuth();
  const isUser = message.role === "user";
  const isEmpty = !message.content || message.content.trim() === "";
  const isLoading = isEmpty && !isUser;
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "You";
    
    const nameParts = user.name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };
  
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
      {isUser ? (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-humanly-teal text-white">
            {getUserInitials()}
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
          "p-4 max-w-[85%] text-left shadow-md rounded-2xl",
          isUser
            ? "bg-humanly-teal text-white enhanced-chat-user"
            : "enhanced-chat-ai"
        )}
      >
        {isLoading ? (
          <div className="animate-pulse flex space-x-1 justify-center">
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
          </div>
        ) : (
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser ? "prose-invert text-white" : "",
            "prose-headings:mb-2 prose-headings:mt-3 prose-p:mb-3 prose-p:leading-relaxed",
            isUser ? "prose-pre:bg-humanly-teal-dark prose-pre:text-white" : "prose-pre:bg-humanly-gray-lightest prose-pre:text-gray-800",
            isUser ? "prose-code:bg-humanly-teal-dark prose-code:text-white prose-code:rounded prose-code:px-1" : "prose-code:bg-humanly-gray-lightest prose-code:text-humanly-teal-dark prose-code:rounded prose-code:px-1",
            isUser ? "prose-blockquote:bg-humanly-teal-dark/50 prose-blockquote:border-l-4 prose-blockquote:border-white prose-blockquote:rounded-r prose-blockquote:pl-4 prose-blockquote:py-1" : "prose-blockquote:bg-humanly-pastel-lavender/30 prose-blockquote:border-l-4 prose-blockquote:border-humanly-teal prose-blockquote:rounded-r prose-blockquote:pl-4 prose-blockquote:py-1",
            "prose-li:mb-1"
          )}>
            <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
          </div>
        )}
      </Card>
    </div>
  );
}
