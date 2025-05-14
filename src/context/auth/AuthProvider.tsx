
import { ReactNode, useEffect } from "react";
import AuthContext from "./AuthContext";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthActionWrappers } from "./useAuthActionWrappers";
import { useAuthDerivedState } from "./useAuthDerivedState";
import { useAuthLoadingState } from "./useAuthLoadingState";
import { usePremiumFeatures } from "./usePremiumFeatures";
import { useLoginTracking } from "./useLoginTracking";

/**
 * AuthProvider - Enhanced with mobile/PWA detection
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Core auth state management
  const {
    session,
    isLoading: isSessionLoading,
    authEvent,
    profileLoaded,
    initialized,
    loginTimestamp,
    sessionReady,
    isPwaMode,
    isMobileDevice
  } = useAuthSession();

  // User state management
  const {
    user,
    isLoadingUser,
    setUser,
    setUserProfile,
  } = useAuthDerivedState(session, profileLoaded);

  // Auth actions with error handling wrappers
  const {
    login,
    logout,
    signup,
    resetPassword,
    updatePassword,
    updateUserProfile
  } = useAuthActionWrappers(setUser, setUserProfile);

  // Consolidated loading state
  const { isLoading, setIsLoading } = useAuthLoadingState(isSessionLoading, isLoadingUser);

  // Track login events for UX optimization
  const { loginEvent } = useLoginTracking(authEvent);

  // Process premium features and capabilities
  const { hasPremiumFeatures } = usePremiumFeatures(user?.subscription_tier);

  // Special logging for PWA/mobile
  useEffect(() => {
    if (isPwaMode || isMobileDevice) {
      console.log("AuthProvider: Special environment detected", {
        isPwa: isPwaMode,
        isMobile: isMobileDevice,
        isAuthenticated: !!user,
        userId: user?.id,
        authEvent,
        profileLoaded
      });
    }
  }, [isPwaMode, isMobileDevice, user, authEvent, profileLoaded]);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        resetPassword,
        updatePassword,
        updateUserProfile,
        authEvent,
        loginEvent,
        profileLoaded,
        initialized,
        loginTimestamp,
        hasPremiumFeatures,
        sessionReady,
        isPwaMode,
        isMobileDevice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
