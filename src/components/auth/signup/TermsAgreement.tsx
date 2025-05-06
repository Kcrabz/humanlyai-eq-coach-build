
import { AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAgreementProps {
  agreeToTerms: boolean;
  handleAgreeChange: (checked: boolean) => void;
  validationError?: string;
  isSubmitting: boolean;
  isRateLimited: boolean;
}

export function TermsAgreement({
  agreeToTerms,
  handleAgreeChange,
  validationError,
  isSubmitting,
  isRateLimited
}: TermsAgreementProps) {
  return (
    <div className="items-top flex space-x-2 mb-4">
      <Checkbox 
        id="terms" 
        checked={agreeToTerms} 
        onCheckedChange={handleAgreeChange}
        disabled={isSubmitting || isRateLimited}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the terms and policies
        </label>
        {validationError && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4" />
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
}
