
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { clientRateLimit } from "@/utils/rateLimiting";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { markLoginSuccess } from "@/utils/loginRedirectUtils";

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
  const navigate = useNavigate();
  
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
    
    try {
      console.log("Attempting login with email:", email);
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful in useLoginForm, preparing navigation");
        
        // Mark login success for cross-page tracking - earlier than before
        markLoginSuccess();
        
        // Set toast only once
        toast.success("Login successful! Redirecting to dashboard...");
        
        // Increased delay to ensure auth state is fully updated before navigation
        // This is the ONLY place that should handle redirect after login
        setTimeout(() => {
          console.log("Navigation timeout triggered in useLoginForm, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        }, 500); // Increased from 300ms to 500ms for more reliable state updates
      } else {
        const updatedRateLimit = clientRateLimit('login_attempt', 5, 60000);
        setRateLimitInfo(updatedRateLimit);
        
        if (updatedRateLimit.attemptsRemaining > 0) {
          setErrorMessage(`Login failed. ${updatedRateLimit.attemptsRemaining} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error(`Error during login:`, error);
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
      setRateLimitInfo(clientRateLimit('login_attempt', 5, 60000));
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
