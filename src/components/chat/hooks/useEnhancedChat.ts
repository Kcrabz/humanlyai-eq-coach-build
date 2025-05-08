
import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useEQProgress } from "@/hooks/useEQProgress";
import { useChatCompletion } from "@/hooks/useChatCompletion";

export function useEnhancedChat(initialMessages: ChatMessage[] = []) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialMessages);
  const [breakThroughDetected, setBreakThroughDetected] = useState<boolean>(false);
  const [userTurnCount, setUserTurnCount] = useState<number>(0);
  const [showHelpPrompt, setShowHelpPrompt] = useState<boolean>(false);
  
  const { isPremiumMember } = useAuth();
  const { checkForBreakthrough } = useEQProgress();

  // Track user turn count and show help prompt at turn 3
  useEffect(() => {
    const userMessages = chatHistory.filter(msg => msg.role === "user");
    setUserTurnCount(userMessages.length);
    
    // Show help prompt when user reaches turn 3
    if (userMessages.length === 3 && !showHelpPrompt) {
      setShowHelpPrompt(true);
    }
  }, [chatHistory, showHelpPrompt]);
  
  // Reset breakthrough notification after a delay
  useEffect(() => {
    if (breakThroughDetected) {
      const timer = setTimeout(() => {
        setBreakThroughDetected(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [breakThroughDetected]);
  
  const { 
    sendChatMessage, 
    retry, 
    isLoading, 
    error, 
    isQuotaError, 
    isInvalidKeyError 
  } = useChatCompletion({
    onSuccess: async (response, userMessageId) => {
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
  
  const handleSubmit = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      created_at: new Date().toISOString()
    };
    
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    
    // Hide help prompt after user sends a message
    if (showHelpPrompt) {
      setShowHelpPrompt(false);
    }
    
    // Send message to API
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
  
  const sendSuggestedMessage = (content: string) => {
    setMessage(content);
    // We're not using this function to directly submit since we want users to see the message before sending
  };
  
  // Generate dynamic placeholder based on conversation stage - more coaching-style prompts
  const getDynamicPlaceholder = () => {
    if (userTurnCount === 0) return "What's on your mind today?";
    if (userTurnCount === 1) return "Tell me more...";
    if (userTurnCount === 2) return "How does that impact you?";
    
    // Updated coaching-style prompts for more variety and better coaching tone
    const coachPrompts = [
      "Want a tip or just need to talk it out?",
      "Curious to explore more?",
      "Should we dig in or go practical?",
      "What would be most helpful right now?"
    ];
    
    return coachPrompts[userTurnCount % coachPrompts.length];
  };

  return {
    message,
    setMessage,
    chatHistory,
    breakThroughDetected,
    userTurnCount,
    showHelpPrompt,
    isLoading,
    error,
    isQuotaError,
    isInvalidKeyError,
    handleSubmit,
    handleRetry,
    sendSuggestedMessage,
    getDynamicPlaceholder
  };
}
