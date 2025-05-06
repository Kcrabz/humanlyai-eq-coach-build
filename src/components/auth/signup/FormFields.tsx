
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "../password/PasswordStrengthIndicator";

interface FormFieldsProps {
  email: string;
  password: string;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validationErrors: {
    email?: string;
    password?: string;
    terms?: string;
    securityQuestion?: string;
  };
  isSubmitting: boolean;
  isRateLimited: boolean;
  passwordStrength: {
    isValid: boolean;
    feedback: string;
    strength: 'weak' | 'medium' | 'strong';
  };
}

export function FormFields({
  email,
  password,
  handleEmailChange,
  handlePasswordChange,
  validationErrors,
  isSubmitting,
  isRateLimited,
  passwordStrength
}: FormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={handleEmailChange}
          disabled={isSubmitting || isRateLimited}
          required
          className={validationErrors.email ? "border-red-500" : ""}
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4" />
            {validationErrors.email}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          disabled={isSubmitting || isRateLimited}
          required
          className={validationErrors.password ? "border-red-500" : ""}
        />
        
        <PasswordStrengthIndicator 
          password={password} 
          passwordStrength={passwordStrength} 
        />
        
        {validationErrors.password && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4" />
            {validationErrors.password}
          </p>
        )}
      </div>
    </>
  );
}
