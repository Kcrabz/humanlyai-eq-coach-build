
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if we have the necessary parameters from the reset email
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const type = searchParams.get("type");
    
    if (!accessToken || type !== "recovery") {
      setErrorMessage("Invalid or expired password reset link. Please try again.");
    }
  }, [searchParams]);

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage(null);
    
    if (!validatePassword(password)) {
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const accessToken = searchParams.get("access_token");
      
      if (!accessToken) {
        throw new Error("Missing access token");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast.success("Password updated successfully", {
        description: "You can now log in with your new password"
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      console.error("Password update error:", error);
      const message = error instanceof Error ? error.message : "Failed to update password";
      setErrorMessage(message);
      toast.error("Failed to update password", {
        description: "Please try again or contact support"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10 w-full max-w-md">
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-blue/40 rounded-3xl blur-xl"></div>
          
          <Card className="border-none shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">
                {isSuccess ? "Password Updated" : "Create New Password"}
              </CardTitle>
              <CardDescription className="text-center">
                {isSuccess 
                  ? "Your password has been reset successfully" 
                  : "Enter your new password below"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isSuccess ? (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 text-green-700 p-4 rounded-md flex flex-col items-center gap-2">
                    <CheckCircle className="h-8 w-8" />
                    <p>Your password has been updated successfully!</p>
                    <p className="text-sm">Redirecting to login page...</p>
                  </div>
                  
                  <Button 
                    onClick={() => navigate("/login")} 
                    className="mt-4 bg-gradient-to-r from-humanly-teal to-humanly-teal-light hover:from-humanly-teal-dark hover:to-humanly-teal"
                  >
                    Go to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start gap-2 text-sm">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-humanly-teal to-humanly-teal-light hover:from-humanly-teal-dark hover:to-humanly-teal" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default UpdatePasswordPage;
