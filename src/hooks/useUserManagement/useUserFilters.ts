
import { useState, useEffect } from "react";
import { UserTableData } from "./types";

export const useUserFilters = (users: UserTableData[] | undefined) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [archetypeFilter, setArchetypeFilter] = useState<string>("all");
  const [filteredUsers, setFilteredUsers] = useState<UserTableData[]>([]);
  
  // Apply filters and search
  useEffect(() => {
    if (!users) return;

    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.name && user.name.toLowerCase().includes(term))
      );
    }

    // Apply tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter(user => user.subscription_tier === tierFilter);
    }

    // Apply archetype filter
    if (archetypeFilter !== "all") {
      if (archetypeFilter === "not-set") {
        filtered = filtered.filter(user => !user.eq_archetype || user.eq_archetype === "Not set");
      } else {
        filtered = filtered.filter(user => user.eq_archetype === archetypeFilter);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, tierFilter, archetypeFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setTierFilter("all");
    setArchetypeFilter("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    filteredUsers,
    resetFilters
  };
};
