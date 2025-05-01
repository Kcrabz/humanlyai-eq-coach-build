
import { QuizQuestion } from '../types';

// Questions focused on self-awareness and reflection
export const selfAwarenessQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'I reflect on my emotions before reacting.',
    options: [
      {
        id: 'q1o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q1o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q1o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 2, driver: 1, harmonizer: 2 }
      },
      {
        id: 'q1o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 2, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q1o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 3, driver: 2, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q5',
    text: 'I take time to pause and process before responding.',
    options: [
      {
        id: 'q5o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 2, driver: 5, harmonizer: 1 }
      },
      {
        id: 'q5o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 2, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q5o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q5o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 3, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q5o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 3, driver: 1, harmonizer: 5 }
      }
    ]
  },
  {
    id: 'q11',
    text: 'I am highly self-aware of my emotional state.',
    options: [
      {
        id: 'q11o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 2, driver: 3, harmonizer: 1 }
      },
      {
        id: 'q11o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 2, driver: 3, harmonizer: 2 }
      },
      {
        id: 'q11o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q11o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 3, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q11o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 4, driver: 2, harmonizer: 5 }
      }
    ]
  },
  {
    id: 'q14',
    text: 'I overanalyze before making decisions.',
    options: [
      {
        id: 'q14o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 2, driver: 5, harmonizer: 2 }
      },
      {
        id: 'q14o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 3, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q14o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q14o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 2, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q14o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 1, driver: 1, harmonizer: 4 }
      }
    ]
  }
];
