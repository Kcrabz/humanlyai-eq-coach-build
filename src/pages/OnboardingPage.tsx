
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ArchetypeSelector } from "@/components/onboarding/ArchetypeSelector";
import { CoachingModeSelector } from "@/components/onboarding/CoachingModeSelector";
import { OnboardingComplete } from "@/components/onboarding/OnboardingComplete";

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto p-4 py-12">
        <div className="mb-10">
          <div className="flex items-center justify-center mb-6">
            <ol className="flex items-center w-full max-w-md">
              {[1, 2, 3].map((s) => (
                <li
                  key={s}
                  className={`flex items-center ${s < 3 ? "w-full" : ""}`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      s <= step
                        ? "bg-humanly-purple text-white"
                        : "bg-humanly-gray-lightest"
                    }`}
                  >
                    {s}
                  </span>
                  {s < 3 && (
                    <div
                      className={`w-full h-0.5 ${
                        s < step ? "bg-humanly-purple" : "bg-humanly-gray-light"
                      }`}
                    ></div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {step === 1 && (
          <ArchetypeSelector onNext={() => setStep(2)} />
        )}
        
        {step === 2 && (
          <CoachingModeSelector 
            onNext={() => setStep(3)}
            onBack={() => setStep(1)} 
          />
        )}
        
        {step === 3 && (
          <OnboardingComplete onBack={() => setStep(2)} />
        )}
      </div>
    </PageLayout>
  );
};

export default OnboardingPage;
