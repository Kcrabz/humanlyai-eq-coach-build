
import { useState, useEffect } from "react";
import { useUserData } from "./useUserData";
import { useUserFilters } from "./useUserFilters";
import { FilterState } from "./types";

export const useUserManagement = (initialFilter?: { type: string; value: string }) => {
  const { users, isLoading, fetchUsers, handleUpdateTier } = useUserData();
  const {
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    filteredUsers,
    resetFilters: resetFilterState
  } = useUserFilters(users);
  
  const [onboardedFilter, setOnboardedFilter] = useState<string>("all");
  const [chatFilter, setChatFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Set initial filters based on props
  useEffect(() => {
    if (initialFilter && initialFilter.type && initialFilter.value) {
      switch (initialFilter.type) {
        case "tier":
          setTierFilter(initialFilter.value);
          setActiveFilter(`Subscription: ${initialFilter.value.charAt(0).toUpperCase() + initialFilter.value.slice(1)}`);
          break;
        case "archetype":
          setArchetypeFilter(initialFilter.value);
          setActiveFilter(`Archetype: ${initialFilter.value === "not-set" ? "Not Set" : initialFilter.value.charAt(0).toUpperCase() + initialFilter.value.slice(1)}`);
          break;
        case "onboarded":
          setOnboardedFilter(initialFilter.value);
          setActiveFilter("Onboarded Users");
          break;
        case "chat":
          setChatFilter(initialFilter.value);
          setActiveFilter("Users with Chat Activity");
          break;
        case "all":
          resetFilters();
          setActiveFilter("All Users");
          break;
      }
    }
  }, [initialFilter]);

  // Reset all filters
  const resetFilters = () => {
    resetFilterState();
    setOnboardedFilter("all");
    setChatFilter("all");
    setActiveFilter(null);
  };

  // Load users on component mount or when filters change
  useEffect(() => {
    fetchUsers(onboardedFilter, chatFilter);
  }, [onboardedFilter, chatFilter]);

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
    fetchUsers: () => fetchUsers(onboardedFilter, chatFilter),
    handleUpdateTier,
  };
};
