
import { SubscriptionTier, EQArchetype } from "@/types";

export interface LastLoginData {
  relative: string;
  timestamp: string;
}

export interface UserTableData {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  onboarded: boolean;
  eq_archetype?: EQArchetype;
  last_login?: string | LastLoginData; // Updated to support the new structure
  chat_time?: string | null;
  message_count: number;
}

export interface FilterState {
  type: string;
  value: string;
}

// Add missing UserFilters interface
export interface UserFilters {
  searchTerm: string;
  tierFilter: string;
  archetypeFilter: string;
}
