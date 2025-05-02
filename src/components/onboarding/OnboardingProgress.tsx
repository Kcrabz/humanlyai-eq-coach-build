
import { useOnboarding } from "@/context/OnboardingContext";
import { OnboardingStep } from "@/context/OnboardingContext";

export function OnboardingProgress() {
  const { state, isStepComplete } = useOnboarding();
  const { currentStep } = state;
  
  const steps: {id: OnboardingStep; label: string}[] = [
    { id: "goal", label: "Your Goal" },
    { id: "archetype", label: "EQ Assessment" },
    { id: "coaching", label: "Coaching Style" },
    { id: "complete", label: "Results" }
  ];
  
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative">
            {/* Line connecting steps */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute top-3 left-1/2 w-full h-[2px] ${
                  isStepComplete(step.id) ? 'bg-humanly-teal' : 'bg-gray-200'
                }`}
                style={{ transform: 'translateX(50%)' }}
              />
            )}
            
            {/* Step circle */}
            <div 
              className={`w-6 h-6 rounded-full z-10 flex items-center justify-center ${
                currentStep === step.id
                  ? 'bg-humanly-teal text-white'
                  : isStepComplete(step.id)
                  ? 'bg-humanly-teal text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isStepComplete(step.id) && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            
            {/* Step label */}
            <div 
              className={`mt-2 text-xs ${
                currentStep === step.id
                  ? 'text-humanly-teal font-semibold'
                  : isStepComplete(step.id)
                  ? 'text-humanly-teal font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
