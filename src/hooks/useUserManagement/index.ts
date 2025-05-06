
import { useState, useEffect, useRef, useCallback } from "react";
import { useUserFilters } from "./useUserFilters";
import { useUserData } from "./useUserData";
import { FilterState } from "./types";

export const useUserManagement = (initialFilter?: { type: string; value: string }) => {
  const { 
    users, 
    isLoading, 
    fetchUsers: originalFetchUsers, 
    handleUpdateTier,
    handleUserDeleted 
  } = useUserData();
  
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

  const [activeFilter, setActiveFilter] = useState<FilterState | null>(
    initialFilter ? { type: initialFilter.type, value: initialFilter.value } : null
  );
  
  // Use a ref to track if we've done the initial fetch
  const initialFetchDone = useRef(false);

  // Wrap fetchUsers in useCallback to ensure its reference is stable
  const fetchUsers = useCallback((onboardedFilter: string = "all", chatFilter: string = "all") => {
    originalFetchUsers(onboardedFilter, chatFilter);
  }, [originalFetchUsers]);

  // Apply filters only when activeFilter changes or on initial mount
  useEffect(() => {
    // This effect should only run once on mount or when activeFilter changes
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      const onboardedFilter = activeFilter?.type === "onboarded" ? activeFilter.value : "all";
      const chatFilter = activeFilter?.type === "chat" ? activeFilter.value : "all";
      fetchUsers(onboardedFilter, chatFilter);
      return;
    }

    if (activeFilter) {
      const onboardedFilter = activeFilter.type === "onboarded" ? activeFilter.value : "all";
      const chatFilter = activeFilter.type === "chat" ? activeFilter.value : "all";
      fetchUsers(onboardedFilter, chatFilter);
    }
  }, [activeFilter, fetchUsers]);

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
    resetFilters: () => {
      resetFilters();
      setActiveFilter(null);
    },
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted
  };
};
