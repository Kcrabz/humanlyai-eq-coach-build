
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { ARCHETYPES } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function OnboardingComplete() {
  const { user, setUser } = useAuth();
  const { completeStep, goToStep, state } = useOnboarding();
  const navigate = useNavigate();
  
  const archetype = user?.eq_archetype ? ARCHETYPES[user.eq_archetype] : null;
  
  useEffect(() => {
    const markComplete = async () => {
      if (user?.id) {
        try {
          // Update the profile in Supabase
          const { error } = await supabase
            .from("profiles")
            .update({ onboarded: true })
            .eq("id", user.id);

          if (!error) {
            // Update local user state
            setUser(prevUser => prevUser ? { ...prevUser, onboarded: true } : null);
            
            // Navigate to chat
            console.log("Navigating to chat from OnboardingComplete useEffect");
            navigate("/chat", { replace: true });
          } else {
            console.error("Failed to complete onboarding:", error.message);
          }
        } catch (error) {
          console.error("Error in markComplete:", error);
        }
      }
    };

    // Only run this effect if we're on the complete step
    if (state.currentStep === "complete") {
      markComplete();
    }
  }, [user, navigate, state.currentStep, setUser]);
  
  const handleComplete = async () => {
    try {
      // Complete the step and let OnboardingContext handle the navigation
      await completeStep("complete");
      // Force navigation as a fallback in case context navigation fails
      navigate("/chat", { replace: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };
  
  const handleBack = () => {
    goToStep("coaching");
  };
  
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-humanly-purple/10 rounded-full flex items-center justify-center">
            <div className="text-4xl text-humanly-purple">{archetype?.icon}</div>
          </div>
        </div>
        <h1 className="text-3xl font-bold">Your EQ Archetype: {archetype?.title}</h1>
        <p className="text-muted-foreground">
          {archetype?.description}
        </p>
      </div>
      
      <div className="space-y-6 bg-humanly-gray-lightest p-6 rounded-lg">
        <div>
          <h2 className="font-semibold text-lg mb-2">Your Growth Areas</h2>
          <ul className="list-disc pl-5 space-y-1">
            {archetype?.growthAreas.map((area, index) => (
              <li key={index} className="text-muted-foreground">{area}</li>
            ))}
          </ul>
        </div>
        
        <div className="border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">Your Strengths</h2>
          <ul className="list-disc pl-5 space-y-1">
            {archetype?.strengths.map((strength, index) => (
              <li key={index} className="text-muted-foreground">{strength}</li>
            ))}
          </ul>
        </div>
        
        <div className="border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">Your Micro-Practice</h2>
          <div className="bg-white rounded-md p-3 border">
            <p className="text-sm">
              {archetype?.microPractice || "Spend 2 minutes each morning checking in with your emotions before starting your day."}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleComplete}>
          Start Coaching with Kai
        </Button>
      </div>
    </div>
  );
}
