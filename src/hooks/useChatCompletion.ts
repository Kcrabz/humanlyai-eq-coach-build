
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChatMessage } from '@/types';
import { useNavigate } from 'react-router-dom';

interface UseChatCompletionOptions {
  onSuccess?: (response: string, userMessageId?: string) => void;
}

export function useChatCompletion({ onSuccess }: UseChatCompletionOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessageId, setLastUserMessageId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Error flags for specific error types
  const [isQuotaError, setIsQuotaError] = useState(false);
  const [isInvalidKeyError, setIsInvalidKeyError] = useState(false);

  const sendChatMessage = useCallback(async (messages: ChatMessage[], userMessageId?: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsQuotaError(false);
    setIsInvalidKeyError(false);
    
    // Store the user message ID for potential retry operations
    if (userMessageId) {
      setLastUserMessageId(userMessageId);
    }

    try {
      // Mock AI response for demonstration
      const mockResponses = [
        "I understand how you're feeling. It sounds like you've had a challenging experience.",
        "That's a great insight about your emotions. Have you considered how this pattern might affect other areas of your life?",
        "I notice you're making progress in recognizing your emotional triggers. That's an important step in emotional intelligence.",
        "Could you tell me more about how that situation made you feel? Understanding our emotional responses helps us grow."
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Pick a random response
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      const response = mockResponses[responseIndex];
      
      // Call onSuccess callback if provided, passing both response and original message ID
      if (onSuccess) {
        onSuccess(response, userMessageId);
      }
      
      return response;
    } catch (err: any) {
      console.error("Chat completion error:", err);
      
      // Determine error type
      const errorMessage = err.message || "Failed to get AI response";
      
      if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        setIsQuotaError(true);
      } else if (errorMessage.includes("invalid key") || errorMessage.includes("authentication")) {
        setIsInvalidKeyError(true);
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, onSuccess]);

  const retry = useCallback(async () => {
    if (!lastUserMessageId) {
      setError("No previous message to retry");
      return;
    }
    
    // Reset errors
    setError(null);
    setIsQuotaError(false);
    setIsInvalidKeyError(false);
    
    // Get the last user message and retry
    try {
      setIsLoading(true);
      
      // Mock AI response for demonstration
      const mockResponses = [
        "Let me try again. I think what you're describing is a moment of emotional growth.",
        "Upon reflection, it seems like you're developing greater self-awareness about your emotional patterns.",
        "To elaborate on my previous response, these feelings you're experiencing are important signals.",
        "I want to emphasize how significant this realization is for your emotional intelligence journey."
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Pick a random response
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      const response = mockResponses[responseIndex];
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response, lastUserMessageId);
      }
      
      return response;
    } catch (err: any) {
      console.error("Retry error:", err);
      setError(err.message || "Failed to retry");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [lastUserMessageId, onSuccess]);

  return {
    sendChatMessage,
    retry,
    isLoading,
    error,
    isQuotaError,
    isInvalidKeyError,
    clearError: () => setError(null)
  };
}
