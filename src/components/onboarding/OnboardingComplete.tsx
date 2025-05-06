import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { ARCHETYPES } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EQArchetype, CoachingMode } from "@/types";
import { useProfileActions } from "@/hooks/useProfileActions";
import { supabase } from "@/integrations/supabase/client";

export function OnboardingComplete() {
  const { user, setUser } = useAuth();
  const { completeStep, goToStep, state } = useOnboarding();
  const navigate = useNavigate();
  const { forceUpdateProfile } = useProfileActions(setUser);
  
  const archetype = user?.eq_archetype ? ARCHETYPES[user.eq_archetype] : null;
  
  useEffect(() => {
    const markComplete = async () => {
      if (!user?.id) {
        console.error("No user ID available for completing onboarding");
        return;
      }

      try {
        console.log("Completing onboarding for user:", user.id);
        
        // Check if user is still authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.error("No active session:", sessionError);
          toast.error("Authentication expired", { description: "Please log in again to complete onboarding" });
          navigate("/login", { replace: true });
          return;
        }
        
        // Directly update or create the profile using our enhanced function
        const success = await forceUpdateProfile({
          onboarded: true,
          eq_archetype: state.archetype || 'Not set',
          coaching_mode: state.coachingMode || 'normal',
          // Use firstName and lastName instead of name
          name: state.firstName ? `${state.firstName} ${state.lastName || ''}`.trim() : 'Anonymous'
        });
        
        if (success) {
          toast.success("Onboarding completed!");
          console.log("Successfully completed onboarding, navigating to dashboard");
          navigate("/dashboard", { replace: true });
        } else {
          toast.error("Error completing onboarding. Please try logging in again.");
        }
      } catch (error) {
        console.error("Error in markComplete:", error);
        toast.error("Error completing onboarding. Please try again.");
      }
    };

    // Only run this effect if we're on the complete step
    if (state.currentStep === "complete") {
      markComplete();
    }
  }, [user?.id, navigate, state.currentStep, setUser, state.archetype, state.coachingMode, state.firstName, state.lastName, forceUpdateProfile]);
  
  const handleComplete = async () => {
    try {
      // Complete the step and let OnboardingContext handle the navigation
      await completeStep("complete");
      // Force navigation as a fallback in case context navigation fails
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Error completing onboarding. Please try again.");
    }
  };
  
  const handleBack = () => {
    goToStep("coaching");
  };
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-scale-fade-in">
      {/* Background blobs */}
      <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-mint blob-animation -z-10 opacity-40 blob"></div>
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-blue blob-animation-delayed -z-10 opacity-40 blob"></div>
      
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-humanly-teal/20 to-humanly-green/20 rounded-full flex items-center justify-center shadow-sm animate-pulse-soft">
            <div className="text-5xl animate-float">{archetype?.icon}</div>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold">Your EQ Archetype: <span className="text-humanly-teal">{archetype?.title || 'Not Set'}</span></h1>
        <p className="text-muted-foreground text-lg">
          {archetype?.description || 'Complete onboarding to discover your EQ strengths and growth opportunities.'}
        </p>
      </div>
      
      <div className="space-y-6 bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Growth Areas</h2>
            <div className="text-xs text-muted-foreground bg-humanly-pastel-peach/50 px-2 py-1 rounded-full">
              Focus Here
            </div>
          </div>
          <ul className="space-y-2">
            {archetype?.growthAreas?.map((area, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-humanly-teal"></div>
                <span>{area}</span>
              </li>
            )) || (
              <li className="text-muted-foreground">Complete your profile to see growth areas</li>
            )}
          </ul>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="text-xs text-muted-foreground flex justify-between mb-1">
              <span>Current Progress</span>
              <span>25%</span>
            </div>
            <Progress value={25} className="h-1.5 bg-gray-100" />
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h2 className="font-semibold text-lg mb-2">Your Strengths</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {archetype?.strengths?.map((strength, index) => (
              <span key={index} 
                className="px-3 py-1.5 bg-humanly-pastel-lavender text-humanly-teal rounded-full text-sm"
              >
                {strength}
              </span>
            )) || (
              <span className="text-muted-foreground">Complete your profile to see your strengths</span>
            )}
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h2 className="font-semibold text-lg mb-2">Your Micro-Practice</h2>
          <div className={cn(
            "bg-gradient-to-br from-humanly-pastel-mint to-humanly-pastel-blue/50 rounded-xl p-5 border border-humanly-pastel-blue/30"
          )}>
            <p className="text-gray-700">
              {archetype?.microPractice || "Spend 2 minutes each morning checking in with your emotions before starting your day."}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-10">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="border-gray-200 hover:bg-gray-50 transition-all duration-300"
        >
          Back
        </Button>
        
        <div className="relative group">
          <Button 
            onClick={handleComplete}
            className="py-6 px-8 text-base rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
          >
            Start Coaching with Kai
          </Button>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
}
