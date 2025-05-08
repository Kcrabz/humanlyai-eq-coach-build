
import React, { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatBubble } from "./ChatBubble";
import { EmptyChatState } from "./components/EmptyChatState";
import { ChatLoadingIndicator } from "./components/ChatLoadingIndicator";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function ChatList() {
  const { messages, isLoading, clearChatNow } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If there are messages and this is the first render, scroll to the most recent message
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length > 0 && (
        <div className="flex justify-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={clearChatNow}
            className="gap-2 text-muted-foreground hover:bg-humanly-pastel-lavender/20 hover:text-humanly-indigo"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Clear Chat</span>
          </Button>
        </div>
      )}
      
      {messages.length === 0 ? (
        <EmptyChatState />
      ) : (
        messages.map((message) => <ChatBubble key={message.id} message={message} />)
      )}
      
      {isLoading && <ChatLoadingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
