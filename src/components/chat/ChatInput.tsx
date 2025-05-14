
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
        isMobile ? 60 : 120
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
    <div className="chat-input-wrapper">
      <form
        ref={formRef}
        className={`flex items-end gap-2 ${
          isMobile ? "p-2 pb-safe" : "p-3"
        } chat-input-container border-t bg-white`}
        onSubmit={handleSubmit}
        style={{ zIndex: 20 }}
      >
        <Textarea
          ref={textareaRef}
          className={`flex-1 resize-none py-2 text-sm pr-10 rounded-lg ${
            isMobile ? "max-h-[60px]" : "max-h-24"
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
            isMobile ? "bottom-[10px] right-4" : "bottom-5 right-5"
          } h-8 w-8 rounded-full flex items-center justify-center`}
          disabled={!message.trim() || isLoading}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
