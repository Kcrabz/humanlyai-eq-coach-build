
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { clientRateLimit, checkRateLimit } from "@/utils/rateLimiting";
import { toast } from "sonner";

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
  
  const { login, user } = useAuth();
  
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
    
    if (isSubmitting) {
      console.log("Form submission already in progress");
      return;
    }
    
    // Check client-side rate limiting
    const rateLimit = clientRateLimit('login_attempt', 5, 60000); // 5 attempts per minute
    
    if (rateLimit.isLimited) {
      setRateLimitInfo(rateLimit);
      setErrorMessage(`Too many login attempts. Please try again in ${Math.ceil((rateLimit.resetTimeMs - Date.now()) / 1000)} seconds.`);
      return;
    }
    
    // Clear previous errors
    setErrorMessage(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log(`Starting login process for: ${email}`);
    
    try {
      // Check server-side rate limiting
      const serverRateLimit = await checkRateLimit({
        email,
        endpoint: 'login',
        period: 'minute',
        maxRequests: 5 // 5 login attempts per minute
      });
      
      if (serverRateLimit.isLimited) {
        setErrorMessage(`Too many login attempts from this email. Please try again later.`);
        setRateLimitInfo({
          isLimited: true,
          attemptsRemaining: 0,
          resetTimeMs: serverRateLimit.resetTime.getTime()
        });
        return;
      }
      
      const success = await login(email, password);
      console.log(`Login result:`, { success });
      
      if (success) {
        setLoginSuccess(true);
        toast.success("Login successful!");
      } else {
        // If login failed, update rate limit info
        const updatedRateLimit = clientRateLimit('login_attempt', 5, 60000);
        setRateLimitInfo(updatedRateLimit);
        
        if (updatedRateLimit.attemptsRemaining > 0) {
          setErrorMessage(`Login failed. ${updatedRateLimit.attemptsRemaining} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error(`Error during login:`, error);
      const message = error instanceof Error ? error.message : "Login failed";
      setErrorMessage(message);
      
      // Update rate limit info after failure
      setRateLimitInfo(clientRateLimit('login_attempt', 5, 60000));
    } finally {
      console.log(`Login process completed, resetting submission state`);
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
