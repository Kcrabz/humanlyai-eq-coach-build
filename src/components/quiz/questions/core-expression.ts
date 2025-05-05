
import { QuizQuestion } from '../types';

// Core emotional expression questions
export const coreExpressionQuestions: QuizQuestion[] = [
  {
    id: 'q3',
    text: 'I find it difficult to express how I feel.',
    options: [
      {
        id: 'q3o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 2, connector: 5, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q3o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 4, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q3o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q3o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 2, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q3o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 1, driver: 5, harmonizer: 1 }
      }
    ]
  },
  {
    id: 'q4',
    text: 'I prioritize the needs of others over my own.',
    options: [
      {
        id: 'q4o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 2, connector: 1, driver: 4, harmonizer: 1 }
      },
      {
        id: 'q4o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 2, driver: 3, harmonizer: 2 }
      },
      {
        id: 'q4o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q4o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 3, connector: 4, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q4o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 2, connector: 5, driver: 1, harmonizer: 5 }
      }
    ]
  },
];
