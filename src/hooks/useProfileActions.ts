
import { EQArchetype, CoachingMode } from "@/types";
import { useAuthActions } from "./useAuthActions";

export const useProfileActions = (setUser: React.Dispatch<React.SetStateAction<any>>) => {
  const { updateProfile } = useAuthActions(setUser);

  const setName = (name: string) => {
    updateProfile({ name });
  };

  const setArchetype = (archetype: EQArchetype) => {
    updateProfile({ eq_archetype: archetype });
  };

  const setCoachingMode = (mode: CoachingMode) => {
    updateProfile({ coaching_mode: mode });
  };

  const setOnboarded = (value: boolean) => {
    updateProfile({ onboarded: value });
  };

  return {
    setName,
    setArchetype,
    setCoachingMode,
    setOnboarded
  };
};
