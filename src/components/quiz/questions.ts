
import { QuizQuestion } from './types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'I can identify my emotions as they happen.',
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
    id: 'q2',
    text: 'I understand how my emotions affect my behavior.',
    options: [
      {
        id: 'q2o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q2o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q2o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 2, driver: 2, harmonizer: 2 }
      },
      {
        id: 'q2o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 2, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q2o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 3, driver: 3, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q3',
    text: 'I regularly take time to reflect on my thoughts and feelings.',
    options: [
      {
        id: 'q3o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q3o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 1, driver: 1, harmonizer: 2 }
      },
      {
        id: 'q3o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 2, driver: 1, harmonizer: 2 }
      },
      {
        id: 'q3o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 2, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q3o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 3, driver: 2, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q4',
    text: 'I can easily recognize when others are feeling upset or distressed.',
    options: [
      {
        id: 'q4o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q4o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 1, connector: 2, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q4o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 3, driver: 1, harmonizer: 2 }
      },
      {
        id: 'q4o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 3, connector: 4, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q4o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 3, connector: 5, driver: 2, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q5',
    text: 'People often come to me for advice or to talk about their problems.',
    options: [
      {
        id: 'q5o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q5o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 1, connector: 2, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q5o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 3, driver: 2, harmonizer: 2 }
      },
      {
        id: 'q5o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 4, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q5o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 3, connector: 5, driver: 3, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q6',
    text: 'I easily create deep connections with other people.',
    options: [
      {
        id: 'q6o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q6o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 1, connector: 2, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q6o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 3, driver: 2, harmonizer: 2 }
      },
      {
        id: 'q6o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 4, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q6o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 3, connector: 5, driver: 2, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q7',
    text: 'I set clear goals and work persistently to achieve them.',
    options: [
      {
        id: 'q7o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q7o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 1, connector: 1, driver: 2, harmonizer: 1 }
      },
      {
        id: 'q7o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 2, driver: 3, harmonizer: 2 }
      },
      {
        id: 'q7o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 2, driver: 4, harmonizer: 3 }
      },
      {
        id: 'q7o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 3, connector: 3, driver: 5, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q8',
    text: 'I remain resilient when facing setbacks or challenges.',
    options: [
      {
        id: 'q8o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q8o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 1, connector: 1, driver: 2, harmonizer: 1 }
      },
      {
        id: 'q8o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 2, driver: 3, harmonizer: 2 }
      },
      {
        id: 'q8o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 2, driver: 4, harmonizer: 3 }
      },
      {
        id: 'q8o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 3, connector: 3, driver: 5, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q9',
    text: 'I take action quickly when a situation requires it.',
    options: [
      {
        id: 'q9o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q9o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 1, connector: 1, driver: 2, harmonizer: 1 }
      },
      {
        id: 'q9o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 2, driver: 3, harmonizer: 2 }
      },
      {
        id: 'q9o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 2, driver: 4, harmonizer: 3 }
      },
      {
        id: 'q9o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 3, connector: 3, driver: 5, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q10',
    text: 'I can manage my emotions effectively during stressful situations.',
    options: [
      {
        id: 'q10o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q10o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 2 }
      },
      {
        id: 'q10o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 2, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q10o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 4 }
      },
      {
        id: 'q10o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 3, connector: 3, driver: 3, harmonizer: 5 }
      }
    ]
  },
  {
    id: 'q11',
    text: 'I adapt easily to new circumstances or unexpected changes.',
    options: [
      {
        id: 'q11o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q11o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 1, connector: 2, driver: 2, harmonizer: 2 }
      },
      {
        id: 'q11o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 2, driver: 3, harmonizer: 3 }
      },
      {
        id: 'q11o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 2, connector: 3, driver: 4, harmonizer: 4 }
      },
      {
        id: 'q11o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 3, connector: 3, driver: 4, harmonizer: 5 }
      }
    ]
  },
  {
    id: 'q12',
    text: 'I balance listening to others with expressing my own thoughts.',
    options: [
      {
        id: 'q12o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q12o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 2, driver: 1, harmonizer: 2 }
      },
      {
        id: 'q12o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 2, connector: 3, driver: 2, harmonizer: 3 }
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
        archetypeScores: { reflector: 3, connector: 4, driver: 3, harmonizer: 5 }
      }
    ]
  },
  {
    id: 'q13',
    text: 'I notice how my body responds to different emotions.',
    options: [
      {
        id: 'q13o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q13o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 1, driver: 1, harmonizer: 2 }
      },
      {
        id: 'q13o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 2, driver: 1, harmonizer: 3 }
      },
      {
        id: 'q13o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 4, connector: 3, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q13o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 3, driver: 2, harmonizer: 4 }
      }
    ]
  },
  {
    id: 'q14',
    text: 'I consider how my actions affect others before I take them.',
    options: [
      {
        id: 'q14o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q14o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 2, driver: 1, harmonizer: 2 }
      },
      {
        id: 'q14o3',
        text: 'Neutral',
        value: 3,
        archetypeScores: { reflector: 3, connector: 3, driver: 2, harmonizer: 3 }
      },
      {
        id: 'q14o4',
        text: 'Agree',
        value: 4,
        archetypeScores: { reflector: 3, connector: 4, driver: 2, harmonizer: 4 }
      },
      {
        id: 'q14o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 4, connector: 5, driver: 3, harmonizer: 5 }
      }
    ]
  },
  {
    id: 'q15',
    text: 'I actively work on improving my emotional intelligence.',
    options: [
      {
        id: 'q15o1',
        text: 'Strongly Disagree',
        value: 1,
        archetypeScores: { reflector: 1, connector: 1, driver: 1, harmonizer: 1 }
      },
      {
        id: 'q15o2',
        text: 'Disagree',
        value: 2,
        archetypeScores: { reflector: 2, connector: 2, driver: 2, harmonizer: 2 }
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
        archetypeScores: { reflector: 4, connector: 4, driver: 4, harmonizer: 4 }
      },
      {
        id: 'q15o5',
        text: 'Strongly Agree',
        value: 5,
        archetypeScores: { reflector: 5, connector: 5, driver: 5, harmonizer: 5 }
      }
    ]
  }
];
