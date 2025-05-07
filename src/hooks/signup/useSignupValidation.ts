
import { useState, useEffect } from "react";
import { isValidEmail, validatePassword } from "@/utils/validationUtils";

export interface ValidationErrors {
  email?: string;
  password?: string;
  terms?: string;
  securityQuestion?: string;
}

export interface PasswordStrength {
  isValid: boolean;
  feedback: string;
  strength: 'weak' | 'medium' | 'strong';
}

export function useSignupValidation(
  email: string, 
  password: string, 
  securityQuestionId: string, 
  securityAnswer: string,
  agreeToTerms: boolean
) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ 
    isValid: false, 
    feedback: "", 
    strength: 'weak' 
  });
  
  // Check password strength whenever password changes
  useEffect(() => {
    if (password.length > 0) {
      const result = validatePassword(password);
      setPasswordStrength(result);
    } else {
      setPasswordStrength({ isValid: false, feedback: "", strength: 'weak' });
    }
  }, [password]);
  
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    
    // Validate email
    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }
    
    // Validate security question
    if (!securityQuestionId) {
      errors.securityQuestion = "Please select a security question";
      isValid = false;
    }
    
    if (!securityAnswer.trim()) {
      errors.securityQuestion = "Please provide an answer to your security question";
      isValid = false;
    }
    
    // Validate terms agreement
    if (!agreeToTerms) {
      errors.terms = "You must agree to the terms and policies";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const clearValidationError = (field: keyof ValidationErrors) => {
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return {
    validationErrors,
    passwordStrength,
    validateForm,
    clearValidationError,
    setValidationErrors
  };
}
