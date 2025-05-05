
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "./AuthError";
import { AuthSubmitButton } from "./AuthSubmitButton";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signup } = useAuth();
  
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
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
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
    
    // Clear previous errors
    setErrorMessage(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log(`Starting signup process for: ${email}`);
    
    try {
      const success = await signup(email, password);
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
        </div>
        
        <AuthSubmitButton 
          isSubmitting={isSubmitting} 
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
