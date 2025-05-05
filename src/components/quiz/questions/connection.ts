
import { QuizQuestion } from '../types';

// Questions about connection and vulnerability
export const connectionQuestions: QuizQuestion[] = [
  {
    id: 'q12',
    text: 'I value deep personal connections over tasks.',
    options: [
      {
        id: 'q12o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 2, connector: 1, driver: 5, harmonizer: 1 }
      },
      {
        id: 'q12o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 3, connector: 2, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q12o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q12o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 3, connector: 4, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q12o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 2, connector: 5, driver: 1, harmonizer: 5 }
      }
    ]
  },
  {
    id: 'q13',
    text: 'I feel comfortable sharing vulnerability.',
    options: [
      {
        id: 'q13o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 4, connector: 1, driver: 4, harmonizer: 1 }
      },
      {
        id: 'q13o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 3, connector: 2, driver: 3, harmonizer: 2 }
      },
      {
        id: 'q13o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q13o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 4, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q13o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 1, connector: 5, driver: 1, harmonizer: 5 }
      }
    ]
  }
];
