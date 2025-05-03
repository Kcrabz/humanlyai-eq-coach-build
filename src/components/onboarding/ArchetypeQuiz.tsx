
import { Quiz } from "../quiz/Quiz";
import { EQArchetype } from "@/types";

interface ArchetypeQuizProps {
  onSelect: (archetype: EQArchetype) => void;
  onSkip?: () => void;
}

export const ArchetypeQuiz = ({ onSelect, onSkip }: ArchetypeQuizProps) => {
  const handleArchetypeSelected = (archetype: string) => {
    console.log("Archetype selected in quiz:", archetype);
    onSelect(archetype as EQArchetype);
  };
  
  return (
    <div className="w-full">
      <Quiz onComplete={handleArchetypeSelected} />
    </div>
  );
};
