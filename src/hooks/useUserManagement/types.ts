
import { User, SubscriptionTier } from "@/types";

export interface UserTableData extends Omit<User, 'email'> {
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface FilterState {
  type: string;
  value: string;
}
