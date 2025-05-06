
import { useState, useEffect, useRef, useCallback } from "react";
import { useUserData } from "./useUserData";
import { useUserFilters } from "./useUserFilters";
import { FilterState } from "./types";

export const useUserManagement = (initialFilter?: { type: string; value: string }) => {
  // Create a ref to track if we've done initial fetch
  const initialFetchDone = useRef<boolean>(false);
  const initialFilterRef = useRef(initialFilter);
  
  // Data fetching hook
  const { 
    users, 
    isLoading, 
    fetchUsers, 
    handleUpdateTier,
    handleUserDeleted 
  } = useUserData();
  
  // Filtering hook
  const {
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    filteredUsers,
    resetFilters
  } = useUserFilters(users);

  // Store active filter separately to avoid loops
  const [activeFilter, setActiveFilter] = useState<FilterState | null>(
    initialFilter ? { type: initialFilter.type, value: initialFilter.value } : null
  );
  
  // Handle initial fetch only once
  useEffect(() => {
    if (initialFetchDone.current) return;
    
    initialFetchDone.current = true;
    
    const onboardedFilter = activeFilter?.type === "onboarded" ? activeFilter.value : "all";
    const chatFilter = activeFilter?.type === "chat" ? activeFilter.value : "all";
    
    fetchUsers(onboardedFilter, chatFilter);
    
  }, [fetchUsers, activeFilter]);
  
  // Reset function that also notifies parent components
  const handleResetFilters = useCallback(() => {
    resetFilters();
    setActiveFilter(null);
  }, [resetFilters]);

  return {
    users: filteredUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    activeFilter,
    resetFilters: handleResetFilters,
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted
  };
};
