
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/context/ChatContext";
import { Loading } from "@/components/ui/loading";
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const { sendMessage, isLoading, error, retryLastMessage } = useChat();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Store message value before clearing
    const messageToSend = message;
    
    // Clear input right away for better UX
    setMessage("");
    
    try {
      // Send the message
      await sendMessage(messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore the message if sending fails
      setMessage(messageToSend);
    }
  };

  // Check for specific error types
  const isQuotaError = error && 
    (error.includes("quota") || 
     error.includes("exceeded") || 
     error.includes("limit") ||
     error.includes("billing"));

  const isInvalidKeyError = error &&
    error.includes("Invalid API key");

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-background sticky bottom-0">
      {error && (
        <div className={`mb-2 p-3 rounded-md ${
          isQuotaError 
            ? 'bg-amber-50 border border-amber-200 text-amber-800' 
            : isInvalidKeyError 
              ? 'bg-orange-50 border border-orange-200 text-orange-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          } text-sm flex items-start`}
        >
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {isQuotaError 
                ? "API usage limit reached" 
                : isInvalidKeyError
                  ? "Invalid API key"
                  : "Failed to send message"}
            </p>
            <p className="text-xs mt-1">
              {isQuotaError 
                ? "Your OpenAI account has reached its usage limit or has billing issues. Please check your OpenAI account billing status." 
                : isInvalidKeyError
                  ? "The API key provided was rejected by OpenAI. Please check your key and try again."
                  : "Please try again or contact support if the issue persists."}
            </p>
            <div className="mt-2 flex gap-2">
              {isQuotaError && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs" 
                  onClick={() => window.open("https://platform.openai.com/account/billing/overview", "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Check OpenAI Billing
                </Button>
              )}
              
              {retryLastMessage && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs" 
                  onClick={retryLastMessage}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs" 
                onClick={() => window.open("https://humanlyai.me/support", "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[60px] resize-none"
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
          disabled={isLoading || !message.trim()}
          className="self-end"
        >
          {isLoading ? <Loading size="small" /> : "Send"}
        </Button>
      </div>
    </form>
  );
}
