
import { useMemo, useCallback } from "react";
import { User } from "@/types";

export function useAuthDerivedState(user: User | null) {
  // Memoize derived state to prevent unnecessary recalculations
  const userHasArchetype = useMemo(() => !!user?.eq_archetype, [user?.eq_archetype]);
  const isAuthenticated = useMemo(() => !!user, [user]);
  
  // Get user subscription tier - memoized to prevent unnecessary recalculations
  const getUserSubscription = useCallback(() => {
    return user?.subscription_tier || 'free';
  }, [user?.subscription_tier]);

  return {
    userHasArchetype,
    isAuthenticated,
    getUserSubscription
  };
}
