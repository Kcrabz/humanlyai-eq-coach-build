
import { useState, useEffect } from "react";
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
  const [loginTimestamp, setLoginTimestamp] = useState<number | null>(null);
  
  const { login, isPwaMode, isMobileDevice } = useAuth();
  const isSpecialMode = isPwaMode || isMobileDevice;
  
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
  
  // Effect to record mobile/PWA login success
  useEffect(() => {
    if (loginTimestamp && isSpecialMode) {
      console.log("Recording special mode login timestamp:", loginTimestamp, {
        isPwa: isPwaMode,
        isMobile: isMobileDevice
      });
      
      if (isPwaMode) {
        localStorage.setItem('pwa_login_timestamp', loginTimestamp.toString());
        sessionStorage.setItem('just_logged_in', 'true');
      }
      
      if (isMobileDevice) {
        localStorage.setItem('mobile_login_timestamp', loginTimestamp.toString());
        sessionStorage.setItem('mobile_just_logged_in', 'true');
      }
    }
  }, [loginTimestamp, isSpecialMode, isPwaMode, isMobileDevice]);
  
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
    console.log(`Login attempt starting for: ${email}`, {
      isPwa: isPwaMode,
      isMobile: isMobileDevice
    });
    
    try {
      // Clear existing navigation state
      AuthNavigationService.resetAllNavigationState();
      
      // Set authentication state
      AuthNavigationService.setState(NavigationState.AUTHENTICATING, { 
        email,
        isPwa: isPwaMode,
        isMobile: isMobileDevice
      });
      
      // Use the enhanced login function
      const success = await login(email, password);
      
      if (success) {
        console.log(`Login successful`, {
          isPwa: isPwaMode,
          isMobile: isMobileDevice
        });
        
        // Record login timestamp for special handling
        const timestamp = Date.now();
        setLoginTimestamp(timestamp);
        
        // Set special flags for mobile/PWA
        if (isPwaMode) {
          sessionStorage.setItem('pwa_login_complete', 'true');
        }
        
        if (isMobileDevice) {
          sessionStorage.setItem('mobile_login_complete', 'true');
        }
        
        // AuthenticationGuard will handle navigation
        AuthNavigationService.setState(NavigationState.AUTHENTICATED, {
          timestamp,
          isPwa: isPwaMode,
          isMobile: isMobileDevice,
          loginSuccess: true
        });
        
        if (!isSpecialMode) {
          toast.success("Login successful!");
        }
      } else {
        console.log("Login failed");
        const updatedRateLimit = clientRateLimit('login_attempt', 5, 60000);
        setRateLimitInfo(updatedRateLimit);
        AuthNavigationService.setState(NavigationState.ERROR, { 
          reason: "login_failed",
          isPwa: isPwaMode,
          isMobile: isMobileDevice
        });
        
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
        error: error instanceof Error ? error.message : "Unknown error",
        isPwa: isPwaMode,
        isMobile: isMobileDevice
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
