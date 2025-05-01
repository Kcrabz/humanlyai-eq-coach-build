
import { ArchetypeInfo, CoachingModeInfo, SubscriptionPlan } from "@/types";

export const ARCHETYPES: Record<string, ArchetypeInfo> = {
  reflector: {
    type: "reflector",
    title: "The Reflector",
    description: "You're deeply self-aware and often in tune with your inner world. You're thoughtful, reflective, and naturally introspective.",
    strengths: ["Self-awareness", "Empathy", "Thoughtfulness"],
    growthAreas: ["Taking action", "Decision-making", "Self-compassion"],
    icon: "🧠"
  },
  activator: {
    type: "activator",
    title: "The Driver",
    description: "You're motivated, goal-driven, and resilient. You thrive on results and have a strong inner fire.",
    strengths: ["Motivation", "Goal-setting", "Energy"],
    growthAreas: ["Patience", "Reflection", "Listening skills"],
    icon: "⚡"
  },
  regulator: {
    type: "regulator",
    title: "The Harmonizer",
    description: "You have a well-rounded EQ with solid skills across awareness, empathy, and regulation. You're balanced but may seek mastery in specific areas.",
    strengths: ["Emotional stability", "Stress management", "Consistency"],
    growthAreas: ["Emotional expression", "Vulnerability", "Spontaneity"],
    icon: "⚖️"
  },
  connector: {
    type: "connector",
    title: "The Connector",
    description: "You're highly empathetic and naturally attuned to others' emotions. People trust you and feel heard in your presence.",
    strengths: ["Social awareness", "Relationship building", "Communication"],
    growthAreas: ["Setting boundaries", "Independence", "Self-reflection"],
    icon: "🤝"
  },
  observer: {
    type: "observer",
    title: "The Observer",
    description: "You're analytical and perceptive, noticing patterns others miss. Your strength is objectivity and clear insight.",
    strengths: ["Analytical thinking", "Objectivity", "Pattern recognition"],
    growthAreas: ["Emotional engagement", "Self-expression", "Intuitive decisions"],
    icon: "👁️"
  }
};

export const COACHING_MODES: Record<string, CoachingModeInfo> = {
  normal: {
    type: "normal",
    title: "Supportive Coach",
    description: "Friendly, reflective, and encouraging guidance that helps you grow at your own pace.",
    example: "I notice you're facing this challenge. Let's explore some ways you might approach it that align with your values."
  },
  "tough love": {
    type: "tough love",
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
