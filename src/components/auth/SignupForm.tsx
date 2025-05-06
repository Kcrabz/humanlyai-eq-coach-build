
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "./AuthError";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { useReCaptcha } from "@/hooks/useReCaptcha";
import { Checkbox } from "@/components/ui/checkbox";
import { validateEmailDomain } from "@/services/authService";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { signup } = useAuth();
  const { verifyRecaptcha, isVerifying } = useReCaptcha();
  
  // Honey pot field - hidden field that should not be filled by humans
  const [honeyPot, setHoneyPot] = useState("");
  
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
    
    // Check if email domain is allowed
    if (!validateEmailDomain(email)) {
      setErrorMessage("This email domain is not allowed. Please use a different email address.");
      return false;
    }
    
    if (!password) {
      setErrorMessage("Password is required");
      return false;
    }
    
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return false;
    }
    
    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      setErrorMessage("Password must include uppercase, lowercase, and number");
      return false;
    }
    
    if (!acceptTerms) {
      setErrorMessage("You must accept the terms and conditions");
      return false;
    }
    
    // Check honey pot - if it's filled, it's probably a bot
    if (honeyPot) {
      // Don't show error - just silently fail for bots
      console.log("Honey pot filled - rejecting submission");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isVerifying) {
      console.log("Form submission already in progress");
      return;
    }
    
    // Clear previous errors
    setErrorMessage(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log(`Starting signup process for: ${email}`);
    
    try {
      // Verify reCAPTCHA first
      const recaptchaToken = await verifyRecaptcha();
      
      if (!recaptchaToken) {
        setErrorMessage("Robot verification failed. Please try again.");
        return;
      }
      
      const success = await signup(email, password, recaptchaToken);
      console.log(`Signup result:`, { success });
    } catch (error) {
      console.error(`Error during signup:`, error);
      const message = error instanceof Error ? error.message : "Signup failed";
      setErrorMessage(message);
    } finally {
      console.log(`Signup process completed, resetting submission state`);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Create an account
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter your email below to create your account
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errorMessage && <AuthError message={errorMessage} />}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={handleEmailChange}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            disabled={isSubmitting}
            required
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters and include uppercase, lowercase, and numbers
          </p>
        </div>
        
        {/* Honeypot field - hidden from users but visible to bots */}
        <div className="hidden">
          <Input
            type="text"
            name="website"
            value={honeyPot}
            onChange={(e) => setHoneyPot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I accept the terms and conditions
          </label>
        </div>
        
        <AuthSubmitButton 
          isSubmitting={isSubmitting || isVerifying} 
          text="Create Account" 
          loadingText="Creating account..." 
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
