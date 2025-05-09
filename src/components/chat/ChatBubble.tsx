
import React, { useEffect, useRef, useState } from "react";
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
  
  // State to control typing indicator visibility
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  // State to control if we should render the bubble at all
  const [shouldRenderBubble, setShouldRenderBubble] = useState(true);
  
  // Refs for managing timers and tracking content changes
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<string | null>(message.content);
  const initialRenderRef = useRef(true);
  
  const isMobile = useIsMobile();
  
  // Comprehensive check for empty content
  const hasContent = message.content != null && 
                    message.content !== undefined && 
                    message.content !== "" && 
                    message.content !== " ";
                   
  // Synchronize state with props
  useEffect(() => {
    // For assistant messages, handle typing indicator logic
    if (message.role === "assistant") {
      // Log every content change for debugging
      console.log(`Message [${message.id}] content updated:`, {
        oldContent: contentRef.current,
        newContent: message.content,
        contentLength: message.content?.length || 0,
        hasContent
      });
      
      // Update our ref to track content changes
      contentRef.current = message.content;
      
      // Determine if we should show typing indicator based on content
      if (!hasContent) {
        console.log(`Showing typing indicator for message: ${message.id}`);
        setShowTypingIndicator(true);
        setShouldRenderBubble(true);
        
        // Set safety timer to force hide empty bubbles after max time
        if (timerRef.current) clearTimeout(timerRef.current);
        
        timerRef.current = setTimeout(() => {
          console.log(`Safety timeout: Hiding empty bubble for message ${message.id}`);
          setShowTypingIndicator(false);
          setShouldRenderBubble(false);
        }, 5000);
      } else {
        // Content is present, hide typing indicator and show bubble
        console.log(`Content received for message ${message.id}, removing typing indicator`);
        setShowTypingIndicator(false);
        setShouldRenderBubble(true);
        
        // Clean up any pending timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    }
    
    // On the first render, don't consider it an update
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      
      // For assistant messages with empty content on initial render,
      // start the safety timer immediately
      if (message.role === "assistant" && !hasContent) {
        timerRef.current = setTimeout(() => {
          console.log(`Initial render timeout: Hiding empty bubble for message ${message.id}`);
          setShowTypingIndicator(false);
          setShouldRenderBubble(false);
        }, 5000);
      }
    }
  }, [message, message.content, hasContent]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Don't render anything if we shouldn't show the bubble
  if (message.role === "assistant" && !shouldRenderBubble && !hasContent) {
    console.log(`Not rendering bubble for empty message: ${message.id}`);
    return null;
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
        {message.role === "assistant" && showTypingIndicator ? (
          <TypingIndicator />
        ) : (
          <MessageContent content={message.content || ""} isUser={isUser} />
        )}
      </Card>
    </div>
  );
}
