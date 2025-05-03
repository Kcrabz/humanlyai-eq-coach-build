
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function GoalSelector() {
  const [goal, setGoal] = useState("");
  const [isSetting, setIsSetting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const { state, setGoal: updateGoal, completeStep } = useOnboarding();
  const { setOnboarded } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!goal.trim()) {
      return;
    }

    setIsSetting(true);
    try {
      updateGoal(goal);
      await completeStep("goal");
    } finally {
      setIsSetting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      // Mark user as onboarded in both database and local state
      await setOnboarded(true);
      toast.success("Welcome to Humanly Chat");
      // Navigate to chat page
      navigate("/chat", { replace: true });
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      toast.error("Failed to skip onboarding. Please try again.");
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        What's your main goal with emotional intelligence coaching?
      </h1>
      
      <div className="space-y-6">
        <Input
          placeholder="e.g., Improve my relationships, manage stress better..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full"
          autoFocus
        />
        
        <Button 
          onClick={handleNext}
          disabled={!goal.trim() || isSetting}
          className="w-full"
        >
          {isSetting ? "Setting goal..." : "Continue"}
        </Button>
        
        <div className="text-center mt-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  className="bg-gray-300 text-gray-700 hover:bg-gray-400 border-none"
                  onClick={handleSkip}
                  disabled={isSkipping}
                >
                  {isSkipping ? "Redirecting..." : "Skip straight to chatting"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>You can complete your EQ assessment later in settings.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground mt-2">
            You can complete your EQ assessment later in settings.
          </p>
        </div>
      </div>
    </div>
  );
}
