
export type OnboardingStep = "goal" | "name" | "archetype" | "coaching" | "complete";

export interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  goal: string | null;
  name: string | null; 
  archetype: string | null;
  coachingMode: string | null;
  isLoading: boolean;
}
