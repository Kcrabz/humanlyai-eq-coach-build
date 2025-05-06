
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { isValidEmail, validatePassword } from "@/utils/validationUtils";
import { clientRateLimit, checkRateLimit } from "@/utils/rateLimiting";

export function useSignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestionId, setSecurityQuestionId] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    terms?: string;
    securityQuestion?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    feedback: string;
    strength: 'weak' | 'medium' | 'strong';
  }>({ isValid: false, feedback: "", strength: 'weak' });
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isLimited: boolean;
    attemptsRemaining: number;
    resetTimeMs: number;
  } | null>(null);
  
  const { signup } = useAuth();
  
  // Check password strength whenever password changes
  useEffect(() => {
    if (password.length > 0) {
      const result = validatePassword(password);
      setPasswordStrength(result);
    } else {
      setPasswordStrength({ isValid: false, feedback: "", strength: 'weak' });
    }
  }, [password]);
  
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;
    
    // Validate email
    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }
    
    // Validate security question
    if (!securityQuestionId) {
      errors.securityQuestion = "Please select a security question";
      isValid = false;
    }
    
    if (!securityAnswer.trim()) {
      errors.securityQuestion = "Please provide an answer to your security question";
      isValid = false;
    }
    
    // Validate terms agreement
    if (!agreeToTerms) {
      errors.terms = "You must agree to the terms and policies";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrorMessage(null);
    setValidationErrors(prev => ({ ...prev, email: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorMessage(null);
    setValidationErrors(prev => ({ ...prev, password: undefined }));
  };
  
  const handleAgreeChange = (checked: boolean) => {
    setAgreeToTerms(checked);
    setValidationErrors(prev => ({ ...prev, terms: undefined }));
  };
  
  const handleSecurityQuestionChange = (questionId: string) => {
    setSecurityQuestionId(questionId);
    setValidationErrors(prev => ({ ...prev, securityQuestion: undefined }));
  };
  
  const handleSecurityAnswerChange = (answer: string) => {
    setSecurityAnswer(answer);
    setValidationErrors(prev => ({ ...prev, securityQuestion: undefined }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log("Form submission already in progress");
      return;
    }
    
    // Check client-side rate limiting
    const rateLimit = clientRateLimit('signup_attempt', 5, 60000); // 5 attempts per minute
    
    if (rateLimit.isLimited) {
      setRateLimitInfo(rateLimit);
      setErrorMessage(`Too many signup attempts. Please try again in ${Math.ceil((rateLimit.resetTimeMs - Date.now()) / 1000)} seconds.`);
      return;
    }
    
    // Clear previous errors
    setErrorMessage(null);
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log(`Starting signup process for: ${email}`);
    
    try {
      // Check server-side rate limiting
      const serverRateLimit = await checkRateLimit({
        email,
        endpoint: 'signup',
        period: 'hour',
        maxRequests: 5 // Stricter limit for signup
      });
      
      if (serverRateLimit.isLimited) {
        setErrorMessage(`Too many signup attempts from this email. Please try again later.`);
        setRateLimitInfo({
          isLimited: true,
          attemptsRemaining: 0,
          resetTimeMs: serverRateLimit.resetTime.getTime()
        });
        return;
      }
      
      // Attempt to sign up the user - fix the error by passing correct parameters
      const success = await signup(email, password);
      console.log(`Signup result:`, { success });
      
      // Will be redirected by the auth state change listener if successful
    } catch (error) {
      console.error(`Error during signup:`, error);
      const message = error instanceof Error ? error.message : "Signup failed";
      setErrorMessage(message);
      
      // Update client-side rate limit info after failure
      const updatedRateLimit = clientRateLimit('signup_attempt', 5, 60000);
      setRateLimitInfo(updatedRateLimit);
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
    handleEmailChange,
    handlePasswordChange,
    handleAgreeChange,
    handleSecurityQuestionChange,
    handleSecurityAnswerChange,
    handleSubmit
  };
}
