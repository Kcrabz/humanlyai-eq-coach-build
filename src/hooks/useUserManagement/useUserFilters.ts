
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FilterState, UserTableData, UserFilters } from "./types";

export const useUserFilters = (initialFilter?: FilterState) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [archetypeFilter, setArchetypeFilter] = useState("all");
  const [onboardedFilter, setOnboardedFilter] = useState("all");
  const initialProcessedRef = useRef(false);

  // Set initial filter if provided, with protection against reapplying
  useEffect(() => {
    if (initialFilter && !initialProcessedRef.current) {
      initialProcessedRef.current = true;
      
      if (initialFilter.type === "tier") {
        setTierFilter(initialFilter.value);
      } else if (initialFilter.type === "archetype") {
        setArchetypeFilter(initialFilter.value);
      } else if (initialFilter.type === "onboarded") {
        setOnboardedFilter(initialFilter.value);
      }
    }
  }, [initialFilter]);

  // Determine if any filter is active with useMemo for stability
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

  // Reset all filters with useCallback for stability
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
