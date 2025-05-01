
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateLocalResults, determineEQPotentialCategory, calculateArchetypeScores } from './quizCalculations';
import { quizQuestions } from '@/components/quiz/questions';

/**
 * Processes quiz answers through the Supabase Edge Function or falls back to local calculation
 */
export const processQuizResults = async (
  userId: string | undefined,
  answers: Record<string, string>,
  answerScores: Record<string, number>
) => {
  try {
    // Prepare answers for the edge function
    const formattedAnswers: Record<string, number> = {};
    Object.keys(answers).forEach(questionId => {
      const questionIndex = quizQuestions.findIndex(q => q.id === questionId);
      const option = quizQuestions[questionIndex].options.find(o => o.id === answers[questionId]);
      if (option) {
        formattedAnswers[questionId] = option.value;
      }
    });
    
    // Call the Supabase Edge Function for GPT-based analysis
    const { data, error } = await supabase.functions.invoke('analyze-eq-archetype', {
      body: { 
        answers: formattedAnswers,
        userId: userId
      }
    });

    if (error) {
      console.error("Error calling analyze-eq-archetype:", error);
      toast.error("Error analyzing your results. Using local calculation instead.");
      
      // Fall back to local calculation
      return calculateLocalResults(answers, answerScores, quizQuestions);
    }
    
    // Use the GPT-analyzed result
    return {
      dominantArchetype: data.archetype,
      eqPotentialScore: Object.values(answerScores).reduce((sum, score) => sum + score, 0),
      scores: calculateArchetypeScores(answers, answerScores, quizQuestions),
      strengths: [data.focus],
      growthAreas: [data.tip],
      eqPotentialCategory: determineEQPotentialCategory(
        Object.values(answerScores).reduce((sum, score) => sum + score, 0)
      ),
      bio: data.bio
    };
    
  } catch (error) {
    console.error("Error processing quiz results:", error);
    toast.error("Error analyzing results. Using local calculation instead.");
    
    // Fall back to local calculation
    return calculateLocalResults(answers, answerScores, quizQuestions);
  }
};
