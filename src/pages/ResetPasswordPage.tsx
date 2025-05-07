
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      // Call resetPassword and await the boolean result
      const success = await resetPassword(email);
      
      // Check if success is true (using simple boolean check)
      if (success) {
        setSubmitted(true);
        toast.success("Password reset instructions sent", {
          description: "Please check your email inbox"
        });
      } else {
        throw new Error("Failed to send reset instructions");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      const message = error instanceof Error ? error.message : "Failed to send reset instructions";
      setErrorMessage(message);
      toast.error("Failed to send reset instructions", {
        description: "Please try again or contact support"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToLogin = () => {
    navigate("/login");
  };

  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10 w-full max-w-md">
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-blue/40 rounded-3xl blur-xl"></div>
          
          <Card className="border-none shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                {!submitted 
                  ? "Enter your email and we'll send you instructions to reset your password" 
                  : "Check your email for reset instructions"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start gap-2 text-sm">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-humanly-teal to-humanly-teal-light hover:from-humanly-teal-dark hover:to-humanly-teal" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Instructions"}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button 
                      variant="link" 
                      onClick={handleReturnToLogin}
                      className="text-humanly-teal hover:text-humanly-teal-dark text-sm p-0"
                    >
                      Return to login
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 text-green-700 p-4 rounded-md">
                    Password reset instructions have been sent. Please check your email.
                  </div>
                  
                  <Button 
                    onClick={() => setSubmitted(false)} 
                    variant="outline" 
                    className="mt-4"
                  >
                    Send Again
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button 
                      variant="link" 
                      onClick={handleReturnToLogin}
                      className="text-humanly-teal hover:text-humanly-teal-dark text-sm p-0"
                    >
                      Return to login
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResetPasswordPage;
