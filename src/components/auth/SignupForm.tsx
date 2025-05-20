
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { AuthError } from "./AuthError";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { SecurityQuestionSelect } from "./SecurityQuestionSelect";
import { RateLimitWarning } from "./rate-limit/RateLimitWarning";
import { FormFields } from "./signup/FormFields";
import { TermsAgreement } from "./signup/TermsAgreement";
import { useSignupForm } from "@/hooks/useSignupForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignupForm() {
  const {
    email,
    password,
    securityQuestionId,
    securityAnswer,
    agreeToTerms,
    isSubmitting,
    errorMessage,
    validationErrors,
    passwordStrength,
    rateLimitInfo,
    handleEmailChange,
    handlePasswordChange,
    handleAgreeChange,
    handleSecurityQuestionChange,
    handleSecurityAnswerChange,
    handleSubmit
  } = useSignupForm();
  
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground mt-2">
          Enter your details below to create your account
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errorMessage && (
          <AuthError message={
            errorMessage.includes("already registered") || errorMessage.includes("already exists") 
              ? (
                <div className="flex flex-col gap-2">
                  <span>{errorMessage}</span>
                  <Link 
                    to="/login" 
                    className="text-humanly-teal hover:underline text-sm font-medium mt-1 inline-block"
                  >
                    Go to login page →
                  </Link>
                </div>
              ) 
              : errorMessage
          } />
        )}
        
        <RateLimitWarning rateLimitInfo={rateLimitInfo} />
        
        <FormFields 
          email={email}
          password={password}
          handleEmailChange={handleEmailChange}
          handlePasswordChange={handlePasswordChange}
          validationErrors={validationErrors}
          isSubmitting={isSubmitting}
          isRateLimited={rateLimitInfo?.isLimited || false}
          passwordStrength={passwordStrength}
        />
        
        <SecurityQuestionSelect 
          onQuestionChange={handleSecurityQuestionChange}
          onAnswerChange={handleSecurityAnswerChange}
          error={validationErrors.securityQuestion}
        />
        
        <TermsAgreement 
          agreeToTerms={agreeToTerms}
          handleAgreeChange={handleAgreeChange}
          validationError={validationErrors.terms}
          isSubmitting={isSubmitting}
          isRateLimited={rateLimitInfo?.isLimited || false}
        />
        
        <AuthSubmitButton 
          isSubmitting={isSubmitting} 
          text="Create Account" 
          loadingText="Creating Account..." 
          disabled={rateLimitInfo?.isLimited}
          data-testid="signup-submit-button"
        />
      </form>
      
      <div className="text-center text-sm">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-humanly-teal hover:text-humanly-teal-dark font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
