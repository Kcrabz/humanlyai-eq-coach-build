
import { useState, useEffect } from "react";
import { useUserFilters } from "./useUserFilters";
import { useUserData } from "./useUserData";

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
    activeFilter,
    resetFilters
  } = useUserFilters(initialFilter);

  // Apply filters when they change
  useEffect(() => {
    const onboardedFilter = activeFilter.type === "onboarded" ? activeFilter.value : "all";
    const chatFilter = activeFilter.type === "chat" ? activeFilter.value : "all";
    fetchUsers(onboardedFilter, chatFilter);
  }, [activeFilter, fetchUsers]);

  const filteredUsers = users.filter((user) => {
    // Apply text search if any
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = user.name?.toLowerCase().includes(searchLower) || false;
      const emailMatch = user.email?.toLowerCase().includes(searchLower) || false;
      
      if (!nameMatch && !emailMatch) {
        return false;
      }
    }
    
    // Apply tier filter if any
    if (tierFilter !== "all" && user.subscription_tier !== tierFilter) {
      return false;
    }
    
    // Apply archetype filter if any
    if (archetypeFilter !== "all" && user.eq_archetype !== archetypeFilter) {
      return false;
    }
    
    return true;
  });

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
    resetFilters,
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted
  };
};
