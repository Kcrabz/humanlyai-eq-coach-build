
export type OnboardingStep = "welcome" | "goal" | "name" | "archetype" | "coaching" | "complete";

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  goal: string | null;
  firstName: string | null;
  lastName: string | null;
  archetype: string | null;
  coachingMode: string | null;
  isLoading: boolean;
}
