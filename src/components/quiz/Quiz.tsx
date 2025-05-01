
import { useQuiz } from "@/hooks/useQuiz";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResults } from "./QuizResults";

interface QuizProps {
  onComplete: (archetype: string) => void;
}

export const Quiz = ({ onComplete }: QuizProps) => {
  const { state, getCurrentQuestion, selectOption, restartQuiz } = useQuiz();
  
  const handleContinue = () => {
    if (state.result) {
      onComplete(state.result.dominantArchetype);
    }
  };
  
  if (state.isCompleted && state.result) {
    return (
      <QuizResults
        dominantArchetype={state.result.dominantArchetype}
        scores={state.result.scores}
        onContinue={handleContinue}
        onRestart={restartQuiz}
      />
    );
  }
  
  const currentQuestion = getCurrentQuestion();
  
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">
          Question {state.currentQuestionIndex + 1} of {5}
        </p>
      </div>
      {currentQuestion && (
        <QuizQuestion 
          question={currentQuestion} 
          onSelect={selectOption} 
        />
      )}
    </div>
  );
};
