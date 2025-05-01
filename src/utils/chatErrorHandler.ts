
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface ErrorHandlerOptions {
  navigate: ReturnType<typeof useNavigate>;
  setError: (error: string | null) => void;
}

export const handleApiErrors = (error: any, options: ErrorHandlerOptions) => {
  const { navigate, setError } = options;
  
  // Check for usage limit errors
  if (error.message?.includes("You've reached your monthly message limit")) {
    return handleUsageLimitError(error, options);
  }
  
  // Check for empty response errors
  if (error.message?.includes("No response received")) {
    setError("No response received from AI assistant");
    toast.error("No response received", {
      description: "Please try again or contact support if the issue persists.",
    });
    return;
  }
  
  // Check for quota exceeded errors
  if (error.message?.includes("OpenAI API quota exceeded") || 
      error.message?.includes("quota")) {
    setError(error.details || "OpenAI API quota exceeded");
    toast.error("API service has reached its usage limits", {
      description: "Please check your OpenAI account billing status or contact support.",
    });
    return;
  }
  
  // Check for invalid key errors
  if (error.message?.includes("Invalid API key")) {
    setError(error.details || "Invalid API key");
    toast.error("Invalid API Key", {
      description: "The API key provided was rejected by OpenAI. Please check your key."
    });
    return;
  }
  
  // Generic error fallback
  setError("An error occurred while sending your message. Our team has been notified.");
  toast.error("Failed to send message", {
    description: "Please try again or report this issue to our support team.",
  });
};

export const handleUsageLimitError = (error: any, options: ErrorHandlerOptions) => {
  const { navigate, setError } = options;
  
  const errorMessage = "You've reached your monthly message limit";
  setError(errorMessage);
  toast.error(errorMessage, {
    description: "Please upgrade your subscription to continue using the AI coach.",
    action: {
      label: "Upgrade",
      onClick: () => navigate("/pricing")
    }
  });
};
