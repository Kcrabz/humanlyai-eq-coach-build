import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "./AuthError";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AlertCircle, Check, Clock, X } from "lucide-react";
import { isValidEmail, validatePassword } from "@/utils/validationUtils";
import { SecurityQuestionSelect } from "./SecurityQuestionSelect";
import { clientRateLimit, checkRateLimit } from "@/utils/rateLimiting";

export function SignupForm() {
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
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
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
  
  // Check password strength whenever password changes
  useEffect(() => {
    if (password.length > 0) {
      const result = validatePassword(password);
      setPasswordStrength(result);
    } else {
      setPasswordStrength({ isValid: false, feedback: "", strength: 'weak' });
    }
  }, [password]);
  
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
      
      // Attempt to sign up the user
      const success = await signup(email, password);
      console.log(`Signup result:`, { success });
      
      if (success) {
        // Store the security question information
        // This will happen after the user is created and needs to be registered in the profile
        // The code to store this is handled in the useAuthSignup.ts hook
        
        // Will be redirected by the auth state change listener
      }
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
  
  const getPasswordStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };
  
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-muted-foreground mt-2">
          Enter your details below to create your account
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errorMessage && <AuthError message={errorMessage} />}
        
        {rateLimitInfo?.isLimited && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md flex items-start gap-2 text-sm">
            <Clock className="h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-600" />
            <div>
              <p className="font-medium">Too many signup attempts</p>
              <p>Please wait {timeRemaining} seconds before trying again.</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={handleEmailChange}
            disabled={isSubmitting || rateLimitInfo?.isLimited}
            required
            className={validationErrors.email ? "border-red-500" : ""}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.email}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            disabled={isSubmitting || rateLimitInfo?.isLimited}
            required
            className={validationErrors.password ? "border-red-500" : ""}
          />
          
          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="space-y-1 mt-1">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} 
                  style={{ 
                    width: passwordStrength.strength === 'weak' ? '33%' : 
                           passwordStrength.strength === 'medium' ? '66%' : '100%' 
                  }}
                />
              </div>
              <p className={`text-sm ${
                passwordStrength.strength === 'weak' ? 'text-red-500' : 
                passwordStrength.strength === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {passwordStrength.feedback}
              </p>
              
              <ul className="space-y-1 mt-2 text-sm">
                <li className="flex items-center gap-1">
                  {password.length >= 8 ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <X className="h-4 w-4 text-red-500" />} 
                  At least 8 characters
                </li>
                <li className="flex items-center gap-1">
                  {/[a-zA-Z]/.test(password) && /\d/.test(password) ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <X className="h-4 w-4 text-red-500" />} 
                  Contains letters and numbers
                </li>
                <li className="flex items-center gap-1">
                  {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 
                    <Check className="h-4 w-4 text-green-500" /> : 
                    <X className="h-4 w-4 text-red-500" />} 
                  Contains a special character
                </li>
              </ul>
            </div>
          )}
          
          {validationErrors.password && (
            <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4" />
              {validationErrors.password}
            </p>
          )}
        </div>
        
        {/* Security Question Component */}
        <SecurityQuestionSelect 
          onQuestionChange={handleSecurityQuestionChange}
          onAnswerChange={handleSecurityAnswerChange}
          error={validationErrors.securityQuestion}
        />
        
        <div className="items-top flex space-x-2 mb-4">
          <Checkbox 
            id="terms" 
            checked={agreeToTerms} 
            onCheckedChange={handleAgreeChange}
            disabled={isSubmitting || rateLimitInfo?.isLimited}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and policies
            </label>
            {validationErrors.terms && (
              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.terms}
              </p>
            )}
          </div>
        </div>
        
        <AuthSubmitButton 
          isSubmitting={isSubmitting} 
          text="Create Account" 
          loadingText="Creating Account..." 
          disabled={rateLimitInfo?.isLimited}
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
