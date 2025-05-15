
// Updating the ChatInput component with improved mobile spacing
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading } = useChat();
  const [isPWA, setIsPWA] = useState(false);

  // Detect if running as PWA
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      className={`p-3 border-t flex items-end gap-2 relative ${isPWA ? 'pb-safe' : ''}`}
      onSubmit={handleSubmit}
      style={{
        paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom, 0px))`
      }}
    >
      <Textarea
        ref={textareaRef}
        className="flex-1 resize-none max-h-24 py-2 text-sm pr-12 rounded-lg"
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
        className="absolute right-5 bottom-5 h-8 w-8 rounded-full flex items-center justify-center"
        disabled={!message.trim() || isLoading}
      >
        <Send className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}
