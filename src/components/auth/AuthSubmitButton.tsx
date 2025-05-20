
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

interface AuthSubmitButtonProps {
  isSubmitting: boolean;
  text: string;
  loadingText: string;
  disabled?: boolean; 
  "data-testid"?: string;
}

export function AuthSubmitButton({ 
  isSubmitting, 
  text, 
  loadingText, 
  disabled,
  "data-testid": testId
}: AuthSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isSubmitting || disabled}
      data-testid={testId}
    >
      {isSubmitting ? (
        <div className="flex items-center gap-2">
          <Loading size="small" className="border-white border-t-transparent" />
          <span>{loadingText}</span>
        </div>
      ) : (
        text
      )}
    </Button>
  );
}
