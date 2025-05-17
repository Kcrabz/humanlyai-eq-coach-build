
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useNavigate } from "react-router-dom";
import { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./components/UserAvatar";
import { AssistantAvatar } from "./components/AssistantAvatar";

export function MobileChatInterface() {
  const { messages, sendMessage, isLoading } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || isLoading) return;
    
    sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-gray-50 relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-15 bg-humanly-indigo text-white flex items-center px-4 z-50 shadow-sm"
           style={{ paddingTop: 'env(safe-area-inset-top, 0px)', height: 'calc(60px + env(safe-area-inset-top, 0px))' }}>
        <button 
          className="bg-transparent border-none text-white mr-3 cursor-pointer p-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold m-0">EQ Coach</h1>
      </div>
      
      {/* Message Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-3 pb-20" 
        style={{ 
          marginTop: 'calc(60px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(70px + env(safe-area-inset-bottom, 0px))' 
        }}
      >
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-3 flex ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-end`}
          >
            {message.role === "user" ? (
              <div className="ml-2 h-9 w-9 flex-shrink-0">
                <UserAvatar />
              </div>
            ) : (
              <div className="mr-2 h-9 w-9 flex-shrink-0">
                <AssistantAvatar />
              </div>
            )}
            
            <div 
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-base shadow-sm
                ${message.role === "user" 
                  ? "bg-humanly-indigo text-white" 
                  : "bg-white text-gray-800"}`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} className="h-1 w-full" />
      </div>
      
      {/* Input Container */}
      <div 
        className="fixed bottom-0 left-0 right-0 flex items-center bg-white border-t border-gray-200 px-4 py-3 z-40"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      >
        <input
          className="flex-1 border border-gray-200 rounded-full px-4 py-3 text-base outline-none bg-gray-50"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button 
          className="bg-humanly-indigo text-white border-none rounded-full w-10 h-10 ml-3 flex items-center justify-center"
          onClick={handleSendMessage}
          disabled={isLoading || !newMessage.trim()}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
