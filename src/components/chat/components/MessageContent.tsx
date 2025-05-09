
import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export function MessageContent({ content, isUser }: MessageContentProps) {
  // Ensure we have a valid string to avoid rendering issues
  const safeContent = content || "";
  
  // If content is just whitespace or empty, render a non-breaking space to maintain height
  if (!safeContent.trim()) {
    return <span>&nbsp;</span>;
  }
  
  return (
    <div className={cn(
      "prose prose-sm max-w-none",
      isUser ? "prose-invert text-white" : "",
      "prose-headings:mb-2 prose-headings:mt-3 prose-p:mb-3 prose-p:leading-relaxed",
      isUser ? "prose-pre:bg-humanly-teal-dark prose-pre:text-white" : "prose-pre:bg-humanly-gray-lightest prose-pre:text-gray-800",
      isUser ? "prose-code:bg-humanly-teal-dark prose-code:text-white prose-code:rounded prose-code:px-1" : "prose-code:bg-humanly-gray-lightest prose-code:text-humanly-teal-dark prose-code:rounded prose-code:px-1",
      isUser ? "prose-blockquote:bg-humanly-teal-dark/50 prose-blockquote:border-l-4 prose-blockquote:border-white prose-blockquote:rounded-r prose-blockquote:pl-4 prose-blockquote:py-1" : "prose-blockquote:bg-humanly-pastel-lavender/30 prose-blockquote:border-l-4 prose-blockquote:border-humanly-teal prose-blockquote:rounded-r prose-blockquote:pl-4 prose-blockquote:py-1",
      "prose-li:mb-1"
    )}>
      <ReactMarkdown>{safeContent}</ReactMarkdown>
    </div>
  );
}
