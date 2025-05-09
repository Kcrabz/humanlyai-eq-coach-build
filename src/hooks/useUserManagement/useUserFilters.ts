
import { useState, useEffect, useCallback, useMemo } from "react";
import { FilterState, UserTableData, UserFilters } from "./types";

export const useUserFilters = (initialFilter?: FilterState) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [archetypeFilter, setArchetypeFilter] = useState("all");
  const [onboardedFilter, setOnboardedFilter] = useState("all");

  // Set initial filter if provided
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.type === "tier") {
        setTierFilter(initialFilter.value);
      } else if (initialFilter.type === "archetype") {
        setArchetypeFilter(initialFilter.value);
      } else if (initialFilter.type === "onboarded") {
        setOnboardedFilter(initialFilter.value);
      }
    }
  }, [initialFilter]);

  // Determine if any filter is active
  const activeFilter = useMemo(() => {
    if (tierFilter !== "all") {
      return { type: "tier", value: tierFilter };
    }
    if (archetypeFilter !== "all") {
      return { type: "archetype", value: archetypeFilter };
    }
    if (onboardedFilter !== "all") {
      return { type: "onboarded", value: onboardedFilter };
    }
    if (searchTerm) {
      return { type: "search", value: searchTerm };
    }
    return null;
  }, [tierFilter, archetypeFilter, onboardedFilter, searchTerm]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setTierFilter("all");
    setArchetypeFilter("all");
    setOnboardedFilter("all");
  }, []);

  return {
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
  };
};
