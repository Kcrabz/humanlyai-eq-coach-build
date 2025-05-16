
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { useAuth } from "@/context/AuthContext";
import { ChatWelcomeScreen } from "@/components/chat/components/ChatWelcomeScreen";
import { HelpPrompt } from "@/components/chat/components/HelpPrompt";
import { BreakthroughAlert } from "@/components/chat/components/BreakthroughAlert";
import { EnhancedChatForm } from "@/components/chat/components/EnhancedChatForm";
import { useEnhancedChat } from "@/components/chat/hooks/useEnhancedChat";

interface EnhancedChatUIProps {
  initialMessages?: ChatMessage[];
  placeholder?: string;
  className?: string;
}

export function EnhancedChatUI({ 
  initialMessages = [],
  placeholder = "Type a message...",
  className = ""
}: EnhancedChatUIProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isPremiumMember } = useAuth();
  
  const {
    chatHistory,
    breakThroughDetected,
    showHelpPrompt,
    isLoading,
    error,
    isQuotaError,
    isInvalidKeyError,
    handleSubmit,
    handleRetry,
    sendSuggestedMessage,
    getDynamicPlaceholder
  } = useEnhancedChat(initialMessages);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 ? (
          <ChatWelcomeScreen sendSuggestedMessage={sendSuggestedMessage} />
        ) : (
          chatHistory.map((message) => <ChatBubble key={message.id} message={message} />)
        )}
        
        {showHelpPrompt && <HelpPrompt sendSuggestedMessage={sendSuggestedMessage} />}
        
        <BreakthroughAlert visible={breakThroughDetected && isPremiumMember} />
        
        <div ref={messagesEndRef} />
      </div>
      
      <EnhancedChatForm
        onSubmit={handleSubmit}
        placeholder={getDynamicPlaceholder()}
        isLoading={isLoading}
        error={error}
        isQuotaError={isQuotaError}
        isInvalidKeyError={isInvalidKeyError}
        onRetry={handleRetry}
        isPremiumMember={isPremiumMember}
      />
    </div>
  );
}
