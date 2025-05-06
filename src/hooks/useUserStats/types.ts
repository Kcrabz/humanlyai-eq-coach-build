
import { SubscriptionTier } from "@/types";

export interface UserStats {
  totalUsers: number;
  onboardedUsers: number;
  chatUsers: number;
  tierCounts: {
    free: number;
    basic: number;
    premium: number;
  };
  archetypeCounts: {
    [key: string]: number;
  };
}

export interface StatsCounts {
  totalUsers: number;
  onboardedUsers: number;
  chatUsers: number;
}

export interface TierCounts {
  free: number;
  basic: number;
  premium: number;
}

export interface ArchetypeCounts {
  [key: string]: number;
}
