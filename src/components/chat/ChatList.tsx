
import React, { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatBubble } from "./ChatBubble";
import { EmptyChatState } from "./components/EmptyChatState";
import { ChatLoadingIndicator } from "./components/ChatLoadingIndicator";

export function ChatList() {
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
