
import { useState, useEffect, useRef } from "react";
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
  const initialLoadRef = useRef(false);
  const filtersStableRef = useRef(false);
  
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
  
  // Fetch users with the core filters
  const { fetchUsers } = useFetchUsers(
    isAdmin, 
    setIsLoading, 
    setUsers, 
    userData, 
    lastLogins, 
    chatActivity, 
    fetchTokenUsageData
  );
  
  // Handle tier management
  const { 
    handleUpdateTier,
    upgradeAllUsersToPremium: upgradeAllUsersFn
  } = useTierManagement(setIsLoading, setUsers);

  // Wrapper for upgradeAllUsersToPremium to include fetchUsers dependency
  const upgradeAllUsersToPremium = () => {
    return upgradeAllUsersFn(fetchUsers, onboardedFilter);
  };
  
  // Stable version of the filters for dependency tracking
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
  
  // Handle initial data fetch - only once
  useEffect(() => {
    // Skip effect during initial render and if not an admin or still mounting
    if (!isAdmin || !mountingComplete) return;
    
    const loadInitialData = async () => {
      if (!initialLoadRef.current) {
        initialLoadRef.current = true;
        await fetchUsers(onboardedFilter, stableFilters.current);
      }
    };
    
    loadInitialData();
  }, [isAdmin, mountingComplete, fetchUsers, onboardedFilter]);
  
  // Direct effect to refresh data when filters change
  useEffect(() => {
    if (!isAdmin || !initialLoadRef.current || !mountingComplete) return;
    
    fetchUsers(onboardedFilter, { searchTerm, tierFilter, archetypeFilter });
  }, [searchTerm, tierFilter, archetypeFilter, onboardedFilter, fetchUsers, isAdmin, mountingComplete]);
  
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
    fetchUsers: (onboardedValue = "all") => fetchUsers(onboardedValue, stableFilters.current),
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium
  };
};
