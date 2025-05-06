
import { supabase } from "@/integrations/supabase/client";
import { ArchetypeCounts } from "./types";

export const useArchetypeStats = () => {
  const fetchArchetypeStats = async (): Promise<ArchetypeCounts> => {
    try {
      // Get archetype distribution
      const { data: archetypeData, error: archetypeError } = await supabase
        .from('profiles')
        .select('eq_archetype');

      if (archetypeError) throw archetypeError;

      const archetypeCounts: ArchetypeCounts = {};

      archetypeData.forEach(profile => {
        const archetype = profile.eq_archetype || 'Not set';
        archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
      });

      return archetypeCounts;
    } catch (error) {
      console.error("Error fetching archetype stats:", error);
      return {};
    }
  };

  return { fetchArchetypeStats };
};
