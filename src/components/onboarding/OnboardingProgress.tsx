
import { OnboardingStep, useOnboarding } from "@/context/OnboardingContext";
import { Check } from "lucide-react";

interface StepInfo {
  step: OnboardingStep;
  label: string;
  number: number;
}

const steps: StepInfo[] = [
  { step: "archetype", label: "Select Archetype", number: 1 },
  { step: "coaching", label: "Choose Coaching Style", number: 2 },
  { step: "complete", label: "Complete Setup", number: 3 },
];

export function OnboardingProgress() {
  const { state, goToStep, isStepComplete } = useOnboarding();
  const { currentStep } = state;

  const handleStepClick = (step: OnboardingStep) => {
    // Only allow navigation to completed steps or the current one
    if (isStepComplete(step) || steps.find(s => s.step === step)?.number < steps.find(s => s.step === currentStep)?.number!) {
      goToStep(step);
    }
  };
  
  return (
    <div className="mb-10">
      <div className="flex items-center justify-center mb-6">
        <ol className="flex items-center w-full max-w-md">
          {steps.map((stepInfo, index) => {
            const isActive = currentStep === stepInfo.step;
            const isCompleted = isStepComplete(stepInfo.step);
            
            return (
              <li 
                key={stepInfo.step} 
                className={`flex items-center ${index < steps.length - 1 ? "w-full" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => handleStepClick(stepInfo.step)}
                  disabled={!isCompleted && !isActive}
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive
                      ? "bg-humanly-teal text-white"
                      : isCompleted
                      ? "bg-humanly-teal/80 text-white"
                      : "bg-humanly-gray-lightest"
                  } transition-colors ${(isCompleted || isActive) ? "cursor-pointer" : "cursor-not-allowed"}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{stepInfo.number}</span>
                  )}
                </button>
                
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-0.5 transition-colors ${
                      index < steps.findIndex(s => s.step === currentStep)
                        ? "bg-humanly-teal"
                        : "bg-humanly-gray-light"
                    }`}
                  ></div>
                )}
                
                <span className="absolute mt-16 text-xs font-medium text-gray-500">
                  {stepInfo.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
