
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArchetypeQuiz } from "./ArchetypeQuiz";
import { useOnboarding } from "@/context/OnboardingContext";
import { EQArchetype } from "@/types";

export const ArchetypeSelectorWithQuiz = () => {
  const { state, setArchetype, completeStep } = useOnboarding();
  const [isStarted, setIsStarted] = useState(false);
  
  const handleQuizResult = (archetype: EQArchetype) => {
    setArchetype(archetype);
    completeStep("archetype");
  };
  
  // Show initial instruction screen
  if (!isStarted) {
    return (
      <div className="max-w-lg mx-auto px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          EQ Assessment
        </h1>
        <p className="mb-4">
          This quick assessment will help us understand your emotional intelligence profile and provide personalized coaching.
        </p>
        <p className="mb-8 text-muted-foreground">
          Please answer 15 questions, taking your time to reflect on each one.
        </p>
        
        <Button 
          size="lg" 
          onClick={() => setIsStarted(true)}
        >
          Start Assessment
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        EQ Assessment
      </h1>
      <ArchetypeQuiz onSelect={handleQuizResult} />
    </div>
  );
};
