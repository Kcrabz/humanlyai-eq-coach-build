
import { useState, FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/ui/loading";
import { MessageSquare, Sparkle, Info } from "lucide-react";
import { ChatMessage } from "@/types";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatErrorBanner } from "@/components/chat/ChatErrorBanner";
import { useChatCompletion } from "@/hooks/useChatCompletion";
import { useAuth } from "@/context/AuthContext";
import { useEQProgress } from "@/hooks/useEQProgress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [breakThroughDetected, setBreakThroughDetected] = useState<boolean>(false);
  const [userTurnCount, setUserTurnCount] = useState<number>(0);
  const [showHelpPrompt, setShowHelpPrompt] = useState<boolean>(false);
  
  const { isPremiumMember } = useAuth();
  const { checkForBreakthrough } = useEQProgress();

  const { 
    sendChatMessage, 
    retry, 
    isLoading, 
    error, 
    isQuotaError, 
    isInvalidKeyError 
  } = useChatCompletion({
    onSuccess: async (response, userMessageId) => {
      console.log("Received successful response:", response.substring(0, 50) + "...");
      const newAssistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        created_at: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, newAssistantMessage]);
      
      // For premium users, check if the user's message contains an EQ breakthrough
      if (isPremiumMember && userMessageId) {
        // Find the user message that triggered this response
        const userMessage = chatHistory.find(msg => msg.id === userMessageId);
        if (userMessage) {
          const hasBreakthrough = await checkForBreakthrough(userMessage.content, userMessageId);
          setBreakThroughDetected(hasBreakthrough);
        }
      }
    }
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  // Reset breakthrough notification after a delay
  useEffect(() => {
    if (breakThroughDetected) {
      const timer = setTimeout(() => {
        setBreakThroughDetected(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [breakThroughDetected]);
  
  // Track user turn count and show help prompt at turn 3
  useEffect(() => {
    const userMessages = chatHistory.filter(msg => msg.role === "user");
    setUserTurnCount(userMessages.length);
    
    // Show help prompt when user reaches turn 3
    if (userMessages.length === 3 && !showHelpPrompt) {
      setShowHelpPrompt(true);
    }
  }, [chatHistory, showHelpPrompt]);

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
    
    // Hide help prompt after user sends a message
    if (showHelpPrompt) {
      setShowHelpPrompt(false);
    }
    
    // Send message to API
    console.log("Sending message to API:", message);
    try {
      await sendChatMessage(updatedHistory, userMessage.id);
    } catch (error) {
      console.error("Error sending chat message:", error);
    }
  };

  const handleRetry = async () => {
    // Remove the last assistant message if it exists
    if (chatHistory.length > 1 && chatHistory[chatHistory.length - 1].role === "assistant") {
      setChatHistory(prev => prev.slice(0, -1));
    }
    
    try {
      await retry();
    } catch (error) {
      console.error("Error retrying message:", error);
    }
  };

  // Generate dynamic placeholder based on conversation stage
  const getDynamicPlaceholder = () => {
    if (userTurnCount === 0) return "What's on your mind today?";
    if (userTurnCount === 1) return "Tell me more about that...";
    if (userTurnCount === 2) return "How does this affect you?";
    return placeholder;
  };

  const sendSuggestedMessage = (content: string) => {
    setMessage(content);
    // Focus the textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
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
              Send a message to begin your conversation with Kai, your EQ coach.
              Kai will ask questions to understand your situation before offering guidance.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Try starting with:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => sendSuggestedMessage("I've been feeling overwhelmed at work lately.")}
                  className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30"
                >
                  "I've been feeling overwhelmed at work lately."
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendSuggestedMessage("I struggle with communicating my needs to others.")}
                  className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30"
                >
                  "I struggle with communicating my needs to others."
                </Button>
              </div>
            </div>
          </div>
        ) : (
          chatHistory.map((message) => <ChatBubble key={message.id} message={message} />)
        )}
        
        {showHelpPrompt && (
          <Alert className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30 flex items-center">
            <Info className="h-4 w-4 text-humanly-indigo" />
            <AlertDescription className="text-sm flex-grow">
              What would you like from Kai now?
            </AlertDescription>
            <div className="flex gap-2 ml-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendSuggestedMessage("I'd like some practical advice on this situation.")}
                      className="text-xs h-7 px-2"
                    >
                      Advice
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Get practical suggestions</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendSuggestedMessage("Help me reflect more on why I might feel this way.")}
                      className="text-xs h-7 px-2"
                    >
                      Reflection
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Explore your feelings deeper</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendSuggestedMessage("Give me a challenge to help with this.")}
                      className="text-xs h-7 px-2"
                    >
                      Challenge
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Get an activity to try</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Alert>
        )}
        
        {breakThroughDetected && isPremiumMember && (
          <Alert className="bg-humanly-teal-light/20 border-humanly-teal animate-pulse">
            <Sparkle className="h-4 w-4 text-humanly-teal" />
            <AlertDescription className="text-sm">
              <span className="font-medium">EQ Breakthrough Detected!</span> You're making great progress.
            </AlertDescription>
          </Alert>
        )}
        
        <div ref={messagesEndRef} />
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
            placeholder={getDynamicPlaceholder()}
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
            Kai is thinking...
          </p>
        )}
        
        {!isPremiumMember && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p>
              <a href="/pricing" className="text-humanly-teal hover:underline">Upgrade to Premium</a> to unlock EQ tracking, streak records, and breakthrough detection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
