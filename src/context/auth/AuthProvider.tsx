
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
import { isRunningAsPWA, markLoginSuccess } from "@/utils/loginRedirectUtils";
import { useLocation } from "react-router-dom";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for auth error handling - optimized with useCallback
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
  
  // Track login events - memoized
  const isAuthenticated = !!user;
  useLoginTracking(isAuthenticated, user);
  
  // Handle loading state
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
  const { userHasArchetype, isAuthenticated: derivedIsAuthenticated, getUserSubscription } = useAuthDerivedState(user);
  
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
  
  // Optimized session and login success handling
  const handleSessionRestore = useCallback(() => {
    if ((authEvent === "RESTORED_SESSION" || authEvent === "SIGN_IN_COMPLETE") && user && profileLoaded) {
      markLoginSuccess();
    }
  }, [authEvent, user, profileLoaded]);
  
  useEffect(() => {
    handleSessionRestore();
  }, [handleSessionRestore]);
  
  // Optimized PWA navigation handling
  useEffect(() => {
    if (isAuthenticated && isRunningAsPWA()) {
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        sessionStorage.setItem('pwa_last_path', location.pathname);
      }
      
      if (user?.onboarded && (location.pathname === '/login' || location.pathname === '/signup')) {
        const lastPath = sessionStorage.getItem('pwa_last_path') || '/dashboard';
        sessionStorage.setItem('pwa_desired_path', lastPath);
      }
    }
  }, [isAuthenticated, user, location.pathname]);
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    error,
    isAuthenticated,
    authEvent: authEvent as "SIGN_IN_COMPLETE" | "RESTORED_SESSION" | "SIGN_OUT_COMPLETE" | null,
    profileLoaded,
    login: authCore.login,
    logout: authLogout,
    signup,
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
    user, isLoading, error, authCore.login, authLogout, 
    signup, resetPasswordWrapper, updateProfile, forceUpdateProfile,
    setNameWrapper, setArchetypeWrapper, setCoachingModeWrapper, 
    setOnboardedWrapper, setUser, authEvent, profileLoaded, 
    isPremiumMember, userStreakData, userAchievements,
    isAuthenticated, getUserSubscription, userHasArchetype
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
