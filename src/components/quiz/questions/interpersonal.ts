
import { QuizQuestion } from '../types';

// Questions about emotional processing and interpersonal behavior
export const interpersonalQuestions: QuizQuestion[] = [
  {
    id: 'q7',
    text: 'I keep emotional struggles to myself.',
    options: [
      {
        id: 'q7o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 2, connector: 5, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q7o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 3, connector: 4, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q7o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q7o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 2, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q7o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 1, driver: 5, harmonizer: 1 }
      }
    ]
  },
  {
    id: 'q8',
    text: 'I avoid conflict to maintain harmony.',
    options: [
      {
        id: 'q8o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 2, connector: 1, driver: 4, harmonizer: 1 }
      },
      {
        id: 'q8o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 2, driver: 3, harmonizer: 2 }
      },
      {
        id: 'q8o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q8o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 3, connector: 4, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q8o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 4, connector: 5, driver: 1, harmonizer: 5 }
      }
    ]
  },
  {
    id: 'q10',
    text: 'I struggle to say "no" even when I need to.',
    options: [
      {
        id: 'q10o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 2, connector: 1, driver: 4, harmonizer: 1 }
      },
      {
        id: 'q10o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 3, connector: 2, driver: 3, harmonizer: 2 }
      },
      {
        id: 'q10o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q10o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 3, connector: 4, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q10o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 2, connector: 5, driver: 1, harmonizer: 5 }
      }
    ]
  },
];
