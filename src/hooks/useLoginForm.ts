
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { clientRateLimit } from "@/utils/rateLimiting";
import { toast } from "sonner";
import { AuthNavigationService, NavigationState } from "@/services/authNavigationService";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isLimited: boolean;
    attemptsRemaining: number;
    resetTimeMs: number;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  const { login } = useAuth();
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrorMessage(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorMessage(null);
  };
  
  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage("Email is required");
      return false;
    }
    
    if (!password) {
      setErrorMessage("Password is required");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Check client-side rate limiting
    const rateLimit = clientRateLimit('login_attempt', 5, 60000);
    
    if (rateLimit.isLimited) {
      setRateLimitInfo(rateLimit);
      setErrorMessage(`Too many login attempts. Please try again in ${Math.ceil((rateLimit.resetTimeMs - Date.now()) / 1000)} seconds.`);
      return;
    }
    
    setErrorMessage(null);
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    console.log("Login attempt starting for:", email);
    
    try {
      // Clear existing navigation state
      AuthNavigationService.resetAllNavigationState();
      
      // Set authentication state
      AuthNavigationService.setState(NavigationState.AUTHENTICATING, { email });
      
      // Use the enhanced login function
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful, navigation will be handled by AuthenticationGuard");
        toast.success("Login successful!");
        
        // We don't navigate here, AuthenticationGuard will handle it
        AuthNavigationService.setState(NavigationState.AUTHENTICATED);
      } else {
        console.log("Login failed");
        const updatedRateLimit = clientRateLimit('login_attempt', 5, 60000);
        setRateLimitInfo(updatedRateLimit);
        AuthNavigationService.setState(NavigationState.ERROR, { reason: "login_failed" });
        
        if (updatedRateLimit.attemptsRemaining > 0) {
          setErrorMessage(`Login failed. ${updatedRateLimit.attemptsRemaining} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error(`Error during login:`, error);
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
      setRateLimitInfo(clientRateLimit('login_attempt', 5, 60000));
      AuthNavigationService.setState(NavigationState.ERROR, { 
        reason: "login_error", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    password,
    isSubmitting,
    errorMessage,
    rateLimitInfo,
    timeRemaining,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  };
}
