
import { useState, useEffect } from "react";
import { OnboardingState, OnboardingStep } from "@/types/onboarding";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const initialState: OnboardingState = {
  currentStep: "goal",
  completedSteps: [],
  goal: null,
  name: null,
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

      // If user is already onboarded, redirect to chat
      if (user.onboarded) {
        console.log("User is already onboarded, navigate to chat from OnboardingContext");
        navigate("/chat", { replace: true });
        return;
      }

      try {
        // Try to load any saved progress
        const newState = { ...initialState };
        
        if (user.name) {
          newState.name = user.name;
          newState.completedSteps = ["goal", "name"];
          newState.currentStep = "archetype";
        }
        
        if (user.eq_archetype) {
          newState.archetype = user.eq_archetype;
          newState.completedSteps = ["goal", "name", "archetype"];
          newState.currentStep = "coaching";
        }

        if (user.coaching_mode) {
          newState.coachingMode = user.coaching_mode;
          if (newState.completedSteps.includes("archetype")) {
            newState.completedSteps = ["goal", "name", "archetype", "coaching"];
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

  const setGoal = (goal: string) => {
    setState((prev) => ({ ...prev, goal }));
  };

  const setName = (name: string) => {
    setState((prev) => ({ ...prev, name }));
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
