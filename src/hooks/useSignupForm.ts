
import { useSignupFormState } from "./signup/useSignupFormState";
import { useSignupValidation } from "./signup/useSignupValidation";
import { useSignupRateLimit } from "./signup/useSignupRateLimit";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useSignupForm() {
  const {
    email,
    password,
    securityQuestionId,
    securityAnswer,
    agreeToTerms,
    isSubmitting,
    errorMessage,
    setIsSubmitting,
    setErrorMessage,
    handleEmailChange,
    handlePasswordChange,
    handleAgreeChange,
    handleSecurityQuestionChange,
    handleSecurityAnswerChange
  } = useSignupFormState();
  
  const {
    validationErrors,
    passwordStrength,
    validateForm,
    clearValidationError,
  } = useSignupValidation(email, password, securityQuestionId, securityAnswer, agreeToTerms);
  
  const {
    rateLimitInfo,
    checkClientRateLimit,
    checkServerRateLimit,
    updateRateLimitAfterFailure
  } = useSignupRateLimit();
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  // Modified event handlers to clear validation errors
  const handleEmailChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleEmailChange(e);
    clearValidationError('email');
  };

  const handlePasswordChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePasswordChange(e);
    clearValidationError('password');
  };
  
  const handleAgreeChangeWithValidation = (checked: boolean) => {
    handleAgreeChange(checked);
    clearValidationError('terms');
  };
  
  const handleSecurityQuestionChangeWithValidation = (questionId: string) => {
    handleSecurityQuestionChange(questionId);
    clearValidationError('securityQuestion');
  };
  
  const handleSecurityAnswerChangeWithValidation = (answer: string) => {
    handleSecurityAnswerChange(answer);
    clearValidationError('securityQuestion');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log("Form submission already in progress");
      return;
    }
    
    // Check client-side rate limiting
    const rateLimitError = checkClientRateLimit();
    if (rateLimitError) {
      setErrorMessage(rateLimitError);
      return;
    }
    
    // Clear previous errors
    setErrorMessage(null);
    
    // Validate the form
    if (!validateForm()) {
      console.log("Form validation failed:", validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    console.log(`Starting signup process for: ${email}`);
    
    try {
      // Check server-side rate limiting
      const serverRateLimitError = await checkServerRateLimit(email);
      if (serverRateLimitError) {
        setErrorMessage(serverRateLimitError);
        setIsSubmitting(false);
        return;
      }
      
      // Attempt to sign up the user
      const success = await signup(email, password, securityQuestionId, securityAnswer);
      console.log(`Signup result:`, { success });
      
      // If signup was successful, redirect to onboarding
      if (success) {
        console.log("Signup successful, redirecting to onboarding");
        setTimeout(() => {
          navigate("/onboarding", { replace: true });
        }, 500);
      } else {
        // Set error message if signup failed but no specific error was shown
        setErrorMessage("Signup failed. Please try again or contact support.");
      }
    } catch (error) {
      console.error(`Error during signup:`, error);
      const message = error instanceof Error ? error.message : "Signup failed";
      setErrorMessage(message);
      toast.error("Signup Error", {
        description: message
      });
      
      // Update client-side rate limit info after failure
      updateRateLimitAfterFailure();
    } finally {
      console.log(`Signup process completed, resetting submission state`);
      setIsSubmitting(false);
    }
  };

  return {
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
    handleEmailChange: handleEmailChangeWithValidation,
    handlePasswordChange: handlePasswordChangeWithValidation,
    handleAgreeChange: handleAgreeChangeWithValidation,
    handleSecurityQuestionChange: handleSecurityQuestionChangeWithValidation,
    handleSecurityAnswerChange: handleSecurityAnswerChangeWithValidation,
    handleSubmit
  };
}
