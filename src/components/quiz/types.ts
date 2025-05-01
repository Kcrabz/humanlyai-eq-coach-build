
export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  // Each option will have scores for different archetypes
  archetypeScores: Record<string, number>;
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> optionId
  isCompleted: boolean;
  result?: {
    dominantArchetype: string;
    scores: Record<string, number>;
  };
}
