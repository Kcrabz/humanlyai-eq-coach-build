
import { User, SubscriptionTier } from "@/types";

export interface UserTableData extends Omit<User, 'email'> {
  email: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  chat_time?: string;
  message_count?: number;
}

export interface FilterState {
  type: string;
  value: string;
}

export interface UserFilters {
  searchTerm: string;
  tierFilter: string;
  archetypeFilter: string;
}
