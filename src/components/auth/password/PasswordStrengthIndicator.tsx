
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  passwordStrength: {
    isValid: boolean;
    feedback: string;
    strength: 'weak' | 'medium' | 'strong';
  };
}

export function PasswordStrengthIndicator({ 
  password, 
  passwordStrength 
}: PasswordStrengthIndicatorProps) {
  const getPasswordStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };
  
  if (password.length === 0) return null;
  
  return (
    <div className="space-y-1 mt-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} 
          style={{ 
            width: passwordStrength.strength === 'weak' ? '33%' : 
                  passwordStrength.strength === 'medium' ? '66%' : '100%' 
          }}
        />
      </div>
      <p className={`text-sm ${
        passwordStrength.strength === 'weak' ? 'text-red-500' : 
        passwordStrength.strength === 'medium' ? 'text-yellow-600' : 'text-green-600'
      }`}>
        {passwordStrength.feedback}
      </p>
      
      <ul className="space-y-1 mt-2 text-sm">
        <li className="flex items-center gap-1">
          {password.length >= 8 ? 
            <Check className="h-4 w-4 text-green-500" /> : 
            <X className="h-4 w-4 text-red-500" />} 
          At least 8 characters
        </li>
        <li className="flex items-center gap-1">
          {/[a-zA-Z]/.test(password) && /\d/.test(password) ? 
            <Check className="h-4 w-4 text-green-500" /> : 
            <X className="h-4 w-4 text-red-500" />} 
          Contains letters and numbers
        </li>
        <li className="flex items-center gap-1">
          {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 
            <Check className="h-4 w-4 text-green-500" /> : 
            <X className="h-4 w-4 text-red-500" />} 
          Contains a special character
        </li>
      </ul>
    </div>
  );
}
