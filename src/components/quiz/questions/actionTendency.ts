
import { QuizQuestion } from '../types';

// Questions focused on action vs hesitation tendencies
export const actionTendencyQuestions: QuizQuestion[] = [
  {
    id: 'q2',
    text: 'I often take quick action without hesitation.',
    options: [
      {
        id: 'q2o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 5, connector: 2, driver: 1, harmonizer: 3 }
      },
      {
        id: 'q2o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 4, connector: 2, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q2o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q2o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 3, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q2o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 1, connector: 2, driver: 5, harmonizer: 2 }
      }
    ]
  },
  {
    id: 'q6',
    text: 'I thrive on momentum and dislike delays.',
    options: [
      {
        id: 'q6o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 4, connector: 2, driver: 1, harmonizer: 3 }
      },
      {
        id: 'q6o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 3, connector: 2, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q6o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q6o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 3, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q6o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 1, connector: 2, driver: 5, harmonizer: 1 }
      }
    ]
  },
  {
    id: 'q9',
    text: 'I prefer thinking over feeling in tough situations.',
    options: [
      {
        id: 'q9o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 2, connector: 4, driver: 1, harmonizer: 4 }
      },
      {
        id: 'q9o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 3, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q9o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q9o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 2, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q9o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 1, driver: 5, harmonizer: 1 }
      }
    ]
  },
  {
    id: 'q15',
    text: 'I often focus more on logic than emotions.',
    options: [
      {
        id: 'q15o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 5, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q15o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 4, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q15o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q15o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 2, driver: 4, harmonizer: 2 }
      },
      {
        id: 'q15o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 1, driver: 5, harmonizer: 1 }
      }
    ]
  }
];
