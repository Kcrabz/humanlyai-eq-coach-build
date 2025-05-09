

export interface FilterState {
  type: string;
  value: string;
}

export interface UserTableData {
  id: string;
  email: string;
  name?: string;
  subscription_tier?: string;
  eq_archetype?: string | "Not set";
  onboarded?: boolean;
  last_login?: string | { timestamp: string; relative: string };
  chat_time?: string;
  message_count?: number;
  tokenUsage?: number;
  tokenUsageLimit?: number;
}

export interface UserFilters {
  searchTerm: string;
  tierFilter: string;
  archetypeFilter: string;
  onboardedFilter?: string;
}
