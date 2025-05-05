
import { QuizQuestion } from '../types';
import { selfAwarenessQuestions } from './selfAwareness';
import { actionTendencyQuestions } from './actionTendency';
import { coreExpressionQuestions } from './core-expression';
import { interpersonalQuestions } from './interpersonal';

// Select specific questions from each category to create a balanced 10-question quiz
const selectedSelfAwarenessQuestions = [
  selfAwarenessQuestions[0], // q1: I reflect on my emotions before reacting
  selfAwarenessQuestions[1], // q5: I take time to pause and process before responding
  selfAwarenessQuestions[2]  // q11: I am highly self-aware of my emotional state
];

const selectedActionTendencyQuestions = [
  actionTendencyQuestions[0], // q2: I often take quick action without hesitation
  actionTendencyQuestions[1], // q6: I thrive on momentum and dislike delays
  actionTendencyQuestions[2]  // q9: I prefer thinking over feeling in tough situations
];

// Using the core emotional expression questions and interpersonal questions
const selectedEmotionalExpressionQuestions = [
  coreExpressionQuestions[0], // q3: I find it difficult to express how I feel
  coreExpressionQuestions[1], // q4: I prioritize the needs of others over my own
  interpersonalQuestions[1],  // q8: I avoid conflict to maintain harmony
  interpersonalQuestions[2]   // q10: I struggle to say "no" even when I need to
];

// Combine all selected question sets into the complete quiz with 10 questions total
export const quizQuestions: QuizQuestion[] = [
  ...selectedSelfAwarenessQuestions,       // 3 questions about self-awareness
  ...selectedActionTendencyQuestions,      // 3 questions about action tendencies
  ...selectedEmotionalExpressionQuestions  // 4 questions about emotional expression
];
