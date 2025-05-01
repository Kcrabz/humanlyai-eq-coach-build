
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
  
  // Show loading state when processing the results
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-humanly-teal mx-auto"></div>
          <p className="text-muted-foreground">Analyzing your responses...</p>
        </div>
      </div>
    );
  }
  
  if (state.isCompleted && state.result) {
    return (
      <QuizResults
        result={state.result}
        onContinue={handleContinue}
        onRestart={restartQuiz}
      />
    );
  }
  
  const currentQuestion = getCurrentQuestion();
  const totalQuestions = 15; // Fixed to 15 questions as per requirements
  
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">
          Question {state.currentQuestionIndex + 1} of {totalQuestions}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-humanly-teal h-2 rounded-full transition-all duration-300"
            style={{ width: `${((state.currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
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
