import { useOnboarding } from "@/context/OnboardingContext";
import { OnboardingStep } from "@/context/OnboardingContext";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingProgress() {
  const { state, isStepComplete } = useOnboarding();
  const { currentStep } = state;
  
  const steps: {id: OnboardingStep; label: string}[] = [
    { id: "name", label: "Your Name" },
    { id: "goal", label: "Your Goal" },
    { id: "archetype", label: "EQ Assessment" },
    { id: "coaching", label: "Coaching Style" },
    { id: "complete", label: "Results" }
  ];
  
  return (
    <div className="mb-14 mt-4 relative">
      {/* Background blobs */}
      <div className="absolute top-0 -left-20 w-64 h-64 bg-humanly-pastel-mint blob-animation -z-10 opacity-50 blob"></div>
      <div className="absolute top-10 -right-10 w-48 h-48 bg-humanly-pastel-lavender blob-animation-delayed -z-10 opacity-40 blob"></div>
      
      <div className="flex justify-between items-center mx-auto max-w-2xl px-4 relative z-0">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isComplete = isStepComplete(step.id);
          
          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Line connecting steps */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute top-3 left-1/2 w-full h-[3px] transition-all duration-700",
                    isComplete ? 'bg-gradient-to-r from-humanly-teal to-humanly-teal/70' : 'bg-gray-200'
                  )}
                  style={{ 
                    transform: 'translateX(50%)',
                    backgroundSize: isComplete ? '200% 100%' : '100% 100%',
                    animation: isComplete ? 'gradient-flow 3s ease infinite' : 'none'
                  }}
                />
              )}
              
              {/* Step circle */}
              <div 
                className={cn(
                  "w-7 h-7 rounded-full z-10 flex items-center justify-center transition-all duration-500 progress-step",
                  isActive && "ring-4 ring-humanly-teal/20 animate-pulse-soft",
                  isComplete 
                    ? "bg-gradient-to-r from-humanly-teal to-humanly-green text-white shadow-sm" 
                    : isActive
                    ? "bg-white border-2 border-humanly-teal text-humanly-teal shadow-sm"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                )}
              >
                {isComplete ? (
                  <CheckIcon size={14} strokeWidth={3} className="animate-scale-fade-in" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Step label */}
              <div 
                className={cn(
                  "mt-3 text-sm transition-all duration-300 font-medium",
                  currentStep === step.id
                    ? "text-humanly-teal scale-105"
                    : isComplete
                    ? "text-humanly-teal"
                    : "text-gray-500"
                )}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
