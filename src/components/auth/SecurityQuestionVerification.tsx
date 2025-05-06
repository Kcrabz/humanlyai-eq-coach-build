
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { getUserSecurityQuestion, verifySecurityQuestionAnswer, SecurityQuestion } from "@/services/securityQuestionService";

interface SecurityQuestionVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
}

export function SecurityQuestionVerification({ 
  email, 
  onVerified, 
  onCancel 
}: SecurityQuestionVerificationProps) {
  const [securityQuestion, setSecurityQuestion] = useState<SecurityQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSecurityQuestion = async () => {
      setIsLoading(true);
      const question = await getUserSecurityQuestion(email);
      setSecurityQuestion(question);
      setIsLoading(false);
      
      if (!question) {
        setError("No security question found for this email address.");
      }
    };
    
    fetchSecurityQuestion();
  }, [email]);
  
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError("Please provide an answer");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // This will need to be properly implemented with a server verification
      // For now it's a placeholder for the real verification
      const isVerified = true; // await verifySecurityQuestionAnswer(userId, answer);
      
      if (isVerified) {
        onVerified();
      } else {
        setError("Incorrect answer. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while verifying your answer. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-humanly-teal mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading security question...</p>
      </div>
    );
  }
  
  if (!securityQuestion) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium">Security question not found</h3>
              <p className="mt-1 text-sm">
                We couldn't find a security question for this email address. 
                Please try resetting your password with the email link instead.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium">Security Verification</h2>
        <p className="text-gray-600 mt-1">
          Please answer your security question to verify your identity.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Your Security Question</Label>
          <p className="p-3 bg-gray-50 rounded-md border border-gray-200">
            {securityQuestion.question}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="security-answer">Your Answer</Label>
          <Input
            id="security-answer"
            type="text"
            value={answer}
            onChange={handleAnswerChange}
            placeholder="Your answer"
            disabled={isVerifying}
            autoComplete="off"
          />
          {error && (
            <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isVerifying}>
            Cancel
          </Button>
          <Button type="submit" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </form>
    </div>
  );
}
