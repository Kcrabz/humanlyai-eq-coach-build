
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
      <div className="max-w-lg mx-auto px-4 text-center animate-scale-fade-in">
        {/* Background blobs */}
        <div className="fixed top-40 -left-20 w-64 h-64 bg-humanly-pastel-lavender blob-animation -z-10 opacity-40 blob"></div>
        <div className="fixed bottom-20 -right-32 w-80 h-80 bg-humanly-pastel-mint blob-animation-delayed -z-10 opacity-40 blob"></div>
        
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">
          EQ Assessment
        </h1>
        <p className="mb-4 text-lg">
          This quick assessment will help us understand your emotional intelligence profile and provide personalized coaching.
        </p>
        <p className="mb-10 text-muted-foreground">
          Please answer 15 questions, taking your time to reflect on each one.
        </p>
        
        <div className="relative group">
          <Button 
            size="lg" 
            onClick={() => setIsStarted(true)}
            className="py-6 px-8 text-base rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
          >
            Start Assessment
          </Button>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
        
        <div className="mt-14 bg-humanly-pastel-yellow/50 rounded-xl p-6 shadow-sm border border-humanly-pastel-yellow">
          <p className="text-gray-700 text-sm">
            Your results will help us tailor your coaching experience to match your unique emotional intelligence profile.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 animate-slide-up">
      <h1 className="text-2xl md:text-3xl font-semibold text-center mb-8">
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
