
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { clientRateLimit, checkRateLimit } from "@/utils/rateLimiting";
import { toast } from "sonner";
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
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { login } = useAuth();
  
  // Clear login form success flag when component mounts
  useEffect(() => {
    localStorage.removeItem('login_form_success');
  }, []);
  
  // Timer for rate limit countdown
  useEffect(() => {
    if (!rateLimitInfo?.isLimited) return;
    
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, rateLimitInfo.resetTimeMs - now);
      setTimeRemaining(Math.ceil(remaining / 1000)); // Convert to seconds
      
      if (remaining <= 0) {
        setRateLimitInfo(null);
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [rateLimitInfo]);
  
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
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful in form handler");
        setLoginSuccess(true);
        markLoginSuccess();
        
        // Force a redirect to dashboard to ensure navigation happens
        window.location.href = '/dashboard';
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
    loginSuccess,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  };
}
