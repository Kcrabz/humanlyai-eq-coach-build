import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { SubscriptionTier } from "@/types";
import { UserTableData } from "@/hooks/useUserManagement/types";
import { useUserManagement } from "@/hooks/useUserManagement";

interface UserManagementContextType {
  users: UserTableData[];
  isLoading: boolean;
  initialLoadDone: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tierFilter: string;
  setTierFilter: (tier: string) => void;
  archetypeFilter: string;
  setArchetypeFilter: (archetype: string) => void;
  onboardedFilter: string;
  setOnboardedFilter: (onboarded: string) => void;
  activeFilter: { type: string; value: string } | null;
  resetFilters: () => void;
  fetchUsers: (onboardedValue?: string) => void;
  refreshUsers: () => Promise<void>;
  handleUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  handleUserDeleted: (userId: string) => void;
  upgradeAllUsersToPremium: () => Promise<boolean>;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const UserManagementProvider = ({ 
  children, 
  initialFilter, 
  mountingComplete 
}: { 
  children: ReactNode;
  initialFilter?: { type: string; value: string };
  mountingComplete: boolean;
}) => {
  // Track whether initial load has completed
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  // Keep track if we already triggered the initial load
  const initialLoadTriggeredRef = useRef(false);
  // Safety timeout ID
  const safetyTimeoutRef = useRef<number | null>(null);
  
  const {
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
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium
  } = useUserManagement(initialFilter, mountingComplete);

  // Track initial load with a safety timeout
  useEffect(() => {
    // If we're done loading and have users, or we're not loading anymore, mark as done
    if ((!isLoading && users.length > 0) || (initialLoadTriggeredRef.current && !isLoading)) {
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    }

    // Safety timeout - ensure we don't get stuck in loading state
    if (!initialLoadDone && !safetyTimeoutRef.current) {
      safetyTimeoutRef.current = window.setTimeout(() => {
        setInitialLoadDone(true);
      }, 5000); // 5 seconds safety timeout
    }

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, [users, isLoading, initialLoadDone]);

  // Track if initial load has been triggered
  useEffect(() => {
    if (mountingComplete && !initialLoadTriggeredRef.current) {
      initialLoadTriggeredRef.current = true;
    }
  }, [mountingComplete]);

  // Add a refreshUsers function to reload data with current filters - memoized to prevent recreating
  const refreshUsers = useCallback(async () => {
    return fetchUsers(onboardedFilter);
  }, [fetchUsers, onboardedFilter]);

  const value = {
    users,
    isLoading,
    initialLoadDone,
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
    fetchUsers,
    refreshUsers,
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagementContext = () => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagementContext must be used within a UserManagementProvider');
  }
  return context;
};
