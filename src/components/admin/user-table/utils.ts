
import { SubscriptionTier, EQArchetype } from "@/types";

// Map for subscription tier to badge variant
export const TIER_BADGE_VARIANTS: Record<SubscriptionTier | string, "default" | "outline" | "secondary" | "destructive"> = {
  "premium": "default",
  "basic": "outline",
  "trial": "secondary",
  "free": "secondary"
};

// Map for EQ archetype to badge/label variant
export const ARCHETYPE_VARIANTS: Record<EQArchetype | string, "default" | "outline" | "secondary" | "destructive"> = {
  "reflector": "default",
  "activator": "secondary",
  "regulator": "outline",
  "connector": "destructive", 
  "observer": "secondary", // Changed from "primary" to "secondary" as "primary" is not a valid variant
  "Not set": "secondary"
};

export const getBadgeVariant = (tier?: string): "default" | "outline" | "secondary" | "destructive" => {
  if (!tier) return TIER_BADGE_VARIANTS.free;
  return TIER_BADGE_VARIANTS[tier] || TIER_BADGE_VARIANTS.free;
};

export const getArchetypeVariant = (archetype?: string): "default" | "outline" | "secondary" | "destructive" => {
  if (!archetype) return ARCHETYPE_VARIANTS["Not set"];
  return ARCHETYPE_VARIANTS[archetype] || ARCHETYPE_VARIANTS["Not set"];
};
