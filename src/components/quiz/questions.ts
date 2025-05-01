
import { QuizQuestion } from './types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'When faced with a challenging situation at work or home, I typically:',
    options: [
      {
        id: 'q1a',
        text: 'Analyze my feelings and thoughts before responding',
        archetypeScores: { reflector: 4, observer: 2, regulator: 1, connector: 0, activator: 0 }
      },
      {
        id: 'q1b',
        text: 'Jump into action immediately to address the issue',
        archetypeScores: { activator: 4, connector: 1, regulator: 0, reflector: 0, observer: 0 }
      },
      {
        id: 'q1c',
        text: 'Stay calm and composed while evaluating options',
        archetypeScores: { regulator: 4, observer: 2, reflector: 1, activator: 0, connector: 0 }
      },
      {
        id: 'q1d',
        text: 'Reach out to others for support and perspective',
        archetypeScores: { connector: 4, reflector: 1, observer: 0, regulator: 0, activator: 0 }
      },
      {
        id: 'q1e',
        text: 'Step back to objectively evaluate all aspects of the situation',
        archetypeScores: { observer: 4, reflector: 2, regulator: 1, connector: 0, activator: 0 }
      }
    ]
  },
  {
    id: 'q2',
    text: 'In a group setting, I am most often recognized for my ability to:',
    options: [
      {
        id: 'q2a',
        text: 'Understand my own emotions and motivations clearly',
        archetypeScores: { reflector: 4, observer: 1, connector: 1, regulator: 0, activator: 0 }
      },
      {
        id: 'q2b',
        text: 'Inspire and energize others toward action',
        archetypeScores: { activator: 4, connector: 2, regulator: 0, reflector: 0, observer: 0 }
      },
      {
        id: 'q2c',
        text: 'Maintain composure under pressure',
        archetypeScores: { regulator: 4, observer: 2, reflector: 0, activator: 0, connector: 0 }
      },
      {
        id: 'q2d',
        text: 'Build meaningful relationships and resolve conflicts',
        archetypeScores: { connector: 4, reflector: 1, regulator: 1, observer: 0, activator: 0 }
      },
      {
        id: 'q2e',
        text: 'Provide logical analysis and thoughtful insights',
        archetypeScores: { observer: 4, regulator: 1, reflector: 1, connector: 0, activator: 0 }
      }
    ]
  },
  {
    id: 'q3',
    text: 'When receiving feedback, I:',
    options: [
      {
        id: 'q3a',
        text: 'Reflect deeply on how it relates to my self-perception',
        archetypeScores: { reflector: 4, observer: 2, connector: 0, regulator: 0, activator: 0 }
      },
      {
        id: 'q3b',
        text: 'Quickly determine how to use it to improve and move forward',
        archetypeScores: { activator: 4, observer: 1, regulator: 0, reflector: 0, connector: 0 }
      },
      {
        id: 'q3c',
        text: 'Process it calmly without letting it disrupt my emotional state',
        archetypeScores: { regulator: 4, observer: 1, reflector: 1, activator: 0, connector: 0 }
      },
      {
        id: 'q3d',
        text: 'Consider how it affects my relationships with others',
        archetypeScores: { connector: 4, reflector: 2, regulator: 0, observer: 0, activator: 0 }
      },
      {
        id: 'q3e',
        text: 'Analyze it objectively for validity and useful patterns',
        archetypeScores: { observer: 4, regulator: 2, reflector: 1, connector: 0, activator: 0 }
      }
    ]
  },
  {
    id: 'q4',
    text: 'When I feel a strong emotion:',
    options: [
      {
        id: 'q4a',
        text: 'I spend time understanding the root causes of my feelings',
        archetypeScores: { reflector: 4, observer: 2, regulator: 0, connector: 0, activator: 0 }
      },
      {
        id: 'q4b',
        text: 'I channel it into immediate productive action',
        archetypeScores: { activator: 4, regulator: 0, observer: 0, reflector: 0, connector: 0 }
      },
      {
        id: 'q4c',
        text: 'I manage it without letting it overwhelm me or my decisions',
        archetypeScores: { regulator: 4, observer: 1, reflector: 1, activator: 0, connector: 0 }
      },
      {
        id: 'q4d',
        text: 'I express it appropriately and connect with others who understand',
        archetypeScores: { connector: 4, reflector: 1, regulator: 0, observer: 0, activator: 0 }
      },
      {
        id: 'q4e',
        text: 'I analyze it logically before deciding how to respond',
        archetypeScores: { observer: 4, regulator: 2, reflector: 1, connector: 0, activator: 0 }
      }
    ]
  },
  {
    id: 'q5',
    text: 'My greatest emotional intelligence strength is:',
    options: [
      {
        id: 'q5a',
        text: 'Deep self-awareness and introspection',
        archetypeScores: { reflector: 4, observer: 1, connector: 0, regulator: 0, activator: 0 }
      },
      {
        id: 'q5b',
        text: 'Passion and drive to accomplish goals',
        archetypeScores: { activator: 4, connector: 0, regulator: 0, reflector: 0, observer: 0 }
      },
      {
        id: 'q5c',
        text: 'Emotional stability and stress management',
        archetypeScores: { regulator: 4, observer: 1, reflector: 0, activator: 0, connector: 0 }
      },
      {
        id: 'q5d',
        text: 'Building and maintaining meaningful relationships',
        archetypeScores: { connector: 4, reflector: 0, regulator: 0, observer: 0, activator: 0 }
      },
      {
        id: 'q5e',
        text: 'Objective analysis and pattern recognition',
        archetypeScores: { observer: 4, regulator: 1, reflector: 1, connector: 0, activator: 0 }
      }
    ]
  }
];
