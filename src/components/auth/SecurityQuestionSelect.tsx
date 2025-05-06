
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSecurityQuestions, SecurityQuestion } from "@/services/securityQuestionService";
import { AlertCircle } from "lucide-react";

interface SecurityQuestionSelectProps {
  onQuestionChange: (questionId: string) => void;
  onAnswerChange: (answer: string) => void;
  error?: string;
}

export function SecurityQuestionSelect({ 
  onQuestionChange, 
  onAnswerChange,
  error
}: SecurityQuestionSelectProps) {
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      const securityQuestions = await fetchSecurityQuestions();
      setQuestions(securityQuestions);
      setIsLoading(false);
    };
    
    loadQuestions();
  }, []);
  
  const handleQuestionChange = (value: string) => {
    onQuestionChange(value);
  };
  
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
    onAnswerChange(e.target.value);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="security-question">Security Question</Label>
        <Select
          disabled={isLoading}
          onValueChange={handleQuestionChange}
        >
          <SelectTrigger id="security-question" className={error ? "border-red-500" : ""}>
            <SelectValue placeholder="Select a security question" />
          </SelectTrigger>
          <SelectContent>
            {questions.map(question => (
              <SelectItem key={question.id} value={question.id}>
                {question.question}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="security-answer">Your Answer</Label>
        <Input
          id="security-answer"
          type="text"
          value={answer}
          onChange={handleAnswerChange}
          placeholder="Your answer"
          className={error ? "border-red-500" : ""}
        />
        <p className="text-muted-foreground text-xs">
          You'll need this answer if you ever need to reset your password.
        </p>
      </div>
    </div>
  );
}
