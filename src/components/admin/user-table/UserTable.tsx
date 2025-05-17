
import { memo, useEffect } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UserTableProps } from "./types";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { LoadingRows } from "./LoadingRows";
import { useUserManagementContext } from "../user-management/UserManagementContext";

const UserTableComponent = ({ users, isLoading, onUpdateTier, onUserDeleted }: UserTableProps) => {
  const { refreshUsers } = useUserManagementContext();
  
  // Handle refresh after operations
  const handleUserDeleted = (userId: string) => {
    if (onUserDeleted) {
      onUserDeleted(userId);
    }
    // Also refresh the data to ensure consistency
    refreshUsers();
  };
  
  const handleUpdateTier = async (userId: string, tier: any) => {
    if (onUpdateTier) {
      await onUpdateTier(userId, tier);
      // Refresh user data after tier update
      await refreshUsers();
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <UserTableHeader />
        <TableBody>
          {isLoading ? (
            <LoadingRows />
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <UserTableRow 
                key={user.id}
                user={user}
                onUpdateTier={handleUpdateTier}
                onUserDeleted={handleUserDeleted}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export const UserTable = memo(UserTableComponent);
