
import { EQArchetype, CoachingMode } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfileCore } from "./useProfileCore";

export const useProfileActions = (setUser: React.Dispatch<React.SetStateAction<any>>) => {
  const { updateProfile: updateUserProfile, forceUpdateProfile } = useProfileCore(setUser);

  const setFirstName = async (firstName: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set first name: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const success = await updateUserProfile(user.id, { first_name: firstName });
      if (success) {
        toast.success("First name updated successfully");
      }
      return success;
    } catch (error) {
      console.error("Error in setFirstName:", error);
      return false;
    }
  };

  const setLastName = async (lastName: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set last name: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const success = await updateUserProfile(user.id, { last_name: lastName });
      if (success) {
        toast.success("Last name updated successfully");
      }
      return success;
    } catch (error) {
      console.error("Error in setLastName:", error);
      return false;
    }
  };

  const setName = async (name: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set name: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const success = await updateUserProfile(user.id, { name });
      if (success) {
        toast.success("Name updated successfully");
      }
      return success;
    } catch (error) {
      console.error("Error in setName:", error);
      return false;
    }
  };

  const setArchetype = async (archetype: EQArchetype): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set archetype: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const success = await updateUserProfile(user.id, { eq_archetype: archetype });
      if (success) {
        toast.success("Archetype updated successfully");
      }
      return success;
    } catch (error) {
      console.error("Error in setArchetype:", error);
      return false;
    }
  };

  const setCoachingMode = async (mode: CoachingMode): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set coaching mode: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const success = await updateUserProfile(user.id, { coaching_mode: mode });
      if (success) {
        toast.success("Coaching mode updated successfully");
      }
      return success;
    } catch (error) {
      console.error("Error in setCoachingMode:", error);
      return false;
    }
  };

  const setOnboarded = async (value: boolean): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Cannot set onboarded: No authenticated user");
        toast.error("Not authenticated", { description: "Please log in again" });
        return false;
      }
      
      const success = await updateUserProfile(user.id, { onboarded: value });
      if (success) {
        toast.success(value ? "Onboarding completed" : "Onboarding reset");
      }
      return success;
    } catch (error) {
      console.error("Error in setOnboarded:", error);
      return false;
    }
  };

  return {
    setFirstName,
    setLastName,
    setName,
    setArchetype,
    setCoachingMode,
    setOnboarded,
    forceUpdateProfile // Exposing the direct DB update function for special cases
  };
};
