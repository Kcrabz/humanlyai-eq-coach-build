
export type OnboardingStep = "goal" | "archetype" | "coaching" | "complete";

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  goal: string | null;
  archetype: string | null;
  coachingMode: string | null;
  isLoading: boolean;
}
