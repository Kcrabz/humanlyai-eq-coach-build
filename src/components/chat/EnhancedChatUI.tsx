
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import { MessageSquare } from "lucide-react";
import { ChatMessage } from "@/types";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatErrorBanner } from "@/components/chat/ChatErrorBanner";
import { useChatCompletion } from "@/hooks/useChatCompletion";

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
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialMessages);

  const { 
    sendChatMessage, 
    retry, 
    isLoading, 
    error, 
    isQuotaError, 
    isInvalidKeyError 
  } = useChatCompletion({
    onSuccess: (response) => {
      const newAssistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        created_at: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, newAssistantMessage]);
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      created_at: new Date().toISOString()
    };
    
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    
    // Clear input right away for better UX
    setMessage("");
    
    // Send message to API
    await sendChatMessage(updatedHistory);
  };

  const handleRetry = async () => {
    await retry();
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="mb-4">
              <span className="inline-block p-4 rounded-full bg-humanly-teal-light/10">
                <MessageSquare className="text-humanly-teal h-6 w-6" />
              </span>
            </div>
            <h3 className="text-xl font-medium">Start a conversation</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Send a message to begin your conversation with the AI assistant.
            </p>
          </div>
        ) : (
          chatHistory.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}
        
        {isLoading && (
          <div className="flex justify-center my-4">
            <Loading />
          </div>
        )}
      </div>
      
      <div className="border-t p-4 bg-background">
        {error && (
          <ChatErrorBanner 
            error={error}
            isQuotaError={isQuotaError}
            isInvalidKeyError={isInvalidKeyError}
            onRetry={handleRetry}
          />
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="min-h-[60px] resize-none soft-input"
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
            className="self-end soft-button-primary"
          >
            {isLoading ? <Loading size="small" /> : 
              <>
                <MessageSquare className="h-4 w-4 mr-1" />
                Send
              </>
            }
          </Button>
        </form>
        
        {isLoading && (
          <p className="text-xs text-muted-foreground mt-2 animate-pulse">
            AI assistant is thinking...
          </p>
        )}
      </div>
    </div>
  );
}
