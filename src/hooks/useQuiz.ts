
import { useState } from 'react';
import { QuizState, QuizOption } from '@/components/quiz/types';
import { EQArchetype } from '@/types';
import { ARCHETYPES } from '@/lib/constants';
import { quizQuestions } from '@/components/quiz/questions';
import { useProfileActions } from './useProfileActions';
import { useAuth } from '@/context/AuthContext';

export const useQuiz = () => {
  const { user } = useAuth();
  const { setArchetype } = useProfileActions((newUser) => {
    // This is just for type safety, the actual update happens in useProfileActions
  });
  
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    isCompleted: false,
  });

  const selectOption = (optionId: string) => {
    const currentQuestion = quizQuestions[state.currentQuestionIndex];
    
    // Save the answer
    const newAnswers = {
      ...state.answers,
      [currentQuestion.id]: optionId
    };
    
    const nextIndex = state.currentQuestionIndex + 1;
    const isLastQuestion = nextIndex >= quizQuestions.length;
    
    if (isLastQuestion) {
      // Calculate results if this is the last question
      const result = calculateResults(newAnswers);
      
      setState({
        ...state,
        answers: newAnswers,
        isCompleted: true,
        result
      });
      
      // Save the result to the user's profile
      if (user) {
        setArchetype(result.dominantArchetype as EQArchetype);
      }
    } else {
      // Move to the next question
      setState({
        ...state,
        currentQuestionIndex: nextIndex,
        answers: newAnswers
      });
    }
  };

  const calculateResults = (answers: Record<string, string>): {
    dominantArchetype: string;
    scores: Record<string, number>;
  } => {
    // Initialize scores for each archetype
    const scores: Record<string, number> = {
      reflector: 0,
      activator: 0,
      regulator: 0,
      connector: 0,
      observer: 0
    };
    
    // Sum up scores based on answers
    Object.entries(answers).forEach(([questionId, optionId]) => {
      // Find the question
      const question = quizQuestions.find(q => q.id === questionId);
      if (!question) return;
      
      // Find the selected option
      const option = question.options.find(o => o.id === optionId);
      if (!option) return;
      
      // Add scores for each archetype
      Object.entries(option.archetypeScores).forEach(([archetype, score]) => {
        scores[archetype] = (scores[archetype] || 0) + score;
      });
    });
    
    // Find the dominant archetype
    let dominantArchetype = Object.keys(scores)[0];
    let highestScore = scores[dominantArchetype];
    
    Object.entries(scores).forEach(([archetype, score]) => {
      if (score > highestScore) {
        dominantArchetype = archetype;
        highestScore = score;
      }
    });
    
    return {
      dominantArchetype,
      scores
    };
  };

  const restartQuiz = () => {
    setState({
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
      result: undefined
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
