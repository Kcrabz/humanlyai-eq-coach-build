
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
  const [shouldFetch, setShouldFetch] = useState(false);
  const { isAdmin } = useAdminCheck();
  const initialLoadRef = useRef(false);
  const filtersStableRef = useRef(false);
  const filtersChangedRef = useRef(false);
  
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
    if (filtersStableRef.current) {
      filtersChangedRef.current = true;
    }
    
    stableFilters.current = {
      searchTerm,
      tierFilter,
      archetypeFilter,
      onboardedFilter
    };
  }, [searchTerm, tierFilter, archetypeFilter, onboardedFilter]);
  
  // Handle initial data fetch
  useEffect(() => {
    // Skip effect during initial render and if not an admin or still mounting
    if (!isAdmin || !mountingComplete) return;
    
    const loadInitialData = async () => {
      if (!initialLoadRef.current) {
        console.log("Initial data fetch for users");
        initialLoadRef.current = true;
        await fetchUsers(onboardedFilter, stableFilters.current);
      }
    };
    
    loadInitialData();
  }, [isAdmin, mountingComplete, fetchUsers, onboardedFilter]);
  
  // Trigger filter changes with debouncing
  useEffect(() => {
    if (!isAdmin || !initialLoadRef.current) return;
    
    // Skip if mounting is not complete
    if (!mountingComplete) return;
    
    // Skip the first filter initialization
    if (!filtersStableRef.current) return;
    
    console.log("Filters changed, setting fetch timer");
    
    // Set a flag to fetch data
    setShouldFetch(true);
  }, [searchTerm, tierFilter, archetypeFilter, onboardedFilter, isAdmin, mountingComplete]);
  
  // Handle delayed fetch after filters change
  useEffect(() => {
    if (!shouldFetch || !filtersChangedRef.current || !mountingComplete) return;
    
    console.log("Filters debounce timer triggered, fetching users");
    
    // Reset the flag
    setShouldFetch(false);
    
    // Perform the fetch with current filters
    fetchUsers(onboardedFilter, stableFilters.current);
    
    // Reset the filters changed flag
    filtersChangedRef.current = false;
  }, [shouldFetch, fetchUsers, onboardedFilter, mountingComplete]);
  
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
