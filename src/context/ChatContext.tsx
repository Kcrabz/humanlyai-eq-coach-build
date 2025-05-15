import React, { createContext, useContext, useEffect, useState } from "react";
import { ChatMessage } from "@/types";
import { useChatContextMessages } from "@/hooks/chat/useChatContextMessages";
import { useChatActions } from "@/hooks/chat/useChatActions";
import { useAuth } from "@/context/AuthContext";
import { getIntroductionMessage, shouldShowIntroduction, markIntroductionAsShown } from "@/lib/introductionMessages";
import { getWelcomeMessage } from "@/lib/welcomeMessages";
import { shouldShowFreshChat } from "@/utils/loginRedirectUtils";

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  startNewChat: () => void;
  usageInfo: {
    currentUsage: number;
    limit: number;
    percentage: number;
  } | null;
  error: string | null;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
  restoreConversation: (messages: ChatMessage[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    updateAssistantMessage,
    clearMessages,
    checkMessageLimits,
    setMessages
  } = useChatContextMessages();
  
  const {
    isLoading,
    usageInfo,
    error,
    sendMessage: sendChatMessage,
    retryLastMessage: retryChatMessage,
    startNewChat: startNewChatSession
  } = useChatActions();

  const { user } = useAuth();
  
  // State to track if we've shown a fresh chat welcome message
  const [hasFreshChatRun, setHasFreshChatRun] = useState(false);
  // State to track if we've already processed the initial login clearing
  const [hasInitialCleared, setHasInitialCleared] = useState(false);

  // Check if we should show the introduction message for first-time users
  useEffect(() => {
    if (!user || isLoading || messages.length > 0) return;
    
    const checkAndSendIntroduction = async () => {
      // Only for first-time visitors to the chat
      if (user.id && shouldShowIntroduction(user.id)) {
        // Get the appropriate introduction message based on coaching mode
        const introMessage = getIntroductionMessage(user.coaching_mode);
        
        // If user has a bio, append a personalized note
        let finalIntroMessage = introMessage;
        if (user.bio) {
          finalIntroMessage = `${introMessage}\n\nI see from your bio that you mentioned: "${user.bio}". I'll keep this in mind as we work together.`;
        }
        
        // Add the assistant message with the introduction
        addAssistantMessage(finalIntroMessage);
        
        // Mark that we've shown the introduction to this user
        markIntroductionAsShown(user.id);
      }
    };
    
    checkAndSendIntroduction();
  }, [user, isLoading, messages.length]);

  // Force clean chat every time the component mounts with authenticated user
  useEffect(() => {
    if (!user || hasInitialCleared) return;
    
    // Always show a fresh chat when the chat page is loaded after login
    console.log("Showing fresh chat on initial page load");
    
    // Clear the UI messages (but database records are preserved)
    clearMessages();
    
    // Add a welcome message
    const welcomeMessage = getWelcomeMessage();
    addAssistantMessage(welcomeMessage);
    
    // Mark as done so we don't show again in this session
    setHasFreshChatRun(true);
    setHasInitialCleared(true);
    
    // Create a flag in sessionStorage to prevent repeated clearing if the user navigates away and back
    sessionStorage.setItem('chat_cleared_for_session', 'true');
    
  }, [user, hasInitialCleared, clearMessages, addAssistantMessage]);

  // Check for fresh login to display a clear chat experience
  useEffect(() => {
    if (!user || hasFreshChatRun) return;
    
    // Check if user has recently logged in and needs a fresh chat
    if (shouldShowFreshChat()) {
      console.log("Displaying fresh chat experience after login");
      
      // Clear the UI messages (but database records are preserved)
      clearMessages();
      
      // Add a welcome message
      const welcomeMessage = getWelcomeMessage();
      addAssistantMessage(welcomeMessage);
      
      // Mark as done so we don't show again
      setHasFreshChatRun(true);
      setHasInitialCleared(true);
      
      // Set the session flag to prevent history loading
      sessionStorage.setItem('chat_cleared_for_session', 'true');
    }
  }, [user, hasFreshChatRun, clearMessages, addAssistantMessage]);

  // Wrapper for sending messages
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    // Check if user has reached their message limit
    if (checkMessageLimits()) return;
    
    await sendChatMessage(content, addUserMessage, addAssistantMessage, updateAssistantMessage, messages);
  };

  // Wrapper for retrying messages
  const retryLastMessage = async () => {
    await retryChatMessage(addUserMessage, addAssistantMessage, updateAssistantMessage);
  };

  // Enhanced wrapper for starting a new chat that shows welcome message
  const startNewChat = () => {
    // First clear UI messages
    clearMessages();
    
    // Then start new chat session
    startNewChatSession(clearMessages);
    
    // Show a welcome message
    const welcomeMessage = getWelcomeMessage();
    addAssistantMessage(welcomeMessage);
  };

  // New method to restore a conversation
  const restoreConversation = (conversationMessages: ChatMessage[]) => {
    setMessages(conversationMessages);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      isLoading, 
      startNewChat, 
      usageInfo, 
      error,
      retryLastMessage,
      clearMessages,
      restoreConversation
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
