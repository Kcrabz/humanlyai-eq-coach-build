
import { useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
import { isRetakingAssessment } from "@/utils/navigationUtils";

export const OnboardingContainer = () => {
  const { state, goToStep } = useOnboarding();
  const { currentStep, isLoading } = state;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    console.log("Onboarding auth check:", {
      isAuthenticated,
      userOnboarded: user?.onboarded,
      isLoading,
      currentStep,
      isRetaking,
      search: location.search,
      state: location.state
    });
    
    // Allow users to retake the assessment even if they're already onboarded
    if (isRetaking) {
      console.log("User is retaking assessment, skipping onboarding check");
      return;
    }
    
    // If user's profile data hasn't loaded yet, or user is not onboarded and we're not on the complete step,
    // let them continue with onboarding
    if (
      typeof user?.onboarded !== "boolean" || 
      (!user?.onboarded && !isLoading && currentStep !== "complete")
    ) {
      console.log("Continuing onboarding process", { 
        userOnboarded: user?.onboarded, 
        isLoading, 
        currentStep 
      });
      return;
    }

    // If user is already fully onboarded (coming back somehow), redirect to chat
    if (user?.onboarded && !isLoading && currentStep !== "complete") {
      console.log("User is already onboarded, redirecting to chat from OnboardingContent");
      navigate("/chat", { replace: true });
    }
  }, [user, navigate, isLoading, currentStep, isAuthenticated, isRetaking, location]);
  
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
