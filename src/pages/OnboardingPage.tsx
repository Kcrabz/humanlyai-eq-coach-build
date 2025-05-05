
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ArchetypeSelectorWithQuiz } from "@/components/onboarding/ArchetypeSelectorWithQuiz";
import { GoalSelector } from "@/components/onboarding/GoalSelector";
import { NameInput } from "@/components/onboarding/NameInput";
import { CoachingModeSelector } from "@/components/onboarding/CoachingModeSelector";
import { OnboardingComplete } from "@/components/onboarding/OnboardingComplete";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const OnboardingContent = () => {
  const { state } = useOnboarding();
  const { currentStep, isLoading } = state;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Onboarding auth check:", {
      isAuthenticated,
      userOnboarded: user?.onboarded,
      isLoading,
      currentStep
    });
    
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
  }, [user, navigate, isLoading, currentStep, isAuthenticated]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-humanly-teal"></div>
      </div>
    );
  }
  
  // If not authenticated, show a message and redirect after a delay
  if (!isAuthenticated) {
    useEffect(() => {
      toast.error("You need to be logged in to access this page");
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }, [navigate]);
    
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to access the onboarding process.</p>
        <Button onClick={() => navigate("/login", { replace: true })}>
          Go to Login
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-4 py-12 relative">
      <OnboardingProgress />
      
      {currentStep === "name" && (
        <NameInput />
      )}
      
      {currentStep === "goal" && (
        <GoalSelector />
      )}
      
      {currentStep === "archetype" && (
        <ArchetypeSelectorWithQuiz />
      )}
      
      {currentStep === "coaching" && (
        <CoachingModeSelector />
      )}
      
      {currentStep === "complete" && (
        <OnboardingComplete />
      )}
      
      {/* Report issue button */}
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
    </div>
  );
};

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect already onboarded users to chat
  useEffect(() => {
    if (!isLoading) {
      console.log("OnboardingPage auth check:", {
        isAuthenticated,
        userOnboarded: user?.onboarded,
        isLoading
      });

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log("User is not authenticated, redirecting to login");
        navigate("/login", { replace: true });
      }
      // If already onboarded, redirect to chat
      else if (user?.onboarded === true) {
        console.log("User is already onboarded, redirecting to chat");
        navigate("/chat", { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-humanly-teal"></div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="bg-gradient-to-b from-white to-humanly-gray-lightest min-h-screen">
        <OnboardingProvider>
          <OnboardingContent />
        </OnboardingProvider>
      </div>
    </PageLayout>
  );
};

export default OnboardingPage;
