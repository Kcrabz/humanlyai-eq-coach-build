
import { useEffect, useRef, useState } from "react";
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
  const [userInteracted, setUserInteracted] = useState(false);
  const [isMobileSafari, setIsMobileSafari] = useState(false);
  
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

  // Detect Mobile Safari
  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
    const isMobile = /iPhone|iPad|iPod/i.test(ua);
    setIsMobileSafari(isSafari && isMobile);
  }, []);

  // Handle user interaction to fix Safari height bug
  useEffect(() => {
    if (!isMobileSafari) return;
    
    const handleInteraction = () => {
      setUserInteracted(true);
    };

    // Listen for interactions that should trigger height fix
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('scroll', handleInteraction, { once: true });
    document.addEventListener('click', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, [isMobileSafari]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [chatHistory, isLoading]);

  // Determine the height class based on browser and interaction state
  const heightClass = isMobileSafari && !userInteracted 
    ? "min-h-[85vh]" 
    : "h-[100dvh]";

  return (
    <div className={`flex flex-col ${heightClass} overflow-hidden w-full overflow-x-hidden ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        {chatHistory.length === 0 ? (
          <ChatWelcomeScreen sendSuggestedMessage={sendSuggestedMessage} />
        ) : (
          chatHistory.map((message) => <ChatBubble key={message.id} message={message} />)
        )}
        
        {showHelpPrompt && <HelpPrompt sendSuggestedMessage={sendSuggestedMessage} />}
        
        <BreakthroughAlert visible={breakThroughDetected && isPremiumMember} />
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="sticky bottom-0 bg-white z-10">
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
    </div>
  );
}
