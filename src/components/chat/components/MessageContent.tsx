
import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export function MessageContent({ content, isUser }: MessageContentProps) {
  const isMobile = useIsMobile();
  // Comprehensive safety check - treat even a single space as empty
  const contentTrimmed = content?.trim() || "";
  const isEmpty = contentTrimmed === "";
  
  // If content is empty, render a non-breaking space to maintain height
  // but we return null if there's no content at all to help with conditional rendering in parent component
  if (isEmpty && (!content || content === "")) {
    console.log("MessageContent: Rendering null for completely empty content");
    return null;
  }
  
  if (isEmpty) {
    console.log("MessageContent: Rendering minimal placeholder for whitespace content");
    return <span className="inline-block min-h-[0.5em]">&nbsp;</span>;
  }
  
  return (
    <div className={cn(
      "prose max-w-none",
      isMobile ? "prose-xs" : "prose-sm",
      isUser ? "prose-invert text-white" : "",
      "prose-headings:mb-1 prose-headings:mt-2",
      "prose-p:leading-relaxed prose-p:break-words",
      isUser ? "prose-p:mb-1.5" : "prose-p:mb-2",
      isUser ? "prose-pre:bg-humanly-teal-dark prose-pre:text-white" : "prose-pre:bg-humanly-gray-lightest prose-pre:text-gray-800",
      isUser ? "prose-code:bg-humanly-teal-dark prose-code:text-white prose-code:rounded prose-code:px-1" : "prose-code:bg-humanly-gray-lightest prose-code:text-humanly-teal-dark prose-code:rounded prose-code:px-1",
      isUser ? "prose-blockquote:bg-humanly-teal-dark/50 prose-blockquote:border-l-4 prose-blockquote:border-white prose-blockquote:rounded-r prose-blockquote:pl-4 prose-blockquote:py-1" : "prose-blockquote:bg-humanly-pastel-lavender/30 prose-blockquote:border-l-4 prose-blockquote:border-humanly-teal prose-blockquote:rounded-r prose-blockquote:pl-4 prose-blockquote:py-1",
      "prose-li:mb-1"
    )}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
