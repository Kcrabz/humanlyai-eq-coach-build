
import { useState, useEffect, useCallback, useMemo } from "react";
import { UserTableData, UserFilters } from "./types";

export const useUserFilters = (users: UserTableData[] = []) => {
  const [filters, setFilters] = useState<UserFilters>({
    searchTerm: "",
    tierFilter: "all",
    archetypeFilter: "all"
  });
  
  const [filteredUsers, setFilteredUsers] = useState<UserTableData[]>([]);
  
  // Memoize the filtered users to prevent unnecessary recalculations
  const applyFilters = useCallback((users: UserTableData[], filters: UserFilters) => {
    if (!users || !Array.isArray(users) || users.length === 0) {
      return [];
    }

    let result = [...users];

    // Apply search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.name && user.name.toLowerCase().includes(term))
      );
    }

    // Apply tier filter
    if (filters.tierFilter !== "all") {
      result = result.filter(user => user.subscription_tier === filters.tierFilter);
    }

    // Apply archetype filter
    if (filters.archetypeFilter !== "all") {
      if (filters.archetypeFilter === "not-set") {
        result = result.filter(user => !user.eq_archetype);
      } else {
        result = result.filter(user => user.eq_archetype === filters.archetypeFilter);
      }
    }

    return result;
  }, []);

  // Update filtered users when users or filters change
  useEffect(() => {
    const result = applyFilters(users, filters);
    setFilteredUsers(result);
  }, [users, filters, applyFilters]);

  // Update individual filters
  const setSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setTierFilter = useCallback((tier: string) => {
    setFilters(prev => ({ ...prev, tierFilter: tier }));
  }, []);

  const setArchetypeFilter = useCallback((archetype: string) => {
    setFilters(prev => ({ ...prev, archetypeFilter: archetype }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      tierFilter: "all",
      archetypeFilter: "all"
    });
  }, []);

  return {
    searchTerm: filters.searchTerm,
    setSearchTerm,
    tierFilter: filters.tierFilter,
    setTierFilter,
    archetypeFilter: filters.archetypeFilter,
    setArchetypeFilter,
    filteredUsers,
    resetFilters
  };
};
