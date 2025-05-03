
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatErrorBannerProps {
  error: string | null;
  isQuotaError?: boolean;
  isInvalidKeyError?: boolean;
  onRetry?: () => void;
}

export function ChatErrorBanner({
  error,
  isQuotaError,
  isInvalidKeyError,
  onRetry
}: ChatErrorBannerProps) {
  if (!error) return null;
  
  return (
    <div className={`mb-2 p-3 rounded-md ${
      isQuotaError 
        ? 'bg-amber-50 border border-amber-200 text-amber-800' 
        : isInvalidKeyError 
          ? 'bg-orange-50 border border-orange-200 text-orange-800'
          : 'bg-red-50 border border-red-200 text-red-800'
      } text-sm flex items-start animate-fade-in`}
    >
      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">
          {isQuotaError 
            ? "API usage limit reached" 
            : isInvalidKeyError
              ? "Invalid API key"
              : "Failed to send message"}
        </p>
        <p className="text-xs mt-1">
          {isQuotaError 
            ? "Your OpenAI account has reached its usage limit or has billing issues." 
            : isInvalidKeyError
              ? "The API key provided was rejected by OpenAI. Please check your key."
              : "Please try again or contact support if the issue persists."}
        </p>
        <div className="mt-2 flex gap-2">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs" 
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={() => window.open("https://humanlyai.me/support", "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
