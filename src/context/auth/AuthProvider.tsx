
import React, { useState, useMemo, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";
import { useAuthSession } from "@/hooks/useAuthSession";
import useAuthActions from "@/hooks/useAuthActions";
import useAuthCore from "@/hooks/useAuthCore";
import { useAuthSignup } from "@/hooks/useAuthSignup";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useProfileState } from "@/hooks/useProfileState";
import { AuthContextType } from "@/types/auth";
import { useLoginTracking } from "@/hooks/useLoginTracking";
import { usePremiumFeatures } from "./usePremiumFeatures";
import { useAuthLoadingState } from "./useAuthLoadingState";
import { useAuthDerivedState } from "./useAuthDerivedState";
import { useAuthActionWrappers } from "./useAuthActionWrappers";
import { setAuthState, AuthState } from "@/services/authService";
import { useLocation } from "react-router-dom";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for auth error handling
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  
  // Auth session - optimized to reduce rerenders
  const { 
    session, 
    isLoading: isSessionLoading, 
    setIsLoading: setIsSessionLoading, 
    authEvent, 
    profileLoaded, 
    setProfileLoaded 
  } = useAuthSession();
  
  // Profile state with unified loading
  const { user, setUser } = useProfileState(session, isSessionLoading, setIsSessionLoading, setProfileLoaded);
  
  // Track login events - happening in background
  const isAuthenticated = !!user;
  useLoginTracking(isAuthenticated, user);
  
  // Handle loading state - simplified
  const { isLoading } = useAuthLoadingState(isSessionLoading, user, authEvent, profileLoaded);
  
  // Auth core for login/logout
  const authCore = useAuthCore(setUser);
  
  // Auth signup
  const { signup } = useAuthSignup(setUser);
  
  // Auth actions
  const { logout: authLogout } = useAuthActions();
  
  // Profile hooks
  const profileCore = useProfileCore(setUser);
  const profileActions = useProfileActions(setUser);
  
  // Premium features
  const { isPremiumMember, userStreakData, userAchievements } = usePremiumFeatures(user);
  
  // Derived state
  const { userHasArchetype, isAuthenticated: derivedIsAuthenticated, getUserSubscription } = 
    useAuthDerivedState(user);
  
  // Action wrappers
  const { 
    updateProfile, 
    forceUpdateProfile, 
    setNameWrapper, 
    setArchetypeWrapper, 
    setCoachingModeWrapper, 
    setOnboardedWrapper, 
    resetPasswordWrapper 
  } = useAuthActionWrappers(user, profileCore, profileActions, authCore);

  // Enhanced login function that sets auth state
  const enhancedLogin = useCallback(async (email: string, password: string) => {
    setAuthState(AuthState.SIGNING_IN);
    const success = await authCore.login(email, password);
    
    if (success) {
      setAuthState(AuthState.SIGNED_IN);
    } else {
      setAuthState(AuthState.SIGNED_OUT);
    }
    
    return success;
  }, [authCore]);
  
  // Enhanced signup function that sets auth state
  const enhancedSignup = useCallback(async (email: string, password: string, securityQuestionId?: string, securityAnswer?: string) => {
    setAuthState(AuthState.SIGNING_UP);
    const success = await signup(email, password, securityQuestionId, securityAnswer);
    
    if (success) {
      setAuthState(AuthState.SIGNED_UP);
    } else {
      setAuthState(AuthState.SIGNED_OUT);
    }
    
    return success;
  }, [signup]);
  
  // Enhanced logout that clears auth state
  const enhancedLogout = useCallback(async () => {
    const result = await authLogout();
    setAuthState(AuthState.SIGNED_OUT);
    return result;
  }, [authLogout]);
  
  // Track auth state changes
  useEffect(() => {
    if (authEvent === "SIGN_IN_COMPLETE" && user) {
      console.log("Detected sign in complete with user");
      setAuthState(AuthState.SIGNED_IN);
    } else if (authEvent === "SIGN_OUT_COMPLETE") {
      setAuthState(AuthState.SIGNED_OUT);
    }
  }, [authEvent, user]);
  
  // Track onboarding state
  useEffect(() => {
    if (user) {
      if (user.onboarded) {
        setAuthState(AuthState.ONBOARDED);
      } else {
        setAuthState(AuthState.NEEDS_ONBOARDING);
      }
    }
  }, [user?.onboarded]);
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    error,
    isAuthenticated,
    authEvent: authEvent as "SIGN_IN_COMPLETE" | "RESTORED_SESSION" | "SIGN_OUT_COMPLETE" | null,
    profileLoaded,
    login: enhancedLogin,
    logout: enhancedLogout,
    signup: enhancedSignup,
    resetPassword: resetPasswordWrapper,
    updateProfile,
    forceUpdateProfile,
    setName: setNameWrapper,
    setArchetype: setArchetypeWrapper,
    setCoachingMode: setCoachingModeWrapper,
    setOnboarded: setOnboardedWrapper,
    setUser,
    getUserSubscription,
    userHasArchetype,
    // Premium member features
    isPremiumMember,
    userStreakData,
    userAchievements
  }), [
    user, isLoading, error, isAuthenticated, authEvent, profileLoaded,
    enhancedLogin, enhancedLogout, enhancedSignup, resetPasswordWrapper,
    updateProfile, forceUpdateProfile, setNameWrapper, setArchetypeWrapper,
    setCoachingModeWrapper, setOnboardedWrapper, setUser, getUserSubscription,
    userHasArchetype, isPremiumMember, userStreakData, userAchievements
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
