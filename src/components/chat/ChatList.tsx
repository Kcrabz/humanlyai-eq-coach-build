
import React, { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatBubble } from "./ChatBubble";
import { EmptyChatState } from "./components/EmptyChatState";
import { ChatLoadingIndicator } from "./components/ChatLoadingIndicator";

export function ChatList() {
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If there are messages and this is the first render, scroll to the most recent message
  useEffect(() => {
    if (messages.length > 0 && firstRenderRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      firstRenderRef.current = false;
    }
  }, [messages]);

  // Ensure we reset the first render flag when component unmounts/remounts
  useEffect(() => {
    return () => {
      firstRenderRef.current = true;
    };
  }, []);

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
