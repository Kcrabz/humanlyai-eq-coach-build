
import { QuizQuestion } from '../types';

// Questions focused on emotional expression and interpersonal boundaries
export const emotionalExpressionQuestions: QuizQuestion[] = [
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
