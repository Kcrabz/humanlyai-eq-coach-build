
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { useAuth } from "@/context/AuthContext";
import { ChatWelcomeScreen } from "@/components/chat/components/ChatWelcomeScreen";
import { HelpPrompt } from "@/components/chat/components/HelpPrompt";
import { BreakthroughAlert } from "@/components/chat/components/BreakthroughAlert";
import { EnhancedChatForm } from "@/components/chat/components/EnhancedChatForm";
import { useEnhancedChat } from "@/components/chat/hooks/useEnhancedChat";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
    <div className={`flex flex-col h-full ${className} enhanced-chat-ui`}>
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-2 space-y-2' : 'p-4 space-y-6'} chat-list-container`}>
        {chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <ChatWelcomeScreen sendSuggestedMessage={sendSuggestedMessage} />
          </div>
        ) : (
          chatHistory.map((message) => (
            <ChatBubble 
              key={message.id} 
              message={message} 
              className={isMobile ? "enhanced-chat-bubble-mobile" : ""}
            />
          ))
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
