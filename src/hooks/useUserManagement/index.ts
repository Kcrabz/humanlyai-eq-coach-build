
import { useState, useCallback } from "react";
import { useUserFilters } from "./useUserFilters";
import { useUserData } from "./useUserData";
import { FilterState } from "./types";

export const useUserManagement = (initialFilter?: FilterState) => {
  // Initialize user data hook
  const {
    users,
    isLoading,
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium
  } = useUserData();
  
  // Initialize filters hook
  const {
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    activeFilter,
    resetFilters,
  } = useUserFilters(fetchUsers, initialFilter);

  // Apply initial filter if provided
  const init = useCallback(async () => {
    if (initialFilter) {
      if (initialFilter.type === 'onboarded') {
        await fetchUsers(initialFilter.value, 'all');
      } else if (initialFilter.type === 'chat') {
        await fetchUsers('all', initialFilter.value);
      }
    } else {
      await fetchUsers();
    }
  }, [fetchUsers, initialFilter]);
  
  // Load data on mount
  useState(() => {
    init();
  });

  return {
    // User data
    users,
    isLoading,
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium,
    
    // Filters
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    activeFilter,
    resetFilters,
  };
};
