
import { useState, useEffect } from "react";
import { OnboardingState, OnboardingStep } from "@/types/onboarding";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const initialState: OnboardingState = {
  currentStep: "welcome",
  completedSteps: [],
  goal: null,
  firstName: null,
  lastName: null,
  archetype: null,
  coachingMode: null,
  isLoading: true,
};

export const useOnboardingState = () => {
  const [state, setState] = useState<OnboardingState>(initialState);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load saved progress from database on initial load
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!user) {
        setState({ ...initialState, isLoading: false });
        return;
      }

      // Make sure we have a boolean value for onboarded before making decisions
      if (typeof user.onboarded === "boolean" && user.onboarded) {
        console.log("User is already onboarded, navigate to chat from OnboardingContext");
        navigate("/chat", { replace: true });
        return;
      }

      try {
        // Try to load any saved progress
        const newState = { ...initialState };
        
        if (user.first_name || user.last_name) {
          newState.firstName = user.first_name || '';
          newState.lastName = user.last_name || '';
          newState.completedSteps = ["welcome", "name"];
          newState.currentStep = "goal";
        }
        
        if (user.eq_archetype) {
          newState.archetype = user.eq_archetype;
          newState.completedSteps = ["welcome", "name", "goal", "archetype"];
          newState.currentStep = "coaching";
        }

        if (user.coaching_mode) {
          newState.coachingMode = user.coaching_mode;
          if (newState.completedSteps.includes("archetype")) {
            newState.completedSteps = ["welcome", "name", "goal", "archetype", "coaching"];
            newState.currentStep = "complete";
          }
        }

        console.log("Loaded onboarding progress:", newState);
        setState({ ...newState, isLoading: false });
      } catch (error) {
        console.error("Failed to load onboarding progress:", error);
        setState({ ...initialState, isLoading: false });
      }
    };

    loadSavedProgress();
  }, [user, navigate]);

  const setGoal = (goal: string) => {
    setState((prev) => ({ ...prev, goal }));
  };

  const setName = (firstName: string, lastName: string) => {
    setState((prev) => ({ ...prev, firstName, lastName }));
  };

  const setArchetype = (archetype: string) => {
    setState((prev) => ({ ...prev, archetype }));
  };

  const setCoachingMode = (mode: string) => {
    setState((prev) => ({ ...prev, coachingMode: mode }));
  };

  const goToStep = (step: OnboardingStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const isStepComplete = (step: OnboardingStep) => {
    return state.completedSteps.includes(step);
  };

  const resetOnboarding = () => {
    setState({ ...initialState, isLoading: false });
  };

  return {
    state,
    setGoal,
    setName,
    setArchetype,
    setCoachingMode,
    goToStep,
    isStepComplete,
    resetOnboarding,
  };
};
