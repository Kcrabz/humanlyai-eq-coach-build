
export type SubscriptionTier = "free" | "basic" | "premium" | "trial";

export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  eq_archetype?: EQArchetype | "Not set";
  coaching_mode?: CoachingMode;
  subscription_tier: SubscriptionTier;
  onboarded: boolean;
}

export type EQArchetype = "reflector" | "activator" | "regulator" | "connector" | "observer";

export type CoachingMode = "normal" | "tough";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

export interface ArchetypeInfo {
  type: EQArchetype;
  title: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  icon: string;
}

export interface CoachingModeInfo {
  type: CoachingMode;
  title: string;
  description: string;
  example: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  tier: SubscriptionTier;
  popular?: boolean;
}
