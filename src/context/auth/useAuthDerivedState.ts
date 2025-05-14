
import { useState, useMemo, useCallback } from "react";
import { User } from "@/types";

export function useAuthDerivedState(session: any, profileLoaded: boolean) {
  // User state management
  const [user, setUser] = useState<User | null>(session?.user || null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  
  // Set the user profile from session data
  const setUserProfile = useCallback((profile: any) => {
    setUser(prev => ({
      ...(prev || {}),
      ...profile
    }) as User);
  }, []);
  
  // Derived state
  const userHasArchetype = useMemo(() => !!user?.eq_archetype, [user?.eq_archetype]);
  const isAuthenticated = useMemo(() => !!user, [user]);
  
  // Get user subscription tier - memoized to prevent unnecessary recalculations
  const getUserSubscription = useCallback(() => {
    return user?.subscription_tier || 'free';
  }, [user?.subscription_tier]);

  return {
    user,
    isLoadingUser,
    setUser,
    setUserProfile,
    userHasArchetype,
    isAuthenticated,
    getUserSubscription
  };
}
