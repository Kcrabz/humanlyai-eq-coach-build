
import { useState, useEffect } from "react";
import { useAdminCheck } from "../useAdminCheck";
import { UserStats } from "./types";
import { useBasicStats } from "./useBasicStats";
import { useSubscriptionStats } from "./useSubscriptionStats";
import { useArchetypeStats } from "./useArchetypeStats";

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAdmin, isLoading: isAdminLoading } = useAdminCheck();
  const { fetchBasicStats } = useBasicStats();
  const { fetchSubscriptionStats } = useSubscriptionStats();
  const { fetchArchetypeStats } = useArchetypeStats();

  useEffect(() => {
    const fetchAllStats = async () => {
      if (isAdminLoading || !isAdmin) return;

      setIsLoading(true);
      try {
        // Fetch all stats in parallel
        const [basicStats, tierCounts, archetypeCounts] = await Promise.all([
          fetchBasicStats(),
          fetchSubscriptionStats(),
          fetchArchetypeStats()
        ]);

        setStats({
          ...basicStats,
          tierCounts,
          archetypeCounts
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllStats();
  }, [isAdmin, isAdminLoading]);

  return { stats, isLoading };
};

// Re-export for backward compatibility
export * from './types';
