
import { supabase } from "@/integrations/supabase/client";
import { TierCounts } from "./types";

export const useSubscriptionStats = () => {
  const fetchSubscriptionStats = async (): Promise<TierCounts> => {
    try {
      // Get subscription tier distribution
      const { data: tierData, error: tierError } = await supabase
        .from('profiles')
        .select('subscription_tier');

      if (tierError) throw tierError;

      const tierCounts: TierCounts = {
        free: 0,
        basic: 0,
        premium: 0
      };

      tierData.forEach(profile => {
        const tier = profile.subscription_tier as keyof TierCounts;
        if (tier && tierCounts[tier] !== undefined) {
          tierCounts[tier]++;
        } else {
          tierCounts.free++; // Default to free if not set
        }
      });

      return tierCounts;
    } catch (error) {
      console.error("Error fetching subscription stats:", error);
      return {
        free: 0,
        basic: 0,
        premium: 0
      };
    }
  };

  return { fetchSubscriptionStats };
};
