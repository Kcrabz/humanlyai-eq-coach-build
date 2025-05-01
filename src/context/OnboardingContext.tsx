
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EQArchetype, CoachingMode } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type OnboardingStep = "goal" | "archetype" | "complete";

interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  goal: string | null;
  archetype: EQArchetype | null;
  isLoading: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  goToStep: (step: OnboardingStep) => void;
  completeStep: (step: OnboardingStep, data?: any) => Promise<void>;
  setGoal: (goal: string) => void;
  setArchetype: (archetype: EQArchetype) => void;
  resetOnboarding: () => void;
  isStepComplete: (step: OnboardingStep) => boolean;
}

const initialState: OnboardingState = {
  currentStep: "goal",
  completedSteps: [],
  goal: null,
  archetype: null,
  isLoading: true,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(initialState);
  const { user, setArchetype: updateUserArchetype, setOnboarded } = useAuth();
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
        navigate("/chat", { replace: true });
        return;
      }

      try {
        // Try to load any saved progress
        const newState = { ...initialState };
        
        if (user.eq_archetype) {
          newState.archetype = user.eq_archetype;
          newState.completedSteps = ["goal", "archetype"];
          newState.currentStep = "complete";
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
    console.log(`Completing step: ${step}`);
    
    // Save the step data based on which step it is
    if (step === "archetype" && state.archetype) {
      try {
        await updateUserArchetype(state.archetype);
        toast.success("Archetype saved successfully");
      } catch (error) {
        toast.error("Failed to save your archetype selection");
        console.error("Error saving archetype:", error);
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
        
        // Navigation is now handled here to ensure it happens after database updates
        toast.success("Onboarding completed!");
        console.log("Navigating to chat from completeStep in OnboardingContext");
        navigate("/chat", { replace: true });
        return; // Exit early as we've navigated away
      } catch (error) {
        console.error("Failed to complete onboarding:", error);
        toast.error("Failed to complete onboarding. Please try again.");
        return;
      }
    }

    // Update completed steps and move to next step
    setState((prev) => {
      const completedSteps = prev.completedSteps.includes(step) 
        ? prev.completedSteps 
        : [...prev.completedSteps, step];

      // Determine the next step
      let nextStep: OnboardingStep = prev.currentStep;
      if (step === "goal") nextStep = "archetype";
      else if (step === "archetype") nextStep = "complete";

      console.log(`Moving to next step: ${nextStep}`);
      
      return {
        ...prev,
        completedSteps,
        currentStep: nextStep,
      };
    });
  };

  const setGoal = (goal: string) => {
    setState((prev) => ({ ...prev, goal }));
  };

  const setArchetype = (archetype: EQArchetype) => {
    setState((prev) => ({ ...prev, archetype }));
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
        setGoal,
        setArchetype,
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
