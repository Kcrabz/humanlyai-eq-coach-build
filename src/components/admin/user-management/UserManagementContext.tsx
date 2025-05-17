
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
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
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
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
    if (!initialLoadDone && !isLoading && users.length > 0) {
      setInitialLoadDone(true);
    } else if (!initialLoadDone && !isLoading) {
      // If we're not loading and there are no users, still mark as done
      setInitialLoadDone(true);
    }

    // Safety timeout - ensure we don't get stuck in loading state
    const safetyTimeout = setTimeout(() => {
      if (!initialLoadDone) {
        setInitialLoadDone(true);
      }
    }, 5000); // 5 seconds safety timeout

    return () => clearTimeout(safetyTimeout);
  }, [users, isLoading, initialLoadDone]);

  // Add a refreshUsers function to reload data with current filters
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
    fetchUsers: (onboardedValue = "all") => fetchUsers(onboardedValue),
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
