
import { Link } from "react-router-dom";
import { useLoginForm } from "@/hooks/useLoginForm";
import { AuthError } from "./AuthError";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { RateLimitWarning } from "./rate-limit/RateLimitWarning";
import { EmailPasswordFields } from "./login/EmailPasswordFields";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

export function LoginForm() {
  const {
    email,
    password,
    isSubmitting,
    errorMessage,
    rateLimitInfo,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  } = useLoginForm();
  
  const { isPwaMode, isMobileDevice, authEvent } = useAuth();
  const isSpecialMode = isPwaMode || isMobileDevice;
  
  // Add special handling for mobile login
  useEffect(() => {
    if (isSpecialMode && authEvent === 'SIGN_IN_COMPLETE') {
      // Show toast for mobile users
      toast.success("Login successful! Redirecting...");
      
      // Set login redirect flag for mobile
      sessionStorage.setItem('login_redirect_pending', 'true');
      
      console.log("LoginForm: Mobile login successful, setting redirect pending flag");
    }
  }, [isSpecialMode, authEvent]);
  
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
        
        <RateLimitWarning rateLimitInfo={rateLimitInfo} />
        
        <EmailPasswordFields
          email={email}
          password={password}
          handleEmailChange={handleEmailChange}
          handlePasswordChange={handlePasswordChange}
          isSubmitting={isSubmitting}
          isRateLimited={rateLimitInfo?.isLimited || false}
        />
        
        <AuthSubmitButton 
          isSubmitting={isSubmitting} 
          text="Sign In" 
          loadingText="Signing in..." 
          disabled={rateLimitInfo?.isLimited}
        />
        
        {isSpecialMode && (
          <div className="text-xs text-center text-muted-foreground">
            <p>Using mobile mode: {isPwaMode ? "PWA" : "Mobile Browser"}</p>
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
