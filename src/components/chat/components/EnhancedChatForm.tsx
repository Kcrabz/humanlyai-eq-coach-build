
import { FormEvent, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import { MessageSquare } from "lucide-react";
import { ChatErrorBanner } from "@/components/chat/ChatErrorBanner";

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
  const [isIOS, setIsIOS] = useState(false);
  
  // Detect iOS devices
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSubmit(message);
    setMessage("");
  };
  
  return (
    <div className="border-t bg-background chat-input">
      {error && (
        <ChatErrorBanner 
          error={error}
          isQuotaError={isQuotaError}
          isInvalidKeyError={isInvalidKeyError}
          onRetry={onRetry}
        />
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="flex gap-2 p-3"
        style={{
          paddingBottom: isIOS ? "max(env(safe-area-inset-bottom, 0px), 12px)" : "12px",
          marginBottom: 0
        }}
      >
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="min-h-[50px] resize-none soft-input text-sm"
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
          className="self-end soft-button-primary h-8"
        >
          {isLoading ? <Loading size="small" /> : 
            <>
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Send
            </>
          }
        </Button>
      </form>
      
      {isLoading && (
        <p className="text-xs text-muted-foreground ml-3 mb-2 animate-pulse">
          Kai is thinking...
        </p>
      )}
      
      {!isPremiumMember && (
        <div 
          className="ml-3 mb-3 text-xs text-muted-foreground"
          style={{
            marginBottom: isIOS ? "max(env(safe-area-inset-bottom, 0px), 12px)" : "12px"
          }}
        >
          <p>
            <a href="/pricing" className="text-humanly-teal hover:underline">Upgrade to Premium</a> to unlock EQ tracking, streak records, and breakthrough detection.
          </p>
        </div>
      )}
    </div>
  );
}
