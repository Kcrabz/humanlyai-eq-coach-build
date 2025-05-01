
import { useState } from 'react';
import { QuizState } from '@/components/quiz/types';
import { EQArchetype } from '@/types';
import { quizQuestions } from '@/components/quiz/questions';
import { useProfileActions } from './useProfileActions';
import { useAuth } from '@/context/AuthContext';
import { processQuizResults } from './quiz/quizApi';
import { mapArchetypeToLegacy } from './quiz/quizCalculations';

export const useQuiz = () => {
  const { user } = useAuth();
  const { setArchetype } = useProfileActions((newUser) => {
    // This is just for type safety, the actual update happens in useProfileActions
  });
  
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    answerScores: {},
    isCompleted: false,
  });

  const selectOption = async (optionId: string) => {
    const currentQuestion = quizQuestions[state.currentQuestionIndex];
    
    // Find the selected option to get its value
    const selectedOption = currentQuestion.options.find(o => o.id === optionId);
    if (!selectedOption) return;

    // Save the answer and score
    const newAnswers = {
      ...state.answers,
      [currentQuestion.id]: optionId
    };

    const newAnswerScores = {
      ...state.answerScores,
      [currentQuestion.id]: selectedOption.value
    };
    
    const nextIndex = state.currentQuestionIndex + 1;
    const isLastQuestion = nextIndex >= quizQuestions.length;
    
    if (isLastQuestion) {
      // Set loading state while we process the results
      setState(prev => ({
        ...prev,
        answers: newAnswers,
        answerScores: newAnswerScores,
        isLoading: true
      }));

      // Process the quiz results
      const result = await processQuizResults(user?.id, newAnswers, newAnswerScores);
      
      // Update the state with the result
      setState({
        ...state,
        answers: newAnswers,
        answerScores: newAnswerScores,
        isCompleted: true,
        result,
        isLoading: false
      });
      
      // Save the result to the user's profile if user is logged in
      if (user) {
        setArchetype(mapArchetypeToLegacy(result.dominantArchetype) as EQArchetype);
      }

    } else {
      // Move to the next question
      setState({
        ...state,
        currentQuestionIndex: nextIndex,
        answers: newAnswers,
        answerScores: newAnswerScores
      });
    }
  };

  const restartQuiz = () => {
    setState({
      currentQuestionIndex: 0,
      answers: {},
      answerScores: {},
      isCompleted: false,
      result: undefined,
      isLoading: false
    });
  };

  const getCurrentQuestion = () => {
    return quizQuestions[state.currentQuestionIndex];
  };

  return {
    state,
    getCurrentQuestion,
    selectOption,
    restartQuiz
  };
};
