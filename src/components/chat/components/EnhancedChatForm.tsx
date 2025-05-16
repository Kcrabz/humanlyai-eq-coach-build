
import { FormEvent, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ChatErrorBanner } from "@/components/chat/ChatErrorBanner";
import { useIOSDetection } from "@/hooks/use-ios-detection";
import { ChatSendButton } from "./ChatSendButton";

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
  const { isIOS, getIOSPadding, iosClass } = useIOSDetection();
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSubmit(message);
    setMessage("");
  };
  
  return (
    <div className={`border-t bg-background chat-input ${iosClass}`}>
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
          paddingBottom: getIOSPadding("8px"), // Reduced from 12px to 8px
          marginBottom: 0
        }}
      >
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="min-h-[40px] resize-none soft-input text-sm" // Height reduced from 50px to 40px
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        <ChatSendButton
          isLoading={isLoading}
          isDisabled={!message.trim()}
          className="self-end soft-button-primary h-8"
          showIcon={true}
          iconOnly={false}
          text="Send"
        />
      </form>
      
      {isLoading && (
        <p className="text-xs text-muted-foreground ml-3 mb-1 animate-pulse"> {/* Changed mb-2 to mb-1 */}
          Kai is thinking...
        </p>
      )}
      
      {!isPremiumMember && (
        <div 
          className="ml-3 mb-2 text-xs text-muted-foreground" /* Changed from mb-3 to mb-2 */
          style={{
            marginBottom: getIOSPadding("6px") /* Changed from 12px to 6px */
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
