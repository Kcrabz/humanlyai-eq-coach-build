
import { useState, useEffect } from "react";
import { useUserFilters } from "./useUserFilters";
import { useUserData } from "./useUserData";
import { FilterState } from "./types";

export const useUserManagement = (initialFilter?: { type: string; value: string }) => {
  const { 
    users, 
    isLoading, 
    fetchUsers, 
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

  // Apply filters when they change
  useEffect(() => {
    const onboardedFilter = activeFilter?.type === "onboarded" ? activeFilter.value : "all";
    const chatFilter = activeFilter?.type === "chat" ? activeFilter.value : "all";
    fetchUsers(onboardedFilter, chatFilter);
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
