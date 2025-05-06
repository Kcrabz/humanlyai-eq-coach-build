
import { useState, useEffect } from "react";
import { ActiveFilter } from "./ActiveFilter";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { useUserManagement } from "@/hooks/useUserManagement";

interface UserManagementProps {
  initialFilter?: { type: string; value: string };
  onResetFilter?: () => void;
}

export const UserManagement = ({ initialFilter, onResetFilter }: UserManagementProps) => {
  const {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    activeFilter,
    resetFilters,
    fetchUsers,
    handleUpdateTier
  } = useUserManagement(initialFilter);

  // Handle reset filter including parent component notification
  const handleResetFilters = () => {
    resetFilters();
    if (onResetFilter) {
      onResetFilter();
    }
  };

  return (
    <div className="space-y-6">
      {/* Active filter indicator */}
      <ActiveFilter activeFilter={activeFilter} onReset={handleResetFilters} />
      
      {/* Filters and search */}
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tierFilter={tierFilter}
        setTierFilter={setTierFilter}
        archetypeFilter={archetypeFilter}
        setArchetypeFilter={setArchetypeFilter}
        onRefresh={fetchUsers}
      />

      {/* User table */}
      <UserTable 
        users={users}
        isLoading={isLoading}
        onUpdateTier={handleUpdateTier}
      />
    </div>
  );
};
