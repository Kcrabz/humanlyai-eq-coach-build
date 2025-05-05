
import { QuizQuestion } from '../types';
import { coreExpressionQuestions } from './core-expression';
import { interpersonalQuestions } from './interpersonal';
import { connectionQuestions } from './connection';

// Re-export the core questions as emotionalExpressionQuestions for backward compatibility
export const emotionalExpressionQuestions = coreExpressionQuestions;

// Re-export interpersonalQuestions for backward compatibility
export { interpersonalQuestions };

// Combine all emotional expression related questions into a single export
// This maintains compatibility with existing imports while organizing the code better
export const allEmotionalExpressionQuestions: QuizQuestion[] = [
  ...coreExpressionQuestions,
  ...interpersonalQuestions,
  ...connectionQuestions
];
