
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChatMessage } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
      // Prepare API request
      const apiUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'http://localhost:54321';
      const endpoint = `${apiUrl}/functions/v1/chat-completion`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          archetype: user.eq_archetype,
          coachingMode: user.coaching_mode,
          subscriptionTier: user.subscription_tier,
          stream: false // Use non-streaming for simplicity
        })
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // If not JSON, use status text
          throw new Error(`Request failed with status: ${response.status}`);
        }
        
        // Check for usage limit error
        if (errorData.error?.includes("monthly message limit") || 
            errorData.error?.type === "usage_limit") {
          setIsQuotaError(true);
          throw new Error(errorData.error || "You've reached your monthly message limit");
        }
        
        throw new Error(errorData.error || `Request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Call onSuccess callback if provided, passing both response and original message ID
      if (onSuccess && data.content) {
        onSuccess(data.content, userMessageId);
      }
      
      return data.content;
    } catch (err: any) {
      console.error("Chat completion error:", err);
      
      // Determine error type
      const errorMessage = err.message || "Failed to get AI response";
      
      if (errorMessage.includes("quota") || errorMessage.includes("limit")) {
        setIsQuotaError(true);
        toast.error("Token usage limit exceeded", { 
          description: "You've reached your monthly message limit. Please upgrade your subscription.",
          action: {
            label: "Upgrade",
            onClick: () => navigate("/pricing")
          }
        });
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
