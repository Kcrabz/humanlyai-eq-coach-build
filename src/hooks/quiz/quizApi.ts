
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
    // Return early and use local calculation if no userId (user not logged in)
    if (!userId) {
      console.log("User not logged in, using local calculation");
      return calculateLocalResults(answers, answerScores, quizQuestions);
    }

    // Prepare answers for the edge function - convert to array of numbers
    const answersArray: number[] = [];
    quizQuestions.forEach(question => {
      const option = question.options.find(o => o.id === answers[question.id]);
      if (option) {
        answersArray.push(option.value);
      } else {
        answersArray.push(3); // Default to neutral if answer not found
      }
    });
    
    // Check we have all 15 answers
    if (answersArray.length !== 15) {
      console.error("Error preparing quiz answers: Expected 15 answers but got", answersArray.length);
      toast.error("Error analyzing your results. Using local calculation instead.");
      return calculateLocalResults(answers, answerScores, quizQuestions);
    }
    
    console.log("Calling analyze-eq-archetype function with", answersArray.length, "answers");
    
    // Call the Supabase Edge Function for GPT-4o analysis
    const { data, error } = await supabase.functions.invoke('analyze-eq-archetype', {
      body: { 
        answers: answersArray,
        userId: userId
      }
    });

    if (error) {
      console.error("Error calling analyze-eq-archetype:", error);
      toast.error("Error analyzing your results. Using local calculation instead.");
      
      // Fall back to local calculation
      return calculateLocalResults(answers, answerScores, quizQuestions);
    }
    
    console.log("GPT analysis result:", data);
    
    // Use the GPT-analyzed result
    return {
      dominantArchetype: data.archetype,
      eqPotentialScore: Object.values(answerScores).reduce((sum, score) => sum + score, 0),
      scores: calculateArchetypeScores(answers, answerScores, quizQuestions),
      strengths: [data.focus], // Keep existing field structure for compatibility
      growthAreas: [data.tip], // This will be shown in the Growth Tip section
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
