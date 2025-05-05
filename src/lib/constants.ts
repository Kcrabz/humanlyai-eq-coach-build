
import { ArchetypeInfo, CoachingModeInfo, SubscriptionPlan } from "@/types";

export const ARCHETYPES = {
  reflector: {
    type: 'reflector',
    title: 'Reflector',
    icon: '🔮',
    description: 'You\'re highly self-aware and introspective, with a deep understanding of your inner emotional landscape.',
    strengths: ['Self-awareness', 'Thoughtful decision making', 'Emotional clarity'],
    growthAreas: ['Taking action', 'External focus', 'Less overthinking'],
    microPractice: 'Choose one small decision today and make it within 60 seconds, without analysis.'
  },
  activator: {
    type: 'activator',
    title: 'Activator',
    icon: '⚡️',
    description: 'You\'re action-oriented and decisive, moving quickly from thought to implementation.',
    strengths: ['Decision making', 'Taking initiative', 'Driving results'],
    growthAreas: ['Pausing before reacting', 'Deeper reflection', 'Emotional awareness'],
    microPractice: 'Before reacting to a situation today, take three deep breaths and name your emotion.'
  },
  connector: {
    type: 'connector',
    title: 'Connector',
    icon: '🤝',
    description: 'You\'re naturally empathetic and relationally focused, skilled at building and nurturing connections.',
    strengths: ['Empathy', 'Relationship building', 'Supporting others'],
    growthAreas: ['Setting boundaries', 'Self-prioritization', 'Direct communication'],
    microPractice: 'Practice saying "no" to one small request today without explaining yourself.'
  },
  regulator: {
    type: 'regulator',
    title: 'Regulator',
    icon: '🧘‍♂️',
    description: 'You\'re skilled at emotional regulation, maintaining balance and calm even in challenging situations.',
    strengths: ['Emotional stability', 'Stress management', 'Level-headed thinking'],
    growthAreas: ['Emotional expression', 'Showing vulnerability', 'Embracing change'],
    microPractice: 'Share one genuine feeling with someone today that you would normally keep to yourself.'
  },
  observer: {
    type: 'observer',
    title: 'Observer',
    icon: '👁️',
    description: 'You\'re analytically minded and perceptive, noticing patterns and details others might miss.',
    strengths: ['Analytical thinking', 'Objectivity', 'Pattern recognition'],
    growthAreas: ['Emotional engagement', 'Intuitive decisions', 'Vulnerability'],
    microPractice: 'Make one decision today based purely on how you feel, not logic.'
  }
};

export const COACHING_MODES: Record<string, CoachingModeInfo> = {
  normal: {
    type: "normal",
    title: "Supportive Coach",
    description: "Friendly, reflective, and encouraging guidance that helps you grow at your own pace.",
    example: "I notice you're facing this challenge. Let's explore some ways you might approach it that align with your values."
  },
  tough: {
    type: "tough",
    title: "Tough Love Coach",
    description: "Direct, honest feedback that challenges you to push beyond your comfort zone.",
    example: "You've been avoiding this issue for weeks. It's time to face it head-on - what's one action you'll take today?"
  }
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free-trial",
    name: "Free Trial",
    description: "Experience HumanlyAI for 1 day",
    price: 0,
    features: [
      "Full coach access for 24 hours",
      "Try all premium features",
      "No credit card required"
    ],
    tier: "free"
  },
  {
    id: "basic",
    name: "Basic",
    description: "Chat with your EQ coach",
    price: 10,
    features: [
      "Unlimited coach conversations",
      "Personalized by archetype & mode",
      "Basic EQ challenges"
    ],
    tier: "basic"
  },
  {
    id: "premium",
    name: "Premium",
    description: "Full growth & tracking system",
    price: 20,
    features: [
      "Everything in Basic",
      "Conversation memory",
      "Progress tracking",
      "Advanced EQ challenges"
    ],
    tier: "premium",
    popular: true
  }
];

// The old system prompt is now replaced by the edge function implementation
// This constant remains for backward compatibility
export const SYSTEM_PROMPT = "See KAI_SYSTEM_PROMPT in supabase/functions/chat-completion/index.ts";
