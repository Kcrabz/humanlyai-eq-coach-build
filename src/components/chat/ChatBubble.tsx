
import React, { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { MemoryIndicator } from "./components/MemoryIndicator";
import { useMemoryIndicator } from "@/hooks/useMemoryIndicator";
import { useAuth } from "@/context/AuthContext";

interface ChatBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  className?: string;
}

export function ChatBubble({ 
  message, 
  showAvatar = true, 
  className = "" 
}: ChatBubbleProps) {
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();
  const { checkForRelevantMemories, hasRelevantMemories, memoryStats } = useMemoryIndicator();
  
  // Check if this is a user message
  const isUserMessage = message.role === "user";
  
  // Use effect to set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check if the assistant message has relevant memories (for basic/premium users only)
  useEffect(() => {
    if (!isUserMessage && user && user.subscription_tier !== 'free' && message.content) {
      checkForRelevantMemories(message.content);
    }
  }, [isUserMessage, message.content, user]);
  
  // Render the message with different styles for user and assistant
  return (
    <div className={`flex gap-3 ${isUserMessage ? "justify-end" : "justify-start"} ${className}`}>
      {/* Assistant Avatar - only show for assistant messages if showAvatar is true */}
      {!isUserMessage && showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/images/kai-avatar.jpg" alt="Kai" />
          <AvatarFallback>K</AvatarFallback>
        </Avatar>
      )}
      
      {/* Message Content */}
      <div className={`max-w-[80%] space-y-1 ${isUserMessage ? "items-end" : "items-start"}`}>
        {/* Memory Indicator (for assistant messages only) */}
        {!isUserMessage && hasRelevantMemories && user?.subscription_tier !== 'free' && (
          <MemoryIndicator 
            hasMemories={hasRelevantMemories}
            memoryStats={memoryStats}
            className="mb-1"
          />
        )}
        
        {/* Message Card */}
        <Card
          className={`px-4 py-3 ${
            isUserMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          } ${isClient ? "opacity-100" : "opacity-0"}`}
        >
          {isClient && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              className={`prose max-w-none ${
                isUserMessage ? "prose-invert" : ""
              } ${isClient ? "opacity-100" : "opacity-0"}`}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} className="text-blue-500 hover:underline" />
                ),
                p: ({ node, ...props }) => <p {...props} className="mb-4 last:mb-0" />,
                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6 mb-4" />,
                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6 mb-4" />,
                li: ({ node, ...props }) => <li {...props} className="mb-1" />,
              }}
            >
              {message.content || ""}
            </ReactMarkdown>
          )}
        </Card>
      </div>
      
      {/* User Avatar - only show for user messages if showAvatar is true */}
      {isUserMessage && showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/images/default-avatar.png" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
