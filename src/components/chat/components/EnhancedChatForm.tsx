
import { FormEvent, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import { MessageSquare, Send } from "lucide-react";
import { ChatErrorBanner } from "@/components/chat/ChatErrorBanner";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedChatFormProps {
  onSubmit: (content: string) => void;
  placeholder: string;
  isLoading: boolean;
  error: string | null;
  isQuotaError: boolean;
  isInvalidKeyError: boolean;
  onRetry: () => void;
  isPremiumMember: boolean;
}

export function EnhancedChatForm({ 
  onSubmit, 
  placeholder, 
  isLoading, 
  error, 
  isQuotaError, 
  isInvalidKeyError, 
  onRetry,
  isPremiumMember
}: EnhancedChatFormProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    onSubmit(message);
    setMessage("");
    
    // Force textarea resize after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };
  
  return (
    <div className={`sticky bottom-0 border-t relative bg-background ${isMobile ? 'p-2 pb-safe' : 'p-3'} chat-input-container`} style={{ zIndex: 20 }}>
      {error && (
        <ChatErrorBanner 
          error={error}
          isQuotaError={isQuotaError}
          isInvalidKeyError={isInvalidKeyError}
          onRetry={onRetry}
        />
      )}
      
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="relative flex items-end"
      >
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className={`min-h-[40px] w-full resize-none soft-input text-sm pr-10 rounded-lg ${
            isMobile ? 'max-h-[60px] py-2' : 'max-h-24'
          }`}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        
        <Button 
          type="submit"
          size="sm"
          disabled={isLoading || !message.trim()}
          className={`absolute ${isMobile ? 'bottom-[10px] right-2' : 'bottom-2 right-3'} h-8 w-8 rounded-full p-0 flex items-center justify-center`}
        >
          {isLoading ? <Loading size="small" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      </form>
      
      {isLoading && (
        <p className="text-xs text-muted-foreground mt-1 animate-pulse">
          Kai is thinking...
        </p>
      )}
      
      {!isPremiumMember && !isMobile && (
        <div className="mt-1 text-xs text-muted-foreground">
          <p>
            <a href="/pricing" className="text-humanly-teal hover:underline">Upgrade to Premium</a> to unlock EQ tracking, streak records, and breakthrough detection.
          </p>
        </div>
      )}
    </div>
  );
}
