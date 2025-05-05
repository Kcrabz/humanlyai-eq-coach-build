
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { User, EQArchetype, CoachingMode, SubscriptionTier } from "@/types";
import useAuthState from "@/hooks/useAuthState";
import { useAuthSession } from "@/hooks/useAuthSession";
import useAuthActions from "@/hooks/useAuthActions";
import useAuthCore from "@/hooks/useAuthCore";
import { useAuthSignup } from "@/hooks/useAuthSignup";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useProfileState } from "@/hooks/useProfileState";

// Create the auth context with default values
export interface AuthContextType {
  user: any;
  isLoading: boolean;
  error: string | null;
  isAuthenticated?: boolean;
  
  // Re-exported from useAuthActions
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Re-exported from useProfileActions
  setName: (name: string) => Promise<void>;
  setArchetype?: (archetype: string) => Promise<void>;
  setCoachingMode?: (mode: string) => Promise<void>;
  setOnboarded?: (value: boolean) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  forceUpdateProfile: (data: any) => Promise<void>;
  setUser: (data: any) => void;
  
  // Additional functionality
  getUserSubscription: () => string;
  userHasArchetype: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for auth error handling
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const { user, setUser, isLoading, setIsLoading } = useAuthState();
  
  // Auth session - this is only needed during initialization
  const { session } = useAuthSession();
  
  // Auth core for login/logout
  const authCore = useAuthCore(setUser);
  
  // Auth signup
  const { signup } = useAuthSignup(setUser);
  
  // Auth actions
  const { logout: authLogout } = useAuthActions();
  
  // Profile hooks
  const profileCore = useProfileCore(setUser);
  const profileActions = useProfileActions(setUser);
  
  // Memoize derived state to prevent unnecessary recalculations
  const userHasArchetype = useMemo(() => !!user?.eq_archetype, [user?.eq_archetype]);
  const isAuthenticated = useMemo(() => !!user, [user]);
  
  // Get user subscription tier - memoized to prevent unnecessary recalculations
  const getUserSubscription = useCallback(() => {
    return user?.subscription_tier || 'free';
  }, [user?.subscription_tier]);
  
  // Reset password functionality stub - wrapped in useCallback
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    // Implement reset password functionality
    console.log("Reset password for:", email);
  }, []);

  // Wrapper functions to ensure type compatibility and memoized to prevent unnecessary recreations
  const updateProfile = useCallback(async (data: any): Promise<void> => {
    await profileCore.updateProfile(user?.id, data);
  }, [profileCore, user?.id]);

  const forceUpdateProfile = useCallback(async (data: any): Promise<void> => {
    await profileCore.forceUpdateProfile(data);
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
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    user,
    isLoading,
    error,
    isAuthenticated,
    login: authCore.login,
    logout: authLogout,
    signup,
    resetPassword,
    updateProfile,
    forceUpdateProfile,
    setName,
    setArchetype,
    setCoachingMode,
    setOnboarded,
    setUser,
    getUserSubscription,
    userHasArchetype
  }), [
    user, isLoading, error, isAuthenticated, authCore.login, authLogout, 
    signup, resetPassword, updateProfile, forceUpdateProfile, setName, 
    setArchetype, setCoachingMode, setOnboarded, setUser, getUserSubscription, 
    userHasArchetype
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
