import { useCallback } from "react";
import { User, EQArchetype, CoachingMode } from "@/types";

export const useAuthActionWrappers = (user, profileCore, profileActions, authCore) => {
  // Wrapper functions to ensure type compatibility and memoized to prevent unnecessary recreations
  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    await profileCore.updateProfile(user?.id || "", data);
  }, [profileCore, user?.id]);

  const forceUpdateProfile = useCallback(async (data: any): Promise<boolean> => {
    return await profileCore.forceUpdateProfile(data);
  }, [profileCore]);

  // Create wrapper for setName to adapt the return type
  const setNameWrapper = useCallback(async (name: string): Promise<void> => {
    // Call the original function but discard the boolean return value to match the AuthContextType
    await profileActions.setName(name);
    // No return value needed since the type expects Promise<void>
  }, [profileActions]);

  // Create wrapper for setArchetype to adapt the return type
  const setArchetypeWrapper = useCallback(async (archetype: EQArchetype): Promise<void> => {
    // Call the original function but discard the boolean return value
    await profileActions.setArchetype(archetype);
  }, [profileActions]);

  // Create wrapper for setCoachingMode to adapt the return type
  const setCoachingModeWrapper = useCallback(async (mode: CoachingMode): Promise<void> => {
    // Call the original function but discard the boolean return value
    await profileActions.setCoachingMode(mode);
  }, [profileActions]);

  // Create wrapper for setOnboarded to adapt the return type
  const setOnboardedWrapper = useCallback(async (value: boolean): Promise<void> => {
    // Call the original function but discard the boolean return value
    await profileActions.setOnboarded(value);
  }, [profileActions]);
  
  // Create wrapper for resetPassword to adapt the return type
  const resetPasswordWrapper = async (email: string): Promise<boolean> => {
    return authCore.resetPassword(email);
  };
  
  return {
    updateProfile,
    forceUpdateProfile,
    setNameWrapper,
    setArchetypeWrapper,
    setCoachingModeWrapper,
    setOnboardedWrapper,
    resetPasswordWrapper
  };
};
