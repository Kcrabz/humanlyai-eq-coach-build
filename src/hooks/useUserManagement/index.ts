
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
  
  // Initialize filters hook with users data
  const {
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    filteredUsers,
    resetFilters,
  } = useUserFilters(users);

  // Track active filter for UI display
  const [activeFilter, setActiveFilter] = useState<FilterState | null>(initialFilter || null);

  // Apply initial filter if provided
  const init = useCallback(async () => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
      await fetchUsers();
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
