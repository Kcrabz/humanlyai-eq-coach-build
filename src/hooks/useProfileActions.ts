
import { EQArchetype, CoachingMode } from "@/types";
import { useAuthActions } from "./useAuthActions";
import { supabase } from "@/integrations/supabase/client";

export const useProfileActions = (setUser: React.Dispatch<React.SetStateAction<any>>) => {
  const { updateProfile } = useAuthActions(setUser);

  // Helper to ensure profile exists before updating
  const ensureProfileExists = async (userId: string) => {
    try {
      if (!userId) return false;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking if profile exists:", error);
        return false;
      }
      
      if (!profile) {
        console.log("Profile doesn't exist, creating it");
        const { error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: userId,
            subscription_tier: 'free',
            onboarded: false
          });
          
        if (createError) {
          console.error("Error creating profile:", createError);
          return false;
        }
        
        return true;
      }
      
      return true;
    } catch (err) {
      console.error("Error in ensureProfileExists:", err);
      return false;
    }
  };

  const setName = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await ensureProfileExists(user.id);
    updateProfile({ name });
  };

  const setArchetype = async (archetype: EQArchetype) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await ensureProfileExists(user.id);
    updateProfile({ eq_archetype: archetype });
  };

  const setCoachingMode = async (mode: CoachingMode) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await ensureProfileExists(user.id);
    updateProfile({ coaching_mode: mode });
  };

  const setOnboarded = async (value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await ensureProfileExists(user.id);
    updateProfile({ onboarded: value });
  };

  return {
    setName,
    setArchetype,
    setCoachingMode,
    setOnboarded
  };
};
