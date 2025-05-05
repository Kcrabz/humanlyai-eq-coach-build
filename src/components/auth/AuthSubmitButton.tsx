
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

interface AuthSubmitButtonProps {
  isSubmitting: boolean;
  text: string;
  loadingText: string;
}

export function AuthSubmitButton({ isSubmitting, text, loadingText }: AuthSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isSubmitting}
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
