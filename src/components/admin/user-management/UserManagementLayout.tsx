
import { memo, useCallback, useState } from "react";
import { ActiveFilter } from "../ActiveFilter";
import { UserFilters } from "../UserFilters";
import { UserTable } from "../user-table";
import { UserManagementActions } from "./UserManagementActions";
import { useUserManagementContext } from "./UserManagementContext";
import { UserManagementFilters } from "./UserManagementFilters";
import { toast } from "sonner";

interface UserManagementLayoutProps {
  onResetFilter?: () => void;
}

const UserManagementLayoutComponent = ({ onResetFilter }: UserManagementLayoutProps) => {
  const {
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
    handleUpdateTier,
    handleUserDeleted
  } = useUserManagementContext();

  // Add state for tracking manual refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle reset filter including parent component notification
  const handleResetFilters = useCallback(() => {
    resetFilters();
    if (onResetFilter) {
      onResetFilter();
    }
  }, [resetFilters, onResetFilter]);

  // Handle refresh with stable dependencies and loading state
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log("UserManagement - Manual refresh triggered");
    
    // Notify the user that refresh is happening
    toast.info("Refreshing user data...");
    
    // Call fetchUsers and handle the async operation properly
    fetchUsers()
      .then(() => {
        toast.success("User data refreshed successfully");
      })
      .catch((error) => {
        console.error("Error refreshing user data:", error);
        toast.error("Failed to refresh user data");
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [fetchUsers, isRefreshing]);

  return (
    <div className="space-y-6">
      {/* Active filter indicator */}
      <ActiveFilter activeFilter={activeFilter} onReset={handleResetFilters} />
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full">
          <UserManagementFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tierFilter={tierFilter}
            setTierFilter={setTierFilter}
            archetypeFilter={archetypeFilter}
            setArchetypeFilter={setArchetypeFilter}
            onboardedFilter={onboardedFilter}
            setOnboardedFilter={setOnboardedFilter}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
        
        <UserManagementActions />
      </div>

      {/* User table */}
      <UserTable 
        users={users}
        isLoading={!initialLoadDone || isLoading || isRefreshing}
        onUpdateTier={handleUpdateTier}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
};

export const UserManagementLayout = memo(UserManagementLayoutComponent);
