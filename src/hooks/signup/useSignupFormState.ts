
import { useState } from "react";

export function useSignupFormState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestionId, setSecurityQuestionId] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrorMessage(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorMessage(null);
  };
  
  const handleAgreeChange = (checked: boolean) => {
    setAgreeToTerms(checked);
  };
  
  const handleSecurityQuestionChange = (questionId: string) => {
    setSecurityQuestionId(questionId);
  };
  
  const handleSecurityAnswerChange = (answer: string) => {
    setSecurityAnswer(answer);
  };
  
  return {
    email,
    password,
    securityQuestionId,
    securityAnswer,
    agreeToTerms,
    isSubmitting,
    errorMessage,
    setEmail,
    setPassword,
    setSecurityQuestionId,
    setSecurityAnswer,
    setAgreeToTerms,
    setIsSubmitting,
    setErrorMessage,
    handleEmailChange,
    handlePasswordChange,
    handleAgreeChange,
    handleSecurityQuestionChange,
    handleSecurityAnswerChange
  };
}
