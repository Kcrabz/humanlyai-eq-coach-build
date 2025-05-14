
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading } = useChat();
  const isMobile = useIsMobile();
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(
        textareaRef.current.scrollHeight,
        isMobile ? 80 : 120
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message, isMobile]);

  // Reset height when the message is sent
  useEffect(() => {
    if (!message && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    sendMessage(message);
    setMessage("");

    // Force textarea resize after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      ref={formRef}
      className={`border-t relative flex items-end gap-2 bg-white ${
        isMobile ? "p-2 pb-safe" : "p-3"
      }`}
      onSubmit={handleSubmit}
      style={{ minHeight: isMobile ? "50px" : "64px" }}
    >
      <Textarea
        ref={textareaRef}
        className={`flex-1 resize-none py-2 text-sm pr-10 rounded-lg ${
          isMobile ? "max-h-20" : "max-h-24"
        }`}
        placeholder="Type a message..."
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />

      <Button
        type="submit"
        size="sm"
        className={`absolute ${
          isMobile ? "bottom-4 right-4" : "bottom-5 right-5"
        } h-8 w-8 rounded-full flex items-center justify-center`}
        disabled={!message.trim() || isLoading}
      >
        <Send className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}
