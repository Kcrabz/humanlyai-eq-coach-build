import { useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { OnboardingProgress } from "./OnboardingProgress";
import { NameInput } from "./NameInput";
import { GoalSelector } from "./GoalSelector";
import { ArchetypeSelectorWithQuiz } from "./ArchetypeSelectorWithQuiz";
import { CoachingModeSelector } from "./CoachingModeSelector";
import { OnboardingComplete } from "./OnboardingComplete";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isRetakingAssessment } from "@/services/authNavigationService";
import { OnboardingLoader } from "./OnboardingLoader";
import { AuthenticationRequired } from "./AuthenticationRequired";

export const OnboardingContainer = () => {
  const { state, goToStep } = useOnboarding();
  const { currentStep, isLoading } = state;
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Check if user is specifically retaking the assessment
  const isRetaking = isRetakingAssessment(location.search);

  // Effect to handle step parameter in URL
  useEffect(() => {
    const targetStep = searchParams.get('step');
    if (targetStep && ['name', 'goal', 'archetype', 'coaching', 'complete'].includes(targetStep)) {
      console.log(`Directing user to the ${targetStep} step from URL parameter`);
      goToStep(targetStep as any);
    }
  }, [searchParams, goToStep]);
  
  if (isLoading) {
    return <OnboardingLoader />;
  }
  
  if (!isAuthenticated) {
    return <AuthenticationRequired />;
  }
  
  return (
    <div className="max-w-5xl mx-auto p-4 py-12 relative">
      <OnboardingProgress />
      
      {currentStep === "name" && <NameInput />}
      {currentStep === "goal" && <GoalSelector />}
      {currentStep === "archetype" && <ArchetypeSelectorWithQuiz />}
      {currentStep === "coaching" && <CoachingModeSelector />}
      {currentStep === "complete" && <OnboardingComplete />}
      
      <ReportIssueButton />
    </div>
  );
};

const ReportIssueButton = () => {
  return (
    <div className="mt-12 text-center">
      <Button 
        variant="ghost" 
        size="sm"
        className="text-xs text-muted-foreground flex items-center hover:bg-gray-50 transition-colors"
        onClick={() => {
          toast.success("Issue reported", {
            description: "Thank you for your feedback. We'll fix this issue."
          });
        }}
      >
        <CircleX className="h-3 w-3 mr-1" />
        Report an issue
      </Button>
    </div>
  );
};
