
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLoginForm } from "@/hooks/useLoginForm";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "./AuthError";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { RateLimitWarning } from "./rate-limit/RateLimitWarning";
import { EmailPasswordFields } from "./login/EmailPasswordFields";

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
  
  const { authEvent, user } = useAuth();
  
  // Debug authentication process
  useEffect(() => {
    console.log("LoginForm: Auth state updated", { 
      authEvent, 
      hasUser: !!user,
      userOnboarded: user?.onboarded,
      timestamp: new Date().toISOString()
    });
  }, [authEvent, user]);
  
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
