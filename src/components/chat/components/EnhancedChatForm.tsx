
import { FormEvent, useState } from "react";
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
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSubmit(message);
    setMessage("");
  };
  
  return (
    <div className="border-t p-3 bg-background">
      {error && (
        <ChatErrorBanner 
          error={error}
          isQuotaError={isQuotaError}
          isInvalidKeyError={isInvalidKeyError}
          onRetry={onRetry}
        />
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
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
        <p className="text-xs text-muted-foreground mt-1.5 animate-pulse">
          Kai is thinking...
        </p>
      )}
      
      {!isPremiumMember && (
        <div className="mt-1.5 text-xs text-muted-foreground">
          <p>
            <a href="/pricing" className="text-humanly-teal hover:underline">Upgrade to Premium</a> to unlock EQ tracking, streak records, and breakthrough detection.
          </p>
        </div>
      )}
    </div>
  );
}
