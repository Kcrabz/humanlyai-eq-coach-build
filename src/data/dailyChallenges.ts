
import { EQArchetype } from "@/types";

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: "self-awareness" | "emotional-regulation" | "social-skills" | "empathy" | "motivation";
  archetypes?: EQArchetype[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "self-awareness-1",
    title: "Emotion Journal",
    description: "Write down three emotions you felt today and why",
    prompt: "I want to explore my emotions today. Can you help me identify and understand them better?",
    category: "self-awareness",
    archetypes: ["reflector", "observer"],
    difficulty: "beginner"
  },
  {
    id: "self-awareness-2",
    title: "Mindful Reflection",
    description: "Take 5 minutes to reflect on a recent interaction",
    prompt: "I'd like to reflect on a recent conversation I had. Can you guide me through a mindful reflection?",
    category: "self-awareness",
    archetypes: ["reflector", "observer"],
    difficulty: "beginner"
  },
  {
    id: "self-awareness-3",
    title: "Identify Your Triggers",
    description: "Recognize what situations trigger strong emotions",
    prompt: "I want to identify what triggers my strong emotional reactions. How can I become more aware of them?",
    category: "self-awareness",
    archetypes: ["reflector", "regulator"],
    difficulty: "intermediate"
  },
  {
    id: "emotional-regulation-1",
    title: "Deep Breathing Exercise",
    description: "Practice 4-7-8 breathing technique for 2 minutes",
    prompt: "Can you guide me through a deep breathing exercise to help me stay calm?",
    category: "emotional-regulation",
    archetypes: ["regulator"],
    difficulty: "beginner"
  },
  {
    id: "emotional-regulation-2",
    title: "Reframe Negative Thoughts",
    description: "Challenge and reframe one negative thought pattern",
    prompt: "I have some negative thoughts I'd like to reframe. Can you help me see them differently?",
    category: "emotional-regulation",
    archetypes: ["regulator", "reflector"],
    difficulty: "intermediate"
  },
  {
    id: "emotional-regulation-3",
    title: "Stress Response Plan",
    description: "Create a step-by-step plan for handling stressful situations",
    prompt: "I want to create a personal plan for managing stress. What steps should I include?",
    category: "emotional-regulation",
    archetypes: ["regulator", "activator"],
    difficulty: "intermediate"
  },
  {
    id: "social-skills-1",
    title: "Active Listening Practice",
    description: "Practice active listening in your next conversation",
    prompt: "How can I improve my active listening skills in conversations?",
    category: "social-skills",
    archetypes: ["connector"],
    difficulty: "beginner"
  },
  {
    id: "social-skills-2",
    title: "Assertive Communication",
    description: "Practice expressing your needs respectfully",
    prompt: "I want to be more assertive without being aggressive. How can I communicate my needs better?",
    category: "social-skills",
    archetypes: ["connector", "activator"],
    difficulty: "intermediate"
  },
  {
    id: "social-skills-3",
    title: "Conflict Resolution Strategy",
    description: "Develop a personal approach to resolving disagreements",
    prompt: "I want to get better at resolving conflicts. What strategies would work for me?",
    category: "social-skills",
    archetypes: ["connector", "regulator"],
    difficulty: "advanced"
  },
  {
    id: "empathy-1",
    title: "Perspective Taking",
    description: "Consider a situation from someone else's viewpoint",
    prompt: "How can I better understand other people's perspectives and show more empathy?",
    category: "empathy",
    archetypes: ["connector", "observer"],
    difficulty: "beginner"
  },
  {
    id: "empathy-2",
    title: "Compassionate Response",
    description: "Practice responding with compassion to someone in need",
    prompt: "I want to respond more compassionately when others share their struggles. How can I do this?",
    category: "empathy",
    archetypes: ["connector", "reflector"],
    difficulty: "intermediate"
  },
  {
    id: "empathy-3",
    title: "Beyond Words",
    description: "Practice reading non-verbal cues in conversations",
    prompt: "How can I get better at reading body language and non-verbal cues?",
    category: "empathy",
    archetypes: ["observer", "connector"],
    difficulty: "intermediate"
  },
  {
    id: "motivation-1",
    title: "Value Alignment",
    description: "Connect one daily activity to your core values",
    prompt: "I want to align my daily activities with my core values. How can I start?",
    category: "motivation",
    archetypes: ["activator", "reflector"],
    difficulty: "beginner"
  },
  {
    id: "motivation-2",
    title: "Goal Visualization",
    description: "Visualize achieving an important personal goal",
    prompt: "Can you guide me through visualizing the achievement of one of my important goals?",
    category: "motivation",
    archetypes: ["activator"],
    difficulty: "intermediate"
  },
  {
    id: "motivation-3",
    title: "Obstacle Planning",
    description: "Identify and plan for obstacles to your goals",
    prompt: "I want to anticipate obstacles to my goals and plan how to overcome them. Can you help me?",
    category: "motivation",
    archetypes: ["activator", "regulator"],
    difficulty: "intermediate"
  },
  {
    id: "self-awareness-4",
    title: "Strength Spotting",
    description: "Identify three of your personal strengths and how you use them",
    prompt: "I'd like to identify and better utilize my personal strengths. Can you help me?",
    category: "self-awareness",
    archetypes: ["reflector", "observer", "activator"],
    difficulty: "beginner"
  },
  {
    id: "emotional-regulation-4",
    title: "Emotional Weather Report",
    description: "Track your emotional state throughout the day",
    prompt: "I want to track my emotions throughout the day. What's the best way to do this?",
    category: "emotional-regulation",
    archetypes: ["regulator", "reflector"],
    difficulty: "beginner"
  },
  {
    id: "social-skills-4",
    title: "Conversation Starter",
    description: "Practice three new ways to initiate meaningful conversations",
    prompt: "What are some good conversation starters for meaningful interactions?",
    category: "social-skills",
    archetypes: ["connector", "activator"],
    difficulty: "beginner"
  },
  {
    id: "empathy-4",
    title: "Empathic Curiosity",
    description: "Ask open questions to better understand someone's experience",
    prompt: "How can I ask better questions to understand other people's experiences?",
    category: "empathy",
    archetypes: ["connector", "observer"],
    difficulty: "intermediate"
  },
  {
    id: "motivation-4",
    title: "Progress Celebration",
    description: "Acknowledge and celebrate a recent achievement",
    prompt: "How can I better celebrate my progress and achievements, even small ones?",
    category: "motivation",
    archetypes: ["activator", "reflector"],
    difficulty: "beginner"
  }
];
