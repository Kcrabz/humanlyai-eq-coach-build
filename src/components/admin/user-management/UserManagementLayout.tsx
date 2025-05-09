
import { memo, useCallback } from "react";
import { ActiveFilter } from "../ActiveFilter";
import { UserFilters } from "../UserFilters";
import { UserTable } from "../user-table";
import { UserManagementActions } from "./UserManagementActions";
import { useUserManagementContext } from "./UserManagementContext";

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
    activeFilter,
    resetFilters,
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted
  } = useUserManagementContext();

  // Handle reset filter including parent component notification
  const handleResetFilters = useCallback(() => {
    resetFilters();
    if (onResetFilter) {
      onResetFilter();
    }
  }, [resetFilters, onResetFilter]);

  // Handle refresh with stable dependencies
  const handleRefresh = useCallback(() => {
    console.log("UserManagement - Manual refresh triggered");
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Active filter indicator */}
      <ActiveFilter activeFilter={activeFilter} onReset={handleResetFilters} />
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full">
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tierFilter={tierFilter}
            setTierFilter={setTierFilter}
            archetypeFilter={archetypeFilter}
            setArchetypeFilter={setArchetypeFilter}
            onRefresh={handleRefresh}
          />
        </div>
        
        <UserManagementActions />
      </div>

      {/* User table */}
      <UserTable 
        users={users}
        isLoading={!initialLoadDone || isLoading}
        onUpdateTier={handleUpdateTier}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
};

export const UserManagementLayout = memo(UserManagementLayoutComponent);
