
import { useState } from 'react';
import { QuizState, QuizOption } from '@/components/quiz/types';
import { EQArchetype } from '@/types';
import { ARCHETYPES } from '@/lib/constants';
import { quizQuestions } from '@/components/quiz/questions';
import { useProfileActions } from './useProfileActions';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      try {
        setState(prev => ({
          ...prev,
          answers: newAnswers,
          answerScores: newAnswerScores,
          isLoading: true
        }));
        
        // Prepare answers for the edge function
        const formattedAnswers: Record<string, number> = {};
        Object.keys(newAnswers).forEach(questionId => {
          const questionIndex = quizQuestions.findIndex(q => q.id === questionId);
          const option = quizQuestions[questionIndex].options.find(o => o.id === newAnswers[questionId]);
          if (option) {
            formattedAnswers[questionId] = option.value;
          }
        });
        
        // Call the Supabase Edge Function for GPT-based analysis
        const { data, error } = await supabase.functions.invoke('analyze-eq-archetype', {
          body: { 
            answers: formattedAnswers,
            userId: user?.id
          }
        });

        if (error) {
          console.error("Error calling analyze-eq-archetype:", error);
          toast.error("Error analyzing your results. Using local calculation instead.");
          // Fall back to local calculation
          const result = calculateResults(newAnswers, newAnswerScores);
          setState({
            ...state,
            answers: newAnswers,
            answerScores: newAnswerScores,
            isCompleted: true,
            result,
            isLoading: false
          });
          
          if (user) {
            setArchetype(mapArchetypeToLegacy(result.dominantArchetype));
          }
          return;
        }
        
        // Use the GPT-analyzed result
        const gptResult = {
          dominantArchetype: data.archetype,
          eqPotentialScore: Object.values(newAnswerScores).reduce((sum, score) => sum + score, 0),
          scores: calculateArchetypeScores(newAnswers, newAnswerScores),
          strengths: [data.focus],
          growthAreas: [data.tip],
          eqPotentialCategory: determineEQPotentialCategory(Object.values(newAnswerScores).reduce((sum, score) => sum + score, 0)),
          bio: data.bio
        };

        setState({
          ...state,
          answers: newAnswers,
          answerScores: newAnswerScores,
          isCompleted: true,
          result: gptResult,
          isLoading: false
        });
        
        // Save the result to the user's profile
        if (user) {
          setArchetype(mapArchetypeToLegacy(gptResult.dominantArchetype));
        }
      } catch (error) {
        console.error("Error processing quiz results:", error);
        toast.error("Error analyzing results. Using local calculation instead.");
        
        // Fall back to local calculation
        const result = calculateResults(newAnswers, newAnswerScores);
        setState({
          ...state,
          answers: newAnswers,
          answerScores: newAnswerScores,
          isCompleted: true,
          result,
          isLoading: false
        });
        
        if (user) {
          setArchetype(mapArchetypeToLegacy(result.dominantArchetype));
        }
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
  
  const determineEQPotentialCategory = (score: number): 'High EQ Potential' | 'Developing EQ' | 'Growth Opportunity' => {
    if (score >= 60) {
      return 'High EQ Potential';
    } else if (score >= 40) {
      return 'Developing EQ';
    } else {
      return 'Growth Opportunity';
    }
  };
  
  // Calculate archetype scores from answers
  const calculateArchetypeScores = (
    answers: Record<string, string>,
    answerScores: Record<string, number>
  ): Record<string, number> => {
    const scores: Record<string, number> = {
      reflector: 0,
      connector: 0,
      driver: 0,
      harmonizer: 0
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
    
    return scores;
  };

  // Map the new archetype names to the legacy ones for backwards compatibility
  const mapArchetypeToLegacy = (archetype: string): EQArchetype => {
    switch(archetype) {
      case 'reflector':
        return 'reflector';
      case 'connector':
        return 'connector';
      case 'observer':
        return 'observer';
      case 'activator':
        return 'activator'; 
      case 'regulator':
        return 'regulator';
      case 'driver':
        return 'activator'; // Map driver to activator
      case 'harmonizer':
        return 'regulator'; // Map harmonizer to regulator
      default:
        return 'reflector';
    }
  };

  const calculateResults = (
    answers: Record<string, string>,
    answerScores: Record<string, number>
  ): {
    dominantArchetype: string;
    eqPotentialScore: number;
    scores: Record<string, number>;
    strengths: string[];
    growthAreas: string[];
    eqPotentialCategory: 'High EQ Potential' | 'Developing EQ' | 'Growth Opportunity';
  } => {
    // Initialize scores for each archetype
    const scores: Record<string, number> = {
      reflector: 0,
      connector: 0,
      driver: 0,
      harmonizer: 0
    };
    
    // Calculate total EQ potential score (sum of all answer scores)
    const eqPotentialScore = Object.values(answerScores).reduce((sum, score) => sum + score, 0);
    
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

    // Determine EQ potential category
    let eqPotentialCategory: 'High EQ Potential' | 'Developing EQ' | 'Growth Opportunity';
    if (eqPotentialScore >= 60) {
      eqPotentialCategory = 'High EQ Potential';
    } else if (eqPotentialScore >= 40) {
      eqPotentialCategory = 'Developing EQ';
    } else {
      eqPotentialCategory = 'Growth Opportunity';
    }
    
    // Determine strengths and growth areas based on highest and lowest scores
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const strengths = sortedScores.slice(0, 2).map(([archetype]) => {
      switch(archetype) {
        case 'reflector':
          return 'Self-awareness and introspection';
        case 'connector':
          return 'Empathy and building relationships';
        case 'driver':
          return 'Goal-setting and motivation';
        case 'harmonizer':
          return 'Emotional balance and adaptability';
        default:
          return '';
      }
    });
    
    const growthAreas = sortedScores.slice(-2).map(([archetype]) => {
      switch(archetype) {
        case 'reflector':
          return 'Translating insights into action';
        case 'connector':
          return 'Setting healthy boundaries';
        case 'driver':
          return 'Slowing down to consider emotional nuance';
        case 'harmonizer':
          return 'Developing depth in specific EQ areas';
        default:
          return '';
      }
    });
    
    return {
      dominantArchetype,
      eqPotentialScore,
      scores,
      strengths,
      growthAreas,
      eqPotentialCategory
    };
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
