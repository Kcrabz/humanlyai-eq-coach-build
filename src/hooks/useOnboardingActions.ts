
import { useState } from "react";
import { OnboardingStep } from "@/types/onboarding";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EQArchetype, CoachingMode } from "@/types";

export const useOnboardingActions = (
  state: any, 
  goToStep: (step: OnboardingStep) => void
) => {
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const { user, setArchetype: updateUserArchetype, setCoachingMode: updateUserCoachingMode, setOnboarded, setUser } = useAuth();
  const navigate = useNavigate();

  const completeStep = async (step: OnboardingStep, data?: any) => {
    console.log(`Completing step: ${step}`);
    setProcessingStep(step);
    
    try {
      // Save the step data based on which step it is
      if (step === "archetype" && state.archetype) {
        try {
          await updateUserArchetype(state.archetype as EQArchetype);
          toast.success("Archetype saved successfully");
        } catch (error) {
          toast.error("Failed to save your archetype selection");
          console.error("Error saving archetype:", error);
          setProcessingStep(null);
          return;
        }
      } else if (step === "coaching" && state.coachingMode) {
        try {
          await updateUserCoachingMode(state.coachingMode as CoachingMode);
          toast.success("Coaching style saved successfully");
        } catch (error) {
          toast.error("Failed to save your coaching style");
          console.error("Error saving coaching mode:", error);
          setProcessingStep(null);
          return;
        }
      } else if (step === "complete") {
        try {
          // Mark user as onboarded in the database and update local state
          const { error } = await supabase
            .from('profiles')
            .update({ onboarded: true })
            .eq('id', user?.id);
            
          if (error) {
            console.error("Failed to update onboarding status:", error.message);
            throw error;
          }
          
          // Update the user's onboarded status in the auth context
          await setOnboarded(true);
          
          // Directly update the local user state as well for immediate UI feedback
          setUser(prev => prev ? { ...prev, onboarded: true } : null);
          
          // Navigation is now handled here to ensure it happens after database updates
          toast.success("Onboarding completed!");
          console.log("Navigating to chat from completeStep in OnboardingContext");
          navigate("/chat", { replace: true });
          setProcessingStep(null);
          return; // Exit early as we've navigated away
        } catch (error) {
          console.error("Failed to complete onboarding:", error);
          toast.error("Failed to complete onboarding. Please try again.");
          setProcessingStep(null);
          return;
        }
      }

      // Determine the next step
      let nextStep: OnboardingStep = step;
      if (step === "goal") nextStep = "archetype";
      else if (step === "archetype") nextStep = "coaching";
      else if (step === "coaching") nextStep = "complete";
      
      goToStep(nextStep);
      setProcessingStep(null);
    } catch (error) {
      console.error(`Error completing step ${step}:`, error);
      setProcessingStep(null);
    }
  };

  return {
    completeStep,
    processingStep
  };
};
