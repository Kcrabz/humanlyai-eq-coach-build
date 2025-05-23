
import React, { createContext, useContext } from "react";
import { OnboardingStep } from "@/types/onboarding";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { useOnboardingActions } from "@/hooks/useOnboardingActions";
import { EQArchetype, CoachingMode } from "@/types";

interface OnboardingContextType {
  state: ReturnType<typeof useOnboardingState>["state"];
  goToStep: (step: OnboardingStep) => void;
  completeStep: (step: OnboardingStep, data?: any) => Promise<void>;
  setGoal: (goal: string) => void;
  setName: (firstName: string, lastName: string) => void;
  setArchetype: (archetype: EQArchetype) => void;
  setCoachingMode: (mode: CoachingMode) => void;
  resetOnboarding: () => void;
  isStepComplete: (step: OnboardingStep) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    state,
    setGoal,
    setName,
    setArchetype,
    setCoachingMode,
    goToStep,
    isStepComplete,
    resetOnboarding,
  } = useOnboardingState();
  
  const { completeStep } = useOnboardingActions(state, goToStep);

  return (
    <OnboardingContext.Provider
      value={{
        state,
        goToStep,
        completeStep,
        setGoal,
        setName,
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

// Fix the re-export with the 'export type' syntax
export type { OnboardingStep };
