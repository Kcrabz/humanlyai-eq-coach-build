
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Quiz } from "../quiz/Quiz";
import { EQArchetype } from "@/types";

interface ArchetypeQuizProps {
  onSelect: (archetype: EQArchetype) => void;
  onSkip?: () => void;
}

export const ArchetypeQuiz = ({ onSelect, onSkip }: ArchetypeQuizProps) => {
  const [showQuiz, setShowQuiz] = useState(false);
  
  const handleArchetypeSelected = (archetype: string) => {
    onSelect(archetype as EQArchetype);
  };
  
  if (!showQuiz) {
    return (
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Discover Your EQ Archetype</h2>
        <p className="mb-6">
          Take a quick 5-question quiz to determine your Emotional Intelligence archetype.
          Understanding your EQ archetype will help personalize your coaching experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="lg" 
            onClick={() => setShowQuiz(true)}
          >
            Take the Quiz
          </Button>
          {onSkip && (
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onSkip}
            >
              Skip for Now
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <Quiz onComplete={handleArchetypeSelected} />
    </div>
  );
};
