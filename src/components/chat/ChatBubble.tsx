
import React, { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { Card } from "@/components/ui/card";
import { MemoryIndicator } from "./components/MemoryIndicator";
import { useMemoryIndicator } from "@/hooks/useMemoryIndicator";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import { UserAvatar } from "./components/UserAvatar";
import { AssistantAvatar } from "./components/AssistantAvatar";

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

  // Add highlight.js effect for code blocks
  useEffect(() => {
    if (isClient) {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [isClient, message.content]);
  
  // Check if the assistant message has relevant memories (for basic/premium users only)
  useEffect(() => {
    if (!isUserMessage && user && user.subscription_tier !== 'free' && message.content) {
      checkForRelevantMemories(message.content);
    }
  }, [isUserMessage, message.content, user, checkForRelevantMemories]);
  
  // Render the message with different styles for user and assistant
  return (
    <div className={`flex gap-3 ${isUserMessage ? "justify-end" : "justify-start"} ${className}`}>
      {/* Assistant Avatar - only show for assistant messages if showAvatar is true */}
      {!isUserMessage && showAvatar && (
        <AssistantAvatar />
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
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} className="text-blue-500 hover:underline" />
                ),
                p: ({ node, ...props }) => <p {...props} className="mb-4 last:mb-0" />,
                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6 mb-4" />,
                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6 mb-4" />,
                li: ({ node, ...props }) => <li {...props} className="mb-1" />,
                code: ({ className, children, ...props }) => {
                  // Fix: Remove the inline prop that was causing the TypeScript error
                  const match = /language-(\w+)/.exec(className || '');
                  
                  // Check if this is an inline code block based on parent element
                  const isInlineCode = !props.node?.position?.start.line;
                  
                  return !isInlineCode ? (
                    <pre className="p-4 rounded bg-gray-800 text-white overflow-auto mb-4">
                      <code className={match ? `language-${match[1]}` : ''} {...props}>
                        {String(children).replace(/\n$/, '')}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-gray-100 rounded px-1 py-0.5 text-gray-800" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content || ""}
            </ReactMarkdown>
          )}
        </Card>
      </div>
      
      {/* User Avatar - only show for user messages if showAvatar is true */}
      {isUserMessage && showAvatar && (
        <UserAvatar userId={user?.id} name={user?.name} avatarUrl={user?.avatar_url} className="h-8 w-8" />
      )}
    </div>
  );
}
