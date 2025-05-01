
export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  value: number; // 1-5 scale
  // Each option will have scores for different archetypes
  archetypeScores: Record<string, number>;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> optionId
  answerScores: Record<string, number>; // questionId -> score (1-5)
  isCompleted: boolean;
  result?: {
    dominantArchetype: string;
    eqPotentialScore: number;
    scores: Record<string, number>;
    strengths: string[];
    growthAreas: string[];
    eqPotentialCategory: 'High EQ Potential' | 'Developing EQ' | 'Growth Opportunity';
  };
}
