
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { Progress } from "@/components/ui/progress";

interface AuthFormProps {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup, isLoading } = useAuth();
  const [progressValue, setProgressValue] = useState(0);
  
  // Simulate progress during authentication
  const simulateProgress = () => {
    setProgressValue(0);
    const interval = setInterval(() => {
      setProgressValue((prev) => {
        const newValue = prev + 5;
        if (newValue >= 95) {
          clearInterval(interval);
          return 95; // Cap at 95% until actual completion
        }
        return newValue;
      });
    }, 150);
    
    return () => clearInterval(interval);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgressValue(0);
    
    const cleanupProgress = simulateProgress();
    
    if (type === "login") {
      await login(email, password);
    } else {
      await signup(email, password);
    }
    
    cleanupProgress();
    setProgressValue(100);
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
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
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
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        {isLoading && (
          <div className="space-y-2">
            <Progress value={progressValue} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {progressValue < 30 ? "Connecting..." : 
               progressValue < 60 ? "Authenticating..." : 
               progressValue < 95 ? "Finalizing..." : 
               "Complete!"}
            </p>
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
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
