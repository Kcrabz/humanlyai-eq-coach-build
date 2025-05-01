
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EQArchetype, CoachingMode } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type OnboardingStep = "archetype" | "coaching" | "complete";

interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  archetype: EQArchetype | null;
  coachingMode: CoachingMode | null;
  isLoading: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  goToStep: (step: OnboardingStep) => void;
  completeStep: (step: OnboardingStep, data?: any) => void;
  setArchetype: (archetype: EQArchetype) => void;
  setCoachingMode: (mode: CoachingMode) => void;
  resetOnboarding: () => void;
  isStepComplete: (step: OnboardingStep) => boolean;
}

const initialState: OnboardingState = {
  currentStep: "archetype",
  completedSteps: [],
  archetype: null,
  coachingMode: null,
  isLoading: true,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(initialState);
  const { user, setArchetype: updateUserArchetype, setCoachingMode: updateUserCoachingMode, setOnboarded } = useAuth();
  const navigate = useNavigate();

  // Load saved progress from database on initial load
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!user) {
        setState({ ...initialState, isLoading: false });
        return;
      }

      // If user is already onboarded, redirect to chat
      if (user.onboarded) {
        console.log("User is already onboarded, navigate to chat from OnboardingContext");
        navigate("/chat");
        return;
      }

      try {
        // Try to load any saved progress
        const newState = { ...initialState };
        
        if (user.eq_archetype) {
          newState.archetype = user.eq_archetype;
          newState.completedSteps = ["archetype"];
          newState.currentStep = "coaching";

          if (user.coaching_mode) {
            newState.coachingMode = user.coaching_mode;
            newState.completedSteps = ["archetype", "coaching"];
            newState.currentStep = "complete";
          }
        }

        setState({ ...newState, isLoading: false });
      } catch (error) {
        console.error("Failed to load onboarding progress:", error);
        setState({ ...initialState, isLoading: false });
      }
    };

    loadSavedProgress();
  }, [user, navigate]);

  const goToStep = (step: OnboardingStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const completeStep = async (step: OnboardingStep, data?: any) => {
    // Save the step data based on which step it is
    if (step === "archetype" && state.archetype) {
      try {
        await updateUserArchetype(state.archetype);
      } catch (error) {
        toast.error("Failed to save your archetype selection");
        return;
      }
    } else if (step === "coaching" && state.coachingMode) {
      try {
        await updateUserCoachingMode(state.coachingMode);
      } catch (error) {
        toast.error("Failed to save your coaching mode selection");
        return;
      }
    } else if (step === "complete") {
      try {
        // Mark user as onboarded in the database and update local state
        const { error } = await supabase
          .from('profiles')
          .update({ onboarded: true })
          .eq('id', user?.id);
          
        if (error) throw error;
        
        // Update the user's onboarded status in the auth context
        await setOnboarded(true);
        
        // Navigate to chat page
        toast.success("Onboarding completed!");
        console.log("Navigating to chat from completeStep");
        navigate("/chat", { replace: true });
        return; // Exit early as we've navigated away
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
        toast.error("Failed to complete onboarding. Please try again.");
        return;
      }
    }

    // Update completed steps
    setState((prev) => {
      const completedSteps = prev.completedSteps.includes(step) 
        ? prev.completedSteps 
        : [...prev.completedSteps, step];

      // Determine the next step
      let nextStep: OnboardingStep = prev.currentStep;
      if (step === "archetype") nextStep = "coaching";
      else if (step === "coaching") nextStep = "complete";

      return {
        ...prev,
        completedSteps,
        currentStep: nextStep,
      };
    });
  };

  const setArchetype = (archetype: EQArchetype) => {
    setState((prev) => ({ ...prev, archetype }));
  };

  const setCoachingMode = (coachingMode: CoachingMode) => {
    setState((prev) => ({ ...prev, coachingMode }));
  };

  const resetOnboarding = () => {
    setState({ ...initialState, isLoading: false });
  };

  const isStepComplete = (step: OnboardingStep) => {
    return state.completedSteps.includes(step);
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        goToStep,
        completeStep,
        setArchetype,
        setCoachingMode,
        resetOnboarding,
        isStepComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
