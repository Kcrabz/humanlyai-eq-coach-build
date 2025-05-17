
import { useState, useEffect, useRef, useCallback } from "react";
import { useUserData } from "./useUserData";
import { useLastLogins } from "./useLastLogins";
import { useChatActivity } from "./useChatActivity";
import { useChatUserIds } from "./useChatUserIds";
import { useUserFilters } from "./useUserFilters";
import { FilterState, UserTableData } from "./types";
import { useAdminCheck } from "../useAdminCheck";
import { useTokenUsage } from "./useTokenUsage";
import { useTierManagement } from "./useTierManagement";
import { useUserDeletion } from "./useUserDeletion";
import { useFetchUsers } from "./useFetchUsers";

export const useUserManagement = (initialFilter?: FilterState, mountingComplete = false) => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAdminCheck();
  
  // Track loading and initialization states with refs
  const initialLoadRef = useRef(false);
  const filtersStableRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  const autoRefreshDisabledRef = useRef(true); // Disable auto refresh by default
  
  // Use the hooks with correct function names
  const userData = useUserData();
  const lastLogins = useLastLogins();
  const chatActivity = useChatActivity();
  const chatUserIds = useChatUserIds();
  const { tokenUsageData, fetchTokenUsageData } = useTokenUsage();
  
  const { 
    searchTerm, setSearchTerm, 
    tierFilter, setTierFilter, 
    archetypeFilter, setArchetypeFilter,
    onboardedFilter, setOnboardedFilter,
    activeFilter, resetFilters
  } = useUserFilters(initialFilter);

  // Handle user deletions
  const { handleUserDeleted } = useUserDeletion(setIsLoading, setUsers);
  
  // Fetch users with the core filters - pass fetchInProgressRef to prevent overlapping requests
  const { fetchUsers } = useFetchUsers(
    isAdmin, 
    setIsLoading, 
    setUsers, 
    userData, 
    lastLogins, 
    chatActivity, 
    fetchTokenUsageData,
    fetchInProgressRef
  );
  
  // Handle tier management
  const { 
    handleUpdateTier,
    upgradeAllUsersToPremium: upgradeAllUsersFn
  } = useTierManagement(setIsLoading, setUsers);

  // Stable reference for filters to avoid unnecessary re-renders
  const stableFilters = useRef({
    searchTerm,
    tierFilter,
    archetypeFilter,
    onboardedFilter
  });
  
  // Update stable filters reference when filters change
  useEffect(() => {
    stableFilters.current = {
      searchTerm,
      tierFilter,
      archetypeFilter,
      onboardedFilter
    };
    
    // Mark filters as stable after first render
    if (!filtersStableRef.current) {
      filtersStableRef.current = true;
    }
  }, [searchTerm, tierFilter, archetypeFilter, onboardedFilter]);
  
  // Handle initial data fetch - only once when mounting is complete
  useEffect(() => {
    // Skip effect during initial render, if not an admin, or if still mounting
    if (!isAdmin || !mountingComplete) return;
    
    const loadInitialData = async () => {
      if (!initialLoadRef.current && !fetchInProgressRef.current) {
        console.log("Loading initial user data");
        initialLoadRef.current = true;
        await fetchUsers(onboardedFilter, stableFilters.current);
      }
    };
    
    // Use a short timeout to ensure we don't start fetching during render
    const initTimer = setTimeout(() => {
      loadInitialData();
    }, 50);
    
    return () => clearTimeout(initTimer);
  }, [isAdmin, mountingComplete, fetchUsers, onboardedFilter]);
  
  // MODIFIED: Remove automatic debounced filter refresh effect
  // This prevents the table from automatically refreshing when filters change
  // Users will need to click the refresh button instead
  
  // Clean up function for when component unmounts
  useEffect(() => {
    return () => {
      // Clear any timers or in-progress operations
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Wrapper for upgradeAllUsersToPremium to include fetchUsers dependency
  const upgradeAllUsersToPremium = useCallback(() => {
    return upgradeAllUsersFn(fetchUsers, onboardedFilter);
  }, [upgradeAllUsersFn, fetchUsers, onboardedFilter]);
  
  // Stable fetchUsers wrapper function - manually triggered by refresh button
  const stableFetchUsers = useCallback((onboardedValue = "all") => {
    if (!fetchInProgressRef.current) {
      console.log("Manual fetchUsers called");
      return fetchUsers(onboardedValue, stableFilters.current);
    }
    return Promise.resolve();
  }, [fetchUsers]);
  
  return {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    onboardedFilter,
    setOnboardedFilter,
    activeFilter,
    resetFilters,
    fetchUsers: stableFetchUsers,
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium
  };
};
