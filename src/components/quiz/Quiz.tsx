
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
