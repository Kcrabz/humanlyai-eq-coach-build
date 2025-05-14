
import { ReactNode, useEffect } from "react";
import AuthContext from "./AuthContext";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthActionWrappers } from "./useAuthActionWrappers";
import { useAuthDerivedState } from "./useAuthDerivedState";
import { useAuthLoadingState } from "./useAuthLoadingState";
import { usePremiumFeatures } from "./usePremiumFeatures";
import { useLoginTracking } from "./useLoginTracking";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileActions } from "@/hooks/useProfileActions";
import useAuthCore from "@/hooks/useAuthCore"; // Changed from named import to default import

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
    userHasArchetype,
    getUserSubscription
  } = useAuthDerivedState(session, profileLoaded);

  // Core profile functionality
  const profileCore = useProfileCore(setUser);
  
  // Profile action handlers
  const profileActions = useProfileActions(setUser);
  
  // Auth core functionality
  const authCore = useAuthCore(); // Using the default import

  // Auth actions with error handling wrappers
  const {
    login,
    logout,
    signup,
    resetPassword,
    updatePassword,
    updateUserProfile,
    updateProfile,
    forceUpdateProfile,
    setName,
    setArchetype,
    setCoachingMode,
    setOnboarded
  } = useAuthActionWrappers(setUser, profileCore, profileActions, authCore);

  // Consolidated loading state
  const { isLoading } = useAuthLoadingState(isSessionLoading, isLoadingUser);

  // Track login events for UX optimization
  const { loginEvent } = useLoginTracking(authEvent);

  // Process premium features and capabilities
  const { isPremiumMember, hasPremiumFeatures, userStreakData, userAchievements } = usePremiumFeatures(user);

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
        updateProfile,
        forceUpdateProfile,
        authEvent,
        loginEvent,
        profileLoaded,
        initialized,
        loginTimestamp,
        hasPremiumFeatures,
        sessionReady,
        isPwaMode,
        isMobileDevice,
        setName,
        setArchetype,
        setCoachingMode,
        setOnboarded,
        setUser,
        isPremiumMember,
        userStreakData,
        userAchievements,
        getUserSubscription,
        userHasArchetype
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
