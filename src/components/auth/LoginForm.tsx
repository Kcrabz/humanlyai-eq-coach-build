
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthError } from "./AuthError";
import { AuthSubmitButton } from "./AuthSubmitButton";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  
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
    console.log(`Starting login process for: ${email}`);
    
    try {
      const success = await login(email, password);
      console.log(`Login result:`, { success });
    } catch (error) {
      console.error(`Error during login:`, error);
      const message = error instanceof Error ? error.message : "Login failed";
      setErrorMessage(message);
    } finally {
      console.log(`Login process completed, resetting submission state`);
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/forgot-password"
              className="text-sm text-humanly-teal hover:text-humanly-teal-dark"
            >
              Forgot password?
            </Link>
          </div>
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
          text="Sign In" 
          loadingText="Signing in..." 
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
