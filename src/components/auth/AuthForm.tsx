
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { AlertCircle } from "lucide-react";

interface AuthFormProps {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

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
    
    if (type === "signup" && password.length < 6) {
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
    console.log(`Starting ${type} process for: ${email}`);
    
    try {
      let success = false;
      
      if (type === "login") {
        success = await login(email, password);
      } else {
        // When signing up, we'll now be automatically logged in
        success = await signup(email, password);
      }
      
      if (success) {
        console.log("Operation successful, navigating to chat page");
        // Navigate to chat page for both login and signup (since signup now logs in)
        navigate("/chat");
      }
    } catch (error) {
      console.error(`Error during ${type}:`, error);
      const message = error instanceof Error ? error.message : `${type} failed`;
      setErrorMessage(message);
    } finally {
      console.log(`${type} process completed, resetting submission state`);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {type === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {type === "login" 
            ? "Enter your email to sign in to your account" 
            : "Enter your email below to create your account"}
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="bg-destructive/15 p-3 rounded-md flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-destructive">{errorMessage}</p>
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
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {type === "login" && (
              <Link 
                to="/forgot-password"
                className="text-sm text-humanly-teal hover:text-humanly-teal-dark"
              >
                Forgot password?
              </Link>
            )}
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
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loading size="small" className="border-white border-t-transparent" />
              <span>
                {type === "login" ? "Signing in..." : "Creating account..."}
              </span>
            </div>
          ) : type === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        {type === "login" ? (
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-humanly-teal hover:text-humanly-teal-dark font-medium">
              Sign Up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-humanly-teal hover:text-humanly-teal-dark font-medium">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
