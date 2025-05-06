
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "./useAdminCheck";

interface UserStats {
  totalUsers: number;
  onboardedUsers: number;
  chatUsers: number;
  tierCounts: {
    free: number;
    basic: number;
    premium: number;
  };
  archetypeCounts: {
    [key: string]: number;
  };
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAdmin, isLoading: isAdminLoading } = useAdminCheck();

  useEffect(() => {
    const fetchStats = async () => {
      if (isAdminLoading || !isAdmin) return;

      setIsLoading(true);
      try {
        // Get total users count
        const { count: totalUsers, error: totalError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (totalError) throw totalError;

        // Get onboarded users count
        const { count: onboardedUsers, error: onboardedError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('onboarded', true);

        if (onboardedError) throw onboardedError;

        // Get chat users count (users with chat messages)
        const { count: chatUsers, error: chatError } = await supabase
          .from('chat_messages')
          .select('user_id', { count: 'exact', head: true })
          .is('user_id', 'not.null');

        if (chatError) throw chatError;

        // Get subscription tier distribution
        const { data: tierData, error: tierError } = await supabase
          .from('profiles')
          .select('subscription_tier');

        if (tierError) throw tierError;

        const tierCounts = {
          free: 0,
          basic: 0,
          premium: 0
        };

        tierData.forEach(profile => {
          const tier = profile.subscription_tier as keyof typeof tierCounts;
          if (tier && tierCounts[tier] !== undefined) {
            tierCounts[tier]++;
          } else {
            tierCounts.free++; // Default to free if not set
          }
        });

        // Get archetype distribution
        const { data: archetypeData, error: archetypeError } = await supabase
          .from('profiles')
          .select('eq_archetype');

        if (archetypeError) throw archetypeError;

        const archetypeCounts: {[key: string]: number} = {};

        archetypeData.forEach(profile => {
          const archetype = profile.eq_archetype || 'Not set';
          archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
        });

        setStats({
          totalUsers: totalUsers || 0,
          onboardedUsers: onboardedUsers || 0,
          chatUsers: chatUsers || 0,
          tierCounts,
          archetypeCounts
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, isAdminLoading]);

  return { stats, isLoading };
};
