
import { useCallback } from "react";
import { User, EQArchetype, CoachingMode } from "@/types";

export const useAuthActionWrappers = (setUser: any, profileCore: any, profileActions: any, authCore: any) => {
  // Wrapper functions to ensure type compatibility and memoized to prevent unnecessary recreations
  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    if (authCore.user?.id) {
      await profileCore.updateProfile(authCore.user.id, data);
    }
  }, [profileCore, authCore.user?.id]);

  const forceUpdateProfile = useCallback(async (data: any): Promise<boolean> => {
    return await profileCore.forceUpdateProfile(data);
  }, [profileCore]);

  // Create wrapper for setName to adapt the return type
  const setName = useCallback(async (name: string): Promise<void> => {
    // Call the original function but discard the boolean return value to match the AuthContextType
    await profileActions.setName(name);
    // No return value needed since the type expects Promise<void>
  }, [profileActions]);

  // Create wrapper for setArchetype to adapt the return type
  const setArchetype = useCallback(async (archetype: EQArchetype): Promise<void> => {
    // Call the original function but discard the boolean return value
    await profileActions.setArchetype(archetype);
  }, [profileActions]);

  // Create wrapper for setCoachingMode to adapt the return type
  const setCoachingMode = useCallback(async (mode: CoachingMode): Promise<void> => {
    // Call the original function but discard the boolean return value
    await profileActions.setCoachingMode(mode);
  }, [profileActions]);

  // Create wrapper for setOnboarded to adapt the return type
  const setOnboarded = useCallback(async (value: boolean): Promise<void> => {
    // Call the original function but discard the boolean return value
    await profileActions.setOnboarded(value);
  }, [profileActions]);
  
  // Create wrapper for resetPassword to adapt the return type
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    return await authCore.resetPassword(email);
  }, [authCore]);
  
  return {
    login: authCore.login,
    logout: authCore.logout,
    signup: authCore.signup,
    resetPassword,
    updatePassword: authCore.updatePassword,
    updateUserProfile: authCore.updateUserProfile,
    updateProfile,
    forceUpdateProfile,
    setName,
    setArchetype,
    setCoachingMode,
    setOnboarded,
    setUser
  };
};
