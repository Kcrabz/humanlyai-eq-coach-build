
import { QuizOption } from '@/components/quiz/types';

/**
 * Determines EQ potential category based on total score
 * Adjusted thresholds for the 10-question quiz (max score 50)
 */
export const determineEQPotentialCategory = (score: number): 'High EQ Potential' | 'Developing EQ' | 'Growth Opportunity' => {
  if (score >= 40) {
    return 'High EQ Potential';
  } else if (score >= 25) {
    return 'Developing EQ';
  } else {
    return 'Growth Opportunity';
  }
};

/**
 * Calculate archetype scores from quiz answers
 */
export const calculateArchetypeScores = (
  answers: Record<string, string>,
  answerScores: Record<string, number>,
  quizQuestions: any[]
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
    const option = question.options.find((o: QuizOption) => o.id === optionId);
    if (!option) return;
    
    // Add scores for each archetype - fix the type issue here
    Object.entries(option.archetypeScores).forEach(([archetype, score]) => {
      if (typeof score === 'number') {  // Add type check to ensure score is a number
        scores[archetype] = (scores[archetype] || 0) + score;
      }
    });
  });
  
  return scores;
};

/**
 * Map the new archetype names to the legacy ones for backwards compatibility
 */
export const mapArchetypeToLegacy = (archetype: string): string => {
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

/**
 * Calculate local quiz results when edge function is unavailable
 */
export const calculateLocalResults = (
  answers: Record<string, string>,
  answerScores: Record<string, number>,
  quizQuestions: any[]
): {
  dominantArchetype: string;
  eqPotentialScore: number;
  scores: Record<string, number>;
  strengths: string[];
  growthAreas: string[];
  eqPotentialCategory: 'High EQ Potential' | 'Developing EQ' | 'Growth Opportunity';
} => {
  // Initialize scores for each archetype
  const scores = calculateArchetypeScores(answers, answerScores, quizQuestions);
  
  // Calculate total EQ potential score (sum of all answer scores)
  const eqPotentialScore = Object.values(answerScores).reduce((sum, score) => sum + score, 0);
  
  // Find the dominant archetype
  let dominantArchetype = Object.keys(scores)[0];
  let highestScore = scores[dominantArchetype];
  
  Object.entries(scores).forEach(([archetype, score]) => {
    if (score > highestScore) {
      dominantArchetype = archetype;
      highestScore = score;
    }
  });

  // Determine EQ potential category - using updated thresholds
  const eqPotentialCategory = determineEQPotentialCategory(eqPotentialScore);
  
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
