
import { SubscriptionTier, EQArchetype } from "@/types";

// Map for subscription tier to badge variant
export const TIER_BADGE_VARIANTS: Record<SubscriptionTier | string, string> = {
  "premium": "default",
  "basic": "outline",
  "trial": "secondary",
  "free": "secondary"
};

// Map for EQ archetype to badge/label variant
export const ARCHETYPE_VARIANTS: Record<EQArchetype | string, string> = {
  "reflector": "default",
  "activator": "secondary",
  "regulator": "outline",
  "connector": "destructive", 
  "observer": "primary",
  "Not set": "secondary"
};

export const getBadgeVariant = (tier?: string): string => {
  if (!tier) return TIER_BADGE_VARIANTS.free;
  return TIER_BADGE_VARIANTS[tier] || TIER_BADGE_VARIANTS.free;
};

export const getArchetypeVariant = (archetype?: string): string => {
  if (!archetype) return ARCHETYPE_VARIANTS["Not set"];
  return ARCHETYPE_VARIANTS[archetype] || ARCHETYPE_VARIANTS["Not set"];
};
