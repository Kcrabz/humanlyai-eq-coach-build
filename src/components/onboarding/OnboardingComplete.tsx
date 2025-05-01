
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { ARCHETYPES, COACHING_MODES } from "@/lib/constants";

export function OnboardingComplete() {
  const { user, setOnboarded } = useAuth();
  const { goToStep, completeStep } = useOnboarding();
  const navigate = useNavigate();
  
  const archetype = user?.eq_archetype ? ARCHETYPES[user.eq_archetype] : null;
  const coachingMode = user?.coaching_mode ? COACHING_MODES[user.coaching_mode] : null;
  
  const handleComplete = async () => {
    await completeStep("complete");
    setOnboarded(true);
    navigate("/chat");
  };
  
  const handleBack = () => {
    goToStep("coaching");
  };
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-humanly-purple/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-humanly-purple">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold">You're Ready to Start!</h1>
        <p className="text-muted-foreground">
          Your personalized EQ coaching experience is set up
        </p>
      </div>
      
      <div className="space-y-6 bg-humanly-gray-lightest p-6 rounded-lg">
        <div>
          <h2 className="font-semibold text-lg mb-2">Your EQ Profile</h2>
          <div className="flex items-center space-x-2 mb-3">
            <div className="text-2xl">{archetype?.icon}</div>
            <span className="font-medium">{archetype?.title}</span>
          </div>
          <p className="text-sm text-muted-foreground">{archetype?.description}</p>
        </div>
        
        <div className="border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">Your Coaching Style</h2>
          <p className="font-medium mb-2">{coachingMode?.title}</p>
          <p className="text-sm text-muted-foreground">{coachingMode?.description}</p>
        </div>
        
        <div className="border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">Your Subscription</h2>
          <div className="bg-white rounded-md p-3 border">
            <div className="flex justify-between">
              <span className="font-medium">Free Trial</span>
              <span className="text-sm text-humanly-purple font-semibold">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expires in 24 hours
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleComplete}>
          Start Coaching
        </Button>
      </div>
    </div>
  );
}
