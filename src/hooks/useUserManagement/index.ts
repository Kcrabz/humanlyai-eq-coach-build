
import { useCallback, useState, useRef, useMemo } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useUserData } from './useUserData';
import { useLastLogins } from './useLastLogins';
import { useChatActivity } from './useChatActivity';
import { useTokenUsage } from './useTokenUsage';
import { useTierManagement } from './useTierManagement';
import { useUserFilters } from './useUserFilters';
import { useFetchUsers } from './useFetchUsers';
import { UserTableData } from './types';
import { SubscriptionTier } from '@/types';

export const useUserManagement = (
  initialFilter?: { type: string; value: string },
  mountingComplete = true
) => {
  const { isAdmin } = useAdminCheck();
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch reference to track in-progress fetch operations
  const fetchInProgressRef = useRef<boolean>(false);
  
  // Services for user data
  const userData = useUserData();
  const lastLogins = useLastLogins();
  const chatActivity = useChatActivity();
  const { fetchTokenUsageData } = useTokenUsage();
  const { updateUserTier, upgradeAllUsersToPremium } = useTierManagement();
  
  // Filters with initial values if provided
  const {
    searchTerm,
    setSearchTerm,
    tierFilter, 
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    onboardedFilter,
    setOnboardedFilter,
    activeFilter,
    resetFilters
  } = useUserFilters(initialFilter);
  
  // Get the fetch function that makes API calls
  const { fetchUsers } = useFetchUsers(
    isAdmin, 
    setIsLoading,
    setUsers,
    userData,
    lastLogins,
    chatActivity,
    fetchTokenUsageData,
    fetchInProgressRef
  );
  
  // Handle updates to user tier with optimistic UI update
  const handleUpdateTier = useCallback(async (userId: string, tier: SubscriptionTier): Promise<void> => {
    // Optimistic UI update
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, subscription_tier: tier } : user
    ));
    
    try {
      await updateUserTier(userId, tier);
    } catch (error) {
      console.error("Error updating user tier:", error);
      // Revert optimistic update on error
      await fetchUsers(onboardedFilter);
    }
  }, [updateUserTier, fetchUsers, onboardedFilter]);
  
  // Handle user deletion by removing from UI
  const handleUserDeleted = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, []);
  
  // Handle upgrading all users to premium
  const handleUpgradeAllUsersToPremium = useCallback(async (): Promise<boolean> => {
    try {
      const result = await upgradeAllUsersToPremium();
      if (result) {
        // Refresh users list after the upgrade
        await fetchUsers(onboardedFilter);
      }
      return result;
    } catch (error) {
      console.error("Error in bulk upgrade:", error);
      return false;
    }
  }, [upgradeAllUsersToPremium, fetchUsers, onboardedFilter]);
  
  return {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    onboardedFilter,
    setOnboardedFilter,
    activeFilter,
    resetFilters,
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium: handleUpgradeAllUsersToPremium
  };
};
