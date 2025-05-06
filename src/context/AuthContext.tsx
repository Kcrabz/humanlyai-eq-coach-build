
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { User, EQArchetype, CoachingMode, SubscriptionTier } from "@/types";
import { useAuthSession } from "@/hooks/useAuthSession";
import useAuthActions from "@/hooks/useAuthActions";
import useAuthCore from "@/hooks/useAuthCore";
import { useAuthSignup } from "@/hooks/useAuthSignup";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useProfileState } from "@/hooks/useProfileState";
import { UserStreakData, UserAchievement, AuthContextType } from "@/types/auth";
import { fetchUserStreakData, fetchUserAchievements } from "@/services/premiumUserService";

// Create the auth context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for auth error handling
  const [error, setError] = useState<string | null>(null);
  
  // Auth session
  const { session, isLoading: isSessionLoading, setIsLoading: setIsSessionLoading, authEvent, profileLoaded, setProfileLoaded } = useAuthSession();
  
  // Profile state with unified loading
  const { user, setUser } = useProfileState(session, isSessionLoading, setIsSessionLoading, setProfileLoaded);
  
  // Premium feature states
  const [userStreakData, setUserStreakData] = useState<UserStreakData | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[] | null>(null);
  
  // Consolidated loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Update loading state when both session and profile are ready
  useEffect(() => {
    console.log("AuthContext loading state updated:", { 
      isSessionLoading, 
      user: user?.id,
      hasSession: !!session,
      authEvent,
      profileLoaded
    });
    
    // Only mark as loaded when session loading is complete
    if (!isSessionLoading) {
      console.log("Auth state fully loaded, setting isLoading to false");
      setIsLoading(false);
    }
  }, [isSessionLoading, user, session, authEvent, profileLoaded]);
  
  // Auth core for login/logout
  const authCore = useAuthCore(setUser);
  
  // Auth signup
  const { signup } = useAuthSignup(setUser);
  
  // Auth actions
  const { logout: authLogout } = useAuthActions();
  
  // Profile hooks
  const profileCore = useProfileCore(setUser);
  const profileActions = useProfileActions(setUser);
  
  // Determine if user is a premium member
  const isPremiumMember = useMemo(() => 
    user?.subscription_tier === 'premium', 
  [user?.subscription_tier]);

  // Fetch premium user data when user logs in and is premium
  useEffect(() => {
    const fetchPremiumUserData = async () => {
      if (user?.id && isPremiumMember) {
        try {
          // Fetch user streak data using our service function
          const streakData = await fetchUserStreakData(user.id);
          if (streakData) {
            setUserStreakData(streakData);
          }
          
          // Fetch user achievements using our service function
          const achievementData = await fetchUserAchievements(user.id);
          if (achievementData) {
            setUserAchievements(achievementData);
          }
        } catch (error) {
          console.error("Error fetching premium user data:", error);
        }
      } else {
        // Reset premium data if user is not premium or logged out
        setUserStreakData(null);
        setUserAchievements(null);
      }
    };
    
    fetchPremiumUserData();
  }, [user?.id, isPremiumMember]);
  
  // Memoize derived state to prevent unnecessary recalculations
  const userHasArchetype = useMemo(() => !!user?.eq_archetype, [user?.eq_archetype]);
  const isAuthenticated = useMemo(() => !!user, [user]);
  
  // Get user subscription tier - memoized to prevent unnecessary recalculations
  const getUserSubscription = useCallback(() => {
    return user?.subscription_tier || 'free';
  }, [user?.subscription_tier]);

  // Wrapper functions to ensure type compatibility and memoized to prevent unnecessary recreations
  const updateProfile = useCallback(async (data: any): Promise<void> => {
    await profileCore.updateProfile(user?.id, data);
  }, [profileCore, user?.id]);

  const forceUpdateProfile = useCallback(async (data: any): Promise<boolean> => {
    return await profileCore.forceUpdateProfile(data);
  }, [profileCore]);

  const setName = useCallback(async (name: string): Promise<void> => {
    await profileActions.setName(name);
  }, [profileActions]);

  const setArchetype = useCallback(async (archetype: string): Promise<void> => {
    await profileActions.setArchetype(archetype as EQArchetype);
  }, [profileActions]);

  const setCoachingMode = useCallback(async (mode: string): Promise<void> => {
    await profileActions.setCoachingMode(mode as CoachingMode);
  }, [profileActions]);

  const setOnboarded = useCallback(async (value: boolean): Promise<void> => {
    await profileActions.setOnboarded(value);
  }, [profileActions]);
  
  // Create wrapper for resetPassword to adapt the return type
  const resetPasswordWrapper = useCallback(async (email: string): Promise<void> => {
    // Call the original function but discard the boolean return value to match the AuthContextType
    await authCore.resetPassword(email);
    // No return value needed since the type expects Promise<void>
  }, [authCore]);
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    authEvent: authEvent as "SIGN_IN_COMPLETE" | "RESTORED_SESSION" | "SIGN_OUT_COMPLETE" | null,
    profileLoaded,
    login: authCore.login,
    logout: authLogout,
    signup,
    resetPassword: resetPasswordWrapper,
    updateProfile: profileCore.updateProfile,
    forceUpdateProfile: profileCore.forceUpdateProfile,
    setName: profileActions.setName,
    setArchetype: profileActions.setArchetype,
    setCoachingMode: profileActions.setCoachingMode,
    setOnboarded: profileActions.setOnboarded,
    setUser,
    getUserSubscription: () => user?.subscription_tier || 'free',
    userHasArchetype: !!user?.eq_archetype,
    // Premium member features
    isPremiumMember,
    userStreakData,
    userAchievements
  }), [
    user, isLoading, error, authCore.login, authLogout, 
    signup, resetPasswordWrapper, profileCore.updateProfile, profileCore.forceUpdateProfile,
    profileActions.setName, profileActions.setArchetype, profileActions.setCoachingMode, 
    profileActions.setOnboarded, setUser, authEvent, profileLoaded, 
    isPremiumMember, userStreakData, userAchievements
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
