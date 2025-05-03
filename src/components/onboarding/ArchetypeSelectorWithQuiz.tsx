
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArchetypeQuiz } from "./ArchetypeQuiz";
import { useOnboarding } from "@/context/OnboardingContext";
import { EQArchetype } from "@/types";
import { toast } from "sonner";

export const ArchetypeSelectorWithQuiz = () => {
  const { state, setArchetype, completeStep } = useOnboarding();
  const [isStarted, setIsStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleQuizResult = async (archetype: EQArchetype) => {
    console.log("Quiz completed, archetype received:", archetype);
    setIsProcessing(true);
    
    try {
      // Set the archetype in the onboarding context
      setArchetype(archetype);
      
      // Complete the step after setting the archetype
      await completeStep("archetype");
      
      toast.success("Profile analysis complete!");
    } catch (error) {
      console.error("Error processing quiz result:", error);
      toast.error("There was a problem saving your results. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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
      {isProcessing ? (
        <div className="flex items-center justify-center py-16">
          <div className="space-y-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-humanly-teal mx-auto"></div>
            <p className="text-muted-foreground">Processing your results...</p>
          </div>
        </div>
      ) : (
        <ArchetypeQuiz onSelect={handleQuizResult} />
      )}
    </div>
  );
};
