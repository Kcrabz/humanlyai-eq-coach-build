
import { QuizQuestion } from '../types';
import { selfAwarenessQuestions } from './selfAwareness';
import { actionTendencyQuestions } from './actionTendency';
import { emotionalExpressionQuestions } from './emotionalExpression';

// Combine all question sets into the complete quiz
export const quizQuestions: QuizQuestion[] = [
  ...selfAwarenessQuestions,  // Questions about self-reflection and awareness
  ...actionTendencyQuestions, // Questions about action vs. hesitation
  ...emotionalExpressionQuestions, // Questions about emotional expression and boundaries
];
