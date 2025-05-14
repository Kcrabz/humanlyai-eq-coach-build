
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthError } from "./AuthError";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { RateLimitWarning } from "./rate-limit/RateLimitWarning";
import { EmailPasswordFields } from "./login/EmailPasswordFields";
import { clientRateLimit } from "@/utils/rateLimiting";
import { toast } from "sonner";
import { 
  loginUser,
  isPwaMode,
  isMobileDevice,
  getAuthFlowState,
  AuthFlowState 
} from "@/services/authFlowService";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<string>('idle');
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isLimited: boolean;
    attemptsRemaining: number;
    resetTimeMs: number;
  } | null>(null);
  
  const navigate = useNavigate();
  const isSpecialMode = isPwaMode() || isMobileDevice();
  
  // Effect to check for previous login attempts
  useEffect(() => {
    const authState = getAuthFlowState();
    if (authState?.state === AuthFlowState.SUCCESS || 
        authState?.state === AuthFlowState.REDIRECTING) {
      setLoginStatus('success');
      console.log("LoginForm: Found existing auth success state");
    }
    
    // Check for success flags
    if (sessionStorage.getItem('login_success') === 'true') {
      setLoginStatus('success');
      console.log("LoginForm: Found login success flag");
    }
  }, []);
  
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
    setLoginStatus('submitting');
    
    console.log(`Login attempt starting for: ${email}`, {
      isPwa: isPwaMode(),
      isMobile: isMobileDevice()
    });
    
    try {
      // Use the centralized login service
      const success = await loginUser(email, password, navigate);
      
      if (success) {
        setLoginStatus('success');
        // Handled by the service
      } else {
        setLoginStatus('error');
        const updatedRateLimit = clientRateLimit('login_attempt', 5, 60000);
        setRateLimitInfo(updatedRateLimit);
        
        if (updatedRateLimit.attemptsRemaining > 0) {
          setErrorMessage(`Login failed. ${updatedRateLimit.attemptsRemaining} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error(`Error during login:`, error);
      setLoginStatus('error');
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
      setRateLimitInfo(clientRateLimit('login_attempt', 5, 60000));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter your email to sign in to your account
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errorMessage && <AuthError message={errorMessage} />}
        
        {loginStatus === 'success' && (
          <div className="bg-green-50 text-green-800 p-3 rounded-md border border-green-200 text-center animate-pulse">
            <p className="font-medium">Login successful!</p>
            <p className="text-sm">Redirecting you to your dashboard...</p>
          </div>
        )}
        
        <RateLimitWarning rateLimitInfo={rateLimitInfo} />
        
        <EmailPasswordFields
          email={email}
          password={password}
          handleEmailChange={handleEmailChange}
          handlePasswordChange={handlePasswordChange}
          isSubmitting={isSubmitting || loginStatus === 'success'}
          isRateLimited={rateLimitInfo?.isLimited || false}
        />
        
        <AuthSubmitButton 
          isSubmitting={isSubmitting} 
          text="Sign In" 
          loadingText={loginStatus === 'success' ? "Redirecting..." : "Signing in..."} 
          disabled={rateLimitInfo?.isLimited || loginStatus === 'success'}
        />
        
        {isSpecialMode && (
          <div className="text-xs text-center text-muted-foreground mt-2 bg-gray-50 p-1 rounded">
            <p>{isPwaMode() ? "PWA Mode" : "Mobile Browser"} detected</p>
          </div>
        )}
      </form>
      
      <div className="text-center text-sm">
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="text-humanly-teal hover:text-humanly-teal-dark font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
